/**
 * Types for NotificationCenter component
 */

/**
 * Notification type enum
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification interface
 */
export interface Notification {
  /**
   * Notification ID
   */
  id: string | number;
  
  /**
   * Notification title
   */
  title: string;
  
  /**
   * Notification message
   */
  message: string;
  
  /**
   * Notification type
   */
  type: NotificationType;
  
  /**
   * Whether the notification has been read
   */
  isRead: boolean;
  
  /**
   * Creation date
   */
  createdAt: string;
  
  /**
   * Optional link to navigate to when clicked
   */
  link?: string;
}

/**
 * NotificationCenter component props interface
 */
export interface NotificationCenterProps {
  /**
   * Array of notification objects
   */
  notifications?: Notification[];
  
  /**
   * Whether notifications are loading
   */
  loading?: boolean;
  
  /**
   * Function to mark a notification as read
   */
  onMarkAsRead?: (id: string | number) => void;
  
  /**
   * Function to mark all notifications as read
   */
  onMarkAllAsRead?: () => void;
  
  /**
   * Function to delete a notification
   */
  onDelete?: (id: string | number) => void;
  
  /**
   * Function to fetch notifications
   */
  onFetchNotifications?: () => void;
}

export default NotificationCenterProps;
