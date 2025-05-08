/**
 * Dashboard Analytics Service
 * Handles API communication for data storytelling features
 */

import axios from 'axios';

// Base API URL - should match your backend configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for handling dashboard analytics and data storytelling features
 */
class DashboardAnalyticsService {
  /**
   * Fetch personalized dashboard settings for the current user
   * @param {string} userId - The ID of the current user
   * @returns {Promise<Object>} - The user's dashboard settings
   */
  async getUserDashboardSettings(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/settings/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      throw error;
    }
  }

  /**
   * Save user's dashboard personalization settings
   * @param {string} userId - The ID of the current user
   * @param {Object} settings - The dashboard settings to save
   * @returns {Promise<Object>} - The saved settings
   */
  async saveDashboardSettings(userId, settings) {
    try {
      const response = await axios.post(`${API_BASE_URL}/dashboard/settings/${userId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Error saving dashboard settings:', error);
      throw error;
    }
  }

  /**
   * Get recommended dashboard components based on user profile and behavior
   * @param {string} userId - The ID of the current user
   * @param {Object} userProfile - User profile information including role and experience level
   * @returns {Promise<Array>} - Array of recommended components
   */
  async getRecommendedComponents(userId, userProfile) {
    try {
      const response = await axios.post(`${API_BASE_URL}/dashboard/recommendations`, {
        userId,
        ...userProfile
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching component recommendations:', error);
      throw error;
    }
  }

  /**
   * Fetch contextual explanations for dashboard metrics
   * @param {string} metricId - The ID of the metric to explain
   * @param {string} context - Optional context information (e.g., user role, experience level)
   * @returns {Promise<Object>} - Explanation data for the metric
   */
  async getMetricExplanation(metricId, context = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics/explanation/${metricId}`, {
        params: { ...context }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching metric explanation:', error);
      throw error;
    }
  }

  /**
   * Get annotations for a specific data point or metric
   * @param {string} metricId - The ID of the metric
   * @param {string} dateRange - Optional date range for annotations
   * @returns {Promise<Array>} - Array of annotations
   */
  async getAnnotations(metricId, dateRange) {
    try {
      const response = await axios.get(`${API_BASE_URL}/annotations`, {
        params: {
          metricId,
          dateRange
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw error;
    }
  }

  /**
   * Save an annotation for a data point
   * @param {Object} annotation - The annotation to save
   * @returns {Promise<Object>} - The saved annotation
   */
  async saveAnnotation(annotation) {
    try {
      const response = await axios.post(`${API_BASE_URL}/annotations`, annotation);
      return response.data;
    } catch (error) {
      console.error('Error saving annotation:', error);
      throw error;
    }
  }

  /**
   * Update an existing annotation
   * @param {string} annotationId - The ID of the annotation to update
   * @param {Object} annotation - The updated annotation data
   * @returns {Promise<Object>} - The updated annotation
   */
  async updateAnnotation(annotationId, annotation) {
    try {
      const response = await axios.put(`${API_BASE_URL}/annotations/${annotationId}`, annotation);
      return response.data;
    } catch (error) {
      console.error('Error updating annotation:', error);
      throw error;
    }
  }

  /**
   * Delete an annotation
   * @param {string} annotationId - The ID of the annotation to delete
   * @returns {Promise<boolean>} - Success indicator
   */
  async deleteAnnotation(annotationId) {
    try {
      await axios.delete(`${API_BASE_URL}/annotations/${annotationId}`);
      return true;
    } catch (error) {
      console.error('Error deleting annotation:', error);
      throw error;
    }
  }

  /**
   * Get trend analysis for a specific metric
   * @param {string} metricId - The ID of the metric
   * @param {string} dateRange - Date range for the trend analysis
   * @param {Object} options - Additional options for the analysis
   * @returns {Promise<Object>} - Trend analysis data
   */
  async getTrendAnalysis(metricId, dateRange, options = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/trends`, {
        params: {
          metricId,
          dateRange,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      throw error;
    }
  }

  /**
   * Get anomaly detection results for metrics
   * @param {Array} metricIds - The IDs of metrics to analyze
   * @param {string} dateRange - Date range for the analysis
   * @param {Object} options - Additional options for the analysis
   * @returns {Promise<Array>} - Detected anomalies
   */
  async getAnomalyDetection(metricIds, dateRange, options = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/analytics/anomalies`, {
        metricIds,
        dateRange,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching anomaly detection:', error);
      throw error;
    }
  }

  /**
   * Generate forecast for a specific metric
   * @param {string} metricId - The ID of the metric
   * @param {string} historyRange - Date range for historical data
   * @param {string} forecastHorizon - How far to forecast (e.g., '30d')
   * @param {Object} options - Additional options for the forecast
   * @returns {Promise<Object>} - Forecast data
   */
  async getMetricForecast(metricId, historyRange, forecastHorizon, options = {}) {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/forecast`, {
        params: {
          metricId,
          historyRange,
          forecastHorizon,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  }

  /**
   * Get generated insights for dashboard metrics
   * @param {Array} metricIds - The IDs of metrics to analyze
   * @param {string} dateRange - Date range for the analysis
   * @param {string} insightLevel - Detail level for insights (e.g., 'minimal', 'detailed')
   * @returns {Promise<Array>} - Generated insights
   */
  async getGeneratedInsights(metricIds, dateRange, insightLevel = 'moderate') {
    try {
      const response = await axios.post(`${API_BASE_URL}/analytics/insights`, {
        metricIds,
        dateRange,
        insightLevel
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching generated insights:', error);
      throw error;
    }
  }

  /**
   * Find correlations between different metrics
   * @param {Array} metricIds - The IDs of metrics to analyze
   * @param {string} dateRange - Date range for the analysis
   * @returns {Promise<Array>} - Correlation data
   */
  async findMetricCorrelations(metricIds, dateRange) {
    try {
      const response = await axios.post(`${API_BASE_URL}/analytics/correlations`, {
        metricIds,
        dateRange
      });
      return response.data;
    } catch (error) {
      console.error('Error finding metric correlations:', error);
      throw error;
    }
  }
}

// Create and export instance
const dashboardAnalyticsService = new DashboardAnalyticsService();
export default dashboardAnalyticsService;