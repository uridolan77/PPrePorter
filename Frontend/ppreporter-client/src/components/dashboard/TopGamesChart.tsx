import React, { memo, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography, useTheme, Tabs, Tab } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { GameData } from '../../types/redux';
import VirtualizedTable from '../common/VirtualizedTable';

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
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1,
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
      </Box>
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    if (errorFallback) {
      return errorFallback(error);
    }
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <Typography variant="body1" color="error">
          Error loading games data: {error.message}
          {onRetry && (
            <Box component="span" sx={{ ml: 2, cursor: 'pointer', textDecoration: 'underline' }} onClick={onRetry}>
              Retry
            </Box>
          )}
        </Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <Typography variant="body1" color="text.secondary">
          {emptyStateMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={viewMode} onChange={handleViewModeChange} aria-label="view mode tabs">
          <Tab label="Chart" value="chart" />
          <Tab label="Table" value="table" />
        </Tabs>
      </Box>

      {viewMode === 'chart' ? (
        // Chart view
        <Box sx={{ width: '100%', height }}>
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
        </Box>
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
    </Box>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(TopGamesChart);
