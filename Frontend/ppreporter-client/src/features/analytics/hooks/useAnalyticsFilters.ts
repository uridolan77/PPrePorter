import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../store/store';
import { setFilters, resetFilters } from '../store/slice';
import { selectFilters } from '../store/selectors';
import { FilterOptions } from '../types';

/**
 * Custom hook for managing analytics filters
 * 
 * @returns Filter state and handlers
 */
export const useAnalyticsFilters = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get filters from Redux store
  const filters = useSelector(selectFilters);
  
  /**
   * Update filters
   * 
   * @param newFilters - New filter values to apply
   */
  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);
  
  /**
   * Reset filters to default values
   */
  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);
  
  /**
   * Set date range
   * 
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   */
  const setDateRange = useCallback((startDate: string, endDate: string) => {
    dispatch(setFilters({ startDate, endDate }));
  }, [dispatch]);
  
  /**
   * Set country filter
   * 
   * @param country - Country to filter by
   */
  const setCountry = useCallback((country: string | null) => {
    dispatch(setFilters({ country }));
  }, [dispatch]);
  
  /**
   * Set game category filter
   * 
   * @param gameCategory - Game category to filter by
   */
  const setGameCategory = useCallback((gameCategory: string | null) => {
    dispatch(setFilters({ gameCategory }));
  }, [dispatch]);
  
  /**
   * Set player status filter
   * 
   * @param playerStatus - Player status to filter by
   */
  const setPlayerStatus = useCallback((playerStatus: string | null) => {
    dispatch(setFilters({ playerStatus }));
  }, [dispatch]);
  
  return {
    // State
    filters,
    
    // Actions
    updateFilters,
    clearFilters,
    setDateRange,
    setCountry,
    setGameCategory,
    setPlayerStatus
  };
};
