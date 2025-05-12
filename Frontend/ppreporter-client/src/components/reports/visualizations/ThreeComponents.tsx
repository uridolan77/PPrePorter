import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DataPoint3D } from './Interactive3DChart';

interface SceneProps {
  normalizedData: any[];
  autoRotate: boolean;
  rotationSpeed: number;
  enableZoom: boolean;
  enableRotation: boolean;
  enableGrid: boolean;
  enableAxes: boolean;
  enableLabels: boolean;
  darkMode: boolean;
  xLabel: string;
  yLabel: string;
  zLabel: string;
  chartType: '3dScatter' | '3dBar' | '3dSurface';
  getPointColor: (point: DataPoint3D) => string;
  getPointSize: (point: DataPoint3D) => number;
  handlePointClick: (point: DataPoint3D) => void;
  selectedPoint: DataPoint3D | null;
  hoveredPoint: DataPoint3D | null;
  setHoveredPoint: (point: DataPoint3D | null) => void;
}

// Scene component
const Scene: React.FC<SceneProps> = ({
  normalizedData,
  autoRotate,
  rotationSpeed,
  enableZoom,
  enableRotation,
  enableGrid,
  enableAxes,
  enableLabels,
  darkMode,
  xLabel,
  yLabel,
  zLabel,
  chartType,
  getPointColor,
  getPointSize,
  handlePointClick,
  selectedPoint,
  hoveredPoint,
  setHoveredPoint
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>();
  const theme = useThree().gl.domElement.parentElement?.parentElement?.getAttribute('data-theme') === 'dark' 
    ? { palette: { primary: { main: '#90caf9' }, success: { main: '#66bb6a' }, error: { main: '#f44336' } } }
    : { palette: { primary: { main: '#1976d2' }, success: { main: '#2e7d32' }, error: { main: '#d32f2f' } } };

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
            {yLabel}
          </Text>

          <Text
            position={[-5, -5, 6]}
            color={theme.palette.primary.main}
            fontSize={0.5}
            anchorX="center"
            anchorY="middle"
          >
            {zLabel}
          </Text>
        </>
      )}

      {/* Data points */}
      {chartType === '3dScatter' && normalizedData.map((point) => (
        <mesh
          key={point.id}
          position={[point.normalizedX, point.normalizedY, point.normalizedZ]}
          scale={getPointSize(point)}
          onClick={() => handlePointClick(point)}
          onPointerOver={() => setHoveredPoint(point)}
          onPointerOut={() => setHoveredPoint(null)}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={getPointColor(point)}
            roughness={0.5}
            metalness={0.2}
            emissive={selectedPoint?.id === point.id ? '#ffffff' : '#000000'}
            emissiveIntensity={selectedPoint?.id === point.id ? 0.5 : 0}
          />

          {/* Label */}
          {enableLabels && (point.label || hoveredPoint?.id === point.id) && (
            <Html
              position={[0, 1.2, 0]}
              center
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {point.label || `(${point.x}, ${point.y}, ${point.z})`}
            </Html>
          )}
        </mesh>
      ))}

      {/* 3D Bars */}
      {chartType === '3dBar' && normalizedData.map((point) => (
        <mesh
          key={point.id}
          position={[
            point.normalizedX,
            (point.normalizedY + 5) / 2, // Position at half height
            point.normalizedZ
          ]}
          scale={[
            getPointSize(point),
            Math.max(0.1, point.normalizedY + 5), // Height based on Y value
            getPointSize(point)
          ]}
          onClick={() => handlePointClick(point)}
          onPointerOver={() => setHoveredPoint(point)}
          onPointerOut={() => setHoveredPoint(null)}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={getPointColor(point)}
            roughness={0.5}
            metalness={0.2}
            emissive={selectedPoint?.id === point.id ? '#ffffff' : '#000000'}
            emissiveIntensity={selectedPoint?.id === point.id ? 0.5 : 0}
          />

          {/* Label */}
          {enableLabels && (point.label || hoveredPoint?.id === point.id) && (
            <Html
              position={[0, (point.normalizedY + 5) / 2 + 0.6, 0]}
              center
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {point.label || `(${point.x}, ${point.y}, ${point.z})`}
            </Html>
          )}
        </mesh>
      ))}
    </>
  );
};

interface ThreeComponentsProps {
  normalizedData: any[];
  autoRotate: boolean;
  rotationSpeed: number;
  enableZoom: boolean;
  enableRotation: boolean;
  enableGrid: boolean;
  enableAxes: boolean;
  enableLabels: boolean;
  darkMode: boolean;
  xLabel: string;
  yLabel: string;
  zLabel: string;
  chartType: '3dScatter' | '3dBar' | '3dSurface';
  getPointColor: (point: DataPoint3D) => string;
  getPointSize: (point: DataPoint3D) => number;
  handlePointClick: (point: DataPoint3D) => void;
  selectedPoint: DataPoint3D | null;
  hoveredPoint: DataPoint3D | null;
  setHoveredPoint: (point: DataPoint3D | null) => void;
}

const ThreeComponents: React.FC<ThreeComponentsProps> = (props) => {
  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 60 }}
      style={{ background: props.darkMode ? '#111' : '#f5f5f5' }}
    >
      <Scene {...props} />
    </Canvas>
  );
};

export default ThreeComponents;
