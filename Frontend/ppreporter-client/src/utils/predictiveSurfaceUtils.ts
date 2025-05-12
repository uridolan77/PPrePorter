import { SurfaceDataPoint } from '../components/reports/visualizations/Surface3DPlot';

// Prediction model types
export type PredictionModelType = 'linear' | 'polynomial' | 'rbf' | 'gaussian' | 'exponential';

// Prediction model options
export interface PredictionModelOptions {
  modelType: PredictionModelType;
  degree?: number; // For polynomial regression
  kernelWidth?: number; // For RBF and Gaussian
  regularization?: number; // Regularization parameter
  includeConfidenceIntervals?: boolean; // Whether to include confidence intervals
  confidenceLevel?: number; // Confidence level (0-1)
  forecastPeriods?: number; // Number of periods to forecast (for time series)
  seasonalityPeriod?: number; // Seasonality period (for time series)
}

// Prediction result
export interface PredictionResult {
  predictedPoints: SurfaceDataPoint[];
  modelParameters: any;
  metrics: {
    r2: number; // R-squared
    mse: number; // Mean squared error
    mae: number; // Mean absolute error
  };
  confidenceIntervals?: {
    upper: SurfaceDataPoint[];
    lower: SurfaceDataPoint[];
    level: number;
  };
}

/**
 * Create a predictive surface model
 * @param data Training data points
 * @param options Model options
 * @returns Prediction model function
 */
export const createPredictiveModel = (
  data: SurfaceDataPoint[],
  options: PredictionModelOptions
): (x: number, y: number) => number => {
  const { modelType, degree = 2, kernelWidth = 1.0, regularization = 0.1 } = options;
  
  switch (modelType) {
    case 'linear':
      return createLinearModel(data, regularization);
    case 'polynomial':
      return createPolynomialModel(data, degree, regularization);
    case 'rbf':
      return createRBFModel(data, kernelWidth, regularization);
    case 'gaussian':
      return createGaussianProcessModel(data, kernelWidth, regularization);
    case 'exponential':
      return createExponentialModel(data, regularization);
    default:
      return createLinearModel(data, regularization);
  }
};

/**
 * Generate predictions for a grid of points
 * @param model Prediction model function
 * @param xRange X-axis range [min, max]
 * @param yRange Y-axis range [min, max]
 * @param resolution Grid resolution
 * @returns Array of predicted data points
 */
export const generatePredictions = (
  model: (x: number, y: number) => number,
  xRange: [number, number],
  yRange: [number, number],
  resolution: number = 20
): SurfaceDataPoint[] => {
  const predictions: SurfaceDataPoint[] = [];
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  
  const xStep = (xMax - xMin) / (resolution - 1);
  const yStep = (yMax - yMin) / (resolution - 1);
  
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = xMin + i * xStep;
      const y = yMin + j * yStep;
      const z = model(x, y);
      
      predictions.push({ x, y, z, predicted: true });
    }
  }
  
  return predictions;
};

/**
 * Create a linear regression model
 * @param data Training data points
 * @param regularization Regularization parameter
 * @returns Linear model function
 */
const createLinearModel = (
  data: SurfaceDataPoint[],
  regularization: number
): (x: number, y: number) => number => {
  // Prepare training data
  const X: number[][] = data.map(point => [1, point.x, point.y]); // Add bias term
  const y: number[] = data.map(point => point.z);
  
  // Solve for coefficients using normal equations with regularization
  // (X^T X + λI)^(-1) X^T y
  const XtX = matrixMultiply(transpose(X), X);
  
  // Add regularization to diagonal (except bias term)
  for (let i = 1; i < XtX.length; i++) {
    XtX[i][i] += regularization;
  }
  
  const XtXinv = matrixInverse(XtX);
  const Xty = matrixVectorMultiply(transpose(X), y);
  const coefficients = matrixVectorMultiply(XtXinv, Xty);
  
  // Create prediction function
  return (x: number, y: number) => {
    return coefficients[0] + coefficients[1] * x + coefficients[2] * y;
  };
};

/**
 * Create a polynomial regression model
 * @param data Training data points
 * @param degree Polynomial degree
 * @param regularization Regularization parameter
 * @returns Polynomial model function
 */
const createPolynomialModel = (
  data: SurfaceDataPoint[],
  degree: number,
  regularization: number
): (x: number, y: number) => number => {
  // Generate polynomial features
  const X: number[][] = [];
  
  for (const point of data) {
    const features = [1]; // Bias term
    
    for (let d = 1; d <= degree; d++) {
      for (let px = 0; px <= d; px++) {
        const py = d - px;
        features.push(Math.pow(point.x, px) * Math.pow(point.y, py));
      }
    }
    
    X.push(features);
  }
  
  const y: number[] = data.map(point => point.z);
  
  // Solve for coefficients using normal equations with regularization
  const XtX = matrixMultiply(transpose(X), X);
  
  // Add regularization to diagonal (except bias term)
  for (let i = 1; i < XtX.length; i++) {
    XtX[i][i] += regularization;
  }
  
  const XtXinv = matrixInverse(XtX);
  const Xty = matrixVectorMultiply(transpose(X), y);
  const coefficients = matrixVectorMultiply(XtXinv, Xty);
  
  // Create prediction function
  return (x: number, y: number) => {
    let prediction = coefficients[0]; // Bias term
    let featureIndex = 1;
    
    for (let d = 1; d <= degree; d++) {
      for (let px = 0; px <= d; px++) {
        const py = d - px;
        prediction += coefficients[featureIndex++] * Math.pow(x, px) * Math.pow(y, py);
      }
    }
    
    return prediction;
  };
};

/**
 * Create a Radial Basis Function (RBF) model
 * @param data Training data points
 * @param kernelWidth Kernel width parameter
 * @param regularization Regularization parameter
 * @returns RBF model function
 */
const createRBFModel = (
  data: SurfaceDataPoint[],
  kernelWidth: number,
  regularization: number
): (x: number, y: number) => number => {
  // Compute kernel matrix
  const n = data.length;
  const K: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dist2 = Math.pow(data[i].x - data[j].x, 2) + Math.pow(data[i].y - data[j].y, 2);
      K[i][j] = Math.exp(-dist2 / (2 * Math.pow(kernelWidth, 2)));
    }
  }
  
  // Add regularization to diagonal
  for (let i = 0; i < n; i++) {
    K[i][i] += regularization;
  }
  
  // Solve for weights
  const y: number[] = data.map(point => point.z);
  const Kinv = matrixInverse(K);
  const weights = matrixVectorMultiply(Kinv, y);
  
  // Create prediction function
  return (x: number, y: number) => {
    let prediction = 0;
    
    for (let i = 0; i < n; i++) {
      const dist2 = Math.pow(x - data[i].x, 2) + Math.pow(y - data[i].y, 2);
      const kernel = Math.exp(-dist2 / (2 * Math.pow(kernelWidth, 2)));
      prediction += weights[i] * kernel;
    }
    
    return prediction;
  };
};

/**
 * Create a Gaussian Process model
 * @param data Training data points
 * @param kernelWidth Kernel width parameter
 * @param regularization Regularization parameter
 * @returns Gaussian Process model function
 */
const createGaussianProcessModel = (
  data: SurfaceDataPoint[],
  kernelWidth: number,
  regularization: number
): (x: number, y: number) => number => {
  // This is a simplified Gaussian Process implementation
  // In practice, you would use a more sophisticated GP library
  
  // Compute kernel matrix (same as RBF)
  const n = data.length;
  const K: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dist2 = Math.pow(data[i].x - data[j].x, 2) + Math.pow(data[i].y - data[j].y, 2);
      K[i][j] = Math.exp(-dist2 / (2 * Math.pow(kernelWidth, 2)));
    }
  }
  
  // Add regularization to diagonal
  for (let i = 0; i < n; i++) {
    K[i][i] += regularization;
  }
  
  // Solve for weights
  const y: number[] = data.map(point => point.z);
  const Kinv = matrixInverse(K);
  const weights = matrixVectorMultiply(Kinv, y);
  
  // Create prediction function (mean prediction only, no variance)
  return (x: number, y: number) => {
    let prediction = 0;
    
    for (let i = 0; i < n; i++) {
      const dist2 = Math.pow(x - data[i].x, 2) + Math.pow(y - data[i].y, 2);
      const kernel = Math.exp(-dist2 / (2 * Math.pow(kernelWidth, 2)));
      prediction += weights[i] * kernel;
    }
    
    return prediction;
  };
};

/**
 * Create an exponential model
 * @param data Training data points
 * @param regularization Regularization parameter
 * @returns Exponential model function
 */
const createExponentialModel = (
  data: SurfaceDataPoint[],
  regularization: number
): (x: number, y: number) => number => {
  // Transform z values to log space
  const logData = data.map(point => ({
    ...point,
    z: Math.log(Math.max(point.z, 1e-10)) // Avoid log(0)
  }));
  
  // Fit linear model in log space
  const linearModel = createLinearModel(logData, regularization);
  
  // Create prediction function that transforms back to original space
  return (x: number, y: number) => {
    const logPrediction = linearModel(x, y);
    return Math.exp(logPrediction);
  };
};

/**
 * Evaluate a predictive model
 * @param model Prediction model function
 * @param testData Test data points
 * @returns Evaluation metrics
 */
export const evaluateModel = (
  model: (x: number, y: number) => number,
  testData: SurfaceDataPoint[]
): { r2: number; mse: number; mae: number } => {
  const n = testData.length;
  
  // Calculate predictions
  const predictions = testData.map(point => model(point.x, point.y));
  const actual = testData.map(point => point.z);
  
  // Calculate mean of actual values
  const mean = actual.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate total sum of squares
  const tss = actual.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
  
  // Calculate residual sum of squares
  let rss = 0;
  let absError = 0;
  
  for (let i = 0; i < n; i++) {
    rss += Math.pow(actual[i] - predictions[i], 2);
    absError += Math.abs(actual[i] - predictions[i]);
  }
  
  // Calculate metrics
  const r2 = 1 - (rss / tss);
  const mse = rss / n;
  const mae = absError / n;
  
  return { r2, mse, mae };
};

/**
 * Generate confidence intervals for predictions
 * @param model Prediction model function
 * @param data Training data points
 * @param predictions Predicted data points
 * @param confidenceLevel Confidence level (0-1)
 * @returns Confidence intervals
 */
export const generateConfidenceIntervals = (
  model: (x: number, y: number) => number,
  data: SurfaceDataPoint[],
  predictions: SurfaceDataPoint[],
  confidenceLevel: number = 0.95
): { upper: SurfaceDataPoint[]; lower: SurfaceDataPoint[]; level: number } => {
  // Calculate residuals on training data
  const residuals = data.map(point => point.z - model(point.x, point.y));
  
  // Calculate standard deviation of residuals
  const n = residuals.length;
  const mean = residuals.reduce((sum, val) => sum + val, 0) / n;
  const variance = residuals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  
  // Calculate z-score for the given confidence level
  const alpha = 1 - confidenceLevel;
  const zScore = 1.96; // Approximation for 95% confidence
  
  // Generate confidence intervals
  const margin = zScore * stdDev;
  
  const upper = predictions.map(point => ({
    ...point,
    z: point.z + margin,
    isConfidenceBound: true,
    isUpper: true
  }));
  
  const lower = predictions.map(point => ({
    ...point,
    z: point.z - margin,
    isConfidenceBound: true,
    isLower: true
  }));
  
  return { upper, lower, level: confidenceLevel };
};

/**
 * Generate forecast for time series data
 * @param data Time series data points (x should be time)
 * @param periods Number of periods to forecast
 * @param options Forecast options
 * @returns Forecasted data points
 */
export const generateForecast = (
  data: SurfaceDataPoint[],
  periods: number,
  options: PredictionModelOptions
): SurfaceDataPoint[] => {
  // Sort data by x (time)
  const sortedData = [...data].sort((a, b) => a.x - b.x);
  
  // Create predictive model
  const model = createPredictiveModel(sortedData, options);
  
  // Get last time point
  const lastPoint = sortedData[sortedData.length - 1];
  const timeStep = sortedData[sortedData.length - 1].x - sortedData[sortedData.length - 2].x;
  
  // Generate forecast
  const forecast: SurfaceDataPoint[] = [];
  
  for (let i = 1; i <= periods; i++) {
    const x = lastPoint.x + i * timeStep;
    const y = lastPoint.y; // Assume y is constant for time series
    const z = model(x, y);
    
    forecast.push({
      x,
      y,
      z,
      predicted: true,
      isForecast: true
    });
  }
  
  return forecast;
};

// Matrix operations

/**
 * Transpose a matrix
 * @param matrix Input matrix
 * @returns Transposed matrix
 */
const transpose = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = Array(cols).fill(0).map(() => Array(rows).fill(0));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  
  return result;
};

/**
 * Multiply two matrices
 * @param a First matrix
 * @param b Second matrix
 * @returns Product matrix
 */
const matrixMultiply = (a: number[][], b: number[][]): number[][] => {
  const rowsA = a.length;
  const colsA = a[0].length;
  const colsB = b[0].length;
  const result: number[][] = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));
  
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  
  return result;
};

/**
 * Multiply a matrix by a vector
 * @param matrix Matrix
 * @param vector Vector
 * @returns Result vector
 */
const matrixVectorMultiply = (matrix: number[][], vector: number[]): number[] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[] = Array(rows).fill(0);
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i] += matrix[i][j] * vector[j];
    }
  }
  
  return result;
};

/**
 * Invert a matrix (simplified implementation for small matrices)
 * @param matrix Input matrix
 * @returns Inverted matrix
 */
const matrixInverse = (matrix: number[][]): number[][] => {
  const n = matrix.length;
  
  // For 1x1 matrix
  if (n === 1) {
    return [[1 / matrix[0][0]]];
  }
  
  // For 2x2 matrix
  if (n === 2) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det]
    ];
  }
  
  // For 3x3 matrix
  if (n === 3) {
    const a = matrix[0][0], b = matrix[0][1], c = matrix[0][2];
    const d = matrix[1][0], e = matrix[1][1], f = matrix[1][2];
    const g = matrix[2][0], h = matrix[2][1], i = matrix[2][2];
    
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    
    return [
      [(e * i - f * h) / det, (c * h - b * i) / det, (b * f - c * e) / det],
      [(f * g - d * i) / det, (a * i - c * g) / det, (c * d - a * f) / det],
      [(d * h - e * g) / det, (g * b - a * h) / det, (a * e - b * d) / det]
    ];
  }
  
  // For larger matrices, use a simplified approach
  // In practice, you would use a more robust method like LU decomposition
  const augmented = matrix.map((row, i) => {
    const augRow = [...row];
    for (let j = 0; j < n; j++) {
      augRow.push(i === j ? 1 : 0);
    }
    return augRow;
  });
  
  // Gaussian elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = j;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Scale pivot row
    const pivot = augmented[i][i];
    for (let j = i; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    // Eliminate other rows
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const factor = augmented[j][i];
        for (let k = i; k < 2 * n; k++) {
          augmented[j][k] -= factor * augmented[i][k];
        }
      }
    }
  }
  
  // Extract inverse
  return augmented.map(row => row.slice(n));
};
