/**
 * Profile Mock Data
 */
import { User } from '../../types/auth';
import loginMockData from './login';

/**
 * Mock user profile
 */
const userProfile: User = {
  ...loginMockData.adminUser,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    dashboardLayout: 'default',
    timezone: 'UTC'
  }
};

/**
 * Mock profile update response
 */
const updateProfileResponse = {
  success: true,
  message: 'Profile updated successfully',
  user: userProfile
};

export default {
  userProfile,
  updateProfileResponse
};
