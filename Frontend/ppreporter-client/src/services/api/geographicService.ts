import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/constants';
import { GeographicData, GeographicSummary, GeographicFilters, GeographicMetadata } from '../../types/geographic';
import { ApiResponse } from '../../types/api';
import { AxiosRequestConfig } from 'axios';

// Define the GEOGRAPHIC endpoints structure with fallback handling
let GEOGRAPHIC_ENDPOINTS: any;

// Check which structure we have
// Use type assertion to avoid TypeScript errors
if ((API_ENDPOINTS as any).GEOGRAPHIC) {
  // Using the JavaScript structure
  GEOGRAPHIC_ENDPOINTS = (API_ENDPOINTS as any).GEOGRAPHIC;
} else if (API_ENDPOINTS.REPORTS) {
  // Using the TypeScript structure
  GEOGRAPHIC_ENDPOINTS = {
    GET_DATA: '/api/reports/geographic/data',
    GET_METADATA: '/api/reports/geographic/metadata',
    GET_SUMMARY: '/api/reports/geographic/summary',
    EXPORT: '/api/reports/geographic/export',
    SAVE_CONFIG: '/api/reports/geographic/config/save',
    GET_CONFIGS: '/api/reports/geographic/config/list'
  };
} else {
  // Fallback to hardcoded endpoints if neither structure is available
  GEOGRAPHIC_ENDPOINTS = {
    GET_DATA: '/api/reports/geographic/data',
    GET_METADATA: '/api/reports/geographic/metadata',
    GET_SUMMARY: '/api/reports/geographic/summary',
    EXPORT: '/api/reports/geographic/export',
    SAVE_CONFIG: '/api/reports/geographic/config/save',
    GET_CONFIGS: '/api/reports/geographic/config/list'
  };
}

/**
 * Get geographic data
 * @param filters - Filter parameters
 * @returns Promise with geographic data
 */
const getData = async (filters: GeographicFilters): Promise<ApiResponse<GeographicData[]>> => {
  try {
    const response = await apiClient.get(GEOGRAPHIC_ENDPOINTS.GET_DATA, { params: filters });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get geographic metadata
 * @returns Promise with geographic metadata
 */
const getMetadata = async (): Promise<GeographicMetadata> => {
  try {
    const response = await apiClient.get(GEOGRAPHIC_ENDPOINTS.GET_METADATA);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get geographic summary
 * @param filters - Filter parameters
 * @returns Promise with geographic summary
 */
const getSummary = async (filters: GeographicFilters): Promise<GeographicSummary> => {
  try {
    const response = await apiClient.get(GEOGRAPHIC_ENDPOINTS.GET_SUMMARY, { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export geographic data
 * @param filters - Filter parameters
 * @param format - Export format (pdf, excel, csv)
 * @returns Promise with blob data
 */
const exportData = async (filters: GeographicFilters, format: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(GEOGRAPHIC_ENDPOINTS.EXPORT, {
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
    const response = await apiClient.post(GEOGRAPHIC_ENDPOINTS.SAVE_CONFIG, config);
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
    const response = await apiClient.get(GEOGRAPHIC_ENDPOINTS.GET_CONFIGS);
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
