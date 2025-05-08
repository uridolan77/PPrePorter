// filepath: c:\dev\PPrePorter\Frontend\ppreporter-client\src\store\slices\reportsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import playersService from '../../services/api/playersService';
import dailyActionsService from '../../services/api/dailyActionsService';

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
  players: {
    data: null,
    metadata: null,
    loading: false,
    error: null,
    selectedPlayer: null,
    playerDetails: null
  },
  dailyActions: {
    data: null,
    metadata: null,
    loading: false,
    error: null
  },
  configurations: {
    saved: [],
    loading: false,
    error: null
  }
};

// Daily Actions Report actions
export const fetchDailyActionsData = createAsyncThunk(
  'reports/fetchDailyActionsData',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await dailyActionsService.getData(filters);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchDailyActionsMetadata = createAsyncThunk(
  'reports/fetchDailyActionsMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const metadata = await dailyActionsService.getMetadata();
      return metadata;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Players Report actions
export const fetchPlayersData = createAsyncThunk(
  'reports/fetchPlayersData',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await playersService.getData(filters);
      return data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchPlayersMetadata = createAsyncThunk(
  'reports/fetchPlayersMetadata',
  async (_, { rejectWithValue }) => {
    try {
      const metadata = await playersService.getMetadata();
      return metadata;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchPlayerDetails = createAsyncThunk(
  'reports/fetchPlayerDetails',
  async (playerId, { rejectWithValue }) => {
    try {
      const details = await playersService.getPlayerDetails(playerId);
      return details;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Saved Configurations actions
export const fetchSavedConfigurations = createAsyncThunk(
  'reports/fetchSavedConfigurations',
  async (reportType, { rejectWithValue }) => {
    try {
      let configs;
      if (reportType === 'players') {
        configs = await playersService.getSavedConfigurations();
      } else {
        configs = await dailyActionsService.getSavedConfigurations();
      }
      return { reportType, configs };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const saveReportConfiguration = createAsyncThunk(
  'reports/saveReportConfiguration',
  async ({ reportType, config }, { rejectWithValue }) => {
    try {
      let savedConfig;
      if (reportType === 'players') {
        savedConfig = await playersService.saveConfiguration(config);
      } else {
        savedConfig = await dailyActionsService.saveConfiguration(config);
      }
      return { reportType, config: savedConfig };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportData: (state, action) => {
      const reportType = action.payload;
      if (reportType === 'players') {
        state.players.data = null;
        state.players.error = null;
      } else if (reportType === 'dailyActions') {
        state.dailyActions.data = null;
        state.dailyActions.error = null;
      }
    },
    setSelectedPlayer: (state, action) => {
      state.players.selectedPlayer = action.payload;
    },
    clearSelectedPlayer: (state) => {
      state.players.selectedPlayer = null;
      state.players.playerDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Daily Actions Report
      .addCase(fetchDailyActionsData.pending, (state) => {
        state.dailyActions.loading = true;
        state.dailyActions.error = null;
      })
      .addCase(fetchDailyActionsData.fulfilled, (state, action) => {
        state.dailyActions.data = action.payload;
        state.dailyActions.loading = false;
      })
      .addCase(fetchDailyActionsData.rejected, (state, action) => {
        state.dailyActions.error = action.payload;
        state.dailyActions.loading = false;
      })
      .addCase(fetchDailyActionsMetadata.pending, (state) => {
        state.dailyActions.loading = true;
      })
      .addCase(fetchDailyActionsMetadata.fulfilled, (state, action) => {
        state.dailyActions.metadata = action.payload;
        state.dailyActions.loading = false;
      })
      .addCase(fetchDailyActionsMetadata.rejected, (state, action) => {
        state.dailyActions.error = action.payload;
        state.dailyActions.loading = false;
      })

      // Players Report
      .addCase(fetchPlayersData.pending, (state) => {
        state.players.loading = true;
        state.players.error = null;
      })
      .addCase(fetchPlayersData.fulfilled, (state, action) => {
        state.players.data = action.payload;
        state.players.loading = false;
      })
      .addCase(fetchPlayersData.rejected, (state, action) => {
        state.players.error = action.payload;
        state.players.loading = false;
      })
      .addCase(fetchPlayersMetadata.pending, (state) => {
        state.players.loading = true;
      })
      .addCase(fetchPlayersMetadata.fulfilled, (state, action) => {
        state.players.metadata = action.payload;
        state.players.loading = false;
      })
      .addCase(fetchPlayersMetadata.rejected, (state, action) => {
        state.players.error = action.payload;
        state.players.loading = false;
      })
      .addCase(fetchPlayerDetails.pending, (state) => {
        state.players.loading = true;
      })
      .addCase(fetchPlayerDetails.fulfilled, (state, action) => {
        state.players.playerDetails = action.payload;
        state.players.loading = false;
      })
      .addCase(fetchPlayerDetails.rejected, (state, action) => {
        state.players.error = action.payload;
        state.players.loading = false;
      })

      // Configurations
      .addCase(fetchSavedConfigurations.pending, (state) => {
        state.configurations.loading = true;
        state.configurations.error = null;
      })
      .addCase(fetchSavedConfigurations.fulfilled, (state, action) => {
        state.configurations.saved = action.payload.configs;
        state.configurations.loading = false;
      })
      .addCase(fetchSavedConfigurations.rejected, (state, action) => {
        state.configurations.error = action.payload;
        state.configurations.loading = false;
      })
      .addCase(saveReportConfiguration.pending, (state) => {
        state.configurations.loading = true;
        state.configurations.error = null;
      })
      .addCase(saveReportConfiguration.fulfilled, (state, action) => {
        // Add the new config to the saved list if it doesn't exist already
        const exists = state.configurations.saved.some(
          config => config.id === action.payload.config.id
        );
        
        if (!exists) {
          state.configurations.saved.push(action.payload.config);
        }
        
        state.configurations.loading = false;
      })
      .addCase(saveReportConfiguration.rejected, (state, action) => {
        state.configurations.error = action.payload;
        state.configurations.loading = false;
      });
  }
});

export const { 
  clearReportData, 
  setSelectedPlayer, 
  clearSelectedPlayer 
} = reportsSlice.actions;

export default reportsSlice.reducer;