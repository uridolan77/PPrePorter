/**
 * Types for StatCard component
 */
import { ReactNode } from 'react';

/**
 * StatCard component props interface
 */
export interface StatCardProps {
  /**
   * Title of the stat card
   */
  title: string;

  /**
   * Value to display
   */
  value: number | string;

  /**
   * Prefix to display before the value (e.g., currency symbol)
   */
  prefix?: string;

  /**
   * Icon to display in the card
   */
  icon?: ReactNode;

  /**
   * Change value (percentage or absolute)
   */
  change?: number;

  /**
   * Icon to display next to the change value
   */
  changeIcon?: ReactNode;

  /**
   * Text to display for the change (e.g., "10% increase")
   */
  changeText?: string;

  /**
   * Whether the card is in loading state
   */
  isLoading?: boolean;
}

export default StatCardProps;
