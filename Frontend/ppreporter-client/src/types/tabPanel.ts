/**
 * Tab panel types for TypeScript components
 */
import { ReactNode } from 'react';

/**
 * Tab interface
 */
export interface Tab {
  /**
   * Tab ID
   */
  id: string;
  
  /**
   * Tab label
   */
  label: string;
  
  /**
   * Tab content
   */
  content: ReactNode;
  
  /**
   * Tab icon
   */
  icon?: ReactNode;
  
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
  
  /**
   * Tab tooltip
   */
  tooltip?: string;
}

/**
 * Tab panel props interface
 */
export interface TabPanelProps {
  /**
   * Array of tab objects with id, label, content, icon
   */
  tabs: Tab[];
  
  /**
   * ID of the default selected tab
   */
  defaultTab?: string;
  
  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void;
  
  /**
   * Callback when refresh button is clicked
   */
  onRefresh?: () => void;
  
  /**
   * Callback when export button is clicked
   */
  onExport?: () => void;
  
  /**
   * Callback when fullscreen button is clicked
   */
  onFullscreen?: () => void;
  
  /**
   * Whether the panel is in fullscreen mode
   */
  isFullscreen?: boolean;
  
  /**
   * Optional title to display above tabs
   */
  title?: string;
  
  /**
   * Optional subtitle to display below title
   */
  subTitle?: string;
  
  /**
   * Optional help text for the info tooltip
   */
  helpText?: string;
  
  /**
   * Whether to show the control buttons
   */
  showControls?: boolean;
  
  /**
   * Additional CSS styles
   */
  sx?: Record<string, any>;
}

export default TabPanelProps;
