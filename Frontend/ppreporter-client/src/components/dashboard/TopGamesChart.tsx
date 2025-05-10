import React, { memo, useMemo } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { GameData } from '../../types/redux';

interface TopGamesChartProps {
  data: GameData[];
  isLoading?: boolean;
  height?: number;
  showLegend?: boolean;
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
  showLegend = true
}) => {
  const theme = useTheme();

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body1" color="text.secondary">
          No game data available
        </Typography>
      </Box>
    );
  }

  return (
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
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(TopGamesChart);
