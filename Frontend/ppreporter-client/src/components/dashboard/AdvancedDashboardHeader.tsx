import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { CommonProps } from '../../types/common';

/**
 * Props for the AdvancedDashboardHeader component
 */
export interface AdvancedDashboardHeaderProps extends CommonProps {
  /**
   * Last updated timestamp
   */
  lastUpdated: Date;
  
  /**
   * Function to handle refresh
   */
  onRefresh?: () => void;
  
  /**
   * Function to handle view change
   */
  onViewChange?: () => void;
  
  /**
   * Whether advanced view mode is enabled
   */
  advancedViewMode?: boolean;
}

/**
 * Advanced Dashboard Header Component
 * Contains title, last updated timestamp, and action buttons
 */
const AdvancedDashboardHeader: React.FC<AdvancedDashboardHeaderProps> = ({
  lastUpdated,
  onRefresh,
  onViewChange,
  advancedViewMode = false,
  sx
}) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        ...sx
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Today's Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="Refresh data">
          <IconButton 
            onClick={onRefresh}
            color="primary"
            aria-label="Refresh dashboard data"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={advancedViewMode ? "Switch to standard view" : "Switch to advanced view"}>
          <IconButton
            onClick={onViewChange}
            color="primary"
            aria-label="Toggle view mode"
          >
            {advancedViewMode ? <ViewListIcon /> : <ViewModuleIcon />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default AdvancedDashboardHeader;
