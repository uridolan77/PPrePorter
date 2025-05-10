/**
 * Authentication types for TypeScript components
 */

/**
 * User role type
 */
export type UserRole = 'admin' | 'manager' | 'analyst' | 'viewer' | 'guest';

/**
 * User permission type
 */
export type UserPermission =
  | 'view_dashboard'
  | 'view_reports'
  | 'create_reports'
  | 'edit_reports'
  | 'delete_reports'
  | 'export_data'
  | 'manage_users'
  | 'manage_settings'
  | 'view_audit_logs';

/**
 * User interface
 */
export interface User {
  /**
   * User ID
   */
  id: string;

  /**
   * Username
   */
  username: string;

  /**
   * User's email address
   */
  email: string;

  /**
   * User's full name
   */
  fullName?: string;

  /**
   * User's first name
   */
  firstName?: string;

  /**
   * User's last name
   */
  lastName?: string;

  /**
   * User's avatar URL
   */
  avatar?: string;

  /**
   * User's role
   */
  role?: UserRole;

  /**
   * User's permissions
   */
  permissions?: UserPermission[];

  /**
   * Whether the user is active
   */
  active?: boolean;

  /**
   * Last login date
   */
  lastLogin?: string | Date;

  /**
   * User's preferences
   */
  preferences?: Record<string, any>;

  /**
   * User's organization
   */
  organization?: string;

  /**
   * User's department
   */
  department?: string;

  /**
   * User's position
   */
  position?: string;

  /**
   * User's phone number
   */
  phone?: string;

  /**
   * User's creation date
   */
  createdAt?: string | Date;

  /**
   * User's last update date
   */
  updatedAt?: string | Date;
}

/**
 * Authentication state
 */
export interface AuthState {
  /**
   * Current user
   */
  user: User | null;

  /**
   * Authentication token
   */
  token: string | null;

  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether authentication is loading
   */
  loading: boolean;

  /**
   * Authentication error
   */
  error: string | null;

  /**
   * Token expiration date
   */
  expiresAt?: string | Date | null;

  /**
   * Refresh token
   */
  refreshToken?: string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  /**
   * Username
   */
  username: string;

  /**
   * Email (alternative to username)
   */
  email?: string;

  /**
   * Password
   */
  password: string;

  /**
   * Remember me flag
   */
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegistrationData {
  /**
   * Username
   */
  username: string;

  /**
   * Email
   */
  email: string;

  /**
   * Password
   */
  password: string;

  /**
   * Password confirmation
   */
  confirmPassword: string;

  /**
   * First name
   */
  firstName?: string;

  /**
   * Last name
   */
  lastName?: string;

  /**
   * Organization
   */
  organization?: string;

  /**
   * Terms acceptance
   */
  acceptTerms: boolean;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  /**
   * Email
   */
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  /**
   * Reset token
   */
  token: string;

  /**
   * New password
   */
  password: string;

  /**
   * Password confirmation
   */
  confirmPassword: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  /**
   * User data
   */
  user: User;

  /**
   * Authentication token
   */
  token: string;

  /**
   * Refresh token
   */
  refreshToken?: string;

  /**
   * Token expiration
   */
  expiresAt?: string | Date;
}

export default AuthState;
