import React, { Suspense, lazy, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectSummaryStats,
  selectCasinoRevenue,
  selectPlayerRegistrations,
  selectTopGames,
  selectRecentTransactions,
  selectHeatmapData,
  selectPlayerJourneyData,
  selectSegmentComparisonData,
  selectDashboardLoading,
  selectDashboardError,
  selectComponentErrors
} from '../store/selectors';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Tab,
  Tabs,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
  Button,
  Fade,
  Zoom,
  Paper,
  Collapse,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import CasinoIcon from '@mui/icons-material/Casino';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import InsightsIcon from '@mui/icons-material/Insights';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { motion, AnimatePresence } from 'framer-motion';

// Import smaller components directly as they're used immediately
import ErrorDisplay from '../components/common/ErrorDisplay';
import AdvancedDashboardHeader from '../components/dashboard/AdvancedDashboardHeader';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import DashboardCharts from '../components/dashboard/DashboardCharts';

// Lazy load all larger components for better performance
const ContextualDataExplorer = lazy(() => import('../components/dashboard/ContextualDataExplorer'));
const CasinoRevenueChart = lazy(() => import('../components/dashboard/CasinoRevenueChart'));
const PlayerRegistrationsChart = lazy(() => import('../components/dashboard/PlayerRegistrationsChart'));
const TopGamesChart = lazy(() => import('../components/dashboard/TopGamesChart'));
const RecentTransactionsTable = lazy(() => import('../components/dashboard/RecentTransactionsTable'));
const DashboardTabs = lazy(() => import('../components/dashboard/DashboardTabs'));
const AdvancedDashboard = lazy(() => import('../components/dashboard/AdaptiveDashboard'));

import {
  fetchDashboardData,
  fetchRevenueChart,
  fetchRegistrationsChart,
  fetchTopGames,
  fetchRecentTransactions,
  fetchHeatmapData,
  fetchPlayerJourneyData,
  fetchSegmentComparisonData,
  fetchMicroChartsData,
  fetchContextualExplorerData,
  fetchUserPreferences,
  saveUserPreferences,
  clearErrors,
  clearComponentError
} from '../store/slices/dashboardSlice';
import { formatPercentage } from '../utils/formatters';
import { AppDispatch } from '../store/store';
import { DashboardComponentErrors } from '../types/dashboard';

// Types
interface Annotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  timestamp: Date;
  [key: string]: any;
}

interface VisibleComponents {
  revenue: boolean;
  registrations: boolean;
  topGames: boolean;
  transactions: boolean;
  [key: string]: boolean;
}

// Loading placeholder component
const ChartSkeleton: React.FC = () => (
  <Skeleton variant="rectangular" height={300} width="100%" animation="wave" />
);

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: delay * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  // Use memoized selectors for better performance
  const summaryStats = useSelector(selectSummaryStats);
  const casinoRevenue = useSelector(selectCasinoRevenue);
  const playerRegistrations = useSelector(selectPlayerRegistrations);
  const topGames = useSelector(selectTopGames);
  const recentTransactions = useSelector(selectRecentTransactions);
  const heatmapData = useSelector(selectHeatmapData);
  const playerJourneyData = useSelector(selectPlayerJourneyData);
  const segmentComparisonData = useSelector(selectSegmentComparisonData);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const componentErrors = useSelector(selectComponentErrors);

  const [tabValue, setTabValue] = useState<number>(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [visibleComponents, setVisibleComponents] = useState<VisibleComponents>({
    revenue: false,
    registrations: false,
    topGames: false,
    transactions: false
  });

  // New state for enhanced dashboard features
  const [advancedViewMode, setAdvancedViewMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [focusTransition, setFocusTransition] = useState<boolean>(false);

  // On initial mount, load only summary stats for immediate display
  useEffect(() => {
    loadDashboardSummary();

    // Set up intersection observer for lazy loading
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const componentId = entry.target.id;
          setVisibleComponents(prev => ({
            ...prev,
            [componentId]: true
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe chart containers
    ['revenue', 'registrations', 'topGames', 'transactions'].forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      ['revenue', 'registrations', 'topGames', 'transactions'].forEach(id => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, []);

  // Load individual components based on visibility
  useEffect(() => {
    const params = { playMode: getPlayModeFromTab(tabValue) };

    if (visibleComponents.revenue) {
      dispatch(fetchRevenueChart(params));
    }

    if (visibleComponents.registrations) {
      dispatch(fetchRegistrationsChart(params));
    }

    if (visibleComponents.topGames) {
      dispatch(fetchTopGames(params));
    }

    if (visibleComponents.transactions) {
      dispatch(fetchRecentTransactions(params));
    }
  }, [visibleComponents, tabValue, dispatch]);

  // Memoized function to load dashboard summary
  const loadDashboardSummary = useCallback(() => {
    dispatch(fetchDashboardData({
      playMode: getPlayModeFromTab(tabValue)
    }));
    setLastRefreshed(new Date());
  }, [dispatch, tabValue]);

  // Memoized tab change handler
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    // Clear any existing errors when changing tabs
    dispatch(clearErrors());

    // Reload visible components with new filter
    loadDashboardSummary();
  }, [dispatch, loadDashboardSummary]);

  // Memoized advanced view tab change handler
  const handleAdvancedViewTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    // Create a transition effect when changing tabs
    setFocusTransition(true);
    setTimeout(() => {
      setActiveTab(newValue);
      setFocusTransition(false);
    }, 300);
  }, []);

  // Memoized refresh handler
  const handleRefresh = useCallback(() => {
    loadDashboardSummary();

    // Also refresh any visible components
    const params = { playMode: getPlayModeFromTab(tabValue) };

    if (visibleComponents.revenue) {
      dispatch(fetchRevenueChart(params));
    }

    if (visibleComponents.registrations) {
      dispatch(fetchRegistrationsChart(params));
    }

    if (visibleComponents.topGames) {
      dispatch(fetchTopGames(params));
    }

    if (visibleComponents.transactions) {
      dispatch(fetchRecentTransactions(params));
    }
  }, [dispatch, loadDashboardSummary, tabValue, visibleComponents]);

  // Memoized retry component handler
  const handleRetryComponent = useCallback((component: keyof DashboardComponentErrors) => {
    const params = { playMode: getPlayModeFromTab(tabValue) };
    dispatch(clearComponentError(component as string));

    switch (component) {
      case 'revenue':
        dispatch(fetchRevenueChart(params));
        break;
      case 'registrations':
        dispatch(fetchRegistrationsChart(params));
        break;
      case 'topGames':
        dispatch(fetchTopGames(params));
        break;
      case 'transactions':
        dispatch(fetchRecentTransactions(params));
        break;
      default:
        break;
    }
  }, [dispatch, tabValue]);

  // Memoized function to get play mode from tab
  const getPlayModeFromTab = useCallback((tab: number): string | null => {
    switch (tab) {
      case 0: return null; // All
      case 1: return 'Casino';
      case 2: return 'Sport';
      case 3: return 'Live';
      case 4: return 'Bingo';
      default: return null;
    }
  }, []);

  // Memoized toggle advanced view handler
  const toggleAdvancedView = useCallback(() => {
    setAdvancedViewMode(prev => !prev);
  }, []);

  // Memoized toggle expand section handler
  const toggleExpandSection = useCallback((section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
      setExpandedView(false);
    } else {
      setExpandedSection(section);
      setExpandedView(true);
    }
  }, [expandedSection]);

  // Memoized annotation create handler
  const handleAnnotationCreate = useCallback((annotation: any) => {
    setAnnotations(prev => [...prev, annotation]);
  }, []);

  if (isLoading && !summaryStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', px: 2 }}>
        <ErrorDisplay
          error={error}
          title="Failed to load dashboard"
          onRetry={handleRefresh}
        />
      </Box>
    );
  }

  return (
    <Box ref={dashboardRef}>
      <AdvancedDashboardHeader
        lastUpdated={lastRefreshed}
        onRefresh={handleRefresh}
        onViewChange={toggleAdvancedView}
        advancedViewMode={advancedViewMode}
      />

      {!advancedViewMode ? (
        <>
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              <Tab label="All" icon={<SportsEsportsIcon />} iconPosition="start" />
              <Tab label="Casino" icon={<CasinoIcon />} iconPosition="start" />
              <Tab label="Sport" icon={<SportsSoccerIcon />} iconPosition="start" />
              <Tab label="Live" icon={<VideogameAssetIcon />} iconPosition="start" />
              <Tab label="Bingo" icon={<VideogameAssetIcon />} iconPosition="start" />
            </Tabs>

            {componentErrors.summary ? (
              <Box sx={{ mb: 3 }}>
                <ErrorDisplay
                  error={componentErrors.summary}
                  title="Failed to load summary data"
                  onRetry={() => loadDashboardSummary()}
                />
              </Box>
            ) : (
              <DashboardMetrics
                stats={summaryStats}
                loading={isLoading}
                error={componentErrors.summary}
                title="Key Metrics"
              />
            )}

            <DashboardCharts
              data={{
                revenueByDay: casinoRevenue,
                playersByGame: topGames as any
              }}
              loading={isLoading}
              error={error ? new Error(error) : null}
              title="Performance Metrics"
              timePeriod="week"
              onTimePeriodChange={(period) => console.log(`Time period changed to ${period}`)}
            />
          </Suspense>

          {/* Expanded view modal */}
          <Fade in={expandedView}>
            <Box
              sx={{
                display: expandedView ? 'flex' : 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1300,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setExpandedView(false)}
            >
              <Zoom in={expandedView}>
                <Box
                  sx={{
                    width: '90%',
                    height: '90%',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 1,
                    boxShadow: 24,
                    p: 4,
                    overflow: 'auto'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {expandedSection && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5">
                          {{
                            revenue: 'Revenue (Last 7 days)',
                            registrations: 'Player Registrations (Last 7 days)',
                            topGames: 'Top Games',
                            transactions: 'Recent Transactions'
                          }[expandedSection]}
                        </Typography>
                        <IconButton onClick={() => setExpandedView(false)}>
                          <FullscreenExitIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ height: 'calc(100% - 60px)' }}>
                        <Suspense fallback={<ChartSkeleton />}>
                          {expandedSection === 'revenue' && <CasinoRevenueChart data={casinoRevenue} isLoading={!visibleComponents.revenue} height={600} />}
                          {expandedSection === 'registrations' && <PlayerRegistrationsChart data={playerRegistrations} isLoading={!visibleComponents.registrations} height={600} />}
                          {expandedSection === 'topGames' && <TopGamesChart data={topGames} isLoading={!visibleComponents.topGames} height={600} />}
                          {expandedSection === 'transactions' && <RecentTransactionsTable data={recentTransactions} isLoading={!visibleComponents.transactions} />}
                        </Suspense>
                      </Box>
                    </>
                  )}
                </Box>
              </Zoom>
            </Box>
          </Fade>
        </>
      ) : (
        // Advanced view with ContextualDataExplorer
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>}>
          <Box sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={activeTab}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleAdvancedViewTabChange} variant="scrollable" scrollButtons="auto">
                  <Tab icon={<BubbleChartIcon />} iconPosition="start" label="Data Explorer" value="1" />
                  <Tab icon={<InsightsIcon />} iconPosition="start" label="Trend Analysis" value="2" />
                  <Tab icon={<CompareArrowsIcon />} iconPosition="start" label="What-If Scenarios" value="3" />
                  <Tab icon={<DashboardCustomizeIcon />} iconPosition="start" label="Custom Views" value="4" />
                </TabList>
              </Box>

              <Fade in={!focusTransition}>
                <Box>
                  <TabPanel value="1" sx={{ p: 0, pt: 2 }}>
                    <Paper elevation={0} sx={{ height: '80vh', borderRadius: 2, overflow: 'hidden' }}>
                      <Suspense fallback={<ChartSkeleton />}>
                        <ContextualDataExplorer
                          onAnnotationCreate={handleAnnotationCreate}
                          onExplore={(params) => {
                            dispatch(fetchContextualExplorerData(params));
                          }}
                        />
                      </Suspense>
                    </Paper>
                  </TabPanel>

                  <TabPanel value="2" sx={{ p: 0, pt: 2 }}>
                    <Paper elevation={0} sx={{ height: '80vh', borderRadius: 2, overflow: 'hidden', p: 2 }}>
                      <Typography variant="h5" gutterBottom>Trend Analysis</Typography>
                      <Typography paragraph color="text.secondary">
                        Analyze trends across different time periods and game types. Identify patterns and seasonality in player behavior.
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Suspense fallback={<ChartSkeleton />}>
                            <ContextualDataExplorer
                              onAnnotationCreate={handleAnnotationCreate}
                              onExplore={(params) => {
                                dispatch(fetchHeatmapData({
                                  ...params,
                                  timeFrame: 'all'
                                }));
                              }}
                              data={heatmapData}
                            />
                          </Suspense>
                        </Grid>
                      </Grid>
                    </Paper>
                  </TabPanel>

                  <TabPanel value="3" sx={{ p: 0, pt: 2 }}>
                    <Paper elevation={0} sx={{ height: '80vh', borderRadius: 2, overflow: 'hidden', p: 2 }}>
                      <Typography variant="h5" gutterBottom>What-If Scenarios</Typography>
                      <Typography paragraph color="text.secondary">
                        Model different business scenarios and see their potential impact on your metrics. Adjust parameters to simulate various outcomes.
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Suspense fallback={<ChartSkeleton />}>
                            <ContextualDataExplorer
                              onAnnotationCreate={handleAnnotationCreate}
                            />
                          </Suspense>
                        </Grid>
                      </Grid>
                    </Paper>
                  </TabPanel>

                  <TabPanel value="4" sx={{ p: 0, pt: 2 }}>
                    <Paper elevation={0} sx={{ height: '80vh', borderRadius: 2, overflow: 'hidden', p: 2 }}>
                      <Typography variant="h5" gutterBottom>Custom Views</Typography>
                      <Typography paragraph color="text.secondary">
                        Create and manage custom dashboard views. Save your preferred metrics and visualizations for quick access.
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Suspense fallback={<ChartSkeleton />}>
                            <ContextualDataExplorer
                              onAnnotationCreate={handleAnnotationCreate}
                            />
                          </Suspense>
                        </Grid>
                      </Grid>
                    </Paper>
                  </TabPanel>
                </Box>
              </Fade>
            </TabContext>
          </Box>
        </Suspense>
      )}
    </Box>
  );
};

export default Dashboard;
