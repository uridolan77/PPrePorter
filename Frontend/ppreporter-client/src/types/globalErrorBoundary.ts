/**
 * Types for GlobalErrorBoundary component
 */
import { ReactNode } from 'react';

/**
 * Error information interface
 */
export interface ErrorInfo {
  /**
   * Component stack trace
   */
  componentStack: string;
}

/**
 * Error state interface
 */
export interface ErrorState {
  /**
   * Error message
   */
  message?: string;
  
  /**
   * Error stack trace
   */
  stack?: string;
  
  /**
   * Any additional error properties
   */
  [key: string]: any;
}

/**
 * GlobalErrorBoundary component props interface
 */
export interface GlobalErrorBoundaryProps {
  /**
   * Children components
   */
  children: ReactNode;
  
  /**
   * Custom fallback UI to display when an error occurs
   */
  fallback?: ReactNode | ((error: ErrorState) => ReactNode);
  
  /**
   * Function to call when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Whether to reset the error state when the component updates
   */
  resetOnUpdate?: boolean;
}

/**
 * GlobalErrorBoundary component state interface
 */
export interface GlobalErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * Error object
   */
  error: ErrorState | null;
  
  /**
   * Error information
   */
  errorInfo: ErrorInfo | null;
}

export default GlobalErrorBoundaryProps;
