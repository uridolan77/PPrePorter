import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Popover,
  Paper,
  useTheme,
  Badge,
  Chip,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { format as formatDate } from 'date-fns';

// Mock WebSocket for real-time collaboration
class MockWebSocket {
  private callbacks: { [event: string]: ((data: any) => void)[] } = {};
  private static instance: MockWebSocket | null = null;
  private connected: boolean = false;
  private url: string = '';

  private constructor(url: string) {
    this.url = url;
    this.connected = true;
    console.log(`WebSocket connected to ${url}`);
    
    // Simulate connection established
    setTimeout(() => {
      this.trigger('open', {});
    }, 500);
  }

  static getInstance(url: string): MockWebSocket {
    if (!MockWebSocket.instance) {
      MockWebSocket.instance = new MockWebSocket(url);
    }
    return MockWebSocket.instance;
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  trigger(event: string, data: any): void {
    if (!this.callbacks[event]) return;
    this.callbacks[event].forEach(callback => callback(data));
  }

  send(data: any): void {
    if (!this.connected) {
      console.error('WebSocket is not connected');
      return;
    }
    
    console.log('WebSocket sending data:', data);
    
    // Simulate server response
    setTimeout(() => {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      
      switch (parsedData.type) {
        case 'add_annotation':
          this.trigger('message', {
            type: 'annotation_added',
            annotation: {
              ...parsedData.annotation,
              id: `annotation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          });
          break;
          
        case 'update_annotation':
          this.trigger('message', {
            type: 'annotation_updated',
            annotation: {
              ...parsedData.annotation,
              updatedAt: new Date().toISOString()
            }
          });
          break;
          
        case 'delete_annotation':
          this.trigger('message', {
            type: 'annotation_deleted',
            annotationId: parsedData.annotationId
          });
          break;
          
        case 'get_annotations':
          // Simulate fetching annotations
          const mockAnnotations = [
            {
              id: 'annotation-1',
              chartId: parsedData.chartId,
              dataPointId: 'point-1',
              text: 'This is an interesting data point!',
              author: 'John Doe',
              createdAt: '2023-01-01T12:00:00Z',
              updatedAt: '2023-01-01T12:00:00Z',
              type: 'comment',
              position: { x: 30, y: 40 },
              metadata: { label: 'Data Point 1' }
            },
            {
              id: 'annotation-2',
              chartId: parsedData.chartId,
              dataPointId: 'point-2',
              text: 'This value seems abnormal, we should investigate.',
              author: 'Jane Smith',
              createdAt: '2023-01-02T14:30:00Z',
              updatedAt: '2023-01-02T15:45:00Z',
              type: 'flag',
              position: { x: 70, y: 60 },
              metadata: { label: 'Data Point 2' }
            }
          ];
          
          this.trigger('message', {
            type: 'annotations_list',
            annotations: mockAnnotations
          });
          break;
          
        default:
          console.log('Unknown message type:', parsedData.type);
      }
    }, 300);
  }

  close(): void {
    this.connected = false;
    this.trigger('close', {});
    MockWebSocket.instance = null;
    console.log('WebSocket disconnected');
  }
}

// User interface
export interface User {
  id: string;
  name: string;
  avatar?: string;
}

// Annotation type
export interface CollaborativeAnnotation {
  id: string;
  chartId: string;
  dataPointId: string | number;
  text: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  type: 'comment' | 'flag' | 'insight';
  position?: {
    x: number;
    y: number;
  };
  mentions?: string[];
  metadata?: {
    [key: string]: any;
  };
}

// Notification type
export interface Notification {
  id: string;
  type: 'mention' | 'reply' | 'update' | 'delete';
  annotationId: string;
  chartId: string;
  dataPointId: string | number;
  fromUser: string;
  fromUserId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// Annotation context state
interface CollaborativeAnnotationContextState {
  annotations: CollaborativeAnnotation[];
  notifications: Notification[];
  users: User[];
  currentUser: User;
  loading: boolean;
  error: string | null;
  addAnnotation: (annotation: Omit<CollaborativeAnnotation, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>) => void;
  updateAnnotation: (id: string, text: string, type: CollaborativeAnnotation['type'], mentions?: string[]) => void;
  deleteAnnotation: (id: string) => void;
  getAnnotationsForChart: (chartId: string) => CollaborativeAnnotation[];
  getAnnotationsForDataPoint: (chartId: string, dataPointId: string | number) => CollaborativeAnnotation[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  getUnreadNotificationsCount: () => number;
}

// Create context
const CollaborativeAnnotationContext = createContext<CollaborativeAnnotationContextState | undefined>(undefined);

// Annotation context provider props
interface CollaborativeAnnotationContextProviderProps {
  children: ReactNode;
  currentUser?: User;
}

/**
 * CollaborativeAnnotationContextProvider component
 * Provides annotation state and methods for managing annotations with real-time collaboration
 */
export const CollaborativeAnnotationContextProvider: React.FC<CollaborativeAnnotationContextProviderProps> = ({ 
  children,
  currentUser = { id: 'user-1', name: 'Current User' }
}) => {
  const [annotations, setAnnotations] = useState<CollaborativeAnnotation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([
    { id: 'user-1', name: 'Current User' },
    { id: 'user-2', name: 'John Doe' },
    { id: 'user-3', name: 'Jane Smith' },
    { id: 'user-4', name: 'Bob Johnson' }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<MockWebSocket | null>(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    const ws = MockWebSocket.getInstance('wss://api.example.com/annotations');
    setSocket(ws);
    
    // Handle WebSocket events
    const handleOpen = () => {
      console.log('WebSocket connection established');
      // Fetch initial annotations
      ws.send(JSON.stringify({ type: 'get_annotations', chartId: 'all' }));
    };
    
    const handleMessage = (event: any) => {
      const data = typeof event === 'string' ? JSON.parse(event) : event;
      
      switch (data.type) {
        case 'annotations_list':
          setAnnotations(data.annotations);
          break;
          
        case 'annotation_added':
          setAnnotations(prev => [...prev, data.annotation]);
          // Add notification if the annotation mentions the current user
          if (data.annotation.mentions?.includes(currentUser.id) && data.annotation.authorId !== currentUser.id) {
            addNotification({
              type: 'mention',
              annotationId: data.annotation.id,
              chartId: data.annotation.chartId,
              dataPointId: data.annotation.dataPointId,
              fromUser: data.annotation.author,
              fromUserId: data.annotation.authorId,
              message: `${data.annotation.author} mentioned you in an annotation`
            });
          }
          break;
          
        case 'annotation_updated':
          setAnnotations(prev => prev.map(annotation => 
            annotation.id === data.annotation.id ? data.annotation : annotation
          ));
          // Add notification if the annotation mentions the current user
          if (data.annotation.mentions?.includes(currentUser.id) && data.annotation.authorId !== currentUser.id) {
            addNotification({
              type: 'update',
              annotationId: data.annotation.id,
              chartId: data.annotation.chartId,
              dataPointId: data.annotation.dataPointId,
              fromUser: data.annotation.author,
              fromUserId: data.annotation.authorId,
              message: `${data.annotation.author} updated an annotation that mentions you`
            });
          }
          break;
          
        case 'annotation_deleted':
          setAnnotations(prev => prev.filter(annotation => annotation.id !== data.annotationId));
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    };
    
    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to annotation service');
    };
    
    const handleClose = () => {
      console.log('WebSocket connection closed');
    };
    
    ws.on('open', handleOpen);
    ws.on('message', handleMessage);
    ws.on('error', handleError);
    ws.on('close', handleClose);
    
    // Cleanup
    return () => {
      ws.off('open', handleOpen);
      ws.off('message', handleMessage);
      ws.off('error', handleError);
      ws.off('close', handleClose);
      ws.close();
    };
  }, [currentUser.id]);
  
  // Add a new annotation
  const addAnnotation = useCallback((annotation: Omit<CollaborativeAnnotation, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>) => {
    if (!socket) return;
    
    setLoading(true);
    
    // Extract mentions from text (format: @username)
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(annotation.text.matchAll(mentionRegex))
      .map(match => match[1])
      .map(username => {
        const user = users.find(u => u.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase());
        return user ? user.id : null;
      })
      .filter(Boolean) as string[];
    
    // Send to server
    socket.send(JSON.stringify({
      type: 'add_annotation',
      annotation: {
        ...annotation,
        authorId: currentUser.id,
        mentions
      }
    }));
    
    setLoading(false);
  }, [socket, users, currentUser.id]);
  
  // Update an annotation
  const updateAnnotation = useCallback((id: string, text: string, type: CollaborativeAnnotation['type'], mentions?: string[]) => {
    if (!socket) return;
    
    setLoading(true);
    
    // Find the annotation
    const annotation = annotations.find(a => a.id === id);
    if (!annotation) {
      setError('Annotation not found');
      setLoading(false);
      return;
    }
    
    // Extract mentions from text if not provided
    let extractedMentions = mentions;
    if (!extractedMentions) {
      const mentionRegex = /@(\w+)/g;
      extractedMentions = Array.from(text.matchAll(mentionRegex))
        .map(match => match[1])
        .map(username => {
          const user = users.find(u => u.name.toLowerCase().replace(/\s+/g, '') === username.toLowerCase());
          return user ? user.id : null;
        })
        .filter(Boolean) as string[];
    }
    
    // Send to server
    socket.send(JSON.stringify({
      type: 'update_annotation',
      annotation: {
        ...annotation,
        text,
        type,
        mentions: extractedMentions
      }
    }));
    
    setLoading(false);
  }, [socket, annotations, users]);
  
  // Delete an annotation
  const deleteAnnotation = useCallback((id: string) => {
    if (!socket) return;
    
    setLoading(true);
    
    // Send to server
    socket.send(JSON.stringify({
      type: 'delete_annotation',
      annotationId: id
    }));
    
    setLoading(false);
  }, [socket]);
  
  // Get annotations for a chart
  const getAnnotationsForChart = useCallback((chartId: string) => {
    return annotations.filter(annotation => annotation.chartId === chartId);
  }, [annotations]);
  
  // Get annotations for a data point
  const getAnnotationsForDataPoint = useCallback((chartId: string, dataPointId: string | number) => {
    return annotations.filter(
      annotation => annotation.chartId === chartId && annotation.dataPointId === dataPointId
    );
  }, [annotations]);
  
  // Add a notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);
  
  // Mark notification as read
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  }, []);
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);
  
  // Get unread notifications count
  const getUnreadNotificationsCount = useCallback(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);
  
  // Context value
  const value: CollaborativeAnnotationContextState = {
    annotations,
    notifications,
    users,
    currentUser,
    loading,
    error,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsForChart,
    getAnnotationsForDataPoint,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationsCount
  };
  
  return (
    <CollaborativeAnnotationContext.Provider value={value}>
      {children}
    </CollaborativeAnnotationContext.Provider>
  );
};

// Custom hook to use annotation context
export const useCollaborativeAnnotationContext = () => {
  const context = useContext(CollaborativeAnnotationContext);
  if (context === undefined) {
    throw new Error('useCollaborativeAnnotationContext must be used within a CollaborativeAnnotationContextProvider');
  }
  return context;
};

export default CollaborativeAnnotationContext;
