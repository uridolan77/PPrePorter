import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Chip,
  Grid,
  Card,
  CardContent,
  Alert,
  Tooltip,
  Stack,
  Collapse,
  Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

/**
 * Component for creating and managing report filters
 * @param {Object} props - Component props
 * @param {Array} props.fields - Available fields that can be filtered
 * @param {Array} props.filters - Current filter conditions
 * @param {Function} props.onApply - Function called when filters are applied
 * @param {Function} props.onSave - Function called when a filter preset is saved
 * @param {Function} props.onClear - Function called when filters are cleared
 * @param {Array} props.savedPresets - List of saved filter presets
 * @param {Function} props.onPresetSelect - Function called when a preset is selected
 * @param {boolean} props.loading - Whether data is loading
 */
const ReportFilter = ({
  fields = [],
  filters = [],
  onApply,
  onSave,
  onClear,
  savedPresets = [],
  onPresetSelect,
  loading = false
}) => {
  const [currentFilters, setCurrentFilters] = useState(filters || []);
  const [showFilters, setShowFilters] = useState(true);
  const [presetMenuAnchorEl, setPresetMenuAnchorEl] = useState(null);
  const [savePresetName, setSavePresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Update filters when props change
  useEffect(() => {
    setCurrentFilters(filters);
  }, [filters]);
  
  // Handle adding a new filter
  const handleAddFilter = () => {
    // Find first available field that isn't already filtered
    const usedFieldIds = currentFilters.map(filter => filter.fieldId);
    const availableField = fields.find(field => !usedFieldIds.includes(field.id));
    
    if (availableField) {
      const newFilter = {
        id: `filter-${Date.now()}`,
        fieldId: availableField.id,
        operator: getDefaultOperator(availableField.type),
        value: null
      };
      
      setCurrentFilters([...currentFilters, newFilter]);
    }
  };
  
  // Handle removing a filter
  const handleRemoveFilter = (filterId) => {
    setCurrentFilters(currentFilters.filter(filter => filter.id !== filterId));
  };
  
  // Handle field change
  const handleFieldChange = (filterId, fieldId) => {
    const updatedFilters = currentFilters.map(filter => {
      if (filter.id === filterId) {
        const field = fields.find(f => f.id === fieldId);
        return {
          ...filter,
          fieldId,
          operator: getDefaultOperator(field.type),
          value: null
        };
      }
      return filter;
    });
    
    setCurrentFilters(updatedFilters);
  };
  
  // Handle operator change
  const handleOperatorChange = (filterId, operator) => {
    const updatedFilters = currentFilters.map(filter => {
      if (filter.id === filterId) {
        return {
          ...filter,
          operator,
          // Reset value for certain operators
          value: ['is_empty', 'is_not_empty'].includes(operator) ? null : filter.value
        };
      }
      return filter;
    });
    
    setCurrentFilters(updatedFilters);
  };
  
  // Handle value change
  const handleValueChange = (filterId, value) => {
    const updatedFilters = currentFilters.map(filter => {
      if (filter.id === filterId) {
        return {
          ...filter,
          value
        };
      }
      return filter;
    });
    
    setCurrentFilters(updatedFilters);
  };
  
  // Get default operator based on field type
  const getDefaultOperator = (fieldType) => {
    switch (fieldType) {
      case 'number':
        return 'equals';
      case 'string':
        return 'contains';
      case 'date':
        return 'equals';
      case 'boolean':
        return 'equals';
      case 'enum':
        return 'equals';
      default:
        return 'equals';
    }
  };
  
  // Get available operators based on field type
  const getOperatorsForFieldType = (fieldType) => {
    const commonOperators = [
      { value: 'is_empty', label: 'Is Empty' },
      { value: 'is_not_empty', label: 'Is Not Empty' }
    ];
    
    switch (fieldType) {
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'greater_than', label: 'Greater Than' },
          { value: 'less_than', label: 'Less Than' },
          { value: 'greater_than_or_equals', label: 'Greater Than or Equals' },
          { value: 'less_than_or_equals', label: 'Less Than or Equals' },
          ...commonOperators
        ];
      
      case 'string':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'not_contains', label: 'Does Not Contain' },
          { value: 'starts_with', label: 'Starts With' },
          { value: 'ends_with', label: 'Ends With' },
          ...commonOperators
        ];
      
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'between', label: 'Between' },
          ...commonOperators
        ];
      
      case 'boolean':
        return [
          { value: 'equals', label: 'Equals' },
          ...commonOperators
        ];
      
      case 'enum':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          { value: 'in', label: 'In' },
          { value: 'not_in', label: 'Not In' },
          ...commonOperators
        ];
      
      default:
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'not_equals', label: 'Not Equals' },
          ...commonOperators
        ];
    }
  };
  
  // Render value input based on field type and operator
  const renderValueInput = (filter) => {
    const field = fields.find(f => f.id === filter.fieldId);
    
    if (!field) return null;
    
    // No input for empty/not empty operators
    if (['is_empty', 'is_not_empty'].includes(filter.operator)) {
      return null;
    }
    
    switch (field.type) {
      case 'number':
        return (
          <TextField
            value={filter.value || ''}
            onChange={(e) => handleValueChange(filter.id, e.target.value)}
            label="Value"
            type="number"
            size="small"
            fullWidth
          />
        );
      
      case 'string':
        return (
          <TextField
            value={filter.value || ''}
            onChange={(e) => handleValueChange(filter.id, e.target.value)}
            label="Value"
            size="small"
            fullWidth
          />
        );
      
      case 'date':
        if (filter.operator === 'between') {
          return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={filter.value?.start ? new Date(filter.value.start) : null}
                  onChange={(date) => {
                    const currentValue = filter.value || {};
                    handleValueChange(filter.id, {
                      ...currentValue,
                      start: date
                    });
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={filter.value?.end ? new Date(filter.value.end) : null}
                  onChange={(date) => {
                    const currentValue = filter.value || {};
                    handleValueChange(filter.id, {
                      ...currentValue,
                      end: date
                    });
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>
          );
        } else {
          return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Value"
                value={filter.value ? new Date(filter.value) : null}
                onChange={(date) => handleValueChange(filter.id, date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true
                  }
                }}
              />
            </LocalizationProvider>
          );
        }
      
      case 'boolean':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>Value</InputLabel>
            <Select
              value={filter.value === null ? "" : filter.value}
              onChange={(e) => handleValueChange(filter.id, e.target.value)}
              label="Value"
            >
              <MenuItem value={true}>True</MenuItem>
              <MenuItem value={false}>False</MenuItem>
            </Select>
          </FormControl>
        );
      
      case 'enum':
        if (['in', 'not_in'].includes(filter.operator)) {
          return (
            <Autocomplete
              multiple
              options={field.options || []}
              getOptionLabel={(option) => option.label}
              value={(filter.value || []).map(val => 
                field.options.find(opt => opt.value === val) || { value: val, label: val }
              )}
              onChange={(_, newValue) => {
                handleValueChange(filter.id, newValue.map(item => item.value));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Values" size="small" />
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    label={option.label}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          );
        } else {
          return (
            <FormControl fullWidth size="small">
              <InputLabel>Value</InputLabel>
              <Select
                value={filter.value || ""}
                onChange={(e) => handleValueChange(filter.id, e.target.value)}
                label="Value"
              >
                {field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }
      
      default:
        return (
          <TextField
            value={filter.value || ''}
            onChange={(e) => handleValueChange(filter.id, e.target.value)}
            label="Value"
            size="small"
            fullWidth
          />
        );
    }
  };
  
  // Handle applying filters
  const handleApplyFilters = () => {
    if (onApply) {
      onApply(currentFilters);
    }
  };
  
  // Handle clearing filters
  const handleClearFilters = () => {
    setCurrentFilters([]);
    if (onClear) {
      onClear();
    }
  };
  
  // Handle preset menu open
  const handlePresetMenuOpen = (event) => {
    setPresetMenuAnchorEl(event.currentTarget);
  };
  
  // Handle preset menu close
  const handlePresetMenuClose = () => {
    setPresetMenuAnchorEl(null);
  };
  
  // Handle preset selection
  const handlePresetSelect = (preset) => {
    handlePresetMenuClose();
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };
  
  // Handle save preset
  const handleSavePreset = () => {
    if (!savePresetName.trim()) {
      setSaveError('Please enter a name for this preset');
      return;
    }
    
    if (currentFilters.length === 0) {
      setSaveError('Cannot save an empty filter preset');
      return;
    }
    
    if (onSave) {
      onSave({
        name: savePresetName,
        filters: currentFilters
      });
    }
    
    setShowSavePreset(false);
    setSavePresetName('');
    setSaveError(null);
  };
  
  // Get field label
  const getFieldLabel = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    return field ? field.label : 'Unknown Field';
  };
  
  // Check if filters are valid
  const areFiltersValid = () => {
    if (currentFilters.length === 0) return false;
    
    return currentFilters.every(filter => {
      const field = fields.find(f => f.id === filter.fieldId);
      if (!field) return false;
      
      if (['is_empty', 'is_not_empty'].includes(filter.operator)) {
        return true;
      }
      
      if (filter.operator === 'between' && field.type === 'date') {
        return filter.value?.start && filter.value?.end;
      }
      
      if (['in', 'not_in'].includes(filter.operator)) {
        return Array.isArray(filter.value) && filter.value.length > 0;
      }
      
      return filter.value !== null && filter.value !== undefined && filter.value !== '';
    });
  };
  
  // Count active filters
  const activeFilterCount = currentFilters.length;
  
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => setShowFilters(!showFilters)} 
            size="small"
            color="primary"
            sx={{ mr: 1 }}
          >
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          
          <Typography variant="subtitle1" component="h3">
            Filters
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </Typography>
        </Box>
        
        <Box>
          {currentFilters.length > 0 && (
            <Tooltip title="Clear all filters">
              <IconButton
                size="small"
                onClick={handleClearFilters}
                sx={{ mr: 1 }}
              >
                <FilterAltOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {savedPresets.length > 0 && (
            <Tooltip title="Load saved filter preset">
              <IconButton
                size="small"
                onClick={handlePresetMenuOpen}
                sx={{ mr: 1 }}
              >
                <BookmarkIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {currentFilters.length > 0 && (
            <Tooltip title="Save as preset">
              <IconButton
                size="small"
                onClick={() => setShowSavePreset(true)}
                sx={{ mr: 1 }}
              >
                <SaveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterListIcon />}
            onClick={handleApplyFilters}
            disabled={!areFiltersValid() || loading}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
      
      <Collapse in={showFilters}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          {currentFilters.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary" paragraph>
                No filters applied. Add filters to narrow down your report data.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddFilter}
              >
                Add Filter
              </Button>
            </Box>
          ) : (
            <>
              <Stack spacing={2}>
                {currentFilters.map((filter, index) => {
                  const field = fields.find(f => f.id === filter.fieldId);
                  
                  return (
                    <Card 
                      key={filter.id} 
                      variant="outlined"
                      sx={{ 
                        borderColor: 'divider',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 1
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, pb: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Field</InputLabel>
                                <Select
                                  value={filter.fieldId}
                                  onChange={(e) => handleFieldChange(filter.id, e.target.value)}
                                  label="Field"
                                >
                                  {fields.map((field) => (
                                    <MenuItem key={field.id} value={field.id}>
                                      {field.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={3}>
                              {field && (
                                <FormControl fullWidth size="small">
                                  <InputLabel>Operator</InputLabel>
                                  <Select
                                    value={filter.operator}
                                    onChange={(e) => handleOperatorChange(filter.id, e.target.value)}
                                    label="Operator"
                                  >
                                    {getOperatorsForFieldType(field.type).map((operator) => (
                                      <MenuItem key={operator.value} value={operator.value}>
                                        {operator.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </Grid>
                            
                            <Grid item xs={12} sm={5}>
                              {field && renderValueInput(filter)}
                            </Grid>
                            
                            <Grid item xs={12} sm={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFilter(filter.id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddFilter}
                  disabled={fields.length <= currentFilters.length}
                  size="small"
                >
                  Add Filter
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Collapse>
      
      {/* Save Preset Form */}
      <Collapse in={showSavePreset}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2">Save Filter Preset</Typography>
            <IconButton size="small" onClick={() => setShowSavePreset(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <TextField
            label="Preset Name"
            value={savePresetName}
            onChange={(e) => setSavePresetName(e.target.value)}
            fullWidth
            size="small"
            margin="normal"
            placeholder="e.g., Last Month Sales"
            error={!!saveError}
            helperText={saveError}
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setShowSavePreset(false);
                setSaveError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSavePreset}
              disabled={!savePresetName || currentFilters.length === 0}
            >
              Save Preset
            </Button>
          </Box>
        </Paper>
      </Collapse>
      
      {/* Active Filter Summary */}
      {currentFilters.length > 0 && !showFilters && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentFilters.map((filter) => {
              const field = fields.find(f => f.id === filter.fieldId);
              if (!field) return null;
              
              const operator = getOperatorsForFieldType(field.type).find(
                op => op.value === filter.operator
              );
              
              let valueDisplay = '';
              
              if (['is_empty', 'is_not_empty'].includes(filter.operator)) {
                valueDisplay = '';
              } else if (filter.operator === 'between' && field.type === 'date') {
                valueDisplay = filter.value?.start && filter.value?.end
                  ? `${new Date(filter.value.start).toLocaleDateString()} - ${new Date(filter.value.end).toLocaleDateString()}`
                  : '';
              } else if (['in', 'not_in'].includes(filter.operator)) {
                valueDisplay = Array.isArray(filter.value) && filter.value.length > 0
                  ? `[${filter.value.join(', ')}]`
                  : '';
              } else if (field.type === 'date' && filter.value) {
                valueDisplay = new Date(filter.value).toLocaleDateString();
              } else if (field.type === 'boolean') {
                valueDisplay = filter.value === true ? 'True' : 'False';
              } else if (field.type === 'enum' && filter.value) {
                const option = field.options?.find(opt => opt.value === filter.value);
                valueDisplay = option ? option.label : filter.value;
              } else {
                valueDisplay = filter.value;
              }
              
              return (
                <Chip
                  key={filter.id}
                  label={`${field.label} ${operator?.label || ''} ${valueDisplay}`}
                  onDelete={() => handleRemoveFilter(filter.id)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              );
            })}
          </Box>
        </Box>
      )}
      
      {/* Saved Presets Menu */}
      <Menu
        anchorEl={presetMenuAnchorEl}
        open={Boolean(presetMenuAnchorEl)}
        onClose={handlePresetMenuClose}
      >
        {savedPresets.map((preset) => (
          <MenuItem key={preset.id} onClick={() => handlePresetSelect(preset)}>
            <BookmarkIcon fontSize="small" sx={{ mr: 1 }} />
            {preset.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default ReportFilter;