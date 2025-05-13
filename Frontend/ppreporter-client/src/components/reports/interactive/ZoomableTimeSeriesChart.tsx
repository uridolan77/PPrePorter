import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { format as formatDate, parseISO } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Brush,
  ReferenceArea
} from 'recharts';

import EnhancedTooltip, { TooltipData } from './EnhancedTooltip';

// Chart types
export type TimeSeriesChartType = 'area' | 'line' | 'bar';

// Zoomable time series chart props
interface ZoomableTimeSeriesChartProps {
  id: string;
  title: string;
  description?: string;
  type: TimeSeriesChartType;
  data: any[];
  xKey: string;
  yKeys: string[];
  height?: number;
  loading?: boolean;
  error?: string | null;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  enableBrush?: boolean;
  enableZoom?: boolean;
  tooltipFormatter?: (value: any, name: string, props: any) => string;
  getTooltipData?: (payload: any[], label: string) => TooltipData;
  onClick?: (data: any, index: number) => void;
}

/**
 * ZoomableTimeSeriesChart component
 * A time series chart with brushing and zooming capabilities
 */
const ZoomableTimeSeriesChart: React.FC<ZoomableTimeSeriesChartProps> = ({
  id,
  title,
  description,
  type,
  data,
  xKey,
  yKeys,
  height = 300,
  loading = false,
  error = null,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'],
  showLegend = true,
  showGrid = true,
  enableBrush = true,
  enableZoom = true,
  tooltipFormatter,
  getTooltipData,
  onClick
}) => {
  const theme = useTheme();

  // State for zoom
  const [zoomState, setZoomState] = useState<{
    refAreaLeft: string | null;
    refAreaRight: string | null;
    zoomed: boolean;
    zoomDomain: { x: [number, number] } | null;
  }>({
    refAreaLeft: null,
    refAreaRight: null,
    zoomed: false,
    zoomDomain: null
  });

  // Refs for chart components
  const chartRef = useRef<any>(null);

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    try {
      // Check if dateStr is a valid string
      if (!dateStr || typeof dateStr !== 'string') {
        return String(dateStr || '');
      }

      // Check if it's an ISO date string
      if (dateStr.includes('T')) {
        const date = parseISO(dateStr);
        // Validate the date is valid before formatting
        if (isNaN(date.getTime())) {
          return String(dateStr);
        }
        return formatDate(date, 'MMM dd, yyyy');
      }

      // For non-ISO date strings, just return as is
      return dateStr;
    } catch (error) {
      console.warn('Error formatting date:', error);
      return String(dateStr || '');
    }
  };

  // Custom tooltip content
  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    // Generate tooltip data
    let tooltipData: TooltipData;

    if (getTooltipData) {
      // Use custom function to get tooltip data
      tooltipData = getTooltipData(payload, label);
    } else {
      // Generate default tooltip data
      tooltipData = {
        label: formatDateDisplay(label),
        payload: payload.map((entry: any) => ({
          name: entry.name,
          value: entry.value,
          color: entry.color || entry.fill
        }))
      };

      // Add comparison data if available
      if (payload[0] && payload[0].payload) {
        const prevValue = payload[0].payload.previousValue;
        if (prevValue !== undefined) {
          const currentValue = payload[0].value;
          const change = currentValue - prevValue;
          const changePercentage = prevValue !== 0 ? (change / prevValue) * 100 : 0;

          tooltipData.comparison = {
            label: 'Previous Period',
            value: prevValue,
            change,
            changePercentage
          };
        }
      }
    }

    return <EnhancedTooltip tooltipData={tooltipData} formatter={tooltipFormatter} />;
  };

  // Handle mouse down for zoom
  const handleMouseDown = useCallback((e: any) => {
    if (!enableZoom || !e) return;

    setZoomState(prev => ({
      ...prev,
      refAreaLeft: e.activeLabel
    }));
  }, [enableZoom]);

  // Handle mouse move for zoom
  const handleMouseMove = useCallback((e: any) => {
    if (!enableZoom || !zoomState.refAreaLeft || !e) return;

    setZoomState(prev => ({
      ...prev,
      refAreaRight: e.activeLabel
    }));
  }, [enableZoom, zoomState.refAreaLeft]);

  // Handle mouse up for zoom
  const handleMouseUp = useCallback(() => {
    if (!enableZoom || !zoomState.refAreaLeft || !zoomState.refAreaRight) {
      setZoomState(prev => ({
        ...prev,
        refAreaLeft: null,
        refAreaRight: null
      }));
      return;
    }

    // Get indices of selected area
    let indexLeft = data.findIndex(d => d[xKey] === zoomState.refAreaLeft);
    let indexRight = data.findIndex(d => d[xKey] === zoomState.refAreaRight);

    // Ensure left is before right
    if (indexLeft > indexRight) {
      [indexLeft, indexRight] = [indexRight, indexLeft];
    }

    // Set zoom domain
    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      zoomed: true,
      zoomDomain: {
        x: [indexLeft, indexRight]
      }
    });
  }, [enableZoom, zoomState.refAreaLeft, zoomState.refAreaRight, data, xKey]);

  // Reset zoom
  const handleResetZoom = useCallback(() => {
    setZoomState({
      refAreaLeft: null,
      refAreaRight: null,
      zoomed: false,
      zoomDomain: null
    });
  }, []);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    if (!zoomState.zoomed) {
      // If not zoomed, zoom to the middle 50%
      const middleIndex = Math.floor(data.length / 2);
      const quarterIndex = Math.floor(data.length / 4);

      setZoomState({
        refAreaLeft: null,
        refAreaRight: null,
        zoomed: true,
        zoomDomain: {
          x: [middleIndex - quarterIndex, middleIndex + quarterIndex]
        }
      });
    } else if (zoomState.zoomDomain) {
      // If already zoomed, zoom in further by 25%
      const [left, right] = zoomState.zoomDomain.x;
      const range = right - left;
      const newLeft = Math.max(0, Math.floor(left + range * 0.25));
      const newRight = Math.min(data.length - 1, Math.floor(right - range * 0.25));

      setZoomState({
        ...zoomState,
        zoomDomain: {
          x: [newLeft, newRight]
        }
      });
    }
  }, [zoomState, data]);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    if (zoomState.zoomed && zoomState.zoomDomain) {
      // Zoom out by 25%
      const [left, right] = zoomState.zoomDomain.x;
      const range = right - left;
      const newLeft = Math.max(0, Math.floor(left - range * 0.25));
      const newRight = Math.min(data.length - 1, Math.floor(right + range * 0.25));

      // If zoomed out to almost full view, reset zoom
      if (newLeft <= 1 && newRight >= data.length - 2) {
        handleResetZoom();
      } else {
        setZoomState({
          ...zoomState,
          zoomDomain: {
            x: [newLeft, newRight]
          }
        });
      }
    }
  }, [zoomState, data, handleResetZoom]);

  // Get domain for X axis
  const getXDomain = useCallback(() => {
    if (zoomState.zoomed && zoomState.zoomDomain) {
      const [left, right] = zoomState.zoomDomain.x;
      return [data[left]?.[xKey], data[right]?.[xKey]];
    }
    return undefined;
  }, [zoomState, data, xKey]);

  // Render loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </div>
    );
  }

  // Get chart component based on type
  const getChartComponent = () => {
    // Common props for all chart types
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp
    };

    // Domain for X axis when zoomed
    const xDomain = getXDomain();

    // Common axis props
    const xAxisProps = {
      dataKey: xKey,
      tick: { fill: theme.palette.text.secondary, fontSize: 12 },
      tickFormatter: (value: any) => {
        // Ensure we're passing a valid value to formatDateDisplay
        if (value === undefined || value === null) {
          return '';
        }
        return formatDateDisplay(String(value));
      },
      domain: xDomain as [string | number, string | number] | undefined,
      allowDataOverflow: true
    };

    const yAxisProps = {
      tick: { fill: theme.palette.text.secondary, fontSize: 12 },
      tickFormatter: (value: number) => {
        if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}k`;
        }
        return value.toString();
      }
    };

    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps} ref={chartRef}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <RechartsTooltip content={<CustomTooltipContent />} />
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
                name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                activeDot={{ onClick: (e: any, i: number) => onClick && onClick(e.payload, i) }}
              />
            ))}
            {enableBrush && !zoomState.zoomed && (
              <Brush
                dataKey={xKey}
                height={30}
                stroke={theme.palette.primary.main}
                tickFormatter={(value: any) => {
                  if (value === undefined || value === null) {
                    return '';
                  }
                  return formatDateDisplay(String(value));
                }}
              />
            )}
            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea
                x1={zoomState.refAreaLeft}
                x2={zoomState.refAreaRight}
                strokeOpacity={0.3}
                fill={theme.palette.primary.main}
                fillOpacity={0.3}
              />
            )}
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps} ref={chartRef}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <RechartsTooltip content={<CustomTooltipContent />} />
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                activeDot={{ onClick: (e: any, i: number) => onClick && onClick(e.payload, i) }}
              />
            ))}
            {enableBrush && !zoomState.zoomed && (
              <Brush
                dataKey={xKey}
                height={30}
                stroke={theme.palette.primary.main}
                tickFormatter={(value: any) => {
                  if (value === undefined || value === null) {
                    return '';
                  }
                  return formatDateDisplay(String(value));
                }}
              />
            )}
            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea
                x1={zoomState.refAreaLeft}
                x2={zoomState.refAreaRight}
                strokeOpacity={0.3}
                fill={theme.palette.primary.main}
                fillOpacity={0.3}
              />
            )}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps} ref={chartRef}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <RechartsTooltip content={<CustomTooltipContent />} />
            {showLegend && <Legend />}
            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                name={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                onClick={(data: any, index: number) => onClick && onClick(data, index)}
              />
            ))}
            {enableBrush && !zoomState.zoomed && (
              <Brush
                dataKey={xKey}
                height={30}
                stroke={theme.palette.primary.main}
                tickFormatter={(value: any) => {
                  if (value === undefined || value === null) {
                    return '';
                  }
                  return formatDateDisplay(String(value));
                }}
              />
            )}
            {zoomState.refAreaLeft && zoomState.refAreaRight && (
              <ReferenceArea
                x1={zoomState.refAreaLeft}
                x2={zoomState.refAreaRight}
                strokeOpacity={0.3}
                fill={theme.palette.primary.main}
                fillOpacity={0.3}
              />
            )}
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ height, position: 'relative' }}>
      {/* Zoom controls */}
      {enableZoom && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 4,
            padding: 4
          }}
        >
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={!zoomState.zoomed}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton
              size="small"
              onClick={handleResetZoom}
              disabled={!zoomState.zoomed}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        {getChartComponent()}
      </ResponsiveContainer>
    </div>
  );
};

export default ZoomableTimeSeriesChart;
