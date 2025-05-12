// Predictive surface worker
// This worker runs predictive modeling algorithms in a separate thread

import { SurfaceDataPoint } from '../components/reports/visualizations/Surface3DPlot';
import {
  PredictionModelType,
  PredictionModelOptions,
  PredictionResult,
  createPredictiveModel,
  generatePredictions,
  evaluateModel,
  generateConfidenceIntervals,
  generateForecast
} from '../utils/predictiveSurfaceUtils';

// Message types
export type PredictiveSurfaceWorkerInputMessage = {
  type: 'create_model' | 'generate_predictions' | 'evaluate_model' | 'generate_confidence_intervals' | 'generate_forecast';
  data: SurfaceDataPoint[];
  options: PredictionModelOptions;
  xRange?: [number, number];
  yRange?: [number, number];
  resolution?: number;
  confidenceLevel?: number;
  periods?: number;
  requestId: string;
};

export type PredictiveSurfaceWorkerOutputMessage = {
  type: 'model_created' | 'predictions_generated' | 'model_evaluated' | 'confidence_intervals_generated' | 'forecast_generated' | 'progress_update' | 'error';
  model?: any;
  predictions?: SurfaceDataPoint[];
  evaluation?: { r2: number; mse: number; mae: number };
  confidenceIntervals?: { upper: SurfaceDataPoint[]; lower: SurfaceDataPoint[]; level: number };
  forecast?: SurfaceDataPoint[];
  progress?: number;
  error?: string;
  requestId: string;
};

// Handle messages from the main thread
self.onmessage = (event: MessageEvent<PredictiveSurfaceWorkerInputMessage>) => {
  const { type, data, options, xRange, yRange, resolution, confidenceLevel, periods, requestId } = event.data;
  
  try {
    // Send initial progress update
    sendProgressUpdate(0, requestId);
    
    switch (type) {
      case 'create_model':
        handleCreateModel(data, options, requestId);
        break;
      case 'generate_predictions':
        handleGeneratePredictions(data, options, xRange, yRange, resolution, requestId);
        break;
      case 'evaluate_model':
        handleEvaluateModel(data, options, requestId);
        break;
      case 'generate_confidence_intervals':
        handleGenerateConfidenceIntervals(data, options, xRange, yRange, resolution, confidenceLevel, requestId);
        break;
      case 'generate_forecast':
        handleGenerateForecast(data, periods || 5, options, requestId);
        break;
      default:
        sendError(`Unknown message type: ${type}`, requestId);
    }
  } catch (error) {
    sendError((error as Error).message, requestId);
  }
};

/**
 * Handle create model message
 * @param data Training data points
 * @param options Model options
 * @param requestId Request ID
 */
function handleCreateModel(
  data: SurfaceDataPoint[],
  options: PredictionModelOptions,
  requestId: string
): void {
  // Check if we have enough data
  if (data.length < 10) {
    sendError('Not enough data points for modeling (minimum 10 required)', requestId);
    return;
  }
  
  sendProgressUpdate(20, requestId);
  
  // Create model
  const modelFn = createPredictiveModel(data, options);
  
  sendProgressUpdate(80, requestId);
  
  // We can't directly transfer the function, so we'll just acknowledge it was created
  // The actual model will be recreated in the main thread when needed
  const message: PredictiveSurfaceWorkerOutputMessage = {
    type: 'model_created',
    requestId
  };
  
  sendProgressUpdate(100, requestId);
  self.postMessage(message);
}

/**
 * Handle generate predictions message
 * @param data Training data points
 * @param options Model options
 * @param xRange X-axis range
 * @param yRange Y-axis range
 * @param resolution Grid resolution
 * @param requestId Request ID
 */
function handleGeneratePredictions(
  data: SurfaceDataPoint[],
  options: PredictionModelOptions,
  xRange?: [number, number],
  yRange?: [number, number],
  resolution?: number,
  requestId?: string
): void {
  if (!requestId) return;
  
  // Check if we have enough data
  if (data.length < 10) {
    sendError('Not enough data points for predictions (minimum 10 required)', requestId);
    return;
  }
  
  sendProgressUpdate(20, requestId);
  
  // Create model
  const modelFn = createPredictiveModel(data, options);
  
  sendProgressUpdate(50, requestId);
  
  // Determine ranges if not provided
  const xValues = data.map(p => p.x);
  const yValues = data.map(p => p.y);
  
  const actualXRange: [number, number] = xRange || [
    Math.min(...xValues),
    Math.max(...xValues)
  ];
  
  const actualYRange: [number, number] = yRange || [
    Math.min(...yValues),
    Math.max(...yValues)
  ];
  
  sendProgressUpdate(60, requestId);
  
  // Generate predictions
  const predictions = generatePredictions(
    modelFn,
    actualXRange,
    actualYRange,
    resolution || 20
  );
  
  sendProgressUpdate(90, requestId);
  
  // Send predictions
  const message: PredictiveSurfaceWorkerOutputMessage = {
    type: 'predictions_generated',
    predictions,
    requestId
  };
  
  sendProgressUpdate(100, requestId);
  self.postMessage(message);
}

/**
 * Handle evaluate model message
 * @param data Test data points
 * @param options Model options
 * @param requestId Request ID
 */
function handleEvaluateModel(
  data: SurfaceDataPoint[],
  options: PredictionModelOptions,
  requestId: string
): void {
  // Check if we have enough data
  if (data.length < 10) {
    sendError('Not enough data points for evaluation (minimum 10 required)', requestId);
    return;
  }
  
  sendProgressUpdate(20, requestId);
  
  // Split data into training and test sets (80/20 split)
  const shuffledData = [...data].sort(() => Math.random() - 0.5);
  const splitIndex = Math.floor(shuffledData.length * 0.8);
  const trainingData = shuffledData.slice(0, splitIndex);
  const testData = shuffledData.slice(splitIndex);
  
  sendProgressUpdate(40, requestId);
  
  // Create model
  const modelFn = createPredictiveModel(trainingData, options);
  
  sendProgressUpdate(60, requestId);
  
  // Evaluate model
  const evaluation = evaluateModel(modelFn, testData);
  
  sendProgressUpdate(80, requestId);
  
  // Send evaluation
  const message: PredictiveSurfaceWorkerOutputMessage = {
    type: 'model_evaluated',
    evaluation,
    requestId
  };
  
  sendProgressUpdate(100, requestId);
  self.postMessage(message);
}

/**
 * Handle generate confidence intervals message
 * @param data Training data points
 * @param options Model options
 * @param xRange X-axis range
 * @param yRange Y-axis range
 * @param resolution Grid resolution
 * @param confidenceLevel Confidence level (0-1)
 * @param requestId Request ID
 */
function handleGenerateConfidenceIntervals(
  data: SurfaceDataPoint[],
  options: PredictionModelOptions,
  xRange?: [number, number],
  yRange?: [number, number],
  resolution?: number,
  confidenceLevel?: number,
  requestId?: string
): void {
  if (!requestId) return;
  
  // Check if we have enough data
  if (data.length < 10) {
    sendError('Not enough data points for confidence intervals (minimum 10 required)', requestId);
    return;
  }
  
  sendProgressUpdate(20, requestId);
  
  // Create model
  const modelFn = createPredictiveModel(data, options);
  
  sendProgressUpdate(40, requestId);
  
  // Determine ranges if not provided
  const xValues = data.map(p => p.x);
  const yValues = data.map(p => p.y);
  
  const actualXRange: [number, number] = xRange || [
    Math.min(...xValues),
    Math.max(...xValues)
  ];
  
  const actualYRange: [number, number] = yRange || [
    Math.min(...yValues),
    Math.max(...yValues)
  ];
  
  sendProgressUpdate(50, requestId);
  
  // Generate predictions
  const predictions = generatePredictions(
    modelFn,
    actualXRange,
    actualYRange,
    resolution || 20
  );
  
  sendProgressUpdate(70, requestId);
  
  // Generate confidence intervals
  const confidenceIntervals = generateConfidenceIntervals(
    modelFn,
    data,
    predictions,
    confidenceLevel || 0.95
  );
  
  sendProgressUpdate(90, requestId);
  
  // Send confidence intervals
  const message: PredictiveSurfaceWorkerOutputMessage = {
    type: 'confidence_intervals_generated',
    confidenceIntervals,
    requestId
  };
  
  sendProgressUpdate(100, requestId);
  self.postMessage(message);
}

/**
 * Handle generate forecast message
 * @param data Time series data points
 * @param periods Number of periods to forecast
 * @param options Model options
 * @param requestId Request ID
 */
function handleGenerateForecast(
  data: SurfaceDataPoint[],
  periods: number,
  options: PredictionModelOptions,
  requestId: string
): void {
  // Check if we have enough data
  if (data.length < 10) {
    sendError('Not enough data points for forecasting (minimum 10 required)', requestId);
    return;
  }
  
  sendProgressUpdate(20, requestId);
  
  // Sort data by x (time)
  const sortedData = [...data].sort((a, b) => a.x - b.x);
  
  sendProgressUpdate(40, requestId);
  
  // Generate forecast
  const forecast = generateForecast(sortedData, periods, options);
  
  sendProgressUpdate(80, requestId);
  
  // Send forecast
  const message: PredictiveSurfaceWorkerOutputMessage = {
    type: 'forecast_generated',
    forecast,
    requestId
  };
  
  sendProgressUpdate(100, requestId);
  self.postMessage(message);
}

/**
 * Send progress update to main thread
 * @param progress Progress percentage (0-100)
 * @param requestId Request ID
 */
function sendProgressUpdate(progress: number, requestId: string): void {
  const message: PredictiveSurfaceWorkerOutputMessage = {
    type: 'progress_update',
    progress,
    requestId
  };
  
  self.postMessage(message);
}

/**
 * Send error to main thread
 * @param errorMessage Error message
 * @param requestId Request ID
 */
function sendError(errorMessage: string, requestId: string): void {
  const message: PredictiveSurfaceWorkerOutputMessage = {
    type: 'error',
    error: errorMessage,
    requestId
  };
  
  self.postMessage(message);
}
