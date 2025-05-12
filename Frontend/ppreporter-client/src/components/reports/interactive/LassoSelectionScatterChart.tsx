import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  Badge,
  Chip
} from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import FilterListIcon from '@mui/icons-material/FilterList';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { format as formatDate } from 'date-fns';
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
  Cell
} from 'recharts';

import EnhancedTooltip, { TooltipData } from './EnhancedTooltip';
import { useFilterContext, Filter } from './FilterContext';

// Point interface
interface Point {
  x: number;
  y: number;
}

// Lasso selection scatter chart props
interface LassoSelectionScatterChartProps {
  id: string;
  title: string;
  description?: string;
  data: any[];
  xKey: string;
  yKey: string;
  zKey?: string;
  nameKey?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  enableLassoSelection?: boolean;
  enableCrossFiltering?: boolean;
  tooltipFormatter?: (value: any, name: string, props: any) => string;
  getTooltipData?: (payload: any[], label: string) => TooltipData;
  onClick?: (data: any, index: number) => void;
}

/**
 * LassoSelectionScatterChart component
 * A scatter chart with lasso selection capabilities
 */
const LassoSelectionScatterChart: React.FC<LassoSelectionScatterChartProps> = ({
  id,
  title,
  description,
  data,
  xKey,
  yKey,
  zKey,
  nameKey = 'name',
  height = 300,
  loading = false,
  error = null,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'],
  showLegend = true,
  showGrid = true,
  enableLassoSelection = true,
  enableCrossFiltering = true,
  tooltipFormatter,
  getTooltipData,
  onClick
}) => {
  const theme = useTheme();
  const { filters, addFilter, removeFilter, clearFilters, getFiltersForSource, applyFilters } = useFilterContext();
  
  // Get active filters for this chart
  const activeFilters = getFiltersForSource(id);
  
  // Apply filters from other sources to the data
  const filteredData = applyFilters(data, id);
  
  // State for lasso selection
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectedPoints, setSelectedPoints] = useState<any[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  
  // Refs for chart components
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scatterRef = useRef<any>(null);
  
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
  
  // Custom tooltip content
  const CustomTooltipContent = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }
    
    // Generate tooltip data
    let tooltipData: TooltipData;
    
    if (getTooltipData) {
      // Use custom function to get tooltip data
      tooltipData = getTooltipData(payload, '');
    } else {
      // Generate default tooltip data
      const item = payload[0].payload;
      
      tooltipData = {
        label: item[nameKey] || '',
        payload: [
          {
            name: xKey.charAt(0).toUpperCase() + xKey.slice(1).replace(/([A-Z])/g, ' $1'),
            value: item[xKey],
            color: payload[0].color || payload[0].fill
          },
          {
            name: yKey.charAt(0).toUpperCase() + yKey.slice(1).replace(/([A-Z])/g, ' $1'),
            value: item[yKey],
            color: payload[0].color || payload[0].fill
          }
        ]
      };
      
      // Add Z value if available
      if (zKey && item[zKey] !== undefined) {
        tooltipData.payload.push({
          name: zKey.charAt(0).toUpperCase() + zKey.slice(1).replace(/([A-Z])/g, ' $1'),
          value: item[zKey],
          color: payload[0].color || payload[0].fill
        });
      }
      
      // Add additional info if available
      const additionalInfo = [];
      
      for (const key in item) {
        if (
          key !== xKey &&
          key !== yKey &&
          key !== zKey &&
          key !== nameKey &&
          key !== 'id' &&
          key !== 'color' &&
          key !== 'fill'
        ) {
          additionalInfo.push({
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
            value: item[key]
          });
        }
      }
      
      if (additionalInfo.length > 0) {
        tooltipData.additionalInfo = additionalInfo;
      }
    }
    
    return <EnhancedTooltip tooltipData={tooltipData} formatter={tooltipFormatter} />;
  };
  
  // Convert SVG coordinates to chart coordinates
  const svgToChartCoords = useCallback((svgX: number, svgY: number): Point | null => {
    if (!svgRef.current) return null;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    
    // Get chart area dimensions
    const chartWidth = rect.width;
    const chartHeight = rect.height;
    
    // Get chart margins (approximate)
    const marginTop = 10;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 60;
    
    // Calculate chart area
    const chartAreaWidth = chartWidth - marginLeft - marginRight;
    const chartAreaHeight = chartHeight - marginTop - marginBottom;
    
    // Convert SVG coordinates to chart coordinates
    const chartX = (svgX - marginLeft) / chartAreaWidth;
    const chartY = (svgY - marginTop) / chartAreaHeight;
    
    // Ensure coordinates are within chart area
    if (chartX < 0 || chartX > 1 || chartY < 0 || chartY > 1) {
      return null;
    }
    
    return { x: chartX, y: chartY };
  }, []);
  
  // Handle mouse down for lasso selection
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!enableLassoSelection) return;
    
    // Get mouse position relative to SVG
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to chart coordinates
    const chartCoords = svgToChartCoords(x, y);
    if (!chartCoords) return;
    
    // Start selection
    setIsSelecting(true);
    setLassoPoints([chartCoords]);
  }, [enableLassoSelection, svgToChartCoords]);
  
  // Handle mouse move for lasso selection
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!enableLassoSelection || !isSelecting) return;
    
    // Get mouse position relative to SVG
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to chart coordinates
    const chartCoords = svgToChartCoords(x, y);
    if (!chartCoords) return;
    
    // Add point to lasso
    setLassoPoints(prev => [...prev, chartCoords]);
  }, [enableLassoSelection, isSelecting, svgToChartCoords]);
  
  // Handle mouse up for lasso selection
  const handleMouseUp = useCallback(() => {
    if (!enableLassoSelection || !isSelecting) return;
    
    // End selection
    setIsSelecting(false);
    
    // If less than 3 points, clear lasso
    if (lassoPoints.length < 3) {
      setLassoPoints([]);
      return;
    }
    
    // Close the lasso by adding the first point again
    const closedLasso = [...lassoPoints, lassoPoints[0]];
    
    // Find points inside lasso
    const selected = filteredData.filter(item => {
      // Get data point coordinates
      const xValue = item[xKey];
      const yValue = item[yKey];
      
      // Skip if coordinates are not numbers
      if (typeof xValue !== 'number' || typeof yValue !== 'number') {
        return false;
      }
      
      // Convert data coordinates to chart coordinates
      const xMin = Math.min(...filteredData.map(d => d[xKey]));
      const xMax = Math.max(...filteredData.map(d => d[xKey]));
      const yMin = Math.min(...filteredData.map(d => d[yKey]));
      const yMax = Math.max(...filteredData.map(d => d[yKey]));
      
      const chartX = (xValue - xMin) / (xMax - xMin);
      const chartY = 1 - (yValue - yMin) / (yMax - yMin); // Invert Y axis
      
      // Check if point is inside lasso
      return isPointInPolygon(chartX, chartY, closedLasso);
    });
    
    // Update selected points
    setSelectedPoints(selected);
    
    // Apply filter if cross-filtering is enabled
    if (enableCrossFiltering && selected.length > 0) {
      // Create filter for selected points
      const filterId = `${id}-lasso-selection`;
      
      // Remove existing filter
      removeFilter(filterId);
      
      // Add new filter
      const newFilter: Filter = {
        id: filterId,
        type: 'category',
        field: 'id',
        value: selected.map(item => item.id),
        operator: 'in',
        source: id
      };
      
      addFilter(newFilter);
    }
    
    // Clear lasso
    setLassoPoints([]);
  }, [
    enableLassoSelection, isSelecting, lassoPoints, filteredData,
    xKey, yKey, id, enableCrossFiltering, addFilter, removeFilter
  ]);
  
  // Check if a point is inside a polygon (lasso)
  const isPointInPolygon = (x: number, y: number, polygon: Point[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  };
  
  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedPoints([]);
    
    // Remove filter
    const filterId = `${id}-lasso-selection`;
    removeFilter(filterId);
  }, [id, removeFilter]);
  
  // Select all points
  const handleSelectAll = useCallback(() => {
    setSelectedPoints(filteredData);
    
    // Create filter for all points
    const filterId = `${id}-lasso-selection`;
    
    // Remove existing filter
    removeFilter(filterId);
    
    // Add new filter
    const newFilter: Filter = {
      id: filterId,
      type: 'category',
      field: 'id',
      value: filteredData.map(item => item.id),
      operator: 'in',
      source: id
    };
    
    addFilter(newFilter);
  }, [filteredData, id, addFilter, removeFilter]);
  
  // Handle point hover
  const handlePointHover = useCallback((data: any) => {
    setHoveredPoint(data);
  }, []);
  
  // Handle point click
  const handlePointClick = useCallback((data: any, index: number) => {
    if (onClick) {
      onClick(data, index);
    }
  }, [onClick]);
  
  // Render lasso path
  const renderLassoPath = () => {
    if (lassoPoints.length < 2) return null;
    
    // Convert chart coordinates to SVG coordinates
    const svgPoints = lassoPoints.map(point => {
      const svg = svgRef.current;
      if (!svg) return '';
      
      const rect = svg.getBoundingClientRect();
      
      // Get chart margins (approximate)
      const marginTop = 10;
      const marginRight = 30;
      const marginBottom = 30;
      const marginLeft = 60;
      
      // Calculate chart area
      const chartAreaWidth = rect.width - marginLeft - marginRight;
      const chartAreaHeight = rect.height - marginTop - marginBottom;
      
      // Convert chart coordinates to SVG coordinates
      const svgX = point.x * chartAreaWidth + marginLeft;
      const svgY = point.y * chartAreaHeight + marginTop;
      
      return `${svgX},${svgY}`;
    });
    
    return (
      <polyline
        points={svgPoints.join(' ')}
        fill="none"
        stroke={theme.palette.primary.main}
        strokeWidth={2}
        strokeDasharray="5,5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  // Render empty state
  if (!filteredData || filteredData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ height, position: 'relative' }}>
      {/* Selection controls */}
      {enableLassoSelection && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 1,
            p: 0.5
          }}
        >
          <Tooltip title="Select All Points">
            <IconButton size="small" onClick={handleSelectAll}>
              <SelectAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Selection">
            <IconButton
              size="small"
              onClick={handleClearSelection}
              disabled={selectedPoints.length === 0}
            >
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Badge badgeContent={selectedPoints.length} color="primary" max={99}>
            <FilterListIcon fontSize="small" />
          </Badge>
        </Box>
      )}
      
      {/* Selected points count */}
      {selectedPoints.length > 0 && (
        <Box sx={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
          <Chip
            label={`${selectedPoints.length} points selected`}
            onDelete={handleClearSelection}
            deleteIcon={<HighlightOffIcon />}
            color="primary"
            size="small"
          />
        </Box>
      )}
      
      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          ref={scatterRef}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            type="number"
            dataKey={xKey}
            name={xKey.charAt(0).toUpperCase() + xKey.slice(1).replace(/([A-Z])/g, ' $1')}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            name={yKey.charAt(0).toUpperCase() + yKey.slice(1).replace(/([A-Z])/g, ' $1')}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
          {zKey && (
            <ZAxis
              type="number"
              dataKey={zKey}
              range={[50, 500]}
              name={zKey.charAt(0).toUpperCase() + zKey.slice(1).replace(/([A-Z])/g, ' $1')}
            />
          )}
          <RechartsTooltip content={<CustomTooltipContent />} />
          {showLegend && <Legend />}
          <Scatter
            name={title}
            data={filteredData}
            fill={colors[0]}
            onMouseEnter={handlePointHover}
            onClick={handlePointClick}
          >
            {filteredData.map((entry, index) => {
              // Check if point is selected
              const isSelected = selectedPoints.some(p => p.id === entry.id);
              
              // Check if point is hovered
              const isHovered = hoveredPoint && hoveredPoint.id === entry.id;
              
              // Determine fill color
              let fillColor = colors[index % colors.length];
              if (entry.color) {
                fillColor = entry.color;
              }
              
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={fillColor}
                  stroke={isSelected ? theme.palette.primary.main : isHovered ? theme.palette.secondary.main : fillColor}
                  strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0}
                  opacity={isSelected ? 1 : 0.7}
                />
              );
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* SVG overlay for lasso selection */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: enableLassoSelection ? 'auto' : 'none',
          cursor: isSelecting ? 'crosshair' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderLassoPath()}
      </svg>
    </Box>
  );
};

export default LassoSelectionScatterChart;
