import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  SelectChangeEvent
} from '@mui/material';
import { format, subDays } from 'date-fns';
import { FEATURES } from '../../config/constants';
import dailyActionsService from '../../services/api/dailyActionsService';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';

// Import custom components
import DailyActionsFilterPanel from '../../components/reports/DailyActionsFilterPanel';

// Types

interface DailyAction {
  id: string;
  date: string;
  whiteLabelId: number;
  whiteLabelName: string;
  registrations: number;
  ftd: number;
  ftda?: number;
  deposits: number;
  depositsCreditCard?: number;
  depositsNeteller?: number;
  depositsMoneyBookers?: number;
  depositsOther?: number;
  cashoutRequests?: number;
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
  // Player properties
  playerId?: number;
  playerName?: string;
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

// Define ReportFilters interface for export
interface ReportFilters {
  startDate: string;
  endDate: string;
  whiteLabelIds?: number[];
  groupBy?: number;
}

const DailyActionsPage: React.FC = () => {
  // State for filters - use yesterday and today as default date range
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [whiteLabelId, setWhiteLabelId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<string>('Day');
  // Group By options - when any option is selected,
  // the table will show only the grouped field and sum all numerical values
  const groupByOptions = [
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
  ];

  // State for data
  const [dailyActions, setDailyActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for sorting
  const [orderBy, setOrderBy] = useState<keyof DailyAction>('totalGGR');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // State for summary metrics
  const [summary, setSummary] = useState<Summary>({
    totalRegistrations: 0,
    totalFTD: 0,
    totalDeposits: 0,
    totalCashouts: 0,
    totalGGR: 0
  });

  // Fetch initial data on component mount
  useEffect(() => {
    console.log('[DAILY ACTIONS PAGE] Component mounted');
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
          console.log('[DAILY ACTIONS PAGE] Response data structure:', response.data);

          // Check if the data property has an items array (new structure)
          if (response.data.items && Array.isArray(response.data.items)) {
            console.log('[DAILY ACTIONS PAGE] Response has items array with length:', response.data.items.length);
            console.log('[DAILY ACTIONS PAGE] First item:', response.data.items[0]);
            console.log('[DAILY ACTIONS PAGE] Response data details:', {
              count: response.data.items.length,
              firstItem: response.data.items[0],
              responseStructure: Object.keys(response),
              dataType: typeof response.data,
              isArray: Array.isArray(response.data.items),
              groupBy: groupBy,
              backendGroupBy: filters.groupBy,
              hasGroupValue: response.data.items[0]?.groupValue !== undefined,
              hasGroupKey: response.data.items[0]?.groupKey !== undefined,
              groupValues: response.data.items.map((item: DailyAction) => item.groupValue).filter(Boolean).slice(0, 5),
              uniqueWhiteLabelNames: Array.from(new Set(response.data.items.map((item: DailyAction) => item.whiteLabelName))).slice(0, 10),
              uniqueDates: Array.from(new Set(response.data.items.map((item: DailyAction) => item.date))).sort()
            });
          } else {
            // Old structure - data is an array directly
            console.log('[DAILY ACTIONS PAGE] Response has data property with length:', response.data.length);
            console.log('[DAILY ACTIONS PAGE] First item:', response.data[0]);
            console.log('[DAILY ACTIONS PAGE] Response data details:', {
              count: response.data.length,
              firstItem: response.data[0],
              responseStructure: Object.keys(response),
              dataType: typeof response.data,
              isArray: Array.isArray(response.data),
              groupBy: groupBy,
              backendGroupBy: filters.groupBy,
              hasGroupValue: response.data[0]?.groupValue !== undefined,
              hasGroupKey: response.data[0]?.groupKey !== undefined,
              groupValues: response.data.map((item: DailyAction) => item.groupValue).filter(Boolean).slice(0, 5),
              uniqueWhiteLabelNames: Array.from(new Set(response.data.map((item: DailyAction) => item.whiteLabelName))).slice(0, 10),
              uniqueDates: Array.from(new Set(response.data.map((item: DailyAction) => item.date))).sort()
            });
          }

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

          // Check if the data property has an items array (new structure)
          if (response.data.items && Array.isArray(response.data.items)) {
            // New structure - use the items array
            setDailyActions(response.data.items);

            // Set summary metrics if available in the response
            if (response.summary) {
              setSummary(response.summary);
            } else {
              // Calculate summary metrics if not provided by the API
              const summaryData: Summary = {
                totalRegistrations: response.data.items.reduce((sum: number, item: DailyAction) => sum + (item.registrations || 0), 0),
                totalFTD: response.data.items.reduce((sum: number, item: DailyAction) => sum + (item.ftd || 0), 0),
                totalDeposits: response.data.items.reduce((sum: number, item: DailyAction) => sum + (item.deposits || 0), 0),
                totalCashouts: response.data.items.reduce((sum: number, item: DailyAction) => sum + (item.paidCashouts || 0), 0),
                totalGGR: response.data.items.reduce((sum: number, item: DailyAction) => sum + (item.totalGGR || 0), 0)
              };

              setSummary(summaryData);
            }
          } else {
            // Old structure - data is an array directly
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

  // Handle sort request
  const handleRequestSort = (property: keyof DailyAction) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Get sorted data
  const getSortedData = (data: DailyAction[]): DailyAction[] => {
    // Create a copy of the data to avoid mutating the original
    const stabilizedData = data.map((el, index) => [el, index] as [DailyAction, number]);

    // Sort the data
    stabilizedData.sort((a, b) => {
      const aValue = a[0][orderBy];
      const bValue = b[0][orderBy];

      // Handle special case for the first column (groupBy)
      if (orderBy === 'groupValue' ||
          orderBy === 'date' ||
          orderBy === 'whiteLabelName' ||
          orderBy === 'country' ||
          orderBy === 'tracker' ||
          orderBy === 'currency' ||
          orderBy === 'gender' ||
          orderBy === 'platform' ||
          orderBy === 'ranking') {
        // String comparison
        const aString = String(aValue || '');
        const bString = String(bValue || '');

        if (order === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      }

      // Numeric comparison for other columns
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;

      if (order === 'asc') {
        return aNum - bNum;
      } else {
        return bNum - aNum;
      }
    });

    return stabilizedData.map((el) => el[0]);
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
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Daily Actions Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze daily player activities, deposits, and gaming revenue
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/reports/daily-actions/advanced"
          startIcon={<FilterListIcon />}
        >
          Advanced Report
        </Button>
      </div>

      {/* Comprehensive Filter Panel */}
      <DailyActionsFilterPanel
        onFilterChange={(filters) => {
          console.log('[DAILY ACTIONS PAGE] Filter changed:', filters);
          // Update state based on filter changes
          if (filters.dateRange) {
            setStartDate(filters.dateRange);
            setEndDate(filters.dateRange);
          }
        }}
        onApplyFilters={(filters) => {
          console.log('[DAILY ACTIONS PAGE] Applying filters:', filters);
          // Update state based on filter changes
          if (filters.dateRange) {
            setStartDate(filters.dateRange);
            setEndDate(filters.dateRange);
          }

          // Apply filters
          handleApplyFilters();
        }}
        onResetFilters={() => {
          console.log('[DAILY ACTIONS PAGE] Resetting filters');
          // Reset to default values
          setStartDate(subDays(new Date(), 1));
          setEndDate(new Date());
          setWhiteLabelId('');
          setGroupBy('Day');

          // Fetch data with reset filters
          fetchDailyActions();
        }}
        initialValues={{
          dateRange: startDate,
          // Add other initial values as needed
        }}
      />

      {/* Group By and Export Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
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

          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleApplyFilters}
              sx={{ mr: 2 }}
            >
              Apply Filters
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={loading || dailyActions.length === 0}
              onClick={handleExport}
            >
              Export
            </Button>
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
      <Paper style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <TableChartIcon style={{ marginRight: '8px' }} />
          <Typography variant="h6">Daily Actions Data</Typography>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
            <CircularProgress />
          </div>
        ) : dailyActions.length === 0 ? (
          <Alert severity="info">
            No data available for the selected filters. Try adjusting your filters or click "Apply Filters" to load data.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {/* Show the grouped field column based on the selected option */}
                  <TableCell
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    sortDirection={orderBy === 'groupValue' ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === 'groupValue'}
                      direction={orderBy === 'groupValue' ? order : 'asc'}
                      onClick={() => handleRequestSort('groupValue')}
                    >
                      {groupByOptions.find(option => option.id === groupBy)?.name || groupBy}
                    </TableSortLabel>
                  </TableCell>

                  {/* Registration and Player Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'registrations' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'registrations'}
                      direction={orderBy === 'registrations' ? order : 'asc'}
                      onClick={() => handleRequestSort('registrations')}
                    >
                      Registrations
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'ftd' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'ftd'}
                      direction={orderBy === 'ftd' ? order : 'asc'}
                      onClick={() => handleRequestSort('ftd')}
                    >
                      FTD
                    </TableSortLabel>
                  </TableCell>

                  {/* Deposit Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'deposits' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'deposits'}
                      direction={orderBy === 'deposits' ? order : 'asc'}
                      onClick={() => handleRequestSort('deposits')}
                    >
                      Deposits
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'depositsCreditCard' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'depositsCreditCard'}
                      direction={orderBy === 'depositsCreditCard' ? order : 'asc'}
                      onClick={() => handleRequestSort('depositsCreditCard')}
                    >
                      Deposits CC
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'depositsNeteller' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'depositsNeteller'}
                      direction={orderBy === 'depositsNeteller' ? order : 'asc'}
                      onClick={() => handleRequestSort('depositsNeteller')}
                    >
                      Deposits Neteller
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'depositsMoneyBookers' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'depositsMoneyBookers'}
                      direction={orderBy === 'depositsMoneyBookers' ? order : 'asc'}
                      onClick={() => handleRequestSort('depositsMoneyBookers')}
                    >
                      Deposits Skrill
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'depositsOther' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'depositsOther'}
                      direction={orderBy === 'depositsOther' ? order : 'asc'}
                      onClick={() => handleRequestSort('depositsOther')}
                    >
                      Deposits Other
                    </TableSortLabel>
                  </TableCell>

                  {/* Cashout Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'cashoutRequests' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'cashoutRequests'}
                      direction={orderBy === 'cashoutRequests' ? order : 'asc'}
                      onClick={() => handleRequestSort('cashoutRequests')}
                    >
                      Cashout Requests
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'paidCashouts' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'paidCashouts'}
                      direction={orderBy === 'paidCashouts' ? order : 'asc'}
                      onClick={() => handleRequestSort('paidCashouts')}
                    >
                      Paid Cashouts
                    </TableSortLabel>
                  </TableCell>

                  {/* Casino Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'betsCasino' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'betsCasino'}
                      direction={orderBy === 'betsCasino' ? order : 'asc'}
                      onClick={() => handleRequestSort('betsCasino')}
                    >
                      Casino Bets
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'winsCasino' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'winsCasino'}
                      direction={orderBy === 'winsCasino' ? order : 'asc'}
                      onClick={() => handleRequestSort('winsCasino')}
                    >
                      Casino Wins
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'ggrCasino' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'ggrCasino'}
                      direction={orderBy === 'ggrCasino' ? order : 'asc'}
                      onClick={() => handleRequestSort('ggrCasino')}
                    >
                      Casino GGR
                    </TableSortLabel>
                  </TableCell>

                  {/* Sports Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'betsSport' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'betsSport'}
                      direction={orderBy === 'betsSport' ? order : 'asc'}
                      onClick={() => handleRequestSort('betsSport')}
                    >
                      Sports Bets
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'winsSport' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'winsSport'}
                      direction={orderBy === 'winsSport' ? order : 'asc'}
                      onClick={() => handleRequestSort('winsSport')}
                    >
                      Sports Wins
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'ggrSport' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'ggrSport'}
                      direction={orderBy === 'ggrSport' ? order : 'asc'}
                      onClick={() => handleRequestSort('ggrSport')}
                    >
                      Sports GGR
                    </TableSortLabel>
                  </TableCell>

                  {/* Live Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'betsLive' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'betsLive'}
                      direction={orderBy === 'betsLive' ? order : 'asc'}
                      onClick={() => handleRequestSort('betsLive')}
                    >
                      Live Bets
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'winsLive' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'winsLive'}
                      direction={orderBy === 'winsLive' ? order : 'asc'}
                      onClick={() => handleRequestSort('winsLive')}
                    >
                      Live Wins
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'ggrLive' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'ggrLive'}
                      direction={orderBy === 'ggrLive' ? order : 'asc'}
                      onClick={() => handleRequestSort('ggrLive')}
                    >
                      Live GGR
                    </TableSortLabel>
                  </TableCell>

                  {/* Bingo Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'betsBingo' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'betsBingo'}
                      direction={orderBy === 'betsBingo' ? order : 'asc'}
                      onClick={() => handleRequestSort('betsBingo')}
                    >
                      Bingo Bets
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'winsBingo' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'winsBingo'}
                      direction={orderBy === 'winsBingo' ? order : 'asc'}
                      onClick={() => handleRequestSort('winsBingo')}
                    >
                      Bingo Wins
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sortDirection={orderBy === 'ggrBingo' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'ggrBingo'}
                      direction={orderBy === 'ggrBingo' ? order : 'asc'}
                      onClick={() => handleRequestSort('ggrBingo')}
                    >
                      Bingo GGR
                    </TableSortLabel>
                  </TableCell>

                  {/* Total GGR */}
                  <TableCell align="right" sortDirection={orderBy === 'totalGGR' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'totalGGR'}
                      direction={orderBy === 'totalGGR' ? order : 'asc'}
                      onClick={() => handleRequestSort('totalGGR')}
                    >
                      Total GGR
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getSortedData(dailyActions).map((row, index) => {
                  // Log the row data to help debug
                  if (index === 0) {
                    console.log('[DAILY ACTIONS PAGE] First row data:', row);
                  }

                  return (
                    <TableRow key={row.id || `row-${index}`}>
                      {/* Display the appropriate value based on the groupBy option */}
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {row.groupValue ? row.groupValue :
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
                         groupBy === 'Player' && row.playerId ? `Player ${row.playerId}` :
                         row[groupBy.toLowerCase() as keyof DailyAction] || 'N/A'}
                      </TableCell>

                      {/* Registration and Player Metrics */}
                      <TableCell align="right">{row.registrations}</TableCell>
                      <TableCell align="right">{row.ftd}</TableCell>

                      {/* Deposit Metrics */}
                      <TableCell align="right">{formatCurrency(row.deposits)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.depositsCreditCard || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.depositsNeteller || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.depositsMoneyBookers || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.depositsOther || 0)}</TableCell>

                      {/* Cashout Metrics */}
                      <TableCell align="right">{formatCurrency(row.cashoutRequests || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.paidCashouts)}</TableCell>

                      {/* Casino Metrics */}
                      <TableCell align="right">{formatCurrency(row.betsCasino || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.winsCasino || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.ggrCasino)}</TableCell>

                      {/* Sports Metrics */}
                      <TableCell align="right">{formatCurrency(row.betsSport || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.winsSport || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.ggrSport)}</TableCell>

                      {/* Live Metrics */}
                      <TableCell align="right">{formatCurrency(row.betsLive || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.winsLive || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.ggrLive)}</TableCell>

                      {/* Bingo Metrics */}
                      <TableCell align="right">{formatCurrency(row.betsBingo || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.winsBingo || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.ggrBingo || 0)}</TableCell>

                      {/* Total GGR */}
                      <TableCell align="right">{formatCurrency(row.totalGGR)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default DailyActionsPage;
