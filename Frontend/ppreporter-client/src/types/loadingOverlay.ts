/**
 * Types for LoadingOverlay component
 */
import { SxProps, Theme } from '@mui/material';

/**
 * LoadingOverlay component props interface
 */
export interface LoadingOverlayProps {
  /**
   * Whether to show the loading overlay
   */
  loading?: boolean;
  
  /**
   * Message to display
   */
  message?: string;
  
  /**
   * Additional styles
   */
  sx?: SxProps<Theme>;
  
  /**
   * Size of the loading spinner
   */
  size?: number;
  
  /**
   * Color of the loading spinner
   */
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  
  /**
   * Background color of the overlay
   */
  backgroundColor?: string;
  
  /**
   * Z-index of the overlay
   */
  zIndex?: number;
}

export default LoadingOverlayProps;
