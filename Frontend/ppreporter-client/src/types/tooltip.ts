/**
 * Types for Tooltip component
 */
import { ReactNode } from 'react';
import { TooltipProps as MuiTooltipProps } from '@mui/material';

/**
 * Position type for tooltip
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 
  'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 
  'left-start' | 'left-end' | 'right-start' | 'right-end';

/**
 * StyledTooltip props interface
 */
export interface StyledTooltipProps extends Omit<MuiTooltipProps, 'title'> {
  /**
   * Maximum width of tooltip
   */
  maxWidth?: number | string;
  
  /**
   * Custom background color
   */
  backgroundColor?: string;
  
  /**
   * Custom text color
   */
  textColor?: string;
  
  /**
   * Whether to show an arrow
   */
  arrow?: boolean;
  
  /**
   * Tooltip content
   */
  title: ReactNode;
  
  /**
   * CSS class name
   */
  className?: string;
}

/**
 * Tooltip component props interface
 */
export interface TooltipProps extends Omit<MuiTooltipProps, 'title' | 'placement'> {
  /**
   * Tooltip content
   */
  title: ReactNode;
  
  /**
   * The element to attach the tooltip to
   */
  children: ReactNode;
  
  /**
   * Tooltip position
   */
  position?: TooltipPosition;
  
  /**
   * Whether to show an arrow
   */
  arrow?: boolean;
  
  /**
   * Maximum width of tooltip
   */
  maxWidth?: number | string;
  
  /**
   * Custom background color
   */
  backgroundColor?: string;
  
  /**
   * Custom text color
   */
  textColor?: string;
  
  /**
   * Optional tooltip header
   */
  header?: ReactNode;
  
  /**
   * Optional tooltip footer
   */
  footer?: ReactNode;
  
  /**
   * Optional icon to display
   */
  icon?: ReactNode;
}

export default TooltipProps;
