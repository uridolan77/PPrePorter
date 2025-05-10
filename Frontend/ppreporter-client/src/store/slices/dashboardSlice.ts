import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import dashboardService from '../../services/api/dashboardService';
import { 
  DashboardState, 
  DashboardFilters, 
  ThunkConfig, 
  RevenueData, 
  GameData, 
  RegistrationData, 
  TransactionData 
} from '../../types/redux';

// Helper function to handle API errors
const handleApiError = (error: any): string => {
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  return error.message || 'An unexpected error occurred';
};

// Initial state
const initialState: DashboardState = {
  summaryStats: null,
  casinoRevenue: [],
  playerRegistrations: [],
  topGames: [],
  recentTransactions: [],
  isLoading: false,
  componentErrors: {
    summary: null,
    revenue: null,
    registrations: null,
    topGames: null,
    transactions: null
  },
  error: null
};

// Async thunks
export const fetchDashboardData = createAsyncThunk<
  {
    summary: any;
    casinoRevenue: RevenueData[];
    playerRegistrations: RegistrationData[];
    topGames: GameData[];
    recentTransactions: TransactionData[];
  },
  DashboardFilters | undefined,
  ThunkConfig
>(
  'dashboard/fetchDashboardData',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Prepare date parameters
      const startDate = filters.startDate || null;
      const endDate = filters.endDate || null;

      // Get dashboard stats with filters
      const stats = await dashboardService.getDashboardStats({
        startDate,
        endDate,
        gameCategory: filters.gameCategory,
        playerStatus: filters.playerStatus,
        country: filters.country,
        minRevenue: filters.minRevenue,
        maxRevenue: filters.maxRevenue
      });

      // Get player registrations data with date range
      const playerRegistrations = await dashboardService.getPlayerRegistrations({
        startDate,
        endDate,
        playerStatus: filters.playerStatus,
        country: filters.country
      });

      // Get recent transactions with filters
      const recentTransactions = await dashboardService.getRecentTransactions({
        limit: 10,
        startDate,
        endDate,
        playerStatus: filters.playerStatus,
        country: filters.country
      });

      // Get top games with filters
      const topGames = await dashboardService.getTopGames({
        metric: 'revenue',
        limit: 5,
        startDate,
        endDate,
        category: filters.gameCategory,
        minRevenue: filters.minRevenue,
        maxRevenue: filters.maxRevenue
      });

      // Get casino revenue with date range
      const casinoRevenue = await dashboardService.getCasinoRevenue({
        startDate,
        endDate,
        category: filters.gameCategory
      });

      // Combine all data
      const dashboardData = {
        summary: stats,
        casinoRevenue: casinoRevenue?.dailyRevenue || [],
        playerRegistrations,
        topGames,
        recentTransactions
      };

      return dashboardData;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchRevenueChart = createAsyncThunk<
  RevenueData[],
  DashboardFilters | undefined,
  ThunkConfig
>(
  'dashboard/fetchRevenueChart',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const casinoRevenue = await dashboardService.getCasinoRevenue(filters);
      return casinoRevenue?.dailyRevenue || [];
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchRegistrationsChart = createAsyncThunk<
  RegistrationData[],
  DashboardFilters | undefined,
  ThunkConfig
>(
  'dashboard/fetchRegistrationsChart',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const playerRegistrations = await dashboardService.getPlayerRegistrations(filters);
      return playerRegistrations;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchTopGames = createAsyncThunk<
  GameData[],
  DashboardFilters | undefined,
  ThunkConfig
>(
  'dashboard/fetchTopGames',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const topGames = await dashboardService.getTopGames({
        metric: 'revenue',
        limit: 5,
        ...filters
      });
      return topGames;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchRecentTransactions = createAsyncThunk<
  TransactionData[],
  DashboardFilters | undefined,
  ThunkConfig
>(
  'dashboard/fetchRecentTransactions',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const recentTransactions = await dashboardService.getRecentTransactions({
        limit: 10,
        ...filters
      });
      return recentTransactions;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.summaryStats = null;
      state.casinoRevenue = [];
      state.playerRegistrations = [];
      state.topGames = [];
      state.recentTransactions = [];
      state.error = null;
      state.componentErrors = {
        summary: null,
        revenue: null,
        registrations: null,
        topGames: null,
        transactions: null
      };
    },
    clearErrors: (state) => {
      state.error = null;
      state.componentErrors = {
        summary: null,
        revenue: null,
        registrations: null,
        topGames: null,
        transactions: null
      };
    },
    clearComponentError: (state, action: PayloadAction<string>) => {
      const component = action.payload;
      if (component in state.componentErrors) {
        state.componentErrors[component as keyof typeof state.componentErrors] = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchDashboardData
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summaryStats = action.payload.summary;
        state.casinoRevenue = action.payload.casinoRevenue;
        state.playerRegistrations = action.payload.playerRegistrations;
        state.topGames = action.payload.topGames;
        state.recentTransactions = action.payload.recentTransactions;
        state.componentErrors = {
          summary: null,
          revenue: null,
          registrations: null,
          topGames: null,
          transactions: null
        };
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch dashboard data';
        state.componentErrors.summary = action.payload || 'Failed to fetch dashboard data';
      })
      
      // fetchRevenueChart
      .addCase(fetchRevenueChart.pending, (state) => {
        state.componentErrors.revenue = null;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.casinoRevenue = action.payload;
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.componentErrors.revenue = action.payload || 'Failed to fetch revenue chart';
      })
      
      // fetchRegistrationsChart
      .addCase(fetchRegistrationsChart.pending, (state) => {
        state.componentErrors.registrations = null;
      })
      .addCase(fetchRegistrationsChart.fulfilled, (state, action) => {
        state.playerRegistrations = action.payload;
      })
      .addCase(fetchRegistrationsChart.rejected, (state, action) => {
        state.componentErrors.registrations = action.payload || 'Failed to fetch registrations chart';
      })
      
      // fetchTopGames
      .addCase(fetchTopGames.pending, (state) => {
        state.componentErrors.topGames = null;
      })
      .addCase(fetchTopGames.fulfilled, (state, action) => {
        state.topGames = action.payload;
      })
      .addCase(fetchTopGames.rejected, (state, action) => {
        state.componentErrors.topGames = action.payload || 'Failed to fetch top games';
      })
      
      // fetchRecentTransactions
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.componentErrors.transactions = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentTransactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.componentErrors.transactions = action.payload || 'Failed to fetch recent transactions';
      });
  }
});

// Export actions
export const { clearDashboard, clearErrors, clearComponentError } = dashboardSlice.actions;

// Export reducer
export default dashboardSlice.reducer;
