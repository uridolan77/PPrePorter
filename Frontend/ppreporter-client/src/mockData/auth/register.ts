/**
 * Register Mock Data
 */
import { User } from '../../types/auth';

/**
 * Mock newly registered user
 */
const newUser: User = {
  id: '5',
  username: 'newuser',
  email: 'newuser@example.com',
  firstName: 'New',
  lastName: 'User',
  role: 'viewer',
  permissions: [
    'view_dashboard',
    'view_reports',
    'export_data'
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  active: true,
  avatar: 'https://i.pravatar.cc/150?img=5'
};

/**
 * Mock successful registration response
 */
const successResponse = {
  user: newUser,
  token: 'mock-jwt-token-for-new-user-very-long-and-secure',
  refreshToken: 'mock-refresh-token-for-new-user-very-long-and-secure'
};

export default {
  newUser,
  successResponse
};
