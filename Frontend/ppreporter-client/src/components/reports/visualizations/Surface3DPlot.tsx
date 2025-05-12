import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { interpolateSurface, SurfaceInterpolationMethod } from '../../../components/utils/interpolationUtils';

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

  // Scene component
  const Scene = () => {
    const { camera } = useThree();
    const controlsRef = useRef<any>();
    const meshRef = useRef<THREE.Mesh>(null);

    // Set initial camera position
    useEffect(() => {
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);
    }, [camera]);

    // Auto-rotate
    useFrame(() => {
      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotateSpeed = rotationSpeed;
        controlsRef.current.update();
      }
    });

    // Process data and create surface
    const { positions, colors, indices } = useMemo(() => {
      // Determine x and y ranges
      const xMin = xRange ? xRange[0] : Math.min(...data.map(p => p.x));
      const xMax = xRange ? xRange[1] : Math.max(...data.map(p => p.x));
      const yMin = yRange ? yRange[0] : Math.min(...data.map(p => p.y));
      const yMax = yRange ? yRange[1] : Math.max(...data.map(p => p.y));
      const zMin = Math.min(...data.map(p => p.z));
      const zMax = Math.max(...data.map(p => p.z));

      // Interpolate surface
      const surface = interpolateSurface(
        data,
        surfaceResolution,
        selectedInterpolation,
        [xMin, xMax],
        [yMin, yMax]
      );

      // Create positions array
      const positions = new Float32Array(surface.vertices.length * 3);
      for (let i = 0; i < surface.vertices.length; i++) {
        const vertex = surface.vertices[i];
        positions[i * 3] = vertex.x;
        positions[i * 3 + 1] = vertex.z; // Use z as y in Three.js
        positions[i * 3 + 2] = vertex.y; // Use y as z in Three.js
      }

      // Create colors array based on z values
      const colors = new Float32Array(surface.vertices.length * 3);
      for (let i = 0; i < surface.vertices.length; i++) {
        const z = surface.vertices[i].z;
        const normalizedZ = (z - zMin) / (zMax - zMin);

        // Apply color map
        let r, g, b;

        switch (selectedColorMap) {
          case 'heatmap':
            // Blue to red heatmap
            r = normalizedZ;
            g = 0;
            b = 1 - normalizedZ;
            break;

          case 'terrain':
            // Terrain colors (blue-green-yellow-brown)
            if (normalizedZ < 0.2) {
              // Deep blue to light blue
              r = 0;
              g = normalizedZ * 2;
              b = 0.5 + normalizedZ * 2.5;
            } else if (normalizedZ < 0.4) {
              // Light blue to green
              r = 0;
              g = 0.4 + (normalizedZ - 0.2) * 3;
              b = 1 - (normalizedZ - 0.2) * 5;
            } else if (normalizedZ < 0.7) {
              // Green to yellow
              r = (normalizedZ - 0.4) * 3.33;
              g = 1;
              b = 0;
            } else {
              // Yellow to brown
              r = 1;
              g = 1 - (normalizedZ - 0.7) * 3.33;
              b = 0;
            }
            break;

          case 'plasma':
            // Plasma-like colors
            r = 0.5 + 0.5 * Math.sin(normalizedZ * Math.PI * 2);
            g = 0.5 + 0.5 * Math.sin(normalizedZ * Math.PI * 2 + Math.PI / 2);
            b = 0.5 + 0.5 * Math.sin(normalizedZ * Math.PI * 2 + Math.PI);
            break;

          case 'rainbow':
          default:
            // Rainbow colors
            const hue = (1 - normalizedZ) * 240; // Blue to red
            const s = 1;
            const l = 0.5;

            // HSL to RGB conversion
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
            const m = l - c / 2;

            if (hue < 60) {
              r = c; g = x; b = 0;
            } else if (hue < 120) {
              r = x; g = c; b = 0;
            } else if (hue < 180) {
              r = 0; g = c; b = x;
            } else if (hue < 240) {
              r = 0; g = x; b = c;
            } else if (hue < 300) {
              r = x; g = 0; b = c;
            } else {
              r = c; g = 0; b = x;
            }

            r = r + m;
            g = g + m;
            b = b + m;
        }

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      return { positions, colors, indices: surface.indices };
    }, [data, surfaceResolution, selectedInterpolation, selectedColorMap, xRange, yRange]);

    // Handle point click
    const handleClick = useCallback((event: THREE.Event) => {
      if (!onPointClick) return;

      // Get intersection point
      const intersection = (event as any).intersections?.[0];
      if (!intersection) return;

      // Convert to data space
      const point = intersection.point;

      // Find closest data point
      let closestPoint = data[0];
      let minDistance = Infinity;

      data.forEach(dataPoint => {
        const distance = Math.sqrt(
          Math.pow(dataPoint.x - point.x, 2) +
          Math.pow(dataPoint.y - point.z, 2) + // y and z are swapped in Three.js
          Math.pow(dataPoint.z - point.y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = dataPoint;
        }
      });

      onPointClick(closestPoint);
    }, [data, onPointClick]);

    return (
      <>
        <OrbitControls
          ref={controlsRef}
          autoRotate={autoRotate}
          enableZoom={enableZoom}
          enableRotate={enableRotation}
          enablePan={true}
        />

        {/* Ambient light */}
        <ambientLight intensity={darkMode ? 0.3 : 0.5} />

        {/* Directional light */}
        <directionalLight
          position={[10, 10, 10]}
          intensity={darkMode ? 0.7 : 1}
          castShadow
        />

        {/* Grid */}
        {enableGrid && (
          <gridHelper
            args={[10, 10, darkMode ? 0x444444 : 0xcccccc, darkMode ? 0x222222 : 0xe0e0e0]}
            position={[0, -5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        )}

        {/* Axes */}
        {enableAxes && (
          <>
            {/* X axis */}
            <line>
              <bufferGeometry attach="geometry">
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([-5, -5, -5, 5, -5, -5]), 3, false]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                attach="material"
                color={theme.palette.error.main}
                linewidth={2}
              />
            </line>

            {/* Y axis */}
            <line>
              <bufferGeometry attach="geometry">
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([-5, -5, -5, -5, 5, -5]), 3, false]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                attach="material"
                color={theme.palette.success.main}
                linewidth={2}
              />
            </line>

            {/* Z axis */}
            <line>
              <bufferGeometry attach="geometry">
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([-5, -5, -5, -5, -5, 5]), 3, false]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                attach="material"
                color={theme.palette.primary.main}
                linewidth={2}
              />
            </line>

            {/* Axis labels */}
            <Text
              position={[6, -5, -5]}
              color={theme.palette.error.main}
              fontSize={0.5}
              anchorX="center"
              anchorY="middle"
            >
              {xLabel}
            </Text>

            <Text
              position={[-5, 6, -5]}
              color={theme.palette.success.main}
              fontSize={0.5}
              anchorX="center"
              anchorY="middle"
            >
              {zLabel}
            </Text>

            <Text
              position={[-5, -5, 6]}
              color={theme.palette.primary.main}
              fontSize={0.5}
              anchorX="center"
              anchorY="middle"
            >
              {yLabel}
            </Text>
          </>
        )}

        {/* Surface mesh */}
        <mesh ref={meshRef} onClick={handleClick}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3, false]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[colors, 3, false]}
            />
            <bufferAttribute
              attach="index"
              args={[new Uint16Array(indices), 1, false]}
            />
          </bufferGeometry>
          <meshStandardMaterial
            vertexColors
            wireframe={showWireframe}
            side={THREE.DoubleSide}
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>

        {/* Original data points */}
        {data.map((point, index) => (
          <mesh
            key={`point-${index}`}
            position={[point.x, point.z, point.y]} // y and z are swapped in Three.js
            scale={0.1}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </>
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: height
      }}>
        <Typography color="text.secondary">
          Not enough data points for surface interpolation (minimum 3 required)
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
        {/* Interpolation method */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
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
        <FormControl size="small" sx={{ minWidth: 120 }}>
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
        <Box sx={{ width: 150, px: 1 }}>
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
        </Box>

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
          <Box sx={{ width: 120, px: 1 }}>
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
          </Box>
        )}

        {/* Dark mode toggle */}
        <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
          <IconButton size="small" onClick={handleDarkModeToggle}>
            {darkMode ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* 3D Canvas */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ position: [10, 10, 10], fov: 60 }}
          style={{ background: darkMode ? '#111' : '#f5f5f5' }}
        >
          <Scene />
        </Canvas>
      </Box>
    </Paper>
  );
};

export default Surface3DPlot;
