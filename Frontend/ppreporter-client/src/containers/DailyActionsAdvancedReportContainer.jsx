import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import DailyActionsAdvancedReport from '../components/reports/DailyActionsAdvancedReport';
import dailyActionsService from '../services/api/dailyActionsService';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

/**
 * Container component for DailyActionsAdvancedReport
 * Handles API calls and data management
 */
const DailyActionsAdvancedReportContainer = () => {
  // State
  const [metadata, setMetadata] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState(null);

  const navigate = useNavigate();

  // Load metadata on mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch metadata for filters
  const fetchMetadata = async () => {
    try {
      setMetadataLoading(true);
      setMetadataError(null);
      const response = await dailyActionsService.getMetadata();
      setMetadata(response);
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setMetadataError(err.message || 'Failed to load filter options');
    } finally {
      setMetadataLoading(false);
    }
  };

  // Fetch report data based on filters
  const fetchData = async (filters) => {
    try {
      setLoading(true);
      setError(null);

      // Convert dates to ISO strings
      const apiFilters = {
        ...filters,
        startDate: filters.startDate ? format(new Date(filters.startDate), 'yyyy-MM-dd') : null,
        endDate: filters.endDate ? format(new Date(filters.endDate), 'yyyy-MM-dd') : null
      };

      const response = await dailyActionsService.getFilteredData(apiFilters);
      setData(response);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    // This function can be used to update local state if needed
    // For now, we'll just use it to log the filters
    console.log('Filters changed:', filters);
  };

  // Handle export
  const handleExport = async (filters, exportFormat) => {
    try {
      setLoading(true);

      // Convert dates to ISO strings
      const apiFilters = {
        ...filters,
        startDate: filters.startDate ? format(new Date(filters.startDate), 'yyyy-MM-dd') : null,
        endDate: filters.endDate ? format(new Date(filters.endDate), 'yyyy-MM-dd') : null
      };

      const blob = await dailyActionsService.exportFilteredReport(apiFilters, exportFormat);
      const fileName = `daily-actions-report-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err.message || 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching metadata
  if (metadataLoading && !metadata) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Show error if metadata fetch failed
  if (metadataError && !metadata) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            {metadataError}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Please try refreshing the page or contact support if the problem persists.
              </Typography>
            </Box>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <DailyActionsAdvancedReport
          metadata={metadata}
          data={data}
          loading={loading}
          error={error}
          onFilterChange={handleFilterChange}
          onRefresh={fetchData}
          onExport={handleExport}
        />
      </Box>
    </Container>
  );
};

export default DailyActionsAdvancedReportContainer;
