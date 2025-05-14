import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
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
  Collapse,
  Rating,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { EnhancedTable } from '../../../components/tables/enhanced';
import { ColumnDef, ExportFormat } from '../../../components/tables/enhanced/types';
import MultiSelect, { MultiSelectOption } from '../../../components/common/MultiSelect';
import { format as formatDate } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SimpleBox from '../../../components/common/SimpleBox';
import { createSx } from '../../../utils/styleUtils';

// Import icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import CasinoIcon from '@mui/icons-material/Casino';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

// Import services
import gamesService from '../../../services/api/gamesService';
import { ReportFilters } from '../../../services/api/types';
import { Game } from '../../../types/games';

// Define interfaces
interface Filters {
  startDate: string;
  endDate: string;
  providerIds?: string[];
  categoryIds?: string[];

  // Advanced filters
  name?: string;
  minRtp?: number;
  maxRtp?: number;
  volatility?: string[];
  status?: string[];
  releaseDate?: string;
  features?: string[];
  tags?: string[];
}

interface Provider {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface GamePerformance {
  gameId: string;
  revenue: number;
  uniquePlayers: number;
  sessions: number;
  avgSessionDuration: number;
  avgBet: number;
  avgWin: number;
  betsCount: number;
  winsCount: number;
  winRate: number;
  holdPercentage: number;
  period?: {
    startDate: string;
    endDate: string;
  };
}

/**
 * GamesPage component
 * Displays a comprehensive game report with filtering and data visualization
 */
const GamesPage: React.FC = () => {
  // State for filters
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});

  // State for data
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for metadata
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providersOptions, setProvidersOptions] = useState<MultiSelectOption[]>([]);
  const [categoriesOptions, setCategoriesOptions] = useState<MultiSelectOption[]>([]);

  // State for game details dialog
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameDetailsOpen, setGameDetailsOpen] = useState<boolean>(false);
  const [gamePerformance, setGamePerformance] = useState<GamePerformance | null>(null);

  // Define table columns
  const columns: ColumnDef[] = [
    {
      id: 'name',
      label: 'Game Name',
      format: (value, row: Game) => (
        <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center' })}>
          {row.thumbnailUrl && (
            <SimpleBox
              component="img"
              src={row.thumbnailUrl}
              alt={row.name}
              sx={createSx({ width: 40, height: 40, mr: 2, borderRadius: 1 })}
            />
          )}
          <Typography variant="body2" fontWeight="medium">
            {row.name}
          </Typography>
        </SimpleBox>
      ),
      sortable: true,
      width: 200,
    },
    {
      id: 'provider',
      label: 'Provider',
      type: 'text',
      sortable: true,
      width: 150,
    },
    {
      id: 'category',
      label: 'Category',
      type: 'text',
      sortable: true,
      width: 150,
    },
    {
      id: 'rtp',
      label: 'RTP',
      type: 'percentage',
      sortable: true,
      width: 100,
    },
    {
      id: 'volatility',
      label: 'Volatility',
      format: (value, row: Game) => {
        const volatility = row.volatility;
        return (
          <Chip
            label={volatility ? volatility.charAt(0).toUpperCase() + volatility.slice(1) : 'N/A'}
            size="small"
            color={
              volatility === 'high' ? 'error' :
              volatility === 'medium' ? 'warning' :
              volatility === 'low' ? 'success' :
              'default'
            }
          />
        );
      },
      sortable: true,
      width: 120,
    },
    {
      id: 'revenue',
      label: 'Revenue',
      type: 'currency',
      sortable: true,
      width: 120,
    },
    {
      id: 'uniquePlayers',
      label: 'Players',
      type: 'number',
      sortable: true,
      width: 100,
    },
    {
      id: 'sessions',
      label: 'Sessions',
      type: 'number',
      sortable: true,
      width: 100,
    },
    {
      id: 'winRate',
      label: 'Win Rate',
      type: 'percentage',
      sortable: true,
      width: 100,
    },
    {
      id: 'status',
      label: 'Status',
      format: (value, row: Game) => (
        <Chip
          label={row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'N/A'}
          size="small"
          color={
            row.status === 'active' ? 'success' :
            row.status === 'inactive' ? 'default' :
            row.status === 'maintenance' ? 'warning' :
            'primary'
          }
        />
      ),
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

  // Fetch games data when filters change
  useEffect(() => {
    fetchGames();
  }, [page, pageSize, sortBy, sortDirection]);

  // Fetch metadata (providers, categories)
  const fetchMetadata = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch providers
      const providersData = await gamesService.getGameProviders();
      setProviders(providersData);

      // Convert providers to MultiSelect options
      const providerOptions = providersData.map((provider: Provider) => ({
        value: provider.id,
        label: provider.name
      }));
      setProvidersOptions(providerOptions);

      // Fetch categories
      const categoriesData = await gamesService.getGameCategories();
      setCategories(categoriesData);

      // Convert categories to MultiSelect options
      const categoryOptions = categoriesData.map((category: Category) => ({
        value: category.id,
        label: category.name
      }));
      setCategoriesOptions(categoryOptions);
    } catch (err) {
      console.error('[GAMES PAGE] Error fetching metadata:', err);
      setError('Failed to load metadata. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch games data
  const fetchGames = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Create query parameters
      const params: any = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        provider: selectedProviders.length > 0 ? selectedProviders.join(',') : undefined,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        page: page + 1, // API uses 1-based indexing
        limit: pageSize,
        sortBy,
        sortOrder: sortDirection
      };

      // Add advanced filters if they exist
      if (Object.keys(advancedFilters).length > 0) {
        console.log('[GAMES PAGE] Adding advanced filters:', advancedFilters);

        if (advancedFilters.name) {
          params.search = advancedFilters.name;
        }

        if (advancedFilters.minRtp) {
          params.minRtp = advancedFilters.minRtp;
        }

        if (advancedFilters.maxRtp) {
          params.maxRtp = advancedFilters.maxRtp;
        }

        if (advancedFilters.volatility && advancedFilters.volatility.length > 0) {
          params.volatility = advancedFilters.volatility.join(',');
        }

        if (advancedFilters.status && advancedFilters.status.length > 0) {
          params.status = advancedFilters.status.join(',');
        }

        if (advancedFilters.releaseDate) {
          params.releaseDateStart = formatDate(advancedFilters.releaseDate, 'yyyy-MM-dd');
        }

        if (advancedFilters.features && advancedFilters.features.length > 0) {
          params.features = advancedFilters.features.join(',');
        }

        if (advancedFilters.tags && advancedFilters.tags.length > 0) {
          params.tags = advancedFilters.tags.join(',');
        }
      }

      // Fetch games data from API
      const response = await gamesService.getGames(params);

      if (response && response.data) {
        setGames(response.data);
        setTotalCount(response.meta?.totalCount || response.data.length);
      } else {
        setGames([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('[GAMES PAGE] Error fetching games data:', err);
      setError('Failed to load games data. Please try again later.');
      setGames([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleApplyFilters = (): void => {
    console.log('[GAMES PAGE] Apply filters button clicked');

    // Combine basic filters with advanced filters if they exist
    const combinedFilters = {
      startDate: formatDate(startDate, 'yyyy-MM-dd'),
      endDate: formatDate(endDate, 'yyyy-MM-dd'),
      selectedProviders,
      selectedCategories,
      ...advancedFilters
    };

    console.log('[GAMES PAGE] Current filters:', combinedFilters);

    // Reset pagination
    setPage(0);

    fetchGames();
  };

  // Handle providers change
  const handleProvidersChange = (values: (string | number)[]): void => {
    setSelectedProviders(values.map(v => v.toString()));
  };

  // Handle categories change
  const handleCategoriesChange = (values: (string | number)[]): void => {
    setSelectedCategories(values.map(v => v.toString()));
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

  // Handle view game details
  const handleViewGameDetails = async (game: Game): Promise<void> => {
    setSelectedGame(game);
    setGameDetailsOpen(true);

    try {
      // Fetch game performance data
      const performanceData = await gamesService.getGamePerformance(game.id, {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd')
      });

      // Ensure all required properties exist with default values if needed
      const validatedData: GamePerformance = {
        gameId: performanceData.gameId || game.id,
        revenue: performanceData.revenue || 0,
        uniquePlayers: performanceData.uniquePlayers || 0,
        sessions: performanceData.sessions || 0,
        avgSessionDuration: performanceData.avgSessionDuration || 0,
        avgBet: performanceData.avgBet || 0,
        avgWin: performanceData.avgWin || 0,
        betsCount: performanceData.betsCount || 0,
        winsCount: performanceData.winsCount || 0,
        winRate: performanceData.winRate || 0,
        holdPercentage: performanceData.holdPercentage || 0,
        period: performanceData.period || {
          startDate: formatDate(startDate, 'yyyy-MM-dd'),
          endDate: formatDate(endDate, 'yyyy-MM-dd')
        }
      };

      setGamePerformance(validatedData);
    } catch (err) {
      console.error('[GAMES PAGE] Error fetching game performance:', err);

      // Create default performance data when API call fails
      const defaultPerformance: GamePerformance = {
        gameId: game.id,
        revenue: 0,
        uniquePlayers: 0,
        sessions: 0,
        avgSessionDuration: 0,
        avgBet: 0,
        avgWin: 0,
        betsCount: 0,
        winsCount: 0,
        winRate: 0,
        holdPercentage: 0,
        period: {
          startDate: formatDate(startDate, 'yyyy-MM-dd'),
          endDate: formatDate(endDate, 'yyyy-MM-dd')
        }
      };

      setGamePerformance(defaultPerformance);
    }
  };

  // Handle close game details dialog
  const handleCloseGameDetails = (): void => {
    setGameDetailsOpen(false);
    setSelectedGame(null);
    setGamePerformance(null);
  };

  // Handle export
  const handleExport = async (format: ExportFormat, exportData: any[]): Promise<void> => {
    try {
      setLoading(true);

      // Convert format to string for API
      const formatStr = format === ExportFormat.CSV ? 'csv' :
                        format === ExportFormat.EXCEL ? 'xlsx' :
                        format === ExportFormat.PDF ? 'pdf' : 'csv';

      // Create query parameters
      const params: any = {
        startDate: formatDate(startDate, 'yyyy-MM-dd'),
        endDate: formatDate(endDate, 'yyyy-MM-dd'),
        provider: selectedProviders.length > 0 ? selectedProviders.join(',') : undefined,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        format: formatStr
      };

      // Add advanced filters if they exist
      if (Object.keys(advancedFilters).length > 0) {
        if (advancedFilters.name) {
          params.search = advancedFilters.name;
        }

        if (advancedFilters.minRtp) {
          params.minRtp = advancedFilters.minRtp;
        }

        if (advancedFilters.maxRtp) {
          params.maxRtp = advancedFilters.maxRtp;
        }

        if (advancedFilters.volatility && advancedFilters.volatility.length > 0) {
          params.volatility = advancedFilters.volatility.join(',');
        }

        if (advancedFilters.status && advancedFilters.status.length > 0) {
          params.status = advancedFilters.status.join(',');
        }

        if (advancedFilters.releaseDate) {
          params.releaseDateStart = formatDate(advancedFilters.releaseDate, 'yyyy-MM-dd');
        }

        if (advancedFilters.features && advancedFilters.features.length > 0) {
          params.features = advancedFilters.features.join(',');
        }

        if (advancedFilters.tags && advancedFilters.tags.length > 0) {
          params.tags = advancedFilters.tags.join(',');
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
        blob = await gamesService.exportGames(params);
      }

      // Create download link
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `games-report-${formatDate(new Date(), 'yyyy-MM-dd')}.${formatStr}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('[GAMES PAGE] Error exporting data:', err);
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
    totalGames: games.length,
    totalRevenue: games.reduce((sum, g) => sum + (g.revenue || 0), 0),
    totalPlayers: games.reduce((sum, g) => sum + (g.uniquePlayers || 0), 0),
    totalSessions: games.reduce((sum, g) => sum + (g.sessions || 0), 0),
    avgRtp: games.length > 0 ? games.reduce((sum, g) => sum + (g.rtp || 0), 0) / games.length : 0,
    avgWinRate: games.length > 0 ? games.reduce((sum, g) => sum + (g.winRate || 0), 0) / games.length : 0
  };

  return (
    <Container maxWidth="xl">
      <SimpleBox sx={createSx({ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
        <SimpleBox>
          <Typography variant="h4" gutterBottom>
            Games Report
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and analyze game performance, popularity, and revenue metrics
          </Typography>
        </SimpleBox>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/reports/games/advanced"
          startIcon={<FilterListIcon />}
        >
          Advanced Report
        </Button>
      </SimpleBox>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 })}>
          <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center' })}>
            <FilterListIcon sx={createSx({ mr: 1 })} />
            <Typography variant="h6">Filters</Typography>
          </SimpleBox>
          <Button
            color="primary"
            onClick={handleToggleAdvancedFilters}
            endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </Button>
        </SimpleBox>

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
              label="Providers"
              options={providersOptions}
              value={selectedProviders}
              onChange={handleProvidersChange}
              placeholder="Select Providers"
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
              label="Categories"
              options={categoriesOptions}
              value={selectedCategories}
              onChange={handleCategoriesChange}
              placeholder="Select Categories"
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
          <SimpleBox sx={createSx({ mt: 3 })}>
            <Divider sx={createSx({ mb: 3 })} />
            <Typography variant="subtitle1" gutterBottom>
              Advanced Filters
            </Typography>

            <Grid container spacing={3}>
              {/* Game Information */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Game Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Game Name"
                  fullWidth
                  value={advancedFilters.name || ''}
                  onChange={(e) => handleAdvancedFilterChange('name', e.target.value)}
                  placeholder="Search by name"
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.status || []}
                    onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                    label="Status"
                    renderValue={(selected) => (
                      <SimpleBox sx={createSx({ display: 'flex', flexWrap: 'wrap', gap: 0.5 })}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </SimpleBox>
                    )}
                  >
                    {['active', 'inactive', 'maintenance'].map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Volatility</InputLabel>
                  <Select
                    multiple
                    value={advancedFilters.volatility || []}
                    onChange={(e) => handleAdvancedFilterChange('volatility', e.target.value)}
                    label="Volatility"
                    renderValue={(selected) => (
                      <SimpleBox sx={createSx({ display: 'flex', flexWrap: 'wrap', gap: 0.5 })}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </SimpleBox>
                    )}
                  >
                    {['low', 'medium', 'high'].map((volatility) => (
                      <MenuItem key={volatility} value={volatility}>
                        {volatility.charAt(0).toUpperCase() + volatility.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Release Date"
                    value={advancedFilters.releaseDate || null}
                    onChange={(newValue) => handleAdvancedFilterChange('releaseDate', newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* RTP Range */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  RTP Range (%)
                </Typography>
                <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center', gap: 2 })}>
                  <TextField
                    label="Min"
                    type="number"
                    fullWidth
                    value={advancedFilters.minRtp || ''}
                    onChange={(e) => handleAdvancedFilterChange('minRtp', e.target.value)}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                  />
                  <Typography variant="body1">to</Typography>
                  <TextField
                    label="Max"
                    type="number"
                    fullWidth
                    value={advancedFilters.maxRtp || ''}
                    onChange={(e) => handleAdvancedFilterChange('maxRtp', e.target.value)}
                    InputProps={{ inputProps: { min: 0, max: 100 } }}
                  />
                </SimpleBox>
              </Grid>

              {/* Features */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Features"
                  placeholder="Enter features (comma separated)"
                  fullWidth
                  value={advancedFilters.features || ''}
                  onChange={(e) => handleAdvancedFilterChange('features', e.target.value.split(',').map(f => f.trim()))}
                  helperText="E.g., free spins, bonus rounds, multipliers"
                />
              </Grid>
            </Grid>

            <SimpleBox sx={createSx({ display: 'flex', justifyContent: 'flex-end', mt: 3 })}>
              <Button
                variant="outlined"
                onClick={handleResetAdvancedFilters}
                sx={{ mr: 2 }}
              >
                Reset Advanced Filters
              </Button>
            </SimpleBox>
          </SimpleBox>
        </Collapse>

        {/* Action Buttons */}
        <SimpleBox sx={createSx({ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 3 })}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </SimpleBox>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Games
              </Typography>
              <Typography variant="h5">
                {summary.totalGames.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
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
                Total Sessions
              </Typography>
              <Typography variant="h5">
                {summary.totalSessions.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average RTP
              </Typography>
              <Typography variant="h5">
                {summary.avgRtp.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Average Win Rate
              </Typography>
              <Typography variant="h5">
                {summary.avgWinRate.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Paper sx={{ p: 3 }}>
        <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center', mb: 2 })}>
          <TableChartIcon sx={createSx({ mr: 1 })} />
          <Typography variant="h6">Games Data</Typography>
        </SimpleBox>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <EnhancedTable
          columns={columns}
          data={games}
          loading={loading}
          title="Games Data"
          emptyMessage="No games data available"
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
          onRowClick={handleViewGameDetails}
        />
      </Paper>

      {/* Game Details Dialog */}
      <Dialog
        open={gameDetailsOpen}
        onClose={handleCloseGameDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Game Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedGame && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SimpleBox sx={createSx({ mb: 2 })}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Basic Information
                  </Typography>
                  <Divider sx={createSx({ my: 1 })} />

                  <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center', mb: 2 })}>
                    {selectedGame.thumbnailUrl && (
                      <SimpleBox
                        component="img"
                        src={selectedGame.thumbnailUrl}
                        alt={selectedGame.name}
                        sx={createSx({ width: 80, height: 80, mr: 2, borderRadius: 1 })}
                      />
                    )}
                    <SimpleBox>
                      <Typography variant="h6">
                        {selectedGame.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedGame.provider} | {selectedGame.category}
                      </Typography>
                    </SimpleBox>
                  </SimpleBox>

                  {selectedGame.description && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {selectedGame.description}
                    </Typography>
                  )}

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Status:</strong> {selectedGame.status ? selectedGame.status.charAt(0).toUpperCase() + selectedGame.status.slice(1) : 'N/A'}
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Release Date:</strong> {selectedGame.releaseDate ? formatDate(new Date(selectedGame.releaseDate), 'MMM dd, yyyy') : 'N/A'}
                  </Typography>

                  <SimpleBox sx={createSx({ mb: 1 })}>
                    <Typography variant="body1" component="span">
                      <strong>RTP:</strong> {selectedGame.rtp ? `${selectedGame.rtp}%` : 'N/A'}
                    </Typography>
                    {selectedGame.rtp && (
                      <Tooltip title={`Return to Player: ${selectedGame.rtp}%`}>
                        <LinearProgress
                          variant="determinate"
                          value={selectedGame.rtp}
                          sx={createSx({ mt: 1, height: 8, borderRadius: 4 })}
                        />
                      </Tooltip>
                    )}
                  </SimpleBox>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Volatility:</strong> {selectedGame.volatility ? selectedGame.volatility.charAt(0).toUpperCase() + selectedGame.volatility.slice(1) : 'N/A'}
                  </Typography>

                  {selectedGame.features && selectedGame.features.length > 0 && (
                    <SimpleBox sx={createSx({ mb: 1 })}>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>
                        <strong>Features:</strong>
                      </Typography>
                      <SimpleBox sx={createSx({ display: 'flex', flexWrap: 'wrap', gap: 0.5 })}>
                        {selectedGame.features.map((feature) => (
                          <Chip key={feature} label={feature} size="small" />
                        ))}
                      </SimpleBox>
                    </SimpleBox>
                  )}

                  {selectedGame.tags && selectedGame.tags.length > 0 && (
                    <SimpleBox sx={createSx({ mb: 1 })}>
                      <Typography variant="body1" sx={{ mb: 0.5 }}>
                        <strong>Tags:</strong>
                      </Typography>
                      <SimpleBox sx={createSx({ display: 'flex', flexWrap: 'wrap', gap: 0.5 })}>
                        {selectedGame.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </SimpleBox>
                    </SimpleBox>
                  )}
                </SimpleBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <SimpleBox sx={createSx({ mb: 2 })}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Performance Metrics
                  </Typography>
                  <Divider sx={createSx({ my: 1 })} />

                  {gamePerformance ? (
                    <>
                      <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center', mb: 1 })}>
                        <AttachMoneyIcon sx={createSx({ mr: 1, color: 'primary.main' })} />
                        <Typography variant="body1">
                          <strong>Revenue:</strong> {formatCurrency(gamePerformance.revenue || 0)}
                        </Typography>
                      </SimpleBox>

                      <SimpleBox sx={createSx({ display: 'flex', alignItems: 'center', mb: 1 })}>
                        <PeopleIcon sx={createSx({ mr: 1, color: 'primary.main' })} />
                        <Typography variant="body1">
                          <strong>Unique Players:</strong> {gamePerformance.uniquePlayers !== undefined ? gamePerformance.uniquePlayers.toLocaleString() : '0'}
                        </Typography>
                      </SimpleBox>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Sessions:</strong> {gamePerformance.sessions !== undefined ? gamePerformance.sessions.toLocaleString() : '0'}
                      </Typography>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Average Session Duration:</strong> {gamePerformance.avgSessionDuration !== undefined ? gamePerformance.avgSessionDuration.toFixed(2) : '0.00'} minutes
                      </Typography>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Average Bet:</strong> {formatCurrency(gamePerformance.avgBet || 0)}
                      </Typography>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Average Win:</strong> {formatCurrency(gamePerformance.avgWin || 0)}
                      </Typography>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Bets Count:</strong> {gamePerformance.betsCount !== undefined ? gamePerformance.betsCount.toLocaleString() : '0'}
                      </Typography>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Wins Count:</strong> {gamePerformance.winsCount !== undefined ? gamePerformance.winsCount.toLocaleString() : '0'}
                      </Typography>

                      <SimpleBox sx={createSx({ mb: 1 })}>
                        <Typography variant="body1" component="span">
                          <strong>Win Rate:</strong> {gamePerformance.winRate !== undefined ? gamePerformance.winRate.toFixed(2) : '0.00'}%
                        </Typography>
                        <Tooltip title={`Win Rate: ${gamePerformance.winRate !== undefined ? gamePerformance.winRate.toFixed(2) : '0.00'}%`}>
                          <LinearProgress
                            variant="determinate"
                            value={gamePerformance.winRate || 0}
                            sx={createSx({ mt: 1, height: 8, borderRadius: 4 })}
                          />
                        </Tooltip>
                      </SimpleBox>

                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Hold Percentage:</strong> {gamePerformance.holdPercentage !== undefined ? gamePerformance.holdPercentage.toFixed(2) : '0.00'}%
                      </Typography>

                      {gamePerformance.period && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Data period: {formatDate(new Date(gamePerformance.period.startDate), 'MMM dd, yyyy')} to {formatDate(new Date(gamePerformance.period.endDate), 'MMM dd, yyyy')}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <SimpleBox sx={createSx({ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 })}>
                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          No performance data available for the selected period.
                        </Typography>
                      )}
                    </SimpleBox>
                  )}
                </SimpleBox>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGameDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GamesPage;