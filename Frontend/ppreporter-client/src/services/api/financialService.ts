import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/constants';
import { FinancialData, FinancialSummary, FinancialFilters, FinancialMetadata } from '../../types/financial';
import { ApiResponse } from '../../types/api';
import { AxiosRequestConfig } from 'axios';

// Define the FINANCIAL endpoints structure with fallback handling
let FINANCIAL_ENDPOINTS: any;

// Check which structure we have
// Use type assertion to avoid TypeScript errors
if ((API_ENDPOINTS as any).FINANCIAL) {
  // Using the JavaScript structure
  FINANCIAL_ENDPOINTS = (API_ENDPOINTS as any).FINANCIAL;
} else if (API_ENDPOINTS.REPORTS && API_ENDPOINTS.REPORTS.REVENUE) {
  // Using the TypeScript structure
  FINANCIAL_ENDPOINTS = {
    GET_DATA: `${API_ENDPOINTS.REPORTS.REVENUE}/data`,
    GET_METADATA: `${API_ENDPOINTS.REPORTS.REVENUE}/metadata`,
    GET_SUMMARY: `${API_ENDPOINTS.REPORTS.REVENUE}/summary`,
    EXPORT: `${API_ENDPOINTS.REPORTS.REVENUE}/export`,
    SAVE_CONFIG: `${API_ENDPOINTS.REPORTS.REVENUE}/config/save`,
    GET_CONFIGS: `${API_ENDPOINTS.REPORTS.REVENUE}/config/list`
  };
} else {
  // Fallback to hardcoded endpoints if neither structure is available
  FINANCIAL_ENDPOINTS = {
    GET_DATA: '/api/reports/financial/data',
    GET_METADATA: '/api/reports/financial/metadata',
    GET_SUMMARY: '/api/reports/financial/summary',
    EXPORT: '/api/reports/financial/export',
    SAVE_CONFIG: '/api/reports/financial/config/save',
    GET_CONFIGS: '/api/reports/financial/config/list'
  };
}

/**
 * Get financial data
 * @param filters - Filter parameters
 * @returns Promise with financial data
 */
const getData = async (filters: FinancialFilters): Promise<ApiResponse<FinancialData[]>> => {
  try {
    const response = await apiClient.get(FINANCIAL_ENDPOINTS.GET_DATA, { params: filters });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get financial metadata
 * @returns Promise with financial metadata
 */
const getMetadata = async (): Promise<FinancialMetadata> => {
  try {
    const response = await apiClient.get(FINANCIAL_ENDPOINTS.GET_METADATA);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get financial summary
 * @param filters - Filter parameters
 * @returns Promise with financial summary
 */
const getSummary = async (filters: FinancialFilters): Promise<FinancialSummary> => {
  try {
    const response = await apiClient.get(FINANCIAL_ENDPOINTS.GET_SUMMARY, { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export financial data
 * @param filters - Filter parameters
 * @param format - Export format (pdf, excel, csv)
 * @returns Promise with blob data
 */
const exportData = async (filters: FinancialFilters, format: string): Promise<Blob> => {
  try {
    const response = await apiClient.get(FINANCIAL_ENDPOINTS.EXPORT, {
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
    const response = await apiClient.post(FINANCIAL_ENDPOINTS.SAVE_CONFIG, config);
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
    const response = await apiClient.get(FINANCIAL_ENDPOINTS.GET_CONFIGS);
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
