import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Alert,
  useTheme,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClearIcon from '@mui/icons-material/Clear';
import BugReportIcon from '@mui/icons-material/BugReport';
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/api/dashboardService';
import { fetchDashboardData } from '../store/actions/dashboardActions';
import DateRangePicker from '../components/common/DateRangePicker';
import FilterPanel from '../components/common/FilterPanel';

// Test data generators
import {
  generateEmptyData,
  generatePartialData,
  generateLargeData,
  generateErrorData
} from '../utils/testDataGenerator';

// Tab components
import OverviewTab from '../components/dashboard/tabs/OverviewTab';
import PerformanceTab from '../components/dashboard/tabs/PerformanceTab';
import PlayersTab from '../components/dashboard/tabs/PlayersTab';
import GamesTab from '../components/dashboard/tabs/GamesTab';

/**
 * API Dashboard component that connects to the backend API
 */
const ApiDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Test data scenario state
  const [testScenario, setTestScenario] = useState('normal');
  const [showTestPanel, setShowTestPanel] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date())
  });

  // Filter state
  const [filters, setFilters] = useState({
    gameCategory: '',
    playerStatus: '',
    country: '',
    minRevenue: '',
    maxRevenue: ''
  });

  // Filter definitions
  const filterDefinitions = [
    {
      id: 'gameCategory',
      label: 'Game Category',
      type: 'select',
      options: [
        { value: 'casino', label: 'Casino' },
        { value: 'sports', label: 'Sports' },
        { value: 'poker', label: 'Poker' },
        { value: 'bingo', label: 'Bingo' },
        { value: 'lottery', label: 'Lottery' }
      ]
    },
    {
      id: 'playerStatus',
      label: 'Player Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'new', label: 'New' },
        { value: 'vip', label: 'VIP' }
      ]
    },
    {
      id: 'country',
      label: 'Country',
      type: 'select',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
        { value: 'au', label: 'Australia' },
        { value: 'de', label: 'Germany' }
      ]
    },
    {
      id: 'minRevenue',
      label: 'Min Revenue',
      type: 'number'
    },
    {
      id: 'maxRevenue',
      label: 'Max Revenue',
      type: 'number'
    }
  ];

  // Load dashboard data
  useEffect(() => {
    fetchData();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    fetchData(newRange, filters);
  };

  // Handle filter change
  const handleFilterChange = (filterId, value) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  // Handle filter apply
  const handleFilterApply = (appliedFilters) => {
    setFilters(appliedFilters);
    fetchData(dateRange, appliedFilters);
    setShowFilters(false);
  };

  // Handle filter reset
  const handleFilterReset = () => {
    const resetFilters = {
      gameCategory: '',
      playerStatus: '',
      country: '',
      minRevenue: '',
      maxRevenue: ''
    };
    setFilters(resetFilters);
    fetchData(dateRange, resetFilters);
  };

  // Toggle filter menu
  const handleFilterMenuClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  // Close filter menu
  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  // Toggle filter panel
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
    handleFilterMenuClose();
  };

  // Fetch dashboard data from API or use test data
  const fetchData = async (dateRangeParam = dateRange, filtersParam = filters) => {
    setIsLoading(true);
    setError(null);

    // Handle test scenarios
    if (testScenario !== 'normal') {
      setTimeout(() => {
        switch (testScenario) {
          case 'empty':
            setDashboardData(generateEmptyData());
            setIsLoading(false);
            break;
          case 'partial':
            setDashboardData(generatePartialData());
            setIsLoading(false);
            break;
          case 'large':
            setDashboardData(generateLargeData());
            setIsLoading(false);
            break;
          case 'error':
            const errorObj = generateErrorData();
            setError(`Error connecting to API: ${errorObj.message}. This is a simulated error for testing.`);
            setDashboardData(generatePartialData()); // Show partial data with error
            setIsLoading(false);
            break;
          case 'loading':
            // Keep loading state active for testing
            break;
          default:
            setIsLoading(false);
        }
      }, 2000); // Simulate network delay

      // If we're testing loading state, don't proceed with the rest
      if (testScenario === 'loading') {
        return;
      }
    } else {
      try {
        // Prepare date parameters
        const startDate = dateRangeParam?.start ? format(dateRangeParam.start, 'yyyy-MM-dd') : null;
        const endDate = dateRangeParam?.end ? format(dateRangeParam.end, 'yyyy-MM-dd') : null;

        // Prepare filter parameters
        const filterParams = {
          startDate,
          endDate,
          gameCategory: filtersParam.gameCategory || undefined,
          playerStatus: filtersParam.playerStatus || undefined,
          country: filtersParam.country || undefined,
          minRevenue: filtersParam.minRevenue || undefined,
          maxRevenue: filtersParam.maxRevenue || undefined
        };

        // Get dashboard stats with filters
        const stats = await dashboardService.getDashboardStats(filterParams);

        // Get player registrations data with date range
        const playerRegistrations = await dashboardService.getPlayerRegistrations({
          startDate,
          endDate,
          playerStatus: filtersParam.playerStatus || undefined,
          country: filtersParam.country || undefined
        });

        // Get recent transactions with filters
        const recentTransactions = await dashboardService.getRecentTransactions({
          limit: 10,
          startDate,
          endDate,
          playerStatus: filtersParam.playerStatus || undefined,
          country: filtersParam.country || undefined
        });

        // Get top games with filters
        const topGames = await dashboardService.getTopGames({
          metric: 'revenue',
          limit: 5,
          startDate,
          endDate,
          category: filtersParam.gameCategory || undefined,
          minRevenue: filtersParam.minRevenue || undefined,
          maxRevenue: filtersParam.maxRevenue || undefined
        });

        // Get casino revenue with date range
        const casinoRevenue = await dashboardService.getCasinoRevenue({
          startDate,
          endDate,
          category: filtersParam.gameCategory || undefined
        });

        // Get KPI data with filters
        const kpis = await dashboardService.getKpiData({
          startDate,
          endDate,
          gameCategory: filtersParam.gameCategory || undefined,
          playerStatus: filtersParam.playerStatus || undefined,
          country: filtersParam.country || undefined
        });

        // Combine all data
        const apiData = {
          stats,
          playerRegistrations,
          recentTransactions,
          topGames,
          casinoRevenue,
          kpis,
          charts: {
            revenueByDay: casinoRevenue?.dailyRevenue || [],
            playersByGame: topGames?.map(game => ({ game: game.name, value: game.players })) || []
          }
        };

        setDashboardData(apiData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);

        // If API fails, fall back to mock data for demonstration
        const mockData = {
          stats: {
            revenue: {
              value: 12567.89,
              change: 15.2,
              period: 'vs last week'
            },
            players: {
              value: 1432,
              change: 7.5,
              period: 'vs last week'
            },
            newPlayers: {
              value: 256,
              change: 12.8,
              period: 'vs last week'
            },
            gamesPlayed: {
              value: 5621,
              change: -3.2,
              period: 'vs last week'
            }
          },
          topGames: [
            { name: 'Poker Pro', revenue: 3200.56, players: 432 },
            { name: 'Blackjack Masters', revenue: 2800.32, players: 387 },
            { name: 'Slots Royale', revenue: 2300.18, players: 356 },
            { name: 'Roulette King', revenue: 1900.45, players: 289 },
            { name: 'Baccarat Elite', revenue: 1450.67, players: 218 }
          ],
          charts: {
            revenueByDay: [
              { day: 'Mon', value: 2100 },
              { day: 'Tue', value: 2400 },
              { day: 'Wed', value: 1800 },
              { day: 'Thu', value: 2200 },
              { day: 'Fri', value: 2600 },
              { day: 'Sat', value: 3100 },
              { day: 'Sun', value: 2500 }
            ],
            playersByGame: [
              { game: 'Poker', value: 450 },
              { game: 'Slots', value: 380 },
              { game: 'Roulette', value: 240 },
              { game: 'Blackjack', value: 190 },
              { game: 'Baccarat', value: 165 }
            ]
          },
          recentTransactions: [
            { id: 1, playerId: 101, playerName: 'John Doe', amount: 100.00, type: 'deposit', timestamp: '2023-05-01T08:30:00Z' },
            { id: 2, playerId: 102, playerName: 'Jane Smith', amount: 50.00, type: 'withdrawal', timestamp: '2023-05-02T10:15:00Z' },
            { id: 3, playerId: 103, playerName: 'Mike Johnson', amount: 75.50, type: 'bet', timestamp: '2023-05-03T14:45:00Z' },
            { id: 4, playerId: 104, playerName: 'Lisa Brown', amount: 120.25, type: 'win', timestamp: '2023-05-04T09:20:00Z' },
            { id: 5, playerId: 105, playerName: 'Robert Wilson', amount: 200.00, type: 'deposit', timestamp: '2023-05-05T16:10:00Z' }
          ]
        };

        // Show error message but still display mock data
        setError(`Error connecting to API: ${error.message || 'Unknown error'}. Showing mock data instead.`);
        setDashboardData(mockData);
        setIsLoading(false);
      }
    }
  };

  // Handle test scenario change
  const handleTestScenarioChange = (event) => {
    const newScenario = event.target.value;
    setTestScenario(newScenario);
    fetchData(); // Refetch with new scenario
  };

  // Toggle test panel
  const handleToggleTestPanel = () => {
    setShowTestPanel(!showTestPanel);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Render loading state
  if (isLoading && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  // We'll show error as an alert but still display the dashboard with mock data
  // This is different from the loading state where we show a loading spinner

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Error Alert */}
      {error && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          borderRadius: 2
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {user?.firstName || 'User'}!
            </Typography>
            <Typography variant="body1">
              Here's an overview of your PP Reporter performance. Use the dashboard to monitor key metrics and gain insights.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleFilterMenuClick}
                startIcon={<FilterListIcon />}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.grey[100]
                  }
                }}
                aria-label="Open filter menu"
              >
                Filter
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.grey[100]
                  }
                }}
                aria-label="Refresh dashboard data"
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleToggleTestPanel}
                startIcon={<BugReportIcon />}
                sx={{
                  bgcolor: 'white',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.grey[100]
                  }
                }}
                aria-label="Toggle test panel"
              >
                Test
              </Button>

              {/* Filter Menu */}
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={handleFilterMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleToggleFilters}>
                  <ListItemIcon>
                    <TuneIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Advanced Filters</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleFilterReset}>
                  <ListItemIcon>
                    <ClearIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Reset Filters</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Test Panel */}
      {showTestPanel && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Test Data Scenarios
            </Typography>
            <Tooltip title="Close test panel">
              <IconButton onClick={handleToggleTestPanel} size="small" aria-label="Close test panel">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select a test scenario to simulate different data conditions and test the dashboard's behavior.
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="test-scenario-label">Test Scenario</InputLabel>
            <Select
              labelId="test-scenario-label"
              id="test-scenario-select"
              value={testScenario}
              label="Test Scenario"
              onChange={handleTestScenarioChange}
              aria-label="Select test scenario"
            >
              <MenuItem value="normal">Normal Data</MenuItem>
              <MenuItem value="empty">Empty Data</MenuItem>
              <MenuItem value="partial">Partial Data</MenuItem>
              <MenuItem value="large">Large Dataset</MenuItem>
              <MenuItem value="error">Error State</MenuItem>
              <MenuItem value="loading">Loading State</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Current scenario: <strong>{testScenario}</strong>
          </Typography>
        </Paper>
      )}

      {/* Date Range Picker */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={handleDateRangeChange}
          buttonLabel="Select Date Range"
        />
        <Typography variant="body2" color="text.secondary">
          Showing data from {dateRange.start ? format(dateRange.start, 'MMM d, yyyy') : 'all time'} to {dateRange.end ? format(dateRange.end, 'MMM d, yyyy') : 'present'}
        </Typography>
      </Box>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filterDefinitions}
          filterValues={filters}
          onFilterChange={handleFilterChange}
          onFilterApply={handleFilterApply}
          onFilterReset={handleFilterReset}
          title="Dashboard Filters"
        />
      )}

      {/* Dashboard Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          role="tablist"
        >
          <Tab
            label="Overview"
            id="tab-0"
            aria-controls="tabpanel-0"
            tabIndex={activeTab === 0 ? 0 : -1}
          />
          <Tab
            label="Performance"
            id="tab-1"
            aria-controls="tabpanel-1"
            tabIndex={activeTab === 1 ? 0 : -1}
          />
          <Tab
            label="Players"
            id="tab-2"
            aria-controls="tabpanel-2"
            tabIndex={activeTab === 2 ? 0 : -1}
          />
          <Tab
            label="Games"
            id="tab-3"
            aria-controls="tabpanel-3"
            tabIndex={activeTab === 3 ? 0 : -1}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0} label="Dashboard Overview">
        <OverviewTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1} label="Performance Metrics">
        <PerformanceTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={2} label="Player Analytics">
        <PlayersTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={3} label="Game Analytics">
        <GamesTab
          dashboardData={dashboardData}
          isLoading={isLoading}
          error={error}
          theme={theme}
        />
      </TabPanel>
    </Container>
  );
};

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value = 0, change = 0, period = '', icon, color, iconColor, isLoading, isCurrency = false }) {
  // Handle null or undefined values
  const safeValue = value !== null && value !== undefined ? value : 0;
  const safeChange = change !== null && change !== undefined ? change : 0;
  const safePeriod = period || 'vs last period';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { sx: { color: iconColor } })}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
          {isLoading
            ? <CircularProgress size={20} />
            : isCurrency
              ? `$${safeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : safeValue.toLocaleString()
          }
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {safeChange > 0 ? (
            <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
          ) : (
            <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />
          )}
          <Typography
            variant="body2"
            component="span"
            sx={{
              color: safeChange > 0 ? 'success.main' : 'error.main',
              fontWeight: 'medium'
            }}
          >
            {safeChange}%
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
            {safePeriod}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ApiDashboard;
