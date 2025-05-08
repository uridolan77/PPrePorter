// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\containers\DailyActionsReportContainer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

// Import components
import DailyActionsReport from '../components/reports/DailyActionsReport';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Import services and utilities
import dailyActionsService from '../services/api/dailyActionsService';
import { DATE_FORMATS } from '../config/constants';
import { getErrorDisplayDetails } from '../services/api/errorHandler';

// Import actions from our Redux slice
import { 
  fetchDailyActionsData,
  fetchDailyActionsMetadata,
  saveReportConfiguration,
  fetchSavedConfigurations
} from '../store/slices/reportsSlice';

const DailyActionsReportContainer = () => {
  const dispatch = useDispatch();
  
  // Local state
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: moment().subtract(7, 'days').format(DATE_FORMATS.API),
      endDate: moment().format(DATE_FORMATS.API)
    },
    brands: [],
    countries: [],
    gameTypes: [],
    playerTiers: []
  });
  const [error, setError] = useState(null);
  
  // Redux state
  const reportData = useSelector(state => state.reports.dailyActions.data);
  const metadata = useSelector(state => state.reports.dailyActions.metadata);
  const isLoading = useSelector(state => state.reports.dailyActions.loading);
  const reduxError = useSelector(state => state.reports.dailyActions.error);
  
  /**
   * Fetch report metadata (brands, countries, etc.)
   */
  const fetchMetadata = useCallback(async () => {
    try {
      await dispatch(fetchDailyActionsMetadata()).unwrap();
    } catch (error) {
      setError(getErrorDisplayDetails(error));
      console.error('Error fetching metadata:', error);
    }
  }, [dispatch]);
  
  /**
   * Fetch report data based on filters
   */
  const fetchReportData = useCallback(async () => {
    setError(null);
    
    try {
      await dispatch(fetchDailyActionsData(filters)).unwrap();
    } catch (error) {
      setError(getErrorDisplayDetails(error));
    }
  }, [dispatch, filters]);
  
  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };
  
  /**
   * Execute natural language query
   */
  const handleNLQuery = async (query) => {
    setError(null);
    
    try {
      // We'll maintain this service call for NL queries since it's not in our Redux slice
      const data = await dailyActionsService.executeNLQuery(query);
      // Update the local state with the NL query results
      // This is handled separately from the regular report data
    } catch (error) {
      setError(getErrorDisplayDetails(error));
    }
  };
  
  /**
   * Export report data
   */
  const handleExport = async (format) => {
    try {
      // We'll use the service directly for export operations
      const blob = await dailyActionsService.exportReport(filters, format);
      
      // Create download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `daily-actions-report-${moment().format('YYYY-MM-DD')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(getErrorDisplayDetails(error));
    }
  };
  
  /**
   * Save report configuration
   */
  const handleSaveConfig = async (name, description) => {
    try {
      const config = {
        name,
        description,
        filters,
        createdAt: moment().toISOString()
      };
      
      await dispatch(saveReportConfiguration({
        reportType: 'dailyActions',
        config
      })).unwrap();
      
      // Show success notification
    } catch (error) {
      setError(getErrorDisplayDetails(error));
    }
  };
  
  /**
   * Load saved configuration
   */
  const handleLoadConfig = async (configId) => {
    try {
      const configs = await dispatch(fetchSavedConfigurations('dailyActions')).unwrap();
      const config = configs.find(c => c.id === configId);
      
      if (config) {
        setFilters(config.filters);
      }
    } catch (error) {
      setError(getErrorDisplayDetails(error));
    }
  };
  
  /**
   * Drill down to get detailed data
   */
  const handleDrillDown = async (item) => {
    try {
      // We'll continue using the service for drill-down operations
      const detailedData = await dailyActionsService.performDrillDown(filters, item);
      
      // Update state with detailed data
      // This depends on how you want to handle drill-down in your UI
    } catch (error) {
      setError(getErrorDisplayDetails(error));
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);
  
  // Fetch report data when filters change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);
  
  // Update local error state when Redux error changes
  useEffect(() => {
    if (reduxError) {
      setError(getErrorDisplayDetails(reduxError));
    }
  }, [reduxError]);
  
  if (isLoading && !reportData) {
    return <LoadingSpinner />;
  }
  
  if (error && !reportData) {
    return <ErrorMessage 
      message={error.message} 
      details={error.details} 
      onRetry={fetchReportData} 
    />;
  }
  
  return (
    <DailyActionsReport
      data={reportData}
      filters={filters}
      metadata={metadata}
      isLoading={isLoading}
      error={error}
      onFilterChange={handleFilterChange}
      onExport={handleExport}
      onNLQuery={handleNLQuery}
      onSaveConfig={handleSaveConfig}
      onLoadConfig={handleLoadConfig}
      onDrillDown={handleDrillDown}
      onRefresh={fetchReportData}
    />
  );
};

export default DailyActionsReportContainer;