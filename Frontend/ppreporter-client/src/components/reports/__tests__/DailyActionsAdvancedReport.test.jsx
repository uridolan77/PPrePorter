import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DailyActionsAdvancedReport from '../DailyActionsAdvancedReport';

// Mock data
const mockMetadata = {
  whiteLabels: [
    { id: 1, name: 'Label 1' },
    { id: 2, name: 'Label 2' }
  ],
  countries: [
    { id: 1, name: 'Country 1', isoCode: 'C1' },
    { id: 2, name: 'Country 2', isoCode: 'C2' }
  ],
  currencies: [
    { id: 1, name: 'Currency 1', code: 'CUR1', symbol: '$' },
    { id: 2, name: 'Currency 2', code: 'CUR2', symbol: '€' }
  ],
  languages: [
    { id: 1, name: 'English', code: 'en' },
    { id: 2, name: 'Spanish', code: 'es' }
  ],
  platforms: ['Web', 'Mobile'],
  genders: ['Male', 'Female', 'Other'],
  statuses: ['Active', 'Inactive', 'Suspended'],
  playerTypes: ['Real', 'Fun'],
  registrationPlayModes: ['Real', 'Fun'],
  trackers: ['Tracker1', 'Tracker2'],
  groupByOptions: [
    { id: 1, name: 'Day', value: 'Day' },
    { id: 2, name: 'Month', value: 'Month' }
  ]
};

const mockData = {
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
      betsCasino: 8000,
      winsCasino: 7000,
      betsSport: 5000,
      winsSport: 4000,
      betsLive: 3000,
      winsLive: 2500,
      betsBingo: 1000,
      winsBingo: 800,
      ggrCasino: 1000,
      ggrSport: 1000,
      ggrLive: 500,
      ggrBingo: 200,
      totalGGR: 2700
    },
    {
      id: 2,
      date: '2023-01-02',
      whiteLabelId: 2,
      whiteLabelName: 'Label 2',
      registrations: 150,
      ftd: 75,
      deposits: 15000,
      paidCashouts: 7500,
      betsCasino: 12000,
      winsCasino: 10000,
      betsSport: 8000,
      winsSport: 7000,
      betsLive: 5000,
      winsLive: 4000,
      betsBingo: 2000,
      winsBingo: 1500,
      ggrCasino: 2000,
      ggrSport: 1000,
      ggrLive: 1000,
      ggrBingo: 500,
      totalGGR: 4500
    }
  ],
  summary: {
    totalRegistrations: 250,
    totalFTD: 125,
    totalDeposits: 25000,
    totalCashouts: 12500,
    totalBetsCasino: 20000,
    totalWinsCasino: 17000,
    totalBetsSport: 13000,
    totalWinsSport: 11000,
    totalBetsLive: 8000,
    totalWinsLive: 6500,
    totalBetsBingo: 3000,
    totalWinsBingo: 2300,
    totalGGR: 7200
  },
  totalCount: 2,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10
};

// Mock functions
const mockOnFilterChange = jest.fn();
const mockOnRefresh = jest.fn();
const mockOnExport = jest.fn();

// Wrap component with LocalizationProvider for date pickers
const renderComponent = (props = {}) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DailyActionsAdvancedReport
        metadata={mockMetadata}
        data={mockData}
        loading={false}
        error={null}
        onFilterChange={mockOnFilterChange}
        onRefresh={mockOnRefresh}
        onExport={mockOnExport}
        {...props}
      />
    </LocalizationProvider>
  );
};

describe('DailyActionsAdvancedReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with title', () => {
    renderComponent();
    expect(screen.getByText('Advanced Report')).toBeInTheDocument();
  });

  test('renders filters section', () => {
    renderComponent();
    expect(screen.getByText('Search parameters')).toBeInTheDocument();
  });

  test('renders data table when data is provided', () => {
    renderComponent();
    expect(screen.getByText('Daily Actions Data')).toBeInTheDocument();
    expect(screen.getByText('Label 1')).toBeInTheDocument();
    expect(screen.getByText('Label 2')).toBeInTheDocument();
  });

  test('renders loading state', () => {
    renderComponent({ loading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error state', () => {
    renderComponent({ error: 'An error occurred', data: null });
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  test('renders empty state', () => {
    renderComponent({ data: { data: [] } });
    expect(screen.getByText('No data found for the selected filters.')).toBeInTheDocument();
  });

  test('calls onRefresh when refresh button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Refresh'));
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  test('calls onExport when export button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Export'));
    expect(mockOnExport).toHaveBeenCalled();
  });

  test('calls onFilterChange when search button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Search'));
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  test('resets filters when reset button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Reset'));
    // After reset, onFilterChange should be called with default values
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  test('renders summary section when summary data is available', () => {
    renderComponent();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument(); // Total registrations
    expect(screen.getByText('125')).toBeInTheDocument(); // Total FTD
  });
});
