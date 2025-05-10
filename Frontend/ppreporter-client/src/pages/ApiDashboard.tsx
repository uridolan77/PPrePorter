import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  CircularProgress,
  Button,
  Alert,
  Typography,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

import { useAuth } from '../hooks/useAuth';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import DateRangePicker from '../components/common/DateRangePicker';
import FilterPanel from '../components/common/FilterPanel';
import dashboardService from '../services/api/dashboardService';

// Test data generators
import {
  generateEmptyData,
  generatePartialData,
  generateLargeData,
  generateErrorData
} from '../utils/testDataGenerator';

// Dashboard components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import TestPanel from '../components/dashboard/TestPanel';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import DashboardCharts from '../components/dashboard/DashboardCharts';

// Types
import { DashboardStats, DashboardChartData, RevenueDataPoint, GameDataPoint } from '../types/dashboard';
import { DashboardFilters } from '../types/redux';

// Filter definition type
interface FilterDefinition {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'number' | 'date' | 'daterange' | 'boolean' | 'radio';
  options?: Array<{ value: string; label: string }>;
}

// Dashboard data interface
interface DashboardData {
  stats?: DashboardStats;
  playerRegistrations?: any[];
  recentTransactions?: any[];
  topGames?: any[];
  casinoRevenue?: any;
  kpis?: any;
  charts?: DashboardChartData;
}

/**
 * API Dashboard component that connects to the backend API
 */
const ApiDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);

  // Test data scenario state
  const [testScenario, setTestScenario] = useState<string>('normal');
  const [showTestPanel, setShowTestPanel] = useState<boolean>(false);

  // Date range state
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date())
  });

  // Filter state
  const [filters, setFilters] = useState<{
    gameCategory: string;
    playerStatus: string;
    country: string;
    minRevenue: string;
    maxRevenue: string;
  }>({
    gameCategory: '',
    playerStatus: '',
    country: '',
    minRevenue: '',
    maxRevenue: ''
  });

  // Filter definitions
  const filterDefinitions: FilterDefinition[] = [
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
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  // Handle date range change
  const handleDateRangeChange = (newRange: { start: Date | null; end: Date | null }): void => {
    if (newRange.start && newRange.end) {
      setDateRange({
        start: newRange.start,
        end: newRange.end
      });
      fetchData({
        start: newRange.start,
        end: newRange.end
      }, filters);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterId: string, value: string): void => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  // Handle filter apply
  const handleFilterApply = (): void => {
    fetchData(dateRange, filters);
    setShowFilters(false);
  };

  // Handle filter reset
  const handleFilterReset = (): void => {
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
  const handleFilterMenuClick = (event: React.MouseEvent<HTMLElement>): void => {
    setFilterMenuAnchor(event.currentTarget);
  };

  // Close filter menu
  const handleFilterMenuClose = (): void => {
    setFilterMenuAnchor(null);
  };

  // Toggle filter panel
  const handleToggleFilters = (): void => {
    setShowFilters(!showFilters);
    handleFilterMenuClose();
  };

  // Fetch dashboard data from API or use test data
  const fetchData = async (
    dateRangeParam = dateRange,
    filtersParam = filters
  ): Promise<void> => {
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
            setError(new Error(`Error connecting to API: ${errorObj.message}. This is a simulated error for testing.`));
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
        const filterParams: DashboardFilters = {
          startDate,
          endDate,
          gameCategory: filtersParam.gameCategory || undefined,
          playerStatus: filtersParam.playerStatus || undefined,
          country: filtersParam.country || undefined,
          minRevenue: filtersParam.minRevenue ? Number(filtersParam.minRevenue) : undefined,
          maxRevenue: filtersParam.maxRevenue ? Number(filtersParam.maxRevenue) : undefined
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
          gameCategory: filtersParam.gameCategory || undefined,
          minRevenue: filtersParam.minRevenue ? Number(filtersParam.minRevenue) : undefined,
          maxRevenue: filtersParam.maxRevenue ? Number(filtersParam.maxRevenue) : undefined
        });

        // Get casino revenue with date range
        const casinoRevenue = await dashboardService.getCasinoRevenue({
          startDate,
          endDate,
          gameCategory: filtersParam.gameCategory || undefined
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
        const apiData: DashboardData = {
          stats,
          playerRegistrations,
          recentTransactions,
          topGames,
          casinoRevenue,
          kpis,
          charts: {
            revenueByDay: casinoRevenue?.dailyRevenue?.map(item => ({
              ...item,
              day: item.day || format(new Date(item.date), 'EEE'),
              value: item.value || item.revenue
            })) || [],
            playersByGame: topGames?.map(game => ({
              game: game.name,
              value: game.players
            })) || []
          }
        };

        setDashboardData(apiData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);

        // If API fails, fall back to mock data for demonstration
        const mockData: DashboardData = {
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
            games: {
              value: 256,
              change: 12.8,
              period: 'vs last week'
            },
            engagement: {
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
        setError(new Error(`Error connecting to API: ${(error as Error).message || 'Unknown error'}. Showing mock data instead.`));
        setDashboardData(mockData);
        setIsLoading(false);
      }
    }
  };

  // Handle test scenario change
  const handleTestScenarioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newScenario = event.target.value;
    setTestScenario(newScenario);
    fetchData(); // Refetch with new scenario
  };

  // Toggle test panel
  const handleToggleTestPanel = (): void => {
    setShowTestPanel(!showTestPanel);
  };

  // Handle refresh
  const handleRefresh = (): void => {
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
          {error.message}
        </Alert>
      )}

      {/* Dashboard Header */}
      <DashboardHeader
        user={user || undefined}
        onRefresh={handleRefresh}
        onToggleFilters={handleToggleFilters}
        onFilterReset={handleFilterReset}
        onToggleTestPanel={handleToggleTestPanel}
        filterMenuAnchor={filterMenuAnchor}
        onFilterMenuClick={handleFilterMenuClick}
        onFilterMenuClose={handleFilterMenuClose}
        showTestPanel={showTestPanel}
      />

      {/* Test Panel */}
      {showTestPanel && (
        <TestPanel
          testScenario={testScenario}
          onTestScenarioChange={handleTestScenarioChange}
          onClose={handleToggleTestPanel}
        />
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
          values={filters}
          onChange={handleFilterChange}
          onApply={() => handleFilterApply()}
          onReset={handleFilterReset}
          title="Dashboard Filters"
        />
      )}

      {/* Dashboard Tabs */}
      <DashboardTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        dashboardData={dashboardData}
        isLoading={isLoading}
        error={error}
        theme={theme}
      />
    </Container>
  );
};

export default ApiDashboard;
