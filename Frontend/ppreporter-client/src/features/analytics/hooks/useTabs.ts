import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { setActiveTab } from '../store/slice';
import { selectActiveTab } from '../store/selectors';
import { AnalyticsTab } from '../types';

interface UseTabsOptions {
  /**
   * List of tab definitions
   */
  tabs: AnalyticsTab[];

  /**
   * Initial tab index to select
   */
  initialTab?: number;

  /**
   * Callback to run when a tab is changed
   */
  onTabChange?: (index: number) => void;
}

/**
 * Custom hook for managing tabs in the analytics feature
 *
 * @param options - Configuration options for the tabs
 * @returns Tab state and handlers
 */
export const useTabs = (options: UseTabsOptions) => {
  const { tabs, onTabChange } = options;
  const dispatch = useDispatch<AppDispatch>();

  // Get active tab from Redux store
  const activeTab = useSelector(selectActiveTab);

  /**
   * Handle tab change
   *
   * @param _event - React synthetic event
   * @param newValue - New tab index
   */
  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    dispatch(setActiveTab(newValue));

    if (onTabChange) {
      onTabChange(newValue);
    }
  }, [dispatch, onTabChange]);

  /**
   * Get the current tab definition
   */
  const currentTab = tabs[activeTab];

  /**
   * Navigate to a specific tab by index
   *
   * @param index - Tab index to navigate to
   */
  const navigateToTab = useCallback((index: number) => {
    if (index >= 0 && index < tabs.length) {
      dispatch(setActiveTab(index));

      if (onTabChange) {
        onTabChange(index);
      }
    }
  }, [dispatch, tabs, onTabChange]);

  /**
   * Navigate to a tab by ID
   *
   * @param id - Tab ID to navigate to
   */
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
