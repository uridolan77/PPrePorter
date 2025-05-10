import { createSlice, createAsyncThunk, createAction, PayloadAction } from '@reduxjs/toolkit';
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
  heatmapData: null,
  heatmapLoading: false,
  heatmapError: null,
  nlQueryResults: null,
  nlQueryLoading: false,
  nlQueryError: null,
  favoriteQueries: [],
  isLoading: false,
  playerJourneyData: null,
  playerJourneyLoading: false,
  playerJourneyError: null,
  segmentComparisonData: null,
  segmentComparisonLoading: false,
  segmentComparisonError: null,
  componentErrors: {
    summary: null,
    revenue: null,
    registrations: null,
    topGames: null,
    transactions: null,
    heatmap: null,
    playerJourney: null,
    segmentComparison: null
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

// Natural language query action
export const submitNaturalLanguageQuery = createAsyncThunk<
  any,
  string,
  ThunkConfig
>(
  'dashboard/submitNaturalLanguageQuery',
  async (query, { rejectWithValue }) => {
    try {
      // This would normally call a service method
      // For now, return mock data
      return {
        results: [],
        query
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Clear query results action
export const clearQueryResults = createAction('dashboard/clearQueryResults');

// Save query to favorites action
export const saveQueryToFavorites = createAction<string>('dashboard/saveQueryToFavorites');

// Remove query from favorites action
export const removeQueryFromFavorites = createAction<string>('dashboard/removeQueryFromFavorites');

// Heatmap data fetch action
export const fetchHeatmapData = createAsyncThunk<
  any,
  {
    timeFrame: string;
    primaryDimension?: string;
    secondaryDimension?: string;
    metric?: string;
    dataType?: string;
    xAxis?: string;
    yAxis?: string;
    valueMetric?: string;
  },
  ThunkConfig
>(
  'dashboard/fetchHeatmapData',
  async (params, { rejectWithValue }) => {
    try {
      // This would normally call a service method
      // For now, return mock data
      return {
        data: [],
        primaryDimension: params.primaryDimension,
        secondaryDimension: params.secondaryDimension,
        metric: params.metric,
        timeFrame: params.timeFrame,
        dataType: params.dataType,
        xAxis: params.xAxis,
        yAxis: params.yAxis,
        valueMetric: params.valueMetric
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Player Journey data fetch action
export const fetchPlayerJourneyData = createAsyncThunk<
  any,
  {
    journeyType: string;
    timeFrame: string;
    filters?: DashboardFilters;
  },
  ThunkConfig
>(
  'dashboard/fetchPlayerJourneyData',
  async (params, { rejectWithValue }) => {
    try {
      // This would normally call a service method
      // For now, return mock data
      return {
        nodes: [],
        links: [],
        journeyType: params.journeyType,
        timeFrame: params.timeFrame
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Segment Comparison data fetch action
export const fetchSegmentComparisonData = createAsyncThunk<
  any,
  {
    segments: string[];
    metrics: string[];
    timeFrame: string;
    filters?: DashboardFilters;
  },
  ThunkConfig
>(
  'dashboard/fetchSegmentComparisonData',
  async (params, { rejectWithValue }) => {
    try {
      // This would normally call a service method
      // For now, return mock data
      return {
        data: [],
        segments: params.segments,
        metrics: params.metrics,
        timeFrame: params.timeFrame
      };
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
    clearComponentError: (state, action: PayloadAction<string | { component: string }>) => {
      let componentName: string;

      if (typeof action.payload === 'string') {
        componentName = action.payload;
      } else {
        componentName = action.payload.component;
      }

      if (componentName in state.componentErrors) {
        state.componentErrors[componentName as keyof typeof state.componentErrors] = null;
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
      })

      // fetchHeatmapData
      .addCase(fetchHeatmapData.pending, (state) => {
        state.heatmapLoading = true;
        state.heatmapError = null;
      })
      .addCase(fetchHeatmapData.fulfilled, (state, action) => {
        state.heatmapLoading = false;
        state.heatmapData = action.payload;
      })
      .addCase(fetchHeatmapData.rejected, (state, action) => {
        state.heatmapLoading = false;
        state.heatmapError = action.payload || 'Failed to fetch heatmap data';
      })

      // submitNaturalLanguageQuery
      .addCase(submitNaturalLanguageQuery.pending, (state) => {
        state.nlQueryLoading = true;
        state.nlQueryError = null;
      })
      .addCase(submitNaturalLanguageQuery.fulfilled, (state, action) => {
        state.nlQueryLoading = false;
        state.nlQueryResults = action.payload;
      })
      .addCase(submitNaturalLanguageQuery.rejected, (state, action) => {
        state.nlQueryLoading = false;
        state.nlQueryError = action.payload || 'Failed to process natural language query';
      })

      // fetchPlayerJourneyData
      .addCase(fetchPlayerJourneyData.pending, (state) => {
        state.playerJourneyLoading = true;
        state.playerJourneyError = null;
        state.componentErrors.playerJourney = null;
      })
      .addCase(fetchPlayerJourneyData.fulfilled, (state, action) => {
        state.playerJourneyLoading = false;
        state.playerJourneyData = action.payload;
      })
      .addCase(fetchPlayerJourneyData.rejected, (state, action) => {
        state.playerJourneyLoading = false;
        state.playerJourneyError = action.payload || 'Failed to fetch player journey data';
        state.componentErrors.playerJourney = action.payload || 'Failed to fetch player journey data';
      })

      // fetchSegmentComparisonData
      .addCase(fetchSegmentComparisonData.pending, (state) => {
        state.segmentComparisonLoading = true;
        state.segmentComparisonError = null;
        state.componentErrors.segmentComparison = null;
      })
      .addCase(fetchSegmentComparisonData.fulfilled, (state, action) => {
        state.segmentComparisonLoading = false;
        state.segmentComparisonData = action.payload;
      })
      .addCase(fetchSegmentComparisonData.rejected, (state, action) => {
        state.segmentComparisonLoading = false;
        state.segmentComparisonError = action.payload || 'Failed to fetch segment comparison data';
        state.componentErrors.segmentComparison = action.payload || 'Failed to fetch segment comparison data';
      });

    // Add reducers for the other actions
    builder.addCase(clearQueryResults, (state) => {
      state.nlQueryResults = null;
    });

    builder.addCase(saveQueryToFavorites, (state, action) => {
      const queryText = action.payload;
      const exists = state.favoriteQueries.some(q => q.text === queryText);
      if (!exists) {
        state.favoriteQueries.push({ text: queryText });
      }
    });

    builder.addCase(removeQueryFromFavorites, (state, action) => {
      const queryText = action.payload;
      state.favoriteQueries = state.favoriteQueries.filter(query => query.text !== queryText);
    });
  }
});

// Export actions
export const { clearDashboard, clearErrors, clearComponentError } = dashboardSlice.actions;

// Export reducer
export default dashboardSlice.reducer;
