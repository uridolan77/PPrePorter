import { SurfaceDataPoint } from '../components/reports/visualizations/Surface3DPlot';
import { interpolateSurface, SurfaceInterpolationMethod } from '../utils/interpolationUtils';
import { createPredictiveModel, PredictionModelType, generatePredictions } from '../utils/predictiveSurfaceUtils';

// WebSocket connection states
export type WebSocketConnectionState = 'connecting' | 'open' | 'closed' | 'error';

// Streaming options
export interface StreamingSurfaceOptions {
  url: string;
  updateInterval?: number; // Milliseconds between updates
  batchSize?: number; // Number of updates to batch
  throttleUpdates?: boolean; // Whether to throttle updates
  throttleInterval?: number; // Milliseconds to throttle updates
  maxDataPoints?: number; // Maximum number of data points to display
  interpolationMethod?: SurfaceInterpolationMethod; // Interpolation method
  resolution?: number; // Surface resolution
  enablePrediction?: boolean; // Whether to enable prediction
  predictionModel?: PredictionModelType; // Prediction model type
  predictionHorizon?: number; // Number of time steps to predict
  autoReconnect?: boolean; // Whether to automatically reconnect
  reconnectInterval?: number; // Milliseconds between reconnect attempts
  onConnectionStateChange?: (state: WebSocketConnectionState) => void;
  onError?: (error: Error) => void;
}

// Update message types
export type SurfaceUpdateType = 'add_point' | 'update_point' | 'remove_point' | 'batch_update' | 'reset' | 'error';

// Update message
export interface SurfaceUpdateMessage {
  type: SurfaceUpdateType;
  data: any;
  timestamp: number;
}

// Batch update
export interface SurfaceBatchUpdate {
  addPoints?: SurfaceDataPoint[];
  updatePoints?: Array<{ x: number; y: number; updates: Partial<SurfaceDataPoint> }>;
  removePoints?: Array<{ x: number; y: number }>;
  timestamp: number;
}

// Surface data with interpolation and prediction
export interface EnhancedSurfaceData {
  originalPoints: SurfaceDataPoint[];
  interpolatedSurface: {
    vertices: Array<{ x: number; y: number; z: number }>;
    indices: number[];
  };
  predictedPoints?: SurfaceDataPoint[];
  xRange: [number, number];
  yRange: [number, number];
  zRange: [number, number];
  timestamp: number;
}

/**
 * Streaming Surface Service
 * Manages WebSocket connection and real-time updates for 3D surface plots
 */
export class StreamingSurfaceService {
  private socket: WebSocket | null = null;
  private options: StreamingSurfaceOptions;
  private connectionState: WebSocketConnectionState = 'closed';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private updateBuffer: SurfaceUpdateMessage[] = [];
  private throttleTimer: NodeJS.Timeout | null = null;
  private lastUpdateTime: number = 0;
  private dataPoints: SurfaceDataPoint[] = [];
  private pointMap: Map<string, SurfaceDataPoint> = new Map();
  private updateCallbacks: Array<(data: EnhancedSurfaceData) => void> = [];
  private predictionModel: ((x: number, y: number) => number) | null = null;
  
  /**
   * Constructor
   * @param options Streaming options
   */
  constructor(options: StreamingSurfaceOptions) {
    this.options = {
      updateInterval: 1000,
      batchSize: 20,
      throttleUpdates: true,
      throttleInterval: 200,
      maxDataPoints: 1000,
      interpolationMethod: 'bilinear',
      resolution: 50,
      enablePrediction: false,
      predictionModel: 'rbf',
      predictionHorizon: 5,
      autoReconnect: true,
      reconnectInterval: 5000,
      ...options
    };
  }
  
  /**
   * Connect to the WebSocket server
   * @returns Promise that resolves when connected
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        resolve();
        return;
      }
      
      this.setConnectionState('connecting');
      
      try {
        this.socket = new WebSocket(this.options.url);
        
        this.socket.onopen = () => {
          this.setConnectionState('open');
          resolve();
        };
        
        this.socket.onclose = () => {
          this.setConnectionState('closed');
          this.handleReconnect();
        };
        
        this.socket.onerror = (error) => {
          this.setConnectionState('error');
          if (this.options.onError) {
            this.options.onError(new Error('WebSocket error'));
          }
          reject(error);
          this.handleReconnect();
        };
        
        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        this.setConnectionState('error');
        if (this.options.onError) {
          this.options.onError(error as Error);
        }
        reject(error);
        this.handleReconnect();
      }
    });
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.setConnectionState('closed');
  }
  
  /**
   * Get the current surface data
   * @returns Enhanced surface data with interpolation and prediction
   */
  public getSurfaceData(): EnhancedSurfaceData {
    return this.getEnhancedSurfaceData();
  }
  
  /**
   * Subscribe to surface updates
   * @param callback Callback function to receive updates
   * @returns Unsubscribe function
   */
  public subscribe(callback: (data: EnhancedSurfaceData) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Immediately send current data to the new subscriber
    callback(this.getEnhancedSurfaceData());
    
    // Return unsubscribe function
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Send a message to the server
   * @param message Message to send
   * @returns Promise that resolves when the message is sent
   */
  public sendMessage(message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }
      
      try {
        this.socket.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Reset the surface data
   * @param initialData Optional initial data
   */
  public resetSurface(initialData?: SurfaceDataPoint[]): void {
    this.dataPoints = initialData || [];
    this.pointMap.clear();
    
    // Initialize map with initial data
    if (initialData) {
      initialData.forEach(point => {
        const pointId = this.getPointId(point.x, point.y);
        this.pointMap.set(pointId, point);
      });
    }
    
    // Reset prediction model
    this.predictionModel = null;
    
    // Notify subscribers
    this.notifySubscribers();
  }
  
  /**
   * Get enhanced surface data with interpolation and prediction
   * @returns Enhanced surface data
   */
  private getEnhancedSurfaceData(): EnhancedSurfaceData {
    // Calculate ranges
    const xValues = this.dataPoints.map(p => p.x);
    const yValues = this.dataPoints.map(p => p.y);
    const zValues = this.dataPoints.map(p => p.z);
    
    const xRange: [number, number] = [
      Math.min(...xValues),
      Math.max(...xValues)
    ];
    
    const yRange: [number, number] = [
      Math.min(...yValues),
      Math.max(...yValues)
    ];
    
    const zRange: [number, number] = [
      Math.min(...zValues),
      Math.max(...zValues)
    ];
    
    // Interpolate surface
    const interpolatedSurface = interpolateSurface(
      this.dataPoints,
      this.options.resolution || 50,
      this.options.interpolationMethod || 'bilinear',
      xRange,
      yRange
    );
    
    // Generate predictions if enabled
    let predictedPoints: SurfaceDataPoint[] | undefined;
    
    if (this.options.enablePrediction && this.dataPoints.length > 10) {
      // Create prediction model if not already created
      if (!this.predictionModel) {
        this.predictionModel = createPredictiveModel(this.dataPoints, {
          modelType: this.options.predictionModel || 'rbf',
          kernelWidth: 1.0,
          regularization: 0.1
        });
      }
      
      // Generate predictions
      predictedPoints = generatePredictions(
        this.predictionModel,
        xRange,
        yRange,
        Math.min(20, this.options.resolution || 50)
      );
    }
    
    return {
      originalPoints: [...this.dataPoints],
      interpolatedSurface,
      predictedPoints,
      xRange,
      yRange,
      zRange,
      timestamp: Date.now()
    };
  }
  
  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.options.autoReconnect && !this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect().catch(() => {
          // Reconnect attempt failed, will try again
        });
      }, this.options.reconnectInterval);
    }
  }
  
  /**
   * Set connection state and notify callback
   * @param state New connection state
   */
  private setConnectionState(state: WebSocketConnectionState): void {
    this.connectionState = state;
    
    if (this.options.onConnectionStateChange) {
      this.options.onConnectionStateChange(state);
    }
  }
  
  /**
   * Handle incoming message
   * @param data Message data
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data) as SurfaceUpdateMessage;
      
      // Add to buffer if throttling is enabled
      if (this.options.throttleUpdates) {
        this.updateBuffer.push(message);
        
        // Process buffer if it reaches batch size
        if (this.updateBuffer.length >= (this.options.batchSize || 20)) {
          this.processUpdateBuffer();
        } else if (!this.throttleTimer) {
          // Start throttle timer if not already running
          this.throttleTimer = setTimeout(() => {
            this.throttleTimer = null;
            this.processUpdateBuffer();
          }, this.options.throttleInterval);
        }
      } else {
        // Process message immediately
        this.processMessage(message);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      
      if (this.options.onError) {
        this.options.onError(new Error('Error parsing message'));
      }
    }
  }
  
  /**
   * Process update buffer
   */
  private processUpdateBuffer(): void {
    if (this.updateBuffer.length === 0) return;
    
    // Check if enough time has passed since last update
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;
    
    if (timeSinceLastUpdate < (this.options.updateInterval || 1000)) {
      // Not enough time has passed, reschedule
      if (!this.throttleTimer) {
        this.throttleTimer = setTimeout(() => {
          this.throttleTimer = null;
          this.processUpdateBuffer();
        }, this.options.updateInterval! - timeSinceLastUpdate);
      }
      return;
    }
    
    // Process all messages in buffer
    const batchUpdate: SurfaceBatchUpdate = {
      addPoints: [],
      updatePoints: [],
      removePoints: [],
      timestamp: now
    };
    
    this.updateBuffer.forEach(message => {
      switch (message.type) {
        case 'add_point':
          batchUpdate.addPoints!.push(message.data);
          break;
        case 'update_point':
          batchUpdate.updatePoints!.push(message.data);
          break;
        case 'remove_point':
          batchUpdate.removePoints!.push(message.data);
          break;
        case 'batch_update':
          // Merge batch updates
          const batch = message.data as SurfaceBatchUpdate;
          if (batch.addPoints) batchUpdate.addPoints!.push(...batch.addPoints);
          if (batch.updatePoints) batchUpdate.updatePoints!.push(...batch.updatePoints);
          if (batch.removePoints) batchUpdate.removePoints!.push(...batch.removePoints);
          break;
        case 'reset':
          this.resetSurface(message.data);
          break;
      }
    });
    
    // Apply batch update
    this.applyBatchUpdate(batchUpdate);
    
    // Clear buffer
    this.updateBuffer = [];
    this.lastUpdateTime = now;
  }
  
  /**
   * Process a single message
   * @param message Update message
   */
  private processMessage(message: SurfaceUpdateMessage): void {
    switch (message.type) {
      case 'add_point':
        this.addPoint(message.data);
        break;
      case 'update_point':
        this.updatePoint(message.data.x, message.data.y, message.data.updates);
        break;
      case 'remove_point':
        this.removePoint(message.data.x, message.data.y);
        break;
      case 'batch_update':
        this.applyBatchUpdate(message.data);
        break;
      case 'reset':
        this.resetSurface(message.data);
        break;
    }
  }
  
  /**
   * Apply a batch update
   * @param update Batch update
   */
  private applyBatchUpdate(update: SurfaceBatchUpdate): void {
    let hasChanges = false;
    
    // Add points
    if (update.addPoints && update.addPoints.length > 0) {
      update.addPoints.forEach(point => {
        if (this.addPoint(point, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Update points
    if (update.updatePoints && update.updatePoints.length > 0) {
      update.updatePoints.forEach(pointUpdate => {
        if (this.updatePoint(pointUpdate.x, pointUpdate.y, pointUpdate.updates, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Remove points
    if (update.removePoints && update.removePoints.length > 0) {
      update.removePoints.forEach(point => {
        if (this.removePoint(point.x, point.y, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Enforce max data points limit
    this.enforceDataPointLimit();
    
    // Reset prediction model if there were changes
    if (hasChanges) {
      this.predictionModel = null;
    }
    
    // Notify subscribers if there were changes
    if (hasChanges) {
      this.notifySubscribers();
    }
  }
  
  /**
   * Add a data point to the surface
   * @param point Data point to add
   * @param notify Whether to notify subscribers
   * @returns Whether the point was added
   */
  private addPoint(point: SurfaceDataPoint, notify: boolean = true): boolean {
    // Check if point already exists
    const pointId = this.getPointId(point.x, point.y);
    if (this.pointMap.has(pointId)) {
      return false;
    }
    
    // Add point
    this.pointMap.set(pointId, point);
    this.dataPoints.push(point);
    
    // Enforce data point limit
    this.enforceDataPointLimit();
    
    // Reset prediction model
    this.predictionModel = null;
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Update a data point in the surface
   * @param x X coordinate
   * @param y Y coordinate
   * @param updates Point updates
   * @param notify Whether to notify subscribers
   * @returns Whether the point was updated
   */
  private updatePoint(x: number, y: number, updates: Partial<SurfaceDataPoint>, notify: boolean = true): boolean {
    // Check if point exists
    const pointId = this.getPointId(x, y);
    const point = this.pointMap.get(pointId);
    if (!point) {
      return false;
    }
    
    // Update point
    Object.assign(point, updates);
    
    // Reset prediction model
    this.predictionModel = null;
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Remove a data point from the surface
   * @param x X coordinate
   * @param y Y coordinate
   * @param notify Whether to notify subscribers
   * @returns Whether the point was removed
   */
  private removePoint(x: number, y: number, notify: boolean = true): boolean {
    // Check if point exists
    const pointId = this.getPointId(x, y);
    if (!this.pointMap.has(pointId)) {
      return false;
    }
    
    // Remove point
    this.pointMap.delete(pointId);
    this.dataPoints = this.dataPoints.filter(p => !(p.x === x && p.y === y));
    
    // Reset prediction model
    this.predictionModel = null;
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Enforce data point limit
   */
  private enforceDataPointLimit(): void {
    if (!this.options.maxDataPoints || this.dataPoints.length <= this.options.maxDataPoints) {
      return;
    }
    
    // Remove oldest points (assuming they're added in order)
    const pointsToRemove = this.dataPoints.slice(0, this.dataPoints.length - this.options.maxDataPoints);
    
    pointsToRemove.forEach(point => {
      const pointId = this.getPointId(point.x, point.y);
      this.pointMap.delete(pointId);
    });
    
    this.dataPoints = this.dataPoints.slice(this.dataPoints.length - this.options.maxDataPoints);
  }
  
  /**
   * Get point ID
   * @param x X coordinate
   * @param y Y coordinate
   * @returns Point ID
   */
  private getPointId(x: number, y: number): string {
    return `${x},${y}`;
  }
  
  /**
   * Notify subscribers of surface data changes
   */
  private notifySubscribers(): void {
    // Get enhanced surface data
    const data = this.getEnhancedSurfaceData();
    
    // Notify subscribers
    this.updateCallbacks.forEach(callback => {
      callback(data);
    });
  }
}
