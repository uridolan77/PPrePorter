import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Paper, Typography, styled } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;
  
  /**
   * Custom fallback UI to display when an error occurs
   */
  fallback?: ReactNode;
  
  /**
   * Callback to run when the error boundary is reset
   */
  onReset?: () => void;
}

interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * The error that occurred
   */
  error: Error | null;
}

const ErrorContainer = styled(Paper)(({ theme }) => ({
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: '8px',
  margin: '16px 0',
}));

const ErrorIcon = styled(ErrorOutlineIcon)(({ theme }) => ({
  fontSize: 48,
  color: theme.palette.error.main,
  marginBottom: '16px',
}));

/**
 * ErrorBoundary component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when an error occurs
   * 
   * @param error - The error that occurred
   * @returns New state
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error information when an error occurs
   * 
   * @param error - The error that occurred
   * @param errorInfo - Additional error information
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  /**
   * Reset the error state and call the onReset callback
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Render default fallback UI
      return (
        <ErrorContainer>
          <ErrorIcon />
          <Typography variant="h6" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={this.handleReset}
          >
            Try Again
          </Button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
