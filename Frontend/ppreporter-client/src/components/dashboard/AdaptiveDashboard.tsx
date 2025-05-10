import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import CasinoRevenueChart from './CasinoRevenueChart';
import PlayerRegistrationsChart from './PlayerRegistrationsChart';
import TopGamesChart from './TopGamesChart';
import MultiDimensionalRadarChart from './MultiDimensionalRadarChart';
import EnhancedDataTable from './EnhancedDataTable';
import { MicroSparkline, MicroBarChart } from './MicroCharts';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { AppState, AppDispatch } from '../../store/store';
import { CommonProps } from '../../types/common';
import { DashboardStats } from '../../types/dashboard';

interface AdaptiveDashboardProps extends CommonProps {
  data?: DashboardStats | null;
  isLoading?: boolean;
  error?: Error | null;
  tab?: string;
  onRefresh?: () => void;
  onConfigChange?: (config: any) => void;
}

interface DashboardConfig {
  layout: 'grid' | 'list';
  density: 'comfortable' | 'compact';
  highContrast: boolean;
  animations: boolean;
  fullscreenWidget: string | null;
  visibleWidgets: string[];
  widgetPreferences: Record<string, any>;
}

/**
 * Adaptive Dashboard component
 * A flexible dashboard that adapts to different screen sizes and user preferences
 */
const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  data,
  isLoading = false,
  error = null,
  tab = 'overview',
  onRefresh,
  onConfigChange,
  sx
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Dashboard configuration state
  const [dashConfig, setDashConfig] = useState<DashboardConfig>({
    layout: 'grid', // grid, list
    density: 'comfortable', // comfortable, compact
    highContrast: false,
    animations: true,
    fullscreenWidget: null,
    visibleWidgets: [
      'revenue',
      'registrations',
      'topGames',
      'playerAnalysis',
      'recentActivity'
    ],
    widgetPreferences: {
      // Specific widget preferences (chart types, etc.)
    }
  });

  // Handle configuration changes
  const handleConfigChange = (changes: Partial<DashboardConfig>): void => {
    const newConfig = { ...dashConfig, ...changes };
    setDashConfig(newConfig);

    if (onConfigChange) {
      onConfigChange(newConfig);
    }
  };

  // Toggle fullscreen for a widget
  const toggleFullscreen = (widgetId: string | null): void => {
    handleConfigChange({
      fullscreenWidget: dashConfig.fullscreenWidget === widgetId ? null : widgetId
    });
  };

  // Determine grid sizing based on layout and screen size
  const getGridSize = (widgetId: string): { xs: number; sm: number; md: number } => {
    // If a widget is in fullscreen mode
    if (dashConfig.fullscreenWidget === widgetId) {
      return { xs: 12, sm: 12, md: 12 };
    }

    // Default sizes based on widget type and layout
    switch (widgetId) {
      case 'revenue':
      case 'registrations':
        return { xs: 12, sm: 6, md: dashConfig.layout === 'grid' ? 6 : 12 };
      case 'topGames':
      case 'playerAnalysis':
        return { xs: 12, sm: 12, md: dashConfig.layout === 'grid' ? 6 : 12 };
      case 'recentActivity':
        return { xs: 12, sm: 12, md: 12 };
      default:
        return { xs: 12, sm: 6, md: 6 };
    }
  };

  // Widget height based on density setting
  const getWidgetHeight = (widgetId: string): number => {
    if (dashConfig.fullscreenWidget === widgetId) {
      return 600; // Fullscreen height
    }

    switch (dashConfig.density) {
      case 'compact':
        return 280;
      case 'comfortable':
        return 350;
      default:
        return 350;
    }
  };

  // Render a widget with consistent styling
  const renderWidget = (
    widgetId: string,
    title: string,
    content: React.ReactNode,
    description?: string
  ): React.ReactNode => {
    // Skip if widget is not visible
    if (!dashConfig.visibleWidgets.includes(widgetId) && dashConfig.fullscreenWidget !== widgetId) {
      return null;
    }

    // Skip if another widget is in fullscreen mode
    if (dashConfig.fullscreenWidget && dashConfig.fullscreenWidget !== widgetId) {
      return null;
    }

    const gridSize = getGridSize(widgetId);
    const height = getWidgetHeight(widgetId);

    return (
      <Grid item xs={gridSize.xs} sm={gridSize.sm} md={gridSize.md} key={widgetId}>
        <Paper
          elevation={2}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" component="h2">
                {title}
              </Typography>

              {description && (
                <Tooltip title={description}>
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Box>
              <IconButton
                size="small"
                onClick={() => toggleFullscreen(widgetId)}
                aria-label={dashConfig.fullscreenWidget === widgetId ? "Exit fullscreen" : "Fullscreen"}
              >
                {dashConfig.fullscreenWidget === widgetId ?
                  <FullscreenExitIcon fontSize="small" /> :
                  <FullscreenIcon fontSize="small" />
                }
              </IconButton>
            </Box>
          </Box>

          <Divider />

          <Box
            sx={{
              p: 2,
              flex: 1,
              height: height,
              overflow: 'auto'
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <ErrorOutlineIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
                <Typography color="error" variant="body2" align="center">
                  {error.message || 'An error occurred while loading data'}
                </Typography>
              </Box>
            ) : (
              content
            )}
          </Box>
        </Paper>
      </Grid>
    );
  };

  // Render dashboard based on selected tab
  const renderDashboardContent = (): React.ReactNode => {
    switch (tab) {
      case 'overview':
        return (
          <Grid container spacing={3}>
            {renderWidget(
              'revenue',
              'Revenue Trend',
              <CasinoRevenueChart
                data={data?.revenue ? [{ date: 'Today', revenue: data.revenue.value }] : []}
                isLoading={isLoading}
              />,
              'Revenue trend over time'
            )}

            {renderWidget(
              'registrations',
              'Player Registrations',
              <PlayerRegistrationsChart
                data={data?.players ? [{ date: 'Today', registrations: data.players.value, ftd: 0, username: '', email: '', password: '' }] : []}
                isLoading={isLoading}
              />,
              'New player registrations over time'
            )}

            {renderWidget(
              'topGames',
              'Top Games',
              <TopGamesChart
                data={data?.games ? [{ id: '1', name: 'Game 1', revenue: 1000, players: 100, sessions: 200, category: 'Slots' }] : []}
                isLoading={isLoading}
              />,
              'Top performing games by revenue'
            )}

            {renderWidget(
              'playerAnalysis',
              'Player Analysis',
              <MultiDimensionalRadarChart
                data={[
                  { entityId: 'engagement', values: { score: 80 } },
                  { entityId: 'retention', values: { score: 65 } },
                  { entityId: 'conversion', values: { score: 90 } },
                  { entityId: 'satisfaction', values: { score: 75 } },
                  { entityId: 'activity', values: { score: 85 } }
                ]}
                entities={[
                  { id: 'engagement', name: 'Engagement' },
                  { id: 'retention', name: 'Retention' },
                  { id: 'conversion', name: 'Conversion' },
                  { id: 'satisfaction', name: 'Satisfaction' },
                  { id: 'activity', name: 'Activity' }
                ]}
                metrics={[
                  { id: 'score', label: 'Score' }
                ]}
                isLoading={isLoading}
              />,
              'Multi-dimensional analysis of player metrics'
            )}
          </Grid>
        );

      case 'performance':
        return (
          <Grid container spacing={3}>
            {/* Performance-specific widgets */}
          </Grid>
        );

      case 'players':
        return (
          <Grid container spacing={3}>
            {/* Player-specific widgets */}
          </Grid>
        );

      case 'games':
        return (
          <Grid container spacing={3}>
            {/* Game-specific widgets */}
          </Grid>
        );

      case 'comparison':
        return (
          <Grid container spacing={3}>
            {/* Comparison-specific widgets */}
          </Grid>
        );

      default:
        return (
          <Typography>Select a dashboard tab to view content</Typography>
        );
    }
  };

  return (
    <Box sx={{ ...sx }}>
      {/* Dashboard Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h5" component="h1">
          {tab.charAt(0).toUpperCase() + tab.slice(1)} Dashboard
        </Typography>

        <Box>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={onRefresh}
              disabled={isLoading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Dashboard settings">
            <IconButton
              onClick={() => {/* Open settings */}}
              color="primary"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Dashboard Content */}
      {renderDashboardContent()}
    </Box>
  );
};

export default AdaptiveDashboard;
