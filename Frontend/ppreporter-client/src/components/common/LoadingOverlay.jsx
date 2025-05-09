import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * LoadingOverlay component
 * Displays a loading spinner with an optional message
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether to show the loading overlay
 * @param {string} props.message - Message to display
 * @param {Object} props.sx - Additional styles
 * @returns {React.ReactNode} - Rendered component
 */
const LoadingOverlay = ({ 
  loading = true, 
  message = 'Loading...', 
  sx = {} 
}) => {
  if (!loading) return null;
  
  return (
    <Box 
      sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1000,
        ...sx
      }}
    >
      <CircularProgress size={40} />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingOverlay;
