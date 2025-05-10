import React from 'react';
import { Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { EmptyStateProps } from '../../types/common';

/**
 * EmptyState component
 * Displays a message when no data is available
 */
const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No data available', 
  icon = <InfoIcon sx={{ fontSize: 48, color: 'text.secondary' }} />,
  action,
  description,
  sx = {}
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 4,
        ...sx
      }}
    >
      {icon}
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ mt: 2, textAlign: 'center' }}
      >
        {message}
      </Typography>
      
      {description && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 1, textAlign: 'center' }}
        >
          {description}
        </Typography>
      )}
      
      {action && (
        <Box sx={{ mt: 2 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
