import React, { useState, useEffect, ChangeEvent } from 'react';
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
  Stack,
  Switch,
  FormControlLabel,
  Chip,
  TextField,
  Slider,
  InputAdornment,
  Grid,
  Button,
  SelectChangeEvent
} from '@mui/material';
import {
  ParallelCoordinates,
  ResponsiveContainer,
  Legend
} from 'recharts';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import { formatPercentage, formatCurrency, formatNumber } from '../../utils/formatters';
import {
  ParallelCoordinatesPlotProps,
  Dimension,
  DataItem,
  FilterRange,
  SortConfig,
  ChartDimension,
  ColorScale
} from '../../types/parallelCoordinatesPlot';

/**
 * ParallelCoordinatesPlot component
 * Visualizes multi-dimensional data allowing users to see patterns and identify correlations
 * across multiple variables simultaneously
 */
const ParallelCoordinatesPlot: React.FC<ParallelCoordinatesPlotProps> = ({
  data = [],
  title = 'Multi-Variable Analysis',
  isLoading = false,
  dimensions = [],
  colorScale = 'linear',
  onRefresh = () => {},
  onExport = () => {}
}) => {
  const theme = useTheme();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [brushEnabled, setBrushEnabled] = useState<boolean>(true);
  const [colorDimension, setColorDimension] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataItem[]>(data);
  const [filters, setFilters] = useState<Record<string, FilterRange>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  // Initialize with default dimensions
  useEffect(() => {
    if (dimensions.length > 0 && selectedDimensions.length === 0) {
      // Select all dimensions by default
      setSelectedDimensions(dimensions.map(d => d.id));
      // Set default color dimension
      if (dimensions.find(d => d.id === 'value' || d.id === 'score')) {
        setColorDimension(dimensions.find(d => d.id === 'value' || d.id === 'score')!.id);
      } else if (dimensions.length > 0) {
        setColorDimension(dimensions[0].id);
      }
    }
  }, [dimensions, selectedDimensions]);

  // Apply search filtering
  useEffect(() => {
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }

    let result = [...data];

    // Apply search term filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.name && item.name.toLowerCase().includes(term) ||
        (item.category && item.category.toLowerCase().includes(term)) ||
        (item.id && item.id.toString().toLowerCase().includes(term))
      );
    }

    // Apply dimensional filters
    Object.keys(filters).forEach(dimension => {
      const { min, max } = filters[dimension];
      if (min !== undefined && max !== undefined) {
        result = result.filter(item => {
          const value = item[dimension] as number;
          return value >= min && value <= max;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
  }, [data, searchTerm, filters, sortConfig]);

  // Handle dimension selection change
  const handleDimensionChange = (event: SelectChangeEvent<string[]>): void => {
    const value = event.target.value;
    setSelectedDimensions(typeof value === 'string' ? [value] : value);
  };

  // Handle zoom in/out
  const handleZoomIn = (): void => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = (): void => setZoomLevel(prev => Math.max(prev - 0.1, 0.7));

  // Handle color dimension change
  const handleColorDimensionChange = (event: SelectChangeEvent): void => {
    setColorDimension(event.target.value);
  };

  // Handle sort change
  const handleSort = (dimensionId: string): void => {
    const isAsc = sortConfig.key === dimensionId && sortConfig.direction === 'asc';
    setSortConfig({
      key: dimensionId,
      direction: isAsc ? 'desc' : 'asc'
    });
  };

  // Handle filter change
  const handleFilterChange = (dimensionId: string, range: FilterRange): void => {
    setFilters(prev => ({
      ...prev,
      [dimensionId]: range
    }));
  };

  // Format value for display
  const formatValue = (value: number, format?: string): string => {
    if (value === null || value === undefined) return '-';

    switch (format) {
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

  // Get dimensions configuration for Recharts
  const getChartDimensions = (): ChartDimension[] => {
    return selectedDimensions.map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId);
      if (!dimension) return null;

      // Find min/max values for the dimension
      const values = filteredData.map(item => item[dimId] as number).filter(val => val !== null && val !== undefined);
      const min = Math.min(...values);
      const max = Math.max(...values);

      return {
        name: dimension.label,
        domain: [min, max],
        tickFormatter: (value: number) => formatValue(value, dimension.format),
        type: 'number'
      };
    }).filter(Boolean) as ChartDimension[];
  };

  // Get color scale based on selected dimension
  const getColorScale = (): ColorScale => {
    if (!colorDimension || filteredData.length === 0) {
      return {
        from: theme.palette.primary.light,
        to: theme.palette.primary.dark
      };
    }

    const values = filteredData.map(item => item[colorDimension]);
    const dimension = dimensions.find(d => d.id === colorDimension);

    // If dimension is categorical, use different colors for each category
    if (dimension && dimension.type === 'categorical') {
      const categories = Array.from(new Set(values));
      const colorMap: Record<string, string> = {};
      const categoryColors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main
      ];

      categories.forEach((category, index) => {
        colorMap[category as string] = categoryColors[index % categoryColors.length];
      });

      return {
        dataKey: colorDimension,
        range: colorMap
      };
    }

    // Otherwise use a continuous color scale
    return {
      dataKey: colorDimension,
      from: theme.palette.primary.light,
      to: theme.palette.primary.dark
    };
  };

  // Create dimensions toolbar
  const renderDimensionsToolbar = (): React.ReactNode => {
    return (
      <Box sx={{ mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200, flexGrow: 1 }}>
            <InputLabel id="dimensions-select-label">Dimensions</InputLabel>
            <Select
              labelId="dimensions-select-label"
              multiple
              value={selectedDimensions}
              onChange={handleDimensionChange}
              label="Dimensions"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={dimensions.find(d => d.id === value)?.label || value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {dimensions.map((dimension) => (
                <MenuItem key={dimension.id} value={dimension.id}>
                  {dimension.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="color-dimension-label">Color By</InputLabel>
            <Select
              labelId="color-dimension-label"
              value={colorDimension}
              onChange={handleColorDimensionChange}
              label="Color By"
            >
              {dimensions.map((dimension) => (
                <MenuItem key={dimension.id} value={dimension.id}>
                  {dimension.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search"
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filteredData.length} items displayed
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={brushEnabled}
                onChange={(e) => setBrushEnabled(e.target.checked)}
                size="small"
              />
            }
            label="Enable brushing"
          />
        </Box>
      </Box>
    );
  };

  // Render dimension filters
  const renderDimensionFilters = (): React.ReactNode => {
    if (selectedDimensions.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          <FilterListIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          Filters
        </Typography>

        <Grid container spacing={2}>
          {selectedDimensions.map(dimId => {
            const dimension = dimensions.find(d => d.id === dimId);
            if (!dimension) return null;

            // Get min/max values for the dimension
            const values = data.map(item => item[dimId] as number).filter(val => val !== null && val !== undefined);
            const min = Math.min(...values);
            const max = Math.max(...values);

            const currentFilter = filters[dimId] || { min, max };

            return (
              <Grid item xs={12} sm={6} md={4} key={dimId}>
                <Box sx={{ px: 1 }}>
                  <Typography variant="body2" id={`${dimId}-slider-label`}>
                    {dimension.label}: {formatValue(currentFilter.min, dimension.format)} - {formatValue(currentFilter.max, dimension.format)}
                  </Typography>
                  <Slider
                    size="small"
                    value={[currentFilter.min, currentFilter.max]}
                    min={min}
                    max={max}
                    step={(max - min) / 100}
                    onChange={(e, newValue) => {
                      const values = Array.isArray(newValue) ? newValue : [newValue, newValue];
                      handleFilterChange(dimId, { min: values[0] as number, max: values[1] as number });
                    }}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => formatValue(value, dimension.format)}
                    aria-labelledby={`${dimId}-slider-label`}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // If no data or no dimensions selected, show a message
  if (filteredData.length === 0 || selectedDimensions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No data to display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredData.length === 0 ? 'No data matches the current filters.' : 'Please select dimensions to visualize.'}
            </Typography>

            {filteredData.length === 0 && Object.keys(filters).length > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setFilters({})}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartDimensions = getChartDimensions();
  const colorScaleConfig = getColorScale();

  return (
    <Card elevation={1}>
      <CardContent>
        {/* Header with title and controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Tooltip title="Compare entities across multiple dimensions in parallel coordinates visualization">
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

            <Tooltip title="Zoom in">
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Zoom out">
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Configuration controls */}
        {renderDimensionsToolbar()}

        {/* Dimension filters */}
        {renderDimensionFilters()}

        {/* Parallel coordinates chart */}
        <Box
          sx={{
            height: 500,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ParallelCoordinates
              data={filteredData}
              dimensions={chartDimensions}
              colorBy={colorScaleConfig as any}
              strokeWidth={2}
              showMissingPoints={false}
              axisTicksPosition="both"
              animate
              margin={{ top: 20, right: 30, bottom: 50, left: 30 }}
              axisLineColor={theme.palette.divider}
              axisTickColor={theme.palette.text.secondary}
              axisTickLabelColor={theme.palette.text.primary}
              brushEnabled={brushEnabled}
            />
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ParallelCoordinatesPlot;