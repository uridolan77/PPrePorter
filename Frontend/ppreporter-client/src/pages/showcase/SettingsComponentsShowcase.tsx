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
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Sample component categories
const componentCategories = [
  {
    id: 'userSettings',
    name: 'User Settings',
    components: [
      {
        id: 'profileSettings',
        name: 'Profile Settings',
        description: 'Component for managing user profile settings',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Profile Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component allows users to manage their profile information.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  defaultValue="John Doe"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  defaultValue="john.doe@example.com"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Job Title"
                  defaultValue="Product Manager"
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Company"
                  defaultValue="Acme Inc."
                  margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained">Save Changes</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )
      },
      {
        id: 'accountSettings',
        name: 'Account Settings',
        description: 'Component for managing account settings',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Account Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component allows users to manage their account settings.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable two-factor authentication"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Receive account notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Allow data collection for analytics"
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" color="error" sx={{ mr: 1 }}>
                    Delete Account
                  </Button>
                  <Button variant="contained">Save Changes</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'appSettings',
    name: 'Application Settings',
    components: [
      {
        id: 'appearanceSettings',
        name: 'Appearance Settings',
        description: 'Component for customizing application appearance',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Appearance Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component allows users to customize the application appearance.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Theme</InputLabel>
                  <Select
                    label="Theme"
                    defaultValue="light"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System Default</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Density</InputLabel>
                  <Select
                    label="Density"
                    defaultValue="standard"
                  >
                    <MenuItem value="compact">Compact</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="comfortable">Comfortable</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable animations"
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained">Apply Changes</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )
      },
      {
        id: 'notificationSettings',
        name: 'Notification Settings',
        description: 'Component for managing notification preferences',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Notification Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component allows users to manage their notification preferences.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Push notifications"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="SMS notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="In-app notifications"
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained">Save Preferences</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'advancedSettings',
    name: 'Advanced Settings',
    components: [
      {
        id: 'apiSettings',
        name: 'API Settings',
        description: 'Component for managing API settings and keys',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>API Settings</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component allows users to manage API settings and keys.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  defaultValue="••••••••••••••••••••••••••••••"
                  margin="normal"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable API access"
                />
                <Box sx={{ mt: 2 }}>
                  <Button variant="outlined" sx={{ mr: 1 }}>
                    Regenerate Key
                  </Button>
                  <Button variant="contained">Save Changes</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )
      }
    ]
  }
];

/**
 * Settings Components Showcase
 * Displays all settings components in a categorized list
 */
const SettingsComponentsShowcase: React.FC = () => {
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
          Settings Components
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4 }}>
        This showcase demonstrates the various settings components available in the application.
        Note: These components are for demonstration purposes and do not save any changes.
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

export default SettingsComponentsShowcase;
