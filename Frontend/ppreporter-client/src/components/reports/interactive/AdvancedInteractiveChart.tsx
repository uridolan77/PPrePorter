import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
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
  Divider
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
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

// Chart types
export type AdvancedChartType =
  'area' | 'bar' | 'line' | 'pie' | 'scatter' |
  'timeSeries' | 'zoomableTimeSeries' | 'lassoScatter';

// Advanced interactive chart props
interface AdvancedInteractiveChartProps {
  id: string;
  title: string;
  description?: string;
  type: AdvancedChartType;
  data: any[];
  xKey: string;
  yKeys?: string[];
  nameKey?: string;
  valueKey?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  enableDrilldown?: boolean;
  enableTooltip?: boolean;
  enableCrossFiltering?: boolean;
  enableZoom?: boolean;
  enableLassoSelection?: boolean;
  enableAnnotations?: boolean;
  enableExport?: boolean;
  enableFullscreen?: boolean;
  tooltipFormatter?: (value: any, name: string, props: any) => string;
  getTooltipData?: (payload: any[], label: string) => TooltipData;
  getDrilldownData?: (data: any, index: number) => DrilldownData;
  onExport?: (format: 'csv' | 'excel' | 'pdf', data: any[]) => void;
  onShare?: (chartId: string) => void;
  onClick?: (data: any, index: number) => void;
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

  // Render chart based on type
  const renderChart = () => {
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
    const isTimeSeries = type === 'timeSeries' || type === 'zoomableTimeSeries';

    // Scatter chart types
    const isScatter = type === 'scatter' || type === 'lassoScatter';

    if (isTimeSeries) {
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
    } else if (isScatter) {
      return (
        <LassoSelectionScatterChart
          {...commonProps}
          yKey={yKeys[0] || 'y'}
          zKey={yKeys.length > 1 ? yKeys[1] : undefined}
          nameKey={nameKey}
          height={height}
          enableLassoSelection={enableLassoSelection}
          enableCrossFiltering={enableCrossFiltering}
          onClick={handleDrillDown}
        />
      );
    } else {
      return (
        <InteractiveChart
          {...commonProps}
          type={type as any}
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
    }
  };

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1">{title}</Typography>
          {description && (
            <MuiTooltip title={description}>
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
        </Box>

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
      </Box>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <Box sx={{ px: 2, py: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
        </Box>
      )}

      {/* Chart */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {renderChart()}
        {getAnnotationMarkers()}
      </Box>

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
