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
  CircularProgress,
  IconButton,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ApiSettingsProps {
  apiKeys?: any[];
  onGenerateKey?: (data: any) => void;
  onRevokeKey?: (keyId: string) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * ApiSettings component - Allows users to manage API keys and settings
 * This is a stub component that will be implemented later
 */
const ApiSettings: React.FC<ApiSettingsProps> = ({
  apiKeys = [],
  onGenerateKey,
  onRevokeKey,
  loading = false,
  error = null
}) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiration, setNewKeyExpiration] = useState('30');

  const handleToggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    // Would show a snackbar in a real implementation
  };

  const handleGenerateKey = () => {
    if (onGenerateKey) {
      onGenerateKey({
        name: newKeyName,
        expiration: parseInt(newKeyExpiration, 10)
      });
      setNewKeyName('');
    }
  };

  const handleRevokeKey = (keyId: string) => {
    if (onRevokeKey) {
      onRevokeKey(keyId);
    }
  };

  // Mock API keys
  const mockApiKeys = [
    { id: '1', name: 'Development Key', key: 'api_dev_1234567890abcdef', created: '2023-01-15', expires: '2024-01-15', lastUsed: '2023-05-10' },
    { id: '2', name: 'Production Key', key: 'api_prod_0987654321fedcba', created: '2023-02-20', expires: '2024-02-20', lastUsed: '2023-05-12' }
  ];

  const keys = apiKeys.length > 0 ? apiKeys : mockApiKeys;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Settings
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
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              API Keys
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Key</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Last Used</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {keys.map(apiKey => (
                    <TableRow key={apiKey.id}>
                      <TableCell>{apiKey.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••'}
                          </Typography>
                          <IconButton size="small" onClick={() => handleToggleKeyVisibility(apiKey.id)}>
                            {showKeys[apiKey.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                          <IconButton size="small" onClick={() => handleCopyKey(apiKey.key)}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>{apiKey.created}</TableCell>
                      <TableCell>{apiKey.expires}</TableCell>
                      <TableCell>{apiKey.lastUsed}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleRevokeKey(apiKey.id)}
                          disabled={loading}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Generate New API Key
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Key Name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Development Key"
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expiration (days)"
                  type="number"
                  value={newKeyExpiration}
                  onChange={(e) => setNewKeyExpiration(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                  onClick={handleGenerateKey}
                  disabled={loading || !newKeyName}
                >
                  Generate New API Key
                </Button>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              API Rate Limits
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              Current rate limit: 100 requests per minute
            </Typography>
            
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              Request Rate Limit Increase
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ApiSettings;
