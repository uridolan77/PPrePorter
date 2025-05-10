import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';

interface AccountSettingsProps {
  user?: any;
  onSave?: (data: any) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * AccountSettings component - Allows users to update their account settings
 * This is a stub component that will be implemented later
 */
const AccountSettings: React.FC<AccountSettingsProps> = ({
  user = {},
  onSave,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    twoFactorEnabled: user.twoFactorEnabled || false,
    emailNotifications: user.emailNotifications || true,
    language: user.language || 'en',
    timezone: user.timezone || 'UTC'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Account Settings
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
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Security
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.twoFactorEnabled}
                  onChange={handleChange}
                  name="twoFactorEnabled"
                  disabled={loading}
                />
              }
              label="Enable Two-Factor Authentication"
            />
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SecurityIcon />}
                disabled={loading}
              >
                Change Password
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Preferences
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                  name="emailNotifications"
                  disabled={loading}
                />
              }
              label="Email Notifications"
            />
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

export default AccountSettings;
