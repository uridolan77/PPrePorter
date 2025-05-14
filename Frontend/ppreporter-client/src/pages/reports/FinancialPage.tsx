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
import { FinancialData, FinancialSummary, FinancialFilters } from '../../types/financial';
import api from '../../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import { ReportAreaChart, ReportBarChart } from '../../components/reports/charts/ReportCharts';

/**
 * FinancialPage component
 * Displays a comprehensive financial report with filtering and data visualization
 */
const FinancialPage: React.FC = () => {
  // State for filters
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedWhiteLabels, setSelectedWhiteLabels] = useState<(string | number)[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<(string | number)[]>([]);
  const [groupBy, setGroupBy] = useState<string>('day');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  // State for data
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);

  // State for metadata
  const [whiteLabels, setWhiteLabels] = useState<Array<{ id: string; name: string }>>([]);
  const [countries, setCountries] = useState<Array<{ id: string; name: string }>>([]);
  const [whiteLabelsLoading, setWhiteLabelsLoading] = useState<boolean>(false);
  const [countriesLoading, setCountriesLoading] = useState<boolean>(false);
  const [whiteLabelsOptions, setWhiteLabelsOptions] = useState<MultiSelectOption[]>([]);
  const [countriesOptions, setCountriesOptions] = useState<MultiSelectOption[]>([]);

  // State for table
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for export dialog
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('excel');

  // Fetch metadata (white labels and countries) on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        console.log('[FINANCIAL PAGE] Fetching metadata');
        setWhiteLabelsLoading(true);
        setCountriesLoading(true);

        // Get metadata from API
        const data = await api.financial.getMetadata();
        console.log('[FINANCIAL PAGE] Got metadata from service:', data);

        // Handle white labels
        if (data && data.whiteLabels) {
          console.log('[FINANCIAL PAGE] Got white labels from service:', data.whiteLabels);
          const fetchedWhiteLabels = data.whiteLabels || [];
          setWhiteLabels(fetchedWhiteLabels);

          // Convert white labels to MultiSelect options
          const whiteLabelsOptions = fetchedWhiteLabels.map((whiteLabel) => ({
            value: whiteLabel.id,
            label: whiteLabel.name
          }));
          setWhiteLabelsOptions(whiteLabelsOptions);
        } else {
          console.log('[FINANCIAL PAGE] No white labels found in API response');
          setWhiteLabels([]);
          setWhiteLabelsOptions([]);
        }
        setWhiteLabelsLoading(false);

        // Handle countries
        if (data && data.countries) {
          console.log('[FINANCIAL PAGE] Got countries from service:', data.countries);
          const fetchedCountries = data.countries || [];
          setCountries(fetchedCountries);

          // Convert countries to MultiSelect options
          const countryOptions = fetchedCountries.map((country) => ({
            value: country.id,
            label: country.name
          }));
          setCountriesOptions(countryOptions);
        } else {
          console.log('[FINANCIAL PAGE] No countries found in API response');
          setCountries([]);
          setCountriesOptions([]);
        }
        setCountriesLoading(false);
      } catch (err) {
        console.error('[FINANCIAL PAGE] Error fetching metadata:', err);
        setError('Failed to load metadata. Please try again later.');
      }
    };

    fetchMetadata();
  }, []);

  // Fetch initial data on component mount
  useEffect(() => {
    // Define a function to fetch data on mount to avoid dependency issues
    const fetchInitialData = async () => {
      console.log('[FINANCIAL PAGE] Fetching initial data');
      await fetchFinancialData();
    };

    // Set a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchInitialData();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch financial data based on filters
  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filters
      const filters: FinancialFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        whiteLabelIds: selectedWhiteLabels.length > 0 ? selectedWhiteLabels.map(id => String(id)) : undefined,
        countryIds: selectedCountries.length > 0 ? selectedCountries.map(id => String(id)) : undefined,
        groupBy: groupBy as any,
        ...advancedFilters
      };

      console.log('[FINANCIAL PAGE] Fetching data with filters:', filters);

      // Add pagination and sorting
      const params = {
        page: page + 1, // API uses 1-based indexing
        pageSize,
        sortBy,
        sortDirection
      };

      // Fetch financial data from API
      const response = await api.financial.getData({ ...filters, ...params });

      if (response && response.data) {
        setFinancialData(response.data);
        setTotalCount(response.meta?.totalCount || response.data.length);

        // Process summary data if available
        if (response.summary) {
          console.log('[FINANCIAL PAGE] Using summary from response:', response.summary);
          setSummary(response.summary);
        } else {
          // If no summary in response, fetch it separately
          try {
            const summaryResponse = await api.financial.getSummary(filters);
            if (summaryResponse) {
              setSummary(summaryResponse);
            }
          } catch (summaryError) {
            console.error('[FINANCIAL PAGE] Error fetching summary:', summaryError);
          }
        }
      } else {
        console.log('[FINANCIAL PAGE] No data returned from API');
        setFinancialData([]);
        setSummary(null);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('[FINANCIAL PAGE] Error fetching data:', err);
      setError('Failed to load financial data. Please try again later.');
      setFinancialData([]);
      setSummary(null);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = () => {
    setPage(0); // Reset to first page when filters change
    fetchFinancialData();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 30)));
    setEndDate(new Date());
    setSelectedWhiteLabels([]);
    setSelectedCountries([]);
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
      const filters: FinancialFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        whiteLabelIds: selectedWhiteLabels.length > 0 ? selectedWhiteLabels.map(id => String(id)) : undefined,
        countryIds: selectedCountries.length > 0 ? selectedCountries.map(id => String(id)) : undefined,
        groupBy: groupBy as any,
        ...advancedFilters
      };

      // Export data
      const blob = await api.financial.exportData(filters, exportFormat);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${formatDate(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportDialogOpen(false);
    } catch (err) {
      console.error('[FINANCIAL PAGE] Error exporting data:', err);
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
      format: (value) => formatDate(new Date(value), 'yyyy-MM-dd')
    },
    {
      id: 'whiteLabelName',
      label: 'White Label',
      type: 'text',
      align: 'left'
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
      format: (value) => formatCurrency(value)
    },
    {
      id: 'ngr',
      label: 'NGR',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value)
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
      format: (value) => formatCurrency(value)
    },
    {
      id: 'bonusAmount',
      label: 'Bonus Amount',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value || 0)
    },
    {
      id: 'netProfit',
      label: 'Net Profit',
      type: 'currency',
      align: 'right',
      format: (value) => formatCurrency(value || 0)
    }
  ];

  return (
    <Container maxWidth="xl">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Typography variant="h4" gutterBottom>
            Financial Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze financial data, revenue, and profitability metrics
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
                <MenuItem value="whiteLabel">White Label</MenuItem>
                <MenuItem value="country">Country</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
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

        <Collapse in={showAdvancedFilters}>
          <div style={{ marginTop: '1rem' }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Advanced Filters
            </Typography>
            <Grid container spacing={2}>
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
                  Total GGR
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.totalGGR)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total NGR
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.totalNGR)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Net Profit
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.totalNetProfit || 0)}
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
          data={financialData}
          loading={loading}
          title="Financial Data"
          emptyMessage="No financial data available"
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
        <DialogTitle>Export Financial Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please confirm that you want to export the financial data with the current filters.
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

export default FinancialPage;
