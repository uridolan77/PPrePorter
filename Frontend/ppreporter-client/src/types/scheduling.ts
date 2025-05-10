/**
 * Scheduling types for TypeScript components
 */

/**
 * Export format interface
 */
export interface ExportFormat {
  /**
   * Format ID
   */
  id: string;
  
  /**
   * Format name
   */
  name: string;
}

/**
 * Recipient interface
 */
export interface Recipient {
  /**
   * Recipient ID
   */
  id: string;
  
  /**
   * Recipient name
   */
  name: string;
  
  /**
   * Recipient email
   */
  email: string;
  
  /**
   * Recipient role
   */
  role?: string;
  
  /**
   * Recipient department
   */
  department?: string;
}

/**
 * Report interface
 */
export interface Report {
  /**
   * Report ID
   */
  id: string;
  
  /**
   * Report title
   */
  title: string;
  
  /**
   * Report description
   */
  description?: string;
  
  /**
   * Report type
   */
  type?: string;
  
  /**
   * Report created date
   */
  createdAt?: string;
  
  /**
   * Report updated date
   */
  updatedAt?: string;
  
  /**
   * Report created by
   */
  createdBy?: string;
}

/**
 * Schedule frequency type
 */
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Schedule interface
 */
export interface Schedule {
  /**
   * Schedule ID
   */
  id?: string;
  
  /**
   * Schedule frequency
   */
  frequency: ScheduleFrequency;
  
  /**
   * Day of week (0-6, where 0 is Sunday)
   */
  weekday: number;
  
  /**
   * Day of month (1-31)
   */
  monthDay: number;
  
  /**
   * Schedule time
   */
  time: Date;
  
  /**
   * Export format
   */
  exportFormat: string;
  
  /**
   * Recipient IDs
   */
  recipientIds: string[];
  
  /**
   * Whether to include email delivery
   */
  includeEmail: boolean;
  
  /**
   * Whether to include notification delivery
   */
  includeNotification: boolean;
  
  /**
   * Whether the schedule is active
   */
  active: boolean;
}

/**
 * Schedule form errors interface
 */
export interface ScheduleFormErrors {
  /**
   * Delivery method error
   */
  deliveryMethod?: string;
  
  /**
   * Recipients error
   */
  recipientIds?: string;
  
  /**
   * Other errors
   */
  [key: string]: string | undefined;
}

/**
 * Report schedule dialog props interface
 */
export interface ReportScheduleDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Function called when dialog is closed
   */
  onClose: () => void;
  
  /**
   * Report being scheduled
   */
  report?: Report;
  
  /**
   * Existing schedules for this report
   */
  schedules?: Schedule[];
  
  /**
   * Available export formats
   */
  exportFormats?: ExportFormat[];
  
  /**
   * Available recipients for scheduled reports
   */
  recipients?: Recipient[];
  
  /**
   * Function called when a schedule is added
   */
  onAddSchedule?: (schedule: Schedule) => void;
  
  /**
   * Function called when a schedule is updated
   */
  onUpdateSchedule?: (schedule: Schedule) => void;
  
  /**
   * Function called when a schedule is deleted
   */
  onDeleteSchedule?: (scheduleId: string) => void;
  
  /**
   * Whether data is loading
   */
  loading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string | null;
}

export default Schedule;
