import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Popover,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { ColumnDef, FilteringConfig } from '../types';

interface QuickFilterProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Quick filter component
 */
export const QuickFilter: React.FC<QuickFilterProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <TextField
      size="small"
      placeholder="Search..."
      value={value}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              edge="end"
              aria-label="clear search"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null
      }}
      sx={{ width: { xs: 120, sm: 200 } }}
    />
  );
};

interface AdvancedFilterProps {
  columns: ColumnDef[];
  filters: Record<string, any>;
  onChange: (filters: Record<string, any>) => void;
}

/**
 * Advanced filter component
 */
export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  columns,
  filters,
  onChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(filters);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setLocalFilters({ ...filters });
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    onChange(localFilters);
    handleClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onChange({});
    handleClose();
  };

  const handleFilterChange = (columnId: string, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [columnId]: value
    }));
  };

  const filterableColumns = columns.filter(col => col.filterable !== false);

  return (
    <>
      <Tooltip title="Advanced filters">
        <IconButton size="small" onClick={handleOpen}>
          <FilterListIcon
            fontSize="small"
            color={Object.keys(filters).length > 0 ? 'primary' : 'inherit'}
          />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            Advanced Filters
          </Typography>

          {filterableColumns.map(column => (
            <Box key={column.id} sx={{ mb: 2 }}>
              <Typography variant="caption">{column.label}</Typography>
              {renderFilterInput(column, localFilters[column.id], value => {
                handleFilterChange(column.id, value);
              })}
            </Box>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button size="small" onClick={handleReset}>
              Reset
            </Button>
            <Button size="small" variant="contained" onClick={handleApply}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

/**
 * Render appropriate filter input based on column type
 */
const renderFilterInput = (
  column: ColumnDef,
  value: any,
  onChange: (value: any) => void
) => {
  switch (column.type) {
    case 'number':
    case 'currency':
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            type="number"
            placeholder="Min"
            value={value?.min || ''}
            onChange={e => {
              const min = e.target.value ? Number(e.target.value) : undefined;
              onChange({ ...value, min });
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            type="number"
            placeholder="Max"
            value={value?.max || ''}
            onChange={e => {
              const max = e.target.value ? Number(e.target.value) : undefined;
              onChange({ ...value, max });
            }}
            sx={{ flex: 1 }}
          />
        </Box>
      );

    case 'text':
    case 'link':
    default:
      return (
        <TextField
          size="small"
          placeholder="Filter..."
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          fullWidth
        />
      );
  }
};

interface FilteringComponentProps {
  columns: ColumnDef[];
  config: FilteringConfig;
  quickFilterValue: string;
  advancedFilters: Record<string, any>;
  onQuickFilterChange: (value: string) => void;
  onAdvancedFiltersChange: (filters: Record<string, any>) => void;
}

/**
 * Main filtering component
 */
const Filtering: React.FC<FilteringComponentProps> = ({
  columns,
  config,
  quickFilterValue,
  advancedFilters,
  onQuickFilterChange,
  onAdvancedFiltersChange
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {config.quickFilter && (
        <QuickFilter value={quickFilterValue} onChange={onQuickFilterChange} />
      )}
      
      {config.advancedFilter && (
        <AdvancedFilter
          columns={columns}
          filters={advancedFilters}
          onChange={onAdvancedFiltersChange}
        />
      )}
    </Box>
  );
};

export default Filtering;
