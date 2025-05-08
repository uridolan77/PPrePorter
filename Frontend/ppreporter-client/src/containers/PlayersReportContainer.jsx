// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\containers\PlayersReportContainer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';

// Import components
import PlayersReport from '../components/reports/PlayersReport';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Import services and utilities
import playersService from '../services/api/playersService';
import { DATE_FORMATS } from '../config/constants';
import { getErrorDisplayDetails } from '../services/api/errorHandler';

// Import actions from Redux slice
import { 
  fetchPlayersData,
  fetchPlayersMetadata,
  fetchPlayerDetails,
  setSelectedPlayer,
  clearSelectedPlayer,
  saveReportConfiguration,
  fetchSavedConfigurations
} from '../store/slices/reportsSlice';

const PlayersReportContainer = () => {
  const dispatch = useDispatch();
  
  // Local state
  const [filters, setFilters] = useState({
    dateRange: {
      startDate: moment().subtract(30, 'days').format(DATE_FORMATS.API),
      endDate: moment().format(DATE_FORMATS.API)
    },
    searchTerm: '',
    countries: [],
    statuses: [],
    playerTypes: []
  });
  const [error, setError] = useState(null);
  
  // Redux state
  const reportData = useSelector(state => state.reports.players.data);
  const metadata = useSelector(state => state.reports.players.metadata);
  const isLoading = useSelector(state => state.reports.players.loading);
  const reduxError = useSelector(state => state.reports.players.error);
  const selectedPlayer = useSelector(state => state.reports.players.selectedPlayer);
  const playerDetails = useSelector(state => state.reports.players.playerDetails);
  
  /**
   * Fetch report metadata (countries, statuses, etc.)
   */
  const fetchMetadata = useCallback(async () => {
    try {
      await dispatch(fetchPlayersMetadata()).unwrap();
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
      await dispatch(fetchPlayersData(filters)).unwrap();
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
   * Handle player selection
   */
  const handlePlayerSelect = async (player) => {
    try {
      dispatch(setSelectedPlayer(player));
      await dispatch(fetchPlayerDetails(player.id)).unwrap();
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
      const blob = await playersService.exportReport(filters, format);
      
      // Create download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `players-report-${moment().format('YYYY-MM-DD')}.${format}`;
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
        reportType: 'players',
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
      const configs = await dispatch(fetchSavedConfigurations('players')).unwrap();
      const config = configs.find(c => c.id === configId);
      
      if (config) {
        setFilters(config.filters);
      }
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
  
  // Clean up selected player on unmount
  useEffect(() => {
    return () => {
      dispatch(clearSelectedPlayer());
    };
  }, [dispatch]);
  
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
    <PlayersReport
      data={reportData}
      filters={filters}
      metadata={metadata}
      isLoading={isLoading}
      error={error}
      selectedPlayer={selectedPlayer}
      playerDetails={playerDetails}
      detailsLoading={isLoading}
      onFilterChange={handleFilterChange}
      onPlayerSelect={handlePlayerSelect}
      onExport={handleExport}
      onSaveConfig={handleSaveConfig}
      onLoadConfig={handleLoadConfig}
      onRefresh={fetchReportData}
    />
  );
};

export default PlayersReportContainer;