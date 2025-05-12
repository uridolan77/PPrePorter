import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  PieChart,
  Pie
} from 'recharts';
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

// Scatter Chart Component
interface ScatterChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  zKey?: string;
  nameKey?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

export const ReportScatterChart: React.FC<ScatterChartProps> = ({
  data,
  xKey,
  yKey,
  zKey,
  nameKey,
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
        <ScatterChart
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey={xKey}
            name={xKey.charAt(0).toUpperCase() + xKey.slice(1).replace(/([A-Z])/g, ' $1')}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            type="number"
          />
          <YAxis
            dataKey={yKey}
            name={yKey.charAt(0).toUpperCase() + yKey.slice(1).replace(/([A-Z])/g, ' $1')}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            type="number"
          />
          {zKey && (
            <ZAxis
              dataKey={zKey}
              range={[50, 500]}
              name={zKey.charAt(0).toUpperCase() + zKey.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          )}
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Scatter
            name={nameKey ? nameKey : "Data"}
            data={data}
            fill={CHART_COLORS[0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Radar Chart Component
interface RadarChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
  showLegend?: boolean;
}

export const ReportRadarChart: React.FC<RadarChartProps> = ({
  data,
  dataKey,
  nameKey,
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
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey={nameKey}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          <PolarRadiusAxis />
          <Radar
            name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1).replace(/([A-Z])/g, ' $1')}
            dataKey={dataKey}
            stroke={CHART_COLORS[0]}
            fill={CHART_COLORS[0]}
            fillOpacity={0.6}
          />
          {showLegend && <Legend />}
          <RechartsTooltip />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Treemap Chart Component
interface TreemapChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
}

export const ReportTreemapChart: React.FC<TreemapChartProps> = ({
  data,
  dataKey,
  nameKey,
  height = 300,
  loading = false,
  error = null,
  title
}) => {
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
        <Treemap
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          aspectRatio={4 / 3}
          stroke="#fff"
          fill={CHART_COLORS[0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Treemap>
      </ResponsiveContainer>
    </Box>
  );
};

// Radial Bar Chart Component (Gauge Chart)
interface GaugeChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
  startAngle?: number;
  endAngle?: number;
}

export const ReportGaugeChart: React.FC<GaugeChartProps> = ({
  data,
  dataKey,
  nameKey,
  height = 300,
  loading = false,
  error = null,
  title,
  startAngle = 180,
  endAngle = 0
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
            innerRadius="60%"
            outerRadius="80%"
            startAngle={startAngle}
            endAngle={endAngle}
            dataKey={dataKey}
            nameKey={nameKey}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            align="right"
          />
          <RechartsTooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Heatmap Component
interface HeatmapProps {
  data: any[];
  xKey: string;
  yKey: string;
  valueKey: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
}

export const ReportHeatmap: React.FC<HeatmapProps> = ({
  data,
  xKey,
  yKey,
  valueKey,
  height = 300,
  loading = false,
  error = null,
  title
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

  // Process data for heatmap
  const uniqueXValues = Array.from(new Set(data.map(item => item[xKey]))).sort();
  const uniqueYValues = Array.from(new Set(data.map(item => item[yKey]))).sort();

  // Create a grid of cells
  const cellSize = Math.min(
    (height - 100) / uniqueYValues.length,
    (height * 2) / uniqueXValues.length
  );

  // Find min and max values for color scaling
  const values = data.map(item => item[valueKey]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Color scale function
  const getColor = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    const hue = (1 - normalizedValue) * 240; // 240 (blue) to 0 (red)
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <Box sx={{ width: '100%', height }}>
      {title && (
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
      )}
      <Box sx={{ overflowX: 'auto', overflowY: 'auto', height: height - 40 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: uniqueXValues.length * cellSize }}>
          {/* X-axis labels */}
          <Box sx={{ display: 'flex', ml: 8 }}>
            {uniqueXValues.map((x) => (
              <Box
                key={`x-${x}`}
                sx={{
                  width: cellSize,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'bottom left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary
                }}
              >
                {x}
              </Box>
            ))}
          </Box>

          {/* Heatmap grid */}
          <Box sx={{ display: 'flex' }}>
            {/* Y-axis labels */}
            <Box sx={{ width: 60 }}>
              {uniqueYValues.map((y) => (
                <Box
                  key={`y-${y}`}
                  sx={{
                    height: cellSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: 1,
                    fontSize: '0.75rem',
                    color: theme.palette.text.secondary
                  }}
                >
                  {y}
                </Box>
              ))}
            </Box>

            {/* Cells */}
            <Box>
              {uniqueYValues.map((y) => (
                <Box key={`row-${y}`} sx={{ display: 'flex' }}>
                  {uniqueXValues.map((x) => {
                    const cell = data.find(item => item[xKey] === x && item[yKey] === y);
                    const value = cell ? cell[valueKey] : 0;
                    return (
                      <Box
                        key={`cell-${x}-${y}`}
                        sx={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getColor(value),
                          border: '1px solid',
                          borderColor: theme.palette.background.paper,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                            boxShadow: 1
                          }
                        }}
                        title={`${x}, ${y}: ${value}`}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: value > (maxValue - minValue) / 2 + minValue ? 'white' : 'black',
                            fontWeight: 'bold',
                            fontSize: '0.6rem'
                          }}
                        >
                          {value}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
