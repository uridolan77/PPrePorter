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
import { GeographicData, GeographicSummary, GeographicFilters } from '../../types/geographic';
import api from '../../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import { ReportAreaChart, ReportBarChart, ReportPieChart } from '../../components/reports/charts/ReportCharts';

/**
 * GeographicPage component
 * Displays a comprehensive geographic report with filtering and data visualization
 */
const GeographicPage: React.FC = () => {
  // State for filters
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCountries, setSelectedCountries] = useState<(string | number)[]>([]);
  const [selectedWhiteLabels, setSelectedWhiteLabels] = useState<(string | number)[]>([]);
  const [groupBy, setGroupBy] = useState<string>('country');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  // State for data
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [summary, setSummary] = useState<GeographicSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // State for metadata
  const [countries, setCountries] = useState<Array<{ id: string; name: string; region?: string; continent?: string }>>([]);
  const [whiteLabels, setWhiteLabels] = useState<Array<{ id: string; name: string }>>([]);
  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([]);
  const [continents, setContinents] = useState<Array<{ id: string; name: string }>>([]);
  const [countriesLoading, setCountriesLoading] = useState<boolean>(false);
  const [whiteLabelsLoading, setWhiteLabelsLoading] = useState<boolean>(false);
  const [countriesOptions, setCountriesOptions] = useState<MultiSelectOption[]>([]);
  const [whiteLabelsOptions, setWhiteLabelsOptions] = useState<MultiSelectOption[]>([]);

  // State for table
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('players');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('excel');

  // Fetch metadata (countries, white labels) on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('[GEOGRAPHIC PAGE] Fetching metadata');
        setCountriesLoading(true);
        setWhiteLabelsLoading(true);

        // Get metadata from API
        const data = await api.geographic.getMetadata();
        console.log('[GEOGRAPHIC PAGE] Got metadata from service:', data);

        // Handle countries
        if (data && data.countries) {
          console.log('[GEOGRAPHIC PAGE] Got countries from service:', data.countries);
          const fetchedCountries = data.countries || [];
          setCountries(fetchedCountries);

          // Convert countries to MultiSelect options
          const countryOptions = fetchedCountries.map((country) => ({
            value: country.id,
            label: country.name
          }));
          setCountriesOptions(countryOptions);
        } else {
          console.log('[GEOGRAPHIC PAGE] No countries found in API response');
          setCountries([]);
          setCountriesOptions([]);
        }
        setCountriesLoading(false);

        // Handle white labels
        if (data && data.whiteLabels) {
          console.log('[GEOGRAPHIC PAGE] Got white labels from service:', data.whiteLabels);
          const fetchedWhiteLabels = data.whiteLabels || [];
          setWhiteLabels(fetchedWhiteLabels);

          // Convert white labels to MultiSelect options
          const whiteLabelsOptions = fetchedWhiteLabels.map((whiteLabel) => ({
            value: whiteLabel.id,
            label: whiteLabel.name
          }));
          setWhiteLabelsOptions(whiteLabelsOptions);
        } else {
          console.log('[GEOGRAPHIC PAGE] No white labels found in API response');
          setWhiteLabels([]);
          setWhiteLabelsOptions([]);
        }
        setWhiteLabelsLoading(false);

        // Handle regions and continents if available
        if (data && data.regions) {
          setRegions(data.regions);
        }
        if (data && data.continents) {
          setContinents(data.continents);
        }
      } catch (err) {
        console.error('[GEOGRAPHIC PAGE] Error fetching metadata:', err);
        setError('Failed to load metadata. Please try again later.');
      }
    };

    fetchMetadata();
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    // Define a function to fetch data on mount to avoid dependency issues
    const fetchInitialData = async () => {
      console.log('[GEOGRAPHIC PAGE] Fetching initial data');
      await fetchGeographicData();
    };

    // Set a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch geographic data based on filters
  const fetchGeographicData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters
      const filters: GeographicFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        countryIds: selectedCountries.length > 0 ? selectedCountries.map(id => String(id)) : undefined,
        whiteLabelIds: selectedWhiteLabels.length > 0 ? selectedWhiteLabels.map(id => String(id)) : undefined,
        groupBy: groupBy as any,
        ...advancedFilters
      };

      console.log('[GEOGRAPHIC PAGE] Fetching data with filters:', filters);

      // Add pagination and sorting
      const params = {
        page: page + 1, // API uses 1-based indexing
        pageSize,
        sortBy,
        sortDirection
      };

      // Fetch geographic data from API
      const response = await api.geographic.getData({ ...filters, ...params });

      if (response && response.data) {
        setGeographicData(response.data);
        setTotalCount(response.meta?.totalCount || response.data.length);

        // Process summary data if available
        if (response.summary) {
          console.log('[GEOGRAPHIC PAGE] Using summary from response:', response.summary);
          setSummary(response.summary);
        } else {
          // If no summary in response, fetch it separately
          try {
            const summaryResponse = await api.geographic.getSummary(filters);
            if (summaryResponse) {
              setSummary(summaryResponse);
            }
          } catch (summaryError) {
            console.error('[GEOGRAPHIC PAGE] Error fetching summary:', summaryError);
          }
        }
      } else {
        console.log('[GEOGRAPHIC PAGE] No data returned from API');
        setGeographicData([]);
        setSummary(null);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('[GEOGRAPHIC PAGE] Error fetching data:', err);
      setError('Failed to load geographic data. Please try again later.');
      setGeographicData([]);
      setSummary(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = () => {
    setPage(0); // Reset to first page when filters change
    fetchGeographicData();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setSelectedCountries([]);
    setSelectedWhiteLabels([]);
    setGroupBy('country');
    setAdvancedFilters({});
    setPage(0);
    setSortBy('players');
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
      const filters: GeographicFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        countryIds: selectedCountries.length > 0 ? selectedCountries.map(id => String(id)) : undefined,
        whiteLabelIds: selectedWhiteLabels.length > 0 ? selectedWhiteLabels.map(id => String(id)) : undefined,
        groupBy: groupBy as any,
        ...advancedFilters
      };

      // Export data
      const blob = await api.geographic.exportData(filters, exportFormat);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geographic-report-${formatDate(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportDialogOpen(false);
    } catch (err) {
      console.error('[GEOGRAPHIC PAGE] Error exporting data:', err);
      setError('Failed to export data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for pie chart
  const getPieChartData = () => {
    if (!geographicData || geographicData.length === 0) return [];

    // Sort by players (descending) and take top 10
    return [...geographicData]
      .sort((a, b) => b.players - a.players)
      .slice(0, 10)
      .map(item => ({
        name: item.countryName,
        value: item.players
      }));
  };

  // Define table columns
  const columns: ColumnDef[] = [
    {
      id: 'countryName',
      label: 'Country',
      type: 'text',
      align: 'left'
    },
    {
      id: 'players',
      label: 'Players',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value)
    },
    {
      id: 'newPlayers',
      label: 'New Players',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value || 0)
    },
    {
      id: 'revenue',
      label: 'Revenue',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      id: 'ggr',
      label: 'GGR',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value || 0)
    },
    {
      id: 'deposits',
      label: 'Deposits',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      id: 'withdrawals',
      label: 'Withdrawals',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value)
    },
    {
      id: 'netDeposits',
      label: 'Net Deposits',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value || 0)
    },
    {
      id: 'bonusAmount',
      label: 'Bonus Amount',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value || 0)
    },
    {
      id: 'bets',
      label: 'Bets',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value || 0)
    },
    {
      id: 'wins',
      label: 'Wins',
      type: 'number',
      align: 'right',
      format: (value) => formatNumber(value || 0)
    },
    {
      id: 'winRate',
      label: 'Win Rate',
      type: 'percentage',
      align: 'right',
      format: (value) => formatPercentage(value || 0)
    }
  ];

  return (
    <Container maxWidth="xl">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Geographic Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze player distribution, revenue, and performance metrics by country
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
                <MenuItem value="country">Country</MenuItem>
                <MenuItem value="region">Region</MenuItem>
                <MenuItem value="continent">Continent</MenuItem>
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <MultiSelect
              label="Countries"
              options={countriesOptions}
              value={selectedCountries}
              onChange={setSelectedCountries}
              loading={countriesLoading}
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
                  label="White Labels"
                  options={whiteLabelsOptions}
                  value={selectedWhiteLabels}
                  onChange={setSelectedWhiteLabels}
                  loading={whiteLabelsLoading}
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
                  Total Players
                </Typography>
                <Typography variant="h5">
                  {formatNumber(summary.totalPlayers)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.totalRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Deposits
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.totalDeposits)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Withdrawals
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.totalWithdrawals)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Player Distribution by Country
            </Typography>
            <div style={{ height: 300 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </div>
              ) : geographicData.length > 0 ? (
                <ReportPieChart
                  data={getPieChartData()}
                  nameKey="name"
                  valueKey="value"
                  height={300}
                  showLegend={true}
                />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No data available
                  </Typography>
                </div>
              )}
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Country (Top 10)
            </Typography>
            <div style={{ height: 300 }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </div>
              ) : geographicData.length > 0 ? (
                <ReportBarChart
                  data={[...geographicData]
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 10)
                    .map(item => ({
                      country: item.countryName,
                      revenue: item.revenue
                    }))}
                  xKey="country"
                  yKeys={['revenue']}
                  height={300}
                  showLegend={false}
                  showGrid={true}
                />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No data available
                  </Typography>
                </div>
              )}
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper sx={{ p: 0, mb: 4, overflow: 'hidden' }}>
        <EnhancedTable
          columns={columns}
          data={geographicData}
          loading={loading}
          title="Geographic Data"
          emptyMessage="No geographic data available"
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
        <DialogTitle>Export Geographic Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please confirm that you want to export the geographic data with the current filters.
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

export default GeographicPage;
