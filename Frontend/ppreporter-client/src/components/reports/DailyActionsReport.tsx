// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\components\reports\DailyActionsReport.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  IconButton,
  Badge,
  Tooltip,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Checkbox,
  ListItemText,
  OutlinedInput,
  ListSubheader,
  InputAdornment,
  SelectChangeEvent,
  Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CommonProps } from '../../types/common';
import { ReportSection, ReportExportFormat } from '../../types/report';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import GroupIcon from '@mui/icons-material/Group';
import PublicIcon from '@mui/icons-material/Public';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import EventIcon from '@mui/icons-material/Event';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import MapIcon from '@mui/icons-material/Map';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import components
import ReportViewer from './ReportViewer';
import NaturalLanguageQueryPanel from './NaturalLanguageQueryPanel';
import Card from '../common/Card';

// Type definitions
export type GroupDimension = 'player' | 'whitelabel' | 'country' | 'gametype' | 'tier' | 'device' | 'playerStatus' | 'registrationSource';
export type TimeGrouping = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
export type VisualizationType = 'table' | 'bar' | 'line' | 'pie' | 'map' | 'mixed';
export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct';
export type ReportMode = 'standard' | 'advanced' | 'expert';
export type ReportTab = 'overview' | 'trends' | 'players' | 'geography' | 'whitelabels' | 'games';
export type SortDirection = 'asc' | 'desc';

export interface DimensionOption {
  value: GroupDimension;
  label: string;
  icon: React.ReactNode;
}

export interface TimeGroupingOption {
  value: TimeGrouping;
  label: string;
  icon: React.ReactNode;
}

export interface VisualizationOption {
  value: VisualizationType;
  label: string;
  icon: React.ReactNode;
}

export interface MetricOption {
  value: string;
  label: string;
  category: 'Financial' | 'Activity' | 'User' | 'Performance';
  type: 'currency' | 'count' | 'time' | 'ratio' | 'percentage';
}

export interface AggregationOption {
  value: AggregationFunction;
  label: string;
}

export interface ReportModeOption {
  value: ReportMode;
  label: string;
  description: string;
}

export interface SelectedItem {
  id: string;
  name: string;
}

export interface DrilldownLevel {
  dimension: GroupDimension;
  timeGrouping: TimeGrouping;
  filters: {
    dateRange: [Date | null, Date | null];
    whitelabels: SelectedItem[];
    countries: SelectedItem[];
    playerTiers: SelectedItem[];
    gameTypes: SelectedItem[];
  };
}

export interface ReportFilters {
  dimension?: GroupDimension;
  timeGrouping?: TimeGrouping;
  dateRange?: [Date | null, Date | null];
  metrics?: string[];
  whitelabels?: SelectedItem[];
  countries?: SelectedItem[];
  playerTiers?: SelectedItem[];
  gameTypes?: SelectedItem[];
  aggregation?: AggregationFunction;
  sortBy?: string;
  sortDirection?: SortDirection;
  limit?: number;
  primary?: {
    dateRange: [Date | null, Date | null];
    whitelabels: SelectedItem[];
    countries: SelectedItem[];
    playerTiers: SelectedItem[];
    gameTypes: SelectedItem[];
  };
  comparison?: {
    dateRange: [Date | null, Date | null];
    whitelabels: SelectedItem[];
    countries: SelectedItem[];
    playerTiers: SelectedItem[];
    gameTypes: SelectedItem[];
  };
}

export interface SavedReportConfig {
  id: string;
  name: string;
  timestamp: string;
  configuration: {
    dimension: GroupDimension;
    timeGrouping: TimeGrouping;
    visualizationType: VisualizationType;
    metrics: string[];
    filters: {
      dateRange: [Date | null, Date | null];
      whitelabels: SelectedItem[];
      countries: SelectedItem[];
      playerTiers: SelectedItem[];
      gameTypes: SelectedItem[];
    };
    aggregation: AggregationFunction;
    sortBy: string;
    sortDirection: SortDirection;
    limit: number;
  };
}

export interface DailyActionsReportProps extends CommonProps {
  initialFilters?: ReportFilters;
  loading?: boolean;
  error?: Error | string | null;
  data?: any;
  onFilterChange?: (filters: ReportFilters) => void;
  onRefresh?: (filters: ReportFilters) => void;
  onExport?: (format: string, data?: any) => void;
  onSave?: (config: any) => void;
  onShare?: (data?: any) => void;
  onExecuteQuery?: (query: string) => Promise<any>;
  onDrillDown?: (filters: ReportFilters, item: any) => void;
  savedConfigurations?: SavedReportConfig[];
}

/**
 * DailyActionsReport - Advanced comprehensive player analytics reporting
 *
 * Features:
 * - Multi-dimensional analysis (by player, whitelabel, country, etc.)
 * - Flexible time grouping (day, week, month, year, custom)
 * - Multiple visualization types (tables, charts, maps, etc.)
 * - Advanced filtering and comparison capabilities
 * - Drill-down analysis from macro to micro level
 * - Export in multiple formats
 * - Save and share report configurations
 */
const DailyActionsReport: React.FC<DailyActionsReportProps> = ({
  initialFilters = {},
  loading = false,
  error = null,
  data = {},
  onFilterChange,
  onRefresh,
  onExport,
  onSave,
  onShare,
  onExecuteQuery,
  onDrillDown,
  savedConfigurations = [],
  sx
}) => {
  // ===== State Management =====
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('table');
  const [groupDimension, setGroupDimension] = useState<GroupDimension>('player');
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>('day');
  const [showQueryPanel, setShowQueryPanel] = useState<boolean>(true);
  const [customReportName, setCustomReportName] = useState<string>('');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [comparisonFilters, setComparisonFilters] = useState<{
    dateRange?: [Date | null, Date | null];
    whitelabels?: SelectedItem[];
    countries?: SelectedItem[];
    playerTiers?: SelectedItem[];
    gameTypes?: SelectedItem[];
  }>({});
  const [metricToSortBy, setMetricToSortBy] = useState<string>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [rowLimit, setRowLimit] = useState<number>(20);
  const [selectedDateRange, setSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [aggregationFunction, setAggregationFunction] = useState<AggregationFunction>('sum');
  const [selectedWhitelabels, setSelectedWhitelabels] = useState<SelectedItem[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<SelectedItem[]>([]);
  const [selectedPlayerTiers, setSelectedPlayerTiers] = useState<SelectedItem[]>([]);
  const [selectedGameTypes, setSelectedGameTypes] = useState<SelectedItem[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'deposits', 'withdrawals', 'bets', 'wins', 'netGaming', 'uniquePlayers'
  ]);
  const [drilldownPath, setDrilldownPath] = useState<DrilldownLevel[]>([]);
  const [reportMode, setReportMode] = useState<ReportMode>('standard'); // standard, advanced, expert
  const [isQueryExecuting, setIsQueryExecuting] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [nlQueryResults, setNlQueryResults] = useState<any>(null);

  // ===== Constants & Options =====

  // Group Dimension Options
  const dimensions: DimensionOption[] = [
    { value: 'player', label: 'Player', icon: <GroupIcon fontSize="small" /> },
    { value: 'whitelabel', label: 'White Label', icon: <BusinessIcon fontSize="small" /> },
    { value: 'country', label: 'Country', icon: <PublicIcon fontSize="small" /> },
    { value: 'gametype', label: 'Game Type', icon: <SportsEsportsIcon fontSize="small" /> },
    { value: 'tier', label: 'Player Tier', icon: <AccountBalanceWalletIcon fontSize="small" /> },
    { value: 'device', label: 'Device Type', icon: <VisibilityIcon fontSize="small" /> },
    { value: 'playerStatus', label: 'Player Status', icon: <TrendingUpIcon fontSize="small" /> },
    { value: 'registrationSource', label: 'Registration Source', icon: <SearchIcon fontSize="small" /> }
  ];

  // Time Grouping Options
  const timeGroupings: TimeGroupingOption[] = [
    { value: 'day', label: 'Daily', icon: <EventIcon fontSize="small" /> },
    { value: 'week', label: 'Weekly', icon: <CalendarViewMonthIcon fontSize="small" /> },
    { value: 'month', label: 'Monthly', icon: <CalendarViewMonthIcon fontSize="small" /> },
    { value: 'quarter', label: 'Quarterly', icon: <CalendarViewMonthIcon fontSize="small" /> },
    { value: 'year', label: 'Yearly', icon: <CalendarViewMonthIcon fontSize="small" /> },
    { value: 'all', label: 'All Time', icon: <CalendarViewMonthIcon fontSize="small" /> }
  ];

  // Visualization Type Options
  const visualizationTypes: VisualizationOption[] = [
    { value: 'table', label: 'Table', icon: <TableChartIcon fontSize="small" /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChartIcon fontSize="small" /> },
    { value: 'line', label: 'Line Chart', icon: <TimelineIcon fontSize="small" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChartIcon fontSize="small" /> },
    { value: 'map', label: 'Map View', icon: <MapIcon fontSize="small" /> },
    { value: 'mixed', label: 'Mixed View', icon: <TuneIcon fontSize="small" /> }
  ];

  // Metric Options
  const availableMetrics: MetricOption[] = [
    { value: 'deposits', label: 'Deposits', category: 'Financial', type: 'currency' },
    { value: 'withdrawals', label: 'Withdrawals', category: 'Financial', type: 'currency' },
    { value: 'bets', label: 'Total Bets', category: 'Activity', type: 'currency' },
    { value: 'wins', label: 'Total Wins', category: 'Activity', type: 'currency' },
    { value: 'netGaming', label: 'Net Gaming Revenue', category: 'Financial', type: 'currency' },
    { value: 'uniquePlayers', label: 'Unique Players', category: 'User', type: 'count' },
    { value: 'activeUsers', label: 'Active Users', category: 'User', type: 'count' },
    { value: 'newRegistrations', label: 'New Registrations', category: 'User', type: 'count' },
    { value: 'sessions', label: 'Total Sessions', category: 'Activity', type: 'count' },
    { value: 'avgSessionDuration', label: 'Avg. Session Duration', category: 'Activity', type: 'time' },
    { value: 'gamesPlayed', label: 'Games Played', category: 'Activity', type: 'count' },
    { value: 'betsPerPlayer', label: 'Bets per Player', category: 'Activity', type: 'ratio' },
    { value: 'avgBetSize', label: 'Average Bet Size', category: 'Activity', type: 'currency' },
    { value: 'conversionRate', label: 'Conversion Rate', category: 'Performance', type: 'percentage' },
    { value: 'retentionRate', label: 'Retention Rate', category: 'Performance', type: 'percentage' },
    { value: 'churnRate', label: 'Churn Rate', category: 'Performance', type: 'percentage' },
    { value: 'depositConversion', label: 'Deposit Conversion', category: 'Performance', type: 'percentage' },
    { value: 'arpu', label: 'ARPU', category: 'Financial', type: 'currency' },
    { value: 'arppu', label: 'ARPPU', category: 'Financial', type: 'currency' },
    { value: 'ltv', label: 'Lifetime Value', category: 'Financial', type: 'currency' }
  ];

  // Aggregation Function Options
  const aggregationFunctions: AggregationOption[] = [
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
    { value: 'count', label: 'Count' },
    { value: 'countDistinct', label: 'Count Distinct' }
  ];

  // Report Mode Options
  const reportModes: ReportModeOption[] = [
    { value: 'standard', label: 'Standard', description: 'Easy to use interface with common options' },
    { value: 'advanced', label: 'Advanced', description: 'More options and customization capabilities' },
    { value: 'expert', label: 'Expert', description: 'Full control over all report parameters' }
  ];

  // Natural language query suggestions specific to daily actions
  const queryExamples: string[] = [
    "Show me top 10 players by total deposits for last month",
    "Compare revenue by country for Q2 vs Q1",
    "Which white labels have the highest player retention rate?",
    "Show daily bets and wins trend for VIP players",
    "What's the average session duration by device type?",
    "Which games generate the most revenue by country?",
    "Show me players with declining activity in the last 3 months"
  ];

  // ===== Handlers =====

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: ReportTab): void => {
    setActiveTab(newValue);
  };

  // Handle dimension change
  const handleDimensionChange = (event: SelectChangeEvent): void => {
    setGroupDimension(event.target.value as GroupDimension);
  };

  // Handle time grouping change
  const handleTimeGroupingChange = (event: SelectChangeEvent): void => {
    setTimeGrouping(event.target.value as TimeGrouping);
  };

  // Handle visualization type change
  const handleVisualizationTypeChange = (event: SelectChangeEvent): void => {
    setVisualizationType(event.target.value as VisualizationType);
  };

  // Handle metric selection change
  const handleMetricChange = (event: SelectChangeEvent<string[]>): void => {
    const {
      target: { value },
    } = event;
    setSelectedMetrics(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle natural language query submission
  const handleQuerySubmit = async (query: string): Promise<void> => {
    if (!onExecuteQuery) return;

    setIsQueryExecuting(true);
    setQueryError(null);

    try {
      const results = await onExecuteQuery(query);
      setNlQueryResults(results);
    } catch (err) {
      const error = err as Error;
      setQueryError(error.message || 'Failed to execute query');
    } finally {
      setIsQueryExecuting(false);
    }
  };

  // Handle filter change and trigger data refresh
  const handleApplyFilters = (): void => {
    const filters: ReportFilters = {
      dimension: groupDimension,
      timeGrouping,
      dateRange: selectedDateRange,
      metrics: selectedMetrics,
      whitelabels: selectedWhitelabels,
      countries: selectedCountries,
      playerTiers: selectedPlayerTiers,
      gameTypes: selectedGameTypes,
      aggregation: aggregationFunction,
      sortBy: metricToSortBy,
      sortDirection,
      limit: rowLimit
    };

    if (onFilterChange) {
      onFilterChange(filters);
    }

    if (onRefresh) {
      onRefresh(filters);
    }
  };

  // Handle drill down
  const handleDrillDown = (item: any): void => {
    // Add current view to drill down path
    const newDrilldownPath = [...drilldownPath, {
      dimension: groupDimension,
      timeGrouping,
      filters: {
        dateRange: selectedDateRange,
        whitelabels: selectedWhitelabels,
        countries: selectedCountries,
        playerTiers: selectedPlayerTiers,
        gameTypes: selectedGameTypes
      }
    }];

    setDrilldownPath(newDrilldownPath);

    // Determine next dimension based on current
    let nextDimension: GroupDimension = 'player';
    if (groupDimension === 'whitelabel') nextDimension = 'player';
    else if (groupDimension === 'country') nextDimension = 'whitelabel';
    else if (groupDimension === 'gametype') nextDimension = 'player';

    setGroupDimension(nextDimension);

    // Apply drill down filters
    const drillDownFilters: ReportFilters = {
      dimension: nextDimension,
      timeGrouping,
      dateRange: selectedDateRange,
      metrics: selectedMetrics,
      whitelabels: groupDimension === 'whitelabel' ? [item.id] : selectedWhitelabels,
      countries: groupDimension === 'country' ? [item.id] : selectedCountries,
      playerTiers: groupDimension === 'tier' ? [item.id] : selectedPlayerTiers,
      gameTypes: groupDimension === 'gametype' ? [item.id] : selectedGameTypes,
      aggregation: aggregationFunction,
      sortBy: metricToSortBy,
      sortDirection,
      limit: rowLimit
    };

    if (onDrillDown) {
      onDrillDown(drillDownFilters, item);
    }
  };

  // Handle drill up (go back in drill down path)
  const handleDrillUp = (index: number): void => {
    // Go back to the specific level in the drill path
    if (index >= 0 && index < drilldownPath.length) {
      const targetLevel = drilldownPath[index];
      const newDrilldownPath = drilldownPath.slice(0, index);

      setDrilldownPath(newDrilldownPath);
      setGroupDimension(targetLevel.dimension);
      setTimeGrouping(targetLevel.timeGrouping);
      setSelectedDateRange(targetLevel.filters.dateRange);
      setSelectedWhitelabels(targetLevel.filters.whitelabels);
      setSelectedCountries(targetLevel.filters.countries);
      setSelectedPlayerTiers(targetLevel.filters.playerTiers);
      setSelectedGameTypes(targetLevel.filters.gameTypes);

      // Apply the filters
      handleApplyFilters();
    }
  };

  // Toggle comparison mode
  const handleToggleComparison = (): void => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      // Save current filters for comparison
      setComparisonFilters({
        dateRange: selectedDateRange,
        whitelabels: selectedWhitelabels,
        countries: selectedCountries,
        playerTiers: selectedPlayerTiers,
        gameTypes: selectedGameTypes
      });
    }
  };

  // Apply comparison
  const handleApplyComparison = (): void => {
    // Create filters object with both primary and comparison filters
    const filters: ReportFilters = {
      dimension: groupDimension,
      timeGrouping,
      metrics: selectedMetrics,
      aggregation: aggregationFunction,
      sortBy: metricToSortBy,
      sortDirection,
      limit: rowLimit,
      primary: {
        dateRange: selectedDateRange,
        whitelabels: selectedWhitelabels,
        countries: selectedCountries,
        playerTiers: selectedPlayerTiers,
        gameTypes: selectedGameTypes
      },
      comparison: comparisonFilters as {
        dateRange: [Date | null, Date | null];
        whitelabels: SelectedItem[];
        countries: SelectedItem[];
        playerTiers: SelectedItem[];
        gameTypes: SelectedItem[];
      }
    };

    if (onFilterChange) {
      onFilterChange(filters);
    }

    if (onRefresh) {
      onRefresh(filters);
    }
  };

  // Save current report configuration
  const handleSaveReport = (): void => {
    if (!customReportName.trim()) return;

    const reportConfig = {
      name: customReportName,
      timestamp: new Date().toISOString(),
      configuration: {
        dimension: groupDimension,
        timeGrouping,
        visualizationType,
        metrics: selectedMetrics,
        filters: {
          dateRange: selectedDateRange,
          whitelabels: selectedWhitelabels,
          countries: selectedCountries,
          playerTiers: selectedPlayerTiers,
          gameTypes: selectedGameTypes
        },
        aggregation: aggregationFunction,
        sortBy: metricToSortBy,
        sortDirection,
        limit: rowLimit
      }
    };

    if (onSave) {
      onSave(reportConfig);
    }

    setCustomReportName('');
  };

  // Load a saved report configuration
  const handleLoadConfiguration = (config: SavedReportConfig): void => {
    if (!config || !config.configuration) return;

    const { configuration } = config;

    setGroupDimension(configuration.dimension);
    setTimeGrouping(configuration.timeGrouping);
    setVisualizationType(configuration.visualizationType);
    setSelectedMetrics(configuration.metrics);
    setSelectedDateRange(configuration.filters.dateRange);
    setSelectedWhitelabels(configuration.filters.whitelabels);
    setSelectedCountries(configuration.filters.countries);
    setSelectedPlayerTiers(configuration.filters.playerTiers);
    setSelectedGameTypes(configuration.filters.gameTypes);
    setAggregationFunction(configuration.aggregation);
    setMetricToSortBy(configuration.sortBy);
    setSortDirection(configuration.sortDirection);
    setRowLimit(configuration.limit);

    // Apply loaded configuration
    handleApplyFilters();
  };

  // Generate the report sections for ReportViewer
  const generateReportSections = () => {
    const sections = [];

    // Main data visualization section
    sections.push({
      id: 'data-visualization',
      title: `${dimensions.find(d => d.value === groupDimension)?.label || 'Data'} Analysis by ${timeGroupings.find(t => t.value === timeGrouping)?.label || 'Time'}`,
      description: `${visualizationTypes.find(v => v.value === visualizationType)?.label || 'Visualization'} of selected metrics`,
      content: (
        <Box p={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Typography variant="body1">
              {/* In a real implementation, this would be dynamic based on visualizationType */}
              Visualization of player daily actions data would be displayed here.
              {comparisonMode && 'Comparison view is enabled.'}
            </Typography>
          )}
        </Box>
      )
    });

    // If we have NL query results, add that section
    if (nlQueryResults) {
      sections.push({
        id: 'query-results',
        title: 'Query Results',
        description: 'Results from your natural language query',
        content: (
          <Box p={2}>
            <Typography variant="body1">
              Query results would be displayed here.
            </Typography>
          </Box>
        )
      });
    }

    // Add summary section if in overview tab
    if (activeTab === 'overview') {
      sections.push({
        id: 'summary-metrics',
        title: 'Summary Metrics',
        description: 'Key performance indicators and summary statistics',
        content: (
          <Box p={2}>
            <Grid container spacing={3}>
              {selectedMetrics.slice(0, 4).map((metric) => {
                const metricInfo = availableMetrics.find(m => m.value === metric);
                return (
                  <Grid item xs={12} sm={6} md={3} key={metric}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {metricInfo?.label || metric}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {loading ? (
                          <CircularProgress size={24} />
                        ) : (
                          /* Mock data - would be replaced with actual data */
                          metric === 'deposits' ? '$1,245,678' :
                          metric === 'bets' ? '$3,456,789' :
                          metric === 'wins' ? '$2,987,654' :
                          metric === 'netGaming' ? '$469,135' :
                          metric === 'uniquePlayers' ? '12,345' :
                          '87.5%'
                        )}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip
                          size="small"
                          color="success"
                          label="+8.2%"
                          icon={<TrendingUpIcon />}
                          sx={{ height: 20, '& .MuiChip-label': { px: 1 }, '& .MuiChip-icon': { ml: 0.5 } }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          vs previous period
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )
      });
    }

    // Add trend analysis section
    sections.push({
      id: 'trend-analysis',
      title: 'Trend Analysis',
      description: 'Trends and patterns over time',
      content: (
        <Box p={2}>
          <Typography variant="body1">
            Time series analysis and trend visualization would be displayed here.
          </Typography>
        </Box>
      )
    });

    return sections;
  };

  // ===== Main Render =====
  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* Natural Language Query Panel */}
      {showQueryPanel && (
        <NaturalLanguageQueryPanel
          onSearch={handleQuerySubmit}
          onSaveQuery={(query: string) => {
            // Save query logic would go here
            console.log('Saving query:', query);
          }}
          loading={isQueryExecuting}
          error={queryError}
          showSuggestions={true}
          suggestions={queryExamples}
        />
      )}

      {/* Report Configuration and Control Panel */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
            <TableChartIcon sx={{ mr: 1 }} />
            Daily Actions Report
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Save Report Config */}
            <TextField
              size="small"
              placeholder="Name this report"
              value={customReportName}
              onChange={(e) => setCustomReportName(e.target.value)}
              sx={{ width: 180 }}
            />
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              disabled={!customReportName.trim()}
              onClick={handleSaveReport}
            >
              Save
            </Button>

            {/* Load Saved Config */}
            {savedConfigurations.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Load Configuration</InputLabel>
                <Select
                  value=""
                  onChange={(e) => {
                    const selectedConfig = savedConfigurations.find(config => config.id === e.target.value);
                    if (selectedConfig) handleLoadConfiguration(selectedConfig);
                  }}
                  label="Load Configuration"
                >
                  <MenuItem value="" disabled>
                    <em>Select saved report</em>
                  </MenuItem>
                  {savedConfigurations.map((config) => (
                    <MenuItem key={config.id} value={config.id}>
                      {config.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Mode Selector */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Report Mode</InputLabel>
              <Select
                value={reportMode}
                onChange={(e) => setReportMode(e.target.value as ReportMode)}
                label="Report Mode"
              >
                {reportModes.map((mode) => (
                  <MenuItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Toggle NL Query Panel */}
            <Button
              variant={showQueryPanel ? "contained" : "outlined"}
              color="primary"
              onClick={() => setShowQueryPanel(!showQueryPanel)}
            >
              {showQueryPanel ? "Hide Query" : "Show Query"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Main Filter Controls */}
        <Grid container spacing={3}>
          {/* Group Dimension */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupDimension}
                onChange={handleDimensionChange}
                label="Group By"
                startAdornment={
                  <InputAdornment position="start">
                    {dimensions.find(d => d.value === groupDimension)?.icon || <GroupIcon fontSize="small" />}
                  </InputAdornment>
                }
              >
                {dimensions.map((dimension) => (
                  <MenuItem key={dimension.value} value={dimension.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {dimension.icon}
                      <Typography sx={{ ml: 1 }}>{dimension.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Time Grouping */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Grouping</InputLabel>
              <Select
                value={timeGrouping}
                onChange={handleTimeGroupingChange}
                label="Time Grouping"
                startAdornment={
                  <InputAdornment position="start">
                    {timeGroupings.find(t => t.value === timeGrouping)?.icon || <EventIcon fontSize="small" />}
                  </InputAdornment>
                }
              >
                {timeGroupings.map((time) => (
                  <MenuItem key={time.value} value={time.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {time.icon}
                      <Typography sx={{ ml: 1 }}>{time.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Visualization Type */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Visualization</InputLabel>
              <Select
                value={visualizationType}
                onChange={handleVisualizationTypeChange}
                label="Visualization"
                startAdornment={
                  <InputAdornment position="start">
                    {visualizationTypes.find(v => v.value === visualizationType)?.icon || <TableChartIcon fontSize="small" />}
                  </InputAdornment>
                }
              >
                {visualizationTypes.map((viz) => (
                  <MenuItem key={viz.value} value={viz.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {viz.icon}
                      <Typography sx={{ ml: 1 }}>{viz.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <DatePicker
                  label="From"
                  value={selectedDateRange[0]}
                  onChange={(newValue) => {
                    setSelectedDateRange([newValue, selectedDateRange[1]]);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
                <DatePicker
                  label="To"
                  value={selectedDateRange[1]}
                  onChange={(newValue) => {
                    setSelectedDateRange([selectedDateRange[0], newValue]);
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Box>
            </LocalizationProvider>
          </Grid>
        </Grid>

        {/* Advanced Filters Toggle */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            sx={{ borderBottom: advancedFiltersOpen ? '2px solid' : 'none', borderRadius: 0, pb: 0.5 }}
            color="primary"
          >
            {advancedFiltersOpen ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleApplyFilters}
              disabled={loading}
            >
              Refresh Data
            </Button>

            <Button
              variant={comparisonMode ? 'contained' : 'outlined'}
              startIcon={<CompareArrowsIcon />}
              onClick={handleToggleComparison}
              disabled={loading}
              color={comparisonMode ? 'primary' : 'inherit'}
            >
              {comparisonMode ? 'Comparison Mode' : 'Enable Comparison'}
            </Button>
          </Box>
        </Box>

        {/* Advanced Filters Panel */}
        <Collapse in={advancedFiltersOpen}>
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Grid container spacing={3}>
              {/* Metrics Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Metrics</InputLabel>
                  <Select
                    multiple
                    value={selectedMetrics}
                    onChange={handleMetricChange}
                    input={<OutlinedInput label="Metrics" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={availableMetrics.find(m => m.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    <ListSubheader>Financial</ListSubheader>
                    {availableMetrics.filter(m => m.category === 'Financial').map((metric) => (
                      <MenuItem key={metric.value} value={metric.value}>
                        <Checkbox checked={selectedMetrics.indexOf(metric.value) > -1} />
                        <ListItemText primary={metric.label} />
                      </MenuItem>
                    ))}

                    <ListSubheader>Activity</ListSubheader>
                    {availableMetrics.filter(m => m.category === 'Activity').map((metric) => (
                      <MenuItem key={metric.value} value={metric.value}>
                        <Checkbox checked={selectedMetrics.indexOf(metric.value) > -1} />
                        <ListItemText primary={metric.label} />
                      </MenuItem>
                    ))}

                    <ListSubheader>User</ListSubheader>
                    {availableMetrics.filter(m => m.category === 'User').map((metric) => (
                      <MenuItem key={metric.value} value={metric.value}>
                        <Checkbox checked={selectedMetrics.indexOf(metric.value) > -1} />
                        <ListItemText primary={metric.label} />
                      </MenuItem>
                    ))}

                    <ListSubheader>Performance</ListSubheader>
                    {availableMetrics.filter(m => m.category === 'Performance').map((metric) => (
                      <MenuItem key={metric.value} value={metric.value}>
                        <Checkbox checked={selectedMetrics.indexOf(metric.value) > -1} />
                        <ListItemText primary={metric.label} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Aggregation and Sorting */}
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  {/* Aggregation Function */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Aggregation</InputLabel>
                      <Select
                        value={aggregationFunction}
                        onChange={(e) => setAggregationFunction(e.target.value as AggregationFunction)}
                        label="Aggregation"
                      >
                        {aggregationFunctions.map((agg) => (
                          <MenuItem key={agg.value} value={agg.value}>
                            {agg.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sort By */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={metricToSortBy}
                        onChange={(e) => setMetricToSortBy(e.target.value)}
                        label="Sort By"
                      >
                        {selectedMetrics.map((metric) => (
                          <MenuItem key={metric} value={metric}>
                            {availableMetrics.find(m => m.value === metric)?.label || metric}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Sort Direction */}
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Direction</InputLabel>
                      <Select
                        value={sortDirection}
                        onChange={(e) => setSortDirection(e.target.value as SortDirection)}
                        label="Direction"
                      >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Row Limit */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Row Limit"
                      type="number"
                      size="small"
                      value={rowLimit}
                      onChange={(e) => setRowLimit(parseInt(e.target.value) || 20)}
                      InputProps={{
                        inputProps: {
                          min: 1,
                          max: 1000
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Comparison Mode Settings */}
        {comparisonMode && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'primary.main' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CompareArrowsIcon sx={{ mr: 1 }} />
              Comparison Settings
            </Typography>

            <Grid container spacing={2}>
              {/* Comparison Date Range */}
              <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <DatePicker
                      label="Compare From"
                      value={comparisonFilters.dateRange ? comparisonFilters.dateRange[0] : null}
                      onChange={(newValue) => {
                        setComparisonFilters({
                          ...comparisonFilters,
                          dateRange: [newValue, comparisonFilters.dateRange ? comparisonFilters.dateRange[1] : null]
                        });
                      }}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <DatePicker
                      label="Compare To"
                      value={comparisonFilters.dateRange ? comparisonFilters.dateRange[1] : null}
                      onChange={(newValue) => {
                        setComparisonFilters({
                          ...comparisonFilters,
                          dateRange: [comparisonFilters.dateRange ? comparisonFilters.dateRange[0] : null, newValue]
                        });
                      }}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Box>
                </LocalizationProvider>
              </Grid>

              {/* Quick Date Comparison Presets */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Quick Compare</InputLabel>
                  <Select
                    value=""
                    onChange={(e) => {
                      // Logic to set comparison date range based on preset
                      const now = new Date();
                      const primaryStart = selectedDateRange[0] || now;
                      const primaryEnd = selectedDateRange[1] || now;
                      const primaryRange = primaryEnd.getTime() - primaryStart.getTime();

                      let comparisonStart, comparisonEnd;

                      switch(e.target.value) {
                        case 'previous_period':
                          comparisonStart = new Date(primaryStart.getTime() - primaryRange);
                          comparisonEnd = new Date(primaryEnd.getTime() - primaryRange);
                          break;
                        case 'previous_year':
                          comparisonStart = new Date(primaryStart);
                          comparisonStart.setFullYear(comparisonStart.getFullYear() - 1);
                          comparisonEnd = new Date(primaryEnd);
                          comparisonEnd.setFullYear(comparisonEnd.getFullYear() - 1);
                          break;
                        case 'ytd':
                          comparisonStart = new Date(now.getFullYear() - 1, 0, 1);
                          comparisonEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                          break;
                        default:
                          return;
                      }

                      setComparisonFilters({
                        ...comparisonFilters,
                        dateRange: [comparisonStart, comparisonEnd]
                      });
                    }}
                    label="Quick Compare"
                  >
                    <MenuItem value="" disabled>
                      <em>Select comparison period</em>
                    </MenuItem>
                    <MenuItem value="previous_period">Previous Period</MenuItem>
                    <MenuItem value="previous_year">Previous Year</MenuItem>
                    <MenuItem value="ytd">Year-to-Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Apply Comparison Button */}
              <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApplyComparison}
                  fullWidth
                  disabled={!comparisonFilters.dateRange || !comparisonFilters.dateRange[0] || !comparisonFilters.dateRange[1]}
                >
                  Apply Comparison
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Drill Down Path Breadcrumbs */}
        {drilldownPath.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Drill Path:
            </Typography>
            {drilldownPath.map((level, index) => (
              <React.Fragment key={index}>
                <Chip
                  label={`${dimensions.find(d => d.value === level.dimension)?.label || level.dimension}`}
                  size="small"
                  onClick={() => handleDrillUp(index)}
                  clickable
                />
                {index < drilldownPath.length - 1 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
                    &gt;
                  </Typography>
                )}
              </React.Fragment>
            ))}
            <Chip
              label={dimensions.find(d => d.value === groupDimension)?.label || groupDimension}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Paper>

      {/* Tabs for report views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" value="overview" icon={<TableChartIcon />} iconPosition="start" />
          <Tab label="Trends" value="trends" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Players" value="players" icon={<GroupIcon />} iconPosition="start" />
          <Tab label="Geography" value="geography" icon={<PublicIcon />} iconPosition="start" />
          <Tab label="White Labels" value="whitelabels" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="Games" value="games" icon={<SportsEsportsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Main Report Content using ReportViewer */}
      <ReportViewer
        title={`Daily Actions - ${dimensions.find(d => d.value === groupDimension)?.label || 'Report'}`}
        description={`Analysis of player metrics grouped by ${dimensions.find(d => d.value === groupDimension)?.label.toLowerCase() || 'dimension'} with ${timeGroupings.find(t => t.value === timeGrouping)?.label.toLowerCase() || 'time'} grouping.`}
        loading={loading}
        error={error}
        sections={generateReportSections()}
        data={data}
        onRefresh={handleApplyFilters}
        onExport={onExport}
        onSave={handleSaveReport}
        onShare={onShare}
        showExport={true}
      />

      {/* Table View for Tabular Data (shown only when in table visualization) */}
      {visualizationType === 'table' && data && (
        <Card
          title="Data Table"
          subheader="Detailed tabular view of the data"
          sx={{ mt: 3 }}
        >
          <Box p={2}>
            <Typography variant="body1">
              Detailed data table would be displayed here.
              {comparisonMode && ' Comparison data would be shown side by side.'}
            </Typography>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default DailyActionsReport;
