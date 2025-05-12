import React from 'react';
import { Box } from '@mui/material';
import './LoadingFallback.css';

// Simple wrapper component to avoid TypeScript complexity
const LoadingContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="loading-fallback">
      {children}
    </div>
  );
};

export default LoadingContainer;
