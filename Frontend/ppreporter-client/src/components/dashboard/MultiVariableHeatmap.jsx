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
  Slider,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TuneIcon from '@mui/icons-material/Tune';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHeatmapData, clearComponentError } from '../../store/slices/dashboardSlice';

/**
 * MultiVariableHeatmap component for visualizing relationships between different metrics
 * Helps identify patterns and correlations across multiple variables
 */
const MultiVariableHeatmap = ({
  height = 600,
  isLoading = false,
  timeFrame = '30d'
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { heatmapData, heatmapLoading, heatmapError } = useSelector(state => state.dashboard);
  
  const [dataType, setDataType] = useState('player_activity');
  const [xAxis, setXAxis] = useState('day_of_week');
  const [yAxis, setYAxis] = useState('hour_of_day');
  const [valueMetric, setValueMetric] = useState('player_count');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cellSize, setCellSize] = useState(35);
  const [showValues, setShowValues] = useState(true);
  const [reverseColors, setReverseColors] = useState(false);
  const [colorPalette, setColorPalette] = useState('blues');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Data type options
  const dataTypeOptions = [
    { value: 'player_activity', label: 'Player Activity' },
    { value: 'game_performance', label: 'Game Performance' },
    { value: 'transaction_patterns', label: 'Transaction Patterns' },
    { value: 'player_demographics', label: 'Player Demographics' },
    { value: 'bonus_effectiveness', label: 'Bonus Effectiveness' }
  ];
  
  // Dimension options for X and Y axes
  const dimensionOptions = {
    player_activity: [
      { value: 'day_of_week', label: 'Day of Week' },
      { value: 'hour_of_day', label: 'Hour of Day' },
      { value: 'player_segment', label: 'Player Segment' },
      { value: 'game_category', label: 'Game Category' },
      { value: 'device_type', label: 'Device Type' }
    ],
    game_performance: [
      { value: 'game_category', label: 'Game Category' },
      { value: 'game_provider', label: 'Game Provider' },
      { value: 'player_segment', label: 'Player Segment' },
      { value: 'bet_size_range', label: 'Bet Size Range' },
      { value: 'platform', label: 'Platform' }
    ],
    transaction_patterns: [
      { value: 'payment_method', label: 'Payment Method' },
      { value: 'transaction_size', label: 'Transaction Size' },
      { value: 'player_lifetime', label: 'Player Lifetime' },
      { value: 'player_segment', label: 'Player Segment' },
      { value: 'country', label: 'Country' }
    ],
    player_demographics: [
      { value: 'age_group', label: 'Age Group' },
      { value: 'country', label: 'Country' },
      { value: 'registration_source', label: 'Registration Source' },
      { value: 'player_lifetime', label: 'Player Lifetime' },
      { value: 'deposit_frequency', label: 'Deposit Frequency' }
    ],
    bonus_effectiveness: [
      { value: 'bonus_type', label: 'Bonus Type' },
      { value: 'player_segment', label: 'Player Segment' },
      { value: 'game_category', label: 'Game Category' },
      { value: 'deposit_size', label: 'Deposit Size' },
      { value: 'player_lifetime', label: 'Player Lifetime' }
    ]
  };
  
  // Value metrics options
  const valueMetricOptions = {
    player_activity: [
      { value: 'player_count', label: 'Player Count' },
      { value: 'session_count', label: 'Session Count' },
      { value: 'avg_session_length', label: 'Avg. Session Length' },
      { value: 'bet_count', label: 'Bet Count' },
      { value: 'total_bets', label: 'Total Bets (£)' }
    ],
    game_performance: [
      { value: 'ggr', label: 'GGR (£)' },
      { value: 'unique_players', label: 'Unique Players' },
      { value: 'rounds_played', label: 'Rounds Played' },
      { value: 'avg_bet', label: 'Avg. Bet (£)' },
      { value: 'rtp_percentage', label: 'RTP %' }
    ],
    transaction_patterns: [
      { value: 'transaction_count', label: 'Transaction Count' },
      { value: 'total_amount', label: 'Total Amount (£)' },
      { value: 'avg_amount', label: 'Avg. Amount (£)' },
      { value: 'success_rate', label: 'Success Rate (%)' },
      { value: 'first_time_deposits', label: 'First Time Deposits' }
    ],
    player_demographics: [
      { value: 'player_count', label: 'Player Count' },
      { value: 'avg_deposit', label: 'Avg. Deposit (£)' },
      { value: 'avg_withdrawal', label: 'Avg. Withdrawal (£)' },
      { value: 'retention_rate', label: 'Retention Rate (%)' },
      { value: 'conversion_rate', label: 'Conversion Rate (%)' }
    ],
    bonus_effectiveness: [
      { value: 'conversion_rate', label: 'Conversion Rate (%)' },
      { value: 'wagering_completion', label: 'Wagering Completion (%)' },
      { value: 'bonus_roi', label: 'Bonus ROI (%)' },
      { value: 'player_count', label: 'Player Count' },
      { value: 'ggr_from_bonus', label: 'GGR from Bonus (£)' }
    ]
  };
  
  // Color palette options
  const colorPaletteOptions = [
    { value: 'blues', label: 'Blues' },
    { value: 'reds', label: 'Reds' },
    { value: 'greens', label: 'Greens' },
    { value: 'purples', label: 'Purples' },
    { value: 'oranges', label: 'Oranges' },
    { value: 'spectral', label: 'Spectral' }
  ];
  
  useEffect(() => {
    if (!heatmapData || 
        heatmapData.dataType !== dataType || 
        heatmapData.xAxis !== xAxis || 
        heatmapData.yAxis !== yAxis || 
        heatmapData.valueMetric !== valueMetric || 
        heatmapData.timeFrame !== timeFrame) {
      dispatch(fetchHeatmapData({ 
        dataType,
        xAxis,
        yAxis,
        valueMetric,
        timeFrame
      }));
    }
  }, [dispatch, dataType, xAxis, yAxis, valueMetric, timeFrame, heatmapData]);
  
  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (heatmapError) {
        dispatch(clearComponentError({ component: 'heatmap' }));
      }
    };
  }, [dispatch, heatmapError]);
  
  const handleDataTypeChange = (event) => {
    const newType = event.target.value;
    setDataType(newType);
    
    // Reset X and Y axes with valid values for the new data type
    if (dimensionOptions[newType]) {
      setXAxis(dimensionOptions[newType][0].value);
      setYAxis(dimensionOptions[newType][1].value);
    }
    
    // Reset value metric with valid value for the new data type
    if (valueMetricOptions[newType]) {
      setValueMetric(valueMetricOptions[newType][0].value);
    }
  };
  
  const handleXAxisChange = (event) => {
    setXAxis(event.target.value);
  };
  
  const handleYAxisChange = (event) => {
    setYAxis(event.target.value);
  };
  
  const handleValueMetricChange = (event) => {
    setValueMetric(event.target.value);
  };
  
  const handleCellSizeChange = (event, newValue) => {
    setCellSize(newValue);
  };
  
  const handleShowValuesChange = (event) => {
    setShowValues(event.target.checked);
  };
  
  const handleReverseColorsChange = (event) => {
    setReverseColors(event.target.checked);
  };
  
  const handleColorPaletteChange = (event) => {
    setColorPalette(event.target.value);
  };
  
  const handleSearchFilterChange = (event) => {
    setSearchFilter(event.target.value);
  };
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleResetZoom = () => {
    setZoomLevel(1);
  };
  
  // Format value for display based on metric type
  const formatValue = (value, metric) => {
    if (!value && value !== 0) return '-';
    
    // Currency values
    if (metric.includes('amount') || metric.includes('deposit') || 
        metric.includes('withdrawal') || metric.includes('bet') || 
        metric.includes('ggr') || metric === 'total_bets') {
      return `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Percentage values
    if (metric.includes('rate') || metric.includes('percentage') || 
        metric.includes('completion') || metric.includes('roi') || 
        metric.includes('rtp')) {
      return `${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
    }
    
    // Duration values
    if (metric.includes('length')) {
      const minutes = Math.floor(value);
      const seconds = Math.round((value - minutes) * 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Default: whole number
    return value.toLocaleString();
  };
  
  // Generate screen reader accessible description
  const generateAccessibleDescription = () => {
    if (!heatmapData || !heatmapData.data) {
      return "No heatmap data available";
    }
    
    const dataTypeLabel = dataTypeOptions.find(d => d.value === dataType)?.label || dataType;
    const xAxisLabel = dimensionOptions[dataType]?.find(d => d.value === xAxis)?.label || xAxis;
    const yAxisLabel = dimensionOptions[dataType]?.find(d => d.value === yAxis)?.label || yAxis;
    const valueMetricLabel = valueMetricOptions[dataType]?.find(v => v.value === valueMetric)?.label || valueMetric;
    
    // Find extreme values
    let maxCell = { x: '', y: '', value: -Infinity };
    let minCell = { x: '', y: '', value: Infinity };
    
    heatmapData.data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'id') {
          const value = row[key];
          if (value > maxCell.value) {
            maxCell = { x: key, y: row.id, value };
          }
          if (value < minCell.value) {
            minCell = { x: key, y: row.id, value };
          }
        }
      });
    });
    
    // Calculate average value
    let sum = 0;
    let count = 0;
    heatmapData.data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key !== 'id') {
          sum += row[key];
          count++;
        }
      });
    });
    const avgValue = count > 0 ? sum / count : 0;
    
    return `${dataTypeLabel} heatmap showing ${valueMetricLabel} by ${xAxisLabel} (horizontal) and ${yAxisLabel} (vertical). 
            Highest value of ${formatValue(maxCell.value, valueMetric)} at ${maxCell.y} by ${maxCell.x}. 
            Lowest value of ${formatValue(minCell.value, valueMetric)} at ${minCell.y} by ${minCell.x}. 
            Average value is ${formatValue(avgValue, valueMetric)}.`;
  };
  
  // Filter the data based on search term
  const getFilteredData = () => {
    if (!heatmapData || !heatmapData.data || !searchFilter) {
      return heatmapData?.data || [];
    }
    
    const lowerCaseFilter = searchFilter.toLowerCase();
    
    return heatmapData.data.filter(row => {
      // Check if the row ID matches the filter
      if (row.id.toLowerCase().includes(lowerCaseFilter)) {
        return true;
      }
      
      // Check if any of the column values (unusually high or low) might be what the user is searching for
      for (const key in row) {
        if (key !== 'id') {
          const value = row[key];
          const formattedValue = formatValue(value, valueMetric);
          if (formattedValue.toLowerCase().includes(lowerCaseFilter)) {
            return true;
          }
        }
      }
      
      return false;
    });
  };
  
  if (isLoading || heatmapLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (heatmapError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, p: 2 }}>
        <Typography color="error">
          Error loading heatmap data: {heatmapError}
        </Typography>
      </Box>
    );
  }
  
  if (!heatmapData || !heatmapData.data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, p: 2 }}>
        <Typography color="text.secondary">
          No heatmap data available
        </Typography>
      </Box>
    );
  }
  
  const filteredData = getFilteredData();
  
  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Multi-Variable Analysis
            <Tooltip title="Identify patterns and correlations across different metrics with this interactive heatmap">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchFilter}
              onChange={handleSearchFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }}
            />
            <Button
              size="small"
              startIcon={<FileDownloadIcon />}
              variant="outlined"
            >
              Export Data
            </Button>
          </Box>
        </Box>
        
        {/* Configuration controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="data-type-label">Data Type</InputLabel>
              <Select
                labelId="data-type-label"
                value={dataType}
                label="Data Type"
                onChange={handleDataTypeChange}
              >
                {dataTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="x-axis-label">X Axis</InputLabel>
              <Select
                labelId="x-axis-label"
                value={xAxis}
                label="X Axis"
                onChange={handleXAxisChange}
              >
                {dimensionOptions[dataType]?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="y-axis-label">Y Axis</InputLabel>
              <Select
                labelId="y-axis-label"
                value={yAxis}
                label="Y Axis"
                onChange={handleYAxisChange}
              >
                {dimensionOptions[dataType]?.map(option => (
                  <MenuItem key={option.value} value={option.value}
                          disabled={option.value === xAxis}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="value-metric-label">Value Metric</InputLabel>
              <Select
                labelId="value-metric-label"
                value={valueMetric}
                label="Value Metric"
                onChange={handleValueMetricChange}
              >
                {valueMetricOptions[dataType]?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Visualization settings */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ minWidth: 180 }}>
            <Typography variant="caption" id="cell-size-slider" gutterBottom>
              Cell Size: {cellSize}px
            </Typography>
            <Slider
              size="small"
              value={cellSize}
              onChange={handleCellSizeChange}
              aria-labelledby="cell-size-slider"
              min={20}
              max={60}
              sx={{ width: 150 }}
            />
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="color-palette-label">
              <ColorLensIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Color Palette
            </InputLabel>
            <Select
              labelId="color-palette-label"
              value={colorPalette}
              label="Color Palette"
              onChange={handleColorPaletteChange}
            >
              {colorPaletteOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showValues}
                  onChange={handleShowValuesChange}
                  size="small"
                />
              }
              label="Show Values"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={reverseColors}
                  onChange={handleReverseColorsChange}
                  size="small"
                />
              }
              label="Reverse Colors"
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, pl: 1 }}>
            <Typography variant="caption" sx={{ mr: 1 }}>
              Zoom:
            </Typography>
            <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleResetZoom}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
        
        {/* Screen reader accessible description */}
        <Box sx={{ 
          position: 'absolute', 
          left: '-9999px', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden'
        }} 
          role="region" 
          aria-label="Multi-Variable Heatmap">
          {generateAccessibleDescription()}
        </Box>
        
        {filteredData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 280, p: 2 }}>
            <Typography color="text.secondary">
              No data matching your search criteria
            </Typography>
          </Box>
        ) : (
          <Box 
            sx={{ 
              height: height - 280, 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease-out'
            }}
          >
            <ResponsiveHeatMap
              data={filteredData}
              margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
              valueFormat={v => formatValue(v, valueMetric)}
              xOuterPadding={0.05}
              yOuterPadding={0.05}
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: dimensionOptions[dataType]?.find(d => d.value === xAxis)?.label || xAxis,
                legendOffset: -46,
                legendPosition: 'middle'
              }}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: dimensionOptions[dataType]?.find(d => d.value === xAxis)?.label || xAxis,
                legendOffset: 36,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: dimensionOptions[dataType]?.find(d => d.value === yAxis)?.label || yAxis,
                legendOffset: -72,
                legendPosition: 'middle'
              }}
              colors={{
                type: 'sequential',
                scheme: colorPalette,
                minValue: 'auto',
                maxValue: 'auto',
                reverse: reverseColors
              }}
              emptyColor="#ffffff"
              borderColor={{ from: 'color', modifiers: [['darker', 0.1]] }}
              enableLabels={showValues}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', reverseColors ? 0.8 : 2]]
              }}
              animate={true}
              motionConfig="gentle"
              hoverTarget="cell"
              cellOpacity={1}
              cellHoverOpacity={0.9}
              cellHoverOthersOpacity={0.5}
              cellBorderWidth={1}
              cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
              cellSize={cellSize}
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
                  tickFormat: v => formatValue(v, valueMetric),
                  title: valueMetricOptions[dataType]?.find(v => v.value === valueMetric)?.label || valueMetric,
                  titleAlign: 'start',
                  titleOffset: 4
                }
              ]}
              annotations={
                selectedCell ? [
                  {
                    type: 'rect',
                    match: { id: selectedCell.y, value: selectedCell.x },
                    noteX: 0,
                    noteY: -24,
                    noteWidth: 120,
                    noteHeight: 24,
                    noteTextOffset: 0,
                    noteBorderRadius: 4,
                    noteBorderWidth: 1,
                    noteBorderColor: theme.palette.primary.main,
                    noteBackgroundColor: theme.palette.primary.light,
                    noteTextColor: theme.palette.common.white
                  }
                ] : []
              }
              onClick={(cell) => {
                setSelectedCell(cell);
                console.log('Cell clicked:', cell);
              }}
            />
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Insights
          </Typography>
          {selectedCell ? (
            <Typography variant="body2">
              {selectedCell.y} × {selectedCell.x}: {formatValue(selectedCell.data.value, valueMetric)} {valueMetricOptions[dataType]?.find(v => v.value === valueMetric)?.label || valueMetric}.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Click on any cell in the heatmap to see detailed insights.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MultiVariableHeatmap;