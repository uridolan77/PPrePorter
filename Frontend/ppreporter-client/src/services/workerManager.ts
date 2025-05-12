// Worker manager
// This service manages WebWorkers for computationally intensive tasks

import { v4 as uuidv4 } from 'uuid';
import { GraphData } from '../components/reports/visualizations/NetworkGraph';
import { SankeyData } from '../components/reports/visualizations/SankeyDiagram';
import { SurfaceDataPoint } from '../components/reports/visualizations/Surface3DPlot';
import { CommunityDetectionOptions, CommunityStructure } from '../utils/communityDetectionUtils';
import { AnomalyDetectionOptions, AnomalyResult } from '../utils/anomalyDetectionUtils';
import { PredictionModelOptions } from '../utils/predictiveSurfaceUtils';

// Worker types
export type WorkerType = 'community_detection' | 'anomaly_detection' | 'predictive_surface';

// Worker status
export type WorkerStatus = 'idle' | 'busy' | 'error';

// Worker info
interface WorkerInfo {
  worker: Worker;
  type: WorkerType;
  status: WorkerStatus;
  currentRequestId?: string;
}

// Request callbacks
interface RequestCallbacks {
  onSuccess: (result: any) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
}

// Worker manager class
export class WorkerManager {
  private static instance: WorkerManager;
  private workers: Map<string, WorkerInfo> = new Map();
  private pendingRequests: Map<string, RequestCallbacks> = new Map();
  private maxWorkers: number;
  
  /**
   * Constructor
   * @param maxWorkers Maximum number of workers per type
   */
  private constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers;
  }
  
  /**
   * Get singleton instance
   * @param maxWorkers Maximum number of workers per type
   * @returns WorkerManager instance
   */
  public static getInstance(maxWorkers?: number): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager(maxWorkers);
    }
    return WorkerManager.instance;
  }
  
  /**
   * Initialize workers
   * @param types Worker types to initialize
   * @param count Number of workers to create per type
   */
  public initializeWorkers(types: WorkerType[], count: number = 2): void {
    types.forEach(type => {
      for (let i = 0; i < count; i++) {
        this.createWorker(type);
      }
    });
  }
  
  /**
   * Create a new worker
   * @param type Worker type
   * @returns Worker ID
   */
  private createWorker(type: WorkerType): string {
    const workerId = `${type}-${uuidv4()}`;
    let worker: Worker;
    
    // Create worker based on type
    switch (type) {
      case 'community_detection':
        worker = new Worker(new URL('../workers/communityDetectionWorker.ts', import.meta.url), { type: 'module' });
        break;
      case 'anomaly_detection':
        worker = new Worker(new URL('../workers/anomalyDetectionWorker.ts', import.meta.url), { type: 'module' });
        break;
      case 'predictive_surface':
        worker = new Worker(new URL('../workers/predictiveSurfaceWorker.ts', import.meta.url), { type: 'module' });
        break;
      default:
        throw new Error(`Unknown worker type: ${type}`);
    }
    
    // Set up message handler
    worker.onmessage = (event) => {
      this.handleWorkerMessage(workerId, event);
    };
    
    // Set up error handler
    worker.onerror = (error) => {
      this.handleWorkerError(workerId, error);
    };
    
    // Store worker info
    this.workers.set(workerId, {
      worker,
      type,
      status: 'idle'
    });
    
    return workerId;
  }
  
  /**
   * Handle worker message
   * @param workerId Worker ID
   * @param event Message event
   */
  private handleWorkerMessage(workerId: string, event: MessageEvent): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;
    
    const { type, requestId, progress, error } = event.data;
    const callbacks = this.pendingRequests.get(requestId);
    
    if (!callbacks) return;
    
    switch (type) {
      case 'progress_update':
        if (callbacks.onProgress) {
          callbacks.onProgress(progress);
        }
        break;
        
      case 'communities_detected':
      case 'anomalies_detected':
      case 'model_created':
      case 'predictions_generated':
      case 'model_evaluated':
      case 'confidence_intervals_generated':
      case 'forecast_generated':
        // Success
        callbacks.onSuccess(event.data);
        this.pendingRequests.delete(requestId);
        
        // Mark worker as idle
        workerInfo.status = 'idle';
        workerInfo.currentRequestId = undefined;
        
        // Process next request if any
        this.processNextRequest(workerInfo.type);
        break;
        
      case 'error':
        // Error
        if (callbacks.onError) {
          callbacks.onError(error);
        }
        this.pendingRequests.delete(requestId);
        
        // Mark worker as idle
        workerInfo.status = 'idle';
        workerInfo.currentRequestId = undefined;
        
        // Process next request if any
        this.processNextRequest(workerInfo.type);
        break;
    }
  }
  
  /**
   * Handle worker error
   * @param workerId Worker ID
   * @param error Error event
   */
  private handleWorkerError(workerId: string, error: ErrorEvent): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) return;
    
    // Mark worker as error
    workerInfo.status = 'error';
    
    // Notify pending request if any
    if (workerInfo.currentRequestId) {
      const callbacks = this.pendingRequests.get(workerInfo.currentRequestId);
      if (callbacks && callbacks.onError) {
        callbacks.onError(`Worker error: ${error.message}`);
      }
      this.pendingRequests.delete(workerInfo.currentRequestId);
    }
    
    // Terminate and recreate worker
    workerInfo.worker.terminate();
    this.workers.delete(workerId);
    this.createWorker(workerInfo.type);
    
    // Process next request if any
    this.processNextRequest(workerInfo.type);
  }
  
  /**
   * Process next request for a worker type
   * @param type Worker type
   */
  private processNextRequest(type: WorkerType): void {
    // Find an idle worker
    const idleWorker = Array.from(this.workers.entries())
      .find(([_, info]) => info.type === type && info.status === 'idle');
    
    if (!idleWorker) return;
    
    // Find a pending request
    const pendingRequest = Array.from(this.pendingRequests.entries())
      .find(([_, callbacks]) => callbacks.type === type && !callbacks.processing);
    
    if (!pendingRequest) return;
    
    // Process request
    const [requestId, callbacks] = pendingRequest;
    const [workerId, workerInfo] = idleWorker;
    
    // Mark worker as busy
    workerInfo.status = 'busy';
    workerInfo.currentRequestId = requestId;
    
    // Mark request as processing
    callbacks.processing = true;
    
    // Send message to worker
    workerInfo.worker.postMessage({
      ...callbacks.message,
      requestId
    });
  }
  
  /**
   * Detect communities using a worker
   * @param graphData Graph data
   * @param options Community detection options
   * @param onSuccess Success callback
   * @param onProgress Progress callback
   * @param onError Error callback
   * @returns Request ID
   */
  public detectCommunities(
    graphData: GraphData,
    options: CommunityDetectionOptions,
    onSuccess: (result: { graphData: GraphData; communityStructure: CommunityStructure }) => void,
    onProgress?: (progress: number) => void,
    onError?: (error: string) => void
  ): string {
    const requestId = uuidv4();
    
    // Store callbacks
    this.pendingRequests.set(requestId, {
      type: 'community_detection',
      message: {
        type: 'detect_communities',
        graphData,
        options
      },
      onSuccess,
      onProgress,
      onError,
      processing: false
    });
    
    // Ensure we have at least one worker
    let hasWorker = false;
    for (const [_, info] of this.workers.entries()) {
      if (info.type === 'community_detection') {
        hasWorker = true;
        break;
      }
    }
    
    if (!hasWorker) {
      this.createWorker('community_detection');
    }
    
    // Process request
    this.processNextRequest('community_detection');
    
    return requestId;
  }
  
  /**
   * Detect anomalies using a worker
   * @param data Sankey diagram data
   * @param options Anomaly detection options
   * @param onSuccess Success callback
   * @param onProgress Progress callback
   * @param onError Error callback
   * @returns Request ID
   */
  public detectAnomalies(
    data: SankeyData,
    options: AnomalyDetectionOptions,
    onSuccess: (result: AnomalyResult) => void,
    onProgress?: (progress: number) => void,
    onError?: (error: string) => void
  ): string {
    const requestId = uuidv4();
    
    // Store callbacks
    this.pendingRequests.set(requestId, {
      type: 'anomaly_detection',
      message: {
        type: 'detect_anomalies',
        data,
        options
      },
      onSuccess,
      onProgress,
      onError,
      processing: false
    });
    
    // Ensure we have at least one worker
    let hasWorker = false;
    for (const [_, info] of this.workers.entries()) {
      if (info.type === 'anomaly_detection') {
        hasWorker = true;
        break;
      }
    }
    
    if (!hasWorker) {
      this.createWorker('anomaly_detection');
    }
    
    // Process request
    this.processNextRequest('anomaly_detection');
    
    return requestId;
  }
  
  /**
   * Create predictive model using a worker
   * @param data Training data points
   * @param options Model options
   * @param onSuccess Success callback
   * @param onProgress Progress callback
   * @param onError Error callback
   * @returns Request ID
   */
  public createPredictiveModel(
    data: SurfaceDataPoint[],
    options: PredictionModelOptions,
    onSuccess: () => void,
    onProgress?: (progress: number) => void,
    onError?: (error: string) => void
  ): string {
    const requestId = uuidv4();
    
    // Store callbacks
    this.pendingRequests.set(requestId, {
      type: 'predictive_surface',
      message: {
        type: 'create_model',
        data,
        options
      },
      onSuccess,
      onProgress,
      onError,
      processing: false
    });
    
    // Ensure we have at least one worker
    let hasWorker = false;
    for (const [_, info] of this.workers.entries()) {
      if (info.type === 'predictive_surface') {
        hasWorker = true;
        break;
      }
    }
    
    if (!hasWorker) {
      this.createWorker('predictive_surface');
    }
    
    // Process request
    this.processNextRequest('predictive_surface');
    
    return requestId;
  }
  
  /**
   * Generate predictions using a worker
   * @param data Training data points
   * @param options Model options
   * @param xRange X-axis range
   * @param yRange Y-axis range
   * @param resolution Grid resolution
   * @param onSuccess Success callback
   * @param onProgress Progress callback
   * @param onError Error callback
   * @returns Request ID
   */
  public generatePredictions(
    data: SurfaceDataPoint[],
    options: PredictionModelOptions,
    xRange: [number, number],
    yRange: [number, number],
    resolution: number,
    onSuccess: (predictions: SurfaceDataPoint[]) => void,
    onProgress?: (progress: number) => void,
    onError?: (error: string) => void
  ): string {
    const requestId = uuidv4();
    
    // Store callbacks
    this.pendingRequests.set(requestId, {
      type: 'predictive_surface',
      message: {
        type: 'generate_predictions',
        data,
        options,
        xRange,
        yRange,
        resolution
      },
      onSuccess: (result) => onSuccess(result.predictions),
      onProgress,
      onError,
      processing: false
    });
    
    // Ensure we have at least one worker
    let hasWorker = false;
    for (const [_, info] of this.workers.entries()) {
      if (info.type === 'predictive_surface') {
        hasWorker = true;
        break;
      }
    }
    
    if (!hasWorker) {
      this.createWorker('predictive_surface');
    }
    
    // Process request
    this.processNextRequest('predictive_surface');
    
    return requestId;
  }
  
  /**
   * Cancel a request
   * @param requestId Request ID
   */
  public cancelRequest(requestId: string): void {
    // Find worker processing this request
    for (const [_, info] of this.workers.entries()) {
      if (info.currentRequestId === requestId) {
        // Mark worker as idle
        info.status = 'idle';
        info.currentRequestId = undefined;
        break;
      }
    }
    
    // Remove pending request
    this.pendingRequests.delete(requestId);
  }
  
  /**
   * Terminate all workers
   */
  public terminateAll(): void {
    for (const [_, info] of this.workers.entries()) {
      info.worker.terminate();
    }
    
    this.workers.clear();
    this.pendingRequests.clear();
  }
}

// Export singleton instance
export default WorkerManager.getInstance();
