import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SurfaceDataPoint } from './Surface3DPlot';
import { SurfaceInterpolationMethod } from '../../../components/utils/interpolationUtils';
import { Theme } from '@mui/material';

interface SceneProps {
  data: SurfaceDataPoint[];
  autoRotate: boolean;
  rotationSpeed: number;
  enableZoom: boolean;
  enableRotation: boolean;
  enableGrid: boolean;
  enableAxes: boolean;
  darkMode: boolean;
  xLabel: string;
  yLabel: string;
  zLabel: string;
  surfaceResolution: number;
  selectedInterpolation: SurfaceInterpolationMethod;
  showWireframe: boolean;
  selectedColorMap: string;
  xRange?: [number, number];
  yRange?: [number, number];
  onPointClick?: (point: SurfaceDataPoint) => void;
  theme: Theme;
}

// Scene component
const Scene: React.FC<SceneProps> = ({
  data,
  autoRotate,
  rotationSpeed,
  enableZoom,
  enableRotation,
  enableGrid,
  enableAxes,
  darkMode,
  xLabel,
  yLabel,
  zLabel,
  surfaceResolution,
  selectedInterpolation,
  showWireframe,
  selectedColorMap,
  xRange,
  yRange,
  onPointClick,
  theme
}) => {
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

    // Mock interpolation function for now
    // In a real implementation, this would call the actual interpolation function
    const mockInterpolateSurface = (
      data: SurfaceDataPoint[],
      resolution: number,
      method: string,
      xRange: [number, number],
      yRange: [number, number]
    ) => {
      // Create a simple grid for demonstration
      const vertices: { x: number; y: number; z: number }[] = [];
      const indices: number[] = [];
      
      const xStep = (xRange[1] - xRange[0]) / resolution;
      const yStep = (yRange[1] - yRange[0]) / resolution;
      
      // Generate vertices
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const x = xRange[0] + i * xStep;
          const y = yRange[0] + j * yStep;
          
          // Simple function for z (can be replaced with actual interpolation)
          let z = 0;
          let totalWeight = 0;
          
          // Simple inverse distance weighting
          data.forEach(point => {
            const dx = point.x - x;
            const dy = point.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 0.001) {
              z = point.z;
              totalWeight = 1;
            } else {
              const weight = 1 / (distance * distance);
              z += point.z * weight;
              totalWeight += weight;
            }
          });
          
          if (totalWeight > 0) {
            z /= totalWeight;
          }
          
          vertices.push({ x, y, z });
        }
      }
      
      // Generate indices for triangles
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const a = i * (resolution + 1) + j;
          const b = i * (resolution + 1) + j + 1;
          const c = (i + 1) * (resolution + 1) + j;
          const d = (i + 1) * (resolution + 1) + j + 1;
          
          // First triangle
          indices.push(a, b, c);
          
          // Second triangle
          indices.push(b, d, c);
        }
      }
      
      return { vertices, indices };
    };

    // Interpolate surface
    const surface = mockInterpolateSurface(
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
      const normalizedZ = (z - zMin) / (zMax - zMin || 1);

      // Apply color map
      let r = 0, g = 0, b = 0;

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

interface ThreeSurfaceComponentsProps {
  data: SurfaceDataPoint[];
  autoRotate: boolean;
  rotationSpeed: number;
  enableZoom: boolean;
  enableRotation: boolean;
  enableGrid: boolean;
  enableAxes: boolean;
  darkMode: boolean;
  xLabel: string;
  yLabel: string;
  zLabel: string;
  surfaceResolution: number;
  selectedInterpolation: SurfaceInterpolationMethod;
  showWireframe: boolean;
  selectedColorMap: string;
  xRange?: [number, number];
  yRange?: [number, number];
  onPointClick?: (point: SurfaceDataPoint) => void;
  theme: Theme;
}

const ThreeSurfaceComponents: React.FC<ThreeSurfaceComponentsProps> = (props) => {
  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 60 }}
      style={{ background: props.darkMode ? '#111' : '#f5f5f5' }}
    >
      <Scene {...props} />
    </Canvas>
  );
};

export default ThreeSurfaceComponents;
