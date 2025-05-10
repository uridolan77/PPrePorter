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
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface IntegrationSettingsProps {
  integrations?: any[];
  onConnect?: (integration: string, credentials: any) => void;
  onDisconnect?: (integrationId: string) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * IntegrationSettings component - Allows users to manage third-party integrations
 * This is a stub component that will be implemented later
 */
const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  integrations = [],
  onConnect,
  onDisconnect,
  loading = false,
  error = null
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    username: '',
    password: ''
  });

  const handleOpenDialog = (integration: string) => {
    setSelectedIntegration(integration);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIntegration(null);
    setCredentials({
      apiKey: '',
      apiSecret: '',
      username: '',
      password: ''
    });
  };

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConnect = () => {
    if (onConnect && selectedIntegration) {
      onConnect(selectedIntegration, credentials);
      handleCloseDialog();
    }
  };

  const handleDisconnect = (integrationId: string) => {
    if (onDisconnect) {
      onDisconnect(integrationId);
    }
  };

  // Mock integrations
  const mockIntegrations = [
    { 
      id: 'google-analytics', 
      name: 'Google Analytics', 
      description: 'Connect to Google Analytics to import website traffic data',
      logo: 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg',
      connected: true,
      status: 'active',
      lastSync: '2 hours ago'
    },
    { 
      id: 'salesforce', 
      name: 'Salesforce', 
      description: 'Connect to Salesforce to sync customer and sales data',
      logo: 'https://www.salesforce.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg',
      connected: false,
      status: 'disconnected',
      lastSync: 'Never'
    },
    { 
      id: 'slack', 
      name: 'Slack', 
      description: 'Connect to Slack to receive notifications and reports',
      logo: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
      connected: true,
      status: 'error',
      lastSync: '3 days ago'
    },
    { 
      id: 'mailchimp', 
      name: 'Mailchimp', 
      description: 'Connect to Mailchimp to sync email campaign data',
      logo: 'https://mailchimp.com/release/plums/cxp/images/freddie.8d2a1cadea.svg',
      connected: false,
      status: 'disconnected',
      lastSync: 'Never'
    }
  ];

  const availableIntegrations = integrations.length > 0 ? integrations : mockIntegrations;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Integration Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This is a stub component that will be implemented later.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {availableIntegrations.map(integration => (
            <Grid item xs={12} sm={6} md={4} key={integration.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      component="img" 
                      src={integration.logo} 
                      alt={integration.name}
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                    <Typography variant="h6">{integration.name}</Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {integration.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      Status:
                    </Typography>
                    <Chip 
                      size="small"
                      label={integration.status === 'active' ? 'Connected' : 
                             integration.status === 'error' ? 'Error' : 'Disconnected'}
                      color={integration.status === 'active' ? 'success' : 
                             integration.status === 'error' ? 'error' : 'default'}
                      icon={integration.status === 'active' ? <CheckCircleIcon /> : 
                            integration.status === 'error' ? <ErrorIcon /> : undefined}
                    />
                  </Box>
                  
                  {integration.connected && (
                    <Typography variant="body2" color="text.secondary">
                      Last sync: {integration.lastSync}
                    </Typography>
                  )}
                </CardContent>
                
                <CardActions>
                  {integration.connected ? (
                    <>
                      <Button 
                        size="small" 
                        startIcon={<SaveIcon />}
                        disabled={loading}
                      >
                        Sync Now
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => handleDisconnect(integration.id)}
                        disabled={loading}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="small" 
                      startIcon={<LinkIcon />}
                      onClick={() => handleOpenDialog(integration.id)}
                      disabled={loading}
                    >
                      Connect
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Connection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Connect to {selectedIntegration && availableIntegrations.find(i => i.id === selectedIntegration)?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter your credentials to connect to this service.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key"
                  name="apiKey"
                  value={credentials.apiKey}
                  onChange={handleCredentialChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Secret"
                  name="apiSecret"
                  type="password"
                  value={credentials.apiSecret}
                  onChange={handleCredentialChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleConnect} 
            variant="contained" 
            disabled={!credentials.apiKey || !credentials.apiSecret}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default IntegrationSettings;
