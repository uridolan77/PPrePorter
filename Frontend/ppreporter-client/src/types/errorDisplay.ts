/**
 * Types for ErrorDisplay component
 */
import { SxProps, Theme } from '@mui/material';

/**
 * Error object interface
 */
export interface ErrorObject {
  message?: string;
  statusText?: string;
  data?: {
    message?: string;
  };
  [key: string]: any;
}

/**
 * ErrorDisplay component props interface
 */
export interface ErrorDisplayProps {
  /**
   * Error object or message
   */
  error?: ErrorObject | string | null;
  
  /**
   * Error title
   */
  title?: string;
  
  /**
   * Function to call when retry button is clicked
   */
  onRetry?: (() => void) | null;
  
  /**
   * Additional styles
   */
  sx?: SxProps<Theme>;
  
  /**
   * Whether to show retry button
   */
  showRetry?: boolean;
  
  /**
   * Retry button text
   */
  retryText?: string;
}

export default ErrorDisplayProps;
