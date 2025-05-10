import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
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
  Autocomplete,
  SelectChangeEvent
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
import {
  Field,
  Filter,
  FilterPreset,
  FieldType,
  OperatorType,
  Operator,
  FilterValue,
  DateRange,
  FieldOption
} from '../../types/reports';
import { CommonProps } from '../../types/common';

export interface ReportFilterProps extends CommonProps {
  /**
   * Available fields that can be filtered
   */
  fields?: Field[];

  /**
   * Current filter conditions
   */
  filters?: Filter[];

  /**
   * Function called when filters are applied
   */
  onApply?: (filters: Filter[]) => void;

  /**
   * Function called when a filter preset is saved
   */
  onSave?: (preset: FilterPreset) => void;

  /**
   * Function called when filters are cleared
   */
  onClear?: () => void;

  /**
   * List of saved filter presets
   */
  savedPresets?: FilterPreset[];

  /**
   * Function called when a preset is selected
   */
  onPresetSelect?: (preset: FilterPreset) => void;

  /**
   * Whether data is loading
   */
  loading?: boolean;
}

/**
 * Component for creating and managing report filters
 */
const ReportFilter: React.FC<ReportFilterProps> = ({
  fields = [],
  filters = [],
  onApply,
  onSave,
  onClear,
  savedPresets = [],
  onPresetSelect,
  loading = false,
  sx
}) => {
  const [currentFilters, setCurrentFilters] = useState<Filter[]>(filters || []);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [presetMenuAnchorEl, setPresetMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [savePresetName, setSavePresetName] = useState<string>('');
  const [showSavePreset, setShowSavePreset] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Update filters when props change
  useEffect(() => {
    setCurrentFilters(filters);
  }, [filters]);

  // Handle adding a new filter
  const handleAddFilter = (): void => {
    // Find first available field that isn't already filtered
    const usedFieldIds = currentFilters.map(filter => filter.fieldId);
    const availableField = fields.find(field => !usedFieldIds.includes(field.id));

    if (availableField) {
      const newFilter: Filter = {
        id: `filter-${Date.now()}`,
        fieldId: availableField.id,
        operator: getDefaultOperator(availableField.type),
        value: null
      };

      setCurrentFilters([...currentFilters, newFilter]);
    }
  };

  // Handle removing a filter
  const handleRemoveFilter = (filterId: string): void => {
    setCurrentFilters(currentFilters.filter(filter => filter.id !== filterId));
  };

  // Handle field change
  const handleFieldChange = (filterId: string, fieldId: string): void => {
    const updatedFilters = currentFilters.map(filter => {
      if (filter.id === filterId) {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return filter;

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
  const handleOperatorChange = (filterId: string, operator: OperatorType): void => {
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
  const handleValueChange = (filterId: string, value: FilterValue): void => {
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
  const getDefaultOperator = (fieldType: FieldType): OperatorType => {
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
  const getOperatorsForFieldType = (fieldType: FieldType): Operator[] => {
    const commonOperators: Operator[] = [
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
  const renderValueInput = (filter: Filter): React.ReactNode => {
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleValueChange(filter.id, e.target.value ? Number(e.target.value) : null)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleValueChange(filter.id, e.target.value)}
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
                  value={(filter.value as DateRange)?.start ? new Date((filter.value as DateRange).start as Date) : null}
                  onChange={(date: Date | null) => {
                    const currentValue = filter.value as DateRange || {};
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
                  value={(filter.value as DateRange)?.end ? new Date((filter.value as DateRange).end as Date) : null}
                  onChange={(date: Date | null) => {
                    const currentValue = filter.value as DateRange || {};
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
                value={filter.value instanceof Date ? filter.value : null}
                onChange={(date: Date | null) => handleValueChange(filter.id, date)}
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
              value={filter.value === null ? "" : filter.value ? "true" : "false"}
              onChange={(e: SelectChangeEvent<string>) => handleValueChange(filter.id, e.target.value === "true")}
              label="Value"
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </FormControl>
        );

      case 'enum':
        if (['in', 'not_in'].includes(filter.operator)) {
          return (
            <Autocomplete
              multiple
              options={field.options || []}
              getOptionLabel={(option: FieldOption) => option.label}
              value={(filter.value as string[] || []).map(val =>
                field.options?.find(opt => opt.value === val) || { value: val, label: val }
              )}
              onChange={(_, newValue: FieldOption[]) => {
                handleValueChange(filter.id, newValue.map(item => item.value));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Values" size="small" />
              )}
              renderTags={(selected: FieldOption[], getTagProps) =>
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
                value={filter.value ? String(filter.value) : ""}
                onChange={(e: SelectChangeEvent<string>) => handleValueChange(filter.id, e.target.value)}
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleValueChange(filter.id, e.target.value)}
            label="Value"
            size="small"
            fullWidth
          />
        );
    }
  };

  // Handle applying filters
  const handleApplyFilters = (): void => {
    if (onApply) {
      onApply(currentFilters);
    }
  };

  // Handle clearing filters
  const handleClearFilters = (): void => {
    setCurrentFilters([]);
    if (onClear) {
      onClear();
    }
  };

  // Handle preset menu open
  const handlePresetMenuOpen = (event: MouseEvent<HTMLButtonElement>): void => {
    setPresetMenuAnchorEl(event.currentTarget);
  };

  // Handle preset menu close
  const handlePresetMenuClose = (): void => {
    setPresetMenuAnchorEl(null);
  };

  // Handle preset selection
  const handlePresetSelect = (preset: FilterPreset): void => {
    handlePresetMenuClose();
    if (onPresetSelect) {
      onPresetSelect(preset);
    }
  };

  // Handle save preset
  const handleSavePreset = (): void => {
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
  const getFieldLabel = (fieldId: string): string => {
    const field = fields.find(f => f.id === fieldId);
    return field ? field.label : 'Unknown Field';
  };

  // Check if filters are valid
  const areFiltersValid = (): boolean => {
    if (currentFilters.length === 0) return false;

    return currentFilters.every(filter => {
      const field = fields.find(f => f.id === filter.fieldId);
      if (!field) return false;

      if (['is_empty', 'is_not_empty'].includes(filter.operator)) {
        return true;
      }

      if (filter.operator === 'between' && field.type === 'date') {
        const dateRange = filter.value as DateRange;
        return Boolean(dateRange?.start && dateRange?.end);
      }

      if (['in', 'not_in'].includes(filter.operator)) {
        return Array.isArray(filter.value) && (filter.value as string[]).length > 0;
      }

      return filter.value !== null && filter.value !== undefined && filter.value !== '';
    });
  };

  // Count active filters
  const activeFilterCount = currentFilters.length;

  return (
    <Box sx={{ ...sx }}>
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
          <Typography variant="h6" component="h2">
            Filters
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Tooltip title="Filter your data based on specific criteria">
            <IconButton size="small" sx={{ ml: 0.5 }}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box>
          {savedPresets.length > 0 && (
            <Button
              startIcon={<BookmarkIcon />}
              onClick={handlePresetMenuOpen}
              size="small"
              sx={{ mr: 1 }}
            >
              Presets
            </Button>
          )}

          <Menu
            anchorEl={presetMenuAnchorEl}
            open={Boolean(presetMenuAnchorEl)}
            onClose={handlePresetMenuClose}
          >
            {savedPresets.map((preset) => (
              <MenuItem
                key={preset.id || preset.name}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.name}
                {preset.isSystem && (
                  <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                    (System)
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Menu>

          <Button
            startIcon={<SaveIcon />}
            onClick={() => setShowSavePreset(!showSavePreset)}
            size="small"
            disabled={currentFilters.length === 0}
            sx={{ mr: 1 }}
          >
            Save
          </Button>

          <Button
            startIcon={<FilterAltOffIcon />}
            onClick={handleClearFilters}
            size="small"
            disabled={currentFilters.length === 0}
            sx={{ mr: 1 }}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleApplyFilters}
            size="small"
            disabled={!areFiltersValid() || loading}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>

      <Collapse in={showSavePreset}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Save Filter Preset
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <TextField
              label="Preset Name"
              value={savePresetName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSavePresetName(e.target.value)}
              size="small"
              fullWidth
              sx={{ mr: 2 }}
            />

            <Button
              variant="contained"
              onClick={handleSavePreset}
              disabled={!savePresetName.trim() || currentFilters.length === 0}
            >
              Save
            </Button>

            <IconButton onClick={() => setShowSavePreset(false)} sx={{ ml: 1 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {saveError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {saveError}
            </Alert>
          )}
        </Paper>
      </Collapse>

      <Collapse in={showFilters}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            {currentFilters.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography color="text.secondary" gutterBottom>
                  No filters applied
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddFilter}
                  disabled={fields.length === 0}
                >
                  Add Filter
                </Button>
              </Box>
            ) : (
              <>
                <Stack spacing={2}>
                  {currentFilters.map((filter, index) => {
                    const field = fields.find(f => f.id === filter.fieldId);
                    if (!field) return null;

                    return (
                      <Paper
                        key={filter.id}
                        variant="outlined"
                        sx={{ p: 2 }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Field</InputLabel>
                              <Select
                                value={filter.fieldId}
                                onChange={(e: SelectChangeEvent<string>) => handleFieldChange(filter.id, e.target.value)}
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
                            <FormControl fullWidth size="small">
                              <InputLabel>Operator</InputLabel>
                              <Select
                                value={filter.operator}
                                onChange={(e: SelectChangeEvent<string>) => handleOperatorChange(filter.id, e.target.value as OperatorType)}
                                label="Operator"
                              >
                                {getOperatorsForFieldType(field.type).map((op) => (
                                  <MenuItem key={op.value} value={op.value}>
                                    {op.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} sm={5}>
                            {renderValueInput(filter)}
                          </Grid>

                          <Grid item xs={12} sm={1} sx={{ textAlign: 'right' }}>
                            <IconButton
                              onClick={() => handleRemoveFilter(filter.id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    );
                  })}
                </Stack>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddFilter}
                    disabled={fields.length === 0 || fields.length <= currentFilters.length}
                  >
                    Add Filter
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Collapse>
    </Box>
  );
};

export default ReportFilter;
