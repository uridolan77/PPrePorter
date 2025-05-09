import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Divider,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

// Utilities
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/formatters';

// Common components
import Card from '../../common/Card';
import KPICard from '../../common/KPICard';
import EmptyState from '../../common/EmptyState';

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
  theme = useTheme()
}) => {
  // Get trend icon based on change value
  const getTrendIcon = (change) => {
    if (!change) return null;
    return change >= 0 ?
      <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} /> :
      <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16 }} />;
  };

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Revenue"
            value={formatCurrency(dashboardData?.stats?.revenue?.value || 0)}
            trend={dashboardData?.stats?.revenue?.change || 0}
            trendLabel={dashboardData?.stats?.revenue?.period || 'vs last period'}
            icon={<AttachMoneyIcon />}
            loading={isLoading}
          />
        </Grid>

        {/* Players Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Players"
            value={formatNumber(dashboardData?.stats?.players?.value || 0)}
            trend={dashboardData?.stats?.players?.change || 0}
            trendLabel={dashboardData?.stats?.players?.period || 'vs last period'}
            icon={<SportsEsportsIcon />}
            loading={isLoading}
          />
        </Grid>

        {/* New Players Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="New Players"
            value={formatNumber(dashboardData?.stats?.newPlayers?.value || 0)}
            trend={dashboardData?.stats?.newPlayers?.change || 0}
            trendLabel={dashboardData?.stats?.newPlayers?.period || 'vs last period'}
            icon={<PersonAddIcon />}
            loading={isLoading}
          />
        </Grid>

        {/* Games Played Card */}
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Games Played"
            value={formatNumber(dashboardData?.stats?.gamesPlayed?.value || 0)}
            trend={dashboardData?.stats?.gamesPlayed?.change || 0}
            trendLabel={dashboardData?.stats?.gamesPlayed?.period || 'vs last period'}
            icon={<VideogameAssetIcon />}
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
          <TopGamesChart
            data={dashboardData?.topGames || []}
            isLoading={isLoading}
            emptyStateMessage="No game data available"
          />
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
          {!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0 ? (
            <EmptyState
              message="No recent transactions available"
              icon={<AttachMoneyIcon sx={{ fontSize: 48 }} />}
            />
          ) : (
            <RecentTransactionsTable
              data={dashboardData?.recentTransactions || []}
              isLoading={isLoading}
            />
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default OverviewTab;
