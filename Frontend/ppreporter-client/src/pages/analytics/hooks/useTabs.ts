import { useState, useCallback, SyntheticEvent } from 'react';
import { TabDefinition } from '../constants';

interface UseTabsOptions {
  initialTab?: number;
  onTabChange?: (index: number) => void;
  tabs: TabDefinition[];
}

/**
 * Custom hook for managing tabs
 * Handles tab selection and navigation
 * 
 * @param options - Configuration options for the tabs
 * @returns Tab state and handlers
 */
export const useTabs = (options: UseTabsOptions) => {
  const { initialTab = 0, onTabChange, tabs } = options;
  
  // Tab state
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  
  // Handle tab change
  const handleTabChange = useCallback((_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    if (onTabChange) {
      onTabChange(newValue);
    }
  }, [onTabChange]);
  
  // Get the current tab
  const currentTab = tabs[activeTab];
  
  // Navigate to a specific tab
  const navigateToTab = useCallback((index: number) => {
    if (index >= 0 && index < tabs.length) {
      setActiveTab(index);
      
      if (onTabChange) {
        onTabChange(index);
      }
    }
  }, [tabs, onTabChange]);
  
  // Navigate to a tab by ID
  const navigateToTabById = useCallback((id: string) => {
    const index = tabs.findIndex(tab => tab.id === id);
    if (index !== -1) {
      navigateToTab(index);
    }
  }, [tabs, navigateToTab]);
  
  return {
    activeTab,
    currentTab,
    handleTabChange,
    navigateToTab,
    navigateToTabById,
    tabs
  };
};
