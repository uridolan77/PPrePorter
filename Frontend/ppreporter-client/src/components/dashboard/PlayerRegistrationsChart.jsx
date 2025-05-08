import React from 'react';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { formatDate, formatNumber } from '../../utils/formatters';

/**
 * Player Registrations Chart component that displays registration and FTD data
 * with responsive behavior for mobile devices
 */
const PlayerRegistrationsChart = ({ data, isLoading }) => {
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
          No registration data available
        </Typography>
      </Box>
    );
  }
  
  // Format data for chart display
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    fullDate: item.date,
    registrations: item.registrations,
    ftd: item.firstTimeDepositors
  }));
  
  // Mobile view - ComposedChart (more compact representation for small screens)
  if (isMobile) {
    return (
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart
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
              tickFormatter={(value) => formatNumber(value)} 
              tick={{ fontSize: 10 }}
              width={30}
            />
            <Tooltip 
              formatter={(value, name) => [
                formatNumber(value), 
                name === 'registrations' ? 'Registrations' : 'First Time Depositors'
              ]}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.date === label);
                return item ? formatDate(item.fullDate) : label;
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
            />
            <Bar 
              dataKey="registrations" 
              name="Registrations" 
              fill="#1976d2" 
              barSize={20}
            />
            <Line 
              dataKey="ftd" 
              name="First Time Depositors"
              stroke="#4caf50"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </ComposedChart>
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
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatNumber(value)} />
          <Tooltip 
            formatter={(value, name) => [
              formatNumber(value), 
              name === 'registrations' ? 'Registrations' : 'First Time Depositors'
            ]}
          />
          <Legend />
          <Bar 
            dataKey="registrations" 
            name="Registrations" 
            fill="#1976d2" 
          />
          <Bar 
            dataKey="ftd" 
            name="First Time Depositors" 
            fill="#4caf50" 
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PlayerRegistrationsChart;