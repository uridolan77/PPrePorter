import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/constants';
import { PerformanceData, PerformanceSummary, PerformanceFilters, PerformanceMetadata } from '../../types/performance';
import { ApiResponse } from '../../types/api';
import { AxiosRequestConfig } from 'axios';

// Define the PERFORMANCE endpoints structure with fallback handling
let PERFORMANCE_ENDPOINTS: any;

// Check which structure we have
// Use type assertion to avoid TypeScript errors
if ((API_ENDPOINTS as any).PERFORMANCE) {
  // Using the JavaScript structure
  PERFORMANCE_ENDPOINTS = (API_ENDPOINTS as any).PERFORMANCE;
} else if (API_ENDPOINTS.REPORTS) {
  // Using the TypeScript structure
  PERFORMANCE_ENDPOINTS = {
    GET_DATA: '/reports/performance/data',
    GET_METADATA: '/reports/performance/metadata',
    GET_SUMMARY: '/reports/performance/summary',
    EXPORT: '/reports/performance/export',
    SAVE_CONFIG: '/reports/performance/config/save',
    GET_CONFIGS: '/reports/performance/config/list'
  };
} else {
  // Fallback to hardcoded endpoints if neither structure is available
  PERFORMANCE_ENDPOINTS = {
    GET_DATA: '/reports/performance/data',
    GET_METADATA: '/reports/performance/metadata',
    GET_SUMMARY: '/reports/performance/summary',
    EXPORT: '/reports/performance/export',
    SAVE_CONFIG: '/reports/performance/config/save',
    GET_CONFIGS: '/reports/performance/config/list'
  };
}

/**
 * Get performance data
 * @param filters - Filter parameters
 * @returns Promise with performance data
 */
const getData = async (filters: PerformanceFilters): Promise<ApiResponse<PerformanceData[]>> => {
  try {
    const response = await apiClient.get(PERFORMANCE_ENDPOINTS.GET_DATA, { params: filters });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get performance metadata
 * @returns Promise with performance metadata
 */
const getMetadata = async (): Promise<PerformanceMetadata> => {
  try {
    const response = await apiClient.get(PERFORMANCE_ENDPOINTS.GET_METADATA);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get performance summary
 * @param filters - Filter parameters
 * @returns Promise with performance summary
 */
const getSummary = async (filters: PerformanceFilters): Promise<PerformanceSummary> => {
  try {
    const response = await apiClient.get(PERFORMANCE_ENDPOINTS.GET_SUMMARY, { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export performance data
 * @param filters - Filter parameters
 * @param format - Export format (pdf, excel, csv)
 * @returns Promise with blob data
 */
const exportData = async (filters: PerformanceFilters, format: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(PERFORMANCE_ENDPOINTS.EXPORT, {
      params: { ...filters, format },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save report configuration
 * @param config - Report configuration
 * @returns Promise with saved configuration
 */
const saveConfig = async (config: any): Promise<any> => {
  try {
    const response = await apiClient.post(PERFORMANCE_ENDPOINTS.SAVE_CONFIG, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get saved report configurations
 * @returns Promise with list of configurations
 */
const getConfigs = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get(PERFORMANCE_ENDPOINTS.GET_CONFIGS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getData,
  getMetadata,
  getSummary,
  exportData,
  saveConfig,
  getConfigs
};
