/**
 * Sharing types for TypeScript components
 */

import { Report } from './reportsData';

/**
 * Permission type
 */
export type Permission = 'view' | 'edit' | 'manage';

/**
 * User interface
 */
export interface User {
  /**
   * User ID
   */
  id: string;
  
  /**
   * User name
   */
  name: string;
  
  /**
   * User email
   */
  email: string;
  
  /**
   * User role
   */
  role?: string;
  
  /**
   * User department
   */
  department?: string;
}

/**
 * Shared user interface
 */
export interface SharedUser extends User {
  /**
   * User permission
   */
  permission: Permission;
  
  /**
   * When the user was added
   */
  addedAt?: string;
  
  /**
   * Who added the user
   */
  addedBy?: string;
}

/**
 * Report share dialog props interface
 */
export interface ReportShareDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Function called when dialog is closed
   */
  onClose: () => void;
  
  /**
   * Report being shared
   */
  report?: Report;
  
  /**
   * Users that the report is already shared with
   */
  sharedUsers?: SharedUser[];
  
  /**
   * Users available to share with
   */
  availableUsers?: User[];
  
  /**
   * Whether the report is publicly accessible
   */
  isPublic?: boolean;
  
  /**
   * Public URL for the report
   */
  publicUrl?: string;
  
  /**
   * Expiration date for public link
   */
  expirationDate?: Date | null;
  
  /**
   * Function called when a user is added
   */
  onAddUser?: (users: User[], permission: Permission) => void;
  
  /**
   * Function called when a user is removed
   */
  onRemoveUser?: (user: SharedUser) => void;
  
  /**
   * Function called when a user's permission changes
   */
  onPermissionChange?: (user: SharedUser, permission: Permission) => void;
  
  /**
   * Function called when public access is toggled
   */
  onPublicToggle?: (isPublic: boolean) => void;
  
  /**
   * Function called when expiration date changes
   */
  onExpirationChange?: (date: Date | null) => void;
  
  /**
   * Whether data is loading
   */
  loading?: boolean;
  
  /**
   * Error message to display
   */
  error?: string | null;
}

/**
 * Snackbar state interface
 */
export interface SnackbarState {
  /**
   * Whether the snackbar is open
   */
  open: boolean;
  
  /**
   * Snackbar message
   */
  message: string;
  
  /**
   * Snackbar severity
   */
  severity?: 'success' | 'info' | 'warning' | 'error';
}

export default ReportShareDialogProps;
