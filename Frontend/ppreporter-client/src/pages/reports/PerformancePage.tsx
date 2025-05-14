import React, { useState, useEffect, useCallback } from 'react';
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
import { EnhancedTable } from '../../components/tables/enhanced';
import { ColumnDef, ExportFormat } from '../../components/tables/enhanced/types';
import MultiSelect, { MultiSelectOption } from '../../components/common/MultiSelect';
import { format as formatDate } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { PerformanceData, PerformanceSummary, PerformanceFilters } from '../../types/performance';
import api from '../../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import { ReportAreaChart, ReportBarChart } from '../../components/reports/charts/ReportCharts';

/**
 * PerformancePage component
 * Displays a comprehensive performance report with filtering and data visualization
 */
const PerformancePage: React.FC = () => {
  // State for filters
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedGames, setSelectedGames] = useState<(string | number)[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<(string | number)[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<(string | number)[]>([]);
  const [groupBy, setGroupBy] = useState<string>('day');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  // State for data
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // State for metadata
  const [games, setGames] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);
  const [gamesLoading, setGamesLoading] = useState<boolean>(false);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [providersLoading, setProvidersLoading] = useState<boolean>(false);
  const [gamesOptions, setGamesOptions] = useState<MultiSelectOption[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<MultiSelectOption[]>([]);
  const [providersOptions, setProvidersOptions] = useState<MultiSelectOption[]>([]);

  // State for table
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('excel');

  // Fetch metadata (games, categories, providers) on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('[PERFORMANCE PAGE] Fetching metadata');
        setGamesLoading(true);
        setCategoriesLoading(true);
        setProvidersLoading(true);

        // Get metadata from API
        const data = await api.performance.getMetadata();
        console.log('[PERFORMANCE PAGE] Got metadata from service:', data);

        // Handle games
        if (data && data.games) {
          console.log('[PERFORMANCE PAGE] Got games from service:', data.games);
          const fetchedGames = data.games || [];
          setGames(fetchedGames);

          // Convert games to MultiSelect options
          const gamesOptions = fetchedGames.map((game) => ({
            value: game.id,
            label: game.name
          }));
          setGamesOptions(gamesOptions);
        } else {
          console.log('[PERFORMANCE PAGE] No games found in API response');
          setGames([]);
          setGamesOptions([]);
        }
        setGamesLoading(false);

        // Handle categories
        if (data && data.gameCategories) {
          console.log('[PERFORMANCE PAGE] Got categories from service:', data.gameCategories);
          const fetchedCategories = data.gameCategories || [];
          setCategories(fetchedCategories);

          // Convert categories to MultiSelect options
          const categoriesOptions = fetchedCategories.map((category) => ({
            value: category.id,
            label: category.name
          }));
          setCategoriesOptions(categoriesOptions);
        } else {
          console.log('[PERFORMANCE PAGE] No categories found in API response');
          setCategories([]);
          setCategoriesOptions([]);
        }
        setCategoriesLoading(false);

        // Handle providers
        if (data && data.gameProviders) {
          console.log('[PERFORMANCE PAGE] Got providers from service:', data.gameProviders);
          const fetchedProviders = data.gameProviders || [];
          setProviders(fetchedProviders);

          // Convert providers to MultiSelect options
          const providersOptions = fetchedProviders.map((provider) => ({
            value: provider.id,
            label: provider.name
          }));
          setProvidersOptions(providersOptions);
        } else {
          console.log('[PERFORMANCE PAGE] No providers found in API response');
          setProviders([]);
          setProvidersOptions([]);
        }
        setProvidersLoading(false);
      } catch (err) {
        console.error('[PERFORMANCE PAGE] Error fetching metadata:', err);
        setError('Failed to load metadata. Please try again later.');
      }
    };

    fetchMetadata();
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    // Define a function to fetch data on mount to avoid dependency issues
    const fetchInitialData = async () => {
      console.log('[PERFORMANCE PAGE] Fetching initial data');
      await fetchPerformanceData();
    };

    // Set a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch performance data based on filters
  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters
      const filters: PerformanceFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        gameIds: selectedGames.length > 0 ? selectedGames.map(id => String(id)) : undefined,
        gameCategories: selectedCategories.length > 0 ? selectedCategories.map(id => String(id)) : undefined,
        gameProviders: selectedProviders.length > 0 ? selectedProviders.map(id => String(id)) : undefined,
        groupBy: groupBy as any,
        ...advancedFilters
      };

      console.log('[PERFORMANCE PAGE] Fetching data with filters:', filters);

      // Add pagination and sorting
      const params = {
        page: page + 1, // API uses 1-based indexing
        pageSize,
        sortBy,
        sortDirection
      };

      // Fetch performance data from API
      const response = await api.performance.getData({ ...filters, ...params });

      if (response && response.data) {
        setPerformanceData(response.data);
        setTotalCount(response.meta?.totalCount || response.data.length);

        // Process summary data if available
        if (response.summary) {
          console.log('[PERFORMANCE PAGE] Using summary from response:', response.summary);
          setSummary(response.summary);
        } else {
          // If no summary in response, fetch it separately
          try {
            const summaryResponse = await api.performance.getSummary(filters);
            if (summaryResponse) {
              setSummary(summaryResponse);
            }
          } catch (summaryError) {
            console.error('[PERFORMANCE PAGE] Error fetching summary:', summaryError);
          }
        }
      } else {
        console.log('[PERFORMANCE PAGE] No data returned from API');
        setPerformanceData([]);
        setSummary(null);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('[PERFORMANCE PAGE] Error fetching data:', err);
      setError('Failed to load performance data. Please try again later.');
      setPerformanceData([]);
      setSummary(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = () => {
    setPage(0); // Reset to first page when filters change
    fetchPerformanceData();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setSelectedGames([]);
    setSelectedCategories([]);
    setSelectedProviders([]);
    setGroupBy('day');
    setAdvancedFilters({});
    setPage(0);
    setSortBy('date');
    setSortDirection('desc');
  };

  // Handle export
  const handleExport = (format: ExportFormat) => {
    setExportFormat(format);
    setExportDialogOpen(true);
  };

  // Handle export confirmation
  const handleExportConfirm = async () => {
    try {
      setLoading(true);

      // Prepare filters
      const filters: PerformanceFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        gameIds: selectedGames.length > 0 ? selectedGames.map(id => String(id)) : undefined,
        gameCategories: selectedCategories.length > 0 ? selectedCategories.map(id => String(id)) : undefined,
        gameProviders: selectedProviders.length > 0 ? selectedProviders.map(id => String(id)) : undefined,
        groupBy: groupBy as any,
        ...advancedFilters
      };

      // Export data
      const blob = await api.performance.exportData(filters, exportFormat);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${formatDate(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportDialogOpen(false);
    } catch (err) {
      console.error('[PERFORMANCE PAGE] Error exporting data:', err);
      setError('Failed to export data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Define table columns
  const columns: ColumnDef[] = [
    {
      id: 'date',
      label: 'Date',
      type: 'date',
      align: 'left',
      format: (value) => value ? formatDate(new Date(value), 'yyyy-MM-dd') : ''
    },
    {
      id: 'gameName',
      label: 'Game',
      type: 'text',
      align: 'left'
    },
    {
      id: 'gameCategory',
      label: 'Category',
      type: 'text',
      align: 'left'
    },
    {
      id: 'gameProvider',
      label: 'Provider',
      type: 'text',
      align: 'left'
    },
    {
      id: 'activePlayers',
      label: 'Active Players',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value)
    },
    {
      id: 'newPlayers',
      label: 'New Players',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value)
    },
    {
      id: 'sessions',
      label: 'Sessions',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value)
    },
    {
      id: 'avgSessionDuration',
      label: 'Avg Session (min)',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value, 1)
    },
    {
      id: 'bets',
      label: 'Bets',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value)
    },
    {
      id: 'avgBet',
      label: 'Avg Bet',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      id: 'wins',
      label: 'Wins',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value)
    },
    {
      id: 'avgWin',
      label: 'Avg Win',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      id: 'winRate',
      label: 'Win Rate',
      type: 'percentage',
      align: 'right',
      format: (value) => formatPercentage(value)
    },
    {
      id: 'rtp',
      label: 'RTP',
      type: 'percentage',
      align: 'right',
      format: (value) => formatPercentage(value)
    },
    {
      id: 'holdPercentage',
      label: 'Hold %',
      type: 'percentage',
      align: 'right',
      format: (value) => formatPercentage(value)
    }
  ];

  return (
    <Container maxWidth="xl">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Performance Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze game performance, player activity, and engagement metrics
          </Typography>
        </div>
      </div>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Filters</Typography>
          <div>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              startIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ mr: 1 }}
            >
              {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleResetFilters}
              sx={{ mr: 1 }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              startIcon={<FilterListIcon />}
            >
              Apply Filters
            </Button>
          </div>
        </div>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => newValue && setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => newValue && setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="group-by-label">Group By</InputLabel>
              <Select
                labelId="group-by-label"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                label="Group By"
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="game">Game</MenuItem>
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="provider">Provider</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <MultiSelect
              label="Game Categories"
              options={categoriesOptions}
              value={selectedCategories}
              onChange={setSelectedCategories}
              loading={categoriesLoading}
              fullWidth
            />
          </Grid>
        </Grid>

        <Collapse in={showAdvancedFilters}>
          <div style={{ marginTop: '1rem' }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Advanced Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <MultiSelect
                  label="Games"
                  options={gamesOptions}
                  value={selectedGames}
                  onChange={setSelectedGames}
                  loading={gamesLoading}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MultiSelect
                  label="Providers"
                  options={providersOptions}
                  value={selectedProviders}
                  onChange={setSelectedProviders}
                  loading={providersLoading}
                  fullWidth
                />
              </Grid>
            </Grid>
          </div>
        </Collapse>
      </Paper>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active Players
                </Typography>
                <Typography variant="h5">
                  {formatNumber(summary.totalActivePlayers)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Sessions
                </Typography>
                <Typography variant="h5">
                  {formatNumber(summary.totalSessions)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Avg Session Duration
                </Typography>
                <Typography variant="h5">
                  {formatNumber(summary.avgSessionDuration, 1)} min
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Overall RTP
                </Typography>
                <Typography variant="h5">
                  {formatPercentage(summary.avgRTP)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Data Table */}
      <Paper sx={{ p: 0, mb: 4, overflow: 'hidden' }}>
        <EnhancedTable
          columns={columns}
          data={performanceData}
          loading={loading}
          title="Performance Data"
          emptyMessage="No performance data available"
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
              defaultPageSize: pageSize,
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

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Performance Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please confirm that you want to export the performance data with the current filters.
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="export-format-label">Export Format</InputLabel>
            <Select
              labelId="export-format-label"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Export Format"
            >
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExportConfirm}
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PerformancePage;
