import React, { useState, useCallback, useMemo } from 'react';
import {
  Typography,
  Paper,
  IconButton,
  Tooltip as MuiTooltip,
  Chip,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  styled
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import InteractiveChart from './InteractiveChart';
import ZoomableTimeSeriesChart from './ZoomableTimeSeriesChart';
import LassoSelectionScatterChart from './LassoSelectionScatterChart';
import { AnnotationMarker, useAnnotationContext } from './AnnotationSystem';
import DrilldownModal, { DrilldownData } from './DrilldownModal';
import { useFilterContext, Filter } from './FilterContext';
import { TooltipData } from './EnhancedTooltip';

// Styled components to avoid TypeScript Box sx prop issues
const HeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: '1px solid',
  borderColor: theme.palette.divider
}));

const TitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center'
});

const ActionsContainer = styled('div')({
  display: 'flex',
  gap: 4
});

const FiltersContainer = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1)
}));

const ChartContainer = styled('div')({
  flex: 1,
  position: 'relative'
});

// Chart types
export type AdvancedChartType =
  'area' | 'bar' | 'line' | 'pie' | 'scatter' |
  'timeSeries' | 'zoomableTimeSeries' | 'lassoScatter';

/**
 * Data point interface for chart data
 */
interface ChartDataPoint {
  [key: string]: any;
}

/**
 * Export format type
 */
type ExportFormat = 'csv' | 'excel' | 'pdf';

/**
 * Advanced interactive chart props
 */
interface AdvancedInteractiveChartProps {
  /** Unique identifier for the chart */
  id: string;
  /** Chart title */
  title: string;
  /** Optional chart description */
  description?: string;
  /** Chart type */
  type: AdvancedChartType;
  /** Chart data array */
  data: ChartDataPoint[];
  /** Key for X-axis values */
  xKey: string;
  /** Keys for Y-axis values */
  yKeys?: string[];
  /** Key for name/label values */
  nameKey?: string;
  /** Key for value data */
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
  /** Whether to enable zoom functionality */
  enableZoom?: boolean;
  /** Whether to enable lasso selection */
  enableLassoSelection?: boolean;
  /** Whether to enable annotations */
  enableAnnotations?: boolean;
  /** Whether to enable export functionality */
  enableExport?: boolean;
  /** Whether to enable fullscreen mode */
  enableFullscreen?: boolean;
  /** Custom tooltip formatter function */
  tooltipFormatter?: (value: any, name: string, props: any) => string;
  /** Function to get tooltip data */
  getTooltipData?: (payload: any[], label: string) => TooltipData;
  /** Function to get drill-down data */
  getDrilldownData?: (data: ChartDataPoint, index: number) => DrilldownData;
  /** Function to handle export */
  onExport?: (format: ExportFormat, data: ChartDataPoint[]) => void;
  /** Function to handle sharing */
  onShare?: (chartId: string) => void;
  /** Function to handle click events */
  onClick?: (data: ChartDataPoint, index: number) => void;
}

/**
 * AdvancedInteractiveChart component
 * A chart component with advanced interactive features
 */
const AdvancedInteractiveChart: React.FC<AdvancedInteractiveChartProps> = ({
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
  enableZoom = true,
  enableLassoSelection = true,
  enableAnnotations = true,
  enableExport = true,
  enableFullscreen = true,
  tooltipFormatter,
  getTooltipData,
  getDrilldownData,
  onExport,
  onShare,
  onClick
}) => {
  const theme = useTheme();
  const { filters, addFilter, removeFilter, getFiltersForSource } = useFilterContext();
  const { getAnnotationsForChart } = useAnnotationContext();

  // State for active elements
  const [drilldownOpen, setDrilldownOpen] = useState<boolean>(false);
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Get active filters for this chart
  const activeFilters = useMemo(() => {
    return getFiltersForSource(id);
  }, [getFiltersForSource, id]);

  // Get annotations for this chart
  const annotations = useMemo(() => {
    return getAnnotationsForChart(id);
  }, [getAnnotationsForChart, id]);

  // Handle chart element click for drill-down
  const handleDrillDown = useCallback((data: any, index: number) => {
    // If custom onClick handler is provided, call it
    if (onClick) {
      onClick(data, index);
      return;
    }

    if (!enableDrilldown) return;

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
        detailData = data.metadata?.detailData || [];
      } else if (type === 'scatter' || type === 'lassoScatter') {
        drilldownTitle = `${title} - Point Details`;
        category = data[nameKey] || `${data[xKey]}, ${data[yKeys?.[0] || 'y']}`;
        value = data[valueKey] || data[yKeys?.[0]];

        // Use the point data as detail
        detailData = [data];
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
        detailData = data.metadata?.detailData || [];
      }

      drillData = {
        title: drilldownTitle,
        description: description,
        category,
        value,
        data: detailData.length > 0 ? detailData : [data]
      };
    }

    setDrilldownData(drillData);
    setDrilldownOpen(true);
  }, [
    enableDrilldown, getDrilldownData, type, title, description,
    nameKey, valueKey, xKey, yKeys, onClick
  ]);

  // Remove filter handler
  const handleRemoveFilter = (filterId: string) => {
    removeFilter(filterId);
  };

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (onExport) {
      onExport(format, data);
    } else {
      console.log(`Exporting chart in ${format} format`);
      // Default export implementation would go here
    }
    handleMenuClose();
  };

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare(id);
    } else {
      console.log(`Sharing chart with ID: ${id}`);
      // Default share implementation would go here
    }
    handleMenuClose();
  };

  // Get annotation markers
  const getAnnotationMarkers = () => {
    if (!enableAnnotations || annotations.length === 0) return null;

    return annotations.map(annotation => {
      // Skip annotations without position
      if (!annotation.position) return null;

      return (
        <AnnotationMarker
          key={annotation.id}
          chartId={id}
          dataPointId={annotation.dataPointId}
          dataPointLabel={annotation.metadata?.label || `Data point ${annotation.dataPointId}`}
          position={annotation.position}
        />
      );
    });
  };

  /**
   * Render chart based on type
   * Memoized to prevent unnecessary re-renders
   */
  const renderChart = useMemo(() => {
    // Common props for all chart types
    const commonProps = {
      id,
      title,
      description,
      data,
      xKey,
      loading,
      error,
      colors,
      showLegend,
      showGrid,
      tooltipFormatter,
      getTooltipData
    };

    // Time series chart types
    if (type === 'timeSeries' || type === 'zoomableTimeSeries') {
      return (
        <ZoomableTimeSeriesChart
          {...commonProps}
          type={type === 'timeSeries' ? 'line' : 'area'}
          yKeys={yKeys}
          height={height}
          enableBrush={enableZoom}
          enableZoom={enableZoom}
          onClick={handleDrillDown}
        />
      );
    }

    // Scatter chart types
    if (type === 'scatter' || type === 'lassoScatter') {
      return (
        <LassoSelectionScatterChart
          {...commonProps}
          yKey={yKeys?.[0] || 'y'}
          zKey={yKeys && yKeys.length > 1 ? yKeys[1] : undefined}
          nameKey={nameKey}
          height={height}
          enableLassoSelection={enableLassoSelection}
          enableCrossFiltering={enableCrossFiltering}
          onClick={handleDrillDown}
        />
      );
    }

    // Default chart types (bar, line, area, pie)
    return (
      <InteractiveChart
        {...commonProps}
        type={type}
        yKeys={yKeys}
        nameKey={nameKey}
        valueKey={valueKey}
        height={height}
        enableDrilldown={enableDrilldown}
        enableTooltip={enableTooltip}
        enableCrossFiltering={enableCrossFiltering}
        onClick={handleDrillDown}
      />
    );
  }, [
    id, title, description, data, xKey, loading, error, colors, showLegend, showGrid,
    tooltipFormatter, getTooltipData, type, yKeys, height, enableZoom, enableLassoSelection,
    enableCrossFiltering, nameKey, valueKey, enableDrilldown, enableTooltip, handleDrillDown
  ]);

  return (
    <Paper
      sx={{
        height: isFullscreen ? '100vh' : height,
        width: isFullscreen ? '100vw' : '100%',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1300 : 'auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      elevation={isFullscreen ? 24 : 1}
    >
      {/* Header */}
      <HeaderContainer>
        <TitleContainer>
          <Typography variant="subtitle1">{title}</Typography>
          {description && (
            <MuiTooltip title={description}>
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
        </TitleContainer>
        <ActionsContainer>
          {enableFullscreen && (
            <MuiTooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton size="small" onClick={handleToggleFullscreen}>
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
          {(enableExport || enableAnnotations) && (
            <MuiTooltip title="More Options">
              <IconButton size="small" onClick={handleMenuOpen}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
        </ActionsContainer>

        {/* Options Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          {enableExport && (
            <>
              <MenuItem onClick={() => handleExport('csv')}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as CSV</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleExport('excel')}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as Excel</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export as PDF</ListItemText>
              </MenuItem>
              <Divider />
            </>
          )}
          {enableAnnotations && (
            <MenuItem onClick={() => console.log('View all annotations')}>
              <ListItemIcon>
                <CommentIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                View All Annotations ({annotations.length})
              </ListItemText>
            </MenuItem>
          )}
          {onShare && (
            <MenuItem onClick={handleShare}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share Chart</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </HeaderContainer>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <FiltersContainer>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.id}
              label={`${filter.field}: ${
                Array.isArray(filter.value)
                  ? `${filter.value.length} selected`
                  : filter.value
              }`}
              size="small"
              onDelete={() => handleRemoveFilter(filter.id)}
              deleteIcon={<HighlightOffIcon />}
            />
          ))}
        </FiltersContainer>
      )}

      {/* Chart */}
      <ChartContainer>
        {renderChart}
        {getAnnotationMarkers()}
      </ChartContainer>

      {/* Drilldown Modal */}
      <DrilldownModal
        open={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        drilldownData={drilldownData}
      />
    </Paper>
  );
};

export default AdvancedInteractiveChart;
