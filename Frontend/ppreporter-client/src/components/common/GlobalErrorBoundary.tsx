import React, { Component, ErrorInfo as ReactErrorInfo } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState,
  ErrorState,
  ErrorInfo
} from '../../types/globalErrorBoundary';

/**
 * GlobalErrorBoundary component
 * A React error boundary that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 */
class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: {
        message: error.message,
        stack: error.stack
      }
    };
  }

  componentDidCatch(error: Error, errorInfo: ReactErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by GlobalErrorBoundary:', error, errorInfo);

    // Convert React's errorInfo to our ErrorInfo type
    const formattedErrorInfo: ErrorInfo = {
      componentStack: errorInfo.componentStack || ''
    };

    this.setState({ errorInfo: formattedErrorInfo });

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, formattedErrorInfo);
    }

    // You could also log the error to an error reporting service here
    // errorService.logError(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReportError = (): void => {
    // Implement error reporting functionality
    alert('Error report sent to development team');
    // In a real app, you would send the error to your error tracking service
    // errorService.reportError(this.state.error, this.state.errorInfo);
  };

  render(): React.ReactNode {
    const { fallback, children } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        if (typeof fallback === 'function' && error) {
          const result = fallback(error);
          return result as React.ReactNode;
        } else {
          return fallback as React.ReactNode;
        }
      }

      // Default fallback UI
      return (
        <Paper
          elevation={3}
          sx={{
            p: 4,
            m: 2,
            maxWidth: 600,
            mx: 'auto',
            textAlign: 'center',
            borderRadius: 2
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error?.message || 'An unexpected error occurred'}
          </Typography>

          {process.env.NODE_ENV !== 'production' && errorInfo && (
            <Box sx={{
              mb: 3,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 1,
              textAlign: 'left',
              overflow: 'auto',
              maxHeight: 200
            }}>
              <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {errorInfo.componentStack}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={this.handleReportError}
            >
              Report Error
            </Button>
          </Box>
        </Paper>
      );
    }

    return children;
  }
}

export default GlobalErrorBoundary;
