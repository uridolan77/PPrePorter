import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ErrorDisplayProps, ErrorObject } from '../../types/errorDisplay';

/**
 * Error component for displaying user-friendly error messages
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  title = 'Something went wrong', 
  onRetry = null,
  sx,
  showRetry = true,
  retryText = 'Try Again'
}) => {
  let errorMessage = 'An unexpected error occurred. Please try again later.';
  
  // Extract error message from different response formats
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if ((error as ErrorObject)?.statusText) {
    errorMessage = (error as ErrorObject).statusText || '';
  } else if ((error as ErrorObject)?.data?.message) {
    errorMessage = (error as ErrorObject).data?.message || '';
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fff9f9',
        width: '100%',
        ...sx
      }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
      
      <Typography variant="h6" gutterBottom color="error">
        {title}
      </Typography>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {errorMessage}
      </Typography>
      
      {showRetry && onRetry && (
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          {retryText}
        </Button>
      )}
    </Paper>
  );
};

export default ErrorDisplay;
