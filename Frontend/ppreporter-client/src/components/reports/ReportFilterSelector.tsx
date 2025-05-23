import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Chip,
  Divider,
  Alert,
  Stack,
  Card,
  CardContent,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CommonProps } from '../../types/common';
import SimpleBox from '../common/SimpleBox';

// Type definitions
export interface Operator {
  id: string;
  label: string;
}

export interface FilterField {
  id: string;
  name: string;
  type: string;
  operators: Operator[];
  description?: string;
}

export interface FilterValue {
  from?: Date | string | number | null;
  to?: Date | string | number | null;
  [key: string]: any;
}

export interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string | FilterValue | null;
  displayValue: string;
}

export interface DataSource {
  schema?: any[];
  [key: string]: any;
}

export interface ReportFilterSelectorProps extends CommonProps {
  dataSource?: DataSource | null;
  filters?: Filter[];
  onChange?: (filters: Filter[]) => void;
}

/**
 * Component for defining report filters
 */
const ReportFilterSelector: React.FC<ReportFilterSelectorProps> = ({
  dataSource,
  filters = [],
  onChange
}) => {
  const [filterFields, setFilterFields] = useState<FilterField[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Load available filter fields from data source
  useEffect(() => {
    if (dataSource?.schema) {
      // Convert schema to filter fields
      const availableFields = dataSource.schema
        .filter(field => field.filterable !== false)
        .map(field => ({
          id: field.id,
          name: field.name,
          type: field.type,
          operators: getOperatorsForType(field.type),
          description: field.description
        }));

      setFilterFields(availableFields);
    }
  }, [dataSource]);

  // Get appropriate operators based on field type
  const getOperatorsForType = (type: string): Operator[] => {
    switch (type) {
      case 'string':
        return [
          { id: 'equals', label: 'Equals' },
          { id: 'contains', label: 'Contains' },
          { id: 'startsWith', label: 'Starts with' },
          { id: 'endsWith', label: 'Ends with' },
          { id: 'isNull', label: 'Is empty' },
          { id: 'isNotNull', label: 'Is not empty' }
        ];
      case 'number':
        return [
          { id: 'equals', label: 'Equals' },
          { id: 'notEquals', label: 'Not equals' },
          { id: 'greaterThan', label: 'Greater than' },
          { id: 'lessThan', label: 'Less than' },
          { id: 'between', label: 'Between' },
          { id: 'isNull', label: 'Is empty' },
          { id: 'isNotNull', label: 'Is not empty' }
        ];
      case 'date':
      case 'datetime':
        return [
          { id: 'equals', label: 'On' },
          { id: 'before', label: 'Before' },
          { id: 'after', label: 'After' },
          { id: 'between', label: 'Between' },
          { id: 'isNull', label: 'Is empty' },
          { id: 'isNotNull', label: 'Is not empty' }
        ];
      case 'boolean':
        return [
          { id: 'equals', label: 'Is' },
          { id: 'isNull', label: 'Is empty' },
          { id: 'isNotNull', label: 'Is not empty' }
        ];
      default:
        return [
          { id: 'equals', label: 'Equals' },
          { id: 'notEquals', label: 'Not equals' },
          { id: 'isNull', label: 'Is empty' },
          { id: 'isNotNull', label: 'Is not empty' }
        ];
    }
  };

  // Create a new filter
  const handleAddFilter = (): void => {
    if (!onChange) return;

    const newFilter: Filter = {
      id: `filter_${Date.now()}`,
      field: filterFields[0]?.id || '',
      operator: '',
      value: '',
      displayValue: ''
    };

    onChange([...filters, newFilter]);
    setActiveFilter(newFilter.id);
  };

  // Remove a filter
  const handleRemoveFilter = (filterId: string): void => {
    if (!onChange) return;

    const updatedFilters = filters.filter(filter => filter.id !== filterId);
    onChange(updatedFilters);

    if (activeFilter === filterId) {
      setActiveFilter(null);
    }
  };

  // Update a filter
  const handleUpdateFilter = (filterId: string, field: keyof Filter, value: any): void => {
    if (!onChange) return;

    const updatedFilters = filters.map(filter => {
      if (filter.id === filterId) {
        const updatedFilter = { ...filter, [field]: value };

        // If field changed, reset operator and value
        if (field === 'field') {
          const fieldInfo = filterFields.find(f => f.id === value);
          updatedFilter.operator = fieldInfo?.operators[0]?.id || '';
          updatedFilter.value = '';
          updatedFilter.displayValue = '';
        }

        return updatedFilter;
      }
      return filter;
    });

    onChange(updatedFilters);
  };

  // Get field info by id
  const getFieldInfo = (fieldId: string): FilterField => {
    return filterFields.find(field => field.id === fieldId) || { id: '', name: '', type: '', operators: [] };
  };

  // Get operators for a field
  const getOperatorsForField = (fieldId: string): Operator[] => {
    const field = getFieldInfo(fieldId);
    return field.operators || [];
  };

  // Render value input based on field type and operator
  const renderValueInput = (filter: Filter): React.ReactNode => {
    const field = getFieldInfo(filter.field);
    const operator = filter.operator;

    // Some operators don't need value input
    if (operator === 'isNull' || operator === 'isNotNull') {
      return null;
    }

    // Render different inputs based on field type
    switch (field.type) {
      case 'date':
      case 'datetime':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {operator === 'between' ? (
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <DatePicker
                  label="From"
                  value={(filter.value as FilterValue)?.from || null}
                  onChange={(date) => {
                    const newValue = { ...((filter.value as FilterValue) || {}), from: date };
                    handleUpdateFilter(filter.id, 'value', newValue);
                    handleUpdateFilter(filter.id, 'displayValue', `From ${(date as Date)?.toLocaleDateString() || 'any'} to ${((filter.value as FilterValue)?.to as Date)?.toLocaleDateString() || 'any'}`);
                  }}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
                <DatePicker
                  label="To"
                  value={(filter.value as FilterValue)?.to || null}
                  onChange={(date) => {
                    const newValue = { ...((filter.value as FilterValue) || {}), to: date };
                    handleUpdateFilter(filter.id, 'value', newValue);
                    handleUpdateFilter(filter.id, 'displayValue', `From ${((filter.value as FilterValue)?.from as Date)?.toLocaleDateString() || 'any'} to ${(date as Date)?.toLocaleDateString() || 'any'}`);
                  }}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </Stack>
            ) : (
              <SimpleBox sx={{ mt: 2 }}>
                <DatePicker
                  label="Value"
                  value={filter.value as Date | null}
                  onChange={(date) => {
                    handleUpdateFilter(filter.id, 'value', date);
                    handleUpdateFilter(filter.id, 'displayValue', (date as Date)?.toLocaleDateString() || '');
                  }}
                  slotProps={{ textField: { fullWidth: true, size: "small" } }}
                />
              </SimpleBox>
            )}
          </LocalizationProvider>
        );

      case 'number':
        return (
          operator === 'between' ? (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="From"
                type="number"
                value={(filter.value as FilterValue)?.from || ''}
                onChange={(e) => {
                  const newValue = { ...((filter.value as FilterValue) || {}), from: e.target.value };
                  handleUpdateFilter(filter.id, 'value', newValue);
                  handleUpdateFilter(filter.id, 'displayValue', `From ${e.target.value || 'any'} to ${(filter.value as FilterValue)?.to || 'any'}`);
                }}
                fullWidth
                size="small"
              />
              <TextField
                label="To"
                type="number"
                value={(filter.value as FilterValue)?.to || ''}
                onChange={(e) => {
                  const newValue = { ...((filter.value as FilterValue) || {}), to: e.target.value };
                  handleUpdateFilter(filter.id, 'value', newValue);
                  handleUpdateFilter(filter.id, 'displayValue', `From ${(filter.value as FilterValue)?.from || 'any'} to ${e.target.value || 'any'}`);
                }}
                fullWidth
                size="small"
              />
            </Stack>
          ) : (
            <TextField
              label="Value"
              type="number"
              value={filter.value || ''}
              onChange={(e) => {
                handleUpdateFilter(filter.id, 'value', e.target.value);
                handleUpdateFilter(filter.id, 'displayValue', e.target.value);
              }}
              fullWidth
              size="small"
              sx={{ mt: 2 }}
            />
          )
        );

      case 'boolean':
        return (
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel id={`filter-value-${filter.id}-label`}>Value</InputLabel>
            <Select
              labelId={`filter-value-${filter.id}-label`}
              value={filter.value as string || ''}
              onChange={(e) => {
                handleUpdateFilter(filter.id, 'value', e.target.value);
                handleUpdateFilter(filter.id, 'displayValue', e.target.value === 'true' ? 'Yes' : 'No');
              }}
              label="Value"
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        );

      default:
        return (
          <TextField
            label="Value"
            value={filter.value || ''}
            onChange={(e) => {
              handleUpdateFilter(filter.id, 'value', e.target.value);
              handleUpdateFilter(filter.id, 'displayValue', e.target.value);
            }}
            fullWidth
            size="small"
            sx={{ mt: 2 }}
          />
        );
    }
  };

  // Format filter for display
  const formatFilterDisplay = (filter: Filter): string => {
    const field = getFieldInfo(filter.field);
    const operator = getOperatorsForField(filter.field).find(op => op.id === filter.operator)?.label || filter.operator;

    if (filter.operator === 'isNull') {
      return `${field.name} is empty`;
    }

    if (filter.operator === 'isNotNull') {
      return `${field.name} is not empty`;
    }

    return `${field.name} ${operator} ${filter.displayValue}`;
  };

  return (
    <SimpleBox>
      <SimpleBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Define Filters
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddFilter}
          disabled={!dataSource || filterFields.length === 0}
        >
          Add Filter
        </Button>
      </SimpleBox>

      {!dataSource && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please select a data source first.
        </Alert>
      )}

      {dataSource && filterFields.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          The selected data source does not have any filterable fields.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Filter list */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} />
              Applied Filters ({filters.length})
            </Typography>

            <Divider sx={{ my: 1 }} />

            {filters.length === 0 ? (
              <SimpleBox sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No filters applied yet.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Add Filter" to create your first filter.
                </Typography>
              </SimpleBox>
            ) : (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {filters.map((filter) => (
                  <Card
                    key={filter.id}
                    variant="outlined"
                    sx={{
                      borderColor: activeFilter === filter.id ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main'
                      }
                    }}
                    onClick={() => setActiveFilter(filter.id)}
                  >
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          {formatFilterDisplay(filter)}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleRemoveFilter(filter.id);
                          }}
                          aria-label="remove filter"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </SimpleBox>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Filter editor */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            {activeFilter ? (
              <SimpleBox>
                <Typography variant="subtitle1" gutterBottom>
                  Edit Filter
                </Typography>

                <Grid container spacing={2}>
                  {/* Field */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`filter-field-${activeFilter}-label`}>Field</InputLabel>
                      <Select
                        labelId={`filter-field-${activeFilter}-label`}
                        value={filters.find(f => f.id === activeFilter)?.field || ''}
                        onChange={(e) => handleUpdateFilter(activeFilter, 'field', e.target.value)}
                        label="Field"
                      >
                        {filterFields.map((field) => (
                          <MenuItem key={field.id} value={field.id}>
                            <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
                              {field.name}
                              {field.description && (
                                <Tooltip title={field.description} arrow>
                                  <InfoOutlinedIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                                </Tooltip>
                              )}
                            </SimpleBox>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Operator */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`filter-operator-${activeFilter}-label`}>Operator</InputLabel>
                      <Select
                        labelId={`filter-operator-${activeFilter}-label`}
                        value={filters.find(f => f.id === activeFilter)?.operator || ''}
                        onChange={(e) => handleUpdateFilter(activeFilter, 'operator', e.target.value)}
                        label="Operator"
                      >
                        {getOperatorsForField(filters.find(f => f.id === activeFilter)?.field || '').map((operator) => (
                          <MenuItem key={operator.id} value={operator.id}>
                            {operator.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Value */}
                  {filters.find(f => f.id === activeFilter)?.operator && (
                    <Grid item xs={12}>
                      {renderValueInput(filters.find(f => f.id === activeFilter) as Filter)}
                    </Grid>
                  )}
                </Grid>
              </SimpleBox>
            ) : (
              <SimpleBox sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Select a filter to edit or create a new one.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddFilter}
                  disabled={!dataSource || filterFields.length === 0}
                >
                  Add Filter
                </Button>
              </SimpleBox>
            )}
          </Paper>
        </Grid>
      </Grid>
    </SimpleBox>
  );
};

export default ReportFilterSelector;
