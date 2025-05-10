import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface NotificationSettingsProps {
  user?: any;
  onSave?: (data: any) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * NotificationSettings component - Allows users to update their notification preferences
 * This is a stub component that will be implemented later
 */
const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  user = {},
  onSave,
  loading = false,
  error = null
}) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    reportGenerated: true,
    dataUpdated: true,
    systemAlerts: true,
    marketingMessages: false,
    dailyDigest: true,
    weeklyReport: true
  });

  const handleToggle = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [name]: event.target.checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(settings);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Notification Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This is a stub component that will be implemented later.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Notification Channels
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive notifications via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.emailNotifications}
                    onChange={handleToggle('emailNotifications')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Receive notifications in your browser"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.pushNotifications}
                    onChange={handleToggle('pushNotifications')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="SMS Notifications" 
                  secondary="Receive notifications via text message"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.smsNotifications}
                    onChange={handleToggle('smsNotifications')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Notification Types
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Report Generated" 
                  secondary="When a scheduled report is generated"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.reportGenerated}
                    onChange={handleToggle('reportGenerated')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Data Updated" 
                  secondary="When new data is available"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.dataUpdated}
                    onChange={handleToggle('dataUpdated')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="System Alerts" 
                  secondary="Important system notifications"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={settings.systemAlerts}
                    onChange={handleToggle('systemAlerts')}
                    disabled={loading}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default NotificationSettings;
