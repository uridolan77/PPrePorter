import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import BrushIcon from '@mui/icons-material/Brush';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface AppearanceSettingsProps {
  settings?: any;
  onSave?: (data: any) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * AppearanceSettings component - Allows users to customize the UI appearance
 * This is a stub component that will be implemented later
 */
const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  settings = {},
  onSave,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    theme: settings.theme || 'light',
    primaryColor: settings.primaryColor || 'blue',
    fontSize: settings.fontSize || 'medium',
    density: settings.density || 'comfortable',
    animations: settings.animations !== false,
    sidebarCollapsed: settings.sidebarCollapsed || false,
    language: settings.language || 'en'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
        Appearance Settings
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
            <FormControl component="fieldset">
              <FormLabel component="legend">Theme</FormLabel>
              <RadioGroup
                row
                name="theme"
                value={formData.theme}
                onChange={handleChange}
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                <FormControlLabel value="system" control={<Radio />} label="System Default" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              <BrushIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Color & Style
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="primary-color-label">Primary Color</InputLabel>
              <Select
                labelId="primary-color-label"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleSelectChange}
                label="Primary Color"
                disabled={loading}
              >
                <MenuItem value="blue">Blue</MenuItem>
                <MenuItem value="purple">Purple</MenuItem>
                <MenuItem value="green">Green</MenuItem>
                <MenuItem value="orange">Orange</MenuItem>
                <MenuItem value="red">Red</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="density-label">UI Density</InputLabel>
              <Select
                labelId="density-label"
                name="density"
                value={formData.density}
                onChange={handleSelectChange}
                label="UI Density"
                disabled={loading}
              >
                <MenuItem value="comfortable">Comfortable</MenuItem>
                <MenuItem value="compact">Compact</MenuItem>
                <MenuItem value="spacious">Spacious</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              <FormatSizeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Text & Accessibility
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="font-size-label">Font Size</InputLabel>
              <Select
                labelId="font-size-label"
                name="fontSize"
                value={formData.fontSize}
                onChange={handleSelectChange}
                label="Font Size"
                disabled={loading}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.animations}
                  onChange={handleChange}
                  name="animations"
                  disabled={loading}
                />
              }
              label="Enable Animations"
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

export default AppearanceSettings;
