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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, subDays } from 'date-fns';
import dailyActionsService from '../../services/api/dailyActionsService';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';

const DailyActionsPage = () => {
  // State for filters
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [whiteLabelId, setWhiteLabelId] = useState('');
  const [whiteLabels, setWhiteLabels] = useState([]);

  // State for data
  const [dailyActions, setDailyActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for summary metrics
  const [summary, setSummary] = useState({
    totalRegistrations: 0,
    totalFTD: 0,
    totalDeposits: 0,
    totalCashouts: 0,
    totalGGR: 0
  });

  // Fetch metadata (white labels) on component mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await dailyActionsService.getMetadata();
        setWhiteLabels(data.whiteLabels || []);
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setError('Failed to load metadata. Please try again later.');
      }
    };

    fetchMetadata();
  }, []);

  // Fetch daily actions data
  const fetchDailyActions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Create filters object
      const filters = {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      };

      if (whiteLabelId) {
        filters.whiteLabelId = whiteLabelId;
      }

      // Use the service to get data
      const response = await dailyActionsService.getData(filters);
      const data = response.data || [];

      setDailyActions(data);

      // Set summary metrics if available in the response
      if (response.summary) {
        setSummary(response.summary);
      } else {
        // Calculate summary metrics if not provided by the API
        const summaryData = {
          totalRegistrations: data.reduce((sum, item) => sum + item.registrations, 0),
          totalFTD: data.reduce((sum, item) => sum + item.ftd, 0),
          totalDeposits: data.reduce((sum, item) => sum + item.deposits, 0),
          totalCashouts: data.reduce((sum, item) => sum + item.paidCashouts, 0),
          totalGGR: data.reduce((sum, item) => sum + item.totalGGR, 0)
        };

        setSummary(summaryData);
      }
    } catch (err) {
      console.error('Error fetching daily actions:', err);
      setError('Failed to load daily actions data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = () => {
    fetchDailyActions();
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Daily Actions Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze daily player activities, deposits, and gaming revenue
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/reports/daily-actions/advanced"
          startIcon={<FilterListIcon />}
        >
          Advanced Report
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>White Label</InputLabel>
              <Select
                value={whiteLabelId}
                onChange={(e) => setWhiteLabelId(e.target.value)}
                label="White Label"
              >
                <MenuItem value="">All White Labels</MenuItem>
                {whiteLabels.map((wl) => (
                  <MenuItem key={wl.id} value={wl.id}>{wl.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleApplyFilters}
              sx={{ mr: 2 }}
            >
              Apply Filters
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={loading || dailyActions.length === 0}
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Registrations
              </Typography>
              <Typography variant="h5">
                {summary.totalRegistrations.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                First Time Depositors
              </Typography>
              <Typography variant="h5">
                {summary.totalFTD.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Deposits
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalDeposits)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Cashouts
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalCashouts)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
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
      </Grid>

      {/* Data Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TableChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Daily Actions Data</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : dailyActions.length === 0 ? (
          <Alert severity="info">
            No data available for the selected filters. Try adjusting your filters or click "Apply Filters" to load data.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>White Label</TableCell>
                  <TableCell align="right">Registrations</TableCell>
                  <TableCell align="right">FTD</TableCell>
                  <TableCell align="right">Deposits</TableCell>
                  <TableCell align="right">Cashouts</TableCell>
                  <TableCell align="right">Casino GGR</TableCell>
                  <TableCell align="right">Sports GGR</TableCell>
                  <TableCell align="right">Live GGR</TableCell>
                  <TableCell align="right">Total GGR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyActions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{format(new Date(row.date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{row.whiteLabelName}</TableCell>
                    <TableCell align="right">{row.registrations}</TableCell>
                    <TableCell align="right">{row.ftd}</TableCell>
                    <TableCell align="right">{formatCurrency(row.deposits)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.paidCashouts)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.ggrCasino)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.ggrSport)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.ggrLive)}</TableCell>
                    <TableCell align="right">{formatCurrency(row.totalGGR)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default DailyActionsPage;
