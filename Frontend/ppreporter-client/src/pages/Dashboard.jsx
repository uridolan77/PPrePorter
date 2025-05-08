import React, { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { motion, AnimatePresence } from 'framer-motion';

// Import the statcard component directly as it's small and used immediately
import StatCard from '../components/dashboard/StatCard';
import ErrorDisplay from '../components/common/ErrorDisplay';
import ContextualDataExplorer from '../components/dashboard/ContextualDataExplorer';

// Lazy load larger components that aren't needed immediately
const CasinoRevenueChart = lazy(() => import('../components/dashboard/CasinoRevenueChart'));
const PlayerRegistrationsChart = lazy(() => import('../components/dashboard/PlayerRegistrationsChart'));
const TopGamesChart = lazy(() => import('../components/dashboard/TopGamesChart'));
const RecentTransactionsTable = lazy(() => import('../components/dashboard/RecentTransactionsTable'));

import { 
  fetchDashboardData, 
  fetchRevenueChart, 
  fetchRegistrationsChart, 
  fetchTopGames, 
  fetchRecentTransactions,
  clearErrors,
  clearComponentError
} from '../store/slices/dashboardSlice';
import { formatPercentage } from '../utils/formatters';

// Loading placeholder component
const ChartSkeleton = () => (
  <Skeleton variant="rectangular" height={300} width="100%" animation="wave" />
);

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay) => ({
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

const Dashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { 
    summaryStats, 
    casinoRevenue,
    playerRegistrations,
    topGames,
    recentTransactions,
    isLoading,
    error,
    componentErrors
  } = useSelector((state) => state.dashboard);
  
  const [tabValue, setTabValue] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [visibleComponents, setVisibleComponents] = useState({
    revenue: false,
    registrations: false,
    topGames: false,
    transactions: false
  });
  
  // New state for enhanced dashboard features
  const [advancedViewMode, setAdvancedViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedView, setExpandedView] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const dashboardRef = useRef(null);
  const [focusTransition, setFocusTransition] = useState(false);
  
  // On initial mount, load only summary stats for immediate display
  useEffect(() => {
    loadDashboardSummary();
    
    // Set up intersection observer for lazy loading
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observerCallback = (entries) => {
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
  
  const loadDashboardSummary = () => {
    dispatch(fetchDashboardData({
      playMode: getPlayModeFromTab(tabValue)
    }));
    setLastRefreshed(new Date());
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Clear any existing errors when changing tabs
    dispatch(clearErrors());
    
    // Reload visible components with new filter
    loadDashboardSummary();
  };
  
  const handleAdvancedViewTabChange = (event, newValue) => {
    // Create a transition effect when changing tabs
    setFocusTransition(true);
    setTimeout(() => {
      setActiveTab(newValue);
      setFocusTransition(false);
    }, 300);
  };
  
  const handleRefresh = () => {
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
  };
  
  const handleRetryComponent = (component) => {
    const params = { playMode: getPlayModeFromTab(tabValue) };
    dispatch(clearComponentError(component));
    
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
  };
  
  const getPlayModeFromTab = (tab) => {
    switch (tab) {
      case 0: return null; // All
      case 1: return 'Casino';
      case 2: return 'Sport';
      case 3: return 'Live';
      case 4: return 'Bingo';
      default: return null;
    }
  };
  
  const toggleAdvancedView = () => {
    setAdvancedViewMode(!advancedViewMode);
  };
  
  const toggleExpandSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
      setExpandedView(false);
    } else {
      setExpandedSection(section);
      setExpandedView(true);
    }
  };
  
  const handleAnnotationCreate = (annotation) => {
    setAnnotations([...annotations, annotation]);
  };
  
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" component="h1">
          Today's Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </Typography>
          
          <Tooltip title="Toggle advanced view">
            <Button
              variant={advancedViewMode ? "contained" : "outlined"}
              color="primary"
              size="small"
              startIcon={<InsightsIcon />}
              onClick={toggleAdvancedView}
            >
              {advancedViewMode ? "Standard View" : "Advanced View"}
            </Button>
          </Tooltip>
          
          <Tooltip title="Refresh dashboard data">
            <IconButton 
              onClick={handleRefresh}
              color="primary"
              aria-label="refresh dashboard"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {!advancedViewMode ? (
        <>
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
            <AnimatePresence>
              <Grid container spacing={3}>
                {['registrations', 'ftd', 'deposits', 'revenue'].map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={stat}>
                    <motion.div
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <StatCard
                        title={stat === 'ftd' ? 'FTD' : stat.charAt(0).toUpperCase() + stat.slice(1)}
                        value={summaryStats?.[stat] || 0}
                        prefix={stat === 'deposits' || stat === 'revenue' ? '£' : ''}
                        icon={stat === 'registrations' || stat === 'ftd' ? <PersonAddIcon /> : <AttachMoneyIcon />}
                        change={summaryStats?.[`${stat}Change`] || 0}
                        changeIcon={
                          (summaryStats?.[`${stat}Change`] || 0) >= 0 ? 
                            <TrendingUpIcon color="success" /> : 
                            <TrendingDownIcon color="error" />
                        }
                        changeText={`${formatPercentage(summaryStats?.[`${stat}Change`] || 0)} vs yesterday`}
                        isLoading={isLoading}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </AnimatePresence>
          )}
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {{
              revenue: { title: 'Revenue (Last 7 days)', data: casinoRevenue },
              registrations: { title: 'Player Registrations (Last 7 days)', data: playerRegistrations },
              topGames: { title: 'Top Games', data: topGames },
              transactions: { title: 'Recent Transactions', data: recentTransactions }
            }[Object.keys(visibleComponents).find(key => visibleComponents[key])]?.map((section, index) => (
              <Grid item xs={12} md={6} key={section.id}>
                <motion.div
                  custom={index + 4}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card id={section.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          {section.title}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleExpandSection(section.id)}
                          color={expandedSection === section.id ? "primary" : "default"}
                        >
                          <FullscreenIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {componentErrors[section.id] ? (
                        <ErrorDisplay 
                          error={componentErrors[section.id]} 
                          title={`Failed to load ${section.title.toLowerCase()}`}
                          onRetry={() => handleRetryComponent(section.id)}
                        />
                      ) : (
                        <Suspense fallback={<ChartSkeleton />}>
                          {section.id === 'revenue' && <CasinoRevenueChart data={casinoRevenue} isLoading={!visibleComponents.revenue} />}
                          {section.id === 'registrations' && <PlayerRegistrationsChart data={playerRegistrations} isLoading={!visibleComponents.registrations} />}
                          {section.id === 'topGames' && <TopGamesChart data={topGames} isLoading={!visibleComponents.topGames} />}
                          {section.id === 'transactions' && <RecentTransactionsTable data={recentTransactions} isLoading={!visibleComponents.transactions} />}
                        </Suspense>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
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
                          {expandedSection === 'transactions' && <RecentTransactionsTable data={recentTransactions} isLoading={!visibleComponents.transactions} height={600} />}
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
                    <ContextualDataExplorer
                      onAnnotationCreate={handleAnnotationCreate}
                    />
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
                        <ContextualDataExplorer
                          onAnnotationCreate={handleAnnotationCreate}
                        />
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
                        <ContextualDataExplorer
                          onAnnotationCreate={handleAnnotationCreate}
                        />
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
                        <ContextualDataExplorer
                          onAnnotationCreate={handleAnnotationCreate}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </TabPanel>
              </Box>
            </Fade>
          </TabContext>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;