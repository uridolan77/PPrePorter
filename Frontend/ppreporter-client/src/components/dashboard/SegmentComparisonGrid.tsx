import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Stack,
  SelectChangeEvent
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import {
  fetchSegmentComparisonData,
  clearComponentError
} from '../../store/slices/dashboardSlice';
import {
  SegmentComparisonGridProps,
  MetricOption,
  SegmentOption,
  ChartTypeOption,
  FocusedSegment,
  SegmentData,
  LineChartSeries,
  BarChartDataPoint
} from '../../types/segmentComparisonGrid';

/**
 * SegmentComparisonGrid component for comparing metrics across different segments
 * Uses small multiples pattern to display the same metric across different segments
 */
const SegmentComparisonGrid: React.FC<SegmentComparisonGridProps> = ({
  height = 600,
  isLoading = false,
  timeFrame = '30d'
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { segmentComparisonData, segmentComparisonLoading, segmentComparisonError } = useSelector((state: any) => state.dashboard);

  const [metrics, setMetrics] = useState<string[]>(['revenue', 'bets']);
  const [segments, setSegments] = useState<string[]>(['country', 'game_category']);
  const [chartType, setChartType] = useState<string>('line');
  const [focusedSegment, setFocusedSegment] = useState<FocusedSegment | null>(null);
  const [normalizedMode, setNormalizedMode] = useState<boolean>(false);
  const [showDataLabels, setShowDataLabels] = useState<boolean>(false);

  const availableMetrics: MetricOption[] = [
    { value: 'revenue', label: 'Revenue', format: 'currency' },
    { value: 'bets', label: 'Bet Count', format: 'number' },
    { value: 'players', label: 'Player Count', format: 'number' },
    { value: 'average_bet', label: 'Average Bet', format: 'currency' },
    { value: 'ftd', label: 'First Time Depositors', format: 'number' },
    { value: 'retention', label: 'Retention Rate', format: 'percent' }
  ];

  const availableSegments: SegmentOption[] = [
    { value: 'country', label: 'Country' },
    { value: 'game_category', label: 'Game Category' },
    { value: 'device_type', label: 'Device Type' },
    { value: 'player_segment', label: 'Player Segment' },
    { value: 'age_group', label: 'Age Group' },
    { value: 'platform', label: 'Platform' }
  ];

  const chartTypes: ChartTypeOption[] = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' }
  ];

  useEffect(() => {
    if (!segmentComparisonData ||
        segmentComparisonData.timeFrame !== timeFrame ||
        !areMetricsEqual(segmentComparisonData.metrics, metrics) ||
        !areSegmentsEqual(segmentComparisonData.segments, segments)) {

      dispatch(fetchSegmentComparisonData({
        timeFrame,
        metrics,
        segments
      }));
    }
  }, [dispatch, timeFrame, metrics, segments, segmentComparisonData]);

  // Helper function to compare arrays
  const areMetricsEqual = (arr1: string[] | undefined, arr2: string[]): boolean => {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    return arr1.every(item => arr2.includes(item));
  };

  const areSegmentsEqual = (arr1: string[] | undefined, arr2: string[]): boolean => {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
    return arr1.every(item => arr2.includes(item));
  };

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (segmentComparisonError) {
        dispatch(clearComponentError({ component: 'segmentComparison' }));
      }
    };
  }, [dispatch, segmentComparisonError]);

  const handleMetricChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    setMetrics(typeof value === 'string' ? [value] : value);
  };

  const handleSegmentChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    setSegments(typeof value === 'string' ? [value] : value);
  };

  const handleChartTypeChange = (event: SelectChangeEvent): void => {
    setChartType(event.target.value);
  };

  const toggleFocusSegment = (segment: FocusedSegment | null): void => {
    if (focusedSegment && segment &&
        focusedSegment.segment === segment.segment &&
        focusedSegment.metric === segment.metric) {
      setFocusedSegment(null);
    } else {
      setFocusedSegment(segment);
    }
  };

  // Format values based on metric type
  const formatValue = (value: number, metricId: string): string => {
    const metric = availableMetrics.find(m => m.value === metricId);

    switch (metric?.format) {
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

  // Get the data for a specific segment and metric
  const getSegmentData = (segmentType: string, metricId: string): LineChartSeries[] | BarChartDataPoint[] => {
    if (!segmentComparisonData || !segmentComparisonData.data) {
      return [];
    }

    const segmentData = segmentComparisonData.data.find(
      (item: SegmentData) => item.segmentType === segmentType && item.metricId === metricId
    );

    if (!segmentData) return [];

    // Transform the data for the chart based on chart type
    if (chartType === 'line') {
      return segmentData.values.map((segment: any) => ({
        id: segment.name,
        data: segment.data.map((point: any) => ({
          x: point.date,
          y: normalizedMode && segment.data[0].value > 0
            ? (point.value / segment.data[0].value) * 100
            : point.value
        }))
      }));
    } else { // bar chart
      // Group by date and then by segment
      const dateGroups: Record<string, BarChartDataPoint> = {};

      segmentData.values.forEach((segment: any) => {
        segment.data.forEach((point: any) => {
          if (!dateGroups[point.date]) {
            dateGroups[point.date] = {
              date: point.date
            };
          }
          dateGroups[point.date][segment.name] = normalizedMode && segment.data[0].value > 0
            ? (point.value / segment.data[0].value) * 100
            : point.value;
        });
      });

      return Object.values(dateGroups);
    }
  };

  // Get metric name for display
  const getMetricName = (metricId: string): string => {
    return availableMetrics.find(m => m.value === metricId)?.label || metricId;
  };

  // Get segment name for display
  const getSegmentName = (segmentType: string): string => {
    return availableSegments.find(s => s.value === segmentType)?.label || segmentType;
  };

  // Generate accessible description for a specific chart
  const generateAccessibleDescription = (segmentType: string, metricId: string): string => {
    if (!segmentComparisonData || !segmentComparisonData.data) {
      return "No data available";
    }

    const segmentData = segmentComparisonData.data.find(
      (item: SegmentData) => item.segmentType === segmentType && item.metricId === metricId
    );

    if (!segmentData) return "No data available";

    const metricName = getMetricName(metricId);
    const segmentName = getSegmentName(segmentType);

    // Find the highest and lowest segments
    let highestSegment = { name: '', value: -Infinity };
    let lowestSegment = { name: '', value: Infinity };

    segmentData.values.forEach((segment: any) => {
      // Get latest value for comparison
      const latestValue = segment.data[segment.data.length - 1]?.value || 0;

      if (latestValue > highestSegment.value) {
        highestSegment = { name: segment.name, value: latestValue };
      }

      if (latestValue < lowestSegment.value) {
        lowestSegment = { name: segment.name, value: latestValue };
      }
    });

    return `${metricName} by ${segmentName}. ${highestSegment.name} has the highest ${metricName} at ${formatValue(highestSegment.value, metricId)}. ${lowestSegment.name} has the lowest ${metricName} at ${formatValue(lowestSegment.value, metricId)}.`;
  };

  const renderChart = (segmentType: string, metricId: string): React.ReactNode => {
    const data = getSegmentData(segmentType, metricId);
    const metricName = getMetricName(metricId);
    const segmentName = getSegmentName(segmentType);
    const yAxisLabel = normalizedMode ? "% of Baseline" : metricName;

    if (!data || data.length === 0) {
      return (
        <Box sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </Box>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveLine
          data={data as LineChartSeries[]}
          margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Date',
            legendOffset: 36,
            legendPosition: 'middle'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: yAxisLabel,
            legendOffset: -40,
            legendPosition: 'middle',
            format: (value: number) => normalizedMode ? `${value.toFixed(0)}%` : formatValue(value, metricId).replace('£', '')
          }}
          colors={{ scheme: 'category10' }}
          pointSize={10}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          enablePointLabel={showDataLabels}
          pointLabel={(point: any) => formatValue(point.y, metricId)}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
        />
      );
    } else { // Bar chart
      return (
        <ResponsiveBar
          data={data as BarChartDataPoint[]}
          keys={segmentComparisonData?.data?.find(
            (item: SegmentData) => item.segmentType === segmentType && item.metricId === metricId
          )?.values.map((v: any) => v.name) || []}
          indexBy="date"
          margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
          padding={0.3}
          groupMode="grouped"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'category10' }}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Date',
            legendPosition: 'middle',
            legendOffset: 32
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: yAxisLabel,
            legendPosition: 'middle',
            legendOffset: -40,
            format: (value: number) => normalizedMode ? `${value.toFixed(0)}%` : formatValue(value, metricId).replace('£', '')
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          enableLabel={showDataLabels}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
        />
      );
    }
  };

  if (isLoading || segmentComparisonLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (segmentComparisonError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, p: 2 }}>
        <Typography color="error">
          Error loading segment comparison data: {segmentComparisonError}
        </Typography>
      </Box>
    );
  }

  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Segment Comparison
            <Tooltip title="Compare the same metrics across different segments using small multiples visualization">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="chart-type-label">Chart Type</InputLabel>
              <Select
                labelId="chart-type-label"
                value={chartType}
                label="Chart Type"
                onChange={handleChartTypeChange}
              >
                {chartTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Download Data">
              <IconButton>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel id="metrics-label">Metrics</InputLabel>
              <Select
                labelId="metrics-label"
                multiple
                value={metrics}
                label="Metrics"
                onChange={handleMetricChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={availableMetrics.find(m => m.value === value)?.label || value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableMetrics.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel id="segments-label">Segments</InputLabel>
              <Select
                labelId="segments-label"
                multiple
                value={segments}
                label="Segments"
                onChange={handleSegmentChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={availableSegments.find(s => s.value === value)?.label || value}
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              >
                {availableSegments.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={normalizedMode}
                  onChange={(e) => setNormalizedMode(e.target.checked)}
                  size="small"
                />
              }
              label="Normalize Values"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showDataLabels}
                  onChange={(e) => setShowDataLabels(e.target.checked)}
                  size="small"
                />
              }
              label="Show Data Labels"
            />
          </Stack>
        </Box>

        {focusedSegment ? (
          <Box sx={{ height: height - 200 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1
            }}>
              <Typography variant="subtitle1">
                {getMetricName(focusedSegment.metric)} by {getSegmentName(focusedSegment.segment)}
              </Typography>
              <IconButton onClick={() => toggleFocusSegment(null)}>
                <FullscreenExitIcon />
              </IconButton>
            </Box>

            {/* Screen reader accessible description */}
            <Box sx={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              overflow: 'hidden'
            }}
              role="region"
              aria-label={`${getMetricName(focusedSegment.metric)} by ${getSegmentName(focusedSegment.segment)}`}>
              {generateAccessibleDescription(focusedSegment.segment, focusedSegment.metric)}
            </Box>

            {renderChart(focusedSegment.segment, focusedSegment.metric)}
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ height: height - 200 }}>
            {metrics.map(metricId => (
              segments.map(segmentType => (
                <Grid item xs={12} md={6} key={`${segmentType}-${metricId}`} sx={{ height: 300 }}>
                  <Card variant="outlined" sx={{ height: '100%', position: 'relative' }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}>
                      <Typography variant="subtitle2">
                        {getMetricName(metricId)} by {getSegmentName(segmentType)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => toggleFocusSegment({ segment: segmentType, metric: metricId })}
                      >
                        <FullscreenIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Screen reader accessible description */}
                    <Box sx={{
                      position: 'absolute',
                      left: '-9999px',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden'
                    }}
                      role="region"
                      aria-label={`${getMetricName(metricId)} by ${getSegmentName(segmentType)}`}>
                      {generateAccessibleDescription(segmentType, metricId)}
                    </Box>

                    <Box sx={{ height: 'calc(100% - 49px)' }}>
                      {renderChart(segmentType, metricId)}
                    </Box>
                  </Card>
                </Grid>
              ))
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default SegmentComparisonGrid;