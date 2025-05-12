import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../../store/store';
import { AnalyticsState, AnalyticsTab, FilterOptions } from '../types';
import dashboardService from '../../../services/dashboardService';

/**
 * Initial state for the analytics slice
 */
const initialState: AnalyticsState = {
  // Dashboard data
  summaryStats: null,
  recentTransactions: [],
  casinoRevenue: [],
  topGames: [],
  playerRegistrations: [],
  
  // UI state
  activeTab: 0,
  lastUpdated: new Date().toISOString(),
  
  // Filter state
  filters: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    endDate: new Date().toISOString(),
    country: null,
    gameCategory: null,
    playerStatus: null,
  },
  
  // Loading and error states
  isLoading: false,
  error: null,
};

/**
 * Async thunk for fetching dashboard summary data
 */
export const fetchDashboardSummary = createAsyncThunk(
  'analytics/fetchDashboardSummary',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { filters } = state.analytics;
      
      const response = await dashboardService.getDashboardSummary({
        startDate: filters.startDate,
        endDate: filters.endDate,
        country: filters.country,
        gameCategory: filters.gameCategory,
        playerStatus: filters.playerStatus,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard summary');
    }
  }
);

/**
 * Async thunk for fetching recent transactions
 */
export const fetchRecentTransactions = createAsyncThunk(
  'analytics/fetchRecentTransactions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { filters } = state.analytics;
      
      const response = await dashboardService.getRecentTransactions({
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 10,
        playerStatus: filters.playerStatus,
        country: filters.country,
      });
      
      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch recent transactions');
    }
  }
);

/**
 * Async thunk for fetching all dashboard data
 */
export const fetchAllDashboardData = createAsyncThunk(
  'analytics/fetchAllDashboardData',
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchDashboardSummary()),
      dispatch(fetchRecentTransactions()),
    ]);
    
    return new Date().toISOString();
  }
);

/**
 * Analytics slice
 */
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Tab navigation
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload;
    },
    
    // Filter actions
    setFilters: (state, action: PayloadAction<Partial<FilterOptions>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // UI actions
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard summary
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summaryStats = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // Recent transactions
    builder
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentTransactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // All dashboard data
    builder
      .addCase(fetchAllDashboardData.fulfilled, (state, action) => {
        state.lastUpdated = action.payload;
      });
  },
});

// Export actions
export const { setActiveTab, setFilters, resetFilters, clearErrors } = analyticsSlice.actions;

// Export reducer
export default analyticsSlice.reducer;
