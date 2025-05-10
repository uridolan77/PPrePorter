import store from '../store/store';
import { updateDashboardData } from '../store/slices/dashboardSlice';
import { updatePlayerActivity } from '../store/slices/playerSlice';
import tokenService from './tokenService';

/**
 * RealtimeService
 * Handles WebSocket connections for real-time data updates
 */
class RealtimeService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.messageQueue = [];
    this.connectionPromise = null;
  }

  /**
   * Connect to the WebSocket server
   * @returns {Promise} - Resolves when connected
   */
  connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.REACT_APP_WS_URL || 'wss://api.ppreporter.com/ws';
        
        // Add authentication token to the WebSocket URL
        const token = tokenService.getAccessToken();
        const authUrl = token ? `${wsUrl}?token=${token}` : wsUrl;
        
        this.ws = new WebSocket(authUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Process any queued messages
          this.processQueue();
          
          // Resolve the connection promise
          resolve();
          this.connectionPromise = null;
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleRealtimeData(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.ws.onclose = () => {
          this.isConnected = false;
          this.handleReconnect();
          
          // Reject the connection promise if it's still pending
          if (this.connectionPromise) {
            reject(new Error('WebSocket connection closed'));
            this.connectionPromise = null;
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          
          // Reject the connection promise if it's still pending
          if (this.connectionPromise) {
            reject(error);
            this.connectionPromise = null;
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.connectionPromise = null;
        reject(error);
      }
    });
    
    return this.connectionPromise;
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.isConnected = false;
    this.connectionPromise = null;
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.pow(2, this.reconnectAttempts) * 1000;
      console.log(`Attempting to reconnect in ${delay}ms...`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Maximum reconnection attempts reached');
    }
  }

  /**
   * Process the message queue
   */
  processQueue() {
    if (!this.isConnected || this.messageQueue.length === 0) {
      return;
    }
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Send a message to the WebSocket server
   * @param {Object} message - Message to send
   * @returns {Promise} - Resolves when message is sent
   */
  async send(message) {
    if (!message) {
      return Promise.reject(new Error('No message provided'));
    }
    
    // If not connected, queue the message and connect
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return this.connect();
    }
    
    // Send the message
    try {
      this.ws.send(JSON.stringify(message));
      return Promise.resolve();
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Handle incoming real-time data
   * @param {Object} data - Incoming data
   */
  handleRealtimeData(data) {
    if (!data || !data.type) {
      console.warn('Received invalid WebSocket message:', data);
      return;
    }
    
    // Dispatch to Redux store based on message type
    switch(data.type) {
      case 'dashboard_update':
        store.dispatch(updateDashboardData(data.payload));
        break;
        
      case 'player_activity':
        store.dispatch(updatePlayerActivity(data.payload));
        break;
        
      case 'notification':
        // Handle notifications
        // This would dispatch to a notification slice
        break;
        
      case 'error':
        console.error('WebSocket error:', data.payload);
        break;
        
      default:
        // Notify any registered listeners for this message type
        if (this.listeners.has(data.type)) {
          const callbacks = this.listeners.get(data.type);
          callbacks.forEach(callback => {
            try {
              callback(data.payload);
            } catch (error) {
              console.error(`Error in listener for ${data.type}:`, error);
            }
          });
        }
    }
  }

  /**
   * Subscribe to a specific message type
   * @param {string} type - Message type to subscribe to
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    const callbacks = this.listeners.get(type);
    callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbackSet = this.listeners.get(type);
      if (callbackSet) {
        callbackSet.delete(callback);
        if (callbackSet.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe to dashboard updates
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribeToDashboardUpdates(callback) {
    return this.subscribe('dashboard_update', callback);
  }

  /**
   * Subscribe to player activity
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  subscribeToPlayerActivity(callback) {
    return this.subscribe('player_activity', callback);
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
