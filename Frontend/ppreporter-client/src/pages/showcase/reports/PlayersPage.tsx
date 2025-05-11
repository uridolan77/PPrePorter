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
import MultiSelect, { MultiSelectOption } from '../../../components/common/MultiSelect';
import { format as formatDate } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Player } from '../../../types/players';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Import services
import playersService from '../../../services/api/playersService';
import { ReportFilters } from '../../../services/api/types';

// Define interfaces
interface Filters {
  startDate: string;
  endDate: string;
  whiteLabelIds?: number[];
  countryIds?: string[];
  statusIds?: string[];

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

// Define interfaces for metadata
interface WhiteLabel {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
}

interface Status {
  id: string;
  name: string;
}

// Define custom PlayerMetadata interface for our component
interface PlayersMetadata {
  whiteLabels: WhiteLabel[];
  countries: Country[];
  statuses: Status[];
  vipLevels?: string[];
  kycStatuses?: string[];
  tags?: string[];
}

/**
 * PlayersPage component
 * Displays a comprehensive player report with filtering and data visualization
 */
const PlayersPage: React.FC = () => {
  // State for filters
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedWhiteLabels, setSelectedWhiteLabels] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  // State for data
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('registrationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for metadata
  const [whiteLabels, setWhiteLabels] = useState<WhiteLabel[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [whiteLabelsOptions, setWhiteLabelsOptions] = useState<MultiSelectOption[]>([]);
  const [countriesOptions, setCountriesOptions] = useState<MultiSelectOption[]>([]);
  const [statusesOptions, setStatusesOptions] = useState<MultiSelectOption[]>([]);

  // State for player details dialog
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerDetailsOpen, setPlayerDetailsOpen] = useState<boolean>(false);

  // Define table columns
  const columns: ColumnDef[] = [
    {
      id: 'username',
      label: 'Username',
      type: 'text',
      sortable: true,
      width: 150,
    },
    {
      id: 'email',
      label: 'Email',
      type: 'text',
      sortable: true,
      width: 200,
    },
    {
      id: 'country',
      label: 'Country',
      type: 'text',
      sortable: true,
      width: 120,
    },
    {
      id: 'status',
      label: 'Status',
      format: (value, row: Player) => (
        <Chip
          label={row.status}
          size="small"
          color={
            row.status === 'Active' ? 'success' :
            row.status === 'Inactive' ? 'default' :
            row.status === 'Blocked' ? 'error' :
            'primary'
          }
        />
      ),
      sortable: true,
      width: 120,
    },
    {
      id: 'registrationDate',
      label: 'Registration Date',
      type: 'date',
      dateFormat: 'medium',
      sortable: true,
      width: 150,
    },
    {
      id: 'lastLoginDate',
      label: 'Last Login',
      format: (value, row: Player) => row.lastLoginDate ? formatDate(new Date(row.lastLoginDate), 'MMM dd, yyyy') : '-',
      sortable: true,
      width: 150,
    },
    {
      id: 'balance',
      label: 'Balance',
      type: 'currency',
      sortable: true,
      width: 120,
    },
    {
      id: 'totalDeposits',
      label: 'Total Deposits',
      type: 'currency',
      sortable: true,
      width: 150,
    },
    {
      id: 'totalBets',
      label: 'Total Bets',
      type: 'currency',
      sortable: true,
      width: 120,
    },
    {
      id: 'netProfit',
      label: 'Net Profit',
      format: (value, row: Player) => {
        const netProfit = row.netProfit || 0;
        return (
          <Typography
            variant="body2"
            sx={{
              color: netProfit >= 0 ? 'success.main' : 'error.main',
              fontWeight: 'medium'
            }}
          >
            {formatCurrency(netProfit)}
          </Typography>
        );
      },
      sortable: true,
      width: 120,
    }
  ];

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fetch metadata on component mount
  useEffect(() => {
    fetchMetadata();
  }, []);

  // Fetch players data when filters change
  useEffect(() => {
    fetchPlayers();
  }, [page, pageSize, sortBy, sortDirection]);

  // Fetch metadata (white labels, countries, statuses)
  const fetchMetadata = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch metadata from API
      const metadata = await playersService.getMetadata();

      // Set white labels
      if (metadata.whiteLabels) {
        setWhiteLabels(metadata.whiteLabels);

        // Convert white labels to MultiSelect options
        const options = metadata.whiteLabels.map((wl: WhiteLabel) => ({
          value: wl.id,
          label: wl.name
        }));
        setWhiteLabelsOptions(options);
      }

      // Set countries
      if (metadata.countries) {
        const countryObjects = Array.isArray(metadata.countries)
          ? metadata.countries.map(c => typeof c === 'string' ? { id: c, name: c } : c)
          : [];

        setCountries(countryObjects);

        // Convert countries to MultiSelect options
        const countryOptions = countryObjects.map((country: Country) => ({
          value: country.id,
          label: country.name
        }));
        setCountriesOptions(countryOptions);
      }

      // Set statuses
      if (metadata.statuses) {
        const statusObjects = Array.isArray(metadata.statuses)
          ? metadata.statuses.map(s => typeof s === 'string' ? { id: s, name: s } : s)
          : [];

        setStatuses(statusObjects);

        // Convert statuses to MultiSelect options
        const statusOptions = statusObjects.map((status: Status) => ({
          value: status.id,
          label: status.name
        }));
        setStatusesOptions(statusOptions);
      }
    } catch (err) {
      console.error('[PLAYERS PAGE] Error fetching metadata:', err);
      setError('Failed to load metadata. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch players data
  const fetchPlayers = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Create filters object
      const filters: ReportFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        whiteLabelIds: selectedWhiteLabels.length > 0 ? selectedWhiteLabels.map(id => parseInt(id)) : undefined,
        countryIds: selectedCountries.length > 0 ? selectedCountries : undefined,
      };

      // Add advanced filters if they exist
      if (Object.keys(advancedFilters).length > 0) {
        console.log('[PLAYERS PAGE] Adding advanced filters:', advancedFilters);

        // Process date filters
        if (advancedFilters.registration) {
          filters.registrationDate = formatDate(advancedFilters.registration, 'yyyy-MM-dd');
        }
        if (advancedFilters.firstTimeDeposit) {
          filters.firstDepositDate = formatDate(advancedFilters.firstTimeDeposit, 'yyyy-MM-dd');
        }
        if (advancedFilters.lastDepositDate) {
          filters.lastDepositDate = formatDate(advancedFilters.lastDepositDate, 'yyyy-MM-dd');
        }
        if (advancedFilters.lastLogin) {
          filters.lastLoginDate = formatDate(advancedFilters.lastLogin, 'yyyy-MM-dd');
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

      // Add pagination and sorting
      const params = {
        page: page + 1, // API uses 1-based indexing
        pageSize,
        sortBy,
        sortDirection
      };

      // Fetch players data from API
      const response = await playersService.getData({ ...filters, ...params });

      if (response && response.data) {
        setPlayers(response.data);
        setTotalCount(response.meta?.totalCount || response.data.length);
      } else {
        setPlayers([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('[PLAYERS PAGE] Error fetching players data:', err);
      setError('Failed to load players data. Please try again later.');
      setPlayers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = (): void => {
    console.log('[PLAYERS PAGE] Apply filters button clicked');

    // Combine basic filters with advanced filters if they exist
    const combinedFilters = {
      startDate: formatDate(startDate, 'yyyy-MM-dd'),
      endDate: formatDate(endDate, 'yyyy-MM-dd'),
      selectedWhiteLabels,
      selectedCountries,
      selectedStatuses,
      ...advancedFilters
    };

    console.log('[PLAYERS PAGE] Current filters:', combinedFilters);

    // Reset pagination
    setPage(0);

    fetchPlayers();
  };

  // Handle white labels change
  const handleWhiteLabelsChange = (values: (string | number)[]): void => {
    setSelectedWhiteLabels(values.map(v => v.toString()));
  };

  // Handle countries change
  const handleCountriesChange = (values: (string | number)[]): void => {
    setSelectedCountries(values.map(v => v.toString()));
  };

  // Handle statuses change
  const handleStatusesChange = (values: (string | number)[]): void => {
    setSelectedStatuses(values.map(v => v.toString()));
  };

  // Handle advanced filter change
  const handleAdvancedFilterChange = (key: string, value: any): void => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle reset advanced filters
  const handleResetAdvancedFilters = (): void => {
    setAdvancedFilters({});
  };

  // Handle toggle advanced filters
  const handleToggleAdvancedFilters = (): void => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Handle view player details
  const handleViewPlayerDetails = (player: Player): void => {
    setSelectedPlayer(player);
    setPlayerDetailsOpen(true);
  };

  // Handle close player details dialog
  const handleClosePlayerDetails = (): void => {
    setPlayerDetailsOpen(false);
    setSelectedPlayer(null);
  };

  // Handle export
  const handleExport = async (format: ExportFormat, exportData: any[]): Promise<void> => {
    try {
      setLoading(true);

      // Convert format to string for API
      const formatStr = format === ExportFormat.CSV ? 'csv' :
                        format === ExportFormat.EXCEL ? 'xlsx' :
                        format === ExportFormat.PDF ? 'pdf' : 'csv';

      // Create filters object
      const filters: ReportFilters = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        whiteLabelIds: selectedWhiteLabels.length > 0 ? selectedWhiteLabels.map(id => parseInt(id)) : undefined,
        countryIds: selectedCountries.length > 0 ? selectedCountries : undefined,
        format: formatStr
      };

      // Add advanced filters if they exist
      if (Object.keys(advancedFilters).length > 0) {
        console.log('[PLAYERS PAGE] Adding advanced filters to export:', advancedFilters);

        // Process date filters
        if (advancedFilters.registration) {
          filters.registrationDate = formatDate(advancedFilters.registration, 'yyyy-MM-dd');
        }
        if (advancedFilters.firstTimeDeposit) {
          filters.firstDepositDate = formatDate(advancedFilters.firstTimeDeposit, 'yyyy-MM-dd');
        }
        if (advancedFilters.lastDepositDate) {
          filters.lastDepositDate = formatDate(advancedFilters.lastDepositDate, 'yyyy-MM-dd');
        }
        if (advancedFilters.lastLogin) {
          filters.lastLoginDate = formatDate(advancedFilters.lastLogin, 'yyyy-MM-dd');
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

      // If we have the data already, we can use it directly instead of making an API call
      let blob;

      if (exportData.length > 0 && (format === ExportFormat.CSV || format === ExportFormat.JSON)) {
        // Client-side export for CSV and JSON
        if (format === ExportFormat.CSV) {
          // Create CSV content
          const headers = columns.map(col => col.label || col.id).join(',');
          const rows = exportData.map(row =>
            columns.map(col => {
              const value = row[col.id];
              // Handle special cases like objects, arrays, etc.
              if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value).replace(/"/g, '""');
              }
              return value !== undefined && value !== null ? String(value).replace(/"/g, '""') : '';
            }).join(',')
          ).join('\n');

          const csvContent = `${headers}\n${rows}`;
          blob = new Blob([csvContent], { type: 'text/csv' });
        } else if (format === ExportFormat.JSON) {
          // Create JSON content
          const jsonContent = JSON.stringify(exportData, null, 2);
          blob = new Blob([jsonContent], { type: 'application/json' });
        }
      } else {
        // Server-side export for other formats or when we need to process all data
        blob = await playersService.exportReport(filters, formatStr);
      }

      // Create download link
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `players-report-${formatDate(new Date(), 'yyyy-MM-dd')}.${formatStr}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('[PLAYERS PAGE] Error exporting data:', err);
      setError('Failed to export data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number): void => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when changing page size
  };

  // Handle sorting change
  const handleSortingChange = (field: string, direction: 'asc' | 'desc'): void => {
    setSortBy(field);
    setSortDirection(direction);
  };

  // Calculate summary statistics
  const summary = {
    totalPlayers: players.length,
    activePlayers: players.filter(p => p.status === 'Active').length,
    totalBalance: players.reduce((sum, p) => sum + (p.balance || 0), 0),
    totalDeposits: players.reduce((sum, p) => sum + (p.totalDeposits || 0), 0),
    totalBets: players.reduce((sum, p) => sum + (p.totalBets || 0), 0),
    totalNetProfit: players.reduce((sum, p) => sum + (p.netProfit || 0), 0)
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Players Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze player data, activity, and performance metrics
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/reports/players/advanced"
          startIcon={<FilterListIcon />}
        >
          Advanced Report
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Button
            color="primary"
            onClick={handleToggleAdvancedFilters}
            endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </Button>
        </Box>

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
        </Grid>

        {/* Advanced Filters */}
        <Collapse in={showAdvancedFilters} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={selectedStatuses}
                    onChange={(e) => handleStatusesChange(e.target.value as string[])}
                    label="Status"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {statusesOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
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
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
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

              {/* Date Filters */}
              <Grid item xs={12} sx={{ mt: 2 }}>
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

              {/* Players Input */}
              <Grid item xs={12} sx={{ mt: 2 }}>
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleResetAdvancedFilters}
                sx={{ mr: 2 }}
              >
                Reset Advanced Filters
              </Button>
            </Box>
          </Box>
        </Collapse>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Players
              </Typography>
              <Typography variant="h5">
                {summary.totalPlayers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Active Players
              </Typography>
              <Typography variant="h5">
                {summary.activePlayers.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Balance
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
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

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Bets
              </Typography>
              <Typography variant="h5">
                {formatCurrency(summary.totalBets)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Net Profit
              </Typography>
              <Typography variant="h5" sx={{ color: summary.totalNetProfit >= 0 ? 'success.main' : 'error.main' }}>
                {formatCurrency(summary.totalNetProfit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TableChartIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Players Data</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <EnhancedTable
          columns={columns}
          data={players}
          loading={loading}
          title="Players Data"
          emptyMessage="No players data available"
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
          onRowClick={handleViewPlayerDetails}
        />
      </Paper>

      {/* Player Details Dialog */}
      <Dialog
        open={playerDetailsOpen}
        onClose={handleClosePlayerDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Player Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedPlayer && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Basic Information
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Username:</strong> {selectedPlayer.username}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Email:</strong> {selectedPlayer.email}
                    </Typography>
                  </Box>

                  {selectedPlayer.phoneNumber && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        <strong>Phone:</strong> {selectedPlayer.phoneNumber}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Country:</strong> {selectedPlayer.country || 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Registration Date:</strong> {selectedPlayer.registrationDate ? formatDate(new Date(selectedPlayer.registrationDate), 'MMM dd, yyyy') : 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Last Login:</strong> {selectedPlayer.lastLoginDate ? formatDate(new Date(selectedPlayer.lastLoginDate), 'MMM dd, yyyy') : 'N/A'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Additional Information
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Status:</strong> {selectedPlayer.status || 'N/A'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>White Label:</strong> {selectedPlayer.whiteLabel || 'N/A'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Platform:</strong> {selectedPlayer.platform || 'N/A'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Device:</strong> {selectedPlayer.device || 'N/A'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>KYC Status:</strong> {selectedPlayer.kycStatus || 'N/A'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Financial Information
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Balance:</strong> {formatCurrency(selectedPlayer.balance || 0)}
                    </Typography>
                  </Box>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Deposits:</strong> {formatCurrency(selectedPlayer.totalDeposits || 0)}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Withdrawals:</strong> {formatCurrency(selectedPlayer.totalWithdrawals || 0)}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Bets:</strong> {formatCurrency(selectedPlayer.totalBets || 0)}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Wins:</strong> {formatCurrency(selectedPlayer.totalWins || 0)}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Net Profit:</strong> {formatCurrency(selectedPlayer.netProfit || 0)}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Currency:</strong> {selectedPlayer.currency || 'USD'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Communication Preferences
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>SMS Enabled:</strong> {selectedPlayer.smsEnabled ? 'Yes' : 'No'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Email Enabled:</strong> {selectedPlayer.emailEnabled ? 'Yes' : 'No'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone Enabled:</strong> {selectedPlayer.phoneEnabled ? 'Yes' : 'No'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Bonus Eligible:</strong> {selectedPlayer.bonusEligible ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlayerDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PlayersPage;