/**
 * Types for EmptyState component
 */
import { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material';

/**
 * EmptyState component props interface
 */
export interface EmptyStateProps {
  /**
   * Message to display
   */
  message?: string;
  
  /**
   * Icon to display
   */
  icon?: ReactNode;
  
  /**
   * Additional styles
   */
  sx?: SxProps<Theme>;
}

export default EmptyStateProps;
