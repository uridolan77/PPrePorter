import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  Paper,
  Skeleton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Utilities
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../../../utils/formatters';

// Common components
import Card from '../../common/Card';
import KPICard from '../../common/KPICard';
import EmptyState from '../../common/EmptyState';
import LoadingOverlay from '../../common/LoadingOverlay';
import ErrorBoundary from '../../common/ErrorBoundary';

// Dashboard components
import RecentTransactionsTable from '../RecentTransactionsTable';
import TopGamesChart from '../TopGamesChart';

/**
 * Overview Tab component for the API Dashboard
 * Displays key metrics, top games, and recent transactions
 */
const OverviewTab = ({
  dashboardData,
  isLoading,
  error,
  theme = useTheme()
}) => {
  // Memoize the stats data to prevent unnecessary re-renders
  const statsData = useMemo(() => {
    return {
      revenue: {
        title: "Revenue",
        value: formatCurrency(dashboardData?.stats?.revenue?.value || 0),
        trend: dashboardData?.stats?.revenue?.change || 0,
        trendLabel: dashboardData?.stats?.revenue?.period || 'vs last period',
        icon: <AttachMoneyIcon />
      },
      players: {
        title: "Players",
        value: formatNumber(dashboardData?.stats?.players?.value || 0),
        trend: dashboardData?.stats?.players?.change || 0,
        trendLabel: dashboardData?.stats?.players?.period || 'vs last period',
        icon: <SportsEsportsIcon />
      },
      newPlayers: {
        title: "New Players",
        value: formatNumber(dashboardData?.stats?.newPlayers?.value || 0),
        trend: dashboardData?.stats?.newPlayers?.change || 0,
        trendLabel: dashboardData?.stats?.newPlayers?.period || 'vs last period',
        icon: <PersonAddIcon />
      },
      gamesPlayed: {
        title: "Games Played",
        value: formatNumber(dashboardData?.stats?.gamesPlayed?.value || 0),
        trend: dashboardData?.stats?.gamesPlayed?.change || 0,
        trendLabel: dashboardData?.stats?.gamesPlayed?.period || 'vs last period',
        icon: <VideogameAssetIcon />
      }
    };
  }, [dashboardData?.stats]);

  // Memoize the top games data
  const topGamesData = useMemo(() => {
    return dashboardData?.topGames || [];
  }, [dashboardData?.topGames]);

  // Memoize the recent transactions data
  const recentTransactionsData = useMemo(() => {
    return dashboardData?.recentTransactions || [];
  }, [dashboardData?.recentTransactions]);

  // Handle error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Dashboard Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || "An unexpected error occurred. Please try again later."}
        </Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary fallback={<EmptyState message="Something went wrong loading the dashboard" icon={<ErrorOutlineIcon />} />}>
      <Box>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Revenue Card */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title={statsData.revenue.title}
              value={statsData.revenue.value}
              trend={statsData.revenue.trend}
              trendLabel={statsData.revenue.trendLabel}
              icon={statsData.revenue.icon}
              loading={isLoading}
            />
          </Grid>

          {/* Players Card */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title={statsData.players.title}
              value={statsData.players.value}
              trend={statsData.players.trend}
              trendLabel={statsData.players.trendLabel}
              icon={statsData.players.icon}
              loading={isLoading}
            />
          </Grid>

          {/* New Players Card */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title={statsData.newPlayers.title}
              value={statsData.newPlayers.value}
              trend={statsData.newPlayers.trend}
              trendLabel={statsData.newPlayers.trendLabel}
              icon={statsData.newPlayers.icon}
              loading={isLoading}
            />
          </Grid>

          {/* Games Played Card */}
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title={statsData.gamesPlayed.title}
              value={statsData.gamesPlayed.value}
              trend={statsData.gamesPlayed.trend}
              trendLabel={statsData.gamesPlayed.trendLabel}
              icon={statsData.gamesPlayed.icon}
              loading={isLoading}
            />
          </Grid>
        </Grid>

      {/* Top Games Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Top Performing Games
          </Typography>
          <Box>
            <Tooltip title="Download report">
              <IconButton size="small" sx={{ mr: 1 }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Card>
          {isLoading && topGamesData.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={300} />
            </Box>
          ) : (
            <TopGamesChart
              data={topGamesData}
              isLoading={isLoading}
              emptyStateMessage="No game data available"
              errorFallback={(error) => (
                <EmptyState
                  message={`Error loading games data: ${error.message}`}
                  icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
                />
              )}
            />
          )}
        </Card>
      </Box>

      {/* Recent Transactions Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Recent Transactions
          </Typography>
          <Box>
            <Tooltip title="Download report">
              <IconButton size="small" sx={{ mr: 1 }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Card>
          {isLoading && recentTransactionsData.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={300} />
            </Box>
          ) : !recentTransactionsData.length ? (
            <EmptyState
              message="No recent transactions available"
              icon={<AttachMoneyIcon sx={{ fontSize: 48 }} />}
            />
          ) : (
            <RecentTransactionsTable
              data={recentTransactionsData}
              isLoading={isLoading}
              errorFallback={(error) => (
                <EmptyState
                  message={`Error loading transactions: ${error.message}`}
                  icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
                />
              )}
            />
          )}
        </Card>
      </Box>
    </ErrorBoundary>
  );
};

export default OverviewTab;
