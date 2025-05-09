import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import Card from '../common/Card';

/**
 * DailyActionsAdvancedReport - Advanced comprehensive report with extensive filtering
 * 
 * @param {Object} props - Component props
 * @param {Object} props.metadata - Metadata for filters (white labels, countries, etc.)
 * @param {Object} props.data - Report data
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {Function} props.onFilterChange - Function to call when filters change
 * @param {Function} props.onRefresh - Function to call to refresh data
 * @param {Function} props.onExport - Function to call to export data
 */
const DailyActionsAdvancedReport = ({
  metadata = {},
  data = {},
  loading = false,
  error = null,
  onFilterChange,
  onRefresh,
  onExport
}) => {
  // ===== State for filters =====
  const [filters, setFilters] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
    whiteLabelIds: [],
    groupBy: 'Day',
    trackers: [],
    promotionCode: '',
    registrationPlayModes: [],
    languages: [],
    countries: [],
    currencies: [],
    genders: [],
    statuses: [],
    platforms: [],
    playerTypes: [],
    smsEnabled: null,
    mailEnabled: null,
    phoneEnabled: null,
    postEnabled: null,
    bonusEnabled: null,
    pageSize: 50,
    pageNumber: 1
  });

  // ===== State for UI =====
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // ===== Effects =====
  // Initial load
  useEffect(() => {
    if (onRefresh) {
      onRefresh(filters);
    }
  }, []);

  // ===== Handlers =====
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
    if (onRefresh) {
      onRefresh(filters);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      whiteLabelIds: [],
      groupBy: 'Day',
      trackers: [],
      promotionCode: '',
      registrationPlayModes: [],
      languages: [],
      countries: [],
      currencies: [],
      genders: [],
      statuses: [],
      platforms: [],
      playerTypes: [],
      smsEnabled: null,
      mailEnabled: null,
      phoneEnabled: null,
      postEnabled: null,
      bonusEnabled: null,
      pageSize: 50,
      pageNumber: 1
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    handleFilterChange('pageNumber', newPage + 1);
    handleApplyFilters();
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    handleFilterChange('pageSize', newRowsPerPage);
    handleFilterChange('pageNumber', 1);
    handleApplyFilters();
  };

  const handleExport = (format) => {
    if (onExport) {
      onExport(filters, format);
    }
  };

  // ===== Render functions =====
  const renderFilters = () => (
    <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          Search parameters
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {/* White Labels */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="white-labels-label">All White Labels</InputLabel>
              <Select
                labelId="white-labels-label"
                multiple
                value={filters.whiteLabelIds}
                onChange={(e) => handleFilterChange('whiteLabelIds', e.target.value)}
                input={<OutlinedInput label="All White Labels" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const label = metadata.whiteLabels?.find(wl => wl.id === value)?.name || value;
                      return <Chip key={value} label={label} />;
                    })}
                  </Box>
                )}
              >
                {metadata.whiteLabels?.map((whiteLabel) => (
                  <MenuItem key={whiteLabel.id} value={whiteLabel.id}>
                    <Checkbox checked={filters.whiteLabelIds.indexOf(whiteLabel.id) > -1} />
                    <ListItemText primary={whiteLabel.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Group By */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="group-by-label">Organize Result by</InputLabel>
              <Select
                labelId="group-by-label"
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                label="Organize Result by"
              >
                {metadata.groupByOptions?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Trackers */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="trackers-label">Trackers</InputLabel>
              <Select
                labelId="trackers-label"
                multiple
                value={filters.trackers}
                onChange={(e) => handleFilterChange('trackers', e.target.value)}
                input={<OutlinedInput label="Trackers" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.trackers?.map((tracker) => (
                  <MenuItem key={tracker} value={tracker}>
                    <Checkbox checked={filters.trackers.indexOf(tracker) > -1} />
                    <ListItemText primary={tracker} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Promotion Code */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Promotion Code"
              value={filters.promotionCode}
              onChange={(e) => handleFilterChange('promotionCode', e.target.value)}
            />
          </Grid>

          {/* Reg Play Mode */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="reg-play-mode-label">Reg Play Mode</InputLabel>
              <Select
                labelId="reg-play-mode-label"
                multiple
                value={filters.registrationPlayModes}
                onChange={(e) => handleFilterChange('registrationPlayModes', e.target.value)}
                input={<OutlinedInput label="Reg Play Mode" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.registrationPlayModes?.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    <Checkbox checked={filters.registrationPlayModes.indexOf(mode) > -1} />
                    <ListItemText primary={mode} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Languages */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="languages-label">Languages</InputLabel>
              <Select
                labelId="languages-label"
                multiple
                value={filters.languages}
                onChange={(e) => handleFilterChange('languages', e.target.value)}
                input={<OutlinedInput label="Languages" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.languages?.map((language) => (
                  <MenuItem key={language.code} value={language.code}>
                    <Checkbox checked={filters.languages.indexOf(language.code) > -1} />
                    <ListItemText primary={language.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Countries */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="countries-label">Countries</InputLabel>
              <Select
                labelId="countries-label"
                multiple
                value={filters.countries}
                onChange={(e) => handleFilterChange('countries', e.target.value)}
                input={<OutlinedInput label="Countries" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.countries?.map((country) => (
                  <MenuItem key={country.id} value={country.name}>
                    <Checkbox checked={filters.countries.indexOf(country.name) > -1} />
                    <ListItemText primary={country.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Currency */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="currencies-label">Currency</InputLabel>
              <Select
                labelId="currencies-label"
                multiple
                value={filters.currencies}
                onChange={(e) => handleFilterChange('currencies', e.target.value)}
                input={<OutlinedInput label="Currency" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.currencies?.map((currency) => (
                  <MenuItem key={currency.id} value={currency.code}>
                    <Checkbox checked={filters.currencies.indexOf(currency.code) > -1} />
                    <ListItemText primary={`${currency.code} (${currency.name})`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Gender */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="genders-label">Gender</InputLabel>
              <Select
                labelId="genders-label"
                multiple
                value={filters.genders}
                onChange={(e) => handleFilterChange('genders', e.target.value)}
                input={<OutlinedInput label="Gender" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.genders?.map((gender) => (
                  <MenuItem key={gender} value={gender}>
                    <Checkbox checked={filters.genders.indexOf(gender) > -1} />
                    <ListItemText primary={gender} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="statuses-label">Status</InputLabel>
              <Select
                labelId="statuses-label"
                multiple
                value={filters.statuses}
                onChange={(e) => handleFilterChange('statuses', e.target.value)}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.statuses?.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Checkbox checked={filters.statuses.indexOf(status) > -1} />
                    <ListItemText primary={status} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Platform */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="platforms-label">Platform</InputLabel>
              <Select
                labelId="platforms-label"
                multiple
                value={filters.platforms}
                onChange={(e) => handleFilterChange('platforms', e.target.value)}
                input={<OutlinedInput label="Platform" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.platforms?.map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    <Checkbox checked={filters.platforms.indexOf(platform) > -1} />
                    <ListItemText primary={platform} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Players Type */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="player-types-label">Players Type</InputLabel>
              <Select
                labelId="player-types-label"
                multiple
                value={filters.playerTypes}
                onChange={(e) => handleFilterChange('playerTypes', e.target.value)}
                input={<OutlinedInput label="Players Type" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {metadata.playerTypes?.map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox checked={filters.playerTypes.indexOf(type) > -1} />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date Range Start"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date Range End"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          {/* Communication Preferences */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Communication Preferences
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.smsEnabled === true}
                    onChange={(e) => handleFilterChange('smsEnabled', e.target.checked ? true : null)}
                  />
                }
                label="SMS Enabled"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.mailEnabled === true}
                    onChange={(e) => handleFilterChange('mailEnabled', e.target.checked ? true : null)}
                  />
                }
                label="Mail Enabled"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.phoneEnabled === true}
                    onChange={(e) => handleFilterChange('phoneEnabled', e.target.checked ? true : null)}
                  />
                }
                label="Phone Enabled"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.postEnabled === true}
                    onChange={(e) => handleFilterChange('postEnabled', e.target.checked ? true : null)}
                  />
                }
                label="Post Enabled"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.bonusEnabled === true}
                    onChange={(e) => handleFilterChange('bonusEnabled', e.target.checked ? true : null)}
                  />
                }
                label="Bonus Enabled"
              />
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleResetFilters}
                startIcon={<ClearIcon />}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyFilters}
                startIcon={<SearchIcon />}
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderDataTable = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!data.data || data.data.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No data found for the selected filters.
        </Alert>
      );
    }

    return (
      <>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>White Label</TableCell>
                <TableCell align="right">Registrations</TableCell>
                <TableCell align="right">FTD</TableCell>
                <TableCell align="right">Deposits</TableCell>
                <TableCell align="right">Cashouts</TableCell>
                <TableCell align="right">Casino Bets</TableCell>
                <TableCell align="right">Casino Wins</TableCell>
                <TableCell align="right">Sport Bets</TableCell>
                <TableCell align="right">Sport Wins</TableCell>
                <TableCell align="right">Live Bets</TableCell>
                <TableCell align="right">Live Wins</TableCell>
                <TableCell align="right">Bingo Bets</TableCell>
                <TableCell align="right">Bingo Wins</TableCell>
                <TableCell align="right">Total GGR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{format(new Date(row.date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{row.whiteLabelName}</TableCell>
                  <TableCell align="right">{row.registrations}</TableCell>
                  <TableCell align="right">{row.ftd}</TableCell>
                  <TableCell align="right">{row.deposits.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.paidCashouts.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.betsCasino.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.winsCasino.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.betsSport.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.winsSport.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.betsLive.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.winsLive.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.betsBingo.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.winsBingo.toFixed(2)}</TableCell>
                  <TableCell align="right">{row.totalGGR.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={data.totalCount || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </>
    );
  };

  const renderSummary = () => {
    if (!data.summary) return null;

    return (
      <Card
        title="Summary"
        subheader="Aggregated metrics for the selected period"
        sx={{ mb: 3 }}
      >
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Total Registrations</Typography>
            <Typography variant="h6">{data.summary.totalRegistrations}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Total FTD</Typography>
            <Typography variant="h6">{data.summary.totalFTD}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Total Deposits</Typography>
            <Typography variant="h6">{data.summary.totalDeposits?.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Total Cashouts</Typography>
            <Typography variant="h6">{data.summary.totalCashouts?.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" color="text.secondary">Total GGR</Typography>
            <Typography variant="h6">{data.summary.totalGGR?.toFixed(2)}</Typography>
          </Grid>
        </Grid>
      </Card>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>Advanced Report</Typography>
        {renderFilters()}
      </Paper>

      {renderSummary()}

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Daily Actions Data</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => onRefresh && onRefresh(filters)}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export
            </Button>
          </Box>
        </Box>
        {renderDataTable()}
      </Paper>
    </Box>
  );
};

export default DailyActionsAdvancedReport;
