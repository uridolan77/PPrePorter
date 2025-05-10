/**
 * Login Mock Data
 */
import { User } from '../../types/auth';

/**
 * Mock admin user
 */
const adminUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  permissions: [
    'view_dashboard',
    'view_reports',
    'create_reports',
    'edit_reports',
    'delete_reports',
    'export_data',
    'manage_users',
    'manage_settings',
    'view_audit_logs'
  ],
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  lastLogin: '2023-06-15T10:30:00.000Z',
  active: true,
  avatar: 'https://i.pravatar.cc/150?img=1'
};

/**
 * Mock regular user
 */
const regularUser: User = {
  id: '2',
  username: 'user',
  email: 'user@example.com',
  firstName: 'Regular',
  lastName: 'User',
  role: 'viewer',
  permissions: [
    'view_dashboard',
    'view_reports',
    'export_data'
  ],
  createdAt: '2023-02-15T00:00:00.000Z',
  updatedAt: '2023-02-15T00:00:00.000Z',
  lastLogin: '2023-06-14T15:45:00.000Z',
  active: true,
  avatar: 'https://i.pravatar.cc/150?img=2'
};

/**
 * Mock analyst user
 */
const analystUser: User = {
  id: '3',
  username: 'analyst',
  email: 'analyst@example.com',
  firstName: 'Data',
  lastName: 'Analyst',
  role: 'analyst',
  permissions: [
    'view_dashboard',
    'view_reports',
    'create_reports',
    'export_data'
  ],
  createdAt: '2023-03-10T00:00:00.000Z',
  updatedAt: '2023-03-10T00:00:00.000Z',
  lastLogin: '2023-06-13T09:20:00.000Z',
  active: true,
  avatar: 'https://i.pravatar.cc/150?img=3'
};

/**
 * Mock manager user
 */
const managerUser: User = {
  id: '4',
  username: 'manager',
  email: 'manager@example.com',
  firstName: 'Team',
  lastName: 'Manager',
  role: 'manager',
  permissions: [
    'view_dashboard',
    'view_reports',
    'create_reports',
    'edit_reports',
    'export_data',
    'manage_users',
    'manage_settings'
  ],
  createdAt: '2023-04-05T00:00:00.000Z',
  updatedAt: '2023-04-05T00:00:00.000Z',
  lastLogin: '2023-06-12T14:10:00.000Z',
  active: true,
  avatar: 'https://i.pravatar.cc/150?img=4'
};

/**
 * Mock successful login response for admin
 */
const successResponse = {
  user: adminUser,
  token: 'mock-jwt-token-for-admin-very-long-and-secure',
  refreshToken: 'mock-refresh-token-for-admin-very-long-and-secure'
};

/**
 * Mock successful login response for regular user
 */
const userResponse = {
  user: regularUser,
  token: 'mock-jwt-token-for-user-very-long-and-secure',
  refreshToken: 'mock-refresh-token-for-user-very-long-and-secure'
};

/**
 * Mock successful login response for analyst
 */
const analystResponse = {
  user: analystUser,
  token: 'mock-jwt-token-for-analyst-very-long-and-secure',
  refreshToken: 'mock-refresh-token-for-analyst-very-long-and-secure'
};

/**
 * Mock successful login response for manager
 */
const managerResponse = {
  user: managerUser,
  token: 'mock-jwt-token-for-manager-very-long-and-secure',
  refreshToken: 'mock-refresh-token-for-manager-very-long-and-secure'
};

/**
 * Mock refresh token response
 */
const refreshTokenResponse = {
  token: 'mock-new-jwt-token-after-refresh-very-long-and-secure',
  refreshToken: 'mock-new-refresh-token-after-refresh-very-long-and-secure'
};

/**
 * Mock Google OAuth login response
 */
const googleResponse = {
  token: 'mock-jwt-token-for-google-oauth-very-long-and-secure',
  refreshToken: 'mock-refresh-token-for-google-oauth-very-long-and-secure',
  user: {
    id: '5',
    username: 'googleuser',
    email: 'googleuser@example.com',
    firstName: 'Google',
    lastName: 'User',
    role: 'viewer',
    permissions: [
      'view_dashboard',
      'view_reports',
      'export_data'
    ],
    createdAt: '2023-05-10T00:00:00.000Z',
    updatedAt: '2023-05-10T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    active: true,
    avatar: 'https://i.pravatar.cc/150?img=6'
  }
};

/**
 * Mock Microsoft OAuth login response
 */
const microsoftResponse = {
  token: 'mock-jwt-token-for-microsoft-oauth-very-long-and-secure',
  refreshToken: 'mock-refresh-token-for-microsoft-oauth-very-long-and-secure',
  user: {
    id: '6',
    username: 'microsoftuser',
    email: 'microsoftuser@example.com',
    firstName: 'Microsoft',
    lastName: 'User',
    role: 'viewer',
    permissions: [
      'view_dashboard',
      'view_reports',
      'export_data'
    ],
    createdAt: '2023-05-15T00:00:00.000Z',
    updatedAt: '2023-05-15T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    active: true,
    avatar: 'https://i.pravatar.cc/150?img=7'
  }
};

export default {
  adminUser,
  regularUser,
  analystUser,
  managerUser,
  successResponse,
  userResponse,
  analystResponse,
  managerResponse,
  refreshTokenResponse,
  googleResponse,
  microsoftResponse
};
