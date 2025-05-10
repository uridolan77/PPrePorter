import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { LoadingOverlayProps } from '../../types/loadingOverlay';

/**
 * LoadingOverlay component
 * Displays a loading spinner with an optional message
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  loading = true, 
  message = 'Loading...', 
  sx = {},
  size = 40,
  color = 'primary',
  backgroundColor = 'rgba(255, 255, 255, 0.7)',
  zIndex = 1000
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
        backgroundColor,
        zIndex,
        ...sx
      }}
    >
      <CircularProgress size={size} color={color} />
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
