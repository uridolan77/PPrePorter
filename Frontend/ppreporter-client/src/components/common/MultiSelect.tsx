import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
  Checkbox,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  Button,
  FormHelperText,
  Tooltip,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CommonProps } from '../../types/common';

// Option interface for select items
export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  description?: string;
}

// Props interface for the MultiSelect component
export interface MultiSelectProps extends CommonProps {
  /**
   * Array of options to display in the select
   */
  options: MultiSelectOption[];

  /**
   * Currently selected values
   */
  value: (string | number)[];

  /**
   * Callback fired when the value changes
   */
  onChange: (value: (string | number)[]) => void;

  /**
   * Label for the select
   */
  label?: string;

  /**
   * Placeholder text when no options are selected
   */
  placeholder?: string;

  /**
   * Whether the component is disabled
   */
  disabled?: boolean;

  /**
   * Whether the component is required
   */
  required?: boolean;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below the select
   */
  helperText?: string;

  /**
   * Maximum height of the dropdown menu in pixels
   */
  maxMenuHeight?: number;

  /**
   * Whether to show a search input in the dropdown
   */
  searchable?: boolean;

  /**
   * Whether to show select all/none options
   */
  showSelectAllOption?: boolean;

  /**
   * Custom render function for the selected values
   */
  renderValue?: (selected: (string | number)[]) => React.ReactNode;

  /**
   * Size of the select component
   */
  size?: 'small' | 'medium';

  /**
   * Width of the component
   */
  width?: string | number;

  /**
   * Custom ID for the component
   */
  id?: string;

  /**
   * Custom name for the component
   */
  name?: string;
}

/**
 * MultiSelect component
 *
 * A reusable multi-select dropdown component with search functionality,
 * select all option, and chip display for selected values.
 */
const MultiSelect: React.FC<MultiSelectProps> = ({
  options = [],
  value = [],
  onChange,
  label = '',
  placeholder = 'Select items',
  disabled = false,
  required = false,
  error = '',
  helperText = '',
  maxMenuHeight = 300,
  searchable = true,
  showSelectAllOption = true,
  renderValue,
  size = 'small',
  width,
  id,
  name,
  sx,
  className,
  style
}) => {
  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle select change
  const handleChange = (event: SelectChangeEvent<(string | number)[]>) => {
    const newValue = event.target.value as (string | number)[];
    onChange(newValue);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clear search term
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handle select all
  const handleSelectAll = () => {
    // Only select from filtered options that aren't disabled
    const selectableOptions = filteredOptions
      .filter(option => !option.disabled)
      .map(option => option.value);

    onChange(selectableOptions);
  };

  // Handle select none
  const handleSelectNone = () => {
    onChange([]);
  };

  // Handle removing a single item
  const handleRemoveItem = (valueToRemove: string | number) => (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent the dropdown from opening
    const newValue = value.filter(val => val.toString() !== valueToRemove.toString());
    onChange(newValue);
  };

  // Default render function for selected values
  const defaultRenderValue = (selected: (string | number)[]) => {
    if (!selected || selected.length === 0) {
      return <Typography color="text.secondary">{placeholder}</Typography>;
    }

    // Always show chips for all selected items
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {selected.map((selectedValue) => {
          const option = options.find(opt => opt.value.toString() === selectedValue.toString());
          return (
            <Chip
              key={selectedValue}
              label={option ? option.label : selectedValue}
              size="small"
              onDelete={handleRemoveItem(selectedValue)}
              onClick={(e) => e.stopPropagation()} // Prevent opening dropdown when clicking the chip
              deleteIcon={
                <ClearIcon
                  fontSize="small"
                  onMouseDown={(e) => e.stopPropagation()} // Extra prevention
                />
              }
              sx={{
                '& .MuiChip-deleteIcon': {
                  display: 'none',
                  opacity: 0.7,
                  '&:hover': {
                    opacity: 1,
                  }
                },
                '&:hover .MuiChip-deleteIcon': {
                  display: 'block',
                },
              }}
            />
          );
        })}
      </Box>
    );
  };

  // If no options are provided, show a message
  if (!options || options.length === 0) {
    return (
      <FormControl
        fullWidth
        size={size}
        error={!!error}
        disabled={true}
        required={required}
        sx={{
          width: width,
          ...sx
        }}
        className={className}
        style={style}
      >
        {label && <InputLabel id={`${id || 'multi-select'}-label`}>{label}</InputLabel>}
        <Select
          labelId={`${id || 'multi-select'}-label`}
          id={id || 'multi-select'}
          name={name}
          multiple
          value={[]}
          input={<OutlinedInput label={label} />}
          renderValue={() => <Typography color="text.secondary">No options available</Typography>}
        >
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No options available
            </Typography>
          </MenuItem>
        </Select>
        {helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // Reset search when dropdown closes
  const handleClose = () => {
    setSearchTerm('');
  };

  return (
    <FormControl
      fullWidth
      size={size}
      error={!!error}
      disabled={disabled}
      required={required}
      sx={{
        width: width || '100%',
        minWidth: '100%',
        ...sx
      }}
      className={className}
      style={style}
    >
      {label && <InputLabel id={`${id || 'multi-select'}-label`}>{label}</InputLabel>}

      <Select
        labelId={`${id || 'multi-select'}-label`}
        id={id || 'multi-select'}
        name={name}
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={renderValue || defaultRenderValue}
        onClose={handleClose}
        // Add a custom click handler to prevent opening when clicking on chips
        onClick={(e) => {
          // Check if the click was on a chip or delete icon
          if (
            e.target instanceof HTMLElement &&
            (e.target.classList.contains('MuiChip-root') ||
             e.target.classList.contains('MuiChip-label') ||
             e.target.classList.contains('MuiChip-deleteIcon') ||
             e.target.closest('.MuiChip-deleteIcon'))
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: maxMenuHeight,
            },
          },
        }}
      >
        {/* Search input and Select All/Clear All in a sticky container */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Search input */}
          {searchable && (
            <Box sx={{ p: 1 }}>
              <TextField
                size="small"
                placeholder="Search..."
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSearch();
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Box>
          )}

          {/* Select all/none options */}
          {showSelectAllOption && filteredOptions.length > 0 && (
            <Box sx={{ px: 1, py: 0.5, display: 'flex', justifyContent: 'space-between' }}>
              <Button size="small" onClick={handleSelectAll}>Select All</Button>
              <Button size="small" onClick={handleSelectNone}>Clear All</Button>
            </Box>
          )}
        </Box>

        {/* No options message */}
        {filteredOptions.length === 0 && (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No options found
            </Typography>
          </MenuItem>
        )}

        {/* Options */}
        {filteredOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={value.some(val =>
                  val.toString() === option.value.toString()
                )}
              />
              <ListItemText
                primary={option.label}
                secondary={option.group}
              />
            </Box>
            {option.description && (
              <Tooltip title={option.description} arrow>
                <InfoOutlinedIcon fontSize="small" color="action" sx={{ ml: 1 }} />
              </Tooltip>
            )}
          </MenuItem>
        ))}
      </Select>

      {/* Helper text or error message */}
      {(helperText || error) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default MultiSelect;
