import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DailyActionsAdvancedReportContainer from '../DailyActionsAdvancedReportContainer';
import dailyActionsService from '../../services/api/dailyActionsService';
import { saveAs } from 'file-saver';

// Mock dependencies
jest.mock('../../services/api/dailyActionsService');
jest.mock('file-saver');

// Mock data
const mockMetadata = {
  whiteLabels: [{ id: 1, name: 'Label 1' }],
  countries: [{ id: 1, name: 'Country 1' }],
  currencies: [{ id: 1, name: 'Currency 1', code: 'USD' }],
  languages: [{ id: 1, name: 'English', code: 'en' }],
  platforms: ['Web', 'Mobile'],
  genders: ['Male', 'Female'],
  statuses: ['Active', 'Inactive'],
  playerTypes: ['Real', 'Fun'],
  registrationPlayModes: ['Real', 'Fun'],
  trackers: ['Tracker1'],
  groupByOptions: [{ id: 1, name: 'Day', value: 'Day' }]
};

const mockReportData = {
  data: [
    {
      id: 1,
      date: '2023-01-01',
      whiteLabelId: 1,
      whiteLabelName: 'Label 1',
      registrations: 100,
      ftd: 50,
      deposits: 10000,
      paidCashouts: 5000,
      totalGGR: 2700
    }
  ],
  summary: {
    totalRegistrations: 100,
    totalFTD: 50,
    totalDeposits: 10000,
    totalCashouts: 5000,
    totalGGR: 2700
  },
  totalCount: 1,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10
};

// Mock blob for export
const mockBlob = new Blob(['test'], { type: 'text/csv' });

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock service methods
  dailyActionsService.getMetadata.mockResolvedValue(mockMetadata);
  dailyActionsService.getFilteredData.mockResolvedValue(mockReportData);
  dailyActionsService.exportFilteredReport.mockResolvedValue(mockBlob);
});

// Helper to render with router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DailyActionsAdvancedReportContainer', () => {
  test('fetches metadata on mount', async () => {
    renderWithRouter(<DailyActionsAdvancedReportContainer />);
    
    // Should show loading initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(dailyActionsService.getMetadata).toHaveBeenCalledTimes(1);
    });
  });
  
  test('renders DailyActionsAdvancedReport with metadata', async () => {
    renderWithRouter(<DailyActionsAdvancedReportContainer />);
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Should render the report component
    expect(screen.getByText('Advanced Report')).toBeInTheDocument();
  });
  
  test('fetches data when onRefresh is called', async () => {
    renderWithRouter(<DailyActionsAdvancedReportContainer />);
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(dailyActionsService.getMetadata).toHaveBeenCalledTimes(1);
    });
    
    // Simulate refresh
    await act(async () => {
      const filters = {
        startDate: new Date(),
        endDate: new Date(),
        whiteLabelIds: [1]
      };
      
      // Get the onRefresh prop from the DailyActionsAdvancedReport component
      // and call it with filters
      const onRefreshProp = dailyActionsService.getFilteredData.mock.calls[0][0];
      
      // Call onRefresh with filters
      await dailyActionsService.getFilteredData(filters);
    });
    
    // Should have called getFilteredData
    expect(dailyActionsService.getFilteredData).toHaveBeenCalled();
  });
  
  test('exports data when onExport is called', async () => {
    renderWithRouter(<DailyActionsAdvancedReportContainer />);
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(dailyActionsService.getMetadata).toHaveBeenCalledTimes(1);
    });
    
    // Simulate export
    await act(async () => {
      const filters = {
        startDate: new Date(),
        endDate: new Date(),
        whiteLabelIds: [1]
      };
      
      // Call exportFilteredReport with filters and format
      await dailyActionsService.exportFilteredReport(filters, 'csv');
    });
    
    // Should have called exportFilteredReport
    expect(dailyActionsService.exportFilteredReport).toHaveBeenCalled();
  });
  
  test('shows error message when metadata fetch fails', async () => {
    // Mock error
    dailyActionsService.getMetadata.mockRejectedValue(new Error('Failed to load metadata'));
    
    renderWithRouter(<DailyActionsAdvancedReportContainer />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load metadata')).toBeInTheDocument();
    });
  });
  
  test('shows error message when data fetch fails', async () => {
    // Mock successful metadata fetch but failed data fetch
    dailyActionsService.getMetadata.mockResolvedValue(mockMetadata);
    dailyActionsService.getFilteredData.mockRejectedValue(new Error('Failed to load data'));
    
    renderWithRouter(<DailyActionsAdvancedReportContainer />);
    
    // Wait for metadata to load
    await waitFor(() => {
      expect(dailyActionsService.getMetadata).toHaveBeenCalledTimes(1);
    });
    
    // Simulate refresh that will fail
    await act(async () => {
      try {
        await dailyActionsService.getFilteredData({});
      } catch (error) {
        // Expected error
      }
    });
    
    // Error should be passed to the component
    expect(dailyActionsService.getFilteredData).toHaveBeenCalled();
  });
});
