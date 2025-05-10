/**
 * Types for DateRangePicker component
 */

/**
 * Date range interface
 */
export interface DateRange {
  /**
   * Start date
   */
  start: Date | null;
  
  /**
   * End date
   */
  end: Date | null;
}

/**
 * Date preset interface
 */
export interface DatePreset {
  /**
   * Preset label
   */
  label: string;
  
  /**
   * Function to get date range for this preset
   */
  getValue: () => DateRange;
}

/**
 * DateRangePicker component props interface
 */
export interface DateRangePickerProps {
  /**
   * Start date
   */
  startDate?: Date | null;
  
  /**
   * End date
   */
  endDate?: Date | null;
  
  /**
   * Function called when dates change
   */
  onChange?: (range: DateRange) => void;
  
  /**
   * Label for the button
   */
  buttonLabel?: string;
  
  /**
   * Custom date range presets
   */
  presets?: DatePreset[];
  
  /**
   * Whether to show clear button
   */
  showClearButton?: boolean;
  
  /**
   * Whether to auto-apply changes when selecting a preset
   */
  autoApplyPresets?: boolean;
  
  /**
   * Whether to disable the component
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class name
   */
  className?: string;
  
  /**
   * Additional styles
   */
  sx?: React.CSSProperties;
}

export default DateRangePickerProps;
