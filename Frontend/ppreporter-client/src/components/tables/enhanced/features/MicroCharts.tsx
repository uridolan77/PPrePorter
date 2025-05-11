import React from 'react';
import { Box, useTheme } from '@mui/material';
import { MicroChartConfig } from '../types';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showArea?: boolean;
  showPoints?: boolean;
  lineWidth?: number;
  pointRadius?: number;
}

/**
 * Sparkline chart component
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 30,
  color,
  fillColor,
  showArea = true,
  showPoints = false,
  lineWidth = 1.5,
  pointRadius = 2
}) => {
  const theme = useTheme();
  
  // Use theme colors if not provided
  const lineColor = color || theme.palette.primary.main;
  const areaColor = fillColor || `${lineColor}40`; // 25% opacity
  
  if (!data || data.length === 0) {
    return <Box width={width} height={height} />;
  }
  
  // Calculate min and max values
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero
  
  // Calculate coordinates
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / valueRange) * height;
    return { x, y };
  });
  
  // Create SVG path
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  // Create area path if needed
  let areaPath = '';
  if (showArea) {
    areaPath = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  }
  
  return (
    <Box width={width} height={height}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {showArea && (
          <path
            d={areaPath}
            fill={areaColor}
            stroke="none"
          />
        )}
        
        <path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {showPoints && points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={pointRadius}
            fill={lineColor}
          />
        ))}
      </svg>
    </Box>
  );
};

interface MiniBarChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  barSpacing?: number;
  borderRadius?: number;
  showValues?: boolean;
}

/**
 * Mini bar chart component
 */
export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  width = 100,
  height = 30,
  color,
  barSpacing = 1,
  borderRadius = 1,
  showValues = false
}) => {
  const theme = useTheme();
  
  // Use theme colors if not provided
  const barColor = color || theme.palette.primary.main;
  
  if (!data || data.length === 0) {
    return <Box width={width} height={height} />;
  }
  
  // Calculate min and max values
  const minValue = Math.min(0, ...data); // Include 0 to ensure proper scaling
  const maxValue = Math.max(...data);
  const valueRange = maxValue - minValue || 1; // Avoid division by zero
  
  // Calculate bar width
  const barWidth = (width - (data.length - 1) * barSpacing) / data.length;
  
  return (
    <Box width={width} height={height}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {data.map((value, index) => {
          const barHeight = ((value - minValue) / valueRange) * height;
          const x = index * (barWidth + barSpacing);
          const y = height - barHeight;
          
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={barColor}
              rx={borderRadius}
              ry={borderRadius}
            />
          );
        })}
        
        {showValues && data.map((value, index) => {
          const barHeight = ((value - minValue) / valueRange) * height;
          const x = index * (barWidth + barSpacing) + barWidth / 2;
          const y = height - barHeight - 2;
          
          return (
            <text
              key={`text-${index}`}
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="8px"
              fill={theme.palette.text.primary}
            >
              {value}
            </text>
          );
        })}
      </svg>
    </Box>
  );
};

interface MiniPieChartProps {
  data: { value: number; label?: string }[];
  width?: number;
  height?: number;
  colors?: string[];
  donut?: boolean;
  innerRadius?: number;
}

/**
 * Mini pie chart component
 */
export const MiniPieChart: React.FC<MiniPieChartProps> = ({
  data,
  width = 40,
  height = 40,
  colors,
  donut = false,
  innerRadius = 0.5
}) => {
  const theme = useTheme();
  
  // Use theme colors if not provided
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main
  ];
  
  const pieColors = colors || defaultColors;
  
  if (!data || data.length === 0) {
    return <Box width={width} height={height} />;
  }
  
  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate center and radius
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY);
  const donutRadius = donut ? radius * innerRadius : 0;
  
  // Calculate pie slices
  let startAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const angle = percentage * 2 * Math.PI;
    
    const slice = {
      startAngle,
      endAngle: startAngle + angle,
      color: pieColors[index % pieColors.length],
      value: item.value,
      label: item.label
    };
    
    startAngle += angle;
    return slice;
  });
  
  // Create SVG paths for slices
  const createSlicePath = (slice: typeof slices[0]) => {
    const startX = centerX + radius * Math.cos(slice.startAngle);
    const startY = centerY + radius * Math.sin(slice.startAngle);
    const endX = centerX + radius * Math.cos(slice.endAngle);
    const endY = centerY + radius * Math.sin(slice.endAngle);
    
    const largeArcFlag = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;
    
    // Outer arc
    let path = `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    
    // If donut, cut out inner circle
    if (donut) {
      const innerStartX = centerX + donutRadius * Math.cos(slice.startAngle);
      const innerStartY = centerY + donutRadius * Math.sin(slice.startAngle);
      const innerEndX = centerX + donutRadius * Math.cos(slice.endAngle);
      const innerEndY = centerY + donutRadius * Math.sin(slice.endAngle);
      
      path = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} ` +
             `L ${centerX} ${centerY} ` +
             `L ${innerEndX} ${innerEndY} A ${donutRadius} ${donutRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} ` +
             `L ${centerX} ${centerY} Z`;
    }
    
    return path;
  };
  
  return (
    <Box width={width} height={height}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {slices.map((slice, index) => (
          <path
            key={index}
            d={createSlicePath(slice)}
            fill={slice.color}
            stroke={theme.palette.background.paper}
            strokeWidth={0.5}
          />
        ))}
      </svg>
    </Box>
  );
};

interface MicroChartProps {
  data: any;
  config: MicroChartConfig;
}

/**
 * Micro chart component factory
 */
const MicroChart: React.FC<MicroChartProps> = ({
  data,
  config
}) => {
  // Extract data from row
  const chartData = Array.isArray(data) ? data : data[config.dataField] || [];
  
  // Render appropriate chart type
  switch (config.type) {
    case 'sparkline':
      return (
        <Sparkline
          data={chartData}
          width={config.width}
          height={config.height}
          color={config.color}
          fillColor={config.fillColor}
          showArea={config.showArea}
          showPoints={config.showPoints}
        />
      );
    
    case 'bar':
      return (
        <MiniBarChart
          data={chartData}
          width={config.width}
          height={config.height}
          color={config.color}
          barSpacing={config.barSpacing}
          borderRadius={config.borderRadius}
          showValues={config.showValues}
        />
      );
    
    case 'pie':
      return (
        <MiniPieChart
          data={chartData}
          width={config.width}
          height={config.height}
          colors={config.colors}
          donut={config.donut}
          innerRadius={config.innerRadius}
        />
      );
    
    default:
      return <Box>Unsupported chart type</Box>;
  }
};

export default MicroChart;
