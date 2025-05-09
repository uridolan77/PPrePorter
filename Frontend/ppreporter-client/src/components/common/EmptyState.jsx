import React from 'react';
import { Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

/**
 * EmptyState component
 * Displays a message when no data is available
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {Object} props.sx - Additional styles
 * @returns {React.ReactNode} - Rendered component
 */
const EmptyState = ({ 
  message = 'No data available', 
  icon = <InfoIcon sx={{ fontSize: 48, color: 'text.secondary' }} />,
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
    </Box>
  );
};

export default EmptyState;
