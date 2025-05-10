import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { LoginCredentials, User } from '../../types/auth';
import { AuthState, ThunkConfig, RootState } from '../../types/redux';

// Async thunks for authentication actions
export const login = createAsyncThunk<
  User,
  LoginCredentials,
  ThunkConfig
>(
  'auth/login',
  async ({ username, email, password, rememberMe }, { rejectWithValue }) => {
    try {
      console.log('Login thunk called with:', { username, email, rememberMe });

      // Support both username and email
      const credentials: LoginCredentials = {
        username: username || email || '',
        password,
        rememberMe
      };

      console.log('Calling authService.login with credentials');
      const response = await authService.login(credentials);
      console.log('Login thunk received response:', response);

      return response;
    } catch (error) {
      console.error('Login thunk error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk<
  User,
  any,
  ThunkConfig
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk<
  null,
  void,
  ThunkConfig
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshToken = createAsyncThunk<
  User,
  void,
  ThunkConfig
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const forgotPassword = createAsyncThunk<
  void,
  { email: string },
  ThunkConfig
>(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      await authService.requestPasswordReset(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk<
  void,
  { token: string, newPassword: string },
  ThunkConfig
>(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      await authService.resetPassword(token, newPassword);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginWithGoogle = createAsyncThunk<
  User,
  void,
  ThunkConfig
>(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithGoogle();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginWithMicrosoft = createAsyncThunk<
  User,
  void,
  ThunkConfig
>(
  'auth/loginWithMicrosoft',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithMicrosoft();
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Microsoft login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

// Try to get the current user from localStorage
try {
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    initialState.user = currentUser;
    initialState.isAuthenticated = true;
  }
} catch (error) {
  console.error('Error initializing auth state:', error);
}

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Non-async reducers
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
        // If token refresh fails, we should log the user out
        state.user = null;
        state.isAuthenticated = false;
      })
      // Google Login
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      })
      // Microsoft Login
      .addCase(loginWithMicrosoft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithMicrosoft.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithMicrosoft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || null;
      });
  }
});

// Export actions
export const { clearError, updateUserProfile } = authSlice.actions;

// Export selectors
export const selectAuth = (state: RootState) => state.auth;

// Export reducer
export default authSlice.reducer;
