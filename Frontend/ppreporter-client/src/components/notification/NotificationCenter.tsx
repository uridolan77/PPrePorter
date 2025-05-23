import React, { useState, useEffect, MouseEvent } from 'react';
import {
  Badge,
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
  Tooltip,
  Box as MuiBox
} from '@mui/material';
import SimpleBox from '../common/SimpleBox';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatDistanceToNow } from 'date-fns';

// Types
import {
  NotificationCenterProps,
  Notification,
  NotificationType
} from '../../types/notificationCenter';

/**
 * NotificationCenter component for displaying and managing user notifications
 */
const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onFetchNotifications
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Calculate unread count
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const handleOpenNotifications = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    if (onFetchNotifications) {
      onFetchNotifications();
    }
  };

  const handleCloseNotifications = (): void => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification): void => {
    // Mark as read if unread
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    // Navigate to link if exists
    if (notification.link) {
      // Use React Router's navigate function instead of window.location.href
      // This is a placeholder - you'll need to implement this with useNavigate from react-router-dom
      // For now, we'll just log it
      console.log('Would navigate to:', notification.link);
      // TODO: Replace with proper navigation using React Router
    }

    handleCloseNotifications();
  };

  const handleMarkAllAsRead = (): void => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleDelete = (event: MouseEvent, notification: Notification): void => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType): React.ReactNode => {
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
  const formatTimeAgo = (date: string): string => {
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
        <SimpleBox sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </SimpleBox>

        <Divider />

        {loading ? (
          <SimpleBox sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </SimpleBox>
        ) : notifications.length === 0 ? (
          <SimpleBox sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </SimpleBox>
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
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => handleDelete(event, notification)}
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
          <SimpleBox sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <Button size="small" href="/notifications">
              View all notifications
            </Button>
          </SimpleBox>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;
