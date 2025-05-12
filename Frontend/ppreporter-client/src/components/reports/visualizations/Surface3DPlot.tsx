import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
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
import { interpolateSurface, SurfaceInterpolationMethod } from '../../../components/utils/interpolationUtils';
import Safe3DRenderer from './Safe3DRenderer';

// Lazy load Three.js related components to prevent crashes
const ThreeSurfaceComponents = lazy(() => import('./ThreeSurfaceComponents'));

// Data point interface
export interface SurfaceDataPoint {
  x: number;
  y: number;
  z: number;
  [key: string]: any;
}

// Surface plot props
interface Surface3DPlotProps {
  id: string;
  title: string;
  description?: string;
  data: SurfaceDataPoint[];
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
  xRange?: [number, number];
  yRange?: [number, number];
  height?: number;
  loading?: boolean;
  error?: string | null;
  resolution?: number;
  interpolationMethod?: SurfaceInterpolationMethod;
  colorMap?: 'rainbow' | 'heatmap' | 'terrain' | 'plasma';
  wireframe?: boolean;
  enableRotation?: boolean;
  enableZoom?: boolean;
  enableGrid?: boolean;
  enableAxes?: boolean;
  onPointClick?: (point: SurfaceDataPoint) => void;
}

/**
 * Surface3DPlot component
 * A 3D surface plot with interpolation
 */
const Surface3DPlot: React.FC<Surface3DPlotProps> = ({
  id,
  title,
  description,
  data,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  zLabel = 'Z Axis',
  xRange,
  yRange,
  height = 500,
  loading = false,
  error = null,
  resolution = 50,
  interpolationMethod = 'bilinear',
  colorMap = 'rainbow',
  wireframe = true,
  enableRotation = true,
  enableZoom = true,
  enableGrid = true,
  enableAxes = true,
  onPointClick
}) => {
  const theme = useTheme();

  // State
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [darkMode, setDarkMode] = useState<boolean>(theme.palette.mode === 'dark');
  const [surfaceResolution, setSurfaceResolution] = useState<number>(resolution);
  const [selectedInterpolation, setSelectedInterpolation] = useState<SurfaceInterpolationMethod>(interpolationMethod);
  const [showWireframe, setShowWireframe] = useState<boolean>(wireframe);
  const [selectedColorMap, setSelectedColorMap] = useState<string>(colorMap);

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

  // Handle resolution change
  const handleResolutionChange = useCallback((event: Event, newValue: number | number[]) => {
    setSurfaceResolution(newValue as number);
  }, []);

  // Handle interpolation method change
  const handleInterpolationChange = useCallback((event: SelectChangeEvent<SurfaceInterpolationMethod>) => {
    setSelectedInterpolation(event.target.value as SurfaceInterpolationMethod);
  }, []);

  // Handle wireframe toggle
  const handleWireframeToggle = useCallback(() => {
    setShowWireframe(prev => !prev);
  }, []);

  // Handle color map change
  const handleColorMapChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedColorMap(event.target.value as string);
  }, []);

  // Render 3D content with error handling
  const render3DContent = () => {
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
          <ThreeSurfaceComponents
            data={data}
            autoRotate={autoRotate}
            rotationSpeed={rotationSpeed}
            enableZoom={enableZoom}
            enableRotation={enableRotation}
            enableGrid={enableGrid}
            enableAxes={enableAxes}
            darkMode={darkMode}
            xLabel={xLabel}
            yLabel={yLabel}
            zLabel={zLabel}
            surfaceResolution={surfaceResolution}
            selectedInterpolation={selectedInterpolation}
            showWireframe={showWireframe}
            selectedColorMap={selectedColorMap}
            xRange={xRange}
            yRange={yRange}
            onPointClick={onPointClick}
            theme={theme}
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
  if (!data || data.length < 3) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: height
      }}>
        <Typography color="text.secondary">
          Not enough data points for surface interpolation (minimum 3 required)
        </Typography>
      </div>
    );
  }

  return (
    <Paper style={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        {/* Interpolation method */}
        <FormControl size="small" style={{ minWidth: 150 }}>
          <InputLabel id="interpolation-select-label">Interpolation</InputLabel>
          <Select
            labelId="interpolation-select-label"
            value={selectedInterpolation}
            onChange={handleInterpolationChange}
            label="Interpolation"
          >
            <MenuItem value="nearest">Nearest Neighbor</MenuItem>
            <MenuItem value="bilinear">Bilinear</MenuItem>
            <MenuItem value="bicubic">Bicubic</MenuItem>
            <MenuItem value="natural">Natural Neighbor</MenuItem>
            <MenuItem value="kriging">Kriging</MenuItem>
          </Select>
        </FormControl>

        {/* Color map */}
        <FormControl size="small" style={{ minWidth: 120 }}>
          <InputLabel id="colormap-select-label">Color Map</InputLabel>
          <Select
            labelId="colormap-select-label"
            value={selectedColorMap}
            onChange={handleColorMapChange}
            label="Color Map"
          >
            <MenuItem value="rainbow">Rainbow</MenuItem>
            <MenuItem value="heatmap">Heatmap</MenuItem>
            <MenuItem value="terrain">Terrain</MenuItem>
            <MenuItem value="plasma">Plasma</MenuItem>
          </Select>
        </FormControl>

        {/* Resolution slider */}
        <div style={{ width: 150, paddingLeft: 8, paddingRight: 8 }}>
          <Typography variant="caption" color="text.secondary">
            Resolution: {surfaceResolution}
          </Typography>
          <Slider
            value={surfaceResolution}
            onChange={handleResolutionChange}
            min={10}
            max={100}
            step={5}
            size="small"
          />
        </div>

        {/* Wireframe toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={showWireframe}
              onChange={handleWireframeToggle}
              size="small"
            />
          }
          label="Wireframe"
        />

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
    </Paper>
  );
};

export default Surface3DPlot;
