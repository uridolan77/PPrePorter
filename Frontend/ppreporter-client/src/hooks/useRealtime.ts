import { useEffect, useState, useCallback } from 'react';
import realtimeService from '../services/realtimeService';

/**
 * Message type
 */
export type MessageType = 'dashboard_update' | 'player_activity' | string;

/**
 * Message handler function
 */
export type MessageHandler<T = any> = (message: T) => void;

/**
 * Realtime hook return type
 */
export interface UseRealtimeReturn {
  /**
   * Whether the connection is established
   */
  isConnected: boolean;
  
  /**
   * Whether the connection is being established
   */
  isConnecting: boolean;
  
  /**
   * Connection error
   */
  error: Error | null;
  
  /**
   * Connect to WebSocket
   */
  connect: () => Promise<void>;
  
  /**
   * Disconnect from WebSocket
   */
  disconnect: () => void;
  
  /**
   * Send a message
   */
  send: <T>(message: T) => Promise<boolean>;
}

/**
 * Custom hook for using real-time data
 * @param messageType - Type of message to subscribe to
 * @param onMessage - Callback function for messages
 * @param autoConnect - Whether to automatically connect
 * @returns Real-time state and methods
 */
export const useRealtime = <T = any>(
  messageType: MessageType,
  onMessage: MessageHandler<T>,
  autoConnect = true
): UseRealtimeReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Connect to WebSocket
  const connect = useCallback(async (): Promise<void> => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      await realtimeService.connect();
      setIsConnected(true);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to connect to WebSocket:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback((): void => {
    realtimeService.disconnect();
    setIsConnected(false);
  }, []);
  
  // Send a message
  const send = useCallback(async <M>(message: M): Promise<boolean> => {
    try {
      await realtimeService.send(message);
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to send message:', error);
      return false;
    }
  }, []);
  
  // Subscribe to message type
  useEffect(() => {
    if (!messageType || !onMessage) return;
    
    const unsubscribe = realtimeService.subscribe(messageType, onMessage);
    
    return () => {
      unsubscribe();
    };
  }, [messageType, onMessage]);
  
  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      // Don't disconnect on unmount as other components might be using the connection
      // Only disconnect if explicitly called
    };
  }, [autoConnect, connect]);
  
  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    send
  };
};

/**
 * Dashboard update data
 */
export interface DashboardUpdate {
  /**
   * Update timestamp
   */
  timestamp: string;
  
  /**
   * Update data
   */
  data: any;
  
  /**
   * Update type
   */
  type: string;
}

/**
 * Player activity data
 */
export interface PlayerActivity {
  /**
   * Player ID
   */
  playerId: string;
  
  /**
   * Activity timestamp
   */
  timestamp: string;
  
  /**
   * Activity type
   */
  activityType: string;
  
  /**
   * Activity data
   */
  data: any;
}

/**
 * Custom hook for subscribing to dashboard updates
 * @param onUpdate - Callback function for updates
 * @param autoConnect - Whether to automatically connect
 * @returns Real-time state and methods
 */
export const useDashboardUpdates = (
  onUpdate: MessageHandler<DashboardUpdate>,
  autoConnect = true
): UseRealtimeReturn => {
  return useRealtime<DashboardUpdate>('dashboard_update', onUpdate, autoConnect);
};

/**
 * Custom hook for subscribing to player activity
 * @param onActivity - Callback function for activity
 * @param autoConnect - Whether to automatically connect
 * @returns Real-time state and methods
 */
export const usePlayerActivity = (
  onActivity: MessageHandler<PlayerActivity>,
  autoConnect = true
): UseRealtimeReturn => {
  return useRealtime<PlayerActivity>('player_activity', onActivity, autoConnect);
};

export default useRealtime;
