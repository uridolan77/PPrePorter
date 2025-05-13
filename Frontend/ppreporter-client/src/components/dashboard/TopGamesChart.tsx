import React, { memo, useMemo, useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, useTheme, Tabs, Tab } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { GameData } from '../../types/redux';
import VirtualizedTable from '../common/VirtualizedTable';
import { useDispatch } from 'react-redux';
import { fetchTopGames } from '../../store/slices/dashboardSlice';

interface TopGamesChartProps {
  data: GameData[];
  isLoading?: boolean;
  height?: number;
  showLegend?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  sx?: any;
  emptyStateMessage?: string;
  errorFallback?: (error: Error) => React.ReactElement;
  valueKey?: string;
  nameKey?: string;
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {payload[0].payload.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Revenue: {formatCurrency(payload[0].value)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Players: {payload[0].payload.players.toLocaleString()}
        </Typography>
      </div>
    );
  }

  return null;
};

/**
 * Top Games Chart component
 * Displays a bar chart of top games by revenue
 */
const TopGamesChart: React.FC<TopGamesChartProps> = ({
  data,
  isLoading = false,
  height = 300,
  showLegend = true,
  error = null,
  onRetry,
  sx,
  emptyStateMessage = "No game data available",
  errorFallback,
  valueKey = "revenue",
  nameKey = "name"
}) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const dispatch = useDispatch();

  // Fetch top games data if not provided
  useEffect(() => {
    if (!data || data.length === 0) {
      if (!isLoading && !error) {
        dispatch(fetchTopGames() as any);
      }
    }
  }, [dispatch, data, isLoading, error]);

  // Handle view mode change
  const handleViewModeChange = (event: React.SyntheticEvent, newValue: 'chart' | 'table') => {
    setViewMode(newValue);
  };

  // Memoize the chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((game) => ({
      name: game.name,
      revenue: game.revenue,
      players: game.players,
      category: game.category
    }));
  }, [data]);

  // Generate colors for the bars based on the theme
  const colors = useMemo(() => {
    return [
      theme.palette.primary.main,
      theme.palette.primary.light,
      theme.palette.secondary.main,
      theme.palette.secondary.light,
      theme.palette.info.main,
      theme.palette.info.light,
      theme.palette.success.main,
      theme.palette.success.light,
      theme.palette.warning.main,
      theme.palette.warning.light
    ];
  }, [theme]);

  // Table columns
  const tableColumns = useMemo(() => [
    { id: 'name', label: 'Game Name', align: 'left' as const },
    { id: 'category', label: 'Category', align: 'left' as const },
    { id: 'revenue', label: 'Revenue', align: 'right' as const, format: (value: number) => formatCurrency(value) },
    { id: 'players', label: 'Players', align: 'right' as const, format: (value: number) => value.toLocaleString() }
  ], []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height, width: '100%' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    if (errorFallback) {
      return errorFallback(error);
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height, width: '100%' }}>
        <Typography variant="body1" color="error">
          Error loading games data: {error.message}
          {onRetry && (
            <span style={{ marginLeft: 16, cursor: 'pointer', textDecoration: 'underline' }} onClick={onRetry}>
              Retry
            </span>
          )}
        </Typography>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height, width: '100%' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyStateMessage}
        </Typography>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', marginBottom: 16 }}>
        <Tabs value={viewMode} onChange={handleViewModeChange} aria-label="view mode tabs">
          <Tab label="Chart" value="chart" />
          <Tab label="Table" value="table" />
        </Tabs>
      </div>

      {viewMode === 'chart' ? (
        // Chart view
        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `£${value.toLocaleString()}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        // Table view with virtualization
        <VirtualizedTable
          data={data}
          columns={tableColumns}
          height={height}
          rowHeight={53}
          loading={isLoading}
          emptyMessage="No games data available"
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(TopGamesChart);
