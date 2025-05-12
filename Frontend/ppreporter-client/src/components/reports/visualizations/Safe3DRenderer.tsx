import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface Safe3DRendererProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  height?: number;
}

/**
 * Safe3DRenderer component
 * Safely renders 3D components with error handling
 */
const Safe3DRenderer: React.FC<Safe3DRendererProps> = ({
  fallback,
  children,
  height = 400
}) => {
  const [hasError, setHasError] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

      if (!gl) {
        setIsSupported(false);
      }
    } catch (e) {
      setIsSupported(false);
    }
  }, []);

  // If WebGL is not supported, show a message
  if (!isSupported) {
    return (
      <Paper style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="text.secondary">
          3D visualizations are not supported in your browser. Please try a different browser or device.
        </Typography>
      </Paper>
    );
  }

  // If there was an error rendering the 3D component, show the fallback
  if (hasError) {
    return (
      <Paper style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {fallback || (
          <Typography color="text.secondary">
            Unable to render 3D visualization. Please try again later.
          </Typography>
        )}
      </Paper>
    );
  }

  // Try to render the 3D component
  try {
    return (
      <div style={{ height }}>
        {children}
      </div>
    );
  } catch (error) {
    console.error('Error rendering 3D component:', error);
    setHasError(true);

    return (
      <Paper style={{ height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {fallback || (
          <Typography color="text.secondary">
            Unable to render 3D visualization. Please try again later.
          </Typography>
        )}
      </Paper>
    );
  }
};

export default Safe3DRenderer;
