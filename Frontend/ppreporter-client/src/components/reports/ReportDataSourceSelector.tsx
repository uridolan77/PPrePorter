import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import StorageIcon from '@mui/icons-material/Storage';
import BarChartIcon from '@mui/icons-material/BarChart';
import { CommonProps } from '../../types/common';

// Type definitions
export interface DataSource {
  id: string;
  name: string;
  type: string;
  description?: string;
  tags?: string[];
  schema?: any[];
}

export interface ReportDataSourceSelectorProps extends CommonProps {
  selected?: DataSource | null;
  availableDataSources?: DataSource[];
  onChange?: (source: DataSource) => void;
  name?: string;
  description?: string;
  onNameChange?: (name: string) => void;
  onDescriptionChange?: (description: string) => void;
}

/**
 * Component for selecting a data source for a report and configuring basic report information
 */
const ReportDataSourceSelector: React.FC<ReportDataSourceSelectorProps> = ({
  selected,
  availableDataSources = [],
  onChange,
  name = '',
  description = '',
  onNameChange,
  onDescriptionChange
}) => {
  // Function to get icon based on source type
  const getSourceIcon = (type?: string): React.ReactNode => {
    switch (type?.toLowerCase()) {
      case 'database':
        return <StorageIcon fontSize="large" />;
      case 'api':
        return <TableChartIcon fontSize="large" />;
      case 'analytics':
        return <BarChartIcon fontSize="large" />;
      default:
        return <TableChartIcon fontSize="large" />;
    }
  };

  // Handle data source selection
  const handleSourceSelect = (source: DataSource): void => {
    if (onChange) {
      onChange(source);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Report Information
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Report Name"
            fullWidth
            value={name}
            onChange={(e) => onNameChange && onNameChange(e.target.value)}
            required
            placeholder="Enter a name for your report"
            helperText="This name will be displayed in the reports list"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Description"
            fullWidth
            value={description}
            onChange={(e) => onDescriptionChange && onDescriptionChange(e.target.value)}
            multiline
            rows={1}
            placeholder="Describe the purpose of this report"
            helperText="Optional brief description"
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Select Data Source
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the data source that contains the information you want to include in your report.
      </Typography>
      
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {availableDataSources.map((source) => (
          <Grid item xs={12} sm={6} md={4} key={source.id}>
            <Card 
              variant={selected?.id === source.id ? 'elevation' : 'outlined'} 
              elevation={selected?.id === source.id ? 3 : 0}
              sx={{
                borderColor: selected?.id === source.id ? 'primary.main' : 'divider',
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleSourceSelect(source)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: selected?.id === source.id ? 'primary.main' : 'action.selected',
                        mr: 2
                      }}
                    >
                      {getSourceIcon(source.type)}
                    </Avatar>
                    <Typography variant="h6" component="div">
                      {source.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {source.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={source.type} 
                      size="small" 
                      color={selected?.id === source.id ? 'primary' : 'default'}
                    />
                    {source.tags?.map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {availableDataSources.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No data sources available. Please contact your administrator.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ReportDataSourceSelector;
