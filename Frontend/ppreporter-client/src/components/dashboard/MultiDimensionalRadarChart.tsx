import React, { useState, useEffect, ChangeEvent } from 'react';
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
  Button,
  Paper,
  Switch,
  FormControlLabel,
  Stack,
  TextField,
  InputAdornment,
  SelectChangeEvent,
  Box as MuiBox
} from '@mui/material';
import SimpleBox from '../common/SimpleBox';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { formatPercentage, formatCurrency, formatNumber } from '../../utils/formatters';
import {
  MultiDimensionalRadarChartProps,
  Metric,
  Entity,
  DataItem,
  RadarDataPoint,
  LegendProps
} from '../../types/multiDimensionalRadarChart';

/**
 * MultiDimensionalRadarChart component
 *
 * Visualizes multi-dimensional data in a radar/spider chart format
 * Great for comparing entities across multiple dimensions simultaneously
 *
 * Features:
 * - Multiple entity comparison
 * - Custom metric selection
 * - Interactive tooltips with context
 * - Responsive design
 * - Accessibility support
 * - High-contrast mode
 */
const MultiDimensionalRadarChart: React.FC<MultiDimensionalRadarChartProps> = ({
  data = [],
  title = 'Multi-Dimensional Analysis',
  isLoading = false,
  metrics = [],
  entities = [],
  onRefresh = () => {},
  onExport = () => {}
}) => {
  const theme = useTheme();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<RadarDataPoint[]>([]);
  const [normalizeData, setNormalizeData] = useState<boolean>(true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);

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
  }, [metrics, entities, selectedMetrics.length, selectedEntities.length]);

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

    // Transform data for radar chart
    // For a radar chart, we need data in the format:
    // [{ subject: 'Metric A', Entity1: 20, Entity2: 30, ... }, ...]
    const radarData = selectedMetrics.map(metricId => {
      const metric = metrics.find(m => m.id === metricId);
      if (!metric) return null;

      const metricObj: RadarDataPoint = {
        subject: metric.label
      };

      // Find min/max values for this metric (for normalization)
      const metricValues = data.map(item =>
        item.values && item.values[metricId] !== undefined ? item.values[metricId] : null
      ).filter(val => val !== null && val !== undefined) as number[];

      const minValue = Math.min(...metricValues);
      const maxValue = Math.max(...metricValues);
      const range = maxValue - minValue;

      // Add values for each selected entity
      selectedEntities.forEach(entityId => {
        const entity = entities.find(e => e.id === entityId);
        if (!entity) return;

        const entityData = data.find(item => item.entityId === entityId);
        let value: number | null = null;

        if (entityData && entityData.values && entityData.values[metricId] !== undefined) {
          value = entityData.values[metricId];

          // Normalize if needed
          if (normalizeData && range > 0) {
            value = ((value - minValue) / range) * 100;
          }
        }

        metricObj[entity.name] = value;
      });

      return metricObj;
    }).filter(Boolean) as RadarDataPoint[];

    setFilteredData(radarData);
  }, [data, selectedMetrics, selectedEntities, normalizeData, searchTerm, metrics, entities]);

  // Handle metric selection change
  const handleMetricChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    setSelectedMetrics(typeof value === 'string' ? [value] : value);
  };

  // Handle entity selection change
  const handleEntityChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    setSelectedEntities(typeof value === 'string' ? [value] : value);
  };

  // Generate color for each entity
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

    const colorPalettes = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.primary.light,
      theme.palette.secondary.light,
      theme.palette.primary.dark,
      theme.palette.secondary.dark,
    ];

    return colorPalettes[index % colorPalettes.length];
  };

  // Format value for display
  const formatValue = (value: number, metricId: string): string => {
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

  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string, props: any): [string, string] => {
    const metricId = selectedMetrics.find(m => {
      const metric = metrics.find(metric => metric.id === m);
      return metric && metric.label === props.payload.subject;
    });

    if (!metricId) return [value.toString(), name];

    // If normalized, show both normalized and original value
    if (normalizeData) {
      const metric = metrics.find(m => m.id === metricId);
      const entityId = entities.find(e => e.name === name)?.id;

      if (entityId && metric) {
        const entityData = data.find(item => item.entityId === entityId);
        if (entityData && entityData.values && entityData.values[metricId] !== undefined) {
          const originalValue = entityData.values[metricId];
          return [
            `${formatValue(originalValue, metricId)} (${value.toFixed(0)}%)`,
            name
          ];
        }
      }
    }

    return [formatValue(value, metricId), name];
  };

  // Create entity legend
  const renderEntityLegend = (props: LegendProps): React.ReactNode => {
    const { payload } = props;

    return (
      <SimpleBox sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
        {payload.map((entry, index) => (
          <SimpleBox
            key={`entity-legend-${index}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              mx: 1,
              my: 0.5
            }}
          >
            <SimpleBox
              sx={{
                width: 10,
                height: 10,
                backgroundColor: entry.color,
                mr: 1
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {entry.value}
            </Typography>
          </SimpleBox>
        ))}
      </SimpleBox>
    );
  };

  // Create controls toolbar
  const renderControls = (): React.ReactNode => {
    return (
      <SimpleBox sx={{ mb: 3 }}>
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
              {metrics.map((metric) => (
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
            label="Search Entities"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: { xs: 1, md: 0 }, width: { xs: '100%', md: 200 } }}
          />
        </Stack>

        <SimpleBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={normalizeData}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNormalizeData(e.target.checked)}
                size="small"
              />
            }
            label="Normalize data"
          />

          <FormControlLabel
            control={
              <Switch
                checked={showLabels}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowLabels(e.target.checked)}
                size="small"
              />
            }
            label="Show labels"
          />

          <FormControlLabel
            control={
              <Switch
                checked={highContrastMode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHighContrastMode(e.target.checked)}
                size="small"
              />
            }
            label="High contrast"
          />
        </SimpleBox>
      </SimpleBox>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <SimpleBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </SimpleBox>
        </CardContent>
      </Card>
    );
  }

  // If no data or no metrics/entities selected, show a message
  if (filteredData.length === 0 || selectedMetrics.length === 0 || selectedEntities.length === 0) {
    return (
      <Card>
        <CardContent>
          <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>

            <SimpleBox sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh data">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </SimpleBox>
          </SimpleBox>

          {renderControls()}

          <SimpleBox sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No data to display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedMetrics.length === 0 ? 'Please select metrics to visualize.' :
                selectedEntities.length === 0 ? 'Please select entities to compare.' :
                'No data matches the current selection.'}
            </Typography>
          </SimpleBox>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={1}>
      <CardContent>
        {/* Header with title and controls */}
        <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Tooltip title="Compare multiple entities across various metrics in a radar chart visualization">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </SimpleBox>

          <SimpleBox sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export chart">
              <IconButton size="small" onClick={onExport}>
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </SimpleBox>
        </SimpleBox>

        {/* Configuration controls */}
        {renderControls()}

        {/* Radar chart */}
        <SimpleBox sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={filteredData}
              margin={{ top: 10, right: 30, bottom: 30, left: 30 }}
            >
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: theme.palette.text.primary,
                  fontSize: 12
                }}
                tickLine={false}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={normalizeData ? [0, 100] as [number, number] : 'auto' as any}
                tick={{
                  fill: theme.palette.text.secondary,
                  fontSize: 10
                }}
                tickCount={5}
                axisLine={false}
                tickLine={false}
              />

              {/* Create radar lines for each selected entity */}
              {selectedEntities.map((entityId, index) => {
                const entity = entities.find(e => e.id === entityId);
                if (!entity) return null;

                const entityColor = getEntityColor(entity.name, index);

                return (
                  <Radar
                    key={entityId}
                    name={entity.name}
                    dataKey={entity.name}
                    stroke={entityColor}
                    fill={entityColor}
                    fillOpacity={0.2}
                    dot
                    activeDot={{ r: 5 }}
                    isAnimationActive
                  />
                );
              })}

              {/* Using a custom legend component outside of recharts to avoid type errors */}
              <Legend content={() => null} />
            </RadarChart>
          </ResponsiveContainer>
        </SimpleBox>

        {/* Context information */}
        <Paper
          variant="outlined"
          sx={{ mt: 2, p: 1, backgroundColor: theme.palette.background.default }}
          elevation={0}
        >
          <Typography variant="body2" color="text.secondary">
            {normalizeData ?
              'Data is normalized to a 0-100 scale for better comparison.' :
              'Data is displayed in original units. Consider normalization for better comparison across metrics.'}
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default MultiDimensionalRadarChart;