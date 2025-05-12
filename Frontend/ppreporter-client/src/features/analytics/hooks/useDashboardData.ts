import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { 
  fetchAllDashboardData,
  fetchDashboardSummary,
  fetchRecentTransactions
} from '../store/slice';
import {
  selectSummaryStats,
  selectRecentTransactions,
  selectIsLoading,
  selectError,
  selectFormattedLastUpdated
} from '../store/selectors';

/**
 * Custom hook for managing dashboard data
 * Handles loading, refreshing, and accessing dashboard data
 * 
 * @returns Dashboard data, loading state, error state, and utility functions
 */
export const useDashboardData = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Select data from Redux store
  const summaryStats = useSelector(selectSummaryStats);
  const recentTransactions = useSelector(selectRecentTransactions);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const formattedLastUpdated = useSelector(selectFormattedLastUpdated);
  
  /**
   * Load all dashboard data
   */
  const loadAllData = useCallback(() => {
    dispatch(fetchAllDashboardData());
  }, [dispatch]);
  
  /**
   * Load dashboard summary data
   */
  const loadSummaryData = useCallback(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);
  
  /**
   * Load recent transactions data
   */
  const loadTransactionsData = useCallback(() => {
    dispatch(fetchRecentTransactions());
  }, [dispatch]);
  
  /**
   * Refresh all dashboard data
   */
  const refreshData = useCallback(() => {
    loadAllData();
  }, [loadAllData]);
  
  return {
    // Data
    summaryStats,
    recentTransactions,
    
    // State
    isLoading,
    error,
    formattedLastUpdated,
    
    // Actions
    loadAllData,
    loadSummaryData,
    loadTransactionsData,
    refreshData
  };
};
