import React from 'react';
import { Box, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Type definitions
interface DataPoint {
  [key: string]: any;
  label?: string;
}

interface MicroSparklineProps {
  data?: DataPoint[];
  width?: number;
  height?: number;
  color?: string | null;
  showArea?: boolean;
  tooltipFormat?: (value: number) => string;
  accessibilityLabel?: string;
  valueKey?: string;
}

interface MicroBarChartProps {
  data?: DataPoint[];
  width?: number;
  height?: number;
  color?: string | null;
  tooltipFormat?: (value: number) => string;
  accessibilityLabel?: string;
  valueKey?: string;
}

interface MicroBulletChartProps {
  actual: number;
  target: number;
  comparative?: number | null;
  width?: number;
  height?: number;
  actualColor?: string | null;
  targetColor?: string | null;
  comparativeColor?: string | null;
  tooltipFormat?: (value: number) => string;
  accessibilityLabel?: string;
}

/**
 * MicroSparkline component to show a small inline trend line
 * Used for compact visualizations within tables and cards
 */
const MicroSparkline: React.FC<MicroSparklineProps> = ({
  data = [],
  width = 60,
  height = 20,
  color = null,
  showArea = true,
  tooltipFormat = value => value.toLocaleString(),
  accessibilityLabel = "Trend data",
  valueKey = 'value'
}) => {
  const theme = useTheme();

  // Get chart color - either from props or based on trend
  const getColor = (): string => {
    if (color) return color;

    if (data.length > 1) {
      const firstValue = data[0][valueKey];
      const lastValue = data[data.length - 1][valueKey];

      if (lastValue > firstValue) {
        return theme.palette.success.main;
      } else if (lastValue < firstValue) {
        return theme.palette.error.main;
      }
    }

    return theme.palette.primary.main;
  };

  // If no data, render an empty box
  if (!data || data.length === 0) {
    return <Box sx={{ width, height, display: 'inline-block' }} />;
  }

  // Calculate the visualization parameters
  const values = data.map(d => d[valueKey]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  const chartColor = getColor();

  // Convert data to path coordinates
  const getX = (index: number): number => index * (width / (data.length - 1));
  const getY = (value: number): number => {
    return range === 0
      ? height / 2
      : height - ((value - minValue) / range) * height;
  };

  // Generate SVG path for the sparkline
  const generateLinePath = (): string => {
    return data.map((d, i) => {
      const x = getX(i);
      const y = getY(d[valueKey]);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };

  // Generate SVG path for the area under the sparkline
  const generateAreaPath = (): string => {
    const linePath = generateLinePath();
    const lastX = getX(data.length - 1);

    return `${linePath} L${lastX},${height} L0,${height} Z`;
  };

  // Generate a summary of the trend for accessibility
  const trendSummary = (): string => {
    if (data.length < 2) return `Single value: ${tooltipFormat(data[0][valueKey])}`;

    const firstValue = data[0][valueKey];
    const lastValue = data[data.length - 1][valueKey];
    const change = lastValue - firstValue;
    const percentChange = (change / firstValue) * 100;

    let trendDirection = 'unchanged';
    if (change > 0) trendDirection = 'increasing';
    else if (change < 0) trendDirection = 'decreasing';

    return `Trend: ${trendDirection}, from ${tooltipFormat(firstValue)} to ${tooltipFormat(lastValue)}, change of ${percentChange.toFixed(1)}%`;
  };

  // Render the tooltip content
  const tooltipContent = (): React.ReactNode => {
    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ fontSize: 12, fontWeight: 'bold' }}>
          {accessibilityLabel}
        </Box>
        {data.map((point, index) => (
          <Box key={index} sx={{ fontSize: 11 }}>
            {point.label || `Point ${index + 1}`}: {tooltipFormat(point[valueKey])}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Tooltip title={tooltipContent()} arrow>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width,
          height,
          position: 'relative',
          verticalAlign: 'middle'
        }}
        aria-label={`${accessibilityLabel}: ${trendSummary()}`}
      >
        <svg width={width} height={height} style={{ display: 'block' }}>
          {showArea && (
            <path
              d={generateAreaPath()}
              fill={alpha(chartColor, 0.2)}
              stroke="none"
            />
          )}
          <path
            d={generateLinePath()}
            fill="none"
            stroke={chartColor}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Add dot for the last point */}
          <circle
            cx={getX(data.length - 1)}
            cy={getY(data[data.length - 1][valueKey])}
            r={2}
            fill={chartColor}
          />
        </svg>
      </Box>
    </Tooltip>
  );
};

/**
 * MicroBarChart component to show a small inline bar chart
 * Used for compact visualizations within tables and cards
 */
const MicroBarChart: React.FC<MicroBarChartProps> = ({
  data = [],
  width = 60,
  height = 20,
  color = null,
  tooltipFormat = value => value.toLocaleString(),
  accessibilityLabel = "Bar chart data",
  valueKey = 'value'
}) => {
  const theme = useTheme();

  // Get chart color - either from props or based on values
  const getColor = (value: number, index: number): string => {
    if (color) return color;

    // Color by value (higher values are darker)
    const maxValue = Math.max(...data.map(d => d[valueKey]));
    const intensity = value / maxValue;

    return alpha(theme.palette.primary.main, 0.4 + (intensity * 0.6));
  };

  // If no data, render an empty box
  if (!data || data.length === 0) {
    return <Box sx={{ width, height, display: 'inline-block' }} />;
  }

  // Calculate the visualization parameters
  const values = data.map(d => d[valueKey]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const barWidth = width / data.length - 1;

  // Generate a summary of the data for accessibility
  const dataSummary = (): string => {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    return `${data.length} values, average: ${tooltipFormat(average)}, range: ${tooltipFormat(minValue)} to ${tooltipFormat(maxValue)}`;
  };

  // Render the tooltip content
  const tooltipContent = (): React.ReactNode => {
    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ fontSize: 12, fontWeight: 'bold' }}>
          {accessibilityLabel}
        </Box>
        {data.map((point, index) => (
          <Box key={index} sx={{ fontSize: 11 }}>
            {point.label || `Item ${index + 1}`}: {tooltipFormat(point[valueKey])}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Tooltip title={tooltipContent()} arrow>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width,
          height,
          position: 'relative',
          verticalAlign: 'middle'
        }}
        aria-label={`${accessibilityLabel}: ${dataSummary()}`}
      >
        <svg width={width} height={height} style={{ display: 'block' }}>
          {data.map((d, i) => {
            const barHeight = (d[valueKey] / maxValue) * height;

            return (
              <rect
                key={i}
                x={i * (barWidth + 1)}
                y={height - barHeight}
                width={barWidth}
                height={barHeight}
                fill={getColor(d[valueKey], i)}
                rx={1}
                ry={1}
              />
            );
          })}
        </svg>
      </Box>
    </Tooltip>
  );
};

/**
 * MicroBulletChart component to show target vs actual in a compact visualization
 * Useful for showing progress toward goals in tables and cards
 */
const MicroBulletChart: React.FC<MicroBulletChartProps> = ({
  actual,
  target,
  comparative = null,
  width = 80,
  height = 16,
  actualColor = null,
  targetColor = null,
  comparativeColor = null,
  tooltipFormat = value => value.toLocaleString(),
  accessibilityLabel = "Progress toward target"
}) => {
  const theme = useTheme();

  // Get colors or use defaults
  const getActualColor = (): string => {
    if (actualColor) return actualColor;

    if (actual >= target) {
      return theme.palette.success.main;
    } else if (actual >= 0.8 * target) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.error.main;
    }
  };

  const getTargetColor = (): string => targetColor || theme.palette.grey[900];
  const getComparativeColor = (): string => comparativeColor || theme.palette.grey[400];

  // Calculate the percent of target achieved
  const percentComplete = Math.min(actual / target * 100, 100);
  const comparativePercent = comparative ? (comparative / target * 100) : null;

  // Generate a summary of the data for accessibility
  const progressSummary = (): string => {
    const percentText = `${percentComplete.toFixed(1)}% of target`;
    let statusText = '';

    if (actual >= target) {
      statusText = 'Target achieved';
    } else if (actual >= 0.8 * target) {
      statusText = 'Near target';
    } else {
      statusText = 'Below target';
    }

    let comparativeText = '';
    if (comparative !== null) {
      comparativeText = `, comparative value: ${tooltipFormat(comparative)}`;
    }

    return `${statusText}, ${tooltipFormat(actual)} of ${tooltipFormat(target)} (${percentText})${comparativeText}`;
  };

  // Render the tooltip content
  const tooltipContent = (): React.ReactNode => {
    return (
      <Box sx={{ p: 1 }}>
        <Box sx={{ fontSize: 12, fontWeight: 'bold' }}>
          {accessibilityLabel}
        </Box>
        <Box sx={{ fontSize: 11 }}>
          Actual: {tooltipFormat(actual)}
        </Box>
        <Box sx={{ fontSize: 11 }}>
          Target: {tooltipFormat(target)}
        </Box>
        {comparative !== null && (
          <Box sx={{ fontSize: 11 }}>
            Comparative: {tooltipFormat(comparative)}
          </Box>
        )}
        <Box sx={{ fontSize: 11, fontWeight: 'medium', mt: 0.5 }}>
          {percentComplete.toFixed(1)}% complete
        </Box>
      </Box>
    );
  };

  return (
    <Tooltip title={tooltipContent()} arrow>
      <Box
        component="span"
        sx={{
          display: 'inline-block',
          width,
          height,
          position: 'relative',
          verticalAlign: 'middle'
        }}
        aria-label={`${accessibilityLabel}: ${progressSummary()}`}
      >
        <svg width={width} height={height} style={{ display: 'block' }}>
          {/* Background bar (full width, representing 100%) */}
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={theme.palette.grey[200]}
            rx={2}
            ry={2}
          />

          {/* Actual progress bar */}
          <rect
            x={0}
            y={0}
            width={(percentComplete / 100) * width}
            height={height}
            fill={getActualColor()}
            rx={2}
            ry={2}
          />

          {/* Comparative marker (if provided) */}
          {comparative !== null && (
            <rect
              x={(comparativePercent! / 100) * width - 1}
              y={0}
              width={2}
              height={height}
              fill={getComparativeColor()}
            />
          )}

          {/* Target marker */}
          <rect
            x={(target / target) * width - 2}
            y={0}
            width={2}
            height={height}
            fill={getTargetColor()}
          />
        </svg>
      </Box>
    </Tooltip>
  );
};

export { MicroSparkline, MicroBarChart, MicroBulletChart };