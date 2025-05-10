import React, { memo, useMemo } from 'react';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CommonProps } from '../../types/common';

// Revenue data item interface
interface RevenueDataItem {
  date: string;
  revenue?: number;
  value?: number;
  [key: string]: any;
}

// Chart data item interface
interface ChartDataItem {
  date: string;
  fullDate: string;
  revenue: number;
  formattedValue: string;
}

// Component props interface
interface CasinoRevenueChartProps extends CommonProps {
  data: RevenueDataItem[];
  isLoading?: boolean;
  height?: number;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Casino Revenue Chart component that displays revenue data over time
 * with responsive behavior for mobile devices
 */
const CasinoRevenueChart: React.FC<CasinoRevenueChartProps> = ({
  data,
  isLoading = false,
  height = 300,
  error = null,
  onRetry,
  sx
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Format data for chart display - memoized to prevent unnecessary recalculations
  const chartData: ChartDataItem[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map(item => ({
      date: formatDate(item.date),
      fullDate: item.date,
      revenue: parseFloat((item.revenue || item.value || 0).toString()),
      formattedValue: formatCurrency(item.revenue || item.value || 0)
    }));
  }, [data]);

  // Handle loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <Typography variant="body1" color="error">
          Error loading revenue data: {error.message}
          {onRetry && (
            <Box component="span" sx={{ ml: 2, cursor: 'pointer', textDecoration: 'underline' }} onClick={onRetry}>
              Retry
            </Box>
          )}
        </Typography>
      </Box>
    );
  }

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, ...sx }}>
        <Typography variant="body1" color="text.secondary">
          No revenue data available
        </Typography>
      </Box>
    );
  }

  // Mobile view - Line chart (simpler, less CPU intensive)
  if (isMobile) {
    return (
      <Box sx={{ width: '100%', height, ...sx }}>
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
              tickFormatter={(value: number) => formatCurrency(value, 'GBP').replace('£', '')}
              tick={{ fontSize: 10 }}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label: string) => {
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
    <Box sx={{ width: '100%', height, ...sx }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            tickFormatter={(value: number) => formatCurrency(value, 'GBP').replace('£', '')}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
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

// Export memoized component
export default memo(CasinoRevenueChart);
