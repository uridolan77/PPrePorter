/**
 * Types for ReportScheduler component
 */

/**
 * Report interface
 */
export interface Report {
  /**
   * Report ID
   */
  id: string;
  
  /**
   * Report name
   */
  name: string;
  
  /**
   * Report description
   */
  description?: string;
  
  /**
   * Any additional properties
   */
  [key: string]: any;
}

/**
 * Schedule interface
 */
export interface Schedule {
  /**
   * Schedule ID
   */
  id?: string;
  
  /**
   * Schedule name
   */
  name: string;
  
  /**
   * Whether the schedule is enabled
   */
  enabled: boolean;
  
  /**
   * Schedule frequency
   */
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  
  /**
   * Day of week (0-6, where 0 is Sunday)
   */
  dayOfWeek?: number | null;
  
  /**
   * Day of month (1-31)
   */
  dayOfMonth?: number | null;
  
  /**
   * Time of day
   */
  time: Date;
  
  /**
   * Start date
   */
  startDate: Date;
  
  /**
   * End date
   */
  endDate?: Date | null;
  
  /**
   * Whether the schedule has an end date
   */
  hasEndDate?: boolean;
  
  /**
   * Export format
   */
  format: 'pdf' | 'excel' | 'csv';
  
  /**
   * Email recipients
   */
  recipients: string[];
  
  /**
   * Email subject
   */
  emailSubject: string;
  
  /**
   * Email body
   */
  emailBody: string;
  
  /**
   * Whether to include filters in the report
   */
  includeFilters: boolean;
  
  /**
   * Whether to include logo in the report
   */
  includeLogo: boolean;
  
  /**
   * Whether to include raw data attachment
   */
  includeDataAttachment: boolean;
  
  /**
   * Report ID
   */
  reportId?: string;
}

/**
 * ReportScheduler component props interface
 */
export interface ReportSchedulerProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Function to call when dialog is closed
   */
  onClose: () => void;
  
  /**
   * Function to call when schedule is saved
   */
  onSave?: (schedule: Schedule) => void;
  
  /**
   * Report being scheduled
   */
  report?: Report;
  
  /**
   * Existing schedule if editing
   */
  schedule?: Schedule | null;
  
  /**
   * Whether save operation is in progress
   */
  loading?: boolean;
}

export default ReportSchedulerProps;
