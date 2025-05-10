import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import DateRangePicker from '../common/DateRangePicker';
import { DateRange } from '../../types/dateRangePicker';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// Define interfaces
interface DailyActionsAdvancedReportProps {
  /**
   * Metadata for filters
   */
  metadata: any;

  /**
   * Report data
   */
  data: any;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error message
   */
  error: string | null;

  /**
   * Handler for filter changes
   */
  onFilterChange: (filters: any) => void;

  /**
   * Handler for refreshing data
   */
  onRefresh: (filters: any) => void;

  /**
   * Handler for exporting data
   */
  onExport: (filters: any, format: string) => void;
}

/**
 * Advanced daily actions report component
 */
const DailyActionsAdvancedReport: React.FC<DailyActionsAdvancedReportProps> = ({
  metadata,
  data,
  loading,
  error,
  onFilterChange,
  onRefresh,
  onExport
}) => {
  // State
  const [activeTab, setActiveTab] = useState<number>(0);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    startDate: startOfDay(subDays(new Date(), 30)),
    endDate: endOfDay(new Date()),
    gameCategory: '',
    playerStatus: '',
    country: '',
    minAmount: '',
    maxAmount: ''
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle export menu
  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  // Handle export format selection
  const handleExportFormat = (format: string) => {
    onExport(filters, format);
    handleExportClose();
  };

  // Handle filter toggle
  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle filter change
  const handleFilterChange = (field: string, value: any) => {
    const newFilters = {
      ...filters,
      [field]: value
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    if (range.start && range.end) {
      const newFilters = {
        ...filters,
        startDate: range.start,
        endDate: range.end
      };

      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    onRefresh(filters);
  };

  // Render placeholder content when no data
  const renderPlaceholder = () => (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No data available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Try adjusting your filters or select a different date range.
      </Typography>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={handleRefresh}
        sx={{ mt: 2 }}
      >
        Refresh Data
      </Button>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        {/* Report Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Advanced Daily Actions Report
          </Typography>
          <Box>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter data">
              <IconButton onClick={handleToggleFilters} color={showFilters ? 'primary' : 'default'}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export data">
              <IconButton onClick={handleExportClick} disabled={loading || !data}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={exportAnchorEl}
              open={Boolean(exportAnchorEl)}
              onClose={handleExportClose}
            >
              <MenuItem onClick={() => handleExportFormat('csv')}>Export as CSV</MenuItem>
              <MenuItem onClick={() => handleExportFormat('xlsx')}>Export as Excel</MenuItem>
              <MenuItem onClick={() => handleExportFormat('pdf')}>Export as PDF</MenuItem>
              <MenuItem onClick={() => handleExportFormat('json')}>Export as JSON</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters Section */}
        {showFilters && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DateRangePicker
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  onChange={handleDateRangeChange}
                  buttonLabel="Date Range"
                />
              </Grid>
              {/* Additional filters would go here */}
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  // Reset filters logic
                  const resetFilters = {
                    startDate: startOfDay(subDays(new Date(), 30)),
                    endDate: endOfDay(new Date()),
                    gameCategory: '',
                    playerStatus: '',
                    country: '',
                    minAmount: '',
                    maxAmount: ''
                  };
                  setFilters(resetFilters);
                  onFilterChange(resetFilters);
                }}
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleRefresh}
              >
                Apply Filters
              </Button>
            </Box>
          </Paper>
        )}

        {/* Date Range Display */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing data from {format(filters.startDate, 'MMM d, yyyy')} to {format(filters.endDate, 'MMM d, yyyy')}
          </Typography>
        </Box>

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Report Content */}
        {!loading && data && (
          <>
            {/* Report Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Summary" />
                <Tab label="Detailed View" />
                <Tab label="Charts" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box role="tabpanel" hidden={activeTab !== 0}>
              {activeTab === 0 && (
                <Typography variant="body1">
                  Summary content would go here. This is a placeholder component.
                </Typography>
              )}
            </Box>
            <Box role="tabpanel" hidden={activeTab !== 1}>
              {activeTab === 1 && (
                <Typography variant="body1">
                  Detailed view content would go here. This is a placeholder component.
                </Typography>
              )}
            </Box>
            <Box role="tabpanel" hidden={activeTab !== 2}>
              {activeTab === 2 && (
                <Typography variant="body1">
                  Charts content would go here. This is a placeholder component.
                </Typography>
              )}
            </Box>
          </>
        )}

        {/* No Data Placeholder */}
        {!loading && !data && renderPlaceholder()}
      </CardContent>
    </Card>
  );
};

export default DailyActionsAdvancedReport;
