/**
 * Type declarations for recharts components
 */
declare module 'recharts' {
  import * as React from 'react';

  export interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxHeight?: number;
    children?: React.ReactNode;
    debounce?: number;
    id?: string;
    className?: string;
    aspect?: number;
  }

  export class ResponsiveContainer extends React.Component<ResponsiveContainerProps> {}

  export interface LegendProps {
    width?: number;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    iconSize?: number;
    iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    payload?: Array<{
      value: any;
      id?: string;
      type?: string;
      color?: string;
    }>;
    formatter?: (value: any, entry: any) => React.ReactNode;
    onClick?: (event: any) => void;
    onMouseEnter?: (event: any) => void;
    onMouseLeave?: (event: any) => void;
    content?: React.ReactElement | ((props: any) => React.ReactNode);
    wrapperStyle?: React.CSSProperties;
    chartWidth?: number;
    chartHeight?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  export class Legend extends React.Component<LegendProps> {}

  export interface ParallelCoordinatesProps {
    data: Array<Record<string, any>>;
    dimensions: Array<{
      name: string;
      domain?: [number, number];
      tickFormatter?: (value: number) => string;
      type?: string;
    }>;
    colorBy?: {
      dataKey?: string;
      from?: string;
      to?: string;
      range?: Record<string, string>;
    };
    strokeWidth?: number;
    showMissingPoints?: boolean;
    axisTicksPosition?: 'start' | 'middle' | 'end' | 'both';
    animate?: boolean;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    axisLineColor?: string;
    axisTickColor?: string;
    axisTickLabelColor?: string;
    brushEnabled?: boolean;
    [key: string]: any;
  }

  export class ParallelCoordinates extends React.Component<ParallelCoordinatesProps> {}

  // Common props for all charts
  export interface ChartProps {
    width?: number;
    height?: number;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    [key: string]: any;
  }

  // Axis components
  export interface AxisProps {
    dataKey?: string;
    xAxisId?: string | number;
    yAxisId?: string | number;
    width?: number;
    height?: number;
    orientation?: 'top' | 'bottom' | 'left' | 'right';
    type?: 'number' | 'category';
    allowDecimals?: boolean;
    allowDataOverflow?: boolean;
    domain?: [number | string, number | string] | 'auto' | 'dataMin' | 'dataMax';
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    tick?: boolean | React.ReactElement | ((props: any) => React.ReactNode) | { fontSize?: number; [key: string]: any };
    tickCount?: number;
    tickFormatter?: (value: any) => string;
    tickLine?: boolean | React.ReactElement | object;
    axisLine?: boolean | React.ReactElement | object;
    label?: string | number | React.ReactElement | object;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    unit?: string | number;
    name?: string | number;
    padding?: {
      left?: number;
      right?: number;
    };
    minTickGap?: number;
    [key: string]: any;
  }

  export class XAxis extends React.Component<AxisProps> {}
  export class YAxis extends React.Component<AxisProps> {}
  export class ZAxis extends React.Component<AxisProps> {}

  // Grid components
  export interface GridProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    horizontal?: boolean;
    vertical?: boolean;
    horizontalPoints?: number[];
    verticalPoints?: number[];
    horizontalCoordinatesGenerator?: (props: any) => number[];
    verticalCoordinatesGenerator?: (props: any) => number[];
    xAxisId?: string | number;
    yAxisId?: string | number;
    stroke?: string;
    strokeDasharray?: string;
    [key: string]: any;
  }

  export class CartesianGrid extends React.Component<GridProps> {}

  // Tooltip component
  export interface TooltipProps {
    content?: React.ReactElement | ((props: any) => React.ReactNode);
    viewBox?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
    active?: boolean;
    separator?: string;
    formatter?: (value: any, name?: string | undefined, props?: any) => React.ReactNode | [string | number, string | number];
    labelFormatter?: (label: any) => React.ReactNode;
    itemSorter?: (item: any) => number;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    wrapperStyle?: React.CSSProperties;
    cursor?: boolean | React.ReactElement | object;
    coordinate?: {
      x?: number;
      y?: number;
    };
    position?: {
      x?: number;
      y?: number;
    };
    [key: string]: any;
  }

  export class Tooltip extends React.Component<TooltipProps> {}

  // Line Chart components
  export interface LineChartProps extends ChartProps {
    syncId?: string;
    syncMethod?: 'index' | 'value';
    layout?: 'horizontal' | 'vertical';
    [key: string]: any;
  }

  export class LineChart extends React.Component<LineChartProps> {}

  export interface LineProps {
    dataKey: string;
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    fill?: string;
    fillOpacity?: number;
    activeDot?: boolean | React.ReactElement | object;
    dot?: boolean | React.ReactElement | object;
    label?: boolean | React.ReactElement | object;
    points?: any[];
    connectNulls?: boolean;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    xAxisId?: string | number;
    yAxisId?: string | number;
    [key: string]: any;
  }

  export class Line extends React.Component<LineProps> {}

  // Bar Chart components
  export interface BarChartProps extends ChartProps {
    layout?: 'horizontal' | 'vertical';
    barCategoryGap?: number | string;
    barGap?: number | string;
    maxBarSize?: number;
    stackOffset?: 'expand' | 'none' | 'wiggle' | 'silhouette' | 'sign';
    [key: string]: any;
  }

  export class BarChart extends React.Component<BarChartProps> {}

  export interface BarProps {
    dataKey: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    maxBarSize?: number;
    minPointSize?: number;
    shape?: React.ReactElement | ((props: any) => React.ReactNode);
    label?: boolean | React.ReactElement | object | ((props: any) => React.ReactNode);
    background?: boolean | React.ReactElement | object;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    xAxisId?: string | number;
    yAxisId?: string | number;
    [key: string]: any;
  }

  export class Bar extends React.Component<BarProps> {}

  // Area Chart components
  export interface AreaChartProps extends ChartProps {
    layout?: 'horizontal' | 'vertical';
    stackOffset?: 'expand' | 'none' | 'wiggle' | 'silhouette' | 'sign';
    [key: string]: any;
  }

  export class AreaChart extends React.Component<AreaChartProps> {}

  export interface AreaProps {
    dataKey: string;
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    fill?: string;
    fillOpacity?: number;
    activeDot?: boolean | React.ReactElement | object;
    dot?: boolean | React.ReactElement | object;
    label?: boolean | React.ReactElement | object;
    connectNulls?: boolean;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    xAxisId?: string | number;
    yAxisId?: string | number;
    [key: string]: any;
  }

  export class Area extends React.Component<AreaProps> {}

  // Pie Chart components
  export interface PieChartProps extends ChartProps {
    startAngle?: number;
    endAngle?: number;
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    [key: string]: any;
  }

  export class PieChart extends React.Component<PieChartProps> {}

  export interface PieProps {
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    minAngle?: number;
    paddingAngle?: number;
    nameKey?: string;
    dataKey?: string;
    valueKey?: string;
    data?: any[];
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    label?: boolean | React.ReactElement | object | ((props: any) => React.ReactNode);
    labelLine?: boolean | React.ReactElement | object;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    [key: string]: any;
  }

  export class Pie extends React.Component<PieProps> {}

  export interface CellProps {
    fill?: string;
    stroke?: string;
    [key: string]: any;
  }

  export class Cell extends React.Component<CellProps> {}

  // Scatter Chart components
  export interface ScatterChartProps extends ChartProps {
    scatter?: React.ReactElement;
    [key: string]: any;
  }

  export class ScatterChart extends React.Component<ScatterChartProps> {}

  export interface ScatterProps {
    data?: any[];
    dataKey?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    line?: boolean | React.ReactElement | object;
    lineType?: 'fitting' | 'joint';
    lineJointType?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye' | React.ReactElement | ((props: any) => React.ReactNode);
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    xAxisId?: string | number;
    yAxisId?: string | number;
    zAxisId?: string | number;
    [key: string]: any;
  }

  export class Scatter extends React.Component<ScatterProps> {}

  // Radar Chart components
  export interface RadarChartProps extends ChartProps {
    cx?: number | string;
    cy?: number | string;
    startAngle?: number;
    endAngle?: number;
    innerRadius?: number | string;
    outerRadius?: number | string;
    [key: string]: any;
  }

  export class RadarChart extends React.Component<RadarChartProps> {}

  export interface RadarProps {
    dataKey: string;
    points?: any[];
    shape?: React.ReactElement | ((props: any) => React.ReactNode);
    dot?: boolean | React.ReactElement | object;
    label?: boolean | React.ReactElement | object;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    name?: string;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    [key: string]: any;
  }

  export class Radar extends React.Component<RadarProps> {}

  export interface PolarGridProps {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    polarAngles?: number[];
    polarRadius?: number[];
    gridType?: 'polygon' | 'circle';
    [key: string]: any;
  }

  export class PolarGrid extends React.Component<PolarGridProps> {}

  export interface PolarAngleAxisProps {
    dataKey?: string;
    cx?: number;
    cy?: number;
    radius?: number;
    axisLine?: boolean | object;
    axisLineType?: 'polygon' | 'circle';
    tickLine?: boolean | object;
    tick?: boolean | React.ReactElement | object;
    ticks?: any[];
    orient?: 'inner' | 'outer';
    tickFormatter?: (value: any) => string;
    [key: string]: any;
  }

  export class PolarAngleAxis extends React.Component<PolarAngleAxisProps> {}

  export interface PolarRadiusAxisProps {
    angle?: number;
    cx?: number;
    cy?: number;
    domain?: [number | string, number | string] | [number, 'auto'] | [0, number | string];
    label?: string | number | React.ReactElement | object;
    orientation?: 'left' | 'right' | 'middle';
    axisLine?: boolean | object;
    tick?: boolean | React.ReactElement | object | { fontSize?: number; fill?: string; [key: string]: any };
    tickCount?: number;
    tickFormatter?: (value: any) => string;
    [key: string]: any;
  }

  export class PolarRadiusAxis extends React.Component<PolarRadiusAxisProps> {}

  // Reference components
  export interface ReferenceLineProps {
    x?: number | string;
    y?: number | string;
    xAxisId?: string | number;
    yAxisId?: string | number;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    isFront?: boolean;
    label?: string | number | React.ReactElement | object;
    [key: string]: any;
  }

  export class ReferenceLine extends React.Component<ReferenceLineProps> {}

  export interface ReferenceAreaProps {
    x1?: number | string;
    x2?: number | string;
    y1?: number | string;
    y2?: number | string;
    xAxisId?: string | number;
    yAxisId?: string | number;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    fill?: string;
    fillOpacity?: number;
    isFront?: boolean;
    label?: string | number | React.ReactElement | object;
    [key: string]: any;
  }

  export class ReferenceArea extends React.Component<ReferenceAreaProps> {}

  export interface LabelProps {
    viewBox?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
    };
    formatter?: (value: any) => React.ReactNode;
    value?: any;
    position?: 'top' | 'left' | 'right' | 'bottom' | 'inside' | 'outside' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideTopRight' | 'insideBottomLeft' | 'insideBottomRight';
    offset?: number;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export class Label extends React.Component<LabelProps> {}

  // Brush component
  export interface BrushProps {
    dataKey?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    data?: any[];
    startIndex?: number;
    endIndex?: number;
    tickFormatter?: (value: any) => React.ReactNode;
    onChange?: (newIndex: { startIndex: number; endIndex: number }) => void;
    gap?: number;
    padding?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    [key: string]: any;
  }

  export class Brush extends React.Component<BrushProps> {}

  // Sector component
  export interface SectorProps {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    cornerRadius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    [key: string]: any;
  }

  export class Sector extends React.Component<SectorProps> {}

  // Treemap component
  export interface TreemapProps extends ChartProps {
    dataKey?: string;
    aspectRatio?: number;
    content?: React.ReactElement | ((props: any) => React.ReactNode);
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    [key: string]: any;
  }

  export class Treemap extends React.Component<TreemapProps> {}

  // ComposedChart component
  export interface ComposedChartProps extends ChartProps {
    layout?: 'horizontal' | 'vertical';
    syncId?: string;
    syncMethod?: 'index' | 'value';
    [key: string]: any;
  }

  export class ComposedChart extends React.Component<ComposedChartProps> {}
}
