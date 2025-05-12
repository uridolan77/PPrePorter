import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format as formatDate, parseISO, subDays } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CasinoIcon from '@mui/icons-material/Casino';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Import report components
// import { ReportViewer } from '../../components/reports'; // Commented out as it doesn't exist
import NaturalLanguageQueryPanel from '../../components/reports/NaturalLanguageQueryPanel';
import { EnhancedTable } from '../../components/tables/enhanced';
import { ColumnDef, ExportFormat } from '../../components/tables/enhanced/types';
import CustomizableDashboard from '../../components/reports/dashboard/CustomizableDashboard';
import { SaveConfigDialog, AddWidgetDialog, ShareDialog } from '../../components/reports/dashboard/DashboardDialogs';
import { Widget as DashboardWidget, WidgetType as DashboardWidgetType } from '../../components/reports/dashboard/DashboardWidget';
import { FilterContextProvider } from '../../components/reports/interactive/FilterContext';
import { AnnotationContextProvider } from '../../components/reports/interactive/AnnotationSystem';

// Import Redux
import { AppDispatch } from '../../store/store';
import {
  fetchDailyActionsData,
  fetchPlayerData,
  fetchGameData,
  fetchDashboardSummary,
  fetchRevenueChartData,
  fetchRegistrationsChartData,
  fetchTopGamesData,
  fetchRecentTransactionsData,
  fetchUserPreferences,
  saveUserPreferences,
  selectDailyActionsData,
  selectPlayerData,
  selectGameData,
  selectDashboardSummary,
  selectRevenueChartData,
  selectRegistrationsChartData,
  selectTopGamesData,
  selectRecentTransactionsData,
  selectUserPreferences
} from '../../store/slices/integratedReportsSlice';

// Import mock data (will be replaced with real data)
const mockSuggestions = [
  "Show me player activity for the last 7 days",
  "What are the top performing games this month?",
  "Compare deposit trends between desktop and mobile users",
  "Show me conversion rates by country",
  "Which games have the highest GGR?"
];

// Chart colors
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

// Widget types
type WidgetType = 'table' | 'lineChart' | 'barChart' | 'pieChart' | 'areaChart' | 'summary';

// Widget interface
interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  config?: any;
}

// Dashboard configuration interface
interface DashboardConfig {
  id?: string;
  name: string;
  description?: string;
  widgets: Widget[];
  filters?: any;
  createdAt?: string;
  updatedAt?: string;
}

// User preferences interface
interface UserPreferences {
  defaultDateRange: string;
  defaultTab: number;
  dashboardLayouts: DashboardConfig[];
  theme: 'light' | 'dark';
  chartPreferences: {
    showLegends: boolean;
    showGridLines: boolean;
    colorPalette: string;
  };
}

/**
 * IntegratedReportsPage component
 * Combines various report components into a comprehensive dashboard
 */
const IntegratedReportsPage: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<number>(0);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for dashboard customization
  const [customizeMode, setCustomizeMode] = useState<boolean>(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    name: 'Default Dashboard',
    widgets: [
      {
        id: 'widget-1',
        type: 'areaChart',
        title: 'Daily Actions Trend',
        dataSource: 'dailyActions',
        size: 'large',
        position: 0
      },
      {
        id: 'widget-2',
        type: 'barChart',
        title: 'Top Games',
        dataSource: 'games',
        size: 'medium',
        position: 1
      },
      {
        id: 'widget-3',
        type: 'pieChart',
        title: 'Player Distribution',
        dataSource: 'players',
        size: 'medium',
        position: 2
      },
      {
        id: 'widget-4',
        type: 'table',
        title: 'Recent Activity',
        dataSource: 'dailyActions',
        size: 'large',
        position: 3
      }
    ]
  });

  // State for user preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    defaultDateRange: '7',
    defaultTab: 0,
    dashboardLayouts: [],
    theme: 'light',
    chartPreferences: {
      showLegends: true,
      showGridLines: true,
      colorPalette: 'default'
    }
  });

  // State for dialogs
  const [saveConfigDialogOpen, setSaveConfigDialogOpen] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState<boolean>(false);
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState<boolean>(false);
  const [configName, setConfigName] = useState<string>('');
  const [configDescription, setConfigDescription] = useState<string>('');

  // State for widget menu
  const [widgetMenuAnchorEl, setWidgetMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Mock data for demonstration
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [gameData, setGameData] = useState<any[]>([]);
  const [dailyActionData, setDailyActionData] = useState<any[]>([]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Get dispatch function
  const dispatch = useDispatch<AppDispatch>();

  // Get data from Redux store
  const dailyActionsState = useSelector(selectDailyActionsData);
  const playersState = useSelector(selectPlayerData);
  const gamesState = useSelector(selectGameData);
  const userPreferencesState = useSelector(selectUserPreferences);

  // Fetch data on component mount
  useEffect(() => {
    // Fetch data from API
    fetchData();

    // Fetch user preferences
    dispatch(fetchUserPreferences());

    // Load user preferences from localStorage as fallback
    const savedPreferences = localStorage.getItem('userReportPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setUserPreferences(parsedPreferences);

        // Apply saved preferences
        if (parsedPreferences.defaultTab !== undefined) {
          setActiveTab(parsedPreferences.defaultTab);
        }

        // Load saved dashboard layout if available
        if (parsedPreferences.dashboardLayouts && parsedPreferences.dashboardLayouts.length > 0) {
          setDashboardConfig(parsedPreferences.dashboardLayouts[0]);
        }
      } catch (e) {
        console.error('Error parsing saved preferences:', e);
      }
    }
  }, [dispatch]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (dailyActionsState?.data?.length > 0) {
      setDailyActionData(dailyActionsState.data);
      setLoading(dailyActionsState.loading);
      setError(dailyActionsState.error);
    }
  }, [dailyActionsState]);

  useEffect(() => {
    if (playersState?.data?.length > 0) {
      setPlayerData(playersState.data);
    }
  }, [playersState]);

  useEffect(() => {
    if (gamesState?.data?.length > 0) {
      setGameData(gamesState.data);
    }
  }, [gamesState]);

  useEffect(() => {
    if (userPreferencesState?.data) {
      setUserPreferences(userPreferencesState.data);

      // Apply saved preferences
      if (userPreferencesState.data.defaultTab !== undefined) {
        setActiveTab(userPreferencesState.data.defaultTab);
      }

      // Load saved dashboard layout if available
      if (userPreferencesState.data.dashboardLayouts && userPreferencesState.data.dashboardLayouts.length > 0) {
        setDashboardConfig(userPreferencesState.data.dashboardLayouts[0]);
      }
    }
  }, [userPreferencesState]);

  // Fetch data from API
  const fetchData = () => {
    setLoading(true);

    // Fetch daily actions data
    dispatch(fetchDailyActionsData({
      startDate,
      endDate
    }));

    // Fetch player data
    dispatch(fetchPlayerData({
      startDate,
      endDate
    }));

    // Fetch game data
    dispatch(fetchGameData({
      startDate,
      endDate
    }));

    // Fetch dashboard summary
    dispatch(fetchDashboardSummary({
      startDate,
      endDate
    }));

    // Fetch revenue chart data
    dispatch(fetchRevenueChartData({
      startDate,
      endDate,
      interval: 'daily'
    }));

    // Fetch registrations chart data
    dispatch(fetchRegistrationsChartData({
      startDate,
      endDate,
      interval: 'daily'
    }));

    // Fetch top games data
    dispatch(fetchTopGamesData({
      startDate,
      endDate,
      limit: 10
    }));

    // Fetch recent transactions data
    dispatch(fetchRecentTransactionsData({
      startDate,
      endDate,
      limit: 10
    }));
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    setLoading(true);
    fetchData();
  };

  // Handle export
  const handleExport = async (format: ExportFormat, exportData: any[]): Promise<void> => {
    console.log(`Exporting data in ${format} format`, exportData);
    // Implementation would go here
  };

  // Handle search query
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implementation would go here
  };

  // Toggle customize mode
  const toggleCustomizeMode = () => {
    setCustomizeMode(!customizeMode);
  };

  // Handle widget menu open
  const handleWidgetMenuOpen = (event: React.MouseEvent<HTMLElement>, widgetId: string) => {
    setWidgetMenuAnchorEl(event.currentTarget);
    setSelectedWidgetId(widgetId);
  };

  // Handle widget menu close
  const handleWidgetMenuClose = () => {
    setWidgetMenuAnchorEl(null);
    setSelectedWidgetId(null);
  };

  // Handle widget removal
  const handleRemoveWidget = () => {
    if (selectedWidgetId) {
      setDashboardConfig({
        ...dashboardConfig,
        widgets: dashboardConfig.widgets.filter(widget => widget.id !== selectedWidgetId)
      });
      handleWidgetMenuClose();
    }
  };

  // Handle widget edit
  const handleEditWidget = () => {
    // Implementation would go here
    handleWidgetMenuClose();
  };

  // Handle save configuration dialog open
  const handleSaveConfigDialogOpen = () => {
    setConfigName(dashboardConfig.name);
    setConfigDescription(dashboardConfig.description || '');
    setSaveConfigDialogOpen(true);
  };

  // Handle save configuration dialog close
  const handleSaveConfigDialogClose = () => {
    setSaveConfigDialogOpen(false);
  };

  // Handle save configuration
  const handleSaveConfig = () => {
    const updatedConfig = {
      ...dashboardConfig,
      name: configName,
      description: configDescription,
      updatedAt: new Date().toISOString()
    };

    setDashboardConfig(updatedConfig);

    // Save to user preferences
    const updatedPreferences = {
      ...userPreferences,
      dashboardLayouts: [
        updatedConfig,
        ...(userPreferences.dashboardLayouts || []).filter(config => config.id !== updatedConfig.id)
      ]
    };

    setUserPreferences(updatedPreferences);

    // Save to API
    dispatch(saveUserPreferences(updatedPreferences));

    // Save to localStorage as fallback
    localStorage.setItem('userReportPreferences', JSON.stringify(updatedPreferences));

    setSaveConfigDialogOpen(false);

    // Show success message
    console.log('Dashboard configuration saved successfully');
  };

  // Handle share dialog open
  const handleShareDialogOpen = () => {
    setShareDialogOpen(true);
  };

  // Handle share dialog close
  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
  };

  // Handle add widget dialog open
  const handleAddWidgetDialogOpen = () => {
    setAddWidgetDialogOpen(true);
  };

  // Handle add widget dialog close
  const handleAddWidgetDialogClose = () => {
    setAddWidgetDialogOpen(false);
  };

  // Handle add widget
  const handleAddWidget = (type: DashboardWidgetType, title: string, dataSource: string) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: type as WidgetType, // Cast to local WidgetType
      title,
      dataSource,
      size: 'medium',
      position: dashboardConfig.widgets.length
    };

    setDashboardConfig({
      ...dashboardConfig,
      widgets: [...dashboardConfig.widgets, newWidget]
    });

    setAddWidgetDialogOpen(false);
  };

  // Handle drag end for widgets
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(dashboardConfig.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));

    setDashboardConfig({
      ...dashboardConfig,
      widgets: updatedItems
    });
  };

  // Define columns for player table
  const playerColumns: ColumnDef[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true
    },
    {
      id: 'registrationDate',
      label: 'Registration Date',
      format: (value) => formatDate(new Date(value), 'MMM dd, yyyy'),
      sortable: true
    },
    {
      id: 'country',
      label: 'Country',
      sortable: true
    },
    {
      id: 'totalDeposits',
      label: 'Total Deposits',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    },
    {
      id: 'netGamingRevenue',
      label: 'Net Gaming Revenue',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true
    }
  ];

  // Define columns for game table
  const gameColumns: ColumnDef[] = [
    {
      id: 'name',
      label: 'Name',
      sortable: true
    },
    {
      id: 'provider',
      label: 'Provider',
      sortable: true
    },
    {
      id: 'category',
      label: 'Category',
      sortable: true
    },
    {
      id: 'totalBets',
      label: 'Total Bets',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    },
    {
      id: 'netGamingRevenue',
      label: 'Net Gaming Revenue',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    },
    {
      id: 'uniquePlayers',
      label: 'Unique Players',
      sortable: true
    },
    {
      id: 'popularity',
      label: 'Popularity',
      format: (value) => `${value}%`,
      sortable: true
    }
  ];

  // Define columns for daily action table
  const dailyActionColumns: ColumnDef[] = [
    {
      id: 'date',
      label: 'Date',
      format: (value) => formatDate(new Date(value), 'MMM dd, yyyy'),
      sortable: true
    },
    {
      id: 'uniquePlayers',
      label: 'Unique Players',
      sortable: true
    },
    {
      id: 'newRegistrations',
      label: 'New Registrations',
      sortable: true
    },
    {
      id: 'deposits',
      label: 'Deposits',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    },
    {
      id: 'bets',
      label: 'Bets',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    },
    {
      id: 'ggr',
      label: 'GGR',
      type: 'currency',
      format: (value) => formatCurrency(value),
      sortable: true
    }
  ];

  return (
    <Container maxWidth="xl">
      <div style={{
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Integrated Reports
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analytics dashboard combining player, game, and daily action data
          </Typography>
        </div>
      </div>

      {/* Natural Language Query Panel */}
      <Paper style={{ padding: 24, marginBottom: 32 }}>
        <NaturalLanguageQueryPanel
          onSearch={handleSearch}
          showSuggestions={true}
          suggestions={mockSuggestions}
          onApplySuggestion={handleSearch}
          loading={loading}
          error={error}
        />
      </Paper>

      {/* Filters */}
      <Paper style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <FilterListIcon style={{ marginRight: 8 }} />
          <Typography variant="h6">Filters</Typography>
        </div>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={4}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', height: '100%', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleApplyFilters}
                disabled={loading}
              >
                Apply Filters
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>

      {/* Customizable Dashboard */}
      <Paper style={{ padding: 24, marginBottom: 32 }}>
        <AnnotationContextProvider>
          <FilterContextProvider>
            <CustomizableDashboard
              dashboardConfig={dashboardConfig}
              customizeMode={customizeMode}
              playerData={playerData}
              gameData={gameData}
              dailyActionData={dailyActionData}
              loading={loading}
              error={error}
              playerColumns={playerColumns}
              gameColumns={gameColumns}
              dailyActionColumns={dailyActionColumns}
              onToggleCustomizeMode={toggleCustomizeMode}
              onSaveConfigDialogOpen={handleSaveConfigDialogOpen}
              onShareDialogOpen={handleShareDialogOpen}
              onAddWidgetDialogOpen={handleAddWidgetDialogOpen}
              onDragEnd={handleDragEnd}
              onWidgetMenuOpen={handleWidgetMenuOpen}
            />
          </FilterContextProvider>
        </AnnotationContextProvider>
      </Paper>

      {/* Tabs for different report types */}
      <Paper style={{ marginBottom: 32 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Daily Actions" icon={<TableChartIcon />} iconPosition="start" />
          <Tab label="Players" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Games" icon={<VideogameAssetIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <TableChartIcon style={{ marginRight: 8 }} />
            <Typography variant="h6">Daily Actions Data</Typography>
          </div>

          <EnhancedTable
            columns={dailyActionColumns}
            data={dailyActionData}
            loading={loading}
            title="Daily Actions"
            emptyMessage="No daily actions data available"
            idField="id"
            onExport={handleExport}
            features={{
              sorting: true,
              filtering: {
                enabled: true,
                quickFilter: true,
                advancedFilter: true
              },
              pagination: {
                enabled: true,
                defaultPageSize: 10,
                pageSizeOptions: [10, 25, 50, 100]
              },
              columnManagement: {
                enabled: true,
                allowReordering: true,
                allowHiding: true,
                allowResizing: true
              },
              export: {
                enabled: true,
                formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF]
              }
            }}
          />
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <PeopleIcon style={{ marginRight: 8 }} />
            <Typography variant="h6">Players Data</Typography>
          </div>

          <EnhancedTable
            columns={playerColumns}
            data={playerData}
            loading={loading}
            title="Players"
            emptyMessage="No player data available"
            idField="id"
            onExport={handleExport}
            features={{
              sorting: true,
              filtering: {
                enabled: true,
                quickFilter: true,
                advancedFilter: true
              },
              pagination: {
                enabled: true,
                defaultPageSize: 10,
                pageSizeOptions: [10, 25, 50, 100]
              },
              columnManagement: {
                enabled: true,
                allowReordering: true,
                allowHiding: true,
                allowResizing: true
              },
              export: {
                enabled: true,
                formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF]
              }
            }}
          />
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <VideogameAssetIcon style={{ marginRight: 8 }} />
            <Typography variant="h6">Games Data</Typography>
          </div>

          <EnhancedTable
            columns={gameColumns}
            data={gameData}
            loading={loading}
            title="Games"
            emptyMessage="No game data available"
            idField="id"
            onExport={handleExport}
            features={{
              sorting: true,
              filtering: {
                enabled: true,
                quickFilter: true,
                advancedFilter: true
              },
              pagination: {
                enabled: true,
                defaultPageSize: 10,
                pageSizeOptions: [10, 25, 50, 100]
              },
              columnManagement: {
                enabled: true,
                allowReordering: true,
                allowHiding: true,
                allowResizing: true
              },
              export: {
                enabled: true,
                formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF]
              }
            }}
          />
        </Paper>
      )}

      {/* Dialogs */}
      <SaveConfigDialog
        open={saveConfigDialogOpen}
        onClose={handleSaveConfigDialogClose}
        onSave={handleSaveConfig}
        configName={configName}
        configDescription={configDescription}
        setConfigName={setConfigName}
        setConfigDescription={setConfigDescription}
      />

      <AddWidgetDialog
        open={addWidgetDialogOpen}
        onClose={handleAddWidgetDialogClose}
        onAddWidget={(type, title, dataSource) => handleAddWidget(type as DashboardWidgetType, title, dataSource)}
      />

      <ShareDialog
        open={shareDialogOpen}
        onClose={handleShareDialogClose}
      />

      {/* Widget Menu */}
      <Menu
        anchorEl={widgetMenuAnchorEl}
        open={Boolean(widgetMenuAnchorEl)}
        onClose={handleWidgetMenuClose}
      >
        <MenuItem onClick={handleEditWidget}>
          <EditIcon fontSize="small" style={{ marginRight: 8 }} />
          Edit Widget
        </MenuItem>
        <MenuItem onClick={handleRemoveWidget}>
          <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
          Remove Widget
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default IntegratedReportsPage;
