import { useEffect, useState, useCallback } from 'react';
import realtimeService from '../services/realtimeService';

/**
 * Custom hook for using real-time data
 * @param {string} messageType - Type of message to subscribe to
 * @param {Function} onMessage - Callback function for messages
 * @param {boolean} autoConnect - Whether to automatically connect
 * @returns {Object} - Real-time state and methods
 */
export const useRealtime = (messageType, onMessage, autoConnect = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      await realtimeService.connect();
      setIsConnected(true);
    } catch (err) {
      setError(err);
      console.error('Failed to connect to WebSocket:', err);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    realtimeService.disconnect();
    setIsConnected(false);
  }, []);
  
  // Send a message
  const send = useCallback(async (message) => {
    try {
      await realtimeService.send(message);
      return true;
    } catch (err) {
      setError(err);
      console.error('Failed to send message:', err);
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
 * Custom hook for subscribing to dashboard updates
 * @param {Function} onUpdate - Callback function for updates
 * @param {boolean} autoConnect - Whether to automatically connect
 * @returns {Object} - Real-time state and methods
 */
export const useDashboardUpdates = (onUpdate, autoConnect = true) => {
  return useRealtime('dashboard_update', onUpdate, autoConnect);
};

/**
 * Custom hook for subscribing to player activity
 * @param {Function} onActivity - Callback function for activity
 * @param {boolean} autoConnect - Whether to automatically connect
 * @returns {Object} - Real-time state and methods
 */
export const usePlayerActivity = (onActivity, autoConnect = true) => {
  return useRealtime('player_activity', onActivity, autoConnect);
};

export default useRealtime;
