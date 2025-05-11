import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  IconButton,
  SelectChangeEvent,
  Autocomplete,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

// Define filter option types
export type FilterOption = {
  value: string;
  label: string;
};

export type FilterValue = string | string[] | Date | null;

export interface FilterConfig {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange';
  options?: FilterOption[];
  defaultValue?: FilterValue;
}

export interface FilterValues {
  [key: string]: FilterValue;
}

export interface FilterPanelProps {
  filters: FilterConfig[];
  onFilterChange?: (filters: FilterValues) => void;
  onApplyFilters?: (filters: FilterValues) => void;
  onResetFilters?: () => void;
  initialValues?: FilterValues;
  title?: string;
  showApplyButton?: boolean;
  showResetButton?: boolean;
  compact?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  initialValues = {},
  title = 'Filters',
  showApplyButton = true,
  showResetButton = true,
  compact = false
}) => {
  const [filterValues, setFilterValues] = useState<FilterValues>(initialValues);

  useEffect(() => {
    // Initialize with default values if not provided in initialValues
    const defaultValues: FilterValues = {};
    filters.forEach(filter => {
      if (filter.defaultValue !== undefined && initialValues[filter.id] === undefined) {
        defaultValues[filter.id] = filter.defaultValue;
      }
    });

    if (Object.keys(defaultValues).length > 0) {
      setFilterValues(prev => ({ ...prev, ...defaultValues }));
    }
  }, [filters, initialValues]);

  const handleFilterChange = (id: string, value: FilterValue) => {
    const newValues = { ...filterValues, [id]: value };
    setFilterValues(newValues);

    if (onFilterChange) {
      onFilterChange(newValues);
    }
  };

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters(filterValues);
    }
  };

  const handleResetFilters = () => {
    // Reset to default values
    const defaultValues: FilterValues = {};
    filters.forEach(filter => {
      if (filter.defaultValue !== undefined) {
        defaultValues[filter.id] = filter.defaultValue;
      } else {
        defaultValues[filter.id] = filter.type === 'multiselect' ? [] : '';
      }
    });

    setFilterValues(defaultValues);

    if (onResetFilters) {
      onResetFilters();
    }
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = filterValues[filter.id] !== undefined ? filterValues[filter.id] : '';

    switch (filter.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            size="small"
            value={value as string}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            InputProps={{
              endAdornment: value ? (
                <IconButton
                  size="small"
                  onClick={() => handleFilterChange(filter.id, '')}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : (
                <SearchIcon color="action" fontSize="small" />
              ),
            }}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={value as string}
              onChange={(e: SelectChangeEvent<string>) => handleFilterChange(filter.id, e.target.value)}
              label={filter.label}
            >
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <Autocomplete
            multiple
            size="small"
            options={filter.options || []}
            getOptionLabel={(option) => {
              if (typeof option === 'string') {
                return filter.options?.find(o => o.value === option)?.label || option;
              }
              return option.label;
            }}
            value={((value as string[]) || []).map(v =>
              typeof v === 'string'
                ? { value: v, label: filter.options?.find(o => o.value === v)?.label || v }
                : v
            )}
            onChange={(_, newValue) => {
              handleFilterChange(
                filter.id,
                newValue.map(v => typeof v === 'string' ? v : v.value)
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label={filter.label} />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => {
                const label = typeof option === 'string'
                  ? filter.options?.find(o => o.value === option)?.label || option
                  : option.label;
                return (
                  <Chip
                    label={label}
                    size="small"
                    {...getTagProps({ index })}
                  />
                );
              })
            }
          />
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={value as Date}
              onChange={(date) => handleFilterChange(filter.id, date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  InputProps: {
                    endAdornment: (
                      <CalendarTodayIcon color="action" fontSize="small" />
                    ),
                  },
                },
              }}
            />
          </LocalizationProvider>
        );

      case 'daterange':
        // For daterange, we expect value to be an array of two dates
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={value as Date}
              onChange={(date) => handleFilterChange(filter.id, date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  InputProps: {
                    endAdornment: (
                      <CalendarTodayIcon color="action" fontSize="small" />
                    ),
                  },
                },
              }}
            />
          </LocalizationProvider>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      {title && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {filters.map((filter) => (
          <Grid item xs={12} sm={compact ? 6 : 4} md={compact ? 4 : 3} key={filter.id}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {filter.label}
              </Typography>
            </Box>
            {renderFilterInput(filter)}
          </Grid>
        ))}
      </Grid>

      {(showApplyButton || showResetButton) && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {showResetButton && (
              <Button
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
            )}
            {showApplyButton && (
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                startIcon={<FilterListIcon />}
              >
                Apply Filters
              </Button>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default FilterPanel;
