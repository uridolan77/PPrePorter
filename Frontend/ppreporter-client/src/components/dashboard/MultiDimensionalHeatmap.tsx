import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Tooltip,
  Slider,
  FormControlLabel,
  Switch,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  SelectChangeEvent,
  Box as MuiBox
} from '@mui/material';
import SimpleBox from '../common/SimpleBox';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { scaleSequential } from 'd3-scale';
import { interpolateRdYlGn, interpolateRdBu, interpolateYlOrRd, interpolateYlGnBu } from 'd3-scale-chromatic';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchHeatmapData,
  clearComponentError
} from '../../store/slices/dashboardSlice';
import {
  MultiDimensionalHeatmapProps,
  DimensionOption,
  MetricOption,
  ColorSchemeOption,
  HeatmapData
} from '../../types/multiDimensionalHeatmap';

/**
 * MultiDimensionalHeatmap component for visualizing patterns across multiple variables
 * Shows relationships between two dimensions with color intensity representing the metric value
 */
const MultiDimensionalHeatmap: React.FC<MultiDimensionalHeatmapProps> = ({
  height = 500,
  isLoading = false,
  timeFrame = '30d'
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { heatmapData, heatmapLoading, heatmapError } = useSelector((state: any) => state.dashboard);

  const [primaryDimension, setPrimaryDimension] = useState<string>('day_of_week');
  const [secondaryDimension, setSecondaryDimension] = useState<string>('game_category');
  const [metric, setMetric] = useState<string>('revenue');
  const [colorScheme, setColorScheme] = useState<string>('greenToRed');
  const [invertScale, setInvertScale] = useState<boolean>(false);
  const [cellSize, setCellSize] = useState<number>(40);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [legendFormat, setLegendFormat] = useState<'currency' | 'number' | 'percent'>('currency');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);

  const dimensions: DimensionOption[] = [
    { value: 'day_of_week', label: 'Day of Week' },
    { value: 'hour_of_day', label: 'Hour of Day' },
    { value: 'game_category', label: 'Game Category' },
    { value: 'provider', label: 'Provider' },
    { value: 'country', label: 'Country' },
    { value: 'device_type', label: 'Device Type' },
    { value: 'age_group', label: 'Age Group' },
    { value: 'player_segment', label: 'Player Segment' }
  ];

  const metrics: MetricOption[] = [
    { value: 'revenue', label: 'Revenue', format: 'currency' },
    { value: 'user_count', label: 'Player Count', format: 'number' },
    { value: 'bet_count', label: 'Bet Count', format: 'number' },
    { value: 'average_bet', label: 'Average Bet', format: 'currency' },
    { value: 'conversion_rate', label: 'Conversion Rate', format: 'percent' },
    { value: 'rtp', label: 'Return To Player', format: 'percent' }
  ];

  const colorSchemes: ColorSchemeOption[] = [
    { value: 'greenToRed', label: 'Green to Red', scale: interpolateRdYlGn, invert: true },
    { value: 'blueToRed', label: 'Blue to Red', scale: interpolateRdBu, invert: true },
    { value: 'yellowToRed', label: 'Yellow to Red', scale: interpolateYlOrRd, invert: false },
    { value: 'yellowToBlue', label: 'Yellow to Blue', scale: interpolateYlGnBu, invert: false }
  ];

  const getInterpolator = (): ((t: number) => string) => {
    const scheme = colorSchemes.find(scheme => scheme.value === colorScheme);
    return scheme ? scheme.scale : interpolateRdYlGn;
  };

  useEffect(() => {
    if (!heatmapData ||
        heatmapData.primaryDimension !== primaryDimension ||
        heatmapData.secondaryDimension !== secondaryDimension ||
        heatmapData.metric !== metric ||
        heatmapData.timeFrame !== timeFrame) {

      // Use type assertion to fix dispatch type error
      dispatch(fetchHeatmapData({
        timeFrame,
        primaryDimension,
        secondaryDimension,
        metric
      }) as any);
    }
  }, [dispatch, primaryDimension, secondaryDimension, metric, timeFrame, heatmapData]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (heatmapError) {
        dispatch(clearComponentError({ component: 'heatmap' }));
      }
    };
  }, [dispatch, heatmapError]);

  const handlePrimaryDimensionChange = (event: SelectChangeEvent<string>): void => {
    const newDimension = event.target.value;
    if (newDimension === secondaryDimension) {
      setSecondaryDimension(primaryDimension);
    }
    setPrimaryDimension(newDimension);
  };

  const handleSecondaryDimensionChange = (event: SelectChangeEvent<string>): void => {
    const newDimension = event.target.value;
    if (newDimension === primaryDimension) {
      setPrimaryDimension(secondaryDimension);
    }
    setSecondaryDimension(newDimension);
  };

  const handleMetricChange = (event: SelectChangeEvent<string>): void => {
    const newMetric = event.target.value;
    setMetric(newMetric);

    // Also update legend format based on metric type
    const metricConfig = metrics.find(m => m.value === newMetric);
    if (metricConfig) {
      setLegendFormat(metricConfig.format);
    }
  };

  const handleColorSchemeChange = (event: React.MouseEvent<HTMLElement>, newScheme: string): void => {
    if (newScheme !== null) {
      setColorScheme(newScheme);
    }
  };

  const handleZoomIn = (): void => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
    setCellSize(prev => Math.min(prev + 5, 60));
  };

  const handleZoomOut = (): void => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
    setCellSize(prev => Math.max(prev - 5, 30));
  };

  // Format values based on selected format
  const formatValue = (value: number): string => {
    switch (legendFormat) {
      case 'currency':
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  // Generate accessible data table for screen readers
  const generateAccessibleTable = (): React.ReactNode => {
    if (!heatmapData || !heatmapData.data) return null;

    return (
      <table style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}>
        <caption>
          Heatmap of {metrics.find(m => m.value === metric)?.label || metric} by
          {dimensions.find(d => d.value === primaryDimension)?.label || primaryDimension} and
          {dimensions.find(d => d.value === secondaryDimension)?.label || secondaryDimension}
        </caption>
        <thead>
          <tr>
            <th scope="col">{dimensions.find(d => d.value === primaryDimension)?.label || primaryDimension} / {dimensions.find(d => d.value === secondaryDimension)?.label || secondaryDimension}</th>
            {heatmapData.data[0].data.map((cell: { x: string }) => (
              <th scope="col" key={cell.x}>{cell.x}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heatmapData.data.map((row: { id: string; data: Array<{ x: string; y: number }> }) => (
            <tr key={row.id}>
              <th scope="row">{row.id}</th>
              {row.data.map((cell: { x: string; y: number }) => (
                <td key={cell.x}>{formatValue(cell.y)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (isLoading || heatmapLoading) {
    return (
      <SimpleBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </SimpleBox>
    );
  }

  if (heatmapError) {
    return (
      <SimpleBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, p: 2 }}>
        <Typography color="error">
          Error loading heatmap data: {heatmapError}
        </Typography>
      </SimpleBox>
    );
  }

  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Multi-Dimensional Heatmap
            <Tooltip title="Visualizes patterns and correlations across two dimensions with color intensity representing the metric value">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <SimpleBox sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Data">
              <IconButton>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </SimpleBox>
        </SimpleBox>

        <SimpleBox sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="primary-dimension-label">Primary Dimension</InputLabel>
              <Select
                labelId="primary-dimension-label"
                value={primaryDimension}
                label="Primary Dimension"
                onChange={handlePrimaryDimensionChange}
              >
                {dimensions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="secondary-dimension-label">Secondary Dimension</InputLabel>
              <Select
                labelId="secondary-dimension-label"
                value={secondaryDimension}
                label="Secondary Dimension"
                onChange={handleSecondaryDimensionChange}
              >
                {dimensions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="metric-label">Metric</InputLabel>
              <Select
                labelId="metric-label"
                value={metric}
                label="Metric"
                onChange={handleMetricChange}
              >
                {metrics.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </SimpleBox>

        <SimpleBox sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2">Color Scheme:</Typography>
            <ToggleButtonGroup
              value={colorScheme}
              exclusive
              onChange={handleColorSchemeChange}
              size="small"
              aria-label="color scheme"
            >
              {colorSchemes.map(scheme => (
                <ToggleButton key={scheme.value} value={scheme.value} aria-label={scheme.label}>
                  {scheme.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <FormControlLabel
              control={
                <Switch
                  checked={invertScale}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInvertScale(e.target.checked)}
                  size="small"
                />
              }
              label="Invert Colors"
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={showLabels}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowLabels(e.target.checked)}
                  size="small"
                />
              }
              label="Show Cell Labels"
            />

            <SimpleBox sx={{ display: 'flex', alignItems: 'center', width: 200 }}>
              <Typography variant="body2" sx={{ mr: 1, whiteSpace: 'nowrap' }}>
                Cell Size:
              </Typography>
              <Slider
                value={cellSize}
                min={30}
                max={60}
                step={5}
                onChange={(_, value) => setCellSize(value as number)}
                size="small"
                aria-label="Cell size"
              />
            </SimpleBox>
          </Stack>
        </SimpleBox>

        {/* Screen reader accessible data table */}
        {generateAccessibleTable()}

        <SimpleBox
          ref={containerRef}
          sx={{
            height: height - 200,
            width: '100%',
            overflow: 'auto',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease-out'
          }}
        >
          {heatmapData && heatmapData.data && heatmapData.data.length > 0 ? (
            <ResponsiveHeatMap
              data={heatmapData.data}
              margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
              valueFormat={formatValue}
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: dimensions.find(d => d.value === secondaryDimension)?.label || secondaryDimension,
                legendOffset: 46
              }}
              axisRight={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: metrics.find(m => m.value === metric)?.label || metric,
                legendPosition: 'middle',
                legendOffset: 70
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: dimensions.find(d => d.value === primaryDimension)?.label || primaryDimension,
                legendPosition: 'middle',
                legendOffset: -72
              }}
              colors={{
                type: 'sequential',
                scheme: invertScale ?
                    colorScheme === 'greenToRed' ? 'reds' :
                    colorScheme === 'blueToRed' ? 'blues' :
                    colorScheme === 'yellowToRed' ? 'yellowOrangeRed' :
                    'YlGnBu'
                  :
                    colorScheme === 'greenToRed' ? 'greens' :
                    colorScheme === 'blueToRed' ? 'blues' :
                    colorScheme === 'yellowToRed' ? 'YlOrRd' :
                    'YlGnBu',
                minValue: heatmapData.minValue || 'auto',
                maxValue: heatmapData.maxValue || 'auto'
              }}
              emptyColor="#555555"
              cellOpacity={1}
              cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
              labelTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
              hoverTarget="cell"
              cellHoverOthersOpacity={0.25}
              cellSize={cellSize}
              cellShape="rect"
              animate={true}
              motionConfig="gentle"
              enableLabels={showLabels}
              legends={[
                {
                  anchor: 'bottom',
                  translateX: 0,
                  translateY: 30,
                  length: 400,
                  thickness: 8,
                  direction: 'row',
                  tickPosition: 'after',
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  tickFormat: formatValue,
                  title: metrics.find(m => m.value === metric)?.label || metric,
                  titleAlign: 'start',
                  titleOffset: 4
                }
              ]}
            />
          ) : (
            <SimpleBox sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="body1" color="text.secondary">
                No heatmap data available for the selected dimensions and metric
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try changing the dimensions or metric
              </Typography>
            </SimpleBox>
          )}
        </SimpleBox>
      </CardContent>
    </Card>
  );
};

export default MultiDimensionalHeatmap;