import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Collapse
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MultiSelect, { MultiSelectOption } from '../../../components/common/MultiSelect';
import FilterPanel, { FilterDefinition, FilterType } from '../../../components/common/FilterPanel';
import { GroupByOption, AdvancedFilters } from './types';

// Define a custom type for MultiSelect onChange handler
type MultiSelectChangeHandler = (value: (string | number)[]) => void;

interface DailyActionsFiltersProps {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  selectedWhiteLabels: string[];
  setSelectedWhiteLabels: MultiSelectChangeHandler;
  whiteLabelsOptions: MultiSelectOption[];
  whiteLabelsLoading?: boolean;
  selectedCountries: string[];
  setSelectedCountries: MultiSelectChangeHandler;
  countriesOptions: MultiSelectOption[];
  countriesLoading?: boolean;
  groupBy: string;
  setGroupBy: (groupBy: string) => void;
  groupByOptions: GroupByOption[];
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  showFiltersPanel: boolean;
  setShowFiltersPanel: (show: boolean) => void;
  advancedFilters: AdvancedFilters;
  setAdvancedFilters: (filters: AdvancedFilters) => void;
  handleApplyFilters: () => void;
  handleExport: () => void;
  loading: boolean;
  dataLength: number;
}

const DailyActionsFilters: React.FC<DailyActionsFiltersProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  selectedWhiteLabels,
  setSelectedWhiteLabels,
  whiteLabelsOptions,
  whiteLabelsLoading = false,
  selectedCountries,
  setSelectedCountries,
  countriesOptions,
  countriesLoading = false,
  groupBy,
  setGroupBy,
  groupByOptions,
  showAdvancedFilters,
  setShowAdvancedFilters,
  showFiltersPanel,
  setShowFiltersPanel,
  advancedFilters,
  setAdvancedFilters,
  handleApplyFilters,
  handleExport,
  loading,
  dataLength
}) => {
  // Handle advanced filter toggle
  const handleToggleAdvancedFilters = (): void => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Handle filters panel toggle
  const handleToggleFiltersPanel = (): void => {
    setShowFiltersPanel(!showFiltersPanel);
  };

  // Handle group by change
  const handleGroupByChange = (event: SelectChangeEvent<string>): void => {
    setGroupBy(event.target.value);
  };

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (filterName: string, value: any): void => {
    setAdvancedFilters({
      ...advancedFilters,
      [filterName]: value
    });
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon style={{ marginRight: 8 }} />
          <Typography variant="h6">Filters</Typography>
        </div>
        <div>
          <Button
            color="primary"
            onClick={handleToggleAdvancedFilters}
            endIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            style={{ marginRight: 8 }}
            disabled={!showFiltersPanel}
          >
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </Button>
          <Button
            color="primary"
            onClick={handleToggleFiltersPanel}
            endIcon={showFiltersPanel ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showFiltersPanel ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>
      <Collapse in={showFiltersPanel}>
        {/* Basic Filters */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => {
                  if (newValue) setStartDate(newValue);
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  if (newValue) setEndDate(newValue);
                }}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="group-by-label">Group By</InputLabel>
              <Select
                labelId="group-by-label"
                id="group-by"
                value={groupBy}
                label="Group By"
                onChange={handleGroupByChange}
              >
                {groupByOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MultiSelect
              label="Countries"
              options={countriesOptions}
              value={selectedCountries as (string | number)[]}
              onChange={setSelectedCountries}
              placeholder="Select countries"
              loading={countriesLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <MultiSelect
              label="White Labels"
              options={whiteLabelsOptions}
              value={selectedWhiteLabels as (string | number)[]}
              onChange={setSelectedWhiteLabels}
              placeholder="Select white labels"
              loading={whiteLabelsLoading}
            />
          </Grid>
        </Grid>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div style={{ marginTop: 24 }}>
            <Typography variant="subtitle1" gutterBottom>
              Advanced Filters
            </Typography>
            <div>
              {/* We'll implement a simpler version of the advanced filters for now */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Registration Date"
                      value={advancedFilters.registration || null}
                      onChange={(newValue) => {
                        handleAdvancedFilterChange('registration', newValue);
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="First Time Deposit Date"
                      value={advancedFilters.firstTimeDeposit || null}
                      onChange={(newValue) => {
                        handleAdvancedFilterChange('firstTimeDeposit', newValue);
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Trackers"
                    value={advancedFilters.trackers || ''}
                    onChange={(e) => handleAdvancedFilterChange('trackers', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Promotion Code"
                    value={advancedFilters.promotionCode || ''}
                    onChange={(e) => handleAdvancedFilterChange('promotionCode', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Players (comma separated)"
                    value={advancedFilters.players || ''}
                    onChange={(e) => handleAdvancedFilterChange('players', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="sms-enabled-label">SMS Enabled</InputLabel>
                    <Select
                      labelId="sms-enabled-label"
                      id="sms-enabled"
                      value={advancedFilters.smsEnabled || ''}
                      label="SMS Enabled"
                      onChange={(e) => handleAdvancedFilterChange('smsEnabled', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Any</em>
                      </MenuItem>
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="mail-enabled-label">Mail Enabled</InputLabel>
                    <Select
                      labelId="mail-enabled-label"
                      id="mail-enabled"
                      value={advancedFilters.mailEnabled || ''}
                      label="Mail Enabled"
                      onChange={(e) => handleAdvancedFilterChange('mailEnabled', e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Any</em>
                      </MenuItem>
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 24 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleApplyFilters}
            style={{ marginRight: 16 }}
          >
            Apply Filters
          </Button>

          <span>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              disabled={loading || dataLength === 0}
              onClick={handleExport}
            >
              Export
            </Button>
          </span>
        </div>
      </Collapse>

      {/* Compact Action Buttons - Only shown when filters are collapsed */}
      {!showFiltersPanel && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8 }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleApplyFilters}
            style={{ marginRight: 16 }}
          >
            Apply
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            disabled={loading || dataLength === 0}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      )}
    </Paper>
  );
};

export default DailyActionsFilters;
