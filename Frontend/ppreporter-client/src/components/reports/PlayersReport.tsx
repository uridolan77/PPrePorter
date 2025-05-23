// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\components\reports\PlayersReport.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
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
  Box as MuiBox,
  SelectChangeEvent,
  Paper
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SimpleBox from '../../components/common/SimpleBox';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DateRangePicker from '../common/DateRangePicker';
import { CommonProps } from '../../types/common';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import FilterListIcon from '@mui/icons-material/FilterList';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PieChartIcon from '@mui/icons-material/PieChart';
import InsightsIcon from '@mui/icons-material/Insights';
import WidgetsIcon from '@mui/icons-material/Widgets';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import LayersIcon from '@mui/icons-material/Layers';

// Components
import ReportViewer from './ReportViewer';
import FilterPanel, { FilterDefinition } from '../common/FilterPanel';
import Card from '../common/Card';
import NaturalLanguageQueryPanel from './NaturalLanguageQueryPanel';

// Type definitions
export type TimeframeOption = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'ytd' | 'custom';
export type PlayerTier = 'vip' | 'highroller' | 'regular' | 'casual' | 'new';
export type ActivityStatus = 'active' | 'inactive' | 'dormant' | 'churned' | 'reactivated';
export type RegistrationChannel = 'web' | 'mobile' | 'affiliate' | 'social' | 'email';
export type Region = 'europe' | 'northAmerica' | 'southAmerica' | 'asia' | 'africa' | 'oceania';
export type GameType = 'slots' | 'table' | 'live' | 'sports' | 'poker' | 'bingo';
export type ViewMode = 'standard' | 'compact' | 'detailed' | 'visual' | 'data';
export type ReportTab = 'overview' | 'demographics' | 'behavior' | 'retention' | 'value' | 'advanced';
export type InsightImportance = 'high' | 'medium' | 'low';

// Interface definitions
export interface PlayerFilters {
  timeframe?: TimeframeOption;
  playerTier?: PlayerTier[];
  activityStatus?: ActivityStatus[];
  registrationChannel?: RegistrationChannel[];
  region?: Region[];
  gameType?: GameType[];
  depositRange?: [number, number];
  winLossRange?: [number, number];
  [key: string]: any;
}

export interface SavedView {
  id: string;
  name: string;
  filters: PlayerFilters;
  showInsights: boolean;
  tab: ReportTab;
  viewMode: ViewMode;
}

export interface PlayerInsight {
  id: string;
  title: string;
  description: string;
  importance: InsightImportance;
  metric: string;
  change: number;
}

export interface ReportSection {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

export interface TimeframeOptionItem {
  value: TimeframeOption | string;
  label: string;
}

export interface PlayersReportProps extends CommonProps {
  initialFilters?: PlayerFilters;
  loading?: boolean;
  error?: Error | string | null;
  onFilterChange?: (filters: PlayerFilters) => void;
  onRefresh?: (filters: PlayerFilters) => void;
  onExport?: (format: string, data: any) => void;
  onSave?: (config: any) => void;
  onExecuteQuery?: (query: string) => Promise<any>;
  data?: any;
  userPreferences?: any;
  onUpdatePreferences?: (preferences: any) => void;
}

/**
 * Comprehensive, customizable Players Report component
 * Provides detailed player analytics, behavior tracking, and comparison features
 */
const PlayersReport: React.FC<PlayersReportProps> = ({
  initialFilters = {},
  loading = false,
  error = null,
  onFilterChange,
  onRefresh,
  onExport,
  onSave,
  onExecuteQuery,
  data = {},
  userPreferences = {},
  onUpdatePreferences,
  sx
}) => {
  // State for report view mode and configuration
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [showInsights, setShowInsights] = useState<boolean>(true);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [customizationOpen, setCustomizationOpen] = useState<boolean>(false);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [currentViewName, setCurrentViewName] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<PlayerFilters>(initialFilters);
  const [nlQuery, setNlQuery] = useState<string>('');
  const [nlQueryResults, setNlQueryResults] = useState<any>(null);
  const [nlQueryLoading, setNlQueryLoading] = useState<boolean>(false);
  const [nlQueryError, setNlQueryError] = useState<string | null>(null);

  // Timeframe options for reports
  const timeframeOptions: TimeframeOptionItem[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Filter definitions
  const filters: FilterDefinition[] = [
    {
      id: 'timeframe',
      label: 'Time Period',
      type: 'select',
      options: timeframeOptions,
      defaultValue: appliedFilters.timeframe || 'last30days'
    },
    {
      id: 'playerTier',
      label: 'Player Tier',
      type: 'multiselect',
      options: [
        { value: 'vip', label: 'VIP' },
        { value: 'highroller', label: 'High Roller' },
        { value: 'regular', label: 'Regular' },
        { value: 'casual', label: 'Casual' },
        { value: 'new', label: 'New Player' }
      ],
      defaultValue: appliedFilters.playerTier || []
    },
    {
      id: 'activityStatus',
      label: 'Activity Status',
      type: 'multiselect',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'dormant', label: 'Dormant' },
        { value: 'churned', label: 'Churned' },
        { value: 'reactivated', label: 'Reactivated' }
      ],
      defaultValue: appliedFilters.activityStatus || []
    },
    {
      id: 'registrationChannel',
      label: 'Registration Channel',
      type: 'multiselect',
      options: [
        { value: 'web', label: 'Website' },
        { value: 'mobile', label: 'Mobile App' },
        { value: 'affiliate', label: 'Affiliate' },
        { value: 'social', label: 'Social Media' },
        { value: 'email', label: 'Email Campaign' }
      ],
      defaultValue: appliedFilters.registrationChannel || []
    },
    {
      id: 'region',
      label: 'Region',
      type: 'multiselect',
      options: [
        { value: 'europe', label: 'Europe' },
        { value: 'northAmerica', label: 'North America' },
        { value: 'southAmerica', label: 'South America' },
        { value: 'asia', label: 'Asia' },
        { value: 'africa', label: 'Africa' },
        { value: 'oceania', label: 'Oceania' }
      ],
      defaultValue: appliedFilters.region || []
    },
    {
      id: 'gameType',
      label: 'Game Type',
      type: 'multiselect',
      options: [
        { value: 'slots', label: 'Slots' },
        { value: 'table', label: 'Table Games' },
        { value: 'live', label: 'Live Casino' },
        { value: 'sports', label: 'Sports Betting' },
        { value: 'poker', label: 'Poker' },
        { value: 'bingo', label: 'Bingo' }
      ],
      defaultValue: appliedFilters.gameType || []
    },
    {
      id: 'depositRange',
      label: 'Deposit Range',
      type: 'range',
      min: 0,
      max: 10000,
      defaultValue: appliedFilters.depositRange || [0, 10000]
    },
    {
      id: 'winLossRange',
      label: 'Win/Loss Range',
      type: 'range',
      min: -5000,
      max: 5000,
      defaultValue: appliedFilters.winLossRange || [-5000, 5000]
    }
  ];

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: any): void => {
    const updatedFilters = {
      ...appliedFilters,
      [filterId]: value
    };
    setAppliedFilters(updatedFilters);

    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  // Handle natural language query submission
  const handleQuerySubmit = async (query: string): Promise<void> => {
    if (!onExecuteQuery) return;

    setNlQueryLoading(true);
    setNlQueryError(null);
    setNlQuery(query);

    try {
      const results = await onExecuteQuery(query);
      setNlQueryResults(results);
    } catch (err) {
      setNlQueryError(err instanceof Error ? err.message : 'Failed to execute query');
    } finally {
      setNlQueryLoading(false);
    }
  };

  // Handle saving the current view configuration
  const handleSaveView = (): void => {
    if (!currentViewName.trim()) return;

    const newView: SavedView = {
      id: `view-${Date.now()}`,
      name: currentViewName,
      filters: appliedFilters,
      showInsights,
      tab: activeTab,
      viewMode
    };

    setSavedViews([...savedViews, newView]);
    setCurrentViewName('');
  };

  // Handle applying a saved view
  const handleApplyView = (view: SavedView): void => {
    setAppliedFilters(view.filters);
    setShowInsights(view.showInsights);
    setActiveTab(view.tab);
    setViewMode(view.viewMode);

    if (onFilterChange) {
      onFilterChange(view.filters);
    }
  };

  // Toggle comparison mode
  const toggleComparisonMode = (): void => {
    setComparisonMode(!comparisonMode);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: ReportTab): void => {
    setActiveTab(newValue);
  };

  // Generate report sections based on active tab
  const generateReportSections = (): ReportSection[] => {
    switch(activeTab) {
      case 'overview':
        return [
          {
            id: 'player-summary',
            title: 'Player Summary',
            description: 'Key player metrics and overview statistics',
            content: (
              <SimpleBox p={2}>
                {/* Player summary metrics would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading player summary data...' :
                    'Displays key player metrics like total players, acquisitions, churn rate, and lifetime value.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'player-activity',
            title: 'Player Activity',
            description: 'Recent player activity and engagement metrics',
            content: (
              <SimpleBox p={2}>
                {/* Player activity charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading player activity data...' :
                    'Displays player activity trends, session metrics, and engagement statistics.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'revenue-metrics',
            title: 'Revenue Metrics',
            description: 'Player revenue and financial performance',
            content: (
              <SimpleBox p={2}>
                {/* Revenue metrics charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading revenue metrics...' :
                    'Displays player revenue trends, ARPU, conversion rates, and deposit statistics.'}
                </Typography>
              </SimpleBox>
            )
          }
        ];

      case 'demographics':
        return [
          {
            id: 'player-demographics',
            title: 'Player Demographics',
            description: 'Demographic breakdown of player base',
            content: (
              <SimpleBox p={2}>
                {/* Demographics charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading demographic data...' :
                    'Displays player demographics including age, gender, location, and device usage.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'segmentation',
            title: 'Player Segmentation',
            description: 'Player segments based on behavior and value',
            content: (
              <SimpleBox p={2}>
                {/* Segmentation charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading segmentation data...' :
                    'Displays player segments including VIP distribution, player value tiers, and behavioral clusters.'}
                </Typography>
              </SimpleBox>
            )
          }
        ];

      case 'behavior':
        return [
          {
            id: 'game-preferences',
            title: 'Game Preferences',
            description: 'Player game preferences and playing patterns',
            content: (
              <SimpleBox p={2}>
                {/* Game preferences charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading game preference data...' :
                    'Displays player game preferences, favorite games, playing patterns, and time distribution.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'betting-patterns',
            title: 'Betting Patterns',
            description: 'Analysis of player betting behavior',
            content: (
              <SimpleBox p={2}>
                {/* Betting patterns charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading betting pattern data...' :
                    'Displays player betting patterns, average bet sizes, risk profiles, and volatility preferences.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'session-analysis',
            title: 'Session Analysis',
            description: 'Detailed player session metrics',
            content: (
              <SimpleBox p={2}>
                {/* Session analysis charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading session analysis data...' :
                    'Displays player session metrics including duration, frequency, time of day, and platform usage.'}
                </Typography>
              </SimpleBox>
            )
          }
        ];

      case 'retention':
        return [
          {
            id: 'retention-curves',
            title: 'Retention Curves',
            description: 'Player retention over time',
            content: (
              <SimpleBox p={2}>
                {/* Retention curves would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading retention data...' :
                    'Displays player retention curves, cohort analysis, and retention by segment.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'churn-analysis',
            title: 'Churn Analysis',
            description: 'Player churn patterns and prediction',
            content: (
              <SimpleBox p={2}>
                {/* Churn analysis charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading churn analysis data...' :
                    'Displays player churn metrics, at-risk players, and churn prediction indicators.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'reactivation',
            title: 'Reactivation Metrics',
            description: 'Player reactivation success metrics',
            content: (
              <SimpleBox p={2}>
                {/* Reactivation metrics would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading reactivation data...' :
                    'Displays player reactivation metrics, reactivation campaign performance, and player return patterns.'}
                </Typography>
              </SimpleBox>
            )
          }
        ];

      case 'value':
        return [
          {
            id: 'player-value',
            title: 'Player Value Analysis',
            description: 'Comprehensive player value metrics',
            content: (
              <SimpleBox p={2}>
                {/* Player value charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading player value data...' :
                    'Displays player value metrics including LTV, player worth, and value distribution.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'revenue-contribution',
            title: 'Revenue Contribution',
            description: 'Player revenue contribution by segment',
            content: (
              <SimpleBox p={2}>
                {/* Revenue contribution charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading revenue contribution data...' :
                    'Displays player revenue contribution by segment, Pareto analysis, and revenue concentration.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'profitability',
            title: 'Player Profitability',
            description: 'Player profitability metrics',
            content: (
              <SimpleBox p={2}>
                {/* Profitability charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading profitability data...' :
                    'Displays player profitability metrics, cost per acquisition, and ROI by segment.'}
                </Typography>
              </SimpleBox>
            )
          }
        ];

      case 'advanced':
        return [
          {
            id: 'predictive-models',
            title: 'Predictive Models',
            description: 'AI-powered player predictions',
            content: (
              <SimpleBox p={2}>
                {/* Predictive models would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading predictive model data...' :
                    'Displays AI-powered predictions including churn risk, conversion likelihood, and future value.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'anomaly-detection',
            title: 'Anomaly Detection',
            description: 'Unusual player behavior patterns',
            content: (
              <SimpleBox p={2}>
                {/* Anomaly detection charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading anomaly detection data...' :
                    'Displays unusual player behavior patterns, outlier detection, and risk indicators.'}
                </Typography>
              </SimpleBox>
            )
          },
          {
            id: 'cohort-analysis',
            title: 'Cohort Analysis',
            description: 'Detailed player cohort comparison',
            content: (
              <SimpleBox p={2}>
                {/* Cohort analysis charts would go here */}
                <Typography variant="body1">
                  {loading ? 'Loading cohort analysis data...' :
                    'Displays player cohort metrics, comparison between acquisition groups, and trend analysis.'}
                </Typography>
              </SimpleBox>
            )
          }
        ];

      default:
        return [];
    }
  };

  // Player report sections based on active tab
  const reportSections = generateReportSections();

  // Player report insights (would be dynamically generated in a real implementation)
  const playerInsights: PlayerInsight[] = [
    {
      id: 'insight-1',
      title: 'Player Acquisition Trend',
      description: 'Player acquisition has increased by 15% compared to the previous period, primarily driven by mobile app registrations.',
      importance: 'high',
      metric: 'acquisitions',
      change: 15
    },
    {
      id: 'insight-2',
      title: 'Retention Warning',
      description: 'Day 7 retention has dropped by 8% for players acquired through social media channels.',
      importance: 'medium',
      metric: 'retention',
      change: -8
    },
    {
      id: 'insight-3',
      title: 'High-Value Player Shift',
      description: 'VIP players are showing increased preference for table games compared to slots, with a 23% shift in playing time.',
      importance: 'high',
      metric: 'game-preference',
      change: 23
    }
  ];

  // Natural language query suggestions for players report
  const nlQuerySuggestions: string[] = [
    "Show me high-value players who haven't logged in for 30 days",
    "What's the average session time for VIP players by game type?",
    "Compare retention rates between web and mobile players",
    "Which players have the highest conversion rate from free to paid?",
    "Show churn prediction for players who deposited in the last quarter"
  ];

  // Render the Players Report with ReportViewer
  return (
    <SimpleBox sx={{ width: '100%', ...sx }}>
      {/* Natural Language Query Panel */}
      <NaturalLanguageQueryPanel
        onSearch={handleQuerySubmit}
        onSaveQuery={(query: string) => {
          // Save query logic would go here
          console.log('Saving query:', query);
        }}
        loading={nlQueryLoading}
        error={nlQueryError}
        showSuggestions={true}
        suggestions={nlQuerySuggestions}
      />

      {/* Report Configuration Header */}
      <SimpleBox sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h1">
          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Players Report
        </Typography>

        <SimpleBox sx={{ display: 'flex', gap: 2 }}>
          {/* View Mode Selection */}
          <TextField
            select
            size="small"
            label="View Mode"
            value={viewMode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setViewMode(e.target.value as ViewMode)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="standard">Standard View</MenuItem>
            <MenuItem value="compact">Compact View</MenuItem>
            <MenuItem value="detailed">Detailed View</MenuItem>
            <MenuItem value="visual">Visual Priority</MenuItem>
            <MenuItem value="data">Data Priority</MenuItem>
          </TextField>

          {/* Saved Views Selection */}
          <TextField
            select
            size="small"
            label="Saved Views"
            value=""
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const selectedView = savedViews.find(view => view.id === e.target.value);
              if (selectedView) {
                handleApplyView(selectedView);
              }
            }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="" disabled>
              Select a saved view
            </MenuItem>
            {savedViews.map(view => (
              <MenuItem key={view.id} value={view.id}>
                {view.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Comparison Mode Toggle */}
          <Tooltip title="Toggle comparison mode">
            <Button
              variant={comparisonMode ? "contained" : "outlined"}
              color={comparisonMode ? "primary" : "inherit"}
              onClick={toggleComparisonMode}
              startIcon={<CompareArrowsIcon />}
              size="small"
            >
              Compare
            </Button>
          </Tooltip>

          {/* Insights Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={showInsights}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowInsights(e.target.checked)}
                size="small"
              />
            }
            label="Insights"
            sx={{ mr: 0 }}
          />

          {/* Save View */}
          <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Name this view"
              value={currentViewName}
              onChange={(e) => setCurrentViewName(e.target.value)}
              sx={{ width: 150 }}
            />
            <IconButton
              color="primary"
              onClick={handleSaveView}
              disabled={!currentViewName.trim()}
            >
              <SaveAltIcon />
            </IconButton>
          </SimpleBox>
        </SimpleBox>
      </SimpleBox>

      {/* Report Navigation Tabs */}
      <SimpleBox sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Overview"
            value="overview"
            icon={<InsightsIcon />}
            iconPosition="start"
          />
          <Tab
            label="Demographics"
            value="demographics"
            icon={<PieChartIcon />}
            iconPosition="start"
          />
          <Tab
            label="Player Behavior"
            value="behavior"
            icon={<TimelineIcon />}
            iconPosition="start"
          />
          <Tab
            label="Retention"
            value="retention"
            icon={<TrendingUpIcon />}
            iconPosition="start"
          />
          <Tab
            label="Player Value"
            value="value"
            icon={<LayersIcon />}
            iconPosition="start"
          />
          <Tab
            label="Advanced Analytics"
            value="advanced"
            icon={<ShowChartIcon />}
            iconPosition="start"
          />
        </Tabs>
      </SimpleBox>

      {/* AI-generated Insights Panel (only shown when insights are enabled) */}
      {showInsights && playerInsights.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 1 }}>
          <SimpleBox sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InsightsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              Key Insights
            </Typography>
          </SimpleBox>
          <Grid container spacing={2}>
            {playerInsights.map(insight => (
              <Grid item xs={12} md={4} key={insight.id}>
                <SimpleBox
                  sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderLeft: 3,
                    borderColor: insight.importance === 'high' ? 'error.main' :
                                 insight.importance === 'medium' ? 'warning.main' : 'info.main',
                    height: '100%'
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    {insight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {insight.description}
                  </Typography>
                  <SimpleBox sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Chip
                      size="small"
                      color={insight.change > 0 ? "success" : "error"}
                      label={`${insight.change > 0 ? '+' : ''}${insight.change}%`}
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {insight.metric}
                    </Typography>
                  </SimpleBox>
                </SimpleBox>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Main Report Content */}
      <ReportViewer
        title={`Players Report - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        description={`Comprehensive analysis of player ${activeTab} metrics and trends`}
        filters={filters}
        filterValues={appliedFilters}
        onFilterChange={handleFilterChange}
        onFilterApply={() => onRefresh && onRefresh(appliedFilters)}
        onRefresh={() => onRefresh && onRefresh(appliedFilters)}
        loading={loading}
        error={error}
        sections={reportSections}
        data={data}
        showExport={true}
        onExport={onExport}
        onSave={onSave}
        headerActions={
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setCustomizationOpen(!customizationOpen)}
            size="small"
          >
            Customize
          </Button>
        }
      />

      {/* Natural Language Query Results (if any) */}
      {nlQueryResults && (
        <Card
          title="Query Results"
          subheader={nlQuery}
          sx={{ mt: 3 }}
        >
          <SimpleBox p={2}>
            {/* Query results would be displayed here */}
            <Typography variant="body1">
              Query results will be displayed here based on the natural language query execution.
            </Typography>
          </SimpleBox>
        </Card>
      )}

      {/* Comparison Mode Panel (only shown when comparison is enabled) */}
      {comparisonMode && (
        <Card
          title="Player Comparison"
          subheader="Compare metrics across different player segments or time periods"
          sx={{ mt: 3 }}
        >
          <SimpleBox p={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Primary Segment</Typography>
                <FilterPanel
                  filters={[
                    {
                      id: 'primarySegment',
                      label: 'Primary Segment',
                      type: 'select',
                      options: [
                        { value: 'vip', label: 'VIP Players' },
                        { value: 'highroller', label: 'High Rollers' },
                        { value: 'regular', label: 'Regular Players' },
                        { value: 'casual', label: 'Casual Players' },
                        { value: 'new', label: 'New Players' }
                      ],
                      defaultValue: 'vip'
                    },
                    {
                      id: 'primaryTimeframe',
                      label: 'Primary Timeframe',
                      type: 'select',
                      options: timeframeOptions,
                      defaultValue: 'last30days'
                    }
                  ]}
                  values={{}}
                  onChange={(id, value) => console.log(`Changed ${id} to ${value}`)}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Comparison Segment</Typography>
                <FilterPanel
                  filters={[
                    {
                      id: 'comparisonSegment',
                      label: 'Comparison Segment',
                      type: 'select',
                      options: [
                        { value: 'vip', label: 'VIP Players' },
                        { value: 'highroller', label: 'High Rollers' },
                        { value: 'regular', label: 'Regular Players' },
                        { value: 'casual', label: 'Casual Players' },
                        { value: 'new', label: 'New Players' }
                      ],
                      defaultValue: 'regular'
                    },
                    {
                      id: 'comparisonTimeframe',
                      label: 'Comparison Timeframe',
                      type: 'select',
                      options: timeframeOptions,
                      defaultValue: 'last30days'
                    }
                  ]}
                  values={{}}
                  onChange={(id, value) => console.log(`Changed ${id} to ${value}`)}
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => console.log('Running comparison')}
                >
                  Run Comparison
                </Button>
              </Grid>
            </Grid>
            <SimpleBox sx={{ mt: 3 }}>
              <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Comparison results will be displayed here after running the comparison.
              </Typography>
            </SimpleBox>
          </SimpleBox>
        </Card>
      )}

      {/* Report Customization Panel */}
      {customizationOpen && (
        <Card
          title="Customize Report"
          subheader="Personalize your players report view"
          sx={{ mt: 3 }}
        >
          <SimpleBox p={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Visible Sections</Typography>
                {/* Section visibility controls would go here */}
                <Typography variant="body2" color="text.secondary">
                  Controls for toggling section visibility would appear here.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Metrics & KPIs</Typography>
                {/* Metric selection controls would go here */}
                <Typography variant="body2" color="text.secondary">
                  Controls for selecting which metrics to display would appear here.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>Display Options</Typography>
                {/* Display option controls would go here */}
                <Typography variant="body2" color="text.secondary">
                  Controls for visualization types and display preferences would appear here.
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right' }}>
                <Button
                  variant="outlined"
                  onClick={() => setCustomizationOpen(false)}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    // Apply customization changes
                    setCustomizationOpen(false);
                  }}
                >
                  Apply Changes
                </Button>
              </Grid>
            </Grid>
          </SimpleBox>
        </Card>
      )}
    </SimpleBox>
  );
};

export default PlayersReport;