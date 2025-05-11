import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Button,
  Alert,
  AlertTitle,
  Snackbar,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import notification components
import NotificationCenter from '../../components/notification/NotificationCenter';

// Import notification types
import { Notification, NotificationType } from '../../types/notificationCenter';

// Mock notifications for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Report Available',
    message: 'Daily activity report for May 15 is now available.',
    type: 'info' as NotificationType,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    isRead: false,
    link: '/reports/daily-activity'
  },
  {
    id: '2',
    title: 'System Update',
    message: 'The system will be updated tonight at 2:00 AM. Please save your work.',
    type: 'warning' as NotificationType,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    isRead: true,
    link: '/announcements/system-update'
  },
  {
    id: '3',
    title: 'Error Processing Report',
    message: 'There was an error processing your monthly revenue report.',
    type: 'error' as NotificationType,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
    link: '/reports/monthly-revenue'
  }
];

// Sample component categories
const componentCategories = [
  {
    id: 'notifications',
    name: 'Notification Components',
    components: [
      {
        id: 'notificationCenter',
        name: 'Notification Center',
        description: 'Component for displaying and managing user notifications',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Notification Center</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component displays a notification center with a badge showing unread notifications.
              Click the icon to see the notifications.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <NotificationCenter
                notifications={mockNotifications}
                onMarkAsRead={(id) => console.log('Mark as read:', id)}
                onMarkAllAsRead={() => console.log('Mark all as read')}
                onDelete={(id) => console.log('Delete notification:', id)}
                onFetchNotifications={() => console.log('Fetch notifications')}
              />
            </Box>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'alerts',
    name: 'Alert Components',
    components: [
      {
        id: 'alertVariants',
        name: 'Alert Variants',
        description: 'Different types of alert components',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Alert Variants</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These components display different types of alerts for various scenarios.
            </Typography>
            <Stack spacing={2}>
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                This is an error alert — <strong>check it out!</strong>
              </Alert>
              <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                This is a warning alert — <strong>check it out!</strong>
              </Alert>
              <Alert severity="info">
                <AlertTitle>Info</AlertTitle>
                This is an info alert — <strong>check it out!</strong>
              </Alert>
              <Alert severity="success">
                <AlertTitle>Success</AlertTitle>
                This is a success alert — <strong>check it out!</strong>
              </Alert>
            </Stack>
          </Paper>
        )
      },
      {
        id: 'snackbars',
        name: 'Snackbars',
        description: 'Temporary notification components',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Snackbars</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These components display temporary notifications at the bottom of the screen.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => console.log('Show success snackbar')}
              >
                Show Success
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => console.log('Show error snackbar')}
              >
                Show Error
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => console.log('Show warning snackbar')}
              >
                Show Warning
              </Button>
            </Box>
            {/* Example of a snackbar (would be controlled by state in a real component) */}
            <Snackbar
              open={false}
              autoHideDuration={6000}
              message="This is a snackbar message"
            />
          </Paper>
        )
      }
    ]
  },
  {
    id: 'toast',
    name: 'Toast Notifications',
    components: [
      {
        id: 'toastNotifications',
        name: 'Toast Notifications',
        description: 'Temporary notifications that appear in the corner of the screen',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Toast Notifications</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These components display temporary notifications in the corner of the screen.
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">Toast Notifications Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  }
];

/**
 * Notification Components Showcase
 * Displays all notification components in a categorized list
 */
const NotificationComponentsShowcase: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button
          component={RouterLink}
          to="/showcase"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Showcase
        </Button>
        <Typography variant="h4" component="h1">
          Notification Components
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4 }}>
        This showcase demonstrates the various notification components available in the application.
        Note: Some components are currently displayed as placeholders.
      </Typography>

      {componentCategories.map((category) => (
        <Box key={category.id} sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {category.name}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <List>
            {category.components.map((component) => (
              <ListItem key={component.id} sx={{ display: 'block', mb: 4 }}>
                <ListItemButton
                  component="div"
                  disableRipple
                  sx={{ display: 'block', p: 0, cursor: 'default' }}
                >
                  <ListItemText
                    primary={component.name}
                    secondary={component.description}
                    primaryTypographyProps={{ variant: 'h6' }}
                    sx={{ mb: 2 }}
                  />
                  {component.component}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Container>
  );
};

export default NotificationComponentsShowcase;
