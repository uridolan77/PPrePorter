import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import InfoIcon from '@mui/icons-material/Info';

// Default empty data structure
const getEmptyData = () => ({
  users: {
    total: 0,
    trend: 0,
    isUp: false
  },
  revenue: {
    total: 0,
    trend: 0,
    isUp: false
  },
  games: {
    total: 0,
    trend: 0,
    isUp: false
  }
});

// Metric Card Component
const MetricCard = ({ title, value, trend, icon, loading, error }) => {
  // Determine icon color
  const isUp = trend > 0;
  const TrendIcon = isUp ? TrendingUpIcon : TrendingDownIcon;
  const trendColor = isUp ? 'success.main' : 'error.main';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ backgroundColor: 'primary.lighter', borderRadius: '50%', p: 1 }}>
            {icon}
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="60px">
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box display="flex" alignItems="center" color="error.main" height="60px">
            <InfoIcon sx={{ mr: 1 }} />
            <Typography variant="body2">Error loading data</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="div" gutterBottom>
              {typeof value === 'number' && title === 'Revenue' ? `$${value.toLocaleString()}` : value.toLocaleString()}
            </Typography>
            <Box display="flex" alignItems="center">
              <TrendIcon fontSize="small" sx={{ color: trendColor, mr: 0.5 }} />
              <Typography variant="body2" sx={{ color: trendColor }}>
                {Math.abs(trend).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                vs last month
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const DashboardSimple = () => {
  const dispatch = useDispatch();
  const { isLoading, error, summaryStats } = useSelector(state => state.dashboard || {});
  const [localData, setLocalData] = useState(getEmptyData());

  const handleRefresh = () => {
    // Dispatch action to fetch dashboard data
    dispatch({ type: 'dashboard/fetchDataStart' });

    // For development, we'll just update local state with empty data
    setTimeout(() => {
      const newData = getEmptyData();
      setLocalData(newData);
      dispatch({ type: 'dashboard/fetchDataSuccess', payload: newData });
    }, 1000);
  };

  useEffect(() => {
    // Initial data load
    handleRefresh();
  }, []);

  // Use real data from Redux if available, otherwise fall back to empty data
  const dashboardData = summaryStats || localData;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Dashboard (Redux Integration)
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Users"
            value={dashboardData.users.total}
            trend={dashboardData.users.trend}
            icon={<PersonAddIcon color="primary" />}
            loading={isLoading}
            error={error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Revenue"
            value={dashboardData.revenue.total}
            trend={dashboardData.revenue.trend}
            icon={<AttachMoneyIcon color="primary" />}
            loading={isLoading}
            error={error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Games"
            value={dashboardData.games.total}
            trend={dashboardData.games.trend}
            icon={<SportsEsportsIcon color="primary" />}
            loading={isLoading}
            error={error}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a placeholder for charts and data visualizations.
          In a real application, you would see graphs, tables, and other data representations here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default DashboardSimple;
