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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, subDays } from 'date-fns';
import { FEATURES } from '../../config/constants';
import dailyActionsService from '../../services/api/dailyActionsService';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';

// Types
interface WhiteLabel {
  id: string;
  name: string;
}

interface DailyAction {
  id: string;
  date: string;
  whiteLabelName: string;
  registrations: number;
  ftd: number;
  deposits: number;
  paidCashouts: number;
  ggrCasino: number;
  ggrSport: number;
  ggrLive: number;
  totalGGR: number;
  // Additional properties for grouped data
  groupKey?: string;
  groupValue?: string;
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
  whiteLabelId?: string;
  groupBy?: string;
}

const DailyActionsPage: React.FC = () => {
  // State for filters - use yesterday and today as default date range
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [whiteLabelId, setWhiteLabelId] = useState<string>('');
  const [whiteLabels, setWhiteLabels] = useState<WhiteLabel[]>([]);
  const [groupBy, setGroupBy] = useState<string>('Day');
  const [groupByOptions, setGroupByOptions] = useState<{id: string, name: string}[]>([
    { id: 'Day', name: 'Day' },
    { id: 'Month', name: 'Month' },
    { id: 'Year', name: 'Year' },
    { id: 'Label', name: 'White Label' },
    { id: 'Ranking', name: 'Ranking' }
  ]);

  // State for data
  const [dailyActions, setDailyActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        groupBy: groupBy
      };

      if (whiteLabelId && whiteLabelId !== '') {
        console.log(`[DAILY ACTIONS PAGE] Filtering by white label ID: ${whiteLabelId}`);
        filters.whiteLabelId = whiteLabelId;
      } else {
        console.log('[DAILY ACTIONS PAGE] No white label filter applied');
      }

      console.log(`[DAILY ACTIONS PAGE] Grouping by: ${groupBy}`);

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
                  totalRegistrations: mockRegularData.totalRegistrations || data.reduce((sum: number, item: any) => sum + (item.registrations || 0), 0),
                  totalFTD: mockRegularData.totalFTD || data.reduce((sum: number, item: any) => sum + (item.ftd || 0), 0),
                  totalDeposits: mockRegularData.totalDeposits || data.reduce((sum: number, item: any) => sum + (item.deposits || 0), 0),
                  totalCashouts: mockRegularData.totalCashouts || data.reduce((sum: number, item: any) => sum + (item.paidCashouts || 0), 0),
                  totalGGR: mockRegularData.totalGGR || data.reduce((sum: number, item: any) => sum + (item.totalGGR || 0), 0)
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

      // Fetch data directly (the data endpoint returns both data and summary)
      try {
        console.log('[DAILY ACTIONS PAGE] Fetching data with filters:', filters);
        const response = await dailyActionsService.getData(filters);
        console.log('[DAILY ACTIONS PAGE] Regular data response:', response);

        // Check if the response has the expected structure
        if (response && response.data) {
          setDailyActions(response.data);

          // Set summary metrics if available in the response
          if (response.summary) {
            setSummary(response.summary);
          } else {
            // Calculate summary metrics if not provided by the API
            const summaryData: Summary = {
              totalRegistrations: response.data.reduce((sum: number, item: any) => sum + (item.registrations || 0), 0),
              totalFTD: response.data.reduce((sum: number, item: any) => sum + (item.ftd || 0), 0),
              totalDeposits: response.data.reduce((sum: number, item: any) => sum + (item.deposits || 0), 0),
              totalCashouts: response.data.reduce((sum: number, item: any) => sum + (item.paidCashouts || 0), 0),
              totalGGR: response.data.reduce((sum: number, item: any) => sum + (item.totalGGR || 0), 0)
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

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
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
              >
                {groupByOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {groupBy !== 'Label' && <TableCell>Date</TableCell>}
                  {(groupBy === 'Day' || groupBy === 'Label') && <TableCell>White Label</TableCell>}
                  {groupBy !== 'Day' && groupBy !== 'Label' && <TableCell>{groupBy}</TableCell>}
                  <TableCell align="right">Registrations</TableCell>
                  <TableCell align="right">FTD</TableCell>
                  <TableCell align="right">Deposits</TableCell>
                  <TableCell align="right">Cashouts</TableCell>
                  <TableCell align="right">Casino GGR</TableCell>
                  <TableCell align="right">Sports GGR</TableCell>
                  <TableCell align="right">Live GGR</TableCell>
                  <TableCell align="right">Total GGR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyActions.map((row, index) => (
                  <TableRow key={row.id || `row-${index}`}>
                    {groupBy !== 'Label' &&
                      <TableCell>
                        {row.date ? format(new Date(row.date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                    }
                    {(groupBy === 'Day' || groupBy === 'Label') &&
                      <TableCell>{row.whiteLabelName}</TableCell>
                    }
                    {groupBy !== 'Day' && groupBy !== 'Label' &&
                      <TableCell>{row.groupValue || 'N/A'}</TableCell>
                    }
                    <TableCell align="right">{row.registrations}</TableCell>
                    <TableCell align="right">{row.ftd}</TableCell>
                    <TableCell align="right">{formatCurrency(row.deposits)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.paidCashouts)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.ggrCasino)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.ggrSport)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.ggrLive)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalGGR)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default DailyActionsPage;
