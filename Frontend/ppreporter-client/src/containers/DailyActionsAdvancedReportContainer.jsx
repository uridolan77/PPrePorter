import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import DailyActionsAdvancedReport from '../components/reports/DailyActionsAdvancedReport';
import dailyActionsService from '../services/api/dailyActionsService';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { FEATURES } from '../config/constants';

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

      // Check if mock data is enabled
      const useMockData = FEATURES.USE_MOCK_DATA_FOR_UI_TESTING || localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

      if (useMockData) {
        console.log('[DAILY ACTIONS ADVANCED] Using mock data for metadata');

        // Import mock data dynamically
        const mockDataModule = await import('../mockData');
        const mockDataService = mockDataModule.default;

        // Get mock metadata
        const mockMetadata = mockDataService.getMockData('/reports/daily-actions/metadata');

        if (mockMetadata) {
          console.log('[DAILY ACTIONS ADVANCED] Got mock metadata:', mockMetadata);
          setMetadata(mockMetadata);
          return;
        }
      }

      // Fall back to service if mock data is not available or not enabled
      console.log('[DAILY ACTIONS ADVANCED] Fetching metadata from service');
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

      console.log('[DAILY ACTIONS ADVANCED] Fetching data with filters:', apiFilters);

      // Check if mock data is enabled
      const useMockData = FEATURES.USE_MOCK_DATA_FOR_UI_TESTING || localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

      if (useMockData) {
        console.log('[DAILY ACTIONS ADVANCED] Using mock data for report');

        // Import mock data dynamically
        const mockDataModule = await import('../mockData');
        const mockDataService = mockDataModule.default;

        // Get mock data
        const mockData = mockDataService.getMockData('/reports/daily-actions/data', apiFilters);

        if (mockData) {
          console.log('[DAILY ACTIONS ADVANCED] Got mock data:', mockData);
          setData(mockData);
          return;
        }
      }

      // Fall back to service if mock data is not available or not enabled
      console.log('[DAILY ACTIONS ADVANCED] Fetching data from service');
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
    // Log the filters
    console.log('Filters changed:', filters);

    // If we have search term or multi-select filters, we might want to fetch data
    if (
      filters.searchTerm ||
      (filters.gameCategories && filters.gameCategories.length > 0) ||
      (filters.playerStatuses && filters.playerStatuses.length > 0) ||
      (filters.countries && filters.countries.length > 0)
    ) {
      // Optionally fetch data with the new filters
      // Uncomment the line below to automatically fetch data when filters change
      // fetchData(filters);
    }
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

      console.log('[DAILY ACTIONS ADVANCED] Exporting data with filters:', apiFilters, 'format:', exportFormat);

      // Check if mock data is enabled
      const useMockData = FEATURES.USE_MOCK_DATA_FOR_UI_TESTING || localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

      if (useMockData) {
        console.log('[DAILY ACTIONS ADVANCED] Using mock data for export');

        // For mock data, we'll just create a simple text file with JSON data
        const mockDataModule = await import('../mockData');
        const mockDataService = mockDataModule.default;

        // Get mock data
        const mockData = mockDataService.getMockData('/reports/daily-actions/data', apiFilters);

        if (mockData) {
          console.log('[DAILY ACTIONS ADVANCED] Creating mock export file');
          // Create a blob with the JSON data
          const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
          const fileName = `daily-actions-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
          saveAs(blob, fileName);
          return;
        }
      }

      // Fall back to service if mock data is not available or not enabled
      console.log('[DAILY ACTIONS ADVANCED] Exporting data from service');
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
