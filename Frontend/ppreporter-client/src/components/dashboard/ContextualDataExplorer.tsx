import React, { useState, useEffect, useCallback, useRef, MouseEvent, ChangeEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  IconButton,
  TextField as MuiTextField,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  Paper,
  Chip,
  Menu,
  Grid,
  Divider,
  Skeleton,
  InputLabel,
  OutlinedInput,
  Slider,
  Fade,
  Zoom,
  Card,
  CardContent,
  Badge,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  AssessmentOutlined as AssessmentOutlinedIcon,
  PieChartOutlined as PieChartOutlinedIcon,
  BarChartOutlined as BarChartOutlinedIcon,
  TableChartOutlined as TableChartOutlinedIcon,
  TimelineOutlined as TimelineOutlinedIcon,
  BubbleChartOutlined as BubbleChartOutlinedIcon,
  MapOutlined as MapOutlinedIcon,
  Tune as TuneIcon,
  GetApp as GetAppIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  HelpOutline as HelpOutlineIcon,
  ArrowBack as ArrowBackIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Notes as NotesIcon,
  Edit as EditIcon,
  CompareArrows as CompareArrowsIcon,
  Insights as InsightsIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  AutoGraph as AutoGraphIcon,
  Adjust as AdjustIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Home as HomeIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Psychology as PsychologyIcon,
  Assistant as AssistantIcon,
  SettingsSuggest as SettingsSuggestIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import {
  ContextualDataExplorerProps,
  SampleData,
  TimeSeriesDataPoint,
  GamePerformanceDataPoint,
  PlayerSegmentDataPoint,
  GeoDataPoint,
  ChartType as ChartTypeInterface,
  DataSource,
  Annotation,
  NLQueryResult,
  WhatIfParameters,
  WhatIfResults
} from '../../types/dataExplorer';

// Sample data for visualizations
const generateSampleTimeSeriesData = (days = 30): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const deposits = 15000 + Math.random() * 8000;
    const withdrawals = 12000 + Math.random() * 6000;
    const newUsers = 100 + Math.random() * 80;
    const activeUsers = 1500 + Math.random() * 300;

    data.push({
      date: date.toISOString().split('T')[0],
      deposits,
      withdrawals,
      newUsers,
      activeUsers,
      profit: deposits - withdrawals,
      betCount: 12000 + Math.random() * 5000
    });
  }

  return data;
};

const generateGamePerformanceData = (): GamePerformanceDataPoint[] => {
  const gameTypes = [
    'Slots', 'Live Casino', 'Table Games', 'Sports Betting',
    'Poker', 'Bingo', 'Virtual Sports', 'Lottery'
  ];

  return gameTypes.map(type => ({
    name: type,
    revenue: Math.round(10000 + Math.random() * 90000),
    players: Math.round(500 + Math.random() * 2500),
    bets: Math.round(5000 + Math.random() * 45000),
    returnRate: 0.9 + Math.random() * 0.09,
    growth: -15 + Math.random() * 30
  }));
};

const generatePlayerSegmentData = (): PlayerSegmentDataPoint[] => {
  return [
    { name: 'VIP', value: 15, color: '#8884d8' },
    { name: 'High Value', value: 25, color: '#83a6ed' },
    { name: 'Regular', value: 35, color: '#8dd1e1' },
    { name: 'Casual', value: 20, color: '#82ca9d' },
    { name: 'New', value: 5, color: '#ffc658' }
  ];
};

const generateGeoData = (): GeoDataPoint[] => {
  const countries = [
    'United Kingdom', 'Germany', 'Sweden', 'Finland', 'Denmark',
    'Netherlands', 'Spain', 'Italy', 'France', 'Canada'
  ];

  return countries.map(country => ({
    country,
    players: Math.round(200 + Math.random() * 1800),
    revenue: Math.round(5000 + Math.random() * 45000),
    deposits: Math.round(7000 + Math.random() * 55000),
    withdrawals: Math.round(5000 + Math.random() * 40000),
    bonusAmount: Math.round(1000 + Math.random() * 9000)
  }));
};

const SAMPLE_DATA: SampleData = {
  timeSeriesData: generateSampleTimeSeriesData(),
  gamePerformanceData: generateGamePerformanceData(),
  playerSegmentData: generatePlayerSegmentData(),
  geoData: generateGeoData()
};

// Chart types
const CHART_TYPES: ChartTypeInterface[] = [
  { id: 'line', name: 'Line Chart', icon: <TimelineOutlinedIcon /> },
  { id: 'bar', name: 'Bar Chart', icon: <BarChartOutlinedIcon /> },
  { id: 'pie', name: 'Pie Chart', icon: <PieChartOutlinedIcon /> },
  { id: 'area', name: 'Area Chart', icon: <AssessmentOutlinedIcon /> },
  { id: 'scatter', name: 'Scatter Chart', icon: <BubbleChartOutlinedIcon /> },
  { id: 'map', name: 'Map View', icon: <MapOutlinedIcon /> },
  { id: 'table', name: 'Table View', icon: <TableChartOutlinedIcon /> }
];

// Styled components
const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
}));

const ChartHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

const ChartContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  minHeight: 300
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2)
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0, 1),
  border: `1px solid ${theme.palette.divider}`,
  marginRight: theme.spacing(2),
  width: '100%',
  maxWidth: 400
}));

const ChartTypeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(2)
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: theme.spacing(2)
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

// Add suggested queries for natural language search
const SUGGESTED_NL_QUERIES: string[] = [
  "Show me deposits trend for the last month",
  "Which game type has the highest revenue?",
  "Compare VIP vs regular player segments",
  "What's the withdrawal to deposit ratio?",
  "Show countries with highest player counts"
];

/**
 * ContextualDataExplorer component for visualizing and exploring data
 * Enhanced with fluid interface interactions and modern visualization approaches
 */
const ContextualDataExplorer: React.FC<ContextualDataExplorerProps> = ({
  data = SAMPLE_DATA,
  isLoading = false,
  onRefresh = () => {},
  onExport = () => {},
  onFilter = () => {},
  onSearch = () => {},
  onNaturalLanguageSearch = async () => ({ needsClarification: false }),
  onDataPointSelect = () => {},
  onAnnotationCreate = () => {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [chartType, setChartType] = useState<string>('line');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dataSource, setDataSource] = useState<string>('timeSeriesData');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<HTMLElement | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [metrics, setMetrics] = useState<string[]>(['deposits', 'withdrawals']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // New state variables for Natural Language Search
  const [isNaturalLanguageMode, setIsNaturalLanguageMode] = useState<boolean>(false);
  const [nlQuery, setNlQuery] = useState<string>('');
  const [nlResults, setNlResults] = useState<NLQueryResult | null>(null);
  const [isNlProcessing, setIsNlProcessing] = useState<boolean>(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [clarificationNeeded, setClarificationNeeded] = useState<boolean>(false);
  const [clarificationResponses, setClarificationResponses] = useState<Record<string, any>>({});
  const [showNlHelp, setShowNlHelp] = useState<boolean>(false);
  const [showNlSuccess, setShowNlSuccess] = useState<boolean>(false);
  const [lastSuccessfulQuery, setLastSuccessfulQuery] = useState<string>('');

  // New state variables for enhanced functionality
  const [currentView, setCurrentView] = useState<string>('overview');
  const [previousView, setPreviousView] = useState<string | null>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationDialogOpen, setAnnotationDialogOpen] = useState<boolean>(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation>({
    text: '',
    position: { x: 0, y: 0 },
    timestamp: new Date(),
    chartType: '',
    dataSource: '',
    metrics: []
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [navHistory, setNavHistory] = useState<string[]>(['overview']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [bookmarkedViews, setBookmarkedViews] = useState<string[]>([]);
  const [whatIfScenarioActive, setWhatIfScenarioActive] = useState<boolean>(false);
  const [whatIfParameters, setWhatIfParameters] = useState<WhatIfParameters>({});
  const [whatIfDialogOpen, setWhatIfDialogOpen] = useState<boolean>(false);
  const [whatIfResults, setWhatIfResults] = useState<WhatIfResults | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartHovered, setChartHovered] = useState<boolean>(false);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle chart type change
  const handleChartTypeChange = (type: string): void => {
    setChartType(type);
  };

  // Handle menu open
  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = (): void => {
    setAnchorEl(null);
  };

  // Handle filter menu open
  const handleFilterMenuClick = (event: MouseEvent<HTMLButtonElement>): void => {
    setFilterMenuAnchor(event.currentTarget);
  };

  // Handle filter menu close
  const handleFilterMenuClose = (): void => {
    setFilterMenuAnchor(null);
  };

  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent<string>): void => {
    setTimeRange(event.target.value);
  };

  // Handle metrics change
  const handleMetricsChange = (event: SelectChangeEvent<string[]>): void => {
    const {
      target: { value },
    } = event;
    setMetrics(typeof value === 'string' ? value.split(',') : value);
  };

  // Handle search
  const handleSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    if (isNaturalLanguageMode) {
      setNlQuery(event.target.value);
    } else {
      setSearchQuery(event.target.value);
      onSearch(event.target.value);
    }
  };

  // Enhanced natural language search handler
  const handleNaturalLanguageSearch = async (): Promise<void> => {
    if (!nlQuery.trim()) return;

    setIsNlProcessing(true);
    setNlError(null);
    setShowNlSuccess(false);

    try {
      const result = await onNaturalLanguageSearch(nlQuery, clarificationResponses);

      if (result.needsClarification) {
        setClarificationNeeded(true);
        setNlResults(result);
      } else {
        setClarificationNeeded(false);
        setClarificationResponses({});
        setNlResults(result);

        // Apply the results to update visualization
        if (result.dataSource) {
          setDataSource(result.dataSource);
        }

        if (result.metrics && result.metrics.length > 0) {
          setMetrics(result.metrics);
        }

        if (result.chartType) {
          setChartType(result.chartType);
        }

        if (result.timeRange) {
          setTimeRange(result.timeRange);
        }

        // Show success feedback
        setLastSuccessfulQuery(nlQuery);
        setShowNlSuccess(true);
        setTimeout(() => setShowNlSuccess(false), 3000);
      }
    } catch (error) {
      setNlError((error as Error).message || 'Error processing natural language query');
    } finally {
      setIsNlProcessing(false);
    }
  };

  // Handle toggle between regular and natural language search
  const handleSearchModeToggle = (): void => {
    setIsNaturalLanguageMode(!isNaturalLanguageMode);
    setNlError(null);
    setClarificationNeeded(false);
  };

  // Handle clarification response changes
  const handleClarificationChange = (conflictId: string, value: any): void => {
    setClarificationResponses({
      ...clarificationResponses,
      [conflictId]: value
    });
  };

  // Submit clarification responses
  const handleSubmitClarification = async (): Promise<void> => {
    if (Object.keys(clarificationResponses).length === 0) return;

    setIsNlProcessing(true);

    try {
      const result = await onNaturalLanguageSearch(nlQuery, clarificationResponses);

      if (result.needsClarification) {
        // Still needs more clarification
        setClarificationNeeded(true);
        setNlResults(result);
      } else {
        // Clarification resolved
        setClarificationNeeded(false);
        setClarificationResponses({});
        setNlResults(result);

        // Apply the results to update visualization
        if (result.dataSource) {
          setDataSource(result.dataSource);
        }

        if (result.metrics && result.metrics.length > 0) {
          setMetrics(result.metrics);
        }

        if (result.chartType) {
          setChartType(result.chartType);
        }

        if (result.timeRange) {
          setTimeRange(result.timeRange);
        }
      }
    } catch (error) {
      setNlError((error as Error).message || 'Error processing clarification');
    } finally {
      setIsNlProcessing(false);
    }
  };

  // Toggle NL search help dialog
  const toggleNlHelpDialog = (): void => {
    setShowNlHelp(!showNlHelp);
  };

  // Handle filter toggle
  const handleFilterToggle = (): void => {
    setShowFilters(!showFilters);
  };

  // Render natural language search
  const renderNaturalLanguageSearch = (): React.ReactNode => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 500 }}>
        <SearchContainer>
          <IconButton size="small">
            <PsychologyIcon />
          </IconButton>
          <TextField
            placeholder="Ask a question about your data..."
            variant="standard"
            value={nlQuery}
            onChange={handleSearch}
            InputProps={{
              disableUnderline: true,
              sx: { flexGrow: 1 }
            }}
            sx={{ ml: 1, flexGrow: 1 }}
          />
          {nlQuery && (
            <IconButton size="small" onClick={() => setNlQuery('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <Tooltip title="View examples and help">
            <IconButton size="small" onClick={toggleNlHelpDialog}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </SearchContainer>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNaturalLanguageSearch}
          disabled={!nlQuery.trim() || isNlProcessing}
          size="small"
          sx={{ ml: 1, minWidth: 100 }}
        >
          {isNlProcessing ? <CircularProgress size={20} /> : 'Ask'}
        </Button>
      </Box>
    );
  };

  // Handle navigation between views with fluid transitions
  const navigateTo = (view: string, metadata: any = {}, direction: 'forward' | 'backward' = 'forward'): void => {
    setPreviousView(currentView);
    setCurrentView(view);
    setTransitionDirection(direction);

    if (metadata.dataPoint) {
      setSelectedDataPoint(metadata.dataPoint);
    }

    // Update navigation history
    if (direction === 'forward') {
      const newHistory = navHistory.slice(0, historyIndex + 1);
      newHistory.push(view);
      setNavHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    // Handle any view-specific setup
    if (view === 'overview') {
      setSelectedDataPoint(null);
    }
  };

  // Handle back navigation
  const navigateBack = (): void => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      navigateTo(navHistory[newIndex], {}, 'backward');
    }
  };

  // Handle forward navigation
  const navigateForward = (): void => {
    if (historyIndex < navHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      navigateTo(navHistory[newIndex], {}, 'forward');
    }
  };

  // Toggle bookmark for current view
  const toggleBookmark = (): void => {
    const viewKey = `${currentView}-${dataSource}-${chartType}`;

    if (bookmarkedViews.includes(viewKey)) {
      setBookmarkedViews(bookmarkedViews.filter(v => v !== viewKey));
    } else {
      setBookmarkedViews([...bookmarkedViews, viewKey]);
    }
  };

  // Check if current view is bookmarked
  const isCurrentViewBookmarked = (): boolean => {
    const viewKey = `${currentView}-${dataSource}-${chartType}`;
    return bookmarkedViews.includes(viewKey);
  };

  // Handle data point click to open detailed view
  const handleDataPointClick = (dataPoint: any): void => {
    setSelectedDataPoint(dataPoint);
    navigateTo('detail', { dataPoint });
    onDataPointSelect(dataPoint);
  };

  // Handle chart hover for tooltip positioning
  const handleChartMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Handle zoom in/out functions
  const handleZoomIn = (): void => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = (): void => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  // Open What-If Scenario dialog
  const openWhatIfDialog = (): void => {
    setWhatIfDialogOpen(true);

    // Initialize what-if parameters based on current data
    const params: WhatIfParameters = {};

    if (dataSource === 'gamePerformanceData') {
      params.revenueGrowth = 0;
      params.playerGrowth = 0;
      params.returnRateAdjustment = 0;
    } else if (dataSource === 'timeSeriesData') {
      params.depositGrowth = 0;
      params.withdrawalReduction = 0;
      params.playerRetentionImprovement = 0;
    }

    setWhatIfParameters(params);
  };

  // Close What-If Scenario dialog
  const closeWhatIfDialog = (): void => {
    setWhatIfDialogOpen(false);
  };

  // Apply What-If Scenario
  const applyWhatIfScenario = (): void => {
    // Simulate what-if results based on parameters
    let adjustedData: any[] = [];

    if (dataSource === 'gamePerformanceData') {
      adjustedData = data.gamePerformanceData.map(item => ({
        ...item,
        revenue: item.revenue * (1 + (whatIfParameters.revenueGrowth || 0) / 100),
        players: item.players * (1 + (whatIfParameters.playerGrowth || 0) / 100),
        returnRate: item.returnRate * (1 + (whatIfParameters.returnRateAdjustment || 0) / 100)
      }));
    } else if (dataSource === 'timeSeriesData') {
      adjustedData = data.timeSeriesData.map(item => ({
        ...item,
        deposits: item.deposits * (1 + (whatIfParameters.depositGrowth || 0) / 100),
        withdrawals: item.withdrawals * (1 - (whatIfParameters.withdrawalReduction || 0) / 100),
        activeUsers: item.activeUsers * (1 + (whatIfParameters.playerRetentionImprovement || 0) / 100)
      }));
    }

    setWhatIfResults({
      data: adjustedData,
      source: dataSource
    });

    setWhatIfScenarioActive(true);
    setWhatIfDialogOpen(false);
  };

  // Reset What-If Scenario
  const resetWhatIfScenario = (): void => {
    setWhatIfScenarioActive(false);
    setWhatIfResults(null);
  };

  // Handle annotation creation
  const handleCreateAnnotation = (event: React.MouseEvent<HTMLElement>): void => {
    if (chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      setCurrentAnnotation({
        text: '',
        position: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        },
        timestamp: new Date(),
        chartType,
        dataSource,
        metrics: [...metrics]
      });
      setAnnotationDialogOpen(true);
    }
  };

  // Save annotation
  const saveAnnotation = (): void => {
    if (currentAnnotation.text.trim()) {
      const newAnnotation: Annotation = {
        ...currentAnnotation,
        id: Date.now()
      };

      setAnnotations([...annotations, newAnnotation]);
      setAnnotationDialogOpen(false);

      if (onAnnotationCreate) {
        onAnnotationCreate(newAnnotation);
      }
    }
  };

  // Get modified data for what-if scenario
  const getDisplayData = (): SampleData => {
    if (whatIfScenarioActive && whatIfResults && whatIfResults.source === dataSource) {
      return {
        ...data,
        [dataSource]: whatIfResults.data
      };
    }
    return data;
  };

  // Render line chart
  const renderLineChart = (): React.ReactNode => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={getDisplayData().timeSeriesData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="date"
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6, onClick: (e) => handleDataPointClick(e.payload) }}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  // Render bar chart
  const renderBarChart = (): React.ReactNode => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dataSource === 'gamePerformanceData' ? getDisplayData().gamePerformanceData : getDisplayData().timeSeriesData}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey={dataSource === 'gamePerformanceData' ? "name" : "date"}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Legend />
        {metrics.map((metric, index) => (
          <Bar
            key={metric}
            dataKey={metric}
            fill={COLORS[index % COLORS.length]}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            onClick={(data) => handleDataPointClick(data)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
