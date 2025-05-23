import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import SimpleBox from '../../components/common/SimpleBox';
import { EnhancedTable } from '../../components/tables/enhanced';
import { ColumnDef, ExportFormat } from '../../components/tables/enhanced/types';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format as formatDate, parseISO } from 'date-fns';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartIcon from '@mui/icons-material/TableChart';

// Import Redux actions and selectors
import {
  fetchDailyActionGames,
  setFilters,
  selectDailyActionGames,
  selectDailyActionGamesLoading,
  selectDailyActionGamesError,
  selectDailyActionGamesFilters,
  selectDailyActionGamesTotalCount
} from '../../store/slices/dailyActionGamesSlice';
import { AppDispatch } from '../../store/store';
import { DailyActionGame } from '../../types/reports';

/**
 * DailyActionGamesPage component
 * Displays a comprehensive report of daily action games data
 */
const DailyActionGamesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const games = useSelector(selectDailyActionGames);
  const loading = useSelector(selectDailyActionGamesLoading);
  const error = useSelector(selectDailyActionGamesError);
  const filters = useSelector(selectDailyActionGamesFilters);
  const totalCount = useSelector(selectDailyActionGamesTotalCount);

  // Debug: Log Redux state
  console.log('[COMPONENT] Redux state - games:', games, 'loading:', loading, 'error:', error);
  console.log('[COMPONENT] Games type:', typeof games, 'Is array:', Array.isArray(games));
  console.log('[COMPONENT] Games length:', Array.isArray(games) ? games.length : 'N/A');

  // Local state
  const [startDate, setStartDate] = useState<Date | null>(
    filters?.startDate ? parseISO(filters.startDate) : new Date(new Date().setDate(new Date().getDate() - 1))
  );
  const [endDate, setEndDate] = useState<Date | null>(
    filters?.endDate ? parseISO(filters.endDate) : new Date()
  );
  const [playerId, setPlayerId] = useState<string>(filters?.playerId?.toString() || '');
  const [gameId, setGameId] = useState<string>(filters?.gameId?.toString() || '');
  const [mockDataEnabled, setMockDataEnabled] = useState<boolean>(false);
  const [localGamesData, setLocalGamesData] = useState<DailyActionGame[]>([]);

  /**
   * Define table columns - memoized to prevent unnecessary re-renders
   */
  const columns = useMemo<ColumnDef[]>(() => [
    {
      id: 'gameDate',
      label: 'Date',
      format: (value) => formatDate(new Date(value), 'MMM dd, yyyy'),
      sortable: true,
      width: 120,
    },
    {
      id: 'gameId',
      label: 'Game ID',
      sortable: true,
      width: 100,
    },
    {
      id: 'playerId',
      label: 'Player ID',
      sortable: true,
      width: 100,
    },
    {
      id: 'platform',
      label: 'Platform',
      sortable: true,
      width: 100,
    },
    {
      id: 'realBetAmount',
      label: 'Real Bet Amount',
      type: 'currency',
      sortable: true,
      width: 150,
    },
    {
      id: 'realWinAmount',
      label: 'Real Win Amount',
      type: 'currency',
      sortable: true,
      width: 150,
    },
    {
      id: 'bonusBetAmount',
      label: 'Bonus Bet Amount',
      type: 'currency',
      sortable: true,
      width: 150,
    },
    {
      id: 'bonusWinAmount',
      label: 'Bonus Win Amount',
      type: 'currency',
      sortable: true,
      width: 150,
    },
    {
      id: 'netGamingRevenue',
      label: 'Net Gaming Revenue',
      type: 'currency',
      sortable: true,
      width: 150,
    },
    {
      id: 'numberOfRealBets',
      label: 'Real Bets',
      type: 'number',
      sortable: true,
      width: 100,
    },
    {
      id: 'numberOfBonusBets',
      label: 'Bonus Bets',
      type: 'number',
      sortable: true,
      width: 100,
    },
    {
      id: 'numberOfSessions',
      label: 'Sessions',
      type: 'number',
      sortable: true,
      width: 100,
    },
    {
      id: 'numberOfRealWins',
      label: 'Real Wins',
      type: 'number',
      sortable: true,
      width: 100,
    },
    {
      id: 'numberOfBonusWins',
      label: 'Bonus Wins',
      type: 'number',
      sortable: true,
      width: 100,
    }
  ], []);

  /**
   * Helper function to format currency
   */
  const formatCurrency = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return (amount: number): string => formatter.format(amount);
  }, []);

  /**
   * Prepare query parameters for API calls
   */
  const getQueryParams = useCallback(() => ({
    startDate: startDate ? formatDate(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? formatDate(endDate, 'yyyy-MM-dd') : undefined,
    playerId: playerId && playerId.trim() !== '' ? parseInt(playerId, 10) : undefined,
    gameId: gameId && gameId.trim() !== '' ? parseInt(gameId, 10) : undefined
  }), [startDate, endDate, playerId, gameId]);

  /**
   * Fetch data with current filters
   */
  const fetchData = useCallback(() => {
    const queryParams = getQueryParams();
    dispatch(setFilters(queryParams));
    dispatch(fetchDailyActionGames(queryParams));
  }, [dispatch, getQueryParams]);

  /**
   * Handle apply filters
   */
  const handleApplyFilters = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handle export
   */
  const handleExport = useCallback(async (format: ExportFormat, exportData: any[]): Promise<void> => {
    try {
      // Convert format to service format
      const serviceFormat = format.toLowerCase() as 'csv' | 'excel' | 'pdf';
      const queryParams = getQueryParams();

      // Import the service
      const dailyActionGamesService = (await import('../../services/api/dailyActionGamesService')).default;

      // Call the export function
      const blob = await dailyActionGamesService.exportData(queryParams, serviceFormat);

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-action-games-${formatDate(new Date(), 'yyyy-MM-dd')}.${serviceFormat}`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  }, [getQueryParams]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Calculate summary statistics from games data
   */
  const calculateSummary = useCallback((gamesData: DailyActionGame[]) => ({
    totalRealBets: gamesData.reduce((sum, g) => sum + (g.numberOfRealBets || 0), 0),
    totalBonusBets: gamesData.reduce((sum, g) => sum + (g.numberOfBonusBets || 0), 0),
    totalRealBetAmount: gamesData.reduce((sum, g) => sum + (g.realBetAmount || 0), 0),
    totalBonusBetAmount: gamesData.reduce((sum, g) => sum + (g.bonusBetAmount || 0), 0),
    totalNetGamingRevenue: gamesData.reduce((sum, g) => sum + (g.netGamingRevenue || 0), 0),
    totalSessions: gamesData.reduce((sum, g) => sum + (g.numberOfSessions || 0), 0)
  }), []);

  // Use games data directly from Redux (selector already returns the correct array)
  const gamesArray = useMemo(() => {
    console.log('Raw games from Redux:', games);
    console.log('Games type:', typeof games);
    console.log('Games is array:', Array.isArray(games));
    console.log('Games length:', Array.isArray(games) ? games.length : 'N/A');

    // If mock data is enabled, use local games data
    if (mockDataEnabled && localGamesData.length > 0) {
      console.log('Using mock data:', localGamesData);
      return localGamesData;
    }

    // The selector already returns an array, so use it directly
    const result = Array.isArray(games) ? games : [];
    console.log('Final games array length:', result.length);
    return result;
  }, [games, mockDataEnabled, localGamesData]);

  // Calculate summary
  const summary = useMemo(() => calculateSummary(gamesArray), [gamesArray, calculateSummary]);

  return (
    <Container maxWidth="xl">
      <SimpleBox sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SimpleBox>
          <Typography variant="h4" gutterBottom>
            Games Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze daily game activity, bets, and revenue metrics
          </Typography>
        </SimpleBox>
      </SimpleBox>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <SimpleBox sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </SimpleBox>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Player ID"
              fullWidth
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              type="number"
              placeholder="Filter by Player ID"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Game ID"
              fullWidth
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              type="number"
              placeholder="Filter by Game ID"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <SimpleBox sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleApplyFilters}
            disabled={loading}
          >
            Apply Filters
          </Button>
        </SimpleBox>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h5">
                {summary.totalSessions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Real Bets
              </Typography>
              <Typography variant="h5">
                {summary.totalRealBets.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Bonus Bets
              </Typography>
              <Typography variant="h5">
                {summary.totalBonusBets.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Real Bet Amount
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalRealBetAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Bonus Bet Amount
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalBonusBetAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Net Gaming Revenue
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalNetGamingRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper sx={{ p: 3 }}>
        <SimpleBox sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TableChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Games Data</Typography>
        </SimpleBox>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Temporary debug info */}
        <SimpleBox sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2">
            Debug: Games array length: {gamesArray.length} | Loading: {loading ? 'Yes' : 'No'} | Error: {error || 'None'}
          </Typography>
          <Typography variant="body2">
            Raw games type: {typeof games} | Is array: {Array.isArray(games) ? 'Yes' : 'No'} | Raw length: {Array.isArray(games) ? games.length : 'N/A'}
          </Typography>
          <Typography variant="body2">
            Raw games preview: {JSON.stringify(games).substring(0, 100)}...
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              console.log('Manual fetch triggered');
              console.log('Current games state:', games);
              fetchData();
            }}
            sx={{ mt: 1, mr: 1 }}
          >
            Manual Fetch
          </Button>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={() => {
              const testData = [
                {
                  id: 1,
                  gameDate: new Date().toISOString(),
                  playerId: 12345,
                  gameId: 67890,
                  platform: 'Web',
                  realBetAmount: 100,
                  realWinAmount: 50,
                  bonusBetAmount: 20,
                  bonusWinAmount: 10,
                  netGamingRevenue: 60,
                  numberOfRealBets: 5,
                  numberOfBonusBets: 2,
                  numberOfSessions: 1,
                  numberOfRealWins: 3,
                  numberOfBonusWins: 1,
                  realBetAmountOriginal: 100,
                  realWinAmountOriginal: 50,
                  bonusBetAmountOriginal: 20,
                  bonusWinAmountOriginal: 10,
                  netGamingRevenueOriginal: 60,
                  updateDate: new Date().toISOString()
                }
              ];
              setLocalGamesData(testData);
              setMockDataEnabled(true);
              console.log('Test data applied:', testData);
            }}
            sx={{ mt: 1 }}
          >
            Test Table
          </Button>
        </SimpleBox>



        <EnhancedTable
          columns={columns}
          data={gamesArray}
          loading={loading}
          title="Daily Action Games"
          emptyMessage="No games data available"
          idField="id"
          onExport={handleExport}
          features={{
            sorting: true,
            filtering: {
              enabled: true,
              quickFilter: true,
              advancedFilter: true
            },
            pagination: {
              enabled: true,
              defaultPageSize: 10,
              pageSizeOptions: [10, 25, 50, 100]
            },
            columnManagement: {
              enabled: true,
              allowReordering: true,
              allowHiding: true,
              allowResizing: true
            },
            export: {
              enabled: true,
              formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF]
            }
          }}
        />
      </Paper>
    </Container>
  );
};

export default DailyActionGamesPage;
