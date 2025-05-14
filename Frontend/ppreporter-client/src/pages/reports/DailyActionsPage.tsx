import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
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

/**
 * Represents a daily action record with player activity data
 */
interface DailyAction {
  /** Unique identifier for the record */
  id: string;
  /** Date of the record in ISO format */
  date: string;
  /** White label identifier */
  whiteLabelId: number;
  /** White label name */
  whiteLabelName: string;
  /** Number of registrations */
  registrations: number;
  /** Number of first-time depositors */
  ftd: number;
  /** Number of first-time depositor acquisitions (optional) */
  ftda?: number;
  /** Total deposit amount */
  deposits: number;
  /** Deposit amount via credit card (optional) */
  depositsCreditCard?: number;
  /** Deposit amount via Neteller (optional) */
  depositsNeteller?: number;
  /** Deposit amount via MoneyBookers (optional) */
  depositsMoneyBookers?: number;
  /** Deposit amount via other methods (optional) */
  depositsOther?: number;
  /** Number of cashout requests (optional) */
  cashoutRequests?: number;
  /** Total amount of paid cashouts */
  paidCashouts: number;
  /** Total amount of casino bets (optional) */
  betsCasino?: number;
  /** Total amount of casino wins (optional) */
  winsCasino?: number;
  /** Total amount of sports bets (optional) */
  betsSport?: number;
  /** Total amount of sports wins (optional) */
  winsSport?: number;
  /** Total amount of live bets (optional) */
  betsLive?: number;
  /** Total amount of live wins (optional) */
  winsLive?: number;
  /** Total amount of bingo bets (optional) */
  betsBingo?: number;
  /** Total amount of bingo wins (optional) */
  winsBingo?: number;
  /** Gross gaming revenue for casino */
  ggrCasino: number;
  /** Gross gaming revenue for sports */
  ggrSport: number;
  /** Gross gaming revenue for live games */
  ggrLive: number;
  /** Gross gaming revenue for bingo (optional) */
  ggrBingo?: number;
  /** Total gross gaming revenue across all products */
  totalGGR: number;
  /** Key used for grouping data (optional) */
  groupKey?: string;
  /** Value displayed for grouped data (optional) */
  groupValue?: string;
  /** Country of the player (optional) */
  country?: string;
  /** Tracker information (optional) */
  tracker?: string;
  /** Currency used (optional) */
  currency?: string;
  /** Player gender (optional) */
  gender?: string;
  /** Platform used (optional) */
  platform?: string;
  /** Player ranking (optional) */
  ranking?: string;
  /** Player ID (optional) */
  playerId?: number;
  /** Player name (optional) */
  playerName?: string;
}

/**
 * Summary metrics for daily actions
 */
interface Summary {
  /** Total number of registrations */
  totalRegistrations: number;
  /** Total number of first-time depositors */
  totalFTD: number;
  /** Total deposit amount */
  totalDeposits: number;
  /** Total cashout amount */
  totalCashouts: number;
  /** Total gross gaming revenue */
  totalGGR: number;
}

/**
 * Filters for API requests
 */
interface Filters {
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** End date in YYYY-MM-DD format */
  endDate: string;
  /** List of white label IDs to filter by */
  whiteLabelIds?: number[];
  /** GroupByOption enum value (Day=0, Month=1, Year=2, etc.) */
  groupBy?: number;
}

/**
 * Filters for report export
 */
interface ReportFilters extends Filters {
  // Same as Filters interface, but defined separately for clarity
}

/**
 * Daily Actions Page Component
 * Displays daily player activities, deposits, and gaming revenue
 */
const DailyActionsPage: React.FC = () => {
  // State for filters - use yesterday and today as default date range
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [whiteLabelId, setWhiteLabelId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<string>('Day');

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

  // Group By options - memoized to prevent unnecessary re-renders
  const groupByOptions = useMemo(() => [
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
  ], []);

  /**
   * Convert frontend groupBy string to backend GroupByOption enum value
   * @param groupByString - The group by option string
   * @returns The corresponding backend enum value
   */
  const convertGroupByToBackendValue = useCallback((groupByString: string): number => {
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
  }, []);

  /**
   * Calculate summary metrics from data
   * @param data - The daily actions data
   * @returns Summary metrics
   */
  const calculateSummary = useCallback((data: DailyAction[]): Summary => {
    return {
      totalRegistrations: data.reduce((sum, item) => sum + (item.registrations || 0), 0),
      totalFTD: data.reduce((sum, item) => sum + (item.ftd || 0), 0),
      totalDeposits: data.reduce((sum, item) => sum + (item.deposits || 0), 0),
      totalCashouts: data.reduce((sum, item) => sum + (item.paidCashouts || 0), 0),
      totalGGR: data.reduce((sum, item) => sum + (item.totalGGR || 0), 0)
    };
  }, []);

  /**
   * Format group value based on groupBy option
   * @param item - The daily action item
   * @param groupByOption - The group by option
   * @returns Formatted group value
   */
  const formatGroupValue = useCallback((item: DailyAction, groupByOption: string): string => {
    if (item.groupValue) return item.groupValue;

    if (groupByOption === 'Day' && item.date) {
      return format(new Date(item.date), 'MMM dd, yyyy');
    } else if (groupByOption === 'Month' && item.date) {
      return format(new Date(item.date), 'MMMM yyyy');
    } else if (groupByOption === 'Year' && item.date) {
      return format(new Date(item.date), 'yyyy');
    } else if (groupByOption === 'Label') {
      return item.whiteLabelName || '';
    } else if (groupByOption === 'Country') {
      return item.country || '';
    } else if (groupByOption === 'Tracker') {
      return item.tracker || '';
    } else if (groupByOption === 'Currency') {
      return item.currency || '';
    } else if (groupByOption === 'Gender') {
      return item.gender || '';
    } else if (groupByOption === 'Platform') {
      return item.platform || '';
    } else if (groupByOption === 'Ranking') {
      return item.ranking || '';
    } else if (groupByOption === 'Player') {
      return item.playerId ? `Player ${item.playerId}` : '';
    }

    return '';
  }, []);

  /**
   * Process API response data
   * @param response - The API response
   * @returns Processed daily actions data
   */
  const processApiResponse = useCallback((response: any): DailyAction[] => {
    let processedData: DailyAction[] = [];

    // Extract data array from response based on its structure
    if (response.data && Array.isArray(response.data)) {
      processedData = response.data;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      processedData = response.data.items;
    } else if (response.items && Array.isArray(response.items)) {
      processedData = response.items;
    } else if (Array.isArray(response)) {
      processedData = response;
    } else if (typeof response === 'object' && response !== null) {
      const keys = Object.keys(response).filter(key => !isNaN(Number(key)));
      if (keys.length > 0) {
        processedData = keys.map(key => response[key]);
      }
    }

    // Transform the data to ensure it has the required properties
    return processedData.map(item => ({
      ...item,
      id: item.id || `row-${Math.random().toString(36).substr(2, 9)}`,
      groupValue: formatGroupValue(item, groupBy),
      registrations: item.registrations || 0,
      ftd: item.ftd || 0,
      deposits: item.deposits || 0,
      paidCashouts: item.paidCashouts || 0,
      ggrCasino: item.ggrCasino || 0,
      ggrSport: item.ggrSport || 0,
      ggrLive: item.ggrLive || 0,
      totalGGR: item.totalGGR || 0
    }));
  }, [formatGroupValue, groupBy]);

  /**
   * Fetch daily actions data
   */
  const fetchDailyActions = useCallback(async () => {
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
        groupBy: convertGroupByToBackendValue(groupBy)
      };

      // Add white label ID filter if specified
      if (whiteLabelId && whiteLabelId !== '') {
        filters.whiteLabelIds = [parseInt(whiteLabelId)];
      }

      // Try to get mock data if enabled
      const useMockData = FEATURES.USE_MOCK_DATA_FOR_UI_TESTING ||
                          localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';

      if (useMockData) {
        try {
          // Import mock data dynamically
          const mockDataModule = await import('../../mockData');
          const mockDataService = mockDataModule.default;

          // Try to get summary data
          const mockSummaryData = mockDataService.getMockData('/reports/daily-actions/summary', filters);

          if (mockSummaryData?.dailyActions) {
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
          }

          // Try to get regular data if summary data not available
          const mockRegularData = mockDataService.getMockData('/reports/daily-actions/data', filters);

          if (mockRegularData) {
            // Extract data from the response
            let data: DailyAction[] = [];
            if (mockRegularData.dailyActions?.length > 0) {
              data = mockRegularData.dailyActions;
            } else if (mockRegularData.data?.length > 0) {
              data = mockRegularData.data;
            }

            setDailyActions(data);

            // Set summary metrics
            if (mockRegularData.summary) {
              setSummary(mockRegularData.summary);
            } else {
              setSummary(calculateSummary(data));
            }

            setLoading(false);
            return;
          }
        } catch (mockError) {
          // Continue to real API if mock data fails
        }
      }

      // Make the API call
      const response = await dailyActionsService.getGroupedData(filters);

      if (response) {
        // Process the data
        const transformedData = processApiResponse(response);
        setDailyActions(transformedData);

        // Process summary data
        if (response.summary) {
          setSummary(response.summary);
        } else {
          setSummary(calculateSummary(transformedData));
        }
      } else {
        setError('Invalid response format from the server');
      }
    } catch (err) {
      setError('Failed to load daily actions data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [
    startDate, endDate, whiteLabelId, groupBy,
    convertGroupByToBackendValue, processApiResponse, calculateSummary
  ]);

  // Fetch initial data on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDailyActions();
    }, 100);

    return () => clearTimeout(timer);
  }, [fetchDailyActions]);

  /**
   * Handle filter changes
   */
  const handleApplyFilters = useCallback((): void => {
    fetchDailyActions();
  }, [fetchDailyActions]);

  /**
   * Handle group by change
   * @param event - The select change event
   */
  const handleGroupByChange = useCallback((event: SelectChangeEvent): void => {
    setGroupBy(event.target.value);
  }, []);

  /**
   * Handle export button click
   */
  const handleExport = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

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
      setError('Failed to export data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, whiteLabelId, groupBy, convertGroupByToBackendValue]);

  /**
   * Format currency values
   * @param value - The value to format
   * @returns Formatted currency string
   */
  const formatCurrency = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });

    return (value: number): string => formatter.format(value);
  }, []);

  /**
   * Handle sort request
   * @param property - The property to sort by
   */
  const handleRequestSort = useCallback((property: keyof DailyAction) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  /**
   * Determine if a property should be sorted as string
   * @param property - The property to check
   * @returns True if the property should be sorted as string
   */
  const isStringProperty = useMemo(() => {
    const stringProperties = new Set([
      'groupValue', 'date', 'whiteLabelName', 'country',
      'tracker', 'currency', 'gender', 'platform', 'ranking'
    ]);

    return (property: keyof DailyAction): boolean => stringProperties.has(property as string);
  }, []);

  /**
   * Get sorted data
   * @param data - The data to sort
   * @returns Sorted data
   */
  const getSortedData = useCallback((data: DailyAction[]): DailyAction[] => {
    // Create a copy of the data to avoid mutating the original
    const stabilizedData = data.map((el, index) => [el, index] as [DailyAction, number]);

    // Sort the data
    stabilizedData.sort((a, b) => {
      const aValue = a[0][orderBy];
      const bValue = b[0][orderBy];

      // Handle string properties
      if (isStringProperty(orderBy)) {
        const aString = String(aValue || '');
        const bString = String(bValue || '');

        return order === 'asc'
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      }

      // Numeric comparison for other columns
      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;

      return order === 'asc' ? aNum - bNum : bNum - aNum;
    });

    return stabilizedData.map((el) => el[0]);
  }, [orderBy, order, isStringProperty]);

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
                  <TableCell align="right" sortDirection={orderBy === 'paidCashouts' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'paidCashouts'}
                      direction={orderBy === 'paidCashouts' ? order : 'asc'}
                      onClick={() => handleRequestSort('paidCashouts')}
                    >
                      Paid Cashouts
                    </TableSortLabel>
                  </TableCell>

                  {/* GGR Metrics */}
                  <TableCell align="right" sortDirection={orderBy === 'ggrCasino' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'ggrCasino'}
                      direction={orderBy === 'ggrCasino' ? order : 'asc'}
                      onClick={() => handleRequestSort('ggrCasino')}
                    >
                      Casino GGR
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
                  <TableCell align="right" sortDirection={orderBy === 'ggrLive' ? order : false}>
                    <TableSortLabel
                      active={orderBy === 'ggrLive'}
                      direction={orderBy === 'ggrLive' ? order : 'asc'}
                      onClick={() => handleRequestSort('ggrLive')}
                    >
                      Live GGR
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
                        {row.groupValue || 'N/A'}
                      </TableCell>

                      {/* Registration and Player Metrics */}
                      <TableCell align="right">{row.registrations}</TableCell>
                      <TableCell align="right">{row.ftd}</TableCell>

                      {/* Deposit Metrics */}
                      <TableCell align="right">{formatCurrency(row.deposits)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.paidCashouts)}</TableCell>

                      {/* GGR Metrics */}
                      <TableCell align="right">{formatCurrency(row.ggrCasino)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.ggrSport)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.ggrLive)}</TableCell>

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
