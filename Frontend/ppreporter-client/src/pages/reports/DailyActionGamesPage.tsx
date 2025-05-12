import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  TextField,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { EnhancedTable } from '../../components/tables/enhanced';
import { ColumnDef, ExportFormat } from '../../components/tables/enhanced/types';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format as formatDate, parseISO } from 'date-fns';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CasinoIcon from '@mui/icons-material/Casino';

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

  // Define table columns
  const columns: ColumnDef[] = [
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
  ];

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Fetch data with current filters
  const fetchData = () => {
    const queryParams = {
      startDate: startDate ? formatDate(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? formatDate(endDate, 'yyyy-MM-dd') : undefined,
      playerId: playerId && playerId.trim() !== '' ? parseInt(playerId, 10) : undefined,
      gameId: gameId && gameId.trim() !== '' ? parseInt(gameId, 10) : undefined
    };

    dispatch(setFilters(queryParams));
    dispatch(fetchDailyActionGames(queryParams));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    fetchData();
  };

  // Handle export
  const handleExport = async (format: ExportFormat, exportData: any[]): Promise<void> => {
    try {
      // Convert format to service format
      const serviceFormat = format.toLowerCase() as 'csv' | 'excel' | 'pdf';

      // Get current filters
      const queryParams = {
        startDate: startDate ? formatDate(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? formatDate(endDate, 'yyyy-MM-dd') : undefined,
        playerId: playerId && playerId.trim() !== '' ? parseInt(playerId, 10) : undefined,
        gameId: gameId && gameId.trim() !== '' ? parseInt(gameId, 10) : undefined
      };

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
      // You could add a snackbar or alert here to notify the user
    }
  };

  // Log the games data
  console.log('Games data in component:', games);

  // Ensure games is an array before calculating summary
  let gamesArray: DailyActionGame[] = [];

  // If mock data is enabled, use local games data
  if (mockDataEnabled && localGamesData.length > 0) {
    gamesArray = localGamesData;
    console.log('Using mock data with length:', localGamesData.length);
  } else if (Array.isArray(games)) {
    // If games is already an array, use it directly
    gamesArray = games as DailyActionGame[];
    console.log('Games is already an array with length:', games.length);
  } else if (games && typeof games === 'object') {
    // If games is an object, try to extract an array from it
    const gamesObj = games as Record<string, any>;
    if (gamesObj.data && Array.isArray(gamesObj.data)) {
      // If games has a data property that is an array
      gamesArray = gamesObj.data as DailyActionGame[];
      console.log('Extracted games array from games.data with length:', gamesObj.data.length);
    } else {
      // Try to convert the object to an array
      const extractedArray = Object.values(gamesObj).filter(item => item && typeof item === 'object');
      if (extractedArray.length > 0) {
        gamesArray = extractedArray as DailyActionGame[];
        console.log('Extracted games array from object values with length:', extractedArray.length);
      }
    }
  }

  // Transform the data to ensure it matches the expected format
  gamesArray = gamesArray.map((game: any, index: number) => {
    // Create a properly formatted game object
    const formattedGame: DailyActionGame = {
      id: game.id || index + 1,
      gameDate: game.gameDate || new Date().toISOString(),
      playerId: typeof game.playerId === 'number' ? game.playerId : 0,
      gameId: typeof game.gameId === 'number' ? game.gameId : 0,
      platform: game.platform || 'Unknown',
      realBetAmount: typeof game.realBetAmount === 'number' ? game.realBetAmount : 0,
      realWinAmount: typeof game.realWinAmount === 'number' ? game.realWinAmount : 0,
      bonusBetAmount: typeof game.bonusBetAmount === 'number' ? game.bonusBetAmount : 0,
      bonusWinAmount: typeof game.bonusWinAmount === 'number' ? game.bonusWinAmount : 0,
      netGamingRevenue: typeof game.netGamingRevenue === 'number' ? game.netGamingRevenue : 0,
      numberOfRealBets: typeof game.numberOfRealBets === 'number' ? game.numberOfRealBets : 0,
      numberOfBonusBets: typeof game.numberOfBonusBets === 'number' ? game.numberOfBonusBets : 0,
      numberOfSessions: typeof game.numberOfSessions === 'number' ? game.numberOfSessions : 0,
      numberOfRealWins: typeof game.numberOfRealWins === 'number' ? game.numberOfRealWins : 0,
      numberOfBonusWins: typeof game.numberOfBonusWins === 'number' ? game.numberOfBonusWins : 0,
      realBetAmountOriginal: typeof game.realBetAmountOriginal === 'number' ? game.realBetAmountOriginal : 0,
      realWinAmountOriginal: typeof game.realWinAmountOriginal === 'number' ? game.realWinAmountOriginal : 0,
      bonusBetAmountOriginal: typeof game.bonusBetAmountOriginal === 'number' ? game.bonusBetAmountOriginal : 0,
      bonusWinAmountOriginal: typeof game.bonusWinAmountOriginal === 'number' ? game.bonusWinAmountOriginal : 0,
      netGamingRevenueOriginal: typeof game.netGamingRevenueOriginal === 'number' ? game.netGamingRevenueOriginal : 0,
      updateDate: game.updateDate || new Date().toISOString()
    };

    return formattedGame;
  });

  console.log('Final transformed games array:', gamesArray);

  // Calculate summary statistics
  const summary = {
    totalRealBets: gamesArray.reduce((sum: number, g: DailyActionGame) => sum + (g.numberOfRealBets || 0), 0),
    totalBonusBets: gamesArray.reduce((sum: number, g: DailyActionGame) => sum + (g.numberOfBonusBets || 0), 0),
    totalRealBetAmount: gamesArray.reduce((sum: number, g: DailyActionGame) => sum + (g.realBetAmount || 0), 0),
    totalBonusBetAmount: gamesArray.reduce((sum: number, g: DailyActionGame) => sum + (g.bonusBetAmount || 0), 0),
    totalNetGamingRevenue: gamesArray.reduce((sum: number, g: DailyActionGame) => sum + (g.netGamingRevenue || 0), 0),
    totalSessions: gamesArray.reduce((sum: number, g: DailyActionGame) => sum + (g.numberOfSessions || 0), 0)
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Games Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze daily game activity, bets, and revenue metrics
          </Typography>
        </Box>
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleApplyFilters}
            disabled={loading}
          >
            Apply Filters
          </Button>
        </Box>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TableChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Games Data</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Debug information */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>Debug Info:</Typography>
            <Typography variant="body2">Data type: {typeof games}</Typography>
            <Typography variant="body2">Is Array: {Array.isArray(games) ? 'Yes' : 'No'}</Typography>
            <Typography variant="body2">Length: {Array.isArray(games) ? games.length : 'N/A'}</Typography>
            <Typography variant="body2">First item type: {Array.isArray(games) && games.length > 0 ? typeof games[0] : 'N/A'}</Typography>
            <Typography variant="body2">Games Array Length: {gamesArray.length}</Typography>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error ? `Error: ${error}` : 'No error'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => console.log('Games data:', games)}
              >
                Log Games Data
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => console.log('Games array:', gamesArray)}
              >
                Log Games Array
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={fetchData}
              >
                Fetch Data
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  const mockData = Array.from({ length: 10 }, (_, i) => ({
                    id: i + 1,
                    gameDate: new Date().toISOString(),
                    playerId: 1000 + i,
                    gameId: 2000 + i,
                    platform: 'Web',
                    realBetAmount: 100 + i * 10,
                    realWinAmount: 50 + i * 5,
                    bonusBetAmount: 20 + i * 2,
                    bonusWinAmount: 10 + i,
                    netGamingRevenue: 60 + i * 5,
                    numberOfRealBets: 5 + i,
                    numberOfBonusBets: 2 + i,
                    numberOfSessions: 1,
                    numberOfRealWins: 3 + i,
                    numberOfBonusWins: 1 + i,
                    realBetAmountOriginal: 100 + i * 10,
                    realWinAmountOriginal: 50 + i * 5,
                    bonusBetAmountOriginal: 20 + i * 2,
                    bonusWinAmountOriginal: 10 + i,
                    netGamingRevenueOriginal: 60 + i * 5,
                    updateDate: new Date().toISOString()
                  }));
                  setLocalGamesData(mockData);
                  setMockDataEnabled(true);
                  console.log('Generated and applied mock data:', mockData);
                }}
              >
                Use Mock Data
              </Button>
              {mockDataEnabled && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setMockDataEnabled(false);
                    console.log('Disabled mock data, reverting to API data');
                  }}
                >
                  Disable Mock Data
                </Button>
              )}
            </Box>
          </Box>
        )}

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
