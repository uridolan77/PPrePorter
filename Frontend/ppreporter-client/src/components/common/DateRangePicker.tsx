import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, IconButton, Popover } from '@mui/material';
import SimpleBox from './SimpleBox';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, isValid } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ClearIcon from '@mui/icons-material/Clear';
import { DateRangePickerProps, DatePreset, DateRange } from '../../types/dateRangePicker';

/**
 * A reusable date range picker component with presets
 */
const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate = null,
  endDate = null,
  onChange,
  buttonLabel = "Date Range",
  presets = null,
  showClearButton = true,
  autoApplyPresets = true,
  disabled = false,
  className,
  sx
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  // Default presets if none provided
  const defaultPresets: DatePreset[] = [
    { label: 'Today', getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
    { label: 'Yesterday', getValue: () => ({ start: startOfDay(subDays(new Date(), 1)), end: endOfDay(subDays(new Date(), 1)) }) },
    { label: 'Last 7 days', getValue: () => ({ start: startOfDay(subDays(new Date(), 6)), end: endOfDay(new Date()) }) },
    { label: 'Last 30 days', getValue: () => ({ start: startOfDay(subDays(new Date(), 29)), end: endOfDay(new Date()) }) },
    { label: 'This month', getValue: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
    { label: 'Last month', getValue: () => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1);
      return { start: startOfMonth(date), end: endOfMonth(date) };
    }},
  ];

  const datePresets = presets || defaultPresets;

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleApply = (): void => {
    if (onChange) {
      onChange({ start: tempStartDate, end: tempEndDate });
    }
    handleClose();
  };

  const handleClear = (e?: React.MouseEvent): void => {
    if (e) {
      e.stopPropagation();
    }
    setTempStartDate(null);
    setTempEndDate(null);
    if (onChange) {
      onChange({ start: null, end: null });
    }
    handleClose();
  };

  const handlePresetClick = (preset: DatePreset): void => {
    const { start, end } = preset.getValue();
    setTempStartDate(start);
    setTempEndDate(end);

    if (autoApplyPresets) {
      if (onChange) {
        onChange({ start, end });
      }
      handleClose();
    }
  };

  const formatButtonText = (): string => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
      return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
    }
    return buttonLabel;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  return (
    <div className={className} style={sx}>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<CalendarTodayIcon />}
        endIcon={showClearButton && startDate && endDate && isValid(startDate) && isValid(endDate) ? (
          <IconButton size="small" onClick={handleClear}>
            <ClearIcon fontSize="small" />
          </IconButton>
        ) : undefined}
        sx={{
          justifyContent: 'space-between',
          minWidth: 200,
          textTransform: 'none'
        }}
        disabled={disabled}
      >
        {formatButtonText()}
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 8,
          sx: { p: 2, width: { xs: '90vw', sm: 400 } }
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Select Date Range
        </Typography>

        <Box sx={{ mb: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={tempStartDate}
                onChange={(newValue) => setTempStartDate(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    helperText: tempStartDate ? format(tempStartDate, 'EEEE') : ''
                  }
                }}
              />
              <DatePicker
                label="End Date"
                value={tempEndDate}
                onChange={(newValue) => setTempEndDate(newValue)}
                minDate={tempStartDate}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    helperText: tempEndDate ? format(tempEndDate, 'EEEE') : ''
                  }
                }}
              />
            </Box>
          </LocalizationProvider>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Presets
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {datePresets.map((preset, index) => (
            <Button
              key={index}
              size="small"
              variant="outlined"
              onClick={() => handlePresetClick(preset)}
            >
              {preset.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleApply}>
            Apply
          </Button>
        </Box>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
