import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme
} from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAnnotationContext } from '../interactive/AnnotationSystem';
import Safe3DRenderer from './Safe3DRenderer';

// Lazy load Three.js related components to prevent crashes
const ThreeComponents = lazy(() => import('./ThreeComponents'));

// Data point interface
export interface DataPoint3D {
  id: string;
  x: number;
  y: number;
  z: number;
  value?: number;
  label?: string;
  color?: string;
  group?: string;
  [key: string]: any;
}

// 3D chart props
interface Interactive3DChartProps {
  id: string;
  title: string;
  description?: string;
  data: DataPoint3D[];
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
  height?: number;
  loading?: boolean;
  error?: string | null;
  colorBy?: string;
  sizeBy?: string;
  enableRotation?: boolean;
  enableZoom?: boolean;
  enableLabels?: boolean;
  enableGrid?: boolean;
  enableAxes?: boolean;
  enableAnnotations?: boolean;
  chartType?: '3dScatter' | '3dBar' | '3dSurface';
  onPointClick?: (point: DataPoint3D) => void;
}

/**
 * Interactive3DChart component
 * A 3D visualization for data exploration
 */
const Interactive3DChart: React.FC<Interactive3DChartProps> = ({
  id,
  title,
  description,
  data,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  zLabel = 'Z Axis',
  height = 500,
  loading = false,
  error = null,
  colorBy = 'group',
  sizeBy = 'value',
  enableRotation = true,
  enableZoom = true,
  enableLabels = true,
  enableGrid = true,
  enableAxes = true,
  enableAnnotations = true,
  chartType = '3dScatter',
  onPointClick
}) => {
  const theme = useTheme();
  const { addAnnotation, getAnnotationsForDataPoint } = useAnnotationContext();

  // State
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [darkMode, setDarkMode] = useState<boolean>(theme.palette.mode === 'dark');
  const [selectedPoint, setSelectedPoint] = useState<DataPoint3D | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint3D | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  // Process data
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Extract groups
    const uniqueGroups = Array.from(new Set(data.map(point => point.group || 'default')));
    setGroups(uniqueGroups);

    if (selectedGroups.length === 0) {
      setSelectedGroups(uniqueGroups);
    }
  }, [data, selectedGroups.length]);

  // Handle group selection
  const handleGroupSelection = useCallback((event: SelectChangeEvent<string[]>) => {
    setSelectedGroups(event.target.value as string[]);
  }, []);

  // Handle auto-rotate toggle
  const handleAutoRotateToggle = useCallback(() => {
    setAutoRotate(prev => !prev);
  }, []);

  // Handle rotation speed change
  const handleRotationSpeedChange = useCallback((event: Event, newValue: number | number[]) => {
    setRotationSpeed(newValue as number);
  }, []);

  // Handle dark mode toggle
  const handleDarkModeToggle = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  // Handle chart type change
  const handleChartTypeChange = useCallback((event: SelectChangeEvent) => {
    // @ts-ignore - Type safety handled by component props
    const newChartType = event.target.value as '3dScatter' | '3dBar' | '3dSurface';
    // This would be set via props in a real implementation
  }, []);

  // Handle color by change
  const handleColorByChange = useCallback((event: SelectChangeEvent) => {
    // This would be set via props in a real implementation
  }, []);

  // Handle size by change
  const handleSizeByChange = useCallback((event: SelectChangeEvent) => {
    // This would be set via props in a real implementation
  }, []);

  // Handle point click
  const handlePointClick = useCallback((point: DataPoint3D) => {
    setSelectedPoint(prev => prev?.id === point.id ? null : point);

    if (onPointClick) {
      onPointClick(point);
    }
  }, [onPointClick]);

  // Filter data based on selected groups
  const filteredData = useCallback(() => {
    if (!data || data.length === 0) return [];

    return data.filter(point =>
      selectedGroups.includes(point.group || 'default')
    );
  }, [data, selectedGroups]);

  // Normalize data to fit in the scene
  const normalizedData = useCallback(() => {
    const filtered = filteredData();
    if (filtered.length === 0) return [];

    // Find min/max values for each axis
    const xValues = filtered.map(p => p.x);
    const yValues = filtered.map(p => p.y);
    const zValues = filtered.map(p => p.z);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);

    // Normalize to range [-5, 5]
    return filtered.map(point => ({
      ...point,
      normalizedX: ((point.x - xMin) / (xMax - xMin) * 10) - 5,
      normalizedY: ((point.y - yMin) / (yMax - yMin) * 10) - 5,
      normalizedZ: ((point.z - zMin) / (zMax - zMin) * 10) - 5
    }));
  }, [filteredData]);

  // Get color for a point
  const getPointColor = useCallback((point: DataPoint3D) => {
    if (point.color) return point.color;

    if (colorBy === 'group' && point.group) {
      const groupIndex = groups.indexOf(point.group);
      const colors = [
        '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
        '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'
      ];
      return colors[groupIndex % colors.length];
    }

    return theme.palette.primary.main;
  }, [colorBy, groups, theme]);

  // Get size for a point
  const getPointSize = useCallback((point: DataPoint3D) => {
    if (sizeBy === 'value' && point.value !== undefined) {
      // Scale size based on value
      const minValue = Math.min(...data.map(p => p.value || 0));
      const maxValue = Math.max(...data.map(p => p.value || 0));
      const normalizedValue = (point.value - minValue) / (maxValue - minValue);

      return 0.2 + normalizedValue * 0.8;
    }

    return 0.5;
  }, [sizeBy, data]);

  // Render 3D content with error handling
  const render3DContent = () => {
    const normalized = normalizedData();

    return (
      <Safe3DRenderer height={height} fallback={
        <Typography color="text.secondary">
          3D visualization could not be loaded. Please try again later.
        </Typography>
      }>
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </div>
        }>
          <ThreeComponents
            normalizedData={normalized}
            autoRotate={autoRotate}
            rotationSpeed={rotationSpeed}
            enableZoom={enableZoom}
            enableRotation={enableRotation}
            enableGrid={enableGrid}
            enableAxes={enableAxes}
            enableLabels={enableLabels}
            darkMode={darkMode}
            xLabel={xLabel}
            yLabel={yLabel}
            zLabel={zLabel}
            chartType={chartType}
            getPointColor={getPointColor}
            getPointSize={getPointSize}
            handlePointClick={handlePointClick}
            selectedPoint={selectedPoint}
            hoveredPoint={hoveredPoint}
            setHoveredPoint={setHoveredPoint}
          />
        </Suspense>
      </Safe3DRenderer>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </div>
    );
  }

  return (
    <Paper sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        {/* Group filter */}
        {groups.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="group-select-label">Groups</InputLabel>
            <Select
              labelId="group-select-label"
              multiple
              value={selectedGroups}
              onChange={handleGroupSelection}
              label="Groups"
            >
              {groups.map(group => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Auto-rotate toggle */}
        {enableRotation && (
          <FormControlLabel
            control={
              <Switch
                checked={autoRotate}
                onChange={handleAutoRotateToggle}
                size="small"
              />
            }
            label="Auto-rotate"
          />
        )}

        {/* Rotation speed */}
        {enableRotation && autoRotate && (
          <div style={{ width: 120, paddingLeft: 8, paddingRight: 8 }}>
            <Typography variant="caption" color="text.secondary">
              Speed
            </Typography>
            <Slider
              value={rotationSpeed}
              onChange={handleRotationSpeedChange}
              min={0.5}
              max={5}
              step={0.5}
              size="small"
            />
          </div>
        )}

        {/* Rotation controls */}
        {enableRotation && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Tooltip title="Rotate Left">
              <IconButton size="small" onClick={() => {}}>
                <RotateLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rotate Right">
              <IconButton size="small" onClick={() => {}}>
                <RotateRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {/* Zoom controls */}
        {enableZoom && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={() => {}}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={() => {}}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset View">
              <IconButton size="small" onClick={() => {}}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {/* Dark mode toggle */}
        <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <IconButton size="small" onClick={handleDarkModeToggle}>
            {darkMode ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </div>

      {/* 3D Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        {render3DContent()}
      </div>

      {/* Selected point info */}
      {selectedPoint && (
        <div style={{ padding: 16, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Typography variant="subtitle2">
            Selected Point: {selectedPoint.label || selectedPoint.id}
          </Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <Typography variant="body2">
              X: {selectedPoint.x}, Y: {selectedPoint.y}, Z: {selectedPoint.z}
            </Typography>
            {selectedPoint.value !== undefined && (
              <Typography variant="body2">
                Value: {selectedPoint.value}
              </Typography>
            )}
            {selectedPoint.group && (
              <Typography variant="body2">
                Group: {selectedPoint.group}
              </Typography>
            )}
          </div>
        </div>
      )}
    </Paper>
  );
};

export default Interactive3DChart;
