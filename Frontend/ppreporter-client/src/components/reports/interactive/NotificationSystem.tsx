import React, { useState, useCallback } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format as formatDate, formatDistanceToNow } from 'date-fns';
import { 
  Notification, 
  useCollaborativeAnnotationContext 
} from './CollaborativeAnnotationSystem';

// Notification system props
interface NotificationSystemProps {
  maxNotifications?: number;
  onNotificationClick?: (notification: Notification) => void;
}

/**
 * NotificationSystem component
 * Displays notifications for annotations with real-time updates
 */
const NotificationSystem: React.FC<NotificationSystemProps> = ({
  maxNotifications = 10,
  onNotificationClick
}) => {
  const theme = useTheme();
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    getUnreadNotificationsCount 
  } = useCollaborativeAnnotationContext();
  
  // State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Handle menu open
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  
  // Handle menu close
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  
  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    markNotificationAsRead(notification.id);
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    handleMenuClose();
  }, [markNotificationAsRead, onNotificationClick, handleMenuClose]);
  
  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);
  
  // Get notification icon
  const getNotificationIcon = useCallback((type: Notification['type']) => {
    switch (type) {
      case 'mention':
        return <PersonIcon fontSize="small" color="primary" />;
      case 'reply':
        return <CommentIcon fontSize="small" color="info" />;
      case 'update':
        return <EditIcon fontSize="small" color="warning" />;
      case 'delete':
        return <DeleteIcon fontSize="small" color="error" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  }, []);
  
  // Format notification time
  const formatNotificationTime = useCallback((date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    
    // If less than 24 hours ago, show relative time
    if (now.getTime() - notificationDate.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(notificationDate, { addSuffix: true });
    }
    
    // Otherwise, show date
    return formatDate(notificationDate, 'MMM dd, yyyy');
  }, []);
  
  // Get unread count
  const unreadCount = getUnreadNotificationsCount();
  
  // Sort notifications by date (newest first)
  const sortedNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxNotifications);
  
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
        aria-label="notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActiveIcon />
          ) : notifications.length > 0 ? (
            <NotificationsIcon />
          ) : (
            <NotificationsNoneIcon />
          )}
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">Notifications</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleIcon fontSize="small" />}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {sortedNotifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {sortedNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12)
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: notification.read ? theme.palette.grey[300] : theme.palette.primary.main }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={notification.read ? 'normal' : 'bold'}>
                      {notification.message}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatNotificationTime(notification.createdAt)}
                    </Typography>
                  }
                />
                {!notification.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      ml: 1
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 1 }} />
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        )}
        
        {notifications.length > maxNotifications && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Button size="small" variant="text">
              View all notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationSystem;
