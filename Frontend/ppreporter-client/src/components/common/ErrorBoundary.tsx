import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ErrorBoundaryProps, ErrorBoundaryState, ErrorState } from '../../types/common';
import SimpleBox from './SimpleBox';

/**
 * ErrorBoundary component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: {
        message: error.message,
        stack: error.stack
      }
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { fallback, children } = this.props;
    const { hasError, error } = this.state;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        if (typeof fallback === 'function' && error) {
          const result = fallback(error);
          return result as ReactNode;
        } else {
          return fallback as ReactNode;
        }
      }

      // Default fallback UI
      return (
        <SimpleBox sx={{ p: 3, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
          >
            Try Again
          </Button>
        </SimpleBox>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
