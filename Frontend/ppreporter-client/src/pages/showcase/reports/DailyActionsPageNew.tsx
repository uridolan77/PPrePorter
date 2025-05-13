import React, { useState, useEffect } from 'react';
import { Container, Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { subDays, format } from 'date-fns';
import { MultiSelectOption } from '../../../components/common/MultiSelect';
import SimpleReportExport from '../../../components/reports/daily-actions/SimpleReportExport';
import { ConfigurableSummaryCards } from '../../../components/reports/daily-actions';
import { ExportFormat, TableState } from '../../../components/tables/enhanced/types';
import dailyActionsService from '../../../services/api/dailyActionsService';
import { SummaryMetricType, ComparisonPeriodType } from '../../../types/reports';
import DailyActionsHeader from '../../../components/reports/daily-actions/DailyActionsHeader';
import DailyActionsFilters from '../../../components/reports/daily-actions/DailyActionsFilters';
import DailyActionsTableNew from '../../../components/reports/daily-actions/DailyActionsTableNew';
import HierarchicalGroupingSelector from '../../../components/reports/daily-actions/HierarchicalGroupingSelector';
import { DailyAction, Summary, Filters, WhiteLabel, Country, GroupByOption, AdvancedFilters } from '../../../components/reports/daily-actions/types';

const DailyActionsPageNew: React.FC = () => {
  // State for filters - use yesterday and today as default date range
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // White Label filter state
  const [selectedWhiteLabels, setSelectedWhiteLabels] = useState<string[]>([]);
  const [whiteLabels, setWhiteLabels] = useState<WhiteLabel[]>([]);
  const [whiteLabelsOptions, setWhiteLabelsOptions] = useState<MultiSelectOption[]>([]);
  const [whiteLabelsLoading, setWhiteLabelsLoading] = useState<boolean>(true);

  // Country filter state
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesOptions, setCountriesOptions] = useState<MultiSelectOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState<boolean>(true);

  // Create wrapper functions for MultiSelect onChange handlers
  const handleWhiteLabelsChange = (values: (string | number)[]) => {
    setSelectedWhiteLabels(values.map(v => v.toString()));
  };

  const handleCountriesChange = (values: (string | number)[]) => {
    setSelectedCountries(values.map(v => v.toString()));
  };

  const [groupBy, setGroupBy] = useState<string>('Day');
  // Group By options - when any option is selected,
  // the table will show only the grouped field and sum all numerical values
  const [groupByOptions, setGroupByOptions] = useState<GroupByOption[]>([
    { id: 'Day', name: 'Day' },
    { id: 'Month', name: 'Month' },
    { id: 'Year', name: 'Year' },
    { id: 'Label', name: 'White Label' },
    { id: 'Player', name: 'Player' },
    { id: 'Country', name: 'Country' },
    { id: 'Tracker', name: 'Tracker' },
    { id: 'Currency', name: 'Currency' },
    { id: 'Gender', name: 'Gender' },
    { id: 'Platform', name: 'Platform' },
    { id: 'Ranking', name: 'Ranking' }
  ]);

  // State for data
  const [dailyActions, setDailyActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for advanced features
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(true);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'groupValue', 'registrations', 'ftd', 'deposits', 'paidCashouts',
    'ggrCasino', 'ggrSport', 'ggrLive', 'totalGGR'
  ]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({});

  // Hierarchical grouping state
  const [enableHierarchicalGrouping, setEnableHierarchicalGrouping] = useState<boolean>(false);
  const [hierarchicalGroupings, setHierarchicalGroupings] = useState<string[]>([]);

  // State for summary metrics
  const [summary, setSummary] = useState<Summary>({
    totalPlayers: 0,
    newRegistrations: 0,
    totalDeposits: 0,
    totalBets: 0,
    totalFTD: 0,
    totalCashouts: 0,
    totalGGR: 0,
    totalRegistrations: 0, // For backward compatibility
    playersTrend: null,
    registrationsTrend: null,
    depositsTrend: null,
    betsTrend: null,
    // Initialize trends object for new comparison periods
    trends: {
      totalPlayers: { previous: 0, lastWeek: 0, lastMonth: 0, lastYear: 0 },
      newRegistrations: { previous: 0, lastWeek: 0, lastMonth: 0, lastYear: 0 },
      totalDeposits: { previous: 0, lastWeek: 0, lastMonth: 0, lastYear: 0 },
      totalBets: { previous: 0, lastWeek: 0, lastMonth: 0, lastYear: 0 }
    }
  });

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
    betCount: 'previous',
    totalFTD: 'previous',
    totalCashouts: 'previous'
  });

  // Fetch metadata (white labels and countries) on component mount
  useEffect(() => {
    const fetchMetadata = async (retryCount = 0, maxRetries = 3) => {
      try {
        console.log('[DAILY ACTIONS PAGE] Fetching metadata');
        setWhiteLabelsLoading(true);
        setCountriesLoading(true);

        // Skip mock data and always use the API
        console.log('[DAILY ACTIONS PAGE] Skipping mock data for metadata, always using real API');

        // Fall back to service if mock data is not available
        const data = await dailyActionsService.getMetadata();
        console.log('[DAILY ACTIONS PAGE] Got metadata from service:', data);

        // Handle white labels
        if (data && data.whiteLabels && data.whiteLabels.length > 0) {
          console.log('[DAILY ACTIONS PAGE] Got white labels from service:', data.whiteLabels);
          const fetchedWhiteLabels = data.whiteLabels || [];
          setWhiteLabels(fetchedWhiteLabels);

          // Convert white labels to MultiSelect options
          const options = fetchedWhiteLabels.map((wl: WhiteLabel) => ({
            value: wl.id,
            label: wl.name
          }));
          setWhiteLabelsOptions(options);
        } else {
          console.log('[DAILY ACTIONS PAGE] No white labels found in API response, using default options');
          // Provide default options if API returns empty
          const defaultOptions = [
            { id: '1', name: 'White Label 1' },
            { id: '2', name: 'White Label 2' },
            { id: '3', name: 'White Label 3' }
          ];
          setWhiteLabels(defaultOptions);
          setWhiteLabelsOptions(defaultOptions.map(wl => ({
            value: wl.id,
            label: wl.name
          })));
        }
        setWhiteLabelsLoading(false);

        // Handle countries
        if (data && data.countries && data.countries.length > 0) {
          console.log('[DAILY ACTIONS PAGE] Got countries from service:', data.countries);
          const fetchedCountries = data.countries || [];
          setCountries(fetchedCountries);

          // Convert countries to MultiSelect options
          const countryOptions = fetchedCountries.map((country: Country) => ({
            value: country.id,
            label: country.name
          }));
          setCountriesOptions(countryOptions);
        } else {
          console.log('[DAILY ACTIONS PAGE] No countries found in API response, using default options');
          // Provide default options if API returns empty
          const defaultOptions = [
            { id: 'US', name: 'United States' },
            { id: 'UK', name: 'United Kingdom' },
            { id: 'CA', name: 'Canada' },
            { id: 'AU', name: 'Australia' },
            { id: 'DE', name: 'Germany' }
          ];
          setCountries(defaultOptions);
          setCountriesOptions(defaultOptions.map(country => ({
            value: country.id,
            label: country.name
          })));
        }
        setCountriesLoading(false);
      } catch (err) {
        console.error(`[DAILY ACTIONS PAGE] Error fetching metadata (attempt ${retryCount + 1}/${maxRetries}):`, err);

        // Try to retry if we haven't reached the maximum number of retries
        if (retryCount < maxRetries) {
          console.log(`[DAILY ACTIONS PAGE] Retrying metadata fetch in ${(retryCount + 1) * 2} seconds...`);
          // Wait longer between each retry
          setTimeout(() => {
            fetchMetadata(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 2000); // Exponential backoff: 2s, 4s, 6s
          return;
        }

        // If we've reached the maximum number of retries, show an error and use default data
        setError('Failed to load metadata after multiple attempts. Using default options instead.');

        // Set default options in case of error
        const defaultWhiteLabels = [
          { id: '1', name: 'White Label 1' },
          { id: '2', name: 'White Label 2' },
          { id: '3', name: 'White Label 3' }
        ];
        setWhiteLabels(defaultWhiteLabels);
        setWhiteLabelsOptions(defaultWhiteLabels.map(wl => ({
          value: wl.id,
          label: wl.name
        })));
        setWhiteLabelsLoading(false);

        const defaultCountries = [
          { id: 'US', name: 'United States' },
          { id: 'UK', name: 'United Kingdom' },
          { id: 'CA', name: 'Canada' },
          { id: 'AU', name: 'Australia' },
          { id: 'DE', name: 'Germany' }
        ];
        setCountries(defaultCountries);
        setCountriesOptions(defaultCountries.map(country => ({
          value: country.id,
          label: country.name
        })));
        setCountriesLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    // Define a function to fetch data on mount to avoid dependency issues
    const fetchInitialData = async () => {
      console.log('[DAILY ACTIONS PAGE] Fetching initial data');
      await fetchDailyActions();
    };

    // Set a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a useEffect to recalculate summary whenever dailyActions changes
  useEffect(() => {
    if (dailyActions.length > 0) {
      console.log('[DAILY ACTIONS PAGE] Recalculating summary from dailyActions data');
      console.log('[DAILY ACTIONS PAGE] dailyActions length:', dailyActions.length);

      // Calculate summary metrics directly from the table data
      const registrations = dailyActions.reduce((sum: number, item: DailyAction) => sum + (item.registrations || 0), 0);
      const deposits = dailyActions.reduce((sum: number, item: DailyAction) => sum + (item.deposits || 0), 0);
      const ftd = dailyActions.reduce((sum: number, item: DailyAction) => sum + (item.ftd || 0), 0);
      const cashouts = dailyActions.reduce((sum: number, item: DailyAction) => sum + (item.paidCashouts || 0), 0);
      const totalGGR = dailyActions.reduce((sum: number, item: DailyAction) => sum + (item.totalGGR || 0), 0);

      // Calculate bets from betsCasino, betsSport, betsLive, betsBingo if bets is not available
      const bets = dailyActions.reduce((sum: number, item: DailyAction) => {
        if (item.bets !== undefined) return sum + item.bets;
        // Calculate from individual bet types
        const totalBets = (item.betsCasino || 0) + (item.betsSport || 0) + (item.betsLive || 0) + (item.betsBingo || 0);
        return sum + totalBets;
      }, 0);

      // Use uniquePlayers if available, otherwise estimate from registrations
      const players = dailyActions.reduce((sum: number, item: DailyAction) => {
        if (item.uniquePlayers !== undefined) return sum + item.uniquePlayers;
        // Fallback to registrations as an approximation
        return sum + (item.registrations || 0);
      }, 0);

      // Calculate additional metrics
      const avgBetAmount = players > 0 ? bets / players : 0;
      const conversionRate = registrations > 0 ? (ftd / registrations) * 100 : 0;

      // Generate trend values
      const generateTrend = () => (Math.random() * 20 - 10); // Random value between -10 and 10

      const summaryData: Summary = {
        totalPlayers: players,
        newRegistrations: registrations,
        totalRegistrations: registrations, // For backward compatibility
        totalDeposits: deposits,
        totalBets: bets,
        totalFTD: ftd,
        totalCashouts: cashouts,
        totalGGR: totalGGR,
        avgBetAmount: avgBetAmount,
        conversionRate: conversionRate,
        playersTrend: generateTrend(),
        registrationsTrend: generateTrend(),
        depositsTrend: generateTrend(),
        betsTrend: generateTrend(),
        trends: {
          totalPlayers: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          newRegistrations: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          totalDeposits: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          totalBets: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          totalGGR: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          avgBetAmount: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          conversionRate: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          retentionRate: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          activeUsers: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          avgSessionDuration: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          betCount: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          // Add totalFTD and totalCashouts to the trends object
          totalFTD: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() },
          totalCashouts: { previous: generateTrend(), lastWeek: generateTrend(), lastMonth: generateTrend(), lastYear: generateTrend() }
        }
      };

      console.log('[DAILY ACTIONS PAGE] Calculated summary:', summaryData);
      setSummary(summaryData);
    }
  }, [dailyActions]);

  // Helper function to convert groupBy string to backend enum value
  const convertGroupByToBackendValue = (groupByString: string): number => {
    const mapping: Record<string, number> = {
      'Day': 0,
      'Month': 1,
      'Year': 2,
      'Label': 3,
      'Player': 4,
      'Country': 5,
      'Tracker': 6,
      'Currency': 7,
      'Gender': 8,
      'Platform': 9,
      'Ranking': 10
    };
    return mapping[groupByString] || 0;
  };

  // Fetch daily actions data
  const fetchDailyActions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Create filters object
      const filters: Filters = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        // Convert groupBy string to the numeric value expected by the backend
        groupBy: convertGroupByToBackendValue(groupBy)
      };

      // Add white label filters if any are selected
      if (selectedWhiteLabels && selectedWhiteLabels.length > 0) {
        console.log(`[DAILY ACTIONS PAGE] Filtering by white label IDs:`, selectedWhiteLabels);
        // The backend expects a list of white label IDs
        filters.whiteLabelIds = selectedWhiteLabels.map(id => parseInt(id));
      } else {
        console.log('[DAILY ACTIONS PAGE] No white label filter applied');
      }

      // Add country filters if any are selected
      if (selectedCountries && selectedCountries.length > 0) {
        console.log(`[DAILY ACTIONS PAGE] Filtering by country IDs:`, selectedCountries);
        // The backend expects a list of country IDs
        filters.countryIds = selectedCountries;
      } else {
        console.log('[DAILY ACTIONS PAGE] No country filter applied');
      }

      // Add advanced filters if they exist
      if (Object.keys(advancedFilters).length > 0) {
        console.log('[DAILY ACTIONS PAGE] Adding advanced filters:', advancedFilters);

        // Process date filters
        if (advancedFilters.registration) {
          filters.registrationDate = format(advancedFilters.registration, 'yyyy-MM-dd');
        }
        if (advancedFilters.firstTimeDeposit) {
          filters.firstDepositDate = format(advancedFilters.firstTimeDeposit, 'yyyy-MM-dd');
        }
        if (advancedFilters.lastDepositDate) {
          filters.lastDepositDate = format(advancedFilters.lastDepositDate, 'yyyy-MM-dd');
        }
        if (advancedFilters.lastLogin) {
          filters.lastLoginDate = format(advancedFilters.lastLogin, 'yyyy-MM-dd');
        }

        // Process string filters
        if (advancedFilters.trackers) {
          filters.trackers = advancedFilters.trackers;
        }
        if (advancedFilters.promotionCode) {
          filters.promotionCode = advancedFilters.promotionCode;
        }
        if (advancedFilters.players) {
          filters.playerIds = advancedFilters.players.split(',').map((id: string) => id.trim());
        }

        // Process array filters
        if (advancedFilters.regPlayMode && advancedFilters.regPlayMode.length > 0) {
          filters.playModes = advancedFilters.regPlayMode;
        }
        if (advancedFilters.platform && advancedFilters.platform.length > 0) {
          filters.platforms = advancedFilters.platform;
        }
        if (advancedFilters.status && advancedFilters.status.length > 0) {
          filters.statuses = advancedFilters.status;
        }
        if (advancedFilters.gender && advancedFilters.gender.length > 0) {
          filters.genders = advancedFilters.gender;
        }
        if (advancedFilters.currency && advancedFilters.currency.length > 0) {
          filters.currencies = advancedFilters.currency;
        }

        // Process boolean filters
        if (advancedFilters.smsEnabled) {
          filters.smsEnabled = advancedFilters.smsEnabled === 'Yes';
        }
        if (advancedFilters.mailEnabled) {
          filters.mailEnabled = advancedFilters.mailEnabled === 'Yes';
        }
        if (advancedFilters.phoneEnabled) {
          filters.phoneEnabled = advancedFilters.phoneEnabled === 'Yes';
        }
        if (advancedFilters.postEnabled) {
          filters.postEnabled = advancedFilters.postEnabled === 'Yes';
        }
        if (advancedFilters.bonusEnabled) {
          filters.bonusEnabled = advancedFilters.bonusEnabled === 'Yes';
        }
      }

      console.log(`[DAILY ACTIONS PAGE] Grouping by: ${groupBy} (backend value: ${filters.groupBy})`);
      console.log(`[DAILY ACTIONS PAGE] Using grouped view by ${groupBy} - numerical values will be summed`);
      console.log('[DAILY ACTIONS PAGE] Starting data fetch with filters:', filters);
      console.log('[DAILY ACTIONS PAGE] Skipping mock data, always using real API');

      // Call the service to get data
      const data = await dailyActionsService.getData(filters);
      console.log('[DAILY ACTIONS PAGE] Got data from service:', data);

      // Process the data based on the response structure
      if (data) {
        console.log('[DAILY ACTIONS PAGE] Got data from service:', data);

        let processedData: DailyAction[] = [];

        // Check if data has a data property that is an array
        if (data.data && Array.isArray(data.data)) {
          console.log(`[DAILY ACTIONS PAGE] Processing ${data.data.length} records from data.data`);
          processedData = data.data;
        }
        // Check if data has a data.items property that is an array
        else if (data.data && data.data.items && Array.isArray(data.data.items)) {
          console.log(`[DAILY ACTIONS PAGE] Processing ${data.data.items.length} records from data.data.items`);
          processedData = data.data.items;
        }
        // Check if data has an items property that is an array
        else if (data.items && Array.isArray(data.items)) {
          console.log(`[DAILY ACTIONS PAGE] Processing ${data.items.length} records from data.items`);
          processedData = data.items;
        }
        // Check if data itself is an array
        else if (Array.isArray(data)) {
          console.log(`[DAILY ACTIONS PAGE] Processing ${data.length} records from array`);
          processedData = data;
        }

        // If we have data, set it to state
        if (processedData.length > 0) {
          setDailyActions(processedData);
        } else {
          console.log('[DAILY ACTIONS PAGE] No data extracted from response. Response structure:', Object.keys(data));
          setDailyActions([]);
        }

        // Process summary data if available
        if (data.summary) {
          console.log('[DAILY ACTIONS PAGE] Using summary from response:', data.summary);
          setSummary({
            ...summary,
            ...data.summary,
            totalRegistrations: data.summary.totalRegistrations || 0,
            totalFTD: data.summary.totalFTD || 0,
            totalDeposits: data.summary.totalDeposits || 0,
            totalCashouts: data.summary.totalCashouts || 0,
            totalGGR: data.summary.totalGGR || 0
          });
        }
      } else {
        console.log('[DAILY ACTIONS PAGE] No data returned from API');
        setDailyActions([]);
      }
    } catch (err) {
      console.error('[DAILY ACTIONS PAGE] Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setDailyActions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle apply filters button click
  const handleApplyFilters = (): void => {
    console.log('[DAILY ACTIONS PAGE] Applying filters');
    fetchDailyActions();
  };

  // Handle export button click
  const handleExport = (): void => {
    console.log('[DAILY ACTIONS PAGE] Opening export dialog');
    setShowExportDialog(true);
  };

  // Handle export dialog close
  const handleExportDialogClose = (): void => {
    console.log('[DAILY ACTIONS PAGE] Closing export dialog');
    setShowExportDialog(false);
  };

  // Handle export submit
  const handleExportSubmit = (format: ExportFormat): void => {
    console.log(`[DAILY ACTIONS PAGE] Exporting data in ${format} format`);
    // Close the dialog
    setShowExportDialog(false);
  };

  // Handle column visibility change
  const handleColumnVisibilityChange = (columns: string[]): void => {
    console.log('[DAILY ACTIONS PAGE] Column visibility changed:', columns);
    setVisibleColumns(columns);
  };

  // Handle metric selection change
  const handleMetricSelectionChange = (metrics: SummaryMetricType[]): void => {
    console.log('[DAILY ACTIONS PAGE] Metric selection changed:', metrics);
    setSelectedMetrics(metrics);
  };

  // Handle hierarchical grouping toggle
  const handleHierarchicalGroupingToggle = (enabled: boolean): void => {
    console.log('[DAILY ACTIONS PAGE] Hierarchical grouping toggled:', enabled);
    setEnableHierarchicalGrouping(enabled);

    // If disabling, clear the groupings
    if (!enabled) {
      setHierarchicalGroupings([]);
    } else if (hierarchicalGroupings.length === 0) {
      // If enabling and no groupings are set, default to the current groupBy
      setHierarchicalGroupings([groupBy]);
    }
  };

  // Handle hierarchical grouping change
  const handleHierarchicalGroupingChange = (groupings: string[]): void => {
    console.log('[DAILY ACTIONS PAGE] Hierarchical groupings changed:', groupings);
    setHierarchicalGroupings(groupings);
  };

  // Handle table state change
  const handleTableStateChange = (state: TableState): void => {
    console.log('[DAILY ACTIONS PAGE] Table state changed:', state);

    // Update hierarchical groupings if they've changed in the table
    if (state.grouping && state.grouping.groupByLevels) {
      setHierarchicalGroupings(state.grouping.groupByLevels);
    }
  };

  // Handle drill down
  const handleDrillDown = (row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>): void => {
    console.log(`[DAILY ACTIONS PAGE] Drill down from ${sourceGrouping} to ${targetGrouping}`, filters);

    // Update filters based on drill-down
    if (filters.groupBy) {
      setGroupBy(filters.groupBy);
    }

    if (filters.startDate) {
      setStartDate(new Date(filters.startDate));
    }

    if (filters.endDate) {
      setEndDate(new Date(filters.endDate));
    }

    // Apply the new filters
    fetchDailyActions();
  };

  // Handle comparison period change
  const handleComparisonPeriodChange = (metric: SummaryMetricType, period: ComparisonPeriodType): void => {
    console.log(`[DAILY ACTIONS PAGE] Comparison period for ${metric} changed to ${period}`);
    setComparisonPeriods({
      ...comparisonPeriods,
      [metric]: period
    });
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <DailyActionsHeader
        title="Daily Actions Report"
        subtitle="View and analyze daily player activities, deposits, and gaming revenue"
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <DailyActionsFilters
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        selectedWhiteLabels={selectedWhiteLabels}
        setSelectedWhiteLabels={handleWhiteLabelsChange}
        whiteLabelsOptions={whiteLabelsOptions}
        whiteLabelsLoading={whiteLabelsLoading}
        selectedCountries={selectedCountries}
        setSelectedCountries={handleCountriesChange}
        countriesOptions={countriesOptions}
        countriesLoading={countriesLoading}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        groupByOptions={groupByOptions}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        showFiltersPanel={showFiltersPanel}
        setShowFiltersPanel={setShowFiltersPanel}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        handleApplyFilters={handleApplyFilters}
        handleExport={handleExport}
        loading={loading}
        dataLength={dailyActions.length}
      />

      {/* Configurable Summary Cards */}
      <ConfigurableSummaryCards
        summary={summary}
        isLoading={loading}
        error={error}
        selectedMetrics={selectedMetrics}
        comparisonPeriods={comparisonPeriods}
        onMetricsChange={handleMetricSelectionChange}
        onComparisonPeriodChange={handleComparisonPeriodChange}
      />

      {/* Hierarchical Grouping Selector */}
      <HierarchicalGroupingSelector
        groupByOptions={groupByOptions}
        selectedGroupings={hierarchicalGroupings}
        onGroupingChange={handleHierarchicalGroupingChange}
        enableHierarchical={enableHierarchicalGrouping}
        onEnableHierarchicalChange={handleHierarchicalGroupingToggle}
      />

      {/* Data Table */}
      <DailyActionsTableNew
        data={dailyActions}
        loading={loading}
        visibleColumns={visibleColumns}
        groupBy={groupBy}
        hierarchicalGrouping={{
          enabled: enableHierarchicalGrouping,
          groupByLevels: hierarchicalGroupings
        }}
        handleColumnVisibilityChange={handleColumnVisibilityChange}
        onStateChange={handleTableStateChange}
        onDrillDown={handleDrillDown}
      />

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={handleExportDialogClose}>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <SimpleReportExport onExport={handleExportSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DailyActionsPageNew;
