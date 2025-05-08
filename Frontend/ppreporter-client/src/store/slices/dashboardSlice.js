import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Error handler helper for consistent error handling
const handleApiError = (error) => {
  // Network errors
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Server errors with custom message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle different HTTP status codes with user-friendly messages
  switch (error.response.status) {
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You don\'t have permission to access this data.';
    case 404:
      return 'The requested data could not be found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Our team has been notified.';
    default:
      return error.response?.data?.message || 'Something went wrong. Please try again.';
  }
};

const initialState = {
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

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchDashboardSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/summary', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchRevenueChart = createAsyncThunk(
  'dashboard/fetchRevenueChart',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/revenue-chart', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchRegistrationsChart = createAsyncThunk(
  'dashboard/fetchRegistrationsChart',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/registrations-chart', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchTopGames = createAsyncThunk(
  'dashboard/fetchTopGames',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/top-games', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchRecentTransactions = createAsyncThunk(
  'dashboard/fetchRecentTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/recent-transactions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

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
    clearComponentError: (state, action) => {
      const component = action.payload;
      if (state.componentErrors[component] !== undefined) {
        state.componentErrors[component] = null;
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
        state.error = action.payload || 'Failed to load dashboard data';
      })
      
      // fetchDashboardSummary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.componentErrors.summary = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summaryStats = action.payload;
        state.componentErrors.summary = null;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.componentErrors.summary = action.payload || 'Failed to load summary data';
      })
      
      // fetchRevenueChart
      .addCase(fetchRevenueChart.pending, (state) => {
        state.componentErrors.revenue = null;
      })
      .addCase(fetchRevenueChart.fulfilled, (state, action) => {
        state.casinoRevenue = action.payload;
        state.componentErrors.revenue = null;
      })
      .addCase(fetchRevenueChart.rejected, (state, action) => {
        state.componentErrors.revenue = action.payload || 'Failed to load revenue chart';
      })
      
      // fetchRegistrationsChart
      .addCase(fetchRegistrationsChart.pending, (state) => {
        state.componentErrors.registrations = null;
      })
      .addCase(fetchRegistrationsChart.fulfilled, (state, action) => {
        state.playerRegistrations = action.payload;
        state.componentErrors.registrations = null;
      })
      .addCase(fetchRegistrationsChart.rejected, (state, action) => {
        state.componentErrors.registrations = action.payload || 'Failed to load registrations chart';
      })
      
      // fetchTopGames
      .addCase(fetchTopGames.pending, (state) => {
        state.componentErrors.topGames = null;
      })
      .addCase(fetchTopGames.fulfilled, (state, action) => {
        state.topGames = action.payload;
        state.componentErrors.topGames = null;
      })
      .addCase(fetchTopGames.rejected, (state, action) => {
        state.componentErrors.topGames = action.payload || 'Failed to load top games data';
      })
      
      // fetchRecentTransactions
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.componentErrors.transactions = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentTransactions = action.payload;
        state.componentErrors.transactions = null;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.componentErrors.transactions = action.payload || 'Failed to load recent transactions';
      });
  }
});

export const { clearDashboard, clearErrors, clearComponentError } = dashboardSlice.actions;

export default dashboardSlice.reducer;