import React, { useState, useEffect, useMemo } from 'react';
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
  Button,
  Paper,
  Switch,
  FormControlLabel,
  Stack,
  TextField,
  InputAdornment,
  Divider,
  Tabs,
  Tab,
  Chip,
  Collapse,
  Slider,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip
} from 'recharts';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import TuneIcon from '@mui/icons-material/Tune';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { formatPercentage, formatCurrency, formatNumber } from '../../utils/formatters';
import { alpha } from '@mui/material/styles';
import { MicroSparkline } from './MicroCharts';
import { CommonProps } from '../../types/common';
import {
  Metric,
  Entity,
  MetricGroup,
  Benchmark,
  RadarDataPoint,
  HistoricalData,
  RadarChartData
} from '../../types/charts';

// Type definitions
export interface AdvancedRadarChartProps extends CommonProps {
  /**
   * Chart data
   */
  data?: RadarDataPoint[];

  /**
   * Chart title
   */
  title?: string;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Available metrics
   */
  metrics?: Metric[];

  /**
   * Available entities
   */
  entities?: Entity[];

  /**
   * Benchmark data
   */
  benchmarks?: Benchmark[];

  /**
   * Historical trend data
   */
  historicalData?: HistoricalData;

  /**
   * Metric groups for organization
   */
  metricGroups?: MetricGroup[];

  /**
   * Refresh handler
   */
  onRefresh?: () => void;

  /**
   * Export handler
   */
  onExport?: (format: string) => void;

  /**
   * Drill down handler
   */
  onDrillDown?: (entityId: string) => void;
}

interface TabOption {
  id: string;
  label: string;
  count: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

/**
 * AdvancedRadarChart component
 *
 * An enhanced radar chart with advanced features for multi-dimensional analysis of key metrics
 *
 * Features:
 * - All features of MultiDimensionalRadarChart
 * - Metric grouping for better organization
 * - Historical trend integration
 * - Benchmark/threshold visualization
 * - Enhanced interactivity and tooltips
 * - Adaptive scaling and coloring
 * - Drill-down capabilities
 * - Animated transitions
 * - Advanced accessibility features
 */
const AdvancedRadarChart: React.FC<AdvancedRadarChartProps> = ({
  data = [],
  title = 'Multi-Dimensional Analysis',
  isLoading = false,
  metrics = [],
  entities = [],
  benchmarks = [], // New prop for benchmark/threshold data
  historicalData = {}, // New prop for historical trends
  metricGroups = [], // New prop for organizing metrics into logical groups
  onRefresh = () => {},
  onExport = () => {},
  onDrillDown = () => {}, // New prop for handling drill-down interactions
  sx
}) => {
  const theme = useTheme();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<RadarChartData[]>([]);
  const [normalizeData, setNormalizeData] = useState<boolean>(true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);

  // New state variables
  const [showHistoricalTrends, setShowHistoricalTrends] = useState<boolean>(false);
  const [showBenchmarks, setShowBenchmarks] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [opacityLevel, setOpacityLevel] = useState<number>(0.2);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string | null>(benchmarks[0]?.id || null);

  // Default tab options with counts
  const tabOptions: TabOption[] = useMemo(() => [
    { id: 'all', label: 'All Metrics', count: metrics.length },
    ...metricGroups.map(group => ({
      id: group.id,
      label: group.label,
      count: metrics.filter(m => m.groupId === group.id).length
    }))
  ], [metrics, metricGroups]);

  // Initialize with default selections
  useEffect(() => {
    if (metrics.length > 0 && selectedMetrics.length === 0) {
      // Default to showing first 5 metrics or all if less than 5
      setSelectedMetrics(metrics.slice(0, Math.min(5, metrics.length)).map(m => m.id));
    }

    if (entities.length > 0 && selectedEntities.length === 0) {
      // Default to showing first 3 entities or all if less than 3
      setSelectedEntities(entities.slice(0, Math.min(3, entities.length)).map(e => e.id));
    }

    if (benchmarks.length > 0 && !selectedBenchmark) {
      setSelectedBenchmark(benchmarks[0].id);
    }
  }, [metrics, entities, benchmarks, selectedMetrics.length, selectedEntities.length, selectedBenchmark]);

  // Filter metrics based on selected group
  const filteredMetrics = useMemo(() => {
    if (selectedGroup === 'all') return metrics;
    return metrics.filter(metric => metric.groupId === selectedGroup);
  }, [metrics, selectedGroup]);

  // Process data for the chart whenever selections change
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    // Filter entities by search term
    let filteredEntities = entities;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredEntities = entities.filter(entity =>
        entity.name?.toLowerCase().includes(term) ||
        entity.category?.toLowerCase().includes(term) ||
        entity.id?.toString().toLowerCase().includes(term)
      );
    }

    // Filter data by selected entities
    const entityFilteredData = data.filter(item =>
      selectedEntities.includes(item.entityId)
    );

    // Transform data for radar chart with additional features
    const radarData: RadarChartData[] = selectedMetrics.map(metricId => {
      const metric = metrics.find(m => m.id === metricId);
      if (!metric) return null;

      const metricObj: RadarChartData = {
        subject: metric.label,
        metricId: metricId, // Add metricId to data for easier reference in tooltips
        unit: metric.unit || '',
        description: metric.description || ''
      };

      // Find min/max values for this metric (for normalization)
      const metricValues = data.map(item =>
        item.values && item.values[metricId] !== undefined ? item.values[metricId] : null
      ).filter(val => val !== null && val !== undefined) as number[];

      const minValue = Math.min(...metricValues);
      const maxValue = Math.max(...metricValues);
      const range = maxValue - minValue;

      // Add benchmark data if available and enabled
      if (showBenchmarks && selectedBenchmark) {
        const benchmark = benchmarks.find(b => b.id === selectedBenchmark);
        if (benchmark && benchmark.values && benchmark.values[metricId] !== undefined) {
          let benchmarkValue = benchmark.values[metricId];

          // Normalize if needed
          if (normalizeData && range > 0) {
            benchmarkValue = ((benchmarkValue - minValue) / range) * 100;
          }

          metricObj[`${benchmark.name} (Benchmark)`] = benchmarkValue;
        }
      }

      // Add values for each selected entity
      selectedEntities.forEach(entityId => {
        const entity = entities.find(e => e.id === entityId);
        if (!entity) return;

        const entityData = data.find(item => item.entityId === entityId);
        let value = null;

        if (entityData && entityData.values && entityData.values[metricId] !== undefined) {
          value = entityData.values[metricId];

          // Normalize if needed
          if (normalizeData && range > 0) {
            value = ((value - minValue) / range) * 100;
          }
        }

        metricObj[entity.name] = value;

        // Add historical trend data if available and enabled
        if (showHistoricalTrends && historicalData[entityId]?.[metricId]) {
          metricObj[`${entity.name}_history`] = historicalData[entityId][metricId];
        }
      });

      return metricObj;
    }).filter(Boolean) as RadarChartData[];

    setFilteredData(radarData);
  }, [
    data,
    selectedMetrics,
    selectedEntities,
    normalizeData,
    searchTerm,
    metrics,
    entities,
    showBenchmarks,
    selectedBenchmark,
    benchmarks,
    showHistoricalTrends,
    historicalData
  ]);

  // Handle metric selection change
  const handleMetricChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    setSelectedMetrics(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle entity selection change
  const handleEntityChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    setSelectedEntities(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle group change
  const handleGroupChange = (event: React.SyntheticEvent, newValue: string): void => {
    setSelectedGroup(newValue);

    // If switching to a group, select all metrics in that group
    if (newValue !== 'all') {
      const groupMetrics = metrics
        .filter(metric => metric.groupId === newValue)
        .map(metric => metric.id);

      setSelectedMetrics(groupMetrics);
    }
  };

  // Generate color for each entity with improved contrast handling
  const getEntityColor = (entityName: string, index: number): string => {
    if (highContrastMode) {
      const highContrastColors = [
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#FFFF00', // Yellow
        '#FF00FF', // Magenta
        '#00FFFF', // Cyan
        '#000000', // Black
        '#FFFFFF'  // White
      ];
      return highContrastColors[index % highContrastColors.length];
    }

    // Enhanced color palette with better visual distinction
    const colorPalettes = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.info.main,
      '#8884d8', // Purple
      '#82ca9d', // Teal
      '#ffc658', // Amber
      '#ff8042'  // Orange
    ];

    return colorPalettes[index % colorPalettes.length];
  };

  // Get benchmark color - always a distinctive color
  const getBenchmarkColor = (): string => {
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };

  // Format value for display
  const formatValue = (value: number | null | undefined, metricId: string): string => {
    if (value === null || value === undefined) return '-';

    const metric = metrics.find(m => m.id === metricId);
    if (!metric) return value.toString();

    switch (metric.format) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  // Enhanced tooltip with more context
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Find the metric for this data point
      const metricId = payload[0]?.payload?.metricId;
      const metric = metrics.find(m => m.id === metricId);

      return (
        <Paper sx={{ p: 1.5, boxShadow: 3, maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
            {metric?.description && (
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                {metric.description}
              </Typography>
            )}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {payload.map((entry, index) => {
            const isBenchmark = entry.name.includes('Benchmark');
            const isHistorical = entry.name.includes('_history');

            // Skip historical data in the main list
            if (isHistorical) return null;

            return (
              <Box key={`tooltip-item-${index}`} sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                <Box
                  component="span"
                  sx={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    backgroundColor: entry.color,
                    mr: 1,
                    borderRadius: isBenchmark ? '0%' : '50%'
                  }}
                />
                <Typography variant="body2" component="span" sx={{ mr: 1, fontWeight: isBenchmark ? 'bold' : 'normal' }}>
                  {entry.name}:
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 'auto', fontWeight: 'medium' }}>
                  {normalizeData
                    ? `${entry.value?.toFixed(1)}%`
                    : formatValue(entry.value, metricId)}
                </Typography>
              </Box>
            );
          })}

          {/* Show historical trend if available */}
          {showHistoricalTrends && payload.some(entry => entry.name.includes('_history')) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Historical Trend:
              </Typography>

              {payload.map((entry, index) => {
                if (!entry.name.includes('_history')) return null;

                const entityName = entry.name.split('_history')[0];
                const entityColor = entry.color;
                const history = entry.payload[entry.name];

                if (!history || !Array.isArray(history)) return null;

                return (
                  <Box key={`trend-${index}`} sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: entityColor }}>
                      {entityName}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <MicroSparkline
                        data={history.map((val: number, i: number) => ({ value: val, label: `${i+1}` }))}
                        width={200}
                        height={30}
                        color={entityColor}
                        showArea={true}
                        accessibilityLabel={`${entityName} trend for ${label}`}
                      />
                    </Box>
                  </Box>
                );
              })}
            </>
          )}
        </Paper>
      );
    }

    return null;
  };

  // Enhanced entity legend with more information
  const renderEntityLegend = (props: any) => {
    const { payload } = props;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
        {payload.map((entry: any, index: number) => {
          const isBenchmark = entry.value.includes('Benchmark');

          return (
            <Chip
              key={`entity-legend-${index}`}
              size="small"
              label={entry.value}
              sx={{
                m: 0.5,
                backgroundColor: alpha(entry.color, 0.1),
                color: entry.color,
                borderColor: entry.color,
                borderWidth: 1,
                borderStyle: 'solid',
                fontWeight: isBenchmark ? 'bold' : 'normal',
                '&:hover': {
                  backgroundColor: alpha(entry.color, 0.2),
                }
              }}
              onClick={() => {
                if (!isBenchmark) {
                  const entityId = entities.find(e => e.name === entry.value)?.id;
                  if (entityId) onDrillDown(entityId);
                }
              }}
            />
          );
        })}
      </Box>
    );
  };

  // Create controls toolbar with enhanced grouping
  const renderControls = () => {
    return (
      <Box sx={{ mb: 3 }}>
        {/* Metric group tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={selectedGroup}
            onChange={handleGroupChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabOptions.map(tab => (
              <Tab
                key={tab.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {tab.label}
                    <Chip
                      size="small"
                      label={tab.count}
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                value={tab.id}
              />
            ))}
          </Tabs>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
            <InputLabel id="metrics-select-label">Metrics</InputLabel>
            <Select
              labelId="metrics-select-label"
              multiple
              value={selectedMetrics}
              onChange={handleMetricChange}
              label="Metrics"
              renderValue={(selected) => `${selected.length} metrics selected`}
            >
              {filteredMetrics.map((metric) => (
                <MenuItem key={metric.id} value={metric.id}>
                  {metric.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
            <InputLabel id="entities-select-label">Entities</InputLabel>
            <Select
              labelId="entities-select-label"
              multiple
              value={selectedEntities}
              onChange={handleEntityChange}
              label="Entities"
              renderValue={(selected) => `${selected.length} entities selected`}
            >
              {entities.map((entity) => (
                <MenuItem key={entity.id} value={entity.id}>
                  {entity.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 150 }}
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 1, md: 0 } }}>
            <FormControlLabel
              control={
                <Switch
                  checked={normalizeData}
                  onChange={(e) => setNormalizeData(e.target.checked)}
                  size="small"
                />
              }
              label="Normalize"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  size="small"
                />
              }
              label="Show Labels"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showBenchmarks}
                  onChange={(e) => setShowBenchmarks(e.target.checked)}
                  size="small"
                />
              }
              label="Benchmarks"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<TuneIcon />}
              variant={advancedSettingsOpen ? "contained" : "outlined"}
              onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}
              endIcon={advancedSettingsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            >
              Advanced
            </Button>

            <IconButton onClick={onRefresh} size="small">
              <RefreshIcon />
            </IconButton>

            <IconButton onClick={() => onExport('png')} size="small">
              <FileDownloadIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={advancedSettingsOpen}>
          <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Benchmark
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedBenchmark || ''}
                    onChange={(e) => setSelectedBenchmark(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">None</MenuItem>
                    {benchmarks.map((benchmark) => (
                      <MenuItem key={benchmark.id} value={benchmark.id}>
                        {benchmark.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Historical Trends
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showHistoricalTrends}
                      onChange={(e) => setShowHistoricalTrends(e.target.checked)}
                    />
                  }
                  label="Show Trends"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Fill Opacity
                </Typography>
                <Slider
                  value={opacityLevel}
                  min={0}
                  max={0.5}
                  step={0.05}
                  onChange={(e, newValue) => setOpacityLevel(newValue as number)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value * 100}%`}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Stroke Width
                </Typography>
                <Slider
                  value={strokeWidth}
                  min={1}
                  max={5}
                  step={0.5}
                  onChange={(e, newValue) => setStrokeWidth(newValue as number)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}px`}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={highContrastMode}
                      onChange={(e) => setHighContrastMode(e.target.checked)}
                    />
                  }
                  label="High Contrast Mode (for accessibility)"
                />
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>
    );
  };

  // Main render
  return (
    <Card sx={{ ...sx }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            {title}
            <Tooltip title="Multi-dimensional analysis of key metrics across different entities">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Group by button */}
            <Tooltip title="Group metrics by category">
              <IconButton size="small" sx={{ mr: 1 }}>
                <GroupWorkIcon />
              </IconButton>
            </Tooltip>

            {/* Compare button */}
            <Tooltip title="Compare with previous period">
              <IconButton size="small">
                <CompareArrowsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Controls */}
        {renderControls()}

        {/* Loading state */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* No data state */}
        {!isLoading && (!filteredData || filteredData.length === 0) && (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="text.secondary">
              No data available. Please select different metrics or entities.
            </Typography>
          </Box>
        )}

        {/* Radar Chart */}
        {!isLoading && filteredData && filteredData.length > 0 && (
          <Box sx={{ height: 500, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={filteredData}
                margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
              >
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />

                <PolarRadiusAxis
                  angle={90}
                  domain={[0, normalizeData ? 100 : 'auto' as any]}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                  tickCount={5}
                  axisLine={{ stroke: theme.palette.divider }}
                  tickLine={{ stroke: theme.palette.divider }}
                  tickFormatter={(value: number) => normalizeData ? `${value}%` : value.toString()}
                />

                {/* Benchmark radar if enabled */}
                {showBenchmarks && selectedBenchmark && (
                  <Radar
                    name={`${benchmarks.find(b => b.id === selectedBenchmark)?.name || 'Benchmark'} (Benchmark)`}
                    dataKey={`${benchmarks.find(b => b.id === selectedBenchmark)?.name || 'Benchmark'} (Benchmark)`}
                    stroke={getBenchmarkColor()}
                    fill={getBenchmarkColor()}
                    fillOpacity={0.1}
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    isAnimationActive={true}
                  />
                )}

                {/* Entity radars */}
                {selectedEntities.map((entityId, index) => {
                  const entity = entities.find(e => e.id === entityId);
                  if (!entity) return null;

                  const color = getEntityColor(entity.name, index);

                  return (
                    <Radar
                      key={entityId}
                      name={entity.name}
                      dataKey={entity.name}
                      stroke={color}
                      fill={color}
                      fillOpacity={opacityLevel}
                      strokeWidth={strokeWidth}
                      dot={true}
                      isAnimationActive={true}
                    />
                  );
                })}

                <Legend content={renderEntityLegend} />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedRadarChart;