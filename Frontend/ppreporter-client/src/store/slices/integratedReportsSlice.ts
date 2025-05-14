import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import integratedReportsService from '../../services/api/integratedReportsService';
import { RootState } from '../store';

// Define types for the state
export interface DashboardSummary {
  totalPlayers: number;
  totalGames: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWins: number;
  totalGGR: number;
  newRegistrations: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

export interface TopGame {
  id: number;
  name: string;
  provider: string;
  category: string;
  totalBets: number;
  totalWins: number;
  netGamingRevenue: number;
  uniquePlayers: number;
  popularity: number;
}

export interface Transaction {
  id: number;
  playerId: number;
  playerName: string;
  type: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
}

export interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

export interface SegmentComparisonData {
  segment: string;
  deposits: number;
  withdrawals: number;
  bets: number;
  wins: number;
  ggr: number;
  players: number;
}

export interface UserPreferences {
  defaultDateRange: string;
  defaultTab: number;
  dashboardLayouts: any[];
  theme: 'light' | 'dark';
  chartPreferences: {
    showLegends: boolean;
    showGridLines: boolean;
    colorPalette: string;
  };
}

// Define the state interface
export interface IntegratedReportsState {
  dailyActions: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
  players: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
  games: {
    data: any[];
    loading: boolean;
    error: string | null;
  };
  dashboardSummary: {
    data: DashboardSummary | null;
    loading: boolean;
    error: string | null;
  };
  revenueChart: {
    data: ChartDataPoint[];
    loading: boolean;
    error: string | null;
  };
  registrationsChart: {
    data: ChartDataPoint[];
    loading: boolean;
    error: string | null;
  };
  topGames: {
    data: TopGame[];
    loading: boolean;
    error: string | null;
  };
  recentTransactions: {
    data: Transaction[];
    loading: boolean;
    error: string | null;
  };
  heatmap: {
    data: HeatmapData[];
    loading: boolean;
    error: string | null;
  };
  segmentComparison: {
    data: SegmentComparisonData[];
    loading: boolean;
    error: string | null;
  };
  userPreferences: {
    data: UserPreferences | null;
    loading: boolean;
    error: string | null;
  };
}

// Define the initial state
const initialState: IntegratedReportsState = {
  dailyActions: {
    data: [],
    loading: false,
    error: null
  },
  players: {
    data: [],
    loading: false,
    error: null
  },
  games: {
    data: [],
    loading: false,
    error: null
  },
  dashboardSummary: {
    data: null,
    loading: false,
    error: null
  },
  revenueChart: {
    data: [],
    loading: false,
    error: null
  },
  registrationsChart: {
    data: [],
    loading: false,
    error: null
  },
  topGames: {
    data: [],
    loading: false,
    error: null
  },
  recentTransactions: {
    data: [],
    loading: false,
    error: null
  },
  heatmap: {
    data: [],
    loading: false,
    error: null
  },
  segmentComparison: {
    data: [],
    loading: false,
    error: null
  },
  userPreferences: {
    data: null,
    loading: false,
    error: null
  }
};

// Create async thunks for API calls
export const fetchDailyActionsData = createAsyncThunk(
  'integratedReports/fetchDailyActionsData',
  async ({ startDate, endDate, filters }: { startDate: Date | string | null; endDate: Date | string | null; filters?: Record<string, any> }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getDailyActionsData(startDate, endDate, filters);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch daily actions data');
    }
  }
);

export const fetchPlayerData = createAsyncThunk(
  'integratedReports/fetchPlayerData',
  async ({ startDate, endDate, filters }: { startDate: Date | string | null; endDate: Date | string | null; filters?: Record<string, any> }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getPlayerData(startDate, endDate, filters);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch player data');
    }
  }
);

export const fetchGameData = createAsyncThunk(
  'integratedReports/fetchGameData',
  async ({ startDate, endDate, filters }: { startDate: Date | string | null; endDate: Date | string | null; filters?: Record<string, any> }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getGameData(startDate, endDate, filters);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch game data');
    }
  }
);

export const fetchDashboardSummary = createAsyncThunk(
  'integratedReports/fetchDashboardSummary',
  async ({ startDate, endDate }: { startDate: Date | string | null; endDate: Date | string | null }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getDashboardSummary(startDate, endDate);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard summary');
    }
  }
);

export const fetchRevenueChartData = createAsyncThunk(
  'integratedReports/fetchRevenueChartData',
  async ({ startDate, endDate, interval }: { startDate: Date | string | null; endDate: Date | string | null; interval?: 'daily' | 'weekly' | 'monthly' }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getRevenueChartData(startDate, endDate, interval);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch revenue chart data');
    }
  }
);

export const fetchRegistrationsChartData = createAsyncThunk(
  'integratedReports/fetchRegistrationsChartData',
  async ({ startDate, endDate, interval }: { startDate: Date | string | null; endDate: Date | string | null; interval?: 'daily' | 'weekly' | 'monthly' }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getRegistrationsChartData(startDate, endDate, interval);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch registrations chart data');
    }
  }
);

export const fetchTopGamesData = createAsyncThunk(
  'integratedReports/fetchTopGamesData',
  async ({ startDate, endDate, limit }: { startDate: Date | string | null; endDate: Date | string | null; limit?: number }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getTopGamesData(startDate, endDate, limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch top games data');
    }
  }
);

export const fetchRecentTransactionsData = createAsyncThunk(
  'integratedReports/fetchRecentTransactionsData',
  async ({ startDate, endDate, limit }: { startDate: Date | string | null; endDate: Date | string | null; limit?: number }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getRecentTransactionsData(startDate, endDate, limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent transactions data');
    }
  }
);

export const fetchHeatmapData = createAsyncThunk(
  'integratedReports/fetchHeatmapData',
  async ({ startDate, endDate, metric }: { startDate: Date | string | null; endDate: Date | string | null; metric?: string }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getHeatmapData(startDate, endDate, metric);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch heatmap data');
    }
  }
);

export const fetchSegmentComparisonData = createAsyncThunk(
  'integratedReports/fetchSegmentComparisonData',
  async ({ startDate, endDate, segments }: { startDate: Date | string | null; endDate: Date | string | null; segments?: string[] }, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getSegmentComparisonData(startDate, endDate, segments);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch segment comparison data');
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  'integratedReports/fetchUserPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.getUserPreferences();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user preferences');
    }
  }
);

export const saveUserPreferences = createAsyncThunk(
  'integratedReports/saveUserPreferences',
  async (preferences: any, { rejectWithValue }) => {
    try {
      const data = await integratedReportsService.saveUserPreferences(preferences);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save user preferences');
    }
  }
);

// Create the slice
const integratedReportsSlice = createSlice({
  name: 'integratedReports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Daily Actions
    builder
      .addCase(fetchDailyActionsData.pending, (state) => {
        state.dailyActions.loading = true;
        state.dailyActions.error = null;
      })
      .addCase(fetchDailyActionsData.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.dailyActions.loading = false;
        state.dailyActions.data = action.payload;
      })
      .addCase(fetchDailyActionsData.rejected, (state, action) => {
        state.dailyActions.loading = false;
        state.dailyActions.error = action.payload as string;
      });

    // Players
    builder
      .addCase(fetchPlayerData.pending, (state) => {
        state.players.loading = true;
        state.players.error = null;
      })
      .addCase(fetchPlayerData.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.players.loading = false;
        state.players.data = action.payload;
      })
      .addCase(fetchPlayerData.rejected, (state, action) => {
        state.players.loading = false;
        state.players.error = action.payload as string;
      });

    // Games
    builder
      .addCase(fetchGameData.pending, (state) => {
        state.games.loading = true;
        state.games.error = null;
      })
      .addCase(fetchGameData.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.games.loading = false;
        state.games.data = action.payload;
      })
      .addCase(fetchGameData.rejected, (state, action) => {
        state.games.loading = false;
        state.games.error = action.payload as string;
      });

    // Dashboard Summary
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.dashboardSummary.loading = true;
        state.dashboardSummary.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action: PayloadAction<DashboardSummary>) => {
        state.dashboardSummary.loading = false;
        state.dashboardSummary.data = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.dashboardSummary.loading = false;
        state.dashboardSummary.error = action.payload as string;
      });

    // Revenue Chart
    builder
      .addCase(fetchRevenueChartData.pending, (state) => {
        state.revenueChart.loading = true;
        state.revenueChart.error = null;
      })
      .addCase(fetchRevenueChartData.fulfilled, (state, action: PayloadAction<ChartDataPoint[]>) => {
        state.revenueChart.loading = false;
        state.revenueChart.data = action.payload;
      })
      .addCase(fetchRevenueChartData.rejected, (state, action) => {
        state.revenueChart.loading = false;
        state.revenueChart.error = action.payload as string;
      });

    // Registrations Chart
    builder
      .addCase(fetchRegistrationsChartData.pending, (state) => {
        state.registrationsChart.loading = true;
        state.registrationsChart.error = null;
      })
      .addCase(fetchRegistrationsChartData.fulfilled, (state, action: PayloadAction<ChartDataPoint[]>) => {
        state.registrationsChart.loading = false;
        state.registrationsChart.data = action.payload;
      })
      .addCase(fetchRegistrationsChartData.rejected, (state, action) => {
        state.registrationsChart.loading = false;
        state.registrationsChart.error = action.payload as string;
      });

    // Top Games
    builder
      .addCase(fetchTopGamesData.pending, (state) => {
        state.topGames.loading = true;
        state.topGames.error = null;
      })
      .addCase(fetchTopGamesData.fulfilled, (state, action: PayloadAction<TopGame[]>) => {
        state.topGames.loading = false;
        state.topGames.data = action.payload;
      })
      .addCase(fetchTopGamesData.rejected, (state, action) => {
        state.topGames.loading = false;
        state.topGames.error = action.payload as string;
      });

    // Recent Transactions
    builder
      .addCase(fetchRecentTransactionsData.pending, (state) => {
        state.recentTransactions.loading = true;
        state.recentTransactions.error = null;
      })
      .addCase(fetchRecentTransactionsData.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.recentTransactions.loading = false;
        state.recentTransactions.data = action.payload;
      })
      .addCase(fetchRecentTransactionsData.rejected, (state, action) => {
        state.recentTransactions.loading = false;
        state.recentTransactions.error = action.payload as string;
      });

    // Heatmap
    builder
      .addCase(fetchHeatmapData.pending, (state) => {
        state.heatmap.loading = true;
        state.heatmap.error = null;
      })
      .addCase(fetchHeatmapData.fulfilled, (state, action: PayloadAction<HeatmapData[]>) => {
        state.heatmap.loading = false;
        state.heatmap.data = action.payload;
      })
      .addCase(fetchHeatmapData.rejected, (state, action) => {
        state.heatmap.loading = false;
        state.heatmap.error = action.payload as string;
      });

    // Segment Comparison
    builder
      .addCase(fetchSegmentComparisonData.pending, (state) => {
        state.segmentComparison.loading = true;
        state.segmentComparison.error = null;
      })
      .addCase(fetchSegmentComparisonData.fulfilled, (state, action: PayloadAction<SegmentComparisonData[]>) => {
        state.segmentComparison.loading = false;
        state.segmentComparison.data = action.payload;
      })
      .addCase(fetchSegmentComparisonData.rejected, (state, action) => {
        state.segmentComparison.loading = false;
        state.segmentComparison.error = action.payload as string;
      });

    // User Preferences
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.userPreferences.loading = true;
        state.userPreferences.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action: PayloadAction<UserPreferences>) => {
        state.userPreferences.loading = false;
        state.userPreferences.data = action.payload;
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.userPreferences.loading = false;
        state.userPreferences.error = action.payload as string;
      });

    // Save User Preferences
    builder
      .addCase(saveUserPreferences.pending, (state) => {
        state.userPreferences.loading = true;
        state.userPreferences.error = null;
      })
      .addCase(saveUserPreferences.fulfilled, (state, action: PayloadAction<UserPreferences>) => {
        state.userPreferences.loading = false;
        state.userPreferences.data = action.payload;
      })
      .addCase(saveUserPreferences.rejected, (state, action) => {
        state.userPreferences.loading = false;
        state.userPreferences.error = action.payload as string;
      });
  }
});

// Export selectors with null checks
export const selectDailyActionsData = (state: RootState) => state?.integratedReports?.dailyActions || { data: [], loading: false, error: null };
export const selectPlayerData = (state: RootState) => state?.integratedReports?.players || { data: [], loading: false, error: null };
export const selectGameData = (state: RootState) => state?.integratedReports?.games || { data: [], loading: false, error: null };
export const selectDashboardSummary = (state: RootState) => state?.integratedReports?.dashboardSummary || { data: null, loading: false, error: null };
export const selectRevenueChartData = (state: RootState) => state?.integratedReports?.revenueChart || { data: [], loading: false, error: null };
export const selectRegistrationsChartData = (state: RootState) => state?.integratedReports?.registrationsChart || { data: [], loading: false, error: null };
export const selectTopGamesData = (state: RootState) => state?.integratedReports?.topGames || { data: [], loading: false, error: null };
export const selectRecentTransactionsData = (state: RootState) => state?.integratedReports?.recentTransactions || { data: [], loading: false, error: null };
export const selectHeatmapData = (state: RootState) => state?.integratedReports?.heatmap || { data: [], loading: false, error: null };
export const selectSegmentComparisonData = (state: RootState) => state?.integratedReports?.segmentComparison || { data: [], loading: false, error: null };
export const selectUserPreferences = (state: RootState) => state?.integratedReports?.userPreferences || { data: null, loading: false, error: null };

export default integratedReportsSlice.reducer;
