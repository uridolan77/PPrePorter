import React from 'react';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Casino Revenue Chart component that displays revenue data over time
 * with responsive behavior for mobile devices
 */
const CasinoRevenueChart = ({ data, isLoading }) => {
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
          No revenue data available
        </Typography>
      </Box>
    );
  }
  
  // Format data for chart display
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    revenue: parseFloat(item.revenue)
  }));
  
  // Mobile view - Line chart (simpler, less CPU intensive)
  if (isMobile) {
    return (
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, 'GBP').replace('£', '')}
              tick={{ fontSize: 10 }}
              width={40}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.date === label);
                return item ? formatDate(item.fullDate) : label;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="#2e7d32" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    );
  }
  
  // Desktop view - Area chart
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value, 'GBP').replace('£', '')}
          />
          <Tooltip 
            formatter={(value) => [formatCurrency(value), 'Revenue']}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            name="Revenue" 
            stroke="#2e7d32" 
            fill="#4caf50" 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CasinoRevenueChart;