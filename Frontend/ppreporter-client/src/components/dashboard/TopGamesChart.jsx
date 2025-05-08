import React from 'react';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

/**
 * Top Games Chart component that displays the best performing games by revenue
 * with responsive behavior for mobile devices
 */
const TopGamesChart = ({ data, isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="textSecondary">
          No games data available
        </Typography>
      </Box>
    );
  }
  
  // Format data for chart - top 10 by revenue
  const chartData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, isMobile ? 5 : 10) // Show fewer items on mobile
    .map(item => ({
      name: shortenGameName(item.gameName, isMobile ? 15 : 20),
      fullName: item.gameName,
      provider: item.provider,
      revenue: parseFloat(item.revenue)
    }));
  
  // Shorten game names for better display
  function shortenGameName(name, maxLength = 20) {
    if (!name) return 'Unknown Game';
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + '...';
  }
  
  // Custom colors for pie chart
  const COLORS = ['#ff9800', '#f57c00', '#ef6c00', '#e65100', '#ff5722', '#f4511e', '#e64a19', '#d84315', '#bf360c', '#ff3d00'];
  
  // Mobile view - Pie chart
  if (isMobile) {
    return (
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={3}
              dataKey="revenue"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(name) => {
                const game = chartData.find(item => item.name === name);
                return game ? `${game.fullName} (${game.provider})` : name;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    );
  }
  
  // Desktop view - Bar chart
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={value => formatCurrency(value).replace('£', '')} />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => {
              const game = chartData.find(item => item.name === label);
              return `${game.fullName} (${game.provider})`;
            }}
          />
          <Legend />
          <Bar 
            dataKey="revenue" 
            name="Revenue" 
            fill="#ff9800" 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TopGamesChart;