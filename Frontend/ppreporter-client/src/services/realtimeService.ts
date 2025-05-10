/**
 * Real-time service for WebSocket communication
 */

// Type definitions
type MessageHandler<T = any> = (message: T) => void;
type MessageType = string;
type Subscription = {
  type: MessageType;
  handler: MessageHandler;
};

// WebSocket instance
let socket: WebSocket | null = null;

// Subscriptions
const subscriptions: Subscription[] = [];

// Connection status
let isConnected = false;
let isConnecting = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 2000;

/**
 * Connect to WebSocket server
 * @returns Promise that resolves when connected
 */
const connect = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isConnected) {
      resolve();
      return;
    }

    if (isConnecting) {
      reject(new Error('Connection already in progress'));
      return;
    }

    isConnecting = true;

    try {
      // Use secure WebSocket if on HTTPS
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.REACT_APP_WS_HOST || window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket connected');
        isConnected = true;
        isConnecting = false;
        reconnectAttempts = 0;
        resolve();
      };

      socket.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        isConnected = false;
        
        // Attempt to reconnect if not a clean close
        if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          setTimeout(() => {
            connect().catch(console.error);
          }, reconnectDelay * reconnectAttempts);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnecting = false;
        reject(new Error('Failed to connect to WebSocket server'));
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, data } = message;
          
          // Notify subscribers
          subscriptions
            .filter(sub => sub.type === type)
            .forEach(sub => sub.handler(data));
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
    } catch (error) {
      isConnecting = false;
      reject(error);
    }
  });
};

/**
 * Disconnect from WebSocket server
 */
const disconnect = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
  isConnected = false;
};

/**
 * Send a message to the WebSocket server
 * @param message - Message to send
 * @returns Promise that resolves when message is sent
 */
const send = <T extends Record<string, any>>(message: T): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket is not connected'));
      return;
    }

    try {
      socket.send(JSON.stringify(message));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Subscribe to a message type
 * @param type - Message type to subscribe to
 * @param handler - Handler function for messages
 * @returns Unsubscribe function
 */
const subscribe = <T = any>(type: MessageType, handler: MessageHandler<T>): () => void => {
  const subscription = { type, handler };
  subscriptions.push(subscription);
  
  // Return unsubscribe function
  return () => {
    const index = subscriptions.indexOf(subscription);
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
  };
};

/**
 * Check if WebSocket is connected
 * @returns Connection status
 */
const isSocketConnected = (): boolean => {
  return isConnected && socket !== null && socket.readyState === WebSocket.OPEN;
};

// Export service
const realtimeService = {
  connect,
  disconnect,
  send,
  subscribe,
  isConnected: isSocketConnected
};

export default realtimeService;
