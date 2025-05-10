/**
 * Types for Breadcrumbs component
 */
import { ReactNode } from 'react';

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /**
   * Display name for the breadcrumb
   */
  name: string;
  
  /**
   * Path to navigate to when clicked (null for current/last item)
   */
  path: string | null;
  
  /**
   * Optional icon to display before the name
   */
  icon?: ReactNode;
}

/**
 * Route mapping type
 */
export type RouteMapping = Record<string, string>;

/**
 * Breadcrumbs component props interface
 */
export interface BreadcrumbsProps {
  /**
   * Array of breadcrumb items (optional if autoGenerate is true)
   */
  items?: BreadcrumbItem[];
  
  /**
   * Whether to automatically generate breadcrumbs from the current route
   */
  autoGenerate?: boolean;
  
  /**
   * Mapping of route paths to readable names (for autoGenerate mode)
   */
  routeMapping?: RouteMapping;
}

export default BreadcrumbsProps;
