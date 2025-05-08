import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Tooltip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatDistanceToNow } from 'date-fns';

/**
 * NotificationCenter component for displaying and managing user notifications
 * @param {Object} props - Component props
 * @param {Array} props.notifications - Array of notification objects
 * @param {boolean} props.loading - Whether notifications are loading
 * @param {Function} props.onMarkAsRead - Function to mark a notification as read
 * @param {Function} props.onMarkAllAsRead - Function to mark all notifications as read
 * @param {Function} props.onDelete - Function to delete a notification
 * @param {Function} props.onFetchNotifications - Function to fetch notifications
 */
const NotificationCenter = ({
  notifications = [],
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onFetchNotifications
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Calculate unread count
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
    if (onFetchNotifications) {
      onFetchNotifications();
    }
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to link if exists
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    handleCloseNotifications();
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleDelete = (event, notification) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlineIcon color="success" />;
      case 'error':
        return <ErrorOutlineIcon color="error" />;
      case 'warning':
        return <WarningAmberIcon color="warning" />;
      case 'info':
      default:
        return <InfoOutlinedIcon color="info" />;
    }
  };

  // Format time ago
  const formatTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton 
          color="inherit" 
          onClick={handleOpenNotifications}
          aria-describedby={id}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 320, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleOutlineIcon />}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button
                  onClick={() => handleNotificationClick(notification)}
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.isRead ? 'inherit' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: notification.isRead ? 'normal' : 'bold',
                          mr: 6 // Space for the delete button
                        }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(event) => handleDelete(event, notification)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        
        {notifications.length > 0 && (
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button size="small" href="/notifications">
              View all notifications
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;