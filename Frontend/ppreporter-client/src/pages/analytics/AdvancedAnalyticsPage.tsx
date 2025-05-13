import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
  IconButton,
  Tooltip
} from '@mui/material';
import SimpleBox from '../../components/common/SimpleBox';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Import common components
import TabPanel from '../../components/common/TabPanel';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';

// Import tab content components
import {
  OverviewTabContent,
  PerformanceTabContent,
  PlayerAnalysisTabContent,
  GameAnalysisTabContent,
  AdvancedVisualizationsTabContent
} from './components';

// Import mock data
import dashboardMockData from '../../mockData/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

/**
 * Analytics tab interface
 */
interface AnalyticsTab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
}

/**
 * Dashboard data interface
 */
interface DashboardData {
  /** Revenue data */
  revenue: any[];
  /** Player data */
  players: any[];
  /** Top games data */
  topGames: any[];
  /** KPI metrics data */
  kpi: Record<string, any>;
  /** Recent transactions data */
  recentTransactions?: any[];
}

// Define analytics tabs
const ANALYTICS_TABS: AnalyticsTab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'players', label: 'Player Analysis' },
  { id: 'games', label: 'Game Analysis' },
  { id: 'advanced', label: 'Advanced Visualizations' }
];

/**
 * AdvancedAnalyticsPage component
 *
 * A comprehensive analytics dashboard with various chart types and visualizations.
 * Features include:
 * - Multiple tabs for different analytics views (Overview, Performance, Players, Games, Advanced)
 * - Interactive charts and visualizations
 * - Time period filtering
 * - Data refresh functionality
 * - Responsive design for mobile and desktop
 *
 * @returns React component
 */
const AdvancedAnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<string>('month');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    revenue: [],
    players: [],
    topGames: [],
    kpi: {},
    recentTransactions: []
  });

  /**
   * Load dashboard data based on selected time period
   */
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        // Fetch data from mock services
        const revenueData = dashboardMockData.casinoRevenueMockData.getRevenueData({ period: timePeriod });
        const playerData = dashboardMockData.playerRegistrationsMockData.getRegistrationsData({ period: timePeriod });
        const topGamesData = dashboardMockData.topGamesMockData.getTopGames();
        const kpiData = dashboardMockData.kpiMockData.kpiData;

        // Update state with fetched data, ensuring all data is properly formatted
        setDashboardData({
          revenue: Array.isArray(revenueData) ? revenueData : [],
          players: Array.isArray(playerData) ? playerData : [],
          topGames: Array.isArray(topGamesData) ? topGamesData : [],
          kpi: kpiData || {}
        });
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setIsLoading(false);
      }
    }, 1000);

    // Clean up timer on component unmount or when dependencies change
    return () => clearTimeout(timer);
  }, [timePeriod]);

  /**
   * Handle tab change
   * @param _event - React synthetic event
   * @param newValue - New tab index
   */
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  /**
   * Handle time period change
   * @param event - Select change event
   */
  const handleTimePeriodChange = (event: SelectChangeEvent): void => {
    setTimePeriod(event.target.value);
  };

  /**
   * Handle refresh button click
   * Reloads dashboard data with current settings
   */
  const handleRefresh = (): void => {
    setIsLoading(true);
    setError(null);
    setLastUpdated(new Date());

    // Simulate refresh by triggering the useEffect
    // This is done by creating a new reference for timePeriod
    const currentPeriod = timePeriod;
    setTimePeriod('refreshing');

    // Set it back to original value after a short delay
    setTimeout(() => {
      setTimePeriod(currentPeriod);
    }, 100);
  };

  /**
   * Format last updated time for display
   */
  const formattedLastUpdated = lastUpdated.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <>
      <Helmet>
        <title>Advanced Analytics | PPrePorter</title>
        <meta name="description" content="Advanced analytics dashboard with comprehensive data visualizations and insights" />
      </Helmet>

      <Container maxWidth="xl">
        {/* Header */}
        <SimpleBox
          component="header"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            mt: 2
          }}
        >
          <Typography variant="h4" component="h1">
            Advanced Analytics
          </Typography>
          <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mr: 2 }}
              aria-live="polite"
            >
              Last updated: {formattedLastUpdated}
            </Typography>
            <Tooltip title="Refresh data">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading}
                  aria-label="Refresh data"
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </SimpleBox>
        </SimpleBox>

        {/* Tabs */}
        <SimpleBox
          component="nav"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          role="navigation"
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="Analytics dashboard tabs"
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {ANALYTICS_TABS.map((tab, index) => (
              <Tab
                key={tab.id}
                label={tab.label}
                id={`tab-${tab.id}`}
                aria-controls={`tabpanel-${tab.id}`}
                disabled={isLoading}
              />
            ))}
          </Tabs>
        </SimpleBox>

        {/* Error display */}
        {error && (
          <Paper
            sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}
            role="alert"
            aria-live="assertive"
          >
            <Typography color="error" variant="h6">
              Error
            </Typography>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Tab Content */}
        <SimpleBox component="main">
          <ErrorBoundary
            fallback={
              <EmptyState
                message="Something went wrong loading the analytics dashboard"
                icon={<InfoOutlinedIcon />}
              />
            }
          >
            {/* Render tab panels */}
            {ANALYTICS_TABS.map((tab, index) => (
              <div
                key={tab.id}
                role="tabpanel"
                hidden={activeTab !== index}
                id={`tabpanel-${tab.id}`}
                aria-labelledby={`tab-${tab.id}`}
              >
                {activeTab === index && (
                  <>
                    {index === 0 && (
                      <OverviewTabContent
                        dashboardData={dashboardData}
                        isLoading={isLoading}
                        timePeriod={timePeriod}
                        onTimePeriodChange={handleTimePeriodChange}
                      />
                    )}

                    {index === 1 && (
                      <PerformanceTabContent
                        dashboardData={dashboardData}
                        isLoading={isLoading}
                      />
                    )}

                    {index === 2 && (
                      <PlayerAnalysisTabContent
                        dashboardData={dashboardData}
                        isLoading={isLoading}
                      />
                    )}

                    {index === 3 && (
                      <GameAnalysisTabContent
                        dashboardData={dashboardData}
                        isLoading={isLoading}
                      />
                    )}

                    {index === 4 && (
                      <AdvancedVisualizationsTabContent
                        dashboardData={dashboardData}
                        isLoading={isLoading}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </ErrorBoundary>
        </SimpleBox>
      </Container>
    </>
  );
};

export default AdvancedAnalyticsPage;
