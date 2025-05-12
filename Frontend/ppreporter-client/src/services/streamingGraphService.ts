import { GraphData, GraphNode, GraphLink } from '../components/reports/visualizations/NetworkGraph';

// WebSocket connection states
export type WebSocketConnectionState = 'connecting' | 'open' | 'closed' | 'error';

// Streaming options
export interface StreamingOptions {
  url: string;
  updateInterval?: number; // Milliseconds between updates
  batchSize?: number; // Number of updates to batch
  throttleUpdates?: boolean; // Whether to throttle updates
  throttleInterval?: number; // Milliseconds to throttle updates
  maxNodes?: number; // Maximum number of nodes to display
  maxLinks?: number; // Maximum number of links to display
  pruneOldNodes?: boolean; // Whether to remove old nodes
  nodeTimeToLive?: number; // Seconds before a node is removed
  autoReconnect?: boolean; // Whether to automatically reconnect
  reconnectInterval?: number; // Milliseconds between reconnect attempts
  onConnectionStateChange?: (state: WebSocketConnectionState) => void;
  onError?: (error: Error) => void;
}

// Update message types
export type UpdateMessageType = 'add_node' | 'update_node' | 'remove_node' | 'add_link' | 'update_link' | 'remove_link' | 'batch_update' | 'reset' | 'error';

// Update message
export interface UpdateMessage {
  type: UpdateMessageType;
  data: any;
  timestamp: number;
}

// Batch update
export interface BatchUpdate {
  addNodes?: GraphNode[];
  updateNodes?: Array<{ id: string; updates: Partial<GraphNode> }>;
  removeNodes?: string[];
  addLinks?: GraphLink[];
  updateLinks?: Array<{ source: string; target: string; updates: Partial<GraphLink> }>;
  removeLinks?: Array<{ source: string; target: string }>;
  timestamp: number;
}

/**
 * Streaming Graph Service
 * Manages WebSocket connection and real-time updates for network graphs
 */
export class StreamingGraphService {
  private socket: WebSocket | null = null;
  private options: StreamingOptions;
  private connectionState: WebSocketConnectionState = 'closed';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private updateBuffer: UpdateMessage[] = [];
  private throttleTimer: NodeJS.Timeout | null = null;
  private lastUpdateTime: number = 0;
  private graphData: GraphData = { nodes: [], links: [] };
  private nodeMap: Map<string, GraphNode> = new Map();
  private linkMap: Map<string, GraphLink> = new Map();
  private nodeTimestamps: Map<string, number> = new Map();
  private updateCallbacks: Array<(data: GraphData) => void> = [];
  
  /**
   * Constructor
   * @param options Streaming options
   */
  constructor(options: StreamingOptions) {
    this.options = {
      updateInterval: 1000,
      batchSize: 10,
      throttleUpdates: true,
      throttleInterval: 200,
      maxNodes: 1000,
      maxLinks: 2000,
      pruneOldNodes: true,
      nodeTimeToLive: 300, // 5 minutes
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
   * Get the current graph data
   * @returns Current graph data
   */
  public getGraphData(): GraphData {
    return this.graphData;
  }
  
  /**
   * Subscribe to graph updates
   * @param callback Callback function to receive updates
   * @returns Unsubscribe function
   */
  public subscribe(callback: (data: GraphData) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Immediately send current data to the new subscriber
    callback(this.graphData);
    
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
   * Reset the graph data
   * @param initialData Optional initial data
   */
  public resetGraph(initialData?: GraphData): void {
    this.graphData = initialData || { nodes: [], links: [] };
    this.nodeMap.clear();
    this.linkMap.clear();
    this.nodeTimestamps.clear();
    
    // Initialize maps with initial data
    if (initialData) {
      initialData.nodes.forEach(node => {
        this.nodeMap.set(node.id, node);
        this.nodeTimestamps.set(node.id, Date.now());
      });
      
      initialData.links.forEach(link => {
        const linkId = this.getLinkId(link.source as string, link.target as string);
        this.linkMap.set(linkId, link);
      });
    }
    
    // Notify subscribers
    this.notifySubscribers();
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
      const message = JSON.parse(data) as UpdateMessage;
      
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
    const batchUpdate: BatchUpdate = {
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
          const batch = message.data as BatchUpdate;
          if (batch.addNodes) batchUpdate.addNodes!.push(...batch.addNodes);
          if (batch.updateNodes) batchUpdate.updateNodes!.push(...batch.updateNodes);
          if (batch.removeNodes) batchUpdate.removeNodes!.push(...batch.removeNodes);
          if (batch.addLinks) batchUpdate.addLinks!.push(...batch.addLinks);
          if (batch.updateLinks) batchUpdate.updateLinks!.push(...batch.updateLinks);
          if (batch.removeLinks) batchUpdate.removeLinks!.push(...batch.removeLinks);
          break;
        case 'reset':
          this.resetGraph(message.data);
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
  private processMessage(message: UpdateMessage): void {
    switch (message.type) {
      case 'add_node':
        this.addNode(message.data);
        break;
      case 'update_node':
        this.updateNode(message.data.id, message.data.updates);
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
        this.resetGraph(message.data);
        break;
    }
  }
  
  /**
   * Apply a batch update
   * @param update Batch update
   */
  private applyBatchUpdate(update: BatchUpdate): void {
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
        if (this.updateNode(nodeUpdate.id, nodeUpdate.updates, false)) {
          hasChanges = true;
        }
      });
    }
    
    // Remove nodes
    if (update.removeNodes && update.removeNodes.length > 0) {
      update.removeNodes.forEach(nodeId => {
        if (this.removeNode(nodeId, false)) {
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
    
    // Prune old nodes if enabled
    if (this.options.pruneOldNodes) {
      this.pruneOldNodes();
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
   * Add a node to the graph
   * @param node Node to add
   * @param notify Whether to notify subscribers
   * @returns Whether the node was added
   */
  private addNode(node: GraphNode, notify: boolean = true): boolean {
    // Check if node already exists
    if (this.nodeMap.has(node.id)) {
      return false;
    }
    
    // Add node
    this.nodeMap.set(node.id, node);
    this.nodeTimestamps.set(node.id, Date.now());
    this.graphData.nodes.push(node);
    
    // Enforce node limit
    this.enforceNodeLimit();
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Update a node in the graph
   * @param id Node ID
   * @param updates Node updates
   * @param notify Whether to notify subscribers
   * @returns Whether the node was updated
   */
  private updateNode(id: string, updates: Partial<GraphNode>, notify: boolean = true): boolean {
    // Check if node exists
    const node = this.nodeMap.get(id);
    if (!node) {
      return false;
    }
    
    // Update node
    Object.assign(node, updates);
    this.nodeTimestamps.set(id, Date.now());
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Remove a node from the graph
   * @param id Node ID
   * @param notify Whether to notify subscribers
   * @returns Whether the node was removed
   */
  private removeNode(id: string, notify: boolean = true): boolean {
    // Check if node exists
    if (!this.nodeMap.has(id)) {
      return false;
    }
    
    // Remove node
    this.nodeMap.delete(id);
    this.nodeTimestamps.delete(id);
    this.graphData.nodes = this.graphData.nodes.filter(node => node.id !== id);
    
    // Remove associated links
    const linksToRemove: string[] = [];
    this.linkMap.forEach((link, linkId) => {
      const source = link.source as string;
      const target = link.target as string;
      
      if (source === id || target === id) {
        linksToRemove.push(linkId);
      }
    });
    
    linksToRemove.forEach(linkId => {
      this.linkMap.delete(linkId);
    });
    
    this.graphData.links = this.graphData.links.filter(link => {
      const source = link.source as string;
      const target = link.target as string;
      
      return source !== id && target !== id;
    });
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Add a link to the graph
   * @param link Link to add
   * @param notify Whether to notify subscribers
   * @returns Whether the link was added
   */
  private addLink(link: GraphLink, notify: boolean = true): boolean {
    // Ensure source and target are strings
    const source = link.source as string;
    const target = link.target as string;
    
    // Check if source and target nodes exist
    if (!this.nodeMap.has(source) || !this.nodeMap.has(target)) {
      return false;
    }
    
    // Check if link already exists
    const linkId = this.getLinkId(source, target);
    if (this.linkMap.has(linkId)) {
      return false;
    }
    
    // Add link
    this.linkMap.set(linkId, link);
    this.graphData.links.push(link);
    
    // Enforce link limit
    this.enforceLinkLimit();
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Update a link in the graph
   * @param source Source node ID
   * @param target Target node ID
   * @param updates Link updates
   * @param notify Whether to notify subscribers
   * @returns Whether the link was updated
   */
  private updateLink(source: string, target: string, updates: Partial<GraphLink>, notify: boolean = true): boolean {
    // Check if link exists
    const linkId = this.getLinkId(source, target);
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
   * Remove a link from the graph
   * @param source Source node ID
   * @param target Target node ID
   * @param notify Whether to notify subscribers
   * @returns Whether the link was removed
   */
  private removeLink(source: string, target: string, notify: boolean = true): boolean {
    // Check if link exists
    const linkId = this.getLinkId(source, target);
    if (!this.linkMap.has(linkId)) {
      return false;
    }
    
    // Remove link
    this.linkMap.delete(linkId);
    this.graphData.links = this.graphData.links.filter(link => {
      const linkSource = link.source as string;
      const linkTarget = link.target as string;
      
      return !(linkSource === source && linkTarget === target);
    });
    
    // Notify subscribers
    if (notify) {
      this.notifySubscribers();
    }
    
    return true;
  }
  
  /**
   * Prune old nodes
   */
  private pruneOldNodes(): void {
    if (!this.options.pruneOldNodes || !this.options.nodeTimeToLive) {
      return;
    }
    
    const now = Date.now();
    const maxAge = this.options.nodeTimeToLive * 1000;
    const nodesToRemove: string[] = [];
    
    this.nodeTimestamps.forEach((timestamp, nodeId) => {
      if (now - timestamp > maxAge) {
        nodesToRemove.push(nodeId);
      }
    });
    
    nodesToRemove.forEach(nodeId => {
      this.removeNode(nodeId, false);
    });
  }
  
  /**
   * Enforce node limit
   */
  private enforceNodeLimit(): void {
    if (!this.options.maxNodes || this.graphData.nodes.length <= this.options.maxNodes) {
      return;
    }
    
    // Sort nodes by timestamp (oldest first)
    const nodeIds = Array.from(this.nodeTimestamps.entries())
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);
    
    // Remove oldest nodes
    const nodesToRemove = nodeIds.slice(0, this.graphData.nodes.length - this.options.maxNodes);
    
    nodesToRemove.forEach(nodeId => {
      this.removeNode(nodeId, false);
    });
  }
  
  /**
   * Enforce link limit
   */
  private enforceLinkLimit(): void {
    if (!this.options.maxLinks || this.graphData.links.length <= this.options.maxLinks) {
      return;
    }
    
    // Remove oldest links (assuming they're added in order)
    const linksToRemove = this.graphData.links.slice(0, this.graphData.links.length - this.options.maxLinks);
    
    linksToRemove.forEach(link => {
      const source = link.source as string;
      const target = link.target as string;
      
      this.removeLink(source, target, false);
    });
  }
  
  /**
   * Get link ID
   * @param source Source node ID
   * @param target Target node ID
   * @returns Link ID
   */
  private getLinkId(source: string, target: string): string {
    return `${source}-${target}`;
  }
  
  /**
   * Notify subscribers of graph data changes
   */
  private notifySubscribers(): void {
    // Create a copy of the graph data
    const graphData: GraphData = {
      nodes: [...this.graphData.nodes],
      links: [...this.graphData.links]
    };
    
    // Notify subscribers
    this.updateCallbacks.forEach(callback => {
      callback(graphData);
    });
  }
}
