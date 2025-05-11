import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import EnhancedUnifiedDataTable, { ExportFormat } from '../../components/tables/EnhancedUnifiedDataTable';
import { ColumnDef } from '../../components/tables/UnifiedDataTable';
import FilterPanel, { FilterDefinition, FilterType } from '../../components/common/FilterPanel';
import MultiSelect from '../../components/common/MultiSelect';
import ReportExport from '../../components/reports/ReportExport';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, subDays } from 'date-fns';
import { FEATURES } from '../../config/constants';
import dailyActionsService from '../../services/api/dailyActionsService';
// Import the ReportFilters type from the service file
import { ReportFilters } from '../../services/api/types';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';

// Types
interface WhiteLabel {
  id: string;
  name: string;
}

interface DailyAction {
  id: string;
  date: string;
  whiteLabelId: number;
  whiteLabelName: string;
  registrations: number;
  ftd: number;
  deposits: number;
  paidCashouts: number;
  betsCasino?: number;
  winsCasino?: number;
  betsSport?: number;
  winsSport?: number;
  betsLive?: number;
  winsLive?: number;
  betsBingo?: number;
  winsBingo?: number;
  ggrCasino: number;
  ggrSport: number;
  ggrLive: number;
  ggrBingo?: number;
  totalGGR: number;
  // Additional properties for grouped data
  groupKey?: string;
  groupValue?: string;
  // Additional properties for other grouping dimensions
  country?: string;
  tracker?: string;
  currency?: string;
  gender?: string;
  platform?: string;
  ranking?: string;
}

interface Summary {
  totalRegistrations: number;
  totalFTD: number;
  totalDeposits: number;
  totalCashouts: number;
  totalGGR: number;
}

interface Filters {
  startDate: string;
  endDate: string;
  whiteLabelIds?: number[]; // Changed to match backend's expectation of a list
  groupBy?: number; // Changed to number to match backend's GroupByOption enum
}

const DailyActionsPage: React.FC = () => {
  // State for filters - use yesterday and today as default date range
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [whiteLabelId, setWhiteLabelId] = useState<string>('');
  const [whiteLabels, setWhiteLabels] = useState<WhiteLabel[]>([]);
  const [groupBy, setGroupBy] = useState<string>('Day');
  // Group By options - when any option is selected,
  // the table will show only the grouped field and sum all numerical values
  const [groupByOptions, setGroupByOptions] = useState<{id: string, name: string}[]>([
    { id: 'Day', name: 'Day' },
    { id: 'Month', name: 'Month' },
    { id: 'Year', name: 'Year' },
    { id: 'Label', name: 'White Label' },
    { id: 'Player', name: 'Player' },
    { id: 'Country', name: 'Country' },
    { id: 'Tracker', name: 'Tracker' },
    { id: 'Currency', name: 'Currency' },
    { id: 'Gender', name: 'Gender' },
    { id: 'Platform', name: 'Platform' },
    { id: 'Ranking', name: 'Ranking' }
  ]);

  // State for data
  const [dailyActions, setDailyActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Removed sorting and pagination state as they'll be handled by UnifiedDataTable

  // State for advanced features
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'groupValue', 'registrations', 'ftd', 'deposits', 'paidCashouts',
    'ggrCasino', 'ggrSport', 'ggrLive', 'totalGGR'
  ]);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  // State for summary metrics
  const [summary, setSummary] = useState<Summary>({
    totalRegistrations: 0,
    totalFTD: 0,
    totalDeposits: 0,
    totalCashouts: 0,
    totalGGR: 0
  });

  // Fetch metadata (white labels) on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('[DAILY ACTIONS PAGE] Fetching metadata');

        // Check if mock data is enabled (from constants or localStorage)
        const useMockData = FEATURES.USE_MOCK_DATA_FOR_UI_TESTING || localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

        if (useMockData) {
          console.log('[DAILY ACTIONS PAGE] Using mock data for metadata');

          // Import mock data dynamically
          const mockDataModule = await import('../../mockData');
          const mockDataService = mockDataModule.default;

          // Get mock metadata
          const mockMetadata = mockDataService.getMockData('/reports/daily-actions/metadata');

          if (mockMetadata && mockMetadata.whiteLabels) {
            console.log('[DAILY ACTIONS PAGE] Got mock white labels:', mockMetadata.whiteLabels);
            setWhiteLabels(mockMetadata.whiteLabels);
            return;
          }
        }

        // Fall back to service if mock data is not available
        const data = await dailyActionsService.getMetadata();
        console.log('[DAILY ACTIONS PAGE] Got white labels from service:', (data as any).whiteLabels);
        setWhiteLabels((data as any).whiteLabels || []);
      } catch (err) {
        console.error('[DAILY ACTIONS PAGE] Error fetching metadata:', err);
        setError('Failed to load metadata. Please try again later.');
      }
    };

    fetchMetadata();
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    // Define a function to fetch data on mount to avoid dependency issues
    const fetchInitialData = async () => {
      console.log('[DAILY ACTIONS PAGE] Fetching initial data');
      await fetchDailyActions();
    };

    // Set a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch daily actions data
  const fetchDailyActions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Create filters object
      const filters: Filters = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        // Convert groupBy string to the numeric value expected by the backend
        // The backend expects a GroupByOption enum value (Day=0, Month=1, Year=2, Label=3, etc.)
        groupBy: convertGroupByToBackendValue(groupBy)
      };

      if (whiteLabelId && whiteLabelId !== '') {
        console.log(`[DAILY ACTIONS PAGE] Filtering by white label ID: ${whiteLabelId}`);
        // The backend expects a list of white label IDs
        filters.whiteLabelIds = [parseInt(whiteLabelId)];
      } else {
        console.log('[DAILY ACTIONS PAGE] No white label filter applied');
      }

      console.log(`[DAILY ACTIONS PAGE] Grouping by: ${groupBy} (backend value: ${filters.groupBy})`);

      // Log a message about the grouping behavior
      console.log(`[DAILY ACTIONS PAGE] Using grouped view by ${groupBy} - numerical values will be summed`);

      console.log('[DAILY ACTIONS PAGE] Starting data fetch with filters:', filters);

      // Try to get mock data directly first
      try {
        console.log('[DAILY ACTIONS PAGE] Checking if mock data is enabled');
        // Check both the constant and localStorage
        const useMockData = FEATURES.USE_MOCK_DATA_FOR_UI_TESTING || localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

        if (useMockData) {
          console.log('[DAILY ACTIONS PAGE] Mock data is enabled, trying to get mock data directly');

          // Import mock data dynamically
          const mockDataModule = await import('../../mockData');
          const mockDataService = mockDataModule.default;

          // Try to get summary data
          console.log('[DAILY ACTIONS PAGE] Getting mock summary data directly with filters:', filters);
          const mockSummaryData = mockDataService.getMockData('/reports/daily-actions/summary', filters);

          if (mockSummaryData && mockSummaryData.dailyActions) {
            console.log('[DAILY ACTIONS PAGE] Got mock summary data directly:', mockSummaryData);
            console.log('[DAILY ACTIONS PAGE] Daily actions from mock data:', mockSummaryData.dailyActions);

            // Use the mock data
            setDailyActions(mockSummaryData.dailyActions || []);

            // Set summary metrics
            const summaryData: Summary = {
              totalRegistrations: mockSummaryData.totalRegistrations || 0,
              totalFTD: mockSummaryData.totalFTD || 0,
              totalDeposits: mockSummaryData.totalDeposits || 0,
              totalCashouts: mockSummaryData.totalCashouts || 0,
              totalGGR: mockSummaryData.totalGGR || 0
            };

            setSummary(summaryData);
            setLoading(false);
            return;
          } else {
            console.log('[DAILY ACTIONS PAGE] No mock summary data found or no daily actions in the response, trying regular mock data');

            // Try to get regular data
            const mockRegularData = mockDataService.getMockData('/reports/daily-actions/data', filters);

            if (mockRegularData) {
              console.log('[DAILY ACTIONS PAGE] Got mock regular data directly:', mockRegularData);

              // Check if we have dailyActions in the response
              if (mockRegularData.dailyActions && mockRegularData.dailyActions.length > 0) {
                console.log('[DAILY ACTIONS PAGE] Using dailyActions from mock data:', mockRegularData.dailyActions);
                setDailyActions(mockRegularData.dailyActions);
              } else if (mockRegularData.data && mockRegularData.data.length > 0) {
                // Fall back to data field
                console.log('[DAILY ACTIONS PAGE] Using data field from mock data:', mockRegularData.data);
                setDailyActions(mockRegularData.data);
              } else {
                // No data found
                console.log('[DAILY ACTIONS PAGE] No data found in mock response');
                setDailyActions([]);
              }

              // Check if we have summary in the response
              if (mockRegularData.summary) {
                setSummary(mockRegularData.summary);
              } else {
                // Calculate summary metrics from the data
                const data = mockRegularData.dailyActions || mockRegularData.data || [];
                const summaryData: Summary = {
                  totalRegistrations: mockRegularData.totalRegistrations || data.reduce((sum: number, item: DailyAction) => sum + (item.registrations || 0), 0),
                  totalFTD: mockRegularData.totalFTD || data.reduce((sum: number, item: DailyAction) => sum + (item.ftd || 0), 0),
                  totalDeposits: mockRegularData.totalDeposits || data.reduce((sum: number, item: DailyAction) => sum + (item.deposits || 0), 0),
                  totalCashouts: mockRegularData.totalCashouts || data.reduce((sum: number, item: DailyAction) => sum + (item.paidCashouts || 0), 0),
                  totalGGR: mockRegularData.totalGGR || data.reduce((sum: number, item: DailyAction) => sum + (item.totalGGR || 0), 0)
                };

                setSummary(summaryData);
              }

              setLoading(false);
              return;
            }
          }
        }
      } catch (mockError) {
        console.error('[DAILY ACTIONS PAGE] Error getting mock data directly:', mockError);
      }

      // Always use the filtered-grouped endpoint for consistent behavior
      try {
        console.log('[DAILY ACTIONS PAGE] Fetching data with filters:', filters);

        // Always use the filtered-grouped endpoint for all groupBy options
        console.log('[DAILY ACTIONS PAGE] Using getGroupedData for groupBy:', groupBy);

        // Add more detailed logging for debugging
        console.log('[DAILY ACTIONS PAGE] Endpoint URL:', '/reports/daily-actions/filtered-grouped');
        console.log('[DAILY ACTIONS PAGE] Request payload:', JSON.stringify(filters, null, 2));

        // Make the API call
        const response = await dailyActionsService.getGroupedData(filters);

        // Log the full response for debugging
        console.log('[DAILY ACTIONS PAGE] Raw response:', JSON.stringify(response, null, 2));

        // Check if the response has the expected structure
        if (response && response.data) {
          console.log('[DAILY ACTIONS PAGE] Response data details:', {
            count: response.data.length,
            firstItem: response.data[0],
            groupBy: groupBy,
            backendGroupBy: filters.groupBy,
            hasGroupValue: response.data[0]?.groupValue !== undefined,
            hasGroupKey: response.data[0]?.groupKey !== undefined,
            groupValues: response.data.map((item: DailyAction) => item.groupValue).filter(Boolean).slice(0, 5),
            uniqueWhiteLabelNames: Array.from(new Set(response.data.map((item: DailyAction) => item.whiteLabelName))).slice(0, 10)
          });

          // If we're grouping by Label, check if we have duplicate white label names
          if (groupBy === 'Label') {
            const whiteLabelCounts = response.data.reduce((acc: {[key: string]: number}, item: DailyAction) => {
              const name = item.whiteLabelName || 'Unknown';
              acc[name] = (acc[name] || 0) + 1;
              return acc;
            }, {});

            const duplicates = Object.entries(whiteLabelCounts)
              .filter(([_, count]) => (count as number) > 1)
              .map(([name, count]) => `${name} (${count as number})`);

            if (duplicates.length > 0) {
              console.log('[DAILY ACTIONS PAGE] Found duplicate white label names:', duplicates);
            }
          }

          setDailyActions(response.data);

          // Set summary metrics if available in the response
          if (response.summary) {
            setSummary(response.summary);
          } else {
            // Calculate summary metrics if not provided by the API
            const summaryData: Summary = {
              totalRegistrations: response.data.reduce((sum: number, item: DailyAction) => sum + (item.registrations || 0), 0),
              totalFTD: response.data.reduce((sum: number, item: DailyAction) => sum + (item.ftd || 0), 0),
              totalDeposits: response.data.reduce((sum: number, item: DailyAction) => sum + (item.deposits || 0), 0),
              totalCashouts: response.data.reduce((sum: number, item: DailyAction) => sum + (item.paidCashouts || 0), 0),
              totalGGR: response.data.reduce((sum: number, item: DailyAction) => sum + (item.totalGGR || 0), 0)
            };

            setSummary(summaryData);
          }
        } else {
          console.error('[DAILY ACTIONS PAGE] Invalid response format:', response);
          setError('Invalid response format from the server');
        }
      } catch (innerErr) {
        console.error('[DAILY ACTIONS PAGE] Error in inner try block:', innerErr);
        throw innerErr; // Re-throw to be caught by the outer catch block
      }
    } catch (err) {
      console.error('[DAILY ACTIONS PAGE] Error fetching daily actions:', err);
      setError('Failed to load daily actions data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = (): void => {
    console.log('[DAILY ACTIONS PAGE] Apply filters button clicked');
    console.log('[DAILY ACTIONS PAGE] Current filters:', {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      whiteLabelId
    });
    fetchDailyActions();
  };

  // Handle white label change
  const handleWhiteLabelChange = (event: SelectChangeEvent): void => {
    console.log(`[DAILY ACTIONS PAGE] White label changed to: ${event.target.value}`);
    setWhiteLabelId(event.target.value);
  };

  // Handle group by change
  const handleGroupByChange = (event: SelectChangeEvent): void => {
    console.log(`[DAILY ACTIONS PAGE] Group by changed to: ${event.target.value}`);
    setGroupBy(event.target.value);
  };

  // Handle export button click
  const handleExport = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('[DAILY ACTIONS PAGE] Exporting data with filters:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        whiteLabelId,
        groupBy
      });

      // Create filters object
      const filters: ReportFilters = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        whiteLabelIds: whiteLabelId ? [parseInt(whiteLabelId)] : undefined,
        groupBy: convertGroupByToBackendValue(groupBy)
      };

      // Export the data
      const blob = await dailyActionsService.exportFilteredReport(filters, 'csv');

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DailyActions_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}_${groupBy}.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('[DAILY ACTIONS PAGE] Error exporting data:', error);
      setError('Failed to export data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Removed sorting and pagination handlers as they'll be handled by UnifiedDataTable

  // Removed getSortedData function as sorting will be handled by UnifiedDataTable

  // Handle advanced filter toggle
  const handleToggleAdvancedFilters = (): void => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Handle advanced filter change
  const handleAdvancedFilterChange = (id: string, value: any): void => {
    setAdvancedFilters({
      ...advancedFilters,
      [id]: value
    });
  };

  // Handle advanced filter apply
  const handleApplyAdvancedFilters = (): void => {
    // Combine basic filters from the form with advanced filters
    const combinedFilters = {
      startDate,
      endDate,
      groupBy,
      whiteLabelId,
      ...advancedFilters
    };

    console.log('[DAILY ACTIONS PAGE] Applying advanced filters:', combinedFilters);
    fetchDailyActions();
  };

  // Handle advanced filter reset
  const handleResetAdvancedFilters = (): void => {
    setAdvancedFilters({});
  };

  // Handle export dialog
  const handleOpenExportDialog = (): void => {
    setShowExportDialog(true);
  };

  // Handle export dialog close
  const handleCloseExportDialog = (): void => {
    setShowExportDialog(false);
  };

  // Handle export
  const handleExportData = (exportData: any): void => {
    console.log('[DAILY ACTIONS PAGE] Exporting data with options:', exportData);
    handleExport();
    setShowExportDialog(false);
  };

  // Handle column selector dialog
  const handleOpenColumnSelector = (): void => {
    setShowColumnSelector(true);
  };

  // Handle column selector dialog close
  const handleCloseColumnSelector = (): void => {
    setShowColumnSelector(false);
  };

  // Handle column visibility change
  const handleColumnVisibilityChange = (columnId: string): void => {
    const currentVisibleColumns = [...visibleColumns];
    const columnIndex = currentVisibleColumns.indexOf(columnId);

    if (columnIndex === -1) {
      // Add column
      currentVisibleColumns.push(columnId);
    } else {
      // Remove column
      currentVisibleColumns.splice(columnIndex, 1);
    }

    setVisibleColumns(currentVisibleColumns);
  };

  // Convert frontend groupBy string to backend GroupByOption enum value
  const convertGroupByToBackendValue = (groupByString: string): number => {
    // Import the mapping from the service to ensure consistency
    // Day=0, Month=1, Year=2, Label=3, Country=4, Tracker=5, Currency=6, Gender=7, Platform=8, Ranking=9, Player=10
    const groupByMapping: { [key: string]: number } = {
      'Day': 0,
      'Month': 1,
      'Year': 2,
      'Label': 3,
      'Country': 4,
      'Tracker': 5,
      'Currency': 6,
      'Gender': 7,
      'Platform': 8,
      'Ranking': 9,
      'Player': 10
    };

    return groupByMapping[groupByString] || 0; // Default to Day (0) if not found
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Daily Actions Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze daily player activities, deposits, and gaming revenue
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/reports/daily-actions/advanced"
          startIcon={<FilterListIcon />}
        >
          Advanced Report
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => newValue && setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => newValue && setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>White Label</InputLabel>
              <Select
                value={whiteLabelId}
                onChange={handleWhiteLabelChange}
                label="White Label"
              >
                <MenuItem value="">All White Labels</MenuItem>
                {whiteLabels && whiteLabels.length > 0 ?
                  whiteLabels.map((wl) => (
                    <MenuItem key={wl.id} value={wl.id}>{wl.name}</MenuItem>
                  ))
                : [
                  // Default white labels if none are loaded - use array instead of Fragment
                  <MenuItem key="casino-royale" value="casino-royale">Casino Royale</MenuItem>,
                  <MenuItem key="lucky-spin" value="lucky-spin">Lucky Spin</MenuItem>,
                  <MenuItem key="golden-bet" value="golden-bet">Golden Bet</MenuItem>
                ]}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                onChange={handleGroupByChange}
                label="Group By"
                sx={{
                  fontWeight: 'bold',
                  '& .MuiSelect-select': {
                    color: 'primary.main'
                  }
                }}
              >
                {groupByOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main'
                    }}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
              Data is grouped by {groupByOptions.find(option => option.id === groupBy)?.name.toLowerCase() || groupBy.toLowerCase()}, with numerical values summed.
            </Typography>
          </Grid>

          <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleApplyFilters}
              sx={{ mr: 2 }}
            >
              Apply Filters
            </Button>

            <span>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={loading || dailyActions.length === 0}
                onClick={handleExport}
              >
                Export
              </Button>
            </span>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Registrations
              </Typography>
              <Typography variant="h5">
                {summary.totalRegistrations.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                First Time Depositors
              </Typography>
              <Typography variant="h5">
                {summary.totalFTD.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Deposits
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalDeposits)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Cashouts
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalCashouts)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total GGR
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalGGR)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TableChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Daily Actions Data</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : dailyActions.length === 0 ? (
          <Alert severity="info">
            No data available for the selected filters. Try adjusting your filters or click "Apply Filters" to load data.
          </Alert>
        ) : (
          <EnhancedUnifiedDataTable
            data={dailyActions}
            columns={[
              {
                id: 'groupValue',
                label: groupByOptions.find(option => option.id === groupBy)?.name || groupBy,
                format: (value, row) => {
                  return row.groupValue ? row.groupValue :
                    groupBy === 'Day' && row.date ? format(new Date(row.date), 'MMM dd, yyyy') :
                    groupBy === 'Month' && row.date ? format(new Date(row.date), 'MMMM yyyy') :
                    groupBy === 'Year' && row.date ? format(new Date(row.date), 'yyyy') :
                    groupBy === 'Label' ? row.whiteLabelName :
                    groupBy === 'Country' && row.country ? row.country :
                    groupBy === 'Tracker' && row.tracker ? row.tracker :
                    groupBy === 'Currency' && row.currency ? row.currency :
                    groupBy === 'Gender' && row.gender ? row.gender :
                    groupBy === 'Platform' && row.platform ? row.platform :
                    groupBy === 'Ranking' && row.ranking ? row.ranking :
                    row[groupBy.toLowerCase() as keyof DailyAction] || 'N/A';
                }
              },
              {
                id: 'registrations',
                label: 'Registrations',
                align: 'right',
                type: 'number'
              },
              {
                id: 'ftd',
                label: 'FTD',
                align: 'right',
                type: 'number'
              },
              {
                id: 'deposits',
                label: 'Deposits',
                align: 'right',
                type: 'currency',
                format: (value) => formatCurrency(value)
              },
              {
                id: 'paidCashouts',
                label: 'Cashouts',
                align: 'right',
                type: 'currency',
                format: (value) => formatCurrency(value)
              },
              {
                id: 'ggrCasino',
                label: 'Casino GGR',
                align: 'right',
                type: 'currency',
                format: (value) => formatCurrency(value)
              },
              {
                id: 'ggrSport',
                label: 'Sports GGR',
                align: 'right',
                type: 'currency',
                format: (value) => formatCurrency(value)
              },
              {
                id: 'ggrLive',
                label: 'Live GGR',
                align: 'right',
                type: 'currency',
                format: (value) => formatCurrency(value)
              },
              {
                id: 'totalGGR',
                label: 'Total GGR',
                align: 'right',
                type: 'currency',
                format: (value) => formatCurrency(value)
              }
            ]}
            title="Daily Actions Data"
            loading={loading}
            onRefresh={handleApplyFilters}
            onExport={handleExport}
            features={{
              sorting: true,
              filtering: true,
              pagination: true,
              virtualization: false,
              microVisualizations: false,
              exportable: true
            }}
            emptyMessage="No data available for the selected filters. Try adjusting your filters or click 'Apply Filters' to load data."
            maxHeight="600px"
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            defaultRowsPerPage={10}
            idField="id"
            // Enhanced features
            enableColumnSelection={true}
            enableAdvancedFiltering={true}
            enableExportOptions={true}
            enableColumnReordering={true}
            enableRowGrouping={true}
            enableSummaryRow={true}
            enableExpandableRows={true}
            enableKeyboardNavigation={true}
            enableStickyColumns={true}
            enableResponsiveDesign={true}
            enableDrillDown={true}
            filterDefinitions={[
              {
                id: 'minRegistrations',
                label: 'Min Registrations',
                type: FilterType.NUMBER,
                min: 0
              },
              {
                id: 'maxRegistrations',
                label: 'Max Registrations',
                type: FilterType.NUMBER,
                min: 0
              },
              {
                id: 'minGGR',
                label: 'Min GGR',
                type: FilterType.NUMBER,
                min: 0
              },
              {
                id: 'maxGGR',
                label: 'Max GGR',
                type: FilterType.NUMBER,
                min: 0
              }
            ]}
            groupableColumns={[
              'whiteLabelName',
              'country',
              'tracker',
              'currency',
              'gender',
              'platform',
              'ranking'
            ]}
            stickyColumnIds={['groupValue']}
            drillDownConfig={[
              {
                sourceGrouping: 'Month',
                targetGrouping: 'Day',
                label: 'View by Day',
                transformFilter: (row) => ({
                  startDate: row.date ? format(new Date(row.date), 'yyyy-MM-01') : '',
                  endDate: row.date ? format(new Date(row.date), 'yyyy-MM-dd') : '',
                  groupBy: 'Day'
                })
              },
              {
                sourceGrouping: 'Label',
                targetGrouping: 'Player',
                label: 'View Players',
                transformFilter: (row) => ({
                  whiteLabelId: row.whiteLabelId || '',
                  groupBy: 'Player'
                })
              }
            ]}
            aggregations={[
              { columnId: 'registrations', function: 'sum', label: 'Total Registrations' },
              { columnId: 'registrations', function: 'avg', label: 'Avg Registrations' },
              { columnId: 'ftd', function: 'sum', label: 'Total FTD' },
              { columnId: 'ftd', function: 'avg', label: 'Avg FTD' },
              { columnId: 'deposits', function: 'sum', label: 'Total Deposits' },
              { columnId: 'paidCashouts', function: 'sum', label: 'Total Cashouts' },
              { columnId: 'totalGGR', function: 'sum', label: 'Total GGR' },
              { columnId: 'totalGGR', function: 'avg', label: 'Avg GGR' }
            ]}
            renderRowDetail={(row) => (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Details for {groupBy === 'Day' || groupBy === 'Month' || groupBy === 'Year' ?
                    format(new Date(row.date), 'MMM dd, yyyy') :
                    row.groupValue || 'Selected Item'}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Registrations:</strong> {row.registrations}
                    </Typography>
                    <Typography variant="body2">
                      <strong>FTD:</strong> {row.ftd}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Deposits:</strong> {formatCurrency(row.deposits)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cashouts:</strong> {formatCurrency(row.paidCashouts)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Casino GGR:</strong> {formatCurrency(row.ggrCasino)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Sports GGR:</strong> {formatCurrency(row.ggrSport)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Live GGR:</strong> {formatCurrency(row.ggrLive)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total GGR:</strong> {formatCurrency(row.totalGGR)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            onExportFormat={(format) => {
              console.log(`[DAILY ACTIONS PAGE] Exporting in format: ${format}`);
              handleExport();
            }}
            onApplyAdvancedFilters={(filters) => {
              console.log('[DAILY ACTIONS PAGE] Applying advanced filters:', filters);
              setAdvancedFilters(filters);
              handleApplyAdvancedFilters();
            }}
            onColumnOrderChange={(columns) => {
              console.log('[DAILY ACTIONS PAGE] Column order changed:', columns.map(col => col.id));
            }}
            onGroupingChange={(groupBy) => {
              console.log('[DAILY ACTIONS PAGE] Grouping changed to:', groupBy);
            }}
            onRowExpand={(rowId, expanded) => {
              console.log(`[DAILY ACTIONS PAGE] Row ${rowId} ${expanded ? 'expanded' : 'collapsed'}`);
            }}
            onDrillDown={(row, sourceGrouping, targetGrouping, filters) => {
              console.log(`[DAILY ACTIONS PAGE] Drill down from ${sourceGrouping} to ${targetGrouping}`, filters);

              // Update filters based on drill-down
              if (filters.groupBy) {
                setGroupBy(filters.groupBy);
              }

              if (filters.startDate) {
                setStartDate(filters.startDate);
              }

              if (filters.endDate) {
                setEndDate(filters.endDate);
              }

              if (filters.whiteLabelId) {
                setWhiteLabelId(filters.whiteLabelId);
              }

              // Apply the new filters
              handleApplyFilters();
            }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default DailyActionsPage;
