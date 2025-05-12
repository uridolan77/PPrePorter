import { SankeyData } from '../components/reports/visualizations/SankeyDiagram';
import { AggregatedSankeyData } from './sankeyDiagramService';

// WebSocket connection states
export type WebSocketConnectionState = 'connecting' | 'open' | 'closed' | 'error';

// Streaming options
export interface StreamingSankeyOptions {
  url: string;
  updateInterval?: number; // Milliseconds between updates
  batchSize?: number; // Number of updates to batch
  throttleUpdates?: boolean; // Whether to throttle updates
  throttleInterval?: number; // Milliseconds to throttle updates
  maxNodes?: number; // Maximum number of nodes to display
  maxLinks?: number; // Maximum number of links to display
  aggregateUpdates?: boolean; // Whether to aggregate updates
  aggregationLevel?: 'none' | 'low' | 'medium' | 'high'; // Aggregation level
  autoReconnect?: boolean; // Whether to automatically reconnect
  reconnectInterval?: number; // Milliseconds between reconnect attempts
  onConnectionStateChange?: (state: WebSocketConnectionState) => void;
  onError?: (error: Error) => void;
}

// Update message types
export type SankeyUpdateType = 'add_node' | 'update_node' | 'remove_node' | 'add_link' | 'update_link' | 'remove_link' | 'batch_update' | 'reset' | 'error';

// Update message
export interface SankeyUpdateMessage {
  type: SankeyUpdateType;
  data: any;
  timestamp: number;
}

// Sankey node
export interface SankeyNode {
  name: string;
  category?: string;
  value?: number;
  [key: string]: any;
}

// Sankey link
export interface SankeyLink {
  source: number | string;
  target: number | string;
  value: number;
  [key: string]: any;
}

// Batch update
export interface SankeyBatchUpdate {
  addNodes?: SankeyNode[];
  updateNodes?: Array<{ name: string; updates: Partial<SankeyNode> }>;
  removeNodes?: string[];
  addLinks?: SankeyLink[];
  updateLinks?: Array<{ source: string; target: string; updates: Partial<SankeyLink> }>;
  removeLinks?: Array<{ source: string; target: string }>;
  timestamp: number;
}

/**
 * Streaming Sankey Service
 * Manages WebSocket connection and real-time updates for Sankey diagrams
 */
export class StreamingSankeyService {
  private socket: WebSocket | null = null;
  private options: StreamingSankeyOptions;
  private connectionState: WebSocketConnectionState = 'closed';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private updateBuffer: SankeyUpdateMessage[] = [];
  private throttleTimer: NodeJS.Timeout | null = null;
  private lastUpdateTime: number = 0;
  private sankeyData: SankeyData = { nodes: [], links: [] };
  private nodeMap: Map<string, { index: number; node: SankeyNode }> = new Map();
  private linkMap: Map<string, SankeyLink> = new Map();
  private updateCallbacks: Array<(data: SankeyData | AggregatedSankeyData) => void> = [];
  
  /**
   * Constructor
   * @param options Streaming options
   */
  constructor(options: StreamingSankeyOptions) {
    this.options = {
      updateInterval: 1000,
      batchSize: 10,
      throttleUpdates: true,
      throttleInterval: 200,
      maxNodes: 100,
      maxLinks: 200,
      aggregateUpdates: true,
      aggregationLevel: 'medium',
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
   * Get the current Sankey data
   * @returns Current Sankey data
   */
  public getSankeyData(): SankeyData | AggregatedSankeyData {
    if (this.options.aggregateUpdates) {
      return this.getAggregatedSankeyData();
    }
    return this.sankeyData;
  }
  
  /**
   * Subscribe to Sankey updates
   * @param callback Callback function to receive updates
   * @returns Unsubscribe function
   */
  public subscribe(callback: (data: SankeyData | AggregatedSankeyData) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Immediately send current data to the new subscriber
    callback(this.getSankeyData());
    
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
   * Reset the Sankey data
   * @param initialData Optional initial data
   */
  public resetSankey(initialData?: SankeyData): void {
    this.sankeyData = initialData || { nodes: [], links: [] };
    this.nodeMap.clear();
    this.linkMap.clear();
    
    // Initialize maps with initial data
    if (initialData) {
      initialData.nodes.forEach((node, index) => {
        this.nodeMap.set(node.name, { index, node });
      });
      
      initialData.links.forEach(link => {
        const sourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
        const targetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
        
        if (sourceIndex !== -1 && targetIndex !== -1) {
          const linkId = this.getLinkId(sourceIndex, targetIndex);
          this.linkMap.set(linkId, { ...link, source: sourceIndex, target: targetIndex });
        }
      });
    }
    
    // Notify subscribers
    this.notifySubscribers();
  }
  
  /**
   * Get aggregated Sankey data
   * @returns Aggregated Sankey data
   */
  private getAggregatedSankeyData(): AggregatedSankeyData {
    // Import aggregation function from sankeyDiagramService
    const { aggregateSankeyData } = require('./sankeyDiagramService');
    
    return aggregateSankeyData(this.sankeyData, this.options.aggregationLevel);
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
      const message = JSON.parse(data) as SankeyUpdateMessage;
      
      // Add to buffer if throttling is enabled
      if (this.options.throttleUpdates) {
        this.updateBuffer.push(message);
        
        // Process buffer if it reaches batch size
        if (this.updateBuffer.length >= (this.options.batchSize || 10)) {
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
    const batchUpdate: SankeyBatchUpdate = {
      addNodes: [],
      updateNodes: [],
      removeNodes: [],
      addLinks: [],
      updateLinks: [],
      removeLinks: [],
      timestamp: now
    };
    
    this.updateBuffer.forEach(message => {
      switch (message.type) {
        case 'add_node':
          batchUpdate.addNodes!.push(message.data);
          break;
        case 'update_node':
          batchUpdate.updateNodes!.push(message.data);
          break;
        case 'remove_node':
          batchUpdate.removeNodes!.push(message.data);
          break;
        case 'add_link':
          batchUpdate.addLinks!.push(message.data);
          break;
        case 'update_link':
          batchUpdate.updateLinks!.push(message.data);
          break;
        case 'remove_link':
          batchUpdate.removeLinks!.push(message.data);
          break;
        case 'batch_update':
          // Merge batch updates
          const batch = message.data as SankeyBatchUpdate;
          if (batch.addNodes) batchUpdate.addNodes!.push(...batch.addNodes);
          if (batch.updateNodes) batchUpdate.updateNodes!.push(...batch.updateNodes);
          if (batch.removeNodes) batchUpdate.removeNodes!.push(...batch.removeNodes);
          if (batch.addLinks) batchUpdate.addLinks!.push(...batch.addLinks);
          if (batch.updateLinks) batchUpdate.updateLinks!.push(...batch.updateLinks);
          if (batch.removeLinks) batchUpdate.removeLinks!.push(...batch.removeLinks);
          break;
        case 'reset':
          this.resetSankey(message.data);
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
  private processMessage(message: SankeyUpdateMessage): void {
    switch (message.type) {
      case 'add_node':
        this.addNode(message.data);
        break;
      case 'update_node':
        this.updateNode(message.data.name, message.data.updates);
        break;
      case 'remove_node':
        this.removeNode(message.data);
        break;
      case 'add_link':
        this.addLink(message.data);
        break;
      case 'update_link':
        this.updateLink(message.data.source, message.data.target, message.data.updates);
        break;
      case 'remove_link':
        this.removeLink(message.data.source, message.data.target);
        break;
      case 'batch_update':
        this.applyBatchUpdate(message.data);
        break;
      case 'reset':
        this.resetSankey(message.data);
        break;
    }
  }
  
  /**
   * Apply a batch update
   * @param update Batch update
   */
  private applyBatchUpdate(update: SankeyBatchUpdate): void {
    let hasChanges = false;
    
    // Add nodes
    if (update.addNodes && update.addNodes.length > 0) {
      update.addNodes.forEach(node => {
        if (this.addNode(node, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Update nodes
    if (update.updateNodes && update.updateNodes.length > 0) {
      update.updateNodes.forEach(nodeUpdate => {
        if (this.updateNode(nodeUpdate.name, nodeUpdate.updates, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Remove nodes
    if (update.removeNodes && update.removeNodes.length > 0) {
      update.removeNodes.forEach(nodeName => {
        if (this.removeNode(nodeName, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Add links
    if (update.addLinks && update.addLinks.length > 0) {
      update.addLinks.forEach(link => {
        if (this.addLink(link, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Update links
    if (update.updateLinks && update.updateLinks.length > 0) {
      update.updateLinks.forEach(linkUpdate => {
        if (this.updateLink(linkUpdate.source, linkUpdate.target, linkUpdate.updates, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Remove links
    if (update.removeLinks && update.removeLinks.length > 0) {
      update.removeLinks.forEach(link => {
        if (this.removeLink(link.source, link.target, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Enforce max nodes/links limits
    this.enforceNodeLimit();
    this.enforceLinkLimit();
    
    // Notify subscribers if there were changes
    if (hasChanges) {
      this.notifySubscribers();
    }
  }
  
  /**
   * Add a node to the Sankey diagram
   * @param node Node to add
   * @param notify Whether to notify subscribers
   * @returns Whether the node was added
   */
  private addNode(node: SankeyNode, notify: boolean = true): boolean {
    // Check if node already exists
    if (this.nodeMap.has(node.name)) {
      return false;
    }
    
    // Add node
    const index = this.sankeyData.nodes.length;
    this.nodeMap.set(node.name, { index, node });
    this.sankeyData.nodes.push(node);
    
    // Enforce node limit
    this.enforceNodeLimit();
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Update a node in the Sankey diagram
   * @param name Node name
   * @param updates Node updates
   * @param notify Whether to notify subscribers
   * @returns Whether the node was updated
   */
  private updateNode(name: string, updates: Partial<SankeyNode>, notify: boolean = true): boolean {
    // Check if node exists
    const nodeEntry = this.nodeMap.get(name);
    if (!nodeEntry) {
      return false;
    }
    
    // Update node
    Object.assign(nodeEntry.node, updates);
    
    // Update node in array
    this.sankeyData.nodes[nodeEntry.index] = nodeEntry.node;
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Remove a node from the Sankey diagram
   * @param name Node name
   * @param notify Whether to notify subscribers
   * @returns Whether the node was removed
   */
  private removeNode(name: string, notify: boolean = true): boolean {
    // Check if node exists
    const nodeEntry = this.nodeMap.get(name);
    if (!nodeEntry) {
      return false;
    }
    
    // Remove node
    this.sankeyData.nodes.splice(nodeEntry.index, 1);
    this.nodeMap.delete(name);
    
    // Update indices for remaining nodes
    this.sankeyData.nodes.forEach((node, index) => {
      const entry = this.nodeMap.get(node.name);
      if (entry) {
        entry.index = index;
      }
    });
    
    // Remove associated links
    const linksToRemove: string[] = [];
    this.linkMap.forEach((link, linkId) => {
      const sourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
      const targetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
      
      if (sourceIndex === nodeEntry.index || targetIndex === nodeEntry.index) {
        linksToRemove.push(linkId);
      }
    });
    
    linksToRemove.forEach(linkId => {
      this.linkMap.delete(linkId);
    });
    
    // Update link indices
    this.sankeyData.links = this.sankeyData.links.filter(link => {
      const sourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
      const targetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
      
      return sourceIndex !== nodeEntry.index && targetIndex !== nodeEntry.index;
    }).map(link => {
      const sourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
      const targetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
      
      // Adjust indices for removed node
      const newSourceIndex = sourceIndex > nodeEntry.index ? sourceIndex - 1 : sourceIndex;
      const newTargetIndex = targetIndex > nodeEntry.index ? targetIndex - 1 : targetIndex;
      
      return { ...link, source: newSourceIndex, target: newTargetIndex };
    });
    
    // Rebuild link map
    this.linkMap.clear();
    this.sankeyData.links.forEach(link => {
      const sourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
      const targetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
      
      const linkId = this.getLinkId(sourceIndex, targetIndex);
      this.linkMap.set(linkId, link);
    });
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Add a link to the Sankey diagram
   * @param link Link to add
   * @param notify Whether to notify subscribers
   * @returns Whether the link was added
   */
  private addLink(link: SankeyLink, notify: boolean = true): boolean {
    // Get source and target indices
    const sourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
    const targetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
    
    // Check if source and target nodes exist
    if (sourceIndex === -1 || targetIndex === -1) {
      return false;
    }
    
    // Check if link already exists
    const linkId = this.getLinkId(sourceIndex, targetIndex);
    if (this.linkMap.has(linkId)) {
      return false;
    }
    
    // Add link
    const newLink = { ...link, source: sourceIndex, target: targetIndex };
    this.linkMap.set(linkId, newLink);
    this.sankeyData.links.push(newLink);
    
    // Enforce link limit
    this.enforceLinkLimit();
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Update a link in the Sankey diagram
   * @param source Source node name or index
   * @param target Target node name or index
   * @param updates Link updates
   * @param notify Whether to notify subscribers
   * @returns Whether the link was updated
   */
  private updateLink(source: string | number, target: string | number, updates: Partial<SankeyLink>, notify: boolean = true): boolean {
    // Get source and target indices
    const sourceIndex = typeof source === 'number' ? source : this.getNodeIndex(source);
    const targetIndex = typeof target === 'number' ? target : this.getNodeIndex(target);
    
    // Check if source and target nodes exist
    if (sourceIndex === -1 || targetIndex === -1) {
      return false;
    }
    
    // Check if link exists
    const linkId = this.getLinkId(sourceIndex, targetIndex);
    const link = this.linkMap.get(linkId);
    if (!link) {
      return false;
    }
    
    // Update link
    Object.assign(link, updates);
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Remove a link from the Sankey diagram
   * @param source Source node name or index
   * @param target Target node name or index
   * @param notify Whether to notify subscribers
   * @returns Whether the link was removed
   */
  private removeLink(source: string | number, target: string | number, notify: boolean = true): boolean {
    // Get source and target indices
    const sourceIndex = typeof source === 'number' ? source : this.getNodeIndex(source);
    const targetIndex = typeof target === 'number' ? target : this.getNodeIndex(target);
    
    // Check if source and target nodes exist
    if (sourceIndex === -1 || targetIndex === -1) {
      return false;
    }
    
    // Check if link exists
    const linkId = this.getLinkId(sourceIndex, targetIndex);
    if (!this.linkMap.has(linkId)) {
      return false;
    }
    
    // Remove link
    this.linkMap.delete(linkId);
    this.sankeyData.links = this.sankeyData.links.filter(link => {
      const linkSourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
      const linkTargetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
      
      return !(linkSourceIndex === sourceIndex && linkTargetIndex === targetIndex);
    });
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Enforce node limit
   */
  private enforceNodeLimit(): void {
    if (!this.options.maxNodes || this.sankeyData.nodes.length <= this.options.maxNodes) {
      return;
    }
    
    // Remove nodes with smallest values
    const nodesToRemove = [...this.sankeyData.nodes]
      .sort((a, b) => (a.value || 0) - (b.value || 0))
      .slice(0, this.sankeyData.nodes.length - this.options.maxNodes)
      .map(node => node.name);
    
    nodesToRemove.forEach(nodeName => {
      this.removeNode(nodeName, false);
    });
  }
  
  /**
   * Enforce link limit
   */
  private enforceLinkLimit(): void {
    if (!this.options.maxLinks || this.sankeyData.links.length <= this.options.maxLinks) {
      return;
    }
    
    // Remove links with smallest values
    const linksToRemove = [...this.sankeyData.links]
      .sort((a, b) => a.value - b.value)
      .slice(0, this.sankeyData.links.length - this.options.maxLinks);
    
    linksToRemove.forEach(link => {
      const sourceIndex = typeof link.source === 'number' ? link.source : this.getNodeIndex(link.source);
      const targetIndex = typeof link.target === 'number' ? link.target : this.getNodeIndex(link.target);
      
      this.removeLink(sourceIndex, targetIndex, false);
    });
  }
  
  /**
   * Get node index by name
   * @param name Node name
   * @returns Node index or -1 if not found
   */
  private getNodeIndex(name: string): number {
    const nodeEntry = this.nodeMap.get(name);
    return nodeEntry ? nodeEntry.index : -1;
  }
  
  /**
   * Get link ID
   * @param source Source node index
   * @param target Target node index
   * @returns Link ID
   */
  private getLinkId(source: number, target: number): string {
    return `${source}-${target}`;
  }
  
  /**
   * Notify subscribers of Sankey data changes
   */
  private notifySubscribers(): void {
    // Get data (possibly aggregated)
    const data = this.getSankeyData();
    
    // Notify subscribers
    this.updateCallbacks.forEach(callback => {
      callback(data);
    });
  }
}
