import React, { useState, useCallback, useMemo } from 'react';
import {
  Typography,
  CircularProgress,
  Chip,
  useTheme,
  Paper,
  IconButton,
  Tooltip as MuiTooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { format as formatDate } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Sector
} from 'recharts';

import EnhancedTooltip, { TooltipData } from './EnhancedTooltip';
import DrilldownModal, { DrilldownData } from './DrilldownModal';
import { useFilterContext, Filter } from './FilterContext';

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
  [key: string]: any;
}

/**
 * Chart types
 */
export type ChartType = 'area' | 'bar' | 'line' | 'pie';

/**
 * Interactive chart props
 */
interface InteractiveChartProps {
  /** Unique identifier for the chart */
  id: string;
  /** Chart title */
  title: string;
  /** Optional chart description */
  description?: string;
  /** Chart type */
  type: ChartType;
  /** Chart data array */
  data: ChartDataPoint[];
  /** Key for X-axis values */
  xKey: string;
  /** Keys for Y-axis values */
  yKeys?: string[];
  /** Key for name/label values (used in pie charts) */
  nameKey?: string;
  /** Key for value data (used in pie charts) */
  valueKey?: string;
  /** Chart height in pixels */
  height?: number;
  /** Loading state indicator */
  loading?: boolean;
  /** Error message if any */
  error?: string | null;
  /** Chart colors array */
  colors?: string[];
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Whether to enable drill-down functionality */
  enableDrilldown?: boolean;
  /** Whether to enable tooltips */
  enableTooltip?: boolean;
  /** Whether to enable cross-filtering */
  enableCrossFiltering?: boolean;
  /** Custom tooltip formatter function */
  tooltipFormatter?: (value: any, name: string, props: any) => string;
  /** Function to handle click events */
  onClick?: (data: ChartDataPoint, index: number) => void;
  /** Function to get tooltip data */
  getTooltipData?: (payload: any[], label: string) => TooltipData;
  /** Function to get drill-down data */
  getDrilldownData?: (data: ChartDataPoint, index: number) => DrilldownData;
}

/**
 * InteractiveChart component
 * A chart component with interactive features like drill-down, enhanced tooltips, and cross-filtering
 */
const InteractiveChart: React.FC<InteractiveChartProps> = ({
  id,
  title,
  description,
  type,
  data,
  xKey,
  yKeys = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 300,
  loading = false,
  error = null,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'],
  showLegend = true,
  showGrid = true,
  enableDrilldown = true,
  enableTooltip = true,
  enableCrossFiltering = true,
  tooltipFormatter,
  onClick,
  getTooltipData,
  getDrilldownData
}) => {
  const theme = useTheme();
  const { filters, addFilter, removeFilter, getFiltersForSource, applyFilters } = useFilterContext();

  // State for active elements
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [drilldownOpen, setDrilldownOpen] = useState<boolean>(false);
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);



  // Get active filters for this chart
  const activeFilters = useMemo(() => {
    return getFiltersForSource(id);
  }, [getFiltersForSource, id]);

  // Apply filters from other sources to the data
  const filteredData = useMemo(() => {
    return applyFilters(data, id);
  }, [applyFilters, data, id]);

  /**
   * Format currency value
   * @param amount - The amount to format
   * @returns Formatted currency string
   */
  const formatCurrency = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return (amount: number): string => {
      return formatter.format(amount);
    };
  }, []);

  /**
   * Format number value
   * @param value - The number to format
   * @returns Formatted number string
   */
  const formatNumber = useMemo(() => {
    const formatter = new Intl.NumberFormat('en-US');

    return (value: number): string => {
      return formatter.format(value);
    };
  }, []);

  /**
   * Format date for display
   * @param value - The date string to format
   * @returns Formatted date string
   */
  const formatDateValue = useCallback((value: string | number | undefined | null): string => {
    try {
      if (value === undefined || value === null) return '';

      const strValue = String(value);

      // Check if it's a date string with ISO format
      if (typeof strValue === 'string' && strValue.includes('T')) {
        const date = new Date(strValue);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return strValue;
        }
        return formatDate(date, 'MMM dd');
      }

      return strValue;
    } catch (error) {
      console.warn('Error formatting date:', error);
      return String(value || '');
    }
  }, []);

  // Handle chart element click
  const handleClick = useCallback((data: any, index: number) => {
    // Call custom onClick handler if provided
    if (onClick) {
      onClick(data, index);
      return;
    }

    if (enableDrilldown) {
      // Generate drilldown data
      let drillData: DrilldownData;

      if (getDrilldownData) {
        // Use custom function to get drilldown data
        drillData = getDrilldownData(data, index);
      } else {
        // Generate default drilldown data
        let drilldownTitle = '';
        let category = '';
        let value = 0;
        let detailData: any[] = [];

        if (type === 'pie') {
          drilldownTitle = `${title} - ${data[nameKey]}`;
          category = data[nameKey];
          value = data[valueKey];

          // Filter original data to get details
          detailData = filteredData.filter((item: any) => {
            if (typeof item[nameKey] === 'string' && typeof data[nameKey] === 'string') {
              return item[nameKey].toLowerCase() === data[nameKey].toLowerCase();
            }
            return item[nameKey] === data[nameKey];
          });
        } else {
          drilldownTitle = `${title} - ${data[xKey]}`;
          category = data[xKey];

          if (yKeys.length > 0) {
            // Use the first yKey as the value
            value = data[yKeys[0]];
          } else {
            value = data[valueKey];
          }

          // Filter original data to get details
          detailData = filteredData.filter((item: any) => {
            if (typeof item[xKey] === 'string' && typeof data[xKey] === 'string') {
              return item[xKey].toLowerCase() === data[xKey].toLowerCase();
            }
            return item[xKey] === data[xKey];
          });
        }

        drillData = {
          title: drilldownTitle,
          description: description,
          category,
          value,
          data: detailData
        };
      }

      setDrilldownData(drillData);
      setDrilldownOpen(true);
    } else if (enableCrossFiltering) {
      // Add filter for cross-filtering
      let filterId = '';
      let filterValue: any = null;
      let filterField = '';

      if (type === 'pie') {
        filterId = `${id}-${nameKey}-${data[nameKey]}`;
        filterValue = data[nameKey];
        filterField = nameKey;
      } else {
        filterId = `${id}-${xKey}-${data[xKey]}`;
        filterValue = data[xKey];
        filterField = xKey;
      }

      // Check if filter already exists
      const existingFilter = activeFilters.find(f => f.id === filterId);

      if (existingFilter) {
        // Remove filter if it exists
        removeFilter(filterId);
      } else {
        // Add new filter
        const newFilter: Filter = {
          id: filterId,
          type: 'category',
          field: filterField,
          value: filterValue,
          operator: 'equals',
          source: id
        };

        addFilter(newFilter);
      }
    }
  }, [
    onClick, enableDrilldown, getDrilldownData, type, title, description,
    nameKey, valueKey, xKey, yKeys, filteredData, enableCrossFiltering,
    id, activeFilters, removeFilter, addFilter
  ]);

  // Handle pie chart active sector
  const handlePieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  const handlePieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Render active shape for pie chart
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={theme.palette.text.primary}>
          {payload[nameKey]}
        </text>
        <text x={cx} y={cy} dy={0} textAnchor="middle" fill={theme.palette.text.primary}>
          {value >= 1000 ? formatCurrency(value) : formatNumber(value)}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill={theme.palette.text.secondary}>
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  // Custom tooltip content
  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0 || !enableTooltip) {
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
        label: label,
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

  // Remove filter handler
  const handleRemoveFilter = (filterId: string) => {
    removeFilter(filterId);
  };

  /**
   * Format a key into a readable label
   * @param key - The key to format
   * @returns Formatted label
   */
  const formatKeyToLabel = useCallback((key: string): string => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  }, []);

  /**
   * Format date for X-axis ticks
   * @param value - The value to format
   * @returns Formatted date string
   */
  const formatXAxisTick = useCallback((value: any): string => {
    try {
      if (!value) return '';

      if (typeof value === 'string' && value.includes('T')) {
        const date = new Date(value);
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return String(value);
        }
        return formatDate(date, 'MMM dd');
      }
      return String(value);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return String(value || '');
    }
  }, []);

  /**
   * Format number for Y-axis ticks
   * @param value - The value to format
   * @returns Formatted number string
   */
  const formatYAxisTick = useCallback((value: any): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return String(value);
  }, []);

  // Render chart based on type - memoized to prevent unnecessary re-renders
  const renderChart = useMemo(() => {
    // If data is not available, return null (we'll handle this in the render method)
    if (!filteredData || filteredData.length === 0) {
      return null;
    }
    // Common chart props
    const commonChartProps = {
      data: filteredData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    // Common axis props
    const xAxisProps = {
      dataKey: xKey,
      tick: { fill: theme.palette.text.secondary, fontSize: 12 },
      tickFormatter: formatXAxisTick
    };

    const yAxisProps = {
      tick: { fill: theme.palette.text.secondary, fontSize: 12 },
      tickFormatter: formatYAxisTick
    };

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonChartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltipContent />} />
              {showLegend && <Legend />}
              {yKeys?.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                  name={formatKeyToLabel(key)}
                  activeDot={{ onClick: (e: any, i: number) => handleClick(e.payload, i) }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonChartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltipContent />} />
              {showLegend && <Legend />}
              {yKeys?.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  name={formatKeyToLabel(key)}
                  onClick={(data: any, index: number) => handleClick(data, index)}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonChartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <RechartsTooltip content={<CustomTooltipContent />} />
              {showLegend && <Legend />}
              {yKeys?.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  name={formatKeyToLabel(key)}
                  activeDot={{ onClick: (e: any, i: number) => handleClick(e.payload, i) }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey={valueKey}
                nameKey={nameKey}
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
                onClick={(data: any, index: number) => handleClick(data, index)}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltipContent />} />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">Unsupported chart type</Typography>
          </div>
        );
    }
  }, [
    filteredData, type, showGrid, xKey, theme, showLegend, yKeys, colors,
    valueKey, nameKey, activeIndex, renderActiveShape, handlePieEnter,
    handlePieLeave, handleClick, formatKeyToLabel, formatXAxisTick,
    formatYAxisTick, CustomTooltipContent
  ]);

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
  if (!filteredData || filteredData.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </div>
    );
  }

  return (
    <Paper sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1">{title}</Typography>
          {description && (
            <MuiTooltip title={description}>
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {enableDrilldown && (
            <MuiTooltip title="Click on chart elements to drill down">
              <IconButton size="small">
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
          {enableCrossFiltering && (
            <MuiTooltip title="Click on chart elements to filter">
              <IconButton size="small">
                <FilterListIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div style={{ paddingLeft: 16, paddingRight: 16, paddingBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.id}
              label={`${filter.field}: ${filter.value}`}
              size="small"
              onDelete={() => handleRemoveFilter(filter.id)}
              deleteIcon={<HighlightOffIcon />}
            />
          ))}
        </div>
      )}

      {/* Chart */}
      <div style={{ flex: 1, padding: 8 }}>
        {renderChart}
      </div>

      {/* Drilldown Modal */}
      <DrilldownModal
        open={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        drilldownData={drilldownData}
      />
    </Paper>
  );
};

export default InteractiveChart;
