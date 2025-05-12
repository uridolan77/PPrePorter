// Surface interpolation methods
export type SurfaceInterpolationMethod = 'nearest' | 'bilinear' | 'bicubic' | 'natural' | 'kriging';

// Surface data point interface
export interface SurfaceDataPoint {
  x: number;
  y: number;
  z: number;
  [key: string]: any;
}

// Surface vertex interface
export interface SurfaceVertex {
  x: number;
  y: number;
  z: number;
}

// Surface data interface
export interface SurfaceData {
  vertices: SurfaceVertex[];
  indices: number[];
}

/**
 * Interpolate a surface from scattered data points
 * @param data Array of data points with x, y, z coordinates
 * @param resolution Resolution of the interpolated surface grid
 * @param method Interpolation method to use
 * @param xRange Optional x-axis range [min, max]
 * @param yRange Optional y-axis range [min, max]
 * @returns Interpolated surface data with vertices and indices
 */
export const interpolateSurface = (
  data: SurfaceDataPoint[],
  resolution: number = 50,
  method: SurfaceInterpolationMethod = 'bilinear',
  xRange?: [number, number],
  yRange?: [number, number]
): SurfaceData => {
  // Determine x and y ranges
  const xMin = xRange ? xRange[0] : Math.min(...data.map(p => p.x));
  const xMax = xRange ? xRange[1] : Math.max(...data.map(p => p.x));
  const yMin = yRange ? yRange[0] : Math.min(...data.map(p => p.y));
  const yMax = yRange ? yRange[1] : Math.max(...data.map(p => p.y));

  // Create grid
  const vertices: SurfaceVertex[] = [];
  const indices: number[] = [];

  // Calculate step size
  const xStep = (xMax - xMin) / (resolution - 1);
  const yStep = (yMax - yMin) / (resolution - 1);

  // Generate vertices
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = xMin + i * xStep;
      const y = yMin + j * yStep;
      const z = interpolateZ(x, y, data, method);

      vertices.push({ x, y, z });
    }
  }

  // Generate indices for triangles
  for (let i = 0; i < resolution - 1; i++) {
    for (let j = 0; j < resolution - 1; j++) {
      const a = i * resolution + j;
      const b = i * resolution + j + 1;
      const c = (i + 1) * resolution + j;
      const d = (i + 1) * resolution + j + 1;

      // First triangle
      indices.push(a, b, c);

      // Second triangle
      indices.push(b, d, c);
    }
  }

  return { vertices, indices };
};

/**
 * Interpolate z value at a given (x, y) point using the specified method
 * @param x X coordinate
 * @param y Y coordinate
 * @param data Array of data points
 * @param method Interpolation method
 * @returns Interpolated z value
 */
const interpolateZ = (
  x: number,
  y: number,
  data: SurfaceDataPoint[],
  method: SurfaceInterpolationMethod
): number => {
  switch (method) {
    case 'nearest':
      return nearestNeighborInterpolation(x, y, data);
    case 'bilinear':
      return bilinearInterpolation(x, y, data);
    case 'bicubic':
      return bicubicInterpolation(x, y, data);
    case 'natural':
      return naturalNeighborInterpolation(x, y, data);
    case 'kriging':
      return krigingInterpolation(x, y, data);
    default:
      return bilinearInterpolation(x, y, data);
  }
};

/**
 * Nearest neighbor interpolation
 * @param x X coordinate
 * @param y Y coordinate
 * @param data Array of data points
 * @returns Interpolated z value
 */
const nearestNeighborInterpolation = (
  x: number,
  y: number,
  data: SurfaceDataPoint[]
): number => {
  // Find the nearest data point
  let minDistance = Infinity;
  let nearestZ = 0;

  for (const point of data) {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));

    if (distance < minDistance) {
      minDistance = distance;
      nearestZ = point.z;
    }
  }

  return nearestZ;
};

/**
 * Bilinear interpolation
 * @param x X coordinate
 * @param y Y coordinate
 * @param data Array of data points
 * @returns Interpolated z value
 */
const bilinearInterpolation = (
  x: number,
  y: number,
  data: SurfaceDataPoint[]
): number => {
  // Find the 4 nearest points
  const distances: Array<{ distance: number; point: SurfaceDataPoint }> = [];

  for (const point of data) {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
    distances.push({ distance, point });
  }

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);

  // If we have less than 4 points, use nearest neighbor
  if (distances.length < 4) {
    return distances[0].point.z;
  }

  // Get the 4 nearest points
  const nearestPoints = distances.slice(0, 4).map(d => d.point);

  // Check if the point is exactly on a data point
  if (distances[0].distance < 1e-10) {
    return distances[0].point.z;
  }

  // Calculate weights based on inverse distance
  const weights = distances.slice(0, 4).map(d => 1 / Math.max(d.distance, 1e-10));
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  // Calculate weighted average
  let z = 0;
  for (let i = 0; i < 4; i++) {
    z += (weights[i] / weightSum) * nearestPoints[i].z;
  }

  return z;
};

/**
 * Bicubic interpolation
 * @param x X coordinate
 * @param y Y coordinate
 * @param data Array of data points
 * @returns Interpolated z value
 */
const bicubicInterpolation = (
  x: number,
  y: number,
  data: SurfaceDataPoint[]
): number => {
  // Find the 16 nearest points
  const distances: Array<{ distance: number; point: SurfaceDataPoint }> = [];

  for (const point of data) {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
    distances.push({ distance, point });
  }

  // Sort by distance
  distances.sort((a, b) => a.distance - b.distance);

  // If we have less than 16 points, use bilinear interpolation
  if (distances.length < 16) {
    return bilinearInterpolation(x, y, data);
  }

  // Check if the point is exactly on a data point
  if (distances[0].distance < 1e-10) {
    return distances[0].point.z;
  }

  // Get the 16 nearest points
  const nearestPoints = distances.slice(0, 16).map(d => d.point);

  // Calculate weights based on inverse distance cubed (gives more weight to closer points)
  const weights = distances.slice(0, 16).map(d => 1 / Math.pow(Math.max(d.distance, 1e-10), 3));
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  // Calculate weighted average
  let z = 0;
  for (let i = 0; i < 16; i++) {
    z += (weights[i] / weightSum) * nearestPoints[i].z;
  }

  return z;
};

/**
 * Natural neighbor interpolation
 * @param x X coordinate
 * @param y Y coordinate
 * @param data Array of data points
 * @returns Interpolated z value
 */
const naturalNeighborInterpolation = (
  x: number,
  y: number,
  data: SurfaceDataPoint[]
): number => {
  // This is a simplified version of natural neighbor interpolation
  // A full implementation would require Voronoi diagrams

  // Find all points within a certain radius
  const radius = calculateAverageDistance(data) * 2;
  const neighbors: Array<{ distance: number; point: SurfaceDataPoint }> = [];

  for (const point of data) {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
    if (distance <= radius) {
      neighbors.push({ distance, point });
    }
  }

  // If no neighbors found, use nearest neighbor
  if (neighbors.length === 0) {
    return nearestNeighborInterpolation(x, y, data);
  }

  // Check if the point is exactly on a data point
  if (neighbors[0].distance < 1e-10) {
    return neighbors[0].point.z;
  }

  // Calculate weights based on inverse squared distance
  const weights = neighbors.map(n => 1 / Math.pow(Math.max(n.distance, 1e-10), 2));
  const weightSum = weights.reduce((sum, w) => sum + w, 0);

  // Calculate weighted average
  let z = 0;
  for (let i = 0; i < neighbors.length; i++) {
    z += (weights[i] / weightSum) * neighbors[i].point.z;
  }

  return z;
};

/**
 * Kriging interpolation
 * @param x X coordinate
 * @param y Y coordinate
 * @param data Array of data points
 * @returns Interpolated z value
 */
const krigingInterpolation = (
  x: number,
  y: number,
  data: SurfaceDataPoint[]
): number => {
  // This is a simplified version of kriging interpolation
  // A full implementation would be much more complex

  // Find all points within a certain radius
  const radius = calculateAverageDistance(data) * 3;
  const neighbors: Array<{ distance: number; point: SurfaceDataPoint }> = [];

  for (const point of data) {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
    if (distance <= radius) {
      neighbors.push({ distance, point });
    }
  }

  // If no neighbors found, use nearest neighbor
  if (neighbors.length === 0) {
    return nearestNeighborInterpolation(x, y, data);
  }

  // Check if the point is exactly on a data point
  if (neighbors[0].distance < 1e-10) {
    return neighbors[0].point.z;
  }

  // Use inverse distance weighting as a simple approximation
  return bilinearInterpolation(x, y, data);
};

/**
 * Calculate average distance between data points
 * @param data Array of data points
 * @returns Average distance
 */
const calculateAverageDistance = (data: SurfaceDataPoint[]): number => {
  if (data.length <= 1) return 1;

  let totalDistance = 0;
  let count = 0;

  // Sample a subset of points for efficiency
  const sampleSize = Math.min(data.length, 100);
  const step = Math.max(1, Math.floor(data.length / sampleSize));

  for (let i = 0; i < data.length; i += step) {
    const p1 = data[i];

    for (let j = i + step; j < data.length; j += step) {
      const p2 = data[j];
      const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      totalDistance += distance;
      count++;
    }
  }

  return count > 0 ? totalDistance / count : 1;
};
