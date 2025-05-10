/**
 * Dashboard Analytics Service
 * Handles API communication for data storytelling features
 */

import axios from 'axios';

// Base API URL - should match your backend configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Types for dashboard analytics service
 */
export interface DashboardParams {
  timeRange?: number;
  [key: string]: any;
}

export interface AnalyticsOptions {
  includeForecast?: boolean;
  forecastHorizon?: string;
  includeSeasonality?: boolean;
  [key: string]: any;
}

export interface Annotation {
  id: string;
  metricId: string;
  date: string;
  value: number;
  text: string;
  createdBy: string;
  createdAt: string;
  [key: string]: any;
}

export interface TrendData {
  OutlierPoints: OutlierPoint[];
  ForecastData?: OutlierPoint[];
  TrendDirection: string;
  PercentageChange: number;
  SeasonalityDetected: boolean;
  Seasonality?: any;
  IdentifiedPatterns?: Pattern[];
  [key: string]: any;
}

export interface OutlierPoint {
  Date: string;
  Value: number;
  isOutlier?: boolean;
  isForecasted?: boolean;
  [key: string]: any;
}

export interface Pattern {
  PatternType: string;
  StartDate: string;
  EndDate: string;
  Description: string;
  Confidence: number;
  [key: string]: any;
}

/**
 * Service for handling dashboard analytics and data storytelling features
 */
class DashboardAnalyticsService {
  /**
   * Fetch personalized dashboard settings for the current user
   * @param userId - The ID of the current user
   * @returns The user's dashboard settings
   */
  async getUserDashboardSettings(userId: string): Promise<any> {
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
   * @param userId - The ID of the current user
   * @param settings - The dashboard settings to save
   * @returns The saved settings
   */
  async saveDashboardSettings(userId: string, settings: any): Promise<any> {
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
   * @param userId - The ID of the current user
   * @param userProfile - User profile information including role and experience level
   * @returns Array of recommended components
   */
  async getRecommendedComponents(userId: string, userProfile: any): Promise<any[]> {
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
   * @param metricId - The ID of the metric to explain
   * @param context - Optional context information (e.g., user role, experience level)
   * @returns Explanation data for the metric
   */
  async getMetricExplanation(metricId: string, context: any = {}): Promise<any> {
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
   * @param metricId - The ID of the metric
   * @param dateRange - Optional date range for annotations
   * @returns Array of annotations
   */
  async getAnnotations(metricId: string, dateRange?: string): Promise<Annotation[]> {
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
   * @param annotation - The annotation to save
   * @returns The saved annotation
   */
  async saveAnnotation(annotation: Partial<Annotation>): Promise<Annotation> {
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
   * @param annotationId - The ID of the annotation to update
   * @param annotation - The updated annotation data
   * @returns The updated annotation
   */
  async updateAnnotation(annotationId: string, annotation: Partial<Annotation>): Promise<Annotation> {
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
   * @param annotationId - The ID of the annotation to delete
   * @returns Success indicator
   */
  async deleteAnnotation(annotationId: string): Promise<boolean> {
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
   * @param metricId - The ID of the metric
   * @param dateRange - Date range for the trend analysis
   * @param options - Additional options for the analysis
   * @returns Trend analysis data
   */
  async getTrendAnalysis(metricId: string, dateRange: string, options: AnalyticsOptions = {}): Promise<TrendData> {
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
   * Get revenue trends data
   * @param params - Dashboard parameters
   * @param options - Analytics options
   * @returns Trend data for revenue
   */
  async getRevenueTrends(params: DashboardParams, options: AnalyticsOptions = {}): Promise<TrendData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/trends/revenue`, {
        params: {
          ...params,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      throw error;
    }
  }

  /**
   * Get registration trends data
   * @param params - Dashboard parameters
   * @param options - Analytics options
   * @returns Trend data for registrations
   */
  async getRegistrationTrends(params: DashboardParams, options: AnalyticsOptions = {}): Promise<TrendData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/trends/registrations`, {
        params: {
          ...params,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching registration trends:', error);
      throw error;
    }
  }
}

// Create and export instance
const dashboardAnalyticsService = new DashboardAnalyticsService();
export default dashboardAnalyticsService;
