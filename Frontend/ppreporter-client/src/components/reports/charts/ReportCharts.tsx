import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format as formatDate } from 'date-fns';

// Chart colors
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format number
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

// Format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                mr: 1,
                borderRadius: '50%'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {entry.name}: {entry.value >= 1000 ? formatCurrency(entry.value) : formatNumber(entry.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

// Area Chart Component
interface AreaChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export const ReportAreaChart: React.FC<AreaChartProps> = ({
  data,
  xKey,
  yKeys,
  height = 300,
  loading = false,
  error = null,
  title,
  showLegend = true,
  showGrid = true
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={xKey} 
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={(value) => {
              if (typeof value === 'string' && value.includes('T')) {
                return formatDate(new Date(value), 'MMM dd');
              }
              return value;
            }}
          />
          <YAxis 
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`;
              }
              return value;
            }}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              fillOpacity={0.3}
              name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: any[];
  xKey: string;
  yKeys: string[];
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

export const ReportBarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKeys,
  height = 300,
  loading = false,
  error = null,
  title,
  showLegend = true,
  showGrid = true,
  stacked = false
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={xKey} 
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={(value) => {
              if (typeof value === 'string' && value.includes('T')) {
                return formatDate(new Date(value), 'MMM dd');
              }
              return value;
            }}
          />
          <YAxis 
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}k`;
              }
              return value;
            }}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
              stackId={stacked ? "stack" : undefined}
              name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: any[];
  nameKey: string;
  valueKey: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
  showLegend?: boolean;
}

export const ReportPieChart: React.FC<PieChartProps> = ({
  data,
  nameKey,
  valueKey,
  height = 300,
  loading = false,
  error = null,
  title,
  showLegend = true
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          {showLegend && <Legend />}
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};
