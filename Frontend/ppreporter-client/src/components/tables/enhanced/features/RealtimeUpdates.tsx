import React, { useEffect, useRef, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { RealtimeConfig } from '../types';

interface RealtimeUpdatesProps {
  config: RealtimeConfig;
  data: any[];
  idField: string;
  onDataUpdate: (updatedData: any[]) => void;
}

/**
 * Realtime updates component with WebSocket support
 */
const RealtimeUpdates: React.FC<RealtimeUpdatesProps> = ({
  config,
  data,
  idField,
  onDataUpdate
}) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Connect to WebSocket
  useEffect(() => {
    if (!config.enabled || !config.websocketUrl) {
      return;
    }

    const connectWebSocket = () => {
      try {
        const socket = new WebSocket(config.websocketUrl);

        socket.onopen = () => {
          setConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;

          if (reconnectAttemptsRef.current > 0) {
            setNotification({
              message: 'Reconnected to server',
              type: 'success'
            });
          }
        };

        socket.onclose = (event) => {
          setConnected(false);

          if (!event.wasClean) {
            setError('Connection closed unexpectedly');

            // Implement reconnect strategy
            if (config.reconnectStrategy && reconnectAttemptsRef.current < (config.reconnectStrategy.maxRetries || 5)) {
              const backoffFactor = config.reconnectStrategy.backoffFactor || 1.5;
              const baseDelay = 1000; // 1 second
              const delay = baseDelay * Math.pow(backoffFactor, reconnectAttemptsRef.current);

              reconnectTimeoutRef.current = setTimeout(() => {
                reconnectAttemptsRef.current++;
                connectWebSocket();
              }, delay);
            } else {
              setError('Failed to reconnect after multiple attempts');
            }
          }
        };

        socket.onerror = () => {
          setError('WebSocket connection error');
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        socketRef.current = socket;
      } catch (err) {
        setError(`Failed to connect: ${err instanceof Error ? err.message : String(err)}`);
      }
    };

    connectWebSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [config.enabled, config.websocketUrl, config.reconnectStrategy]);

  // Handle WebSocket messages
  const handleWebSocketMessage = (message: any) => {
    if (!message || !message.type || !message.data) {
      return;
    }

    const { type, data: messageData } = message;

    // Clone current data
    const newData = [...data];

    // Handle different message types
    switch (type) {
      case config.messageTypes?.rowAdded:
        // Add new row
        newData.push(messageData);
        onDataUpdate(newData);

        setNotification({
          message: 'New row added',
          type: 'info'
        });
        break;

      case config.messageTypes?.rowUpdated:
        // Update existing row
        const updateIndex = newData.findIndex(row => row[idField] === messageData[idField]);

        if (updateIndex !== -1) {
          newData[updateIndex] = {
            ...newData[updateIndex],
            ...messageData
          };

          onDataUpdate(newData);

          setNotification({
            message: 'Row updated',
            type: 'info'
          });
        }
        break;

      case config.messageTypes?.rowDeleted:
        // Delete row
        const deleteIndex = newData.findIndex(row => row[idField] === messageData[idField]);

        if (deleteIndex !== -1) {
          newData.splice(deleteIndex, 1);
          onDataUpdate(newData);

          setNotification({
            message: 'Row deleted',
            type: 'info'
          });
        }
        break;

      case config.messageTypes?.refresh:
        // Full data refresh
        onDataUpdate(messageData);

        setNotification({
          message: 'Data refreshed',
          type: 'info'
        });
        break;

      default:
        // Custom message handler
        if (config.customMessageHandlers && config.customMessageHandlers[type]) {
          const result = config.customMessageHandlers[type](newData, messageData);

          if (result) {
            onDataUpdate(result);

            setNotification({
              message: `Custom update: ${type}`,
              type: 'info'
            });
          }
        }
    }
  };

  // Send message to WebSocket
  const sendMessage = (type: string, data: any) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    try {
      socketRef.current.send(JSON.stringify({ type, data }));
    } catch (err) {
      setError(`Failed to send message: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification(null);
  };

  return (
    <>
      {/* Connection status notification */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Update notifications */}
      {notification && (
        <Snackbar
          open={true}
          autoHideDuration={3000}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleNotificationClose} severity={notification.type}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default RealtimeUpdates;
