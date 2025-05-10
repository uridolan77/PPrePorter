import React, { useState, useRef, MouseEvent, ChangeEvent } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Button,
  InputAdornment,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  Paper,
  Chip,
  Menu,
  Skeleton,
  Badge,
  SelectChangeEvent,
  Zoom
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
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import {
  ContextualDataExplorerProps,
  Annotation,
  NLQueryResult,
  WhatIfParameters,
  WhatIfResults,
  ChartType as ChartTypeInterface
} from '../../../types/dataExplorer';
import {
  renderLineChart,
  renderBarChart,
  renderPieChart,
  renderAreaChart,
  renderScatterChart,
  renderTableView
} from './ChartRenderers';
import { NLHelpDialog, WhatIfDialog, AnnotationDialog } from './Dialogs';
import DetailView from './DetailView';
import {
  SAMPLE_DATA,
  SUGGESTED_NL_QUERIES,
  COLORS,
  CHART_TYPES as CHART_TYPES_DATA
} from './DataGenerators';

// Styled components
const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
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

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: theme.spacing(2)
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2)
}));

// Create the chart type objects with React components
const CHART_TYPES: ChartTypeInterface[] = [
  { id: 'line', name: 'Line Chart', icon: <TimelineOutlinedIcon /> },
  { id: 'bar', name: 'Bar Chart', icon: <BarChartOutlinedIcon /> },
  { id: 'pie', name: 'Pie Chart', icon: <PieChartOutlinedIcon /> },
  { id: 'area', name: 'Area Chart', icon: <AssessmentOutlinedIcon /> },
  { id: 'scatter', name: 'Scatter Chart', icon: <BubbleChartOutlinedIcon /> },
  { id: 'map', name: 'Map View', icon: <MapOutlinedIcon /> },
  { id: 'table', name: 'Table View', icon: <TableChartOutlinedIcon /> }
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

  // Natural Language Search state
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

  // Navigation and view state
  const [currentView, setCurrentView] = useState<string>('overview');
  const [previousView, setPreviousView] = useState<string | null>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any | null>(null);
  const [navHistory, setNavHistory] = useState<string[]>(['overview']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [bookmarkedViews, setBookmarkedViews] = useState<string[]>([]);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');

  // Annotations state
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

  // What-If scenario state
  const [whatIfScenarioActive, setWhatIfScenarioActive] = useState<boolean>(false);
  const [whatIfParameters, setWhatIfParameters] = useState<WhatIfParameters>({});
  const [whatIfDialogOpen, setWhatIfDialogOpen] = useState<boolean>(false);
  const [whatIfResults, setWhatIfResults] = useState<WhatIfResults | null>(null);

  // UI state
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
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
        // Check if result has the expected properties
        const nlResult = result as NLQueryResult;

        if (nlResult.dataSource) {
          setDataSource(nlResult.dataSource);
        }

        if (nlResult.metrics && nlResult.metrics.length > 0) {
          setMetrics(nlResult.metrics);
        }

        if (nlResult.chartType) {
          setChartType(nlResult.chartType);
        }

        if (nlResult.timeRange) {
          setTimeRange(nlResult.timeRange);
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
        // Check if result has the expected properties
        const nlResult = result as NLQueryResult;

        if (nlResult.dataSource) {
          setDataSource(nlResult.dataSource);
        }

        if (nlResult.metrics && nlResult.metrics.length > 0) {
          setMetrics(nlResult.metrics);
        }

        if (nlResult.chartType) {
          setChartType(nlResult.chartType);
        }

        if (nlResult.timeRange) {
          setTimeRange(nlResult.timeRange);
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

  // Handle what-if parameter change
  const handleWhatIfParameterChange = (param: string, value: number): void => {
    setWhatIfParameters(prev => ({
      ...prev,
      [param]: value
    }));
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

  // Handle annotation text change
  const handleAnnotationTextChange = (text: string): void => {
    setCurrentAnnotation(prev => ({
      ...prev,
      text
    }));
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
  const getDisplayData = () => {
    if (whatIfScenarioActive && whatIfResults && whatIfResults.source === dataSource) {
      return {
        ...data,
        [dataSource]: whatIfResults.data
      };
    }
    return data;
  };

  // Render content based on chart type
  const renderContent = (): React.ReactNode => {
    if (isLoading) {
      return (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="rectangular" width="100%" height={300} />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Skeleton width="60%" height={30} />
            </Box>
          </Box>
        </Box>
      );
    }

    const chartProps = {
      data: getDisplayData(),
      dataSource,
      metrics,
      handleDataPointClick
    };

    switch(chartType) {
      case 'line':
        return renderLineChart(chartProps);
      case 'bar':
        return renderBarChart(chartProps);
      case 'pie':
        return renderPieChart(chartProps);
      case 'area':
        return renderAreaChart(chartProps);
      case 'scatter':
        return renderScatterChart(chartProps);
      case 'table':
        return renderTableView(chartProps);
      default:
        return (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Select a chart type to visualize data
            </Typography>
          </Box>
        );
    }
  };

  // Available metrics based on the selected data source
  const getAvailableMetrics = (): string[] => {
    switch(dataSource) {
      case 'gamePerformanceData':
        return ['revenue', 'players', 'bets', 'returnRate', 'growth'];
      case 'geoData':
        return ['players', 'revenue', 'deposits', 'withdrawals', 'bonusAmount'];
      case 'playerSegmentData':
        return ['value'];
      default:
        return ['deposits', 'withdrawals', 'newUsers', 'activeUsers', 'profit', 'betCount'];
    }
  };

  // Available data sources
  const dataSources = [
    { id: 'timeSeriesData', name: 'Time Series Data' },
    { id: 'gamePerformanceData', name: 'Game Performance' },
    { id: 'playerSegmentData', name: 'Player Segments' },
    { id: 'geoData', name: 'Geographic Data' }
  ];

  // Render interactive custom tooltip with annotations
  const renderCustomTooltip = ({ active, payload, label }: any): React.ReactNode => {
    if (active && payload && payload.length) {
      return (
        <Zoom in={active}>
          <Paper
            elevation={3}
            sx={{
              p: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: `1px solid ${theme.palette.primary.main}`,
              maxWidth: 250
            }}
          >
            <Typography variant="subtitle2" gutterBottom color="primary">
              {label}
            </Typography>
            {payload.map((entry: any, index: number) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: entry.color,
                    mr: 1,
                    borderRadius: '50%'
                  }}
                />
                <Typography variant="body2">
                  {entry.name}: {typeof entry.value === 'number'
                    ? entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : entry.value}
                </Typography>
              </Box>
            ))}
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                size="small"
                startIcon={<ZoomInIcon fontSize="small" />}
                onClick={() => handleDataPointClick(payload[0].payload)}
                sx={{ fontSize: '0.7rem' }}
              >
                Details
              </Button>
              <Button
                size="small"
                startIcon={<NotesIcon fontSize="small" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateAnnotation(e);
                }}
                sx={{ fontSize: '0.7rem' }}
              >
                Add Note
              </Button>
            </Box>
          </Paper>
        </Zoom>
      );
    }
    return null;
  };

  // Define animation variants
  const pageVariants = {
    initial: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? 100 : -100,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: 'forward' | 'backward') => ({
      x: direction === 'forward' ? -100 : 100,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    })
  };

  // Render filters
  const renderFilters = (): React.ReactNode => {
    if (!showFilters) return null;

    return (
      <FilterContainer>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Typography variant="caption" gutterBottom>Data Source</Typography>
          <Select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            size="small"
          >
            {dataSources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                {source.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Typography variant="caption" gutterBottom>Time Range</Typography>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            size="small"
            disabled={dataSource !== 'timeSeriesData'}
          >
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
            <MenuItem value="1y">Last Year</MenuItem>
            <MenuItem value="ytd">Year to Date</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200, maxWidth: 400 }}>
          <Typography variant="caption" gutterBottom>Metrics</Typography>
          <Select
            multiple
            value={metrics}
            onChange={handleMetricsChange}
            size="small"
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {getAvailableMetrics().map((metric) => (
              <MenuItem key={metric} value={metric}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Typography variant="caption" gutterBottom>Chart Type</Typography>
          <Select
            value={chartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
            size="small"
          >
            {CHART_TYPES.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 1 }}>{type.icon}</Box>
                  {type.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </FilterContainer>
    );
  };

  // Main render method
  return (
    <ChartContainer
      elevation={2}
      sx={{
        position: 'relative',
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'center top',
        transition: 'transform 0.3s ease-out'
      }}
      ref={chartContainerRef}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {currentView !== 'overview' && (
            <Tooltip title="Back">
              <IconButton onClick={navigateBack} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Home">
            <IconButton
              onClick={() => navigateTo('overview')}
              color={currentView === 'overview' ? 'primary' : 'default'}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {currentView === 'overview' ? 'Data Explorer' :
             currentView === 'detail' ? 'Detail View' : 'Data Analysis'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Previous View">
            <span>
              <IconButton
                disabled={historyIndex <= 0}
                onClick={navigateBack}
                size="small"
              >
                <NavigateBeforeIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next View">
            <span>
              <IconButton
                disabled={historyIndex >= navHistory.length - 1}
                onClick={navigateForward}
                size="small"
              >
                <NavigateNextIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={isCurrentViewBookmarked() ? "Remove Bookmark" : "Bookmark View"}>
            <IconButton onClick={toggleBookmark} size="small">
              {isCurrentViewBookmarked() ?
                <BookmarkIcon color="primary" /> :
                <BookmarkBorderIcon />
              }
            </IconButton>
          </Tooltip>
          <Tooltip title="What-If Scenario">
            <IconButton
              onClick={openWhatIfDialog}
              size="small"
              color={whatIfScenarioActive ? "primary" : "default"}
            >
              <CompareArrowsIcon />
            </IconButton>
          </Tooltip>
          <Badge
            color="primary"
            badgeContent={annotations.filter(a => a.dataSource === dataSource).length}
            max={99}
            sx={{ mx: 0.5 }}
          >
            <Tooltip title="Annotations">
              <IconButton onClick={handleCreateAnnotation} size="small">
                <NotesIcon />
              </IconButton>
            </Tooltip>
          </Badge>
          <Box sx={{ mx: 0.5, display: 'flex', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut} size="small" disabled={zoomLevel <= 0.5}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Zoom">
              <IconButton onClick={() => setZoomLevel(1)} size="small" disabled={zoomLevel === 1}>
                <AdjustIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn} size="small" disabled={zoomLevel >= 2}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {whatIfScenarioActive && (
        <Box
          sx={{
            mb: 2,
            p: 1,
            backgroundColor: theme.palette.info.light,
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InsightsIcon sx={{ mr: 1, color: theme.palette.info.dark }} />
            <Typography variant="body2" color="info.dark">
              What-If Scenario Active
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={resetWhatIfScenario}
          >
            Reset
          </Button>
        </Box>
      )}

      <ToolbarContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {/* Add Natural Language Search toggle and UI */}
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 500 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isNaturalLanguageMode}
                  onChange={handleSearchModeToggle}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isNaturalLanguageMode ? (
                    <PsychologyIcon fontSize="small" sx={{ mr: 0.5 }} />
                  ) : (
                    <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />
                  )}
                  <Typography variant="body2">
                    {isNaturalLanguageMode ? "Natural Language" : "Regular Search"}
                  </Typography>
                </Box>
              }
            />

            {isNaturalLanguageMode ? renderNaturalLanguageSearch() : (
              <SearchContainer>
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
                <TextField
                  placeholder="Search data..."
                  variant="standard"
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    disableUnderline: true,
                    sx: { flexGrow: 1 }
                  }}
                  sx={{ ml: 1, flexGrow: 1 }}
                />
              </SearchContainer>
            )}
          </Box>

          <IconButton
            onClick={handleFilterToggle}
            color={showFilters ? "primary" : "default"}
            size="small"
          >
            <FilterListIcon />
          </IconButton>

          <IconButton onClick={onRefresh} size="small">
            <RefreshIcon />
          </IconButton>

          {!isMobile && (
            <>
              <IconButton onClick={onExport} size="small">
                <GetAppIcon />
              </IconButton>
              <IconButton size="small">
                <ShareIcon />
              </IconButton>
            </>
          )}

          {isMobile && (
            <>
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleMenuClick}
                size="small"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { onExport(); handleMenuClose(); }}>
                  Export Data
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  Share
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  Help
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </ToolbarContainer>

      {/* Add Clarification UI */}
      {clarificationNeeded && nlResults && (
        <Box sx={{
          mb: 2,
          p: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          border: `1px solid ${theme.palette.warning.light}`,
        }}>
          <Typography variant="subtitle2" color="warning.main" gutterBottom>
            <SettingsSuggestIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            I need clarification to process your query
          </Typography>

          <Box sx={{ mt: 1 }}>
            {nlResults.clarificationQuestions && nlResults.clarificationQuestions.map((question, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {question.text}
                </Typography>

                {question.type === 'select' && (
                  <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                    <Select
                      value={clarificationResponses[question.id] || ''}
                      onChange={(e) => handleClarificationChange(question.id, e.target.value)}
                    >
                      {question.options && question.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {question.type === 'text' && (
                  <TextField
                    size="small"
                    fullWidth
                    value={clarificationResponses[question.id] || ''}
                    onChange={(e) => handleClarificationChange(question.id, e.target.value)}
                    sx={{ mt: 1 }}
                  />
                )}

                {question.type === 'boolean' && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant={clarificationResponses[question.id] === true ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleClarificationChange(question.id, true)}
                      sx={{ mr: 1 }}
                    >
                      Yes
                    </Button>
                    <Button
                      variant={clarificationResponses[question.id] === false ? "contained" : "outlined"}
                      size="small"
                      onClick={() => handleClarificationChange(question.id, false)}
                    >
                      No
                    </Button>
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setClarificationNeeded(false);
                setNlError(null);
              }}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSubmitClarification}
              disabled={isNlProcessing || Object.keys(clarificationResponses).length === 0}
            >
              {isNlProcessing ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : null}
              Submit
            </Button>
          </Box>
        </Box>
      )}

      {/* Add error message */}
      <Snackbar
        open={Boolean(nlError)}
        autoHideDuration={6000}
        onClose={() => setNlError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setNlError(null)} severity="error">
          {nlError}
        </Alert>
      </Snackbar>

      {/* Render filters */}
      {renderFilters()}

      {/* Main content area */}
      <Box
        sx={{
          flexGrow: 1,
          minHeight: 400,
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseMove={handleChartMouseMove}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentView}
            custom={transitionDirection}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            style={{ height: '100%' }}
          >
            {currentView === 'overview' ? (
              renderContent()
            ) : currentView === 'detail' && selectedDataPoint ? (
              <DetailView
                dataSource={dataSource}
                selectedDataPoint={selectedDataPoint}
                metrics={metrics}
                data={getDisplayData()}
                annotations={annotations}
                onNavigateBack={navigateBack}
                onCreateAnnotation={handleCreateAnnotation}
                renderCustomTooltip={renderCustomTooltip}
              />
            ) : (
              renderContent()
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Dialogs */}
      <NLHelpDialog
        open={showNlHelp}
        onClose={toggleNlHelpDialog}
        suggestedQueries={SUGGESTED_NL_QUERIES}
        onQuerySelect={(query) => setNlQuery(query)}
      />

      <WhatIfDialog
        open={whatIfDialogOpen}
        onClose={() => setWhatIfDialogOpen(false)}
        dataSource={dataSource}
        parameters={whatIfParameters}
        onParameterChange={handleWhatIfParameterChange}
        onApply={applyWhatIfScenario}
      />

      <AnnotationDialog
        open={annotationDialogOpen}
        onClose={() => setAnnotationDialogOpen(false)}
        annotation={currentAnnotation}
        onAnnotationTextChange={handleAnnotationTextChange}
        onSave={saveAnnotation}
      />
    </ChartContainer>
  );
};

export default ContextualDataExplorer;
