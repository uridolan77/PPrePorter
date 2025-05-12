import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import {
  fetchDashboardSummary,
  fetchRevenueChart,
  fetchTopGames,
  fetchRecentTransactions
} from '../../../store/slices/dashboardSlice';
import {
  selectSummaryStats,
  selectRecentTransactions,
  selectDashboardLoading,
  selectDashboardError
} from '../../../store/selectors';
import { DATE_FORMAT_OPTIONS } from '../constants';

/**
 * Custom hook for managing dashboard data
 * Handles loading, refreshing, and formatting dashboard data
 * 
 * @returns Dashboard data, loading state, error state, and utility functions
 */
export const useDashboardData = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const summaryStats = useSelector(selectSummaryStats);
  const recentTransactions = useSelector(selectRecentTransactions);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  
  // Local state
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Function to load all dashboard data
  const loadDashboardData = useCallback(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchRevenueChart());
    dispatch(fetchTopGames());
    dispatch(fetchRecentTransactions());
    
    setLastUpdated(new Date());
  }, [dispatch]);
  
  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated.toLocaleTimeString(undefined, DATE_FORMAT_OPTIONS);
  
  return {
    // Data
    summaryStats,
    recentTransactions,
    
    // State
    isLoading,
    error,
    lastUpdated,
    formattedLastUpdated,
    
    // Actions
    loadDashboardData,
    refreshData: loadDashboardData
  };
};
