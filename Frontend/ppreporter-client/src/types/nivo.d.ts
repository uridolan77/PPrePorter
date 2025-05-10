/**
 * Type declarations for @nivo/heatmap
 */
declare module '@nivo/heatmap' {
  import * as React from 'react';

  export interface HeatMapDatum {
    id: string;
    [key: string]: any;
  }

  export interface HeatMapProps {
    data: HeatMapDatum[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    colors?: any;
    emptyColor?: string;
    cellOpacity?: number;
    cellBorderColor?: any;
    borderColor?: any;
    axisTop?: any;
    axisRight?: any;
    axisBottom?: any;
    axisLeft?: any;
    enableLabels?: boolean;
    labelTextColor?: any;
    hoverTarget?: 'cell' | 'row' | 'column' | 'rowColumn';
    cellHoverOthersOpacity?: number;
    cellShape?: 'rect' | 'circle' | React.ComponentType<any>;
    cellSize?: number;
    animate?: boolean;
    motionConfig?: string;
    valueFormat?: string | ((value: number) => string);
    xOuterPadding?: number;
    yOuterPadding?: number;
    cellHoverOpacity?: number;
    cellBorderWidth?: number;
    annotations?: any[];
    onClick?: (cell: any) => void;
    legends?: Array<{
      anchor: 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | 'top-left';
      translateX: number;
      translateY: number;
      length: number;
      thickness: number;
      direction: 'row' | 'column';
      tickPosition: 'before' | 'after';
      tickSize: number;
      tickSpacing: number;
      tickOverlap: boolean;
      tickFormat?: string | ((value: number) => string);
      title?: string;
      titleAlign?: 'start' | 'middle' | 'end';
      titleOffset?: number;
    }>;
  }

  export const ResponsiveHeatMap: React.FC<HeatMapProps>;
}

/**
 * Type declarations for d3-scale-chromatic
 */
declare module 'd3-scale-chromatic' {
  export function interpolateRdYlGn(t: number): string;
  export function interpolateRdBu(t: number): string;
  export function interpolateYlOrRd(t: number): string;
  export function interpolateYlGnBu(t: number): string;
}

/**
 * Type declarations for @nivo/sankey
 */
declare module '@nivo/sankey' {
  import * as React from 'react';

  export interface SankeyNode {
    id: string;
    [key: string]: any;
  }

  export interface SankeyLink {
    source: string;
    target: string;
    value: number;
    [key: string]: any;
  }

  export interface SankeyData {
    nodes: SankeyNode[];
    links: SankeyLink[];
  }

  export interface SankeyProps {
    data: SankeyData;
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    align?: 'justify' | 'start' | 'end' | 'center';
    colors?: any;
    nodeOpacity?: number;
    nodeThickness?: number;
    nodeInnerPadding?: number;
    nodeSpacing?: number;
    nodeBorderWidth?: number;
    nodeBorderColor?: any;
    linkOpacity?: number;
    linkHoverOpacity?: number;
    linkContract?: number;
    enableLinkGradient?: boolean;
    enableLabels?: boolean;
    labelPosition?: 'inside' | 'outside';
    labelPadding?: number;
    labelOrientation?: 'horizontal' | 'vertical';
    labelTextColor?: any;
    animate?: boolean;
    motionConfig?: string;
    isInteractive?: boolean;
    tooltip?: any;
    onClick?: (data: any) => void;
    [key: string]: any;
  }

  export const ResponsiveSankey: React.FC<SankeyProps>;
}

/**
 * Type declarations for @nivo/bar
 */
declare module '@nivo/bar' {
  import * as React from 'react';

  export interface BarDatum {
    [key: string]: any;
  }

  export interface BarProps {
    data: BarDatum[];
    keys: string[];
    indexBy: string;
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    padding?: number;
    innerPadding?: number;
    colors?: any;
    colorBy?: string | Function;
    borderColor?: any;
    axisTop?: any;
    axisRight?: any;
    axisBottom?: any;
    axisLeft?: any;
    enableGridX?: boolean;
    enableGridY?: boolean;
    enableLabel?: boolean;
    labelSkipWidth?: number;
    labelSkipHeight?: number;
    labelTextColor?: any;
    animate?: boolean;
    motionStiffness?: number;
    motionDamping?: number;
    isInteractive?: boolean;
    tooltipFormat?: any;
    legends?: any[];
    onClick?: (data: any) => void;
    [key: string]: any;
  }

  export const ResponsiveBar: React.FC<BarProps>;
}

/**
 * Type declarations for @nivo/line
 */
declare module '@nivo/line' {
  import * as React from 'react';

  export interface LineDatum {
    x: string | number;
    y: number;
  }

  export interface LineSerieData {
    id: string;
    data: LineDatum[];
    [key: string]: any;
  }

  export interface LineProps {
    data: LineSerieData[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    xScale?: any;
    yScale?: any;
    curve?: string;
    axisTop?: any;
    axisRight?: any;
    axisBottom?: any;
    axisLeft?: any;
    enableGridX?: boolean;
    enableGridY?: boolean;
    enableDots?: boolean;
    dotSize?: number;
    dotColor?: any;
    dotBorderWidth?: number;
    dotBorderColor?: any;
    enableArea?: boolean;
    areaOpacity?: number;
    areaBaselineValue?: number;
    markers?: any[];
    legends?: any[];
    isInteractive?: boolean;
    tooltipFormat?: any;
    [key: string]: any;
  }

  export const ResponsiveLine: React.FC<LineProps>;
}

/**
 * Type declarations for @nivo/pie
 */
declare module '@nivo/pie' {
  import * as React from 'react';

  export interface PieDatum {
    id: string | number;
    value: number;
    [key: string]: any;
  }

  export interface PieProps {
    data: PieDatum[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    innerRadius?: number;
    padAngle?: number;
    cornerRadius?: number;
    colors?: any;
    colorBy?: string | Function;
    borderWidth?: number;
    borderColor?: any;
    enableRadialLabels?: boolean;
    radialLabelsSkipAngle?: number;
    radialLabelsTextXOffset?: number;
    radialLabelsTextColor?: any;
    radialLabelsLinkOffset?: number;
    radialLabelsLinkDiagonalLength?: number;
    radialLabelsLinkHorizontalLength?: number;
    radialLabelsLinkStrokeWidth?: number;
    radialLabelsLinkColor?: any;
    enableSlicesLabels?: boolean;
    slicesLabelsSkipAngle?: number;
    slicesLabelsTextColor?: any;
    animate?: boolean;
    motionStiffness?: number;
    motionDamping?: number;
    isInteractive?: boolean;
    tooltipFormat?: any;
    legends?: any[];
    [key: string]: any;
  }

  export const ResponsivePie: React.FC<PieProps>;
}

/**
 * Type declarations for @nivo/scatterplot
 */
declare module '@nivo/scatterplot' {
  import * as React from 'react';

  export interface ScatterPlotDatum {
    x: number;
    y: number;
    [key: string]: any;
  }

  export interface ScatterPlotSerieData {
    id: string;
    data: ScatterPlotDatum[];
    [key: string]: any;
  }

  export interface ScatterPlotProps {
    data: ScatterPlotSerieData[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    xScale?: any;
    yScale?: any;
    colors?: any;
    colorBy?: string | Function;
    symbolSize?: number;
    axisTop?: any;
    axisRight?: any;
    axisBottom?: any;
    axisLeft?: any;
    enableGridX?: boolean;
    enableGridY?: boolean;
    isInteractive?: boolean;
    tooltipFormat?: any;
    legends?: any[];
    [key: string]: any;
  }

  export const ResponsiveScatterPlot: React.FC<ScatterPlotProps>;
}

/**
 * Type declarations for react-syntax-highlighter
 */
declare module 'react-syntax-highlighter' {
  import * as React from 'react';

  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children: string;
    className?: string;
    [key: string]: any;
  }

  const SyntaxHighlighter: React.FC<SyntaxHighlighterProps>;
  export default SyntaxHighlighter;
}

/**
 * Type declarations for react-syntax-highlighter/dist/esm/styles/hljs
 */
declare module 'react-syntax-highlighter/dist/esm/styles/hljs' {
  const docco: any;
  export { docco };
}
