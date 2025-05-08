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
  Grid
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
const AdvancedRadarChart = ({
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
  onDrillDown = () => {} // New prop for handling drill-down interactions
}) => {
  const theme = useTheme();
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [showLabels, setShowLabels] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [normalizeData, setNormalizeData] = useState(true);
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  // New state variables
  const [showHistoricalTrends, setShowHistoricalTrends] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [opacityLevel, setOpacityLevel] = useState(0.2);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedBenchmark, setSelectedBenchmark] = useState(benchmarks[0]?.id || null);
  
  // Default tab options with counts
  const tabOptions = useMemo(() => [
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
    const radarData = selectedMetrics.map(metricId => {
      const metric = metrics.find(m => m.id === metricId);
      if (!metric) return null;
      
      const metricObj = {
        subject: metric.label,
        metricId: metricId, // Add metricId to data for easier reference in tooltips
        unit: metric.unit || '',
        description: metric.description || ''
      };
      
      // Find min/max values for this metric (for normalization)
      const metricValues = data.map(item => 
        item.values && item.values[metricId] !== undefined ? item.values[metricId] : null
      ).filter(val => val !== null && val !== undefined);
      
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
    }).filter(Boolean);
    
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
  const handleMetricChange = (event) => {
    setSelectedMetrics(event.target.value);
  };
  
  // Handle entity selection change
  const handleEntityChange = (event) => {
    setSelectedEntities(event.target.value);
  };
  
  // Handle group change
  const handleGroupChange = (event, newValue) => {
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
  const getEntityColor = (entityName, index) => {
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
  const getBenchmarkColor = () => {
    return theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
  };
  
  // Format value for display
  const formatValue = (value, metricId) => {
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
  const CustomTooltip = ({ active, payload, label }) => {
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
                        data={history.map((val, i) => ({ value: val, label: `${i+1}` }))}
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
  const renderEntityLegend = (props) => {
    const { payload } = props;
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
        {payload.map((entry, index) => {
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
            label="Search Entities"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={normalizeData}
                onChange={(e) => setNormalizeData(e.target.checked)}
                size="small"
              />
            }
            label="Normalize data"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                size="small"
              />
            }
            label="Show labels"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showBenchmarks}
                onChange={(e) => setShowBenchmarks(e.target.checked)}
                size="small"
              />
            }
            label="Show benchmarks"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={showHistoricalTrends}
                onChange={(e) => setShowHistoricalTrends(e.target.checked)}
                size="small"
              />
            }
            label="Show historical trends"
          />
        </Box>
        
        <Button
          size="small"
          startIcon={advancedSettingsOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          endIcon={<TuneIcon />}
          onClick={() => setAdvancedSettingsOpen(!advancedSettingsOpen)}
          sx={{ mb: 1 }}
        >
          Advanced settings
        </Button>
        
        <Collapse in={advancedSettingsOpen}>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Visual Settings
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  Fill Opacity: {opacityLevel}
                </Typography>
                <Slider
                  value={opacityLevel}
                  onChange={(_, newValue) => setOpacityLevel(newValue)}
                  min={0.05}
                  max={0.5}
                  step={0.05}
                  valueLabelDisplay="auto"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" gutterBottom>
                  Stroke Width: {strokeWidth}px
                </Typography>
                <Slider
                  value={strokeWidth}
                  onChange={(_, newValue) => setStrokeWidth(newValue)}
                  min={1}
                  max={4}
                  step={0.5}
                  valueLabelDisplay="auto"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={highContrastMode}
                      onChange={(e) => setHighContrastMode(e.target.checked)}
                      size="small"
                    />
                  }
                  label="High contrast mode"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Benchmark Selection
                </Typography>
                
                <FormControl fullWidth size="small">
                  <InputLabel id="benchmark-select-label">Benchmark</InputLabel>
                  <Select
                    labelId="benchmark-select-label"
                    value={selectedBenchmark || ''}
                    onChange={(e) => setSelectedBenchmark(e.target.value)}
                    label="Benchmark"
                    disabled={!showBenchmarks}
                  >
                    {benchmarks.map((benchmark) => (
                      <MenuItem key={benchmark.id} value={benchmark.id}>
                        {benchmark.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Benchmarks provide reference points for comparison against industry standards, historical averages, or target values.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>
    );
  };
  
  // Accessibility description
  const getAccessibilityDescription = () => {
    if (filteredData.length === 0) return "No data available";
    
    const entityNames = selectedEntities.map(id => entities.find(e => e.id === id)?.name || id).join(", ");
    const metricCount = selectedMetrics.length;
    
    return `Radar chart comparing ${entityNames} across ${metricCount} metrics. ${
      normalizeData ? 'Data is normalized to a 0-100 scale.' : 'Data is in original units.'
    } ${showBenchmarks ? 'Benchmarks are displayed.' : ''} ${
      showHistoricalTrends ? 'Historical trends are available in tooltips.' : ''
    }`;
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // If no data or no metrics/entities selected, show a message
  if (filteredData.length === 0 || selectedMetrics.length === 0 || selectedEntities.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh data">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {renderControls()}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No data to display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedMetrics.length === 0 ? 'Please select metrics to visualize.' : 
                selectedEntities.length === 0 ? 'Please select entities to compare.' :
                'No data matches the current selection.'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card elevation={1}>
      <CardContent>
        {/* Header with title and controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Tooltip title="Compare multiple entities across various metrics in a radar chart visualization">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
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
          </Box>
        </Box>
        
        {/* Configuration controls */}
        {renderControls()}
        
        {/* Hidden accessibility description */}
        <Box sx={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          padding: 0, 
          margin: '-1px', 
          overflow: 'hidden', 
          clip: 'rect(0, 0, 0, 0)', 
          whiteSpace: 'nowrap', 
          borderWidth: 0 
        }} 
          role="region" 
          aria-live="polite"
        >
          {getAccessibilityDescription()}
        </Box>
        
        {/* Radar chart */}
        <Box sx={{ height: 400 }}>
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
                domain={normalizeData ? [0, 100] : 'auto'}
                tick={{ 
                  fill: theme.palette.text.secondary,
                  fontSize: 10
                }}
                tickCount={5}
                axisLine={false}
                tickLine={false}
              />
              
              {/* Create radar for benchmarks */}
              {showBenchmarks && selectedBenchmark && (
                <Radar
                  name={`${benchmarks.find(b => b.id === selectedBenchmark)?.name || 'Benchmark'} (Benchmark)`}
                  dataKey={`${benchmarks.find(b => b.id === selectedBenchmark)?.name || 'Benchmark'} (Benchmark)`}
                  stroke={getBenchmarkColor()}
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  isAnimationActive
                />
              )}
              
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
                    fillOpacity={opacityLevel}
                    strokeWidth={strokeWidth}
                    dot
                    activeDot={{ r: 5 }}
                    isAnimationActive
                  />
                );
              })}
              
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend content={renderEntityLegend} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
        
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
            {showBenchmarks && ' Benchmark values are shown as dashed lines.'}
            {showHistoricalTrends && ' Historical trends are available in tooltips.'}
          </Typography>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default AdvancedRadarChart;