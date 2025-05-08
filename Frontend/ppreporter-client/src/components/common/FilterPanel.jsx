import React, { useState } from 'react';
import {
  Box,
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
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SaveIcon from '@mui/icons-material/Save';

/**
 * Reusable filter panel component for filtering data based on various criteria
 * @param {Object} props - Component props
 * @param {Array} props.filters - Array of filter configurations
 * @param {Object} props.filterValues - Current filter values
 * @param {Function} props.onFilterChange - Function to call when filters change
 * @param {Function} props.onFilterApply - Function to call when filters are applied
 * @param {Function} props.onFilterReset - Function to call when filters are reset
 * @param {Function} props.onFilterSave - Function to call when filters are saved
 * @param {string} props.title - Title of the filter panel
 */
const FilterPanel = ({
  filters = [],
  filterValues = {},
  onFilterChange,
  onFilterApply,
  onFilterReset,
  onFilterSave,
  title = "Filters",
}) => {
  const [expanded, setExpanded] = useState(true);
  const [localFilterValues, setLocalFilterValues] = useState(filterValues);
  const [activeFilters, setActiveFilters] = useState(
    Object.entries(filterValues)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, _]) => key)
  );

  // Toggle panel expansion
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Handle filter change locally
  const handleFilterChange = (filterId, value) => {
    setLocalFilterValues((prev) => ({
      ...prev,
      [filterId]: value,
    }));

    if (onFilterChange) {
      onFilterChange(filterId, value);
    }
  };

  // Apply all filters
  const handleApplyFilters = () => {
    // Update active filters
    const newActiveFilters = Object.entries(localFilterValues)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, _]) => key);
    
    setActiveFilters(newActiveFilters);

    if (onFilterApply) {
      onFilterApply(localFilterValues);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    const emptyValues = {};
    filters.forEach((filter) => {
      emptyValues[filter.id] = '';
    });

    setLocalFilterValues(emptyValues);
    setActiveFilters([]);

    if (onFilterReset) {
      onFilterReset();
    }
  };

  // Remove a single filter
  const handleRemoveFilter = (filterId) => {
    setLocalFilterValues((prev) => ({
      ...prev,
      [filterId]: '',
    }));

    setActiveFilters(activeFilters.filter((id) => id !== filterId));

    if (onFilterChange) {
      onFilterChange(filterId, '');
    }
  };

  // Save current filters
  const handleSaveFilters = () => {
    if (onFilterSave) {
      onFilterSave(localFilterValues);
    }
  };

  // Render filter input based on filter type
  const renderFilterInput = (filter) => {
    const value = localFilterValues[filter.id] || '';

    switch (filter.type) {
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel id={`filter-${filter.id}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`filter-${filter.id}-label`}
              id={`filter-${filter.id}`}
              value={value}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              label={filter.label}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'multiselect':
        return (
          <FormControl fullWidth size="small">
            <InputLabel id={`filter-${filter.id}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`filter-${filter.id}-label`}
              id={`filter-${filter.id}`}
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              label={filter.label}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const option = filter.options.find((opt) => opt.value === value);
                    return (
                      <Chip 
                        key={value} 
                        label={option ? option.label : value} 
                        size="small" 
                      />
                    );
                  })}
                </Box>
              )}
            >
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
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

      case 'daterange':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={`${filter.label} From`}
                value={value.from || null}
                onChange={(newValue) => handleFilterChange(filter.id, { ...value, from: newValue })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label={`${filter.label} To`}
                value={value.to || null}
                onChange={(newValue) => handleFilterChange(filter.id, { ...value, to: newValue })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
        );

      case 'number':
        return (
          <TextField
            fullWidth
            label={filter.label}
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case 'numberrange':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label={`Min ${filter.label}`}
              type="number"
              value={value.min || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, min: e.target.value })}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label={`Max ${filter.label}`}
              type="number"
              value={value.max || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, max: e.target.value })}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
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
          />
        );
    }
  };

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
        </Box>
        
        <Box>
          <IconButton onClick={toggleExpand} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {filters.map((filter) => (
              <Grid item xs={12} sm={6} md={4} key={filter.id}>
                {renderFilterInput(filter)}
              </Grid>
            ))}
          </Grid>
          
          {activeFilters.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilters.map((filterId) => {
                const filter = filters.find((f) => f.id === filterId);
                if (!filter) return null;
                
                const value = localFilterValues[filterId];
                let chipLabel = `${filter.label}: `;
                
                if (filter.type === 'select') {
                  const option = filter.options.find((opt) => opt.value === value);
                  chipLabel += option ? option.label : value;
                } else if (filter.type === 'multiselect' && Array.isArray(value)) {
                  chipLabel += `${value.length} selected`;
                } else if (filter.type === 'daterange') {
                  chipLabel += `${value.from ? new Date(value.from).toLocaleDateString() : 'Any'} - ${value.to ? new Date(value.to).toLocaleDateString() : 'Any'}`;
                } else if (filter.type === 'numberrange') {
                  chipLabel += `${value.min || 'Any'} - ${value.max || 'Any'}`;
                } else {
                  chipLabel += value;
                }
                
                return (
                  <Chip
                    key={filterId}
                    label={chipLabel}
                    onDelete={() => handleRemoveFilter(filterId)}
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
            </Box>
          )}
        </Box>
        
        <Divider />
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;