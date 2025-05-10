import apiClient from './apiClient';
import { Metric, DataPoint, InsightType, Explanation } from '../../types/contextualExplanation';

/**
 * Parameters for contextual explanation request
 */
interface ContextualExplanationParams {
  metric: Metric;
  data: DataPoint[];
  insightType?: InsightType;
}

/**
 * Parameters for detailed analysis request
 */
interface DetailedAnalysisParams {
  metric: Metric;
  data: DataPoint[];
  analysisType: string;
}

/**
 * Parameters for insights with recommendations request
 */
interface InsightsRecommendationsParams {
  metric: Metric;
  data: DataPoint[];
}

/**
 * Sensitivity settings for anomaly detection
 */
interface SensitivitySettings {
  threshold?: number;
  windowSize?: number;
  method?: string;
}

/**
 * Parameters for anomaly detection request
 */
interface AnomalyDetectionParams {
  metric: Metric;
  data: DataPoint[];
  sensitivity?: SensitivitySettings;
}

/**
 * Parameters for forecast request
 */
interface ForecastParams {
  metric: Metric;
  data: DataPoint[];
  forecastPeriods: number;
}

/**
 * Forecast data point
 */
interface ForecastDataPoint extends DataPoint {
  confidence?: {
    lower: number;
    upper: number;
  };
  isForecast: boolean;
}

/**
 * Forecast response
 */
interface ForecastResponse {
  forecast: ForecastDataPoint[];
  accuracy: {
    mape?: number;
    rmse?: number;
    mae?: number;
  };
  model: string;
}

/**
 * Get contextual explanation for a metric
 * @param params - Request parameters
 * @returns Promise object with explanation data
 */
const getContextualExplanation = async (params: ContextualExplanationParams): Promise<Explanation> => {
  try {
    const response = await apiClient.post<Explanation>('/contextual/explain', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get detailed analysis for a metric
 * @param params - Request parameters
 * @returns Promise object with detailed analysis
 */
const getDetailedAnalysis = async (params: DetailedAnalysisParams): Promise<any> => {
  try {
    const response = await apiClient.post('/contextual/detailed-analysis', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get metric insights with recommendations
 * @param params - Request parameters
 * @returns Promise object with insights and recommendations
 */
const getInsightsWithRecommendations = async (params: InsightsRecommendationsParams): Promise<any> => {
  try {
    const response = await apiClient.post('/contextual/insights-recommendations', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get anomaly detection for a metric
 * @param params - Request parameters
 * @returns Promise object with detected anomalies
 */
const getAnomalyDetection = async (params: AnomalyDetectionParams): Promise<DataPoint[]> => {
  try {
    const response = await apiClient.post<DataPoint[]>('/contextual/anomaly-detection', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get forecast for a metric
 * @param params - Request parameters
 * @returns Promise object with forecast data
 */
const getForecast = async (params: ForecastParams): Promise<ForecastResponse> => {
  try {
    const response = await apiClient.post<ForecastResponse>('/contextual/forecast', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getContextualExplanation,
  getDetailedAnalysis,
  getInsightsWithRecommendations,
  getAnomalyDetection,
  getForecast
};
