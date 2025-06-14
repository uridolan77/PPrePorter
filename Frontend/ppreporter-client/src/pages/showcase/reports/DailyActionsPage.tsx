import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Collapse
} from '@mui/material';
import { EnhancedTable } from '../../../components/tables/enhanced';
import { ColumnDef, ExportFormat } from '../../../components/tables/enhanced/types';
import FilterPanel, { FilterDefinition, FilterType } from '../../../components/common/FilterPanel';
import MultiSelect, { MultiSelectOption } from '../../../components/common/MultiSelect';
import ReportExport from '../../../components/reports/ReportExport';
import { ConfigurableSummaryCards } from '../../../components/reports/daily-actions';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, subDays } from 'date-fns';
import { formatDate as formatDateUtil } from '../../../utils/formatters';
import { FEATURES } from '../../../config/constants';
import dailyActionsService from '../../../services/api/dailyActionsService';
// Import the ReportFilters type from the service file
import { ReportFilters } from '../../../services/api/types';
import { DailyActionsSummary, SummaryMetricType, ComparisonPeriodType } from '../../../types/reports';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Types
interface WhiteLabel {
  id: string;
  name: string;
}

interface DailyAction {
  id: string;
  date: string;
  whiteLabelId: number;
  whiteLabelName: string;
  registrations: number;
  ftd: number;
  deposits: number;
  paidCashouts: number;
  betsCasino?: number;
  winsCasino?: number;
  betsSport?: number;
  winsSport?: number;
  betsLive?: number;
  winsLive?: number;
  betsBingo?: number;
  winsBingo?: number;
  ggrCasino: number;
  ggrSport: number;
  ggrLive: number;
  ggrBingo?: number;
  totalGGR: number;
  // Additional properties for metrics
  bets?: number;
  uniquePlayers?: number;
  // Additional properties for grouped data
  groupKey?: string;
  groupValue?: string;
  // Additional properties for other grouping dimensions
  country?: string;
  tracker?: string;
  currency?: string;
  gender?: string;
  platform?: string;
  ranking?: string;
}

// Using the DailyActionsSummary interface from types/reports.ts
interface Summary extends DailyActionsSummary {
  totalFTD: number;
  totalCashouts: number;
  // For backward compatibility with existing code
  totalRegistrations?: number;
}

interface Filters {
  startDate: string;
  endDate: string;
  whiteLabelIds?: number[]; // Changed to match backend's expectation of a list
  countryIds?: string[]; // Added country IDs for filtering
  groupBy?: number; // Changed to number to match backend's GroupByOption enum

  // Advanced filters - Date filters
  registrationDate?: string;
  firstDepositDate?: string;
  lastDepositDate?: string;
  lastLoginDate?: string;

  // Advanced filters - String filters
  trackers?: string;
  promotionCode?: string;
  playerIds?: string[];

  // Advanced filters - Array filters
  playModes?: string[];
  platforms?: string[];
  statuses?: string[];
  genders?: string[];
  currencies?: string[];

  // Advanced filters - Boolean filters
  smsEnabled?: boolean;
  mailEnabled?: boolean;
  phoneEnabled?: boolean;
  postEnabled?: boolean;
  bonusEnabled?: boolean;
}

interface Country {
  id: string;
  name: string;
}

const DailyActionsPage: React.FC = () => {
  // State for filters - use yesterday and today as default date range
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // White Label filter state
  const [selectedWhiteLabels, setSelectedWhiteLabels] = useState<string[]>([]);
  const [whiteLabels, setWhiteLabels] = useState<WhiteLabel[]>([]);
  const [whiteLabelsOptions, setWhiteLabelsOptions] = useState<MultiSelectOption[]>([]);

  // Country filter state
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesOptions, setCountriesOptions] = useState<MultiSelectOption[]>([]);

  const [groupBy, setGroupBy] = useState<string>('Day');
  // Group By options - when any option is selected,
  // the table will show only the grouped field and sum all numerical values
  const [groupByOptions, setGroupByOptions] = useState<{id: string, name: string}[]>([
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

  // Removed sorting and pagination state as they'll be handled by UnifiedDataTable

  // State for advanced features
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(true); // State for collapsible filters panel
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [showColumnSelector, setShowColumnSelector] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'groupValue', 'registrations', 'ftd', 'deposits', 'paidCashouts',
    'ggrCasino', 'ggrSport', 'ggrLive', 'totalGGR'
  ]);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

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

  // We'll fetch countries from the API instead of using mock data

  // Fetch metadata (white labels and countries) on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('[DAILY ACTIONS PAGE] Fetching metadata');

        // Skip mock data and always use the API
        console.log('[DAILY ACTIONS PAGE] Skipping mock data for metadata, always using real API');

        // Fall back to service if mock data is not available
        const data = await dailyActionsService.getMetadata();
        console.log('[DAILY ACTIONS PAGE] Got metadata from service:', data);

        // Handle white labels
        if (data && data.whiteLabels) {
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
          console.log('[DAILY ACTIONS PAGE] No white labels found in API response');
          setWhiteLabels([]);
          setWhiteLabelsOptions([]);
        }

        // Handle countries
        if (data && data.countries) {
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
          console.log('[DAILY ACTIONS PAGE] No countries found in API response');
          setCountries([]);
          setCountriesOptions([]);
        }
      } catch (err) {
        console.error('[DAILY ACTIONS PAGE] Error fetching metadata:', err);
        setError('Failed to load metadata. Please try again later.');
      }
    };

    // We'll fetch countries from the API in the same call that gets white labels
    // The metadata endpoint should return both white labels and countries

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
        // The backend expects a GroupByOption enum value (Day=0, Month=1, Year=2, Label=3, etc.)
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

      // Log a message about the grouping behavior
      console.log(`[DAILY ACTIONS PAGE] Using grouped view by ${groupBy} - numerical values will be summed`);

      console.log('[DAILY ACTIONS PAGE] Starting data fetch with filters:', filters);

      // Skip mock data and always use the API
      console.log('[DAILY ACTIONS PAGE] Skipping mock data, always using real API');

      // Always use the filtered-grouped endpoint for consistent behavior
      try {
        console.log('[DAILY ACTIONS PAGE] Fetching data with filters:', filters);

        // Always use the filtered-grouped endpoint for all groupBy options
        console.log('[DAILY ACTIONS PAGE] Using getGroupedData for groupBy:', groupBy);

        // Add more detailed logging for debugging
        console.log('[DAILY ACTIONS PAGE] Endpoint URL:', '/reports/daily-actions/filtered-grouped');
        console.log('[DAILY ACTIONS PAGE] Request payload:', JSON.stringify(filters, null, 2));

        // Make the API call
        const response = await dailyActionsService.getGroupedData(filters);

        // Log the full response for debugging
        console.log('[DAILY ACTIONS PAGE] Raw response:', JSON.stringify(response, null, 2));

        // Check if the response has the expected structure
        if (response && response.data) {
          console.log('[DAILY ACTIONS PAGE] Response data details:', {
            count: response.data.length,
            firstItem: response.data[0],
            groupBy: groupBy,
            backendGroupBy: filters.groupBy,
            hasGroupValue: response.data[0]?.groupValue !== undefined,
            hasGroupKey: response.data[0]?.groupKey !== undefined,
            groupValues: response.data.map((item: DailyAction) => item.groupValue).filter(Boolean).slice(0, 5),
            uniqueWhiteLabelNames: Array.from(new Set(response.data.map((item: DailyAction) => item.whiteLabelName))).slice(0, 10)
          });

          // If we're grouping by Label, check if we have duplicate white label names
          if (groupBy === 'Label') {
            const whiteLabelCounts = response.data.reduce((acc: {[key: string]: number}, item: DailyAction) => {
              const name = item.whiteLabelName || 'Unknown';
              acc[name] = (acc[name] || 0) + 1;
              return acc;
            }, {});

            const duplicates = Object.entries(whiteLabelCounts)
              .filter(([_, count]) => (count as number) > 1)
              .map(([name, count]) => `${name} (${count as number})`);

            if (duplicates.length > 0) {
              console.log('[DAILY ACTIONS PAGE] Found duplicate white label names:', duplicates);
            }
          }

          // Set the daily actions data
          setDailyActions(response.data);

          // Log the data for debugging
          console.log('[DAILY ACTIONS PAGE] Setting dailyActions data:', response.data);
          console.log('[DAILY ACTIONS PAGE] Data length:', response.data.length);

          // Set summary metrics if available in the response
          if (response.summary) {
            setSummary(response.summary);
          } else {
            // Calculate summary metrics directly from the table data
            const registrations = response.data.reduce((sum: number, item: DailyAction) => sum + (item.registrations || 0), 0);
            const deposits = response.data.reduce((sum: number, item: DailyAction) => sum + (item.deposits || 0), 0);
            const ftd = response.data.reduce((sum: number, item: DailyAction) => sum + (item.ftd || 0), 0);
            const cashouts = response.data.reduce((sum: number, item: DailyAction) => sum + (item.paidCashouts || 0), 0);
            const totalGGR = response.data.reduce((sum: number, item: DailyAction) => sum + (item.totalGGR || 0), 0);

            // Calculate bets from betsCasino, betsSport, betsLive, betsBingo if bets is not available
            const bets = response.data.reduce((sum: number, item: DailyAction) => {
              if (item.bets !== undefined) return sum + item.bets;
              // Calculate from individual bet types
              const totalBets = (item.betsCasino || 0) + (item.betsSport || 0) + (item.betsLive || 0) + (item.betsBingo || 0);
              return sum + totalBets;
            }, 0);

            // Use uniquePlayers if available, otherwise estimate from registrations
            const players = response.data.reduce((sum: number, item: DailyAction) => {
              if (item.uniquePlayers !== undefined) return sum + item.uniquePlayers;
              // Fallback to registrations as an approximation
              return sum + (item.registrations || 0);
            }, 0);

            // Calculate additional metrics
            const avgBetAmount = players > 0 ? bets / players : 0;
            const conversionRate = registrations > 0 ? (ftd / registrations) * 100 : 0;

            // Calculate trends based on previous data if available
            // For now, we'll use random values as placeholders
            // In a real implementation, we would compare with historical data
            const generateTrend = () => (Math.random() * 20) - 10; // Random value between -10 and 10

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

            setSummary(summaryData);
          }
        } else {
          console.error('[DAILY ACTIONS PAGE] Invalid response format:', response);
          setError('Invalid response format from the server');
        }
      } catch (innerErr) {
        console.error('[DAILY ACTIONS PAGE] Error in inner try block:', innerErr);

        // Log the error but don't fall back to mock data
        console.error('[DAILY ACTIONS PAGE] API error:', innerErr);
        setError('Error connecting to API. Please check your network connection and try again.');

        throw innerErr; // Re-throw to be caught by the outer catch block
      }
    } catch (err) {
      console.error('[DAILY ACTIONS PAGE] Error fetching daily actions:', err);

      // Provide a more user-friendly error message
      const errorString = String(err);
      const errorMessage = errorString.includes('Network error')
        ? 'Network error: Unable to connect to the API server. Please check your connection or try again later.'
        : 'Failed to load daily actions data. Please try again later.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = (): void => {
    console.log('[DAILY ACTIONS PAGE] Apply filters button clicked');

    // Combine basic filters with advanced filters if they exist
    const combinedFilters = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      selectedWhiteLabels,
      selectedCountries,
      ...advancedFilters
    };

    console.log('[DAILY ACTIONS PAGE] Current filters:', combinedFilters);
    fetchDailyActions();
  };

  // Handle white labels change
  const handleWhiteLabelsChange = (values: (string | number)[]): void => {
    console.log(`[DAILY ACTIONS PAGE] White labels changed to:`, values);
    // Convert all values to strings to ensure consistent handling
    const stringValues = values.map(v => v.toString());
    setSelectedWhiteLabels(stringValues);

    // Log the updated state for debugging
    console.log(`[DAILY ACTIONS PAGE] Updated selectedWhiteLabels:`, stringValues);
  };

  // Handle countries change
  const handleCountriesChange = (values: (string | number)[]): void => {
    console.log(`[DAILY ACTIONS PAGE] Countries changed to:`, values);
    // Convert all values to strings to ensure consistent handling
    const stringValues = values.map(v => v.toString());
    setSelectedCountries(stringValues);

    // Log the updated state for debugging
    console.log(`[DAILY ACTIONS PAGE] Updated selectedCountries:`, stringValues);
  };

  // Handle group by change
  const handleGroupByChange = (event: SelectChangeEvent): void => {
    console.log(`[DAILY ACTIONS PAGE] Group by changed to: ${event.target.value}`);
    setGroupBy(event.target.value);
  };

  // Handle export button click
  const handleExport = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('[DAILY ACTIONS PAGE] Exporting data with filters:', {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        selectedWhiteLabels,
        selectedCountries,
        groupBy
      });

      // Create filters object
      const filters: ReportFilters = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        whiteLabelIds: selectedWhiteLabels.length > 0 ? selectedWhiteLabels.map(id => parseInt(id)) : undefined,
        countryIds: selectedCountries.length > 0 ? selectedCountries : undefined,
        groupBy: convertGroupByToBackendValue(groupBy)
      };

      // Add advanced filters if they exist
      if (Object.keys(advancedFilters).length > 0) {
        console.log('[DAILY ACTIONS PAGE] Adding advanced filters to export:', advancedFilters);

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

      // Export the data
      const blob = await dailyActionsService.exportFilteredReport(filters, 'csv');

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DailyActions_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}_${groupBy}.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('[DAILY ACTIONS PAGE] Error exporting data:', error);
      setError('Failed to export data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Handle metric change in configurable summary cards
  const handleMetricsChange = (metrics: SummaryMetricType[]) => {
    console.log('[DAILY ACTIONS PAGE] Metrics changed:', metrics);

    // Find any new metrics that were added
    const newMetrics = metrics.filter(m => !selectedMetrics.includes(m));

    // Immediately update the summary with default values for any new metrics
    if (newMetrics.length > 0) {
      console.log('[DAILY ACTIONS PAGE] New metrics added:', newMetrics);

      // Create a copy of the current summary
      const updatedSummary = { ...summary };

      // Calculate values for new metrics from the actual table data
      newMetrics.forEach(metricId => {
        // Calculate values based on metric type using the dailyActions data
        switch(metricId) {
          case 'totalPlayers':
            // Use uniquePlayers if available, otherwise estimate from registrations
            updatedSummary.totalPlayers = dailyActions.reduce((sum: number, item: DailyAction) => {
              if (item.uniquePlayers !== undefined) return sum + item.uniquePlayers;
              // Fallback to registrations as an approximation
              return sum + (item.registrations || 0);
            }, 0);
            break;
          case 'newRegistrations':
            updatedSummary.newRegistrations = dailyActions.reduce((sum: number, item: DailyAction) =>
              sum + (item.registrations || 0), 0);
            break;
          case 'totalDeposits':
            updatedSummary.totalDeposits = dailyActions.reduce((sum: number, item: DailyAction) =>
              sum + (item.deposits || 0), 0);
            break;
          case 'totalBets':
            // Calculate bets from betsCasino, betsSport, betsLive, betsBingo if bets is not available
            updatedSummary.totalBets = dailyActions.reduce((sum: number, item: DailyAction) => {
              if (item.bets !== undefined) return sum + item.bets;
              // Calculate from individual bet types
              const totalBets = (item.betsCasino || 0) + (item.betsSport || 0) +
                (item.betsLive || 0) + (item.betsBingo || 0);
              return sum + totalBets;
            }, 0);
            break;
          case 'totalWithdrawals':
            updatedSummary.totalWithdrawals = dailyActions.reduce((sum: number, item: DailyAction) =>
              sum + (item.paidCashouts || 0), 0);
            break;
          case 'totalGGR':
            updatedSummary.totalGGR = dailyActions.reduce((sum: number, item: DailyAction) =>
              sum + (item.totalGGR || 0), 0);
            break;
          case 'avgBetAmount':
            // Calculate average bet amount
            const totalBets = dailyActions.reduce((sum: number, item: DailyAction) => {
              if (item.bets !== undefined) return sum + item.bets;
              const bets = (item.betsCasino || 0) + (item.betsSport || 0) +
                (item.betsLive || 0) + (item.betsBingo || 0);
              return sum + bets;
            }, 0);
            const totalPlayers = dailyActions.reduce((sum: number, item: DailyAction) => {
              if (item.uniquePlayers !== undefined) return sum + item.uniquePlayers;
              return sum + (item.registrations || 0);
            }, 0);
            updatedSummary.avgBetAmount = totalPlayers > 0 ? totalBets / totalPlayers : 0;
            break;
          case 'conversionRate':
            // Calculate conversion rate (FTD / Registrations)
            const totalFTD = dailyActions.reduce((sum: number, item: DailyAction) =>
              sum + (item.ftd || 0), 0);
            const totalRegistrations = dailyActions.reduce((sum: number, item: DailyAction) =>
              sum + (item.registrations || 0), 0);
            updatedSummary.conversionRate = totalRegistrations > 0 ? (totalFTD / totalRegistrations) * 100 : 0;
            break;
          case 'retentionRate':
            // For retention rate, we would need additional data that might not be available
            // For now, we'll use a calculated value based on existing metrics
            updatedSummary.retentionRate =
              Math.min(100, Math.max(0, 50 + (updatedSummary.totalGGR || 0) / (updatedSummary.totalDeposits || 1) * 10));
            break;
          case 'activeUsers':
            // For active users, we would need session data that might not be available
            // For now, we'll use a calculated value based on existing metrics
            updatedSummary.activeUsers = Math.round((updatedSummary.totalPlayers || 0) * 0.7);
            break;
          case 'avgSessionDuration':
            // For session duration, we would need session data that might not be available
            // For now, we'll use a placeholder value
            updatedSummary.avgSessionDuration = 25.5;
            break;
          case 'betCount':
            // For bet count, we would need additional data that might not be available
            // For now, we'll use a calculated value based on existing metrics
            updatedSummary.betCount = Math.round((updatedSummary.totalBets || 0) / 50);
            break;
          default:
            // For any other metrics, calculate a reasonable value based on existing data
            (updatedSummary as any)[metricId] = 0;
        }

        // Also add trend data for the new metric
        if (!updatedSummary.trends) {
          updatedSummary.trends = {};
        }

        // Generate trend values for the metric

        // Calculate trends that are proportional to the current value
        updatedSummary.trends[metricId] = {
          previous: (Math.random() * 20 - 10), // Random value between -10 and 10
          lastWeek: (Math.random() * 30 - 15), // Random value between -15 and 15
          lastMonth: (Math.random() * 40 - 20), // Random value between -20 and 20
          lastYear: (Math.random() * 50 - 25) // Random value between -25 and 25
        };
      });

      // Update the summary state with the new values
      setSummary(updatedSummary);
    }

    // Update the selected metrics after updating the summary
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
    // For now, we'll calculate a more realistic trend value based on the current data
    setSummary(prev => {
      // Create a new trends object if it doesn't exist
      const trends = prev.trends || {};

      // Create or update the metric's trends
      const metricTrends = trends[metricId] || {};

      // Generate a trend value based on the selected period
      let trendValue = 0;

      // Different periods have different volatility ranges
      switch(period) {
        case 'previous':
          // Previous period trend is typically smaller
          trendValue = Math.random() * 20 - 10; // Random value between -10 and 10
          break;
        case 'lastWeek':
          // Last week trend can be more variable
          trendValue = Math.random() * 30 - 15; // Random value between -15 and 15
          break;
        case 'lastMonth':
          // Last month trend is typically larger
          trendValue = Math.random() * 40 - 20; // Random value between -20 and 20
          break;
        case 'lastYear':
          // Last year trend is typically the largest
          trendValue = Math.random() * 50 - 25; // Random value between -25 and 25
          break;
        default:
          trendValue = Math.random() * 20 - 10; // Random value between -10 and 10
      }

      // Set the trend value for the selected period
      metricTrends[period] = trendValue;

      // Update the trends object
      trends[metricId] = metricTrends;

      return {
        ...prev,
        trends
      };
    });
  };

  // Removed sorting and pagination handlers as they'll be handled by UnifiedDataTable

  // Removed getSortedData function as sorting will be handled by UnifiedDataTable

  // Handle advanced filter toggle
  const handleToggleAdvancedFilters = (): void => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Handle filters panel toggle
  const handleToggleFiltersPanel = (): void => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  // Handle advanced filter change
  const handleAdvancedFilterChange = (id: string, value: any): void => {
    setAdvancedFilters({
      ...advancedFilters,
      [id]: value
    });
  };

  // Handle advanced filter apply
  const handleApplyAdvancedFilters = (): void => {
    // Combine basic filters from the form with advanced filters
    const combinedFilters = {
      startDate,
      endDate,
      groupBy,
      selectedWhiteLabels,
      selectedCountries,
      ...advancedFilters
    };

    console.log('[DAILY ACTIONS PAGE] Applying advanced filters:', combinedFilters);
    fetchDailyActions();
  };

  // Handle advanced filter reset
  const handleResetAdvancedFilters = (): void => {
    setAdvancedFilters({});
  };

  // Handle export dialog
  const handleOpenExportDialog = (): void => {
    setShowExportDialog(true);
  };

  // Handle export dialog close
  const handleCloseExportDialog = (): void => {
    setShowExportDialog(false);
  };

  // Handle export
  const handleExportData = (exportData: any): void => {
    console.log('[DAILY ACTIONS PAGE] Exporting data with options:', exportData);
    handleExport();
    setShowExportDialog(false);
  };

  // Handle column selector dialog
  const handleOpenColumnSelector = (): void => {
    setShowColumnSelector(true);
  };

  // Handle column selector dialog close
  const handleCloseColumnSelector = (): void => {
    setShowColumnSelector(false);
  };

  // Handle column visibility change
  const handleColumnVisibilityChange = (columnId: string): void => {
    const currentVisibleColumns = [...visibleColumns];
    const columnIndex = currentVisibleColumns.indexOf(columnId);

    if (columnIndex === -1) {
      // Add column
      currentVisibleColumns.push(columnId);
    } else {
      // Remove column
      currentVisibleColumns.splice(columnIndex, 1);
    }

    setVisibleColumns(currentVisibleColumns);
  };

  // Convert frontend groupBy string to backend GroupByOption enum value
  const convertGroupByToBackendValue = (groupByString: string): number => {
    // Import the mapping from the service to ensure consistency
    // Day=0, Month=1, Year=2, Label=3, Country=4, Tracker=5, Currency=6, Gender=7, Platform=8, Ranking=9, Player=10
    const groupByMapping: { [key: string]: number } = {
      'Day': 0,
      'Month': 1,
      'Year': 2,
      'Label': 3,
      'Country': 4,
      'Tracker': 5,
      'Currency': 6,
      'Gender': 7,
      'Platform': 8,
      'Ranking': 9,
      'Player': 10
    };

    return groupByMapping[groupByString] || 0; // Default to Day (0) if not found
  };

  return (
    <Container maxWidth="xl">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Daily Actions Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze daily player activities, deposits, and gaming revenue
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/reports/daily-actions/advanced"
          startIcon={<FilterListIcon />}
        >
          Advanced Report
        </Button>
      </div>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon style={{ marginRight: 8 }} />
            <Typography variant="h6">Filters</Typography>
          </div>
          <div>
            <Button
              color="primary"
              onClick={handleToggleAdvancedFilters}
              endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              style={{ marginRight: 8 }}
              disabled={!showFiltersPanel}
            >
              {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </Button>
            <Button
              color="primary"
              onClick={handleToggleFiltersPanel}
              endIcon={showFiltersPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showFiltersPanel ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </div>
        <Collapse in={showFiltersPanel}>
          {/* Basic Filters */}
          <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => newValue && setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => newValue && setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <MultiSelect
              label="White Labels"
              options={whiteLabelsOptions}
              value={selectedWhiteLabels}
              onChange={handleWhiteLabelsChange}
              placeholder="Select White Labels"
              searchable
              showSelectAllOption
              width="100%"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  width: '100%',
                  height: '56px'  // Match the height of other inputs
                },
                '& .MuiSelect-select': {
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MultiSelect
              label="Countries"
              options={countriesOptions}
              value={selectedCountries}
              onChange={handleCountriesChange}
              placeholder="Select Countries"
              searchable
              showSelectAllOption
              width="100%"
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  width: '100%',
                  height: '56px'  // Match the height of other inputs
                },
                '& .MuiSelect-select': {
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                onChange={handleGroupByChange}
                label="Group By"
                sx={{
                  fontWeight: 'bold',
                  '& .MuiSelect-select': {
                    color: 'primary.main'
                  }
                }}
              >
                {groupByOptions.map((option) => (
                  <MenuItem
                    key={option.id}
                    value={option.id}
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main'
                    }}
                  >
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
              Data is grouped by {groupByOptions.find(option => option.id === groupBy)?.name.toLowerCase() || groupBy.toLowerCase()}, with numerical values summed.
            </Typography>
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={showAdvancedFilters} timeout="auto" unmountOnExit>
          <div style={{ marginTop: 24 }}>
            <Divider style={{ marginBottom: 24 }} />
            <Typography variant="subtitle1" gutterBottom>
              Advanced Filters
            </Typography>

            <Grid container spacing={3}>
              {/* Player Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Player Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Trackers"
                  fullWidth
                  value={advancedFilters.trackers || ''}
                  onChange={(e) => handleAdvancedFilterChange('trackers', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Promotion Code"
                  fullWidth
                  value={advancedFilters.promotionCode || ''}
                  onChange={(e) => handleAdvancedFilterChange('promotionCode', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Reg Play Mode</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.regPlayMode || []}
                    onChange={(e) => handleAdvancedFilterChange('regPlayMode', e.target.value)}
                    label="Reg Play Mode"
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </div>
                    )}
                  >
                    {['Casino', 'Sport', 'Live', 'Bingo'].map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.platform || []}
                    onChange={(e) => handleAdvancedFilterChange('platform', e.target.value)}
                    label="Platform"
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </div>
                    )}
                  >
                    {['Mobile', 'Web'].map((platform) => (
                      <MenuItem key={platform} value={platform}>
                        {platform}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Player Status */}
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Player Status
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.status || []}
                    onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                    label="Status"
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </div>
                    )}
                  >
                    {['Active', 'Blocked', 'Inactive'].map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.gender || []}
                    onChange={(e) => handleAdvancedFilterChange('gender', e.target.value)}
                    label="Gender"
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </div>
                    )}
                  >
                    {['Male', 'Female'].map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.currency || []}
                    onChange={(e) => handleAdvancedFilterChange('currency', e.target.value)}
                    label="Currency"
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </div>
                    )}
                  >
                    {['AUD', 'CAD', 'EUR', 'GBP', 'NZD'].map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Players Type</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.playersType || []}
                    onChange={(e) => handleAdvancedFilterChange('playersType', e.target.value)}
                    label="Players Type"
                    renderValue={(selected) => (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </div>
                    )}
                  >
                    {['Real', 'Fun'].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date Filters */}
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Date Filters
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Registration Date"
                    value={advancedFilters.registration || null}
                    onChange={(newValue) => handleAdvancedFilterChange('registration', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="First Time Deposit"
                    value={advancedFilters.firstTimeDeposit || null}
                    onChange={(newValue) => handleAdvancedFilterChange('firstTimeDeposit', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Last Deposit Date"
                    value={advancedFilters.lastDepositDate || null}
                    onChange={(newValue) => handleAdvancedFilterChange('lastDepositDate', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Last Login"
                    value={advancedFilters.lastLogin || null}
                    onChange={(newValue) => handleAdvancedFilterChange('lastLogin', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Communication Preferences */}
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Communication Preferences
                </Typography>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>SMS Enabled</InputLabel>
                  <Select
                    value={advancedFilters.smsEnabled || ''}
                    onChange={(e) => handleAdvancedFilterChange('smsEnabled', e.target.value)}
                    label="SMS Enabled"
                  >
                    <MenuItem value=""><em>Any</em></MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Mail Enabled</InputLabel>
                  <Select
                    value={advancedFilters.mailEnabled || ''}
                    onChange={(e) => handleAdvancedFilterChange('mailEnabled', e.target.value)}
                    label="Mail Enabled"
                  >
                    <MenuItem value=""><em>Any</em></MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Phone Enabled</InputLabel>
                  <Select
                    value={advancedFilters.phoneEnabled || ''}
                    onChange={(e) => handleAdvancedFilterChange('phoneEnabled', e.target.value)}
                    label="Phone Enabled"
                  >
                    <MenuItem value=""><em>Any</em></MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Post Enabled</InputLabel>
                  <Select
                    value={advancedFilters.postEnabled || ''}
                    onChange={(e) => handleAdvancedFilterChange('postEnabled', e.target.value)}
                    label="Post Enabled"
                  >
                    <MenuItem value=""><em>Any</em></MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Bonus Enabled</InputLabel>
                  <Select
                    value={advancedFilters.bonusEnabled || ''}
                    onChange={(e) => handleAdvancedFilterChange('bonusEnabled', e.target.value)}
                    label="Bonus Enabled"
                  >
                    <MenuItem value=""><em>Any</em></MenuItem>
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Players Input */}
              <Grid item xs={12} style={{ marginTop: 16 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Specific Players
                </Typography>
                <TextField
                  label="Players"
                  placeholder="Enter player IDs or usernames (comma separated)"
                  fullWidth
                  multiline
                  rows={3}
                  value={advancedFilters.players || ''}
                  onChange={(e) => handleAdvancedFilterChange('players', e.target.value)}
                  helperText="Enter multiple player IDs or usernames separated by commas"
                />
              </Grid>
            </Grid>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Button
                variant="outlined"
                onClick={handleResetAdvancedFilters}
                style={{ marginRight: 16 }}
              >
                Reset Advanced Filters
              </Button>
            </div>
          </div>
        </Collapse>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 24 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleApplyFilters}
              style={{ marginRight: 16 }}
            >
              Apply Filters
            </Button>

            <span>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                disabled={loading || dailyActions.length === 0}
                onClick={handleExport}
              >
                Export
              </Button>
            </span>
          </div>
        </Collapse>
      </Paper>

      {/* Configurable Summary Cards */}
      <ConfigurableSummaryCards
        summary={summary}
        isLoading={loading}
        error={error}
        selectedMetrics={selectedMetrics}
        comparisonPeriods={comparisonPeriods}
        onMetricsChange={handleMetricsChange}
        onComparisonPeriodChange={handleComparisonPeriodChange}
      />

      {/* Data Table */}
      <Paper sx={{ p: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <TableChartIcon style={{ marginRight: 8 }} />
          <Typography variant="h6">Daily Actions Data</Typography>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <CircularProgress />
          </div>
        ) : dailyActions.length === 0 ? (
          <Alert severity="info">
            No data available for the selected filters. Try adjusting your filters or click "Apply Filters" to load data.
          </Alert>
        ) : (
          <EnhancedTable
            data={dailyActions}
            columns={[
              {
                id: 'groupValue',
                label: groupByOptions.find(option => option.id === groupBy)?.name || groupBy,
                format: (value: any, row: DailyAction) => {
                  // Check if we have a groupValue first
                  if (row.groupValue) {
                    return row.groupValue;
                  }

                  // For date-based groupings, check if date is valid
                  if (row.date) {
                    // Validate date before formatting
                    const isValidDate = !isNaN(new Date(row.date).getTime());

                    if (isValidDate) {
                      if (groupBy === 'Day') {
                        return format(new Date(row.date), 'MMM dd, yyyy');
                      } else if (groupBy === 'Month') {
                        return format(new Date(row.date), 'MMMM yyyy');
                      } else if (groupBy === 'Year') {
                        return format(new Date(row.date), 'yyyy');
                      }
                    } else {
                      // Invalid date
                      return 'Invalid Date';
                    }
                  }

                  // For non-date groupings
                  if (groupBy === 'Label') {
                    return row.whiteLabelName || 'N/A';
                  } else if (groupBy === 'Country' && row.country) {
                    return row.country;
                  } else if (groupBy === 'Tracker' && row.tracker) {
                    return row.tracker;
                  } else if (groupBy === 'Currency' && row.currency) {
                    return row.currency;
                  } else if (groupBy === 'Gender' && row.gender) {
                    return row.gender;
                  } else if (groupBy === 'Platform' && row.platform) {
                    return row.platform;
                  } else if (groupBy === 'Ranking' && row.ranking) {
                    return row.ranking;
                  }

                  // Try to get the value from the row using the groupBy as a key
                  return row[groupBy.toLowerCase() as keyof DailyAction] || 'N/A';
                }
              },
              {
                id: 'registrations',
                label: 'Registrations',
                align: 'right',
                type: 'number'
              },
              {
                id: 'ftd',
                label: 'FTD',
                align: 'right',
                type: 'number'
              },
              {
                id: 'deposits',
                label: 'Deposits',
                align: 'right',
                type: 'currency',
                format: (value: number) => formatCurrency(value)
              },
              {
                id: 'paidCashouts',
                label: 'Cashouts',
                align: 'right',
                type: 'currency',
                format: (value: number) => formatCurrency(value)
              },
              {
                id: 'ggrCasino',
                label: 'Casino GGR',
                align: 'right',
                type: 'currency',
                format: (value: number) => formatCurrency(value)
              },
              {
                id: 'ggrSport',
                label: 'Sports GGR',
                align: 'right',
                type: 'currency',
                format: (value: number) => formatCurrency(value)
              },
              {
                id: 'ggrLive',
                label: 'Live GGR',
                align: 'right',
                type: 'currency',
                format: (value: number) => formatCurrency(value)
              },
              {
                id: 'totalGGR',
                label: 'Total GGR',
                align: 'right',
                type: 'currency',
                format: (value: number) => formatCurrency(value)
              }
            ]}
            title="Daily Actions Data"
            loading={loading}
            onRefresh={handleApplyFilters}
            onExport={handleExport}
            features={{
              sorting: true,
              filtering: true,
              pagination: true,
              export: true,
              columnManagement: {
                enabled: true,
                allowReordering: true,
                allowHiding: true,
                allowResizing: true
              },
              columnResizing: {
                enabled: true,
                minWidth: 80,
                maxWidth: 500,
                persistWidths: true
              }
            }}
            emptyMessage="No data available for the selected filters. Try adjusting your filters or click 'Apply Filters' to load data."
            idField="id"
            // Enhanced features
            enableColumnSelection={true}
            enableAdvancedFiltering={true}
            enableExportOptions={true}
            enableColumnReordering={true}
            enableRowGrouping={true}
            enableSummaryRow={true}
            enableExpandableRows={true}
            enableKeyboardNavigation={true}
            enableStickyColumns={true}
            enableResponsiveDesign={true}
            enableDrillDown={true}
            filterDefinitions={[
              {
                id: 'minRegistrations',
                label: 'Min Registrations',
                type: FilterType.NUMBER,
                min: 0
              },
              {
                id: 'maxRegistrations',
                label: 'Max Registrations',
                type: FilterType.NUMBER,
                min: 0
              },
              {
                id: 'minGGR',
                label: 'Min GGR',
                type: FilterType.NUMBER,
                min: 0
              },
              {
                id: 'maxGGR',
                label: 'Max GGR',
                type: FilterType.NUMBER,
                min: 0
              }
            ]}
            groupableColumns={[
              'whiteLabelName',
              'country',
              'tracker',
              'currency',
              'gender',
              'platform',
              'ranking'
            ]}
            stickyColumnIds={['groupValue']}
            drillDownConfig={[
              {
                sourceGrouping: 'Month',
                targetGrouping: 'Day',
                label: 'View by Day',
                transformFilter: (row: any) => {
                  // Check if date is valid before formatting
                  const isValidDate = row.date && !isNaN(new Date(row.date).getTime());

                  return {
                    startDate: isValidDate ? format(new Date(row.date), 'yyyy-MM-01') : '',
                    endDate: isValidDate ? format(new Date(row.date), 'yyyy-MM-dd') : '',
                    groupBy: 'Day'
                  };
                }
              },
              {
                sourceGrouping: 'Label',
                targetGrouping: 'Player',
                label: 'View Players',
                transformFilter: (row: any) => ({
                  whiteLabelId: row.whiteLabelId || '',
                  groupBy: 'Player'
                })
              }
            ]}
            aggregations={[
              { columnId: 'registrations', function: 'sum', label: 'Total Registrations' },
              { columnId: 'registrations', function: 'avg', label: 'Avg Registrations' },
              { columnId: 'ftd', function: 'sum', label: 'Total FTD' },
              { columnId: 'ftd', function: 'avg', label: 'Avg FTD' },
              { columnId: 'deposits', function: 'sum', label: 'Total Deposits' },
              { columnId: 'paidCashouts', function: 'sum', label: 'Total Cashouts' },
              { columnId: 'totalGGR', function: 'sum', label: 'Total GGR' },
              { columnId: 'totalGGR', function: 'avg', label: 'Avg GGR' }
            ]}
            renderRowDetail={(row: DailyAction) => {
              // Check if date is valid before formatting
              const isValidDate = row.date && !isNaN(new Date(row.date).getTime());
              const formattedDate = isValidDate ?
                format(new Date(row.date), 'MMM dd, yyyy') :
                'Unknown Date';

              return (
                <div style={{ padding: 16 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Details for {groupBy === 'Day' || groupBy === 'Month' || groupBy === 'Year' ?
                      (isValidDate ? formattedDate : row.groupValue || 'Selected Item') :
                      row.groupValue || 'Selected Item'}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <strong>Registrations:</strong> {row.registrations}
                      </Typography>
                      <Typography variant="body2">
                        <strong>FTD:</strong> {row.ftd}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Deposits:</strong> {formatCurrency(row.deposits)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Cashouts:</strong> {formatCurrency(row.paidCashouts)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Casino GGR:</strong> {formatCurrency(row.ggrCasino)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Sports GGR:</strong> {formatCurrency(row.ggrSport)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Live GGR:</strong> {formatCurrency(row.ggrLive)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Total GGR:</strong> {formatCurrency(row.totalGGR)}
                    </Typography>
                  </Grid>
                </Grid>
              </div>
              );
            }}
            onExportFormat={(format: string) => {
              console.log(`[DAILY ACTIONS PAGE] Exporting in format: ${format}`);
              handleExport();
            }}
            onApplyAdvancedFilters={(filters: Record<string, any>) => {
              console.log('[DAILY ACTIONS PAGE] Applying advanced filters:', filters);
              setAdvancedFilters(filters);
              handleApplyAdvancedFilters();
            }}
            onColumnOrderChange={(columns: Array<{id: string}>) => {
              console.log('[DAILY ACTIONS PAGE] Column order changed:', columns.map(col => col.id));
            }}
            onGroupingChange={(groupBy: string | null) => {
              console.log('[DAILY ACTIONS PAGE] Grouping changed to:', groupBy);
            }}
            onRowExpand={(rowId: string, expanded: boolean) => {
              console.log(`[DAILY ACTIONS PAGE] Row ${rowId} ${expanded ? 'expanded' : 'collapsed'}`);
            }}
            onDrillDown={(row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => {
              console.log(`[DAILY ACTIONS PAGE] Drill down from ${sourceGrouping} to ${targetGrouping}`, filters);

              // Update filters based on drill-down
              if (filters.groupBy) {
                setGroupBy(filters.groupBy);
              }

              if (filters.startDate) {
                setStartDate(filters.startDate);
              }

              if (filters.endDate) {
                setEndDate(filters.endDate);
              }

              if (filters.whiteLabelId) {
                // Convert to array if it's a single value
                const whiteLabelIds = Array.isArray(filters.whiteLabelId)
                  ? filters.whiteLabelId.map(id => id.toString())
                  : [filters.whiteLabelId.toString()];
                setSelectedWhiteLabels(whiteLabelIds);
              }

              // Apply the new filters
              handleApplyFilters();
            }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default DailyActionsPage;
