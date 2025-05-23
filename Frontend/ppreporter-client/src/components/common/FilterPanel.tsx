import React, { useState, useEffect } from 'react';
import {
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Collapse,
  Tooltip,
  Grid,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';
import { CommonProps } from '../../types/common';
import SimpleBox from './SimpleBox';

// Filter type enum
export enum FilterType {
  TEXT = 'text',
  SELECT = 'select',
  DATE = 'date',
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  RANGE = 'range'
}

// Filter option interface
export interface FilterOption {
  value: string | number;
  label: string;
}

// Filter definition interface
export interface FilterDefinition {
  id: string;
  label: string;
  type: FilterType | string;
  options?: FilterOption[];
  defaultValue?: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Component props interface
export interface FilterPanelProps extends CommonProps {
  title?: string;
  filters: FilterDefinition[];
  values: Record<string, any>;
  onChange: (id: string, value: any) => void;
  onApply?: () => void;
  onReset?: () => void;
  onFilterSave?: () => void;
  expanded?: boolean;
  defaultExpanded?: boolean;
}

/**
 * FilterPanel component for filtering data in reports and dashboards
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  title = 'Filters',
  filters = [],
  values = {},
  onChange,
  onApply,
  onReset,
  onFilterSave,
  expanded: controlledExpanded,
  defaultExpanded = true,
  sx
}) => {
  // State for uncontrolled expansion
  const [internalExpanded, setInternalExpanded] = useState<boolean>(defaultExpanded);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  // Get active filters count
  const activeFilters = Object.keys(values).filter(key => {
    const value = values[key];
    return value !== undefined && value !== null && value !== '';
  });

  // Toggle expansion state
  const toggleExpand = (): void => {
    if (!isControlled) {
      setInternalExpanded(!internalExpanded);
    }
  };

  // Handle filter change
  const handleFilterChange = (id: string, value: any): void => {
    if (onChange) {
      onChange(id, value);
    }
  };

  // Handle apply filters
  const handleApplyFilters = (): void => {
    if (onApply) {
      onApply();
    }
  };

  // Handle reset filters
  const handleResetFilters = (): void => {
    if (onReset) {
      onReset();
    }
  };

  // Handle save filters
  const handleSaveFilters = (): void => {
    if (onFilterSave) {
      onFilterSave();
    }
  };

  // Render filter input based on type
  const renderFilterInput = (filter: FilterDefinition): React.ReactNode => {
    const value = values[filter.id] !== undefined ? values[filter.id] : filter.defaultValue || '';

    switch (filter.type) {
      case FilterType.SELECT:
        return (
          <FormControl fullWidth size="small">
            <InputLabel id={`filter-${filter.id}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`filter-${filter.id}-label`}
              id={`filter-${filter.id}`}
              value={value}
              label={filter.label}
              onChange={(e: SelectChangeEvent<any>) => handleFilterChange(filter.id, e.target.value)}
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              {filter.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case FilterType.DATE:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={filter.label}
              value={value || null}
              onChange={(newValue) => handleFilterChange(filter.id, newValue)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        );

      case FilterType.BOOLEAN:
        return (
          <FormControl fullWidth size="small">
            <InputLabel id={`filter-${filter.id}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`filter-${filter.id}-label`}
              id={`filter-${filter.id}`}
              value={value}
              label={filter.label}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            >
              <MenuItem value="">
                <em>Any</em>
              </MenuItem>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        );

      case FilterType.NUMBER:
        return (
          <TextField
            fullWidth
            label={filter.label}
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            size="small"
            inputProps={{
              min: filter.min,
              max: filter.max,
              step: filter.step || 1
            }}
          />
        );

      case FilterType.RANGE:
        // Range filter would be implemented here
        return (
          <SimpleBox sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label={`Min ${filter.label}`}
              type="number"
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, min: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label={`Max ${filter.label}`}
              type="number"
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, max: e.target.value })}
              size="small"
              sx={{ flex: 1 }}
            />
          </SimpleBox>
        );

      // Default to text input
      default:
        return (
          <TextField
            fullWidth
            label={filter.label}
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            size="small"
            placeholder={filter.placeholder}
          />
        );
    }
  };

  return (
    <Paper variant="outlined" sx={{ mb: 2, ...sx }}>
      <SimpleBox sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            {title}
          </Typography>

          {activeFilters.length > 0 && (
            <Chip
              label={`${activeFilters.length} active`}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </SimpleBox>

        <SimpleBox>
          <IconButton onClick={toggleExpand} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </SimpleBox>
      </SimpleBox>

      <Collapse in={expanded}>
        <Divider />

        <SimpleBox sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <Grid item xs={12} sm={6} md={4} key={filter.id}>
                {renderFilterInput(filter)}
              </Grid>
            ))}
          </Grid>

          {activeFilters.length > 0 && (
            <SimpleBox sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Active filters:
              </Typography>

              {activeFilters.map((key) => {
                const filter = filters.find(f => f.id === key);
                let displayValue = values[key];

                if (filter?.type === FilterType.SELECT && filter.options) {
                  const option = filter.options.find(o => o.value === displayValue);
                  displayValue = option ? option.label : displayValue;
                }

                if (filter?.type === FilterType.BOOLEAN) {
                  displayValue = displayValue === 'true' ? 'Yes' : 'No';
                }

                if (filter?.type === FilterType.DATE && displayValue instanceof Date) {
                  displayValue = displayValue.toLocaleDateString();
                }

                return (
                  <Chip
                    key={key}
                    label={`${filter?.label || key}: ${displayValue}`}
                    onDelete={() => handleFilterChange(key, '')}
                    size="small"
                  />
                );
              })}

              <Chip
                label="Clear All"
                onDelete={handleResetFilters}
                deleteIcon={<ClearIcon />}
                size="small"
                color="secondary"
              />
            </SimpleBox>
          )}
        </SimpleBox>

        <Divider />

        <SimpleBox sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={handleResetFilters} startIcon={<ClearIcon />}>
            Reset
          </Button>

          {onFilterSave && (
            <Tooltip title="Save these filters">
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSaveFilters}
                startIcon={<SaveIcon />}
              >
                Save
              </Button>
            </Tooltip>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
            startIcon={<FilterListIcon />}
          >
            Apply Filters
          </Button>
        </SimpleBox>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;
