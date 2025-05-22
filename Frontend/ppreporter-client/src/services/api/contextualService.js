import apiClient from './apiClient';

/**
 * Get contextual explanation for a metric
 * @param {Object} params - Request parameters
 * @param {Object} params.metric - Metric information
 * @param {Array} params.data - Metric data points
 * @param {string} params.insightType - Type of insight to generate
 * @returns {Promise} Promise object with explanation data
 */
const getContextualExplanation = async (params) => {
  try {
    const response = await apiClient.post('/contextual/explain', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get detailed analysis for a metric
 * @param {Object} params - Request parameters
 * @param {Object} params.metric - Metric information
 * @param {Array} params.data - Metric data points
 * @param {string} params.analysisType - Type of analysis
 * @returns {Promise} Promise object with detailed analysis
 */
const getDetailedAnalysis = async (params) => {
  try {
    const response = await apiClient.post('/contextual/detailed-analysis', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get metric insights with recommendations
 * @param {Object} params - Request parameters
 * @param {Object} params.metric - Metric information
 * @param {Array} params.data - Metric data points
 * @returns {Promise} Promise object with insights and recommendations
 */
const getInsightsWithRecommendations = async (params) => {
  try {
    const response = await apiClient.post('/contextual/insights-recommendations', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get anomaly detection for a metric
 * @param {Object} params - Request parameters
 * @param {Object} params.metric - Metric information
 * @param {Array} params.data - Metric data points
 * @param {Object} params.sensitivity - Sensitivity settings for anomaly detection
 * @returns {Promise} Promise object with detected anomalies
 */
const getAnomalyDetection = async (params) => {
  try {
    const response = await apiClient.post('/contextual/anomaly-detection', params);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get forecast for a metric
 * @param {Object} params - Request parameters
 * @param {Object} params.metric - Metric information
 * @param {Array} params.data - Metric data points
 * @param {number} params.forecastPeriods - Number of periods to forecast
 * @returns {Promise} Promise object with forecast data
 */
const getForecast = async (params) => {
  try {
    const response = await apiClient.post('/contextual/forecast', params);
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
