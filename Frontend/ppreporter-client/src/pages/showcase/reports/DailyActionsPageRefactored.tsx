import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, SelectChangeEvent, Snackbar, Alert } from '@mui/material';
import { format, subDays } from 'date-fns';
import { formatDate as formatDateUtil } from '../../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import {
  FilterPanel,
  SummaryCards,
  ConfigurableSummaryCards,
  DailyActionsTable
} from '../../../components/reports/daily-actions';
import {
  DailyAction,
  DailyActionsSummary,
  AdvancedFilters,
  GroupByOption,
  ReportFilters,
  SummaryMetricType,
  ComparisonPeriodType
} from '../../../types/reports';

// Mock data generator
const generateMockData = (
  startDate: Date,
  endDate: Date,
  groupBy: GroupByOption,
  filters: any = {}
): { data: DailyAction[], summary: DailyActionsSummary } => {
  // This is a simplified version of the mock data generator
  // In a real application, this would be replaced with API calls

  const data: DailyAction[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const randomMultiplier = Math.random() * 2 + 0.5;

    data.push({
      id: currentDate.getTime().toString(),
      date: new Date(currentDate).toISOString(),
      groupValue: '',
      uniquePlayers: Math.floor(Math.random() * 1000 * randomMultiplier),
      newRegistrations: Math.floor(Math.random() * 200 * randomMultiplier),
      deposits: Math.random() * 50000 * randomMultiplier,
      withdrawals: Math.random() * 30000 * randomMultiplier,
      bets: Math.random() * 100000 * randomMultiplier,
      wins: Math.random() * 90000 * randomMultiplier,
      ggr: Math.random() * 20000 * randomMultiplier,
      betCount: Math.floor(Math.random() * 5000 * randomMultiplier),
      avgSessionDuration: `${Math.floor(Math.random() * 60 + 30)} minutes`,
      conversionRate: Math.random() * 5 + 1,
      retentionRate: Math.random() * 30 + 50,
    });

    // Increment date based on groupBy
    if (groupBy === 'Day') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (groupBy === 'Month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (groupBy === 'Year') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      break; // For non-date groupings, just create one entry
    }
  }

  // For non-date groupings, create sample data
  if (groupBy !== 'Day' && groupBy !== 'Month' && groupBy !== 'Year') {
    const groups = groupBy === 'Country'
      ? ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'Brazil']
      : groupBy === 'Platform'
        ? ['Web', 'iOS', 'Android', 'Desktop']
        : groupBy === 'Game'
          ? ['Poker', 'Slots', 'Blackjack', 'Roulette', 'Baccarat', 'Craps']
          : ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

    data.length = 0; // Clear date-based data

    groups.forEach(group => {
      const randomMultiplier = Math.random() * 2 + 0.5;

      data.push({
        id: group,
        date: new Date().toISOString(),
        groupValue: group,
        uniquePlayers: Math.floor(Math.random() * 1000 * randomMultiplier),
        newRegistrations: Math.floor(Math.random() * 200 * randomMultiplier),
        deposits: Math.random() * 50000 * randomMultiplier,
        withdrawals: Math.random() * 30000 * randomMultiplier,
        bets: Math.random() * 100000 * randomMultiplier,
        wins: Math.random() * 90000 * randomMultiplier,
        ggr: Math.random() * 20000 * randomMultiplier,
        betCount: Math.floor(Math.random() * 5000 * randomMultiplier),
        avgSessionDuration: `${Math.floor(Math.random() * 60 + 30)} minutes`,
        conversionRate: Math.random() * 5 + 1,
        retentionRate: Math.random() * 30 + 50,
      });
    });
  }

  // Calculate summary
  const totalPlayers = data.reduce((sum, item) => sum + item.uniquePlayers, 0);
  const totalRegistrations = data.reduce((sum, item) => sum + item.newRegistrations, 0);
  const totalDeposits = data.reduce((sum, item) => sum + item.deposits, 0);
  const totalBets = data.reduce((sum, item) => sum + item.bets, 0);

  const summary: DailyActionsSummary = {
    totalPlayers,
    newRegistrations: totalRegistrations,
    totalDeposits,
    totalBets,
    playersTrend: Math.random() * 20 - 10,
    registrationsTrend: Math.random() * 20 - 5,
    depositsTrend: Math.random() * 20 - 5,
    betsTrend: Math.random() * 20 - 5,
    // Add trends for different comparison periods
    trends: {
      totalPlayers: {
        previous: Math.random() * 20 - 10,
        lastWeek: Math.random() * 15 - 5,
        lastMonth: Math.random() * 25 - 10,
        lastYear: Math.random() * 30 - 15
      },
      newRegistrations: {
        previous: Math.random() * 20 - 5,
        lastWeek: Math.random() * 15 - 3,
        lastMonth: Math.random() * 25 - 8,
        lastYear: Math.random() * 30 - 10
      },
      totalDeposits: {
        previous: Math.random() * 20 - 5,
        lastWeek: Math.random() * 15 - 3,
        lastMonth: Math.random() * 25 - 8,
        lastYear: Math.random() * 30 - 10
      },
      totalBets: {
        previous: Math.random() * 20 - 5,
        lastWeek: Math.random() * 15 - 3,
        lastMonth: Math.random() * 25 - 8,
        lastYear: Math.random() * 30 - 10
      }
    }
  };

  return { data, summary };
};

const DailyActionsPage: React.FC = () => {
  const navigate = useNavigate();

  // State for filters
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [groupBy, setGroupBy] = useState<GroupByOption>('Day');
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // State for data
  const [data, setData] = useState<DailyAction[]>([]);
  const [summary, setSummary] = useState<DailyActionsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for configurable summary cards
  const [selectedMetrics, setSelectedMetrics] = useState<SummaryMetricType[]>([
    'totalPlayers', 'newRegistrations', 'totalDeposits', 'totalBets'
  ]);

  // State for comparison periods
  const [comparisonPeriods, setComparisonPeriods] = useState<Record<SummaryMetricType, ComparisonPeriodType>>({
    totalPlayers: 'previous',
    newRegistrations: 'previous',
    totalDeposits: 'previous',
    totalBets: 'previous',
    totalWithdrawals: 'previous',
    totalGGR: 'previous',
    avgBetAmount: 'previous',
    conversionRate: 'previous',
    retentionRate: 'previous',
    activeUsers: 'previous',
    avgSessionDuration: 'previous',
    betCount: 'previous'
  });

  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Load data function
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // For now, we'll use our mock data generator
      setTimeout(() => {
        const { data, summary } = generateMockData(startDate, endDate, groupBy, advancedFilters);
        setData(data);
        setSummary(summary);
        setIsLoading(false);
      }, 1000); // Simulate network delay
    } catch (err) {
      setError('Failed to load data. Please try again.');
      setIsLoading(false);
      console.error('[DAILY ACTIONS PAGE] Error loading data:', err);
    }
  }, [startDate, endDate, groupBy, advancedFilters]);

  // Load data on initial render and when filters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle filter changes
  const handleStartDateChange = (date: Date | null) => {
    if (date) setStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) setEndDate(date);
  };

  const handleGroupByChange = (event: SelectChangeEvent<string>) => {
    setGroupBy(event.target.value as GroupByOption);
  };

  const handleAdvancedFiltersChange = (filters: AdvancedFilters) => {
    setAdvancedFilters(filters);
  };

  const handleToggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const handleResetFilters = () => {
    setStartDate(subDays(new Date(), 30));
    setEndDate(new Date());
    setGroupBy('Day');
    setAdvancedFilters({});
  };

  // Handle export data
  const handleExportData = () => {
    setIsLoading(true);

    try {
      // In a real app, this would call an API endpoint
      // For now, we'll just create a CSV from our data

      // Create CSV content
      const headers = [
        groupBy,
        'Unique Players',
        'New Registrations',
        'Deposits',
        'Withdrawals',
        'Bets',
        'Wins',
        'GGR'
      ];

      const rows = data.map(row => [
        row.groupValue || (groupBy === 'Day' ? format(new Date(row.date), 'yyyy-MM-dd') :
                          groupBy === 'Month' ? format(new Date(row.date), 'yyyy-MM') :
                          format(new Date(row.date), 'yyyy')),
        row.uniquePlayers,
        row.newRegistrations,
        row.deposits.toFixed(2),
        row.withdrawals.toFixed(2),
        row.bets.toFixed(2),
        row.wins.toFixed(2),
        row.ggr.toFixed(2)
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DailyActions_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}_${groupBy}.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setNotification({
        open: true,
        message: 'Data exported successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('[DAILY ACTIONS PAGE] Error exporting data:', err);
      setNotification({
        open: true,
        message: 'Failed to export data. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (row: DailyAction) => {
    // In a real app, this would navigate to a detail page
    // For now, we'll just show a notification
    setNotification({
      open: true,
      message: `Viewing details for ${row.groupValue || format(new Date(row.date), 'MMM dd, yyyy')}`,
      severity: 'info'
    });
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Handle metric change in configurable summary cards
  const handleMetricsChange = (metrics: SummaryMetricType[]) => {
    console.log('[DAILY ACTIONS PAGE] Metrics changed:', metrics);
    setSelectedMetrics(metrics);
  };

  // Handle comparison period change in configurable summary cards
  const handleComparisonPeriodChange = (metricId: SummaryMetricType, period: ComparisonPeriodType) => {
    console.log(`[DAILY ACTIONS PAGE] Comparison period changed for ${metricId}:`, period);
    setComparisonPeriods(prev => ({
      ...prev,
      [metricId]: period
    }));

    // In a real implementation, we would fetch new trend data based on the selected period
    // For now, we'll just simulate a random trend value
    if (summary) {
      setSummary(prev => {
        if (!prev) return prev;

        // Create a new trends object if it doesn't exist
        const trends = prev.trends || {};

        // Create or update the metric's trends
        const metricTrends = trends[metricId] || {};

        // Set a random trend value for the selected period
        metricTrends[period] = Math.random() * 40 - 20; // Random value between -20 and 20

        // Update the trends object
        trends[metricId] = metricTrends;

        return {
          ...prev,
          trends
        };
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Daily Actions Report
        </Typography>

        {/* Filter Panel */}
        <FilterPanel
          startDate={startDate}
          endDate={endDate}
          groupBy={groupBy}
          advancedFilters={advancedFilters}
          showAdvancedFilters={showAdvancedFilters}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onGroupByChange={handleGroupByChange}
          onAdvancedFiltersChange={handleAdvancedFiltersChange}
          onToggleAdvancedFilters={handleToggleAdvancedFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
        />

        {/* Configurable Summary Cards */}
        <ConfigurableSummaryCards
          summary={summary}
          isLoading={isLoading}
          error={error}
          selectedMetrics={selectedMetrics}
          onMetricsChange={handleMetricsChange}
          comparisonPeriods={comparisonPeriods}
          onComparisonPeriodChange={handleComparisonPeriodChange}
        />

        {/* Data Table */}
        <DailyActionsTable
          data={data}
          isLoading={isLoading}
          error={error}
          groupBy={groupBy}
          onExportData={handleExportData}
          onViewDetails={handleViewDetails}
        />
      </Box>

      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DailyActionsPage;
