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
import { AppDispatch } from '../store/store';
import './DashboardSimple.css';

// Types
interface MetricData {
  total: number;
  trend: number;
  isUp: boolean;
}

interface DashboardData {
  users: MetricData;
  revenue: MetricData;
  games: MetricData;
}

interface MetricCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ReactNode;
  loading: boolean;
  error: any;
}

interface DashboardState {
  isLoading: boolean;
  error: any;
  summaryStats: DashboardData | null;
}

// Default empty data structure
const getEmptyData = (): DashboardData => ({
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
const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon, loading, error }) => {
  // Determine icon color
  const isUp = trend > 0;
  const TrendIcon = isUp ? TrendingUpIcon : TrendingDownIcon;
  const trendColor = isUp ? 'success.main' : 'error.main';

  return (
    <Card className="metric-card">
      <CardContent>
        <div className="metric-header">
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <div className="metric-icon-container" style={{ backgroundColor: 'var(--primary-lighter, #e3f2fd)' }}>
            {icon}
          </div>
        </div>

        {loading ? (
          <div className="metric-loading-container">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <div className="metric-error-container" style={{ color: 'var(--error-main, #f44336)' }}>
            <InfoIcon style={{ marginRight: 8 }} />
            <Typography variant="body2">Error loading data</Typography>
          </div>
        ) : (
          <>
            <Typography variant="h4" component="div" gutterBottom>
              {typeof value === 'number' && title === 'Revenue' ? `$${value.toLocaleString()}` : value.toLocaleString()}
            </Typography>
            <div className="metric-trend-container">
              <TrendIcon fontSize="small" className="metric-trend-icon"
                style={{ color: isUp ? 'var(--success-main, #4caf50)' : 'var(--error-main, #f44336)' }} />
              <Typography variant="body2" className={isUp ? "metric-trend-text-up" : "metric-trend-text-down"}>
                {Math.abs(trend).toFixed(1)}%
              </Typography>
              <Typography variant="body2" className="metric-trend-vs">
                vs last month
              </Typography>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const DashboardSimple: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, summaryStats } = useSelector((state: { dashboard: DashboardState }) => state.dashboard || {});
  const [localData, setLocalData] = useState<DashboardData>(getEmptyData());

  const handleRefresh = (): void => {
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Typography variant="h5" component="h1">
          Dashboard (Redux Integration)
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>

      <Grid container spacing={3} className="dashboard-grid">
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

      <Paper className="dashboard-paper">
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This is a placeholder for charts and data visualizations.
          In a real application, you would see graphs, tables, and other data representations here.
        </Typography>
      </Paper>
    </div>
  );
};

export default DashboardSimple;
