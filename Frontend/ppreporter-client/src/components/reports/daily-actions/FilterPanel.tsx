import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  IconButton,
  Divider,
  SelectChangeEvent,
  Tooltip,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ClearIcon from '@mui/icons-material/Clear';
import { subDays } from 'date-fns';
import { AdvancedFilters, GroupByOption } from '../../../types/reports';
import CardAccent from '../../common/CardAccent';
import MultiSelect, { MultiSelectOption } from '../../common/MultiSelect';

interface FilterPanelProps {
  startDate: Date;
  endDate: Date;
  groupBy: GroupByOption;
  advancedFilters: AdvancedFilters;
  showAdvancedFilters: boolean;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onGroupByChange: (event: SelectChangeEvent<string>) => void;
  onAdvancedFiltersChange: (filters: AdvancedFilters) => void;
  onToggleAdvancedFilters: () => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isLoading: boolean;
}

// Mock data for countries
const countryOptions: MultiSelectOption[] = [
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'SE', label: 'Sweden' }
];

// Mock data for labels
const labelOptions: MultiSelectOption[] = [
  { value: '1', label: 'Casino Royale' },
  { value: '2', label: 'Lucky Star' },
  { value: '3', label: 'Golden Palace' },
  { value: '4', label: 'Diamond Club' },
  { value: '5', label: 'Silver Sands' }
];

const FilterPanel: React.FC<FilterPanelProps> = ({
  startDate,
  endDate,
  groupBy,
  advancedFilters,
  showAdvancedFilters,
  onStartDateChange,
  onEndDateChange,
  onGroupByChange,
  onAdvancedFiltersChange,
  onToggleAdvancedFilters,
  onApplyFilters,
  onResetFilters,
  isLoading
}) => {
  const theme = useTheme();

  // Handle advanced filter changes
  const handleAdvancedFilterChange = (field: keyof AdvancedFilters, value: any) => {
    onAdvancedFiltersChange({
      ...advancedFilters,
      [field]: value
    });
  };

  // Handle clearing a specific filter
  const handleClearFilter = (field: keyof AdvancedFilters) => {
    const newFilters = { ...advancedFilters };
    delete newFilters[field];
    onAdvancedFiltersChange(newFilters);
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (field: keyof AdvancedFilters, value: (string | number)[]) => {
    handleAdvancedFilterChange(field, value);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
        borderRadius: 2
      }}
    >
      <CardAccent position="left" variant="blue" />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Filters
        </Typography>
        <Button
          startIcon={showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={onToggleAdvancedFilters}
          color="primary"
        >
          {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={onStartDateChange}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={onEndDateChange}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="group-by-label">Group By</InputLabel>
            <Select
              labelId="group-by-label"
              id="group-by"
              value={groupBy}
              label="Group By"
              onChange={onGroupByChange}
            >
              <MenuItem value="Day">Day</MenuItem>
              <MenuItem value="Month">Month</MenuItem>
              <MenuItem value="Year">Year</MenuItem>
              <MenuItem value="Country">Country</MenuItem>
              <MenuItem value="Platform">Platform</MenuItem>
              <MenuItem value="Game">Game</MenuItem>
              <MenuItem value="Currency">Currency</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Multi-select filters in normal section */}
        <Grid item xs={12} sm={6}>
          <MultiSelect
            label="Countries"
            options={countryOptions}
            value={advancedFilters.countries || []}
            onChange={(value) => handleMultiSelectChange('countries', value)}
            placeholder="Select countries"
            searchable
            showSelectAllOption
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MultiSelect
            label="Labels"
            options={labelOptions}
            value={advancedFilters.labels || []}
            onChange={(value) => handleMultiSelectChange('labels', value)}
            placeholder="Select labels"
            searchable
            showSelectAllOption
            size="small"
          />
        </Grid>
      </Grid>

      <Collapse in={showAdvancedFilters}>
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Advanced Filters
          </Typography>

          <Grid container spacing={2}>
            {/* Date filters */}
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Registration Date"
                  value={advancedFilters.registration || null}
                  onChange={(date) => handleAdvancedFilterChange('registration', date)}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="First Deposit Date"
                  value={advancedFilters.firstTimeDeposit || null}
                  onChange={(date) => handleAdvancedFilterChange('firstTimeDeposit', date)}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Deposit Date"
                  value={advancedFilters.lastDepositDate || null}
                  onChange={(date) => handleAdvancedFilterChange('lastDepositDate', date)}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Last Login Date"
                  value={advancedFilters.lastLogin || null}
                  onChange={(date) => handleAdvancedFilterChange('lastLogin', date)}
                  slotProps={{ textField: { fullWidth: true, variant: 'outlined', size: 'small' } }}
                />
              </LocalizationProvider>
            </Grid>

            {/* String filters */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Trackers"
                variant="outlined"
                size="small"
                value={advancedFilters.trackers || ''}
                onChange={(e) => handleAdvancedFilterChange('trackers', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Platform"
                variant="outlined"
                size="small"
                value={advancedFilters.platform || ''}
                onChange={(e) => handleAdvancedFilterChange('platform', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Game"
                variant="outlined"
                size="small"
                value={advancedFilters.game || ''}
                onChange={(e) => handleAdvancedFilterChange('game', e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Active filters */}
          {Object.keys(advancedFilters).length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(advancedFilters).map(([key, value]) => {
                  // Skip rendering if value is empty
                  if (!value || (Array.isArray(value) && value.length === 0)) {
                    return null;
                  }

                  // Handle different types of values
                  let displayValue: string;

                  if (value instanceof Date) {
                    displayValue = value.toLocaleDateString();
                  } else if (Array.isArray(value)) {
                    // For multi-select values, show count
                    if (key === 'countries') {
                      displayValue = `${value.length} selected`;
                    } else if (key === 'labels') {
                      displayValue = `${value.length} selected`;
                    } else {
                      displayValue = `${value.length} items`;
                    }
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <Chip
                      key={key}
                      label={`${key}: ${displayValue}`}
                      onDelete={() => handleClearFilter(key as keyof AdvancedFilters)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </Collapse>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onResetFilters}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          onClick={onApplyFilters}
          disabled={isLoading}
          startIcon={<FilterListIcon />}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterPanel;
