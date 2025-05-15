import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import dailyActionGamesService, { DailyActionGamesQueryParams } from '../../services/api/dailyActionGamesService';
import { DailyActionGame, DailyActionGamesResponse } from '../../types/reports';
import { RootState } from '../../types/redux';

// Define the state interface
export interface DailyActionGamesState {
  data: DailyActionGame[];
  totalCount: number;
  startDate: string | null;
  endDate: string | null;
  loading: boolean;
  error: string | null;
  filters: DailyActionGamesQueryParams;
}

// Initial state
const initialState: DailyActionGamesState = {
  data: [],
  totalCount: 0,
  startDate: null,
  endDate: null,
  loading: false,
  error: null,
  filters: {
    startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  }
};

// Async thunk for fetching daily action games data
export const fetchDailyActionGames = createAsyncThunk<
  DailyActionGamesResponse,
  DailyActionGamesQueryParams | undefined,
  { rejectValue: string }
>(
  'dailyActionGames/fetchData',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Use default filters if no params provided
      const queryParams = {
        ...params
      };

      const response = await dailyActionGamesService.getData(queryParams);
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      return rejectWithValue(
        axiosError.message || 'Failed to fetch daily action games data'
      );
    }
  }
);

// Create the slice
const dailyActionGamesSlice = createSlice({
  name: 'dailyActionGames',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<DailyActionGamesQueryParams>) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filters = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchDailyActionGames
      .addCase(fetchDailyActionGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyActionGames.fulfilled, (state, action) => {
        console.log('Daily Action Games API Response:', action.payload);
        state.loading = false;

        // Ensure we have valid data
        if (action.payload && action.payload.data) {
          // If the response has the expected structure with a data property
          state.data = action.payload.data;
          state.totalCount = action.payload.totalCount || action.payload.data.length;
          state.startDate = action.payload.startDate || null;
          state.endDate = action.payload.endDate || null;
          console.log('Daily Action Games Data processed from payload.data:', state.data);
        } else if (action.payload && Array.isArray(action.payload)) {
          // If the response is an array directly
          state.data = action.payload;
          state.totalCount = action.payload.length;
          state.startDate = null;
          state.endDate = null;
          console.log('Daily Action Games Data processed from array payload:', state.data);
        } else if (action.payload) {
          // Try to extract data from any other structure
          console.log('Trying to extract data from non-standard response structure');

          // Check if it's an object with any array properties
          const payloadObj = action.payload as Record<string, any>;
          const arrayProps = Object.entries(payloadObj)
            .filter(([_, value]) => Array.isArray(value))
            .sort(([_, a], [__, b]) => (b as any[]).length - (a as any[]).length);

          if (arrayProps.length > 0) {
            // Use the largest array property
            const [propName, propValue] = arrayProps[0];
            console.log(`Found array property "${propName}" with ${propValue.length} items`);
            state.data = propValue;
            state.totalCount = propValue.length;
          } else {
            // Last resort: try to convert the object itself to an array
            const extractedArray = Object.values(payloadObj).filter(item => item && typeof item === 'object');
            if (extractedArray.length > 0) {
              console.log(`Extracted ${extractedArray.length} items from object values`);
              state.data = extractedArray;
              state.totalCount = extractedArray.length;
            } else {
              console.warn('Could not extract any array data from response');
              state.data = [];
              state.totalCount = 0;
            }
          }
        } else {
          console.warn('Invalid data format received from API');
          state.data = [];
          state.totalCount = 0;
        }
      })
      .addCase(fetchDailyActionGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch daily action games data';
      });
  }
});

// Export actions
export const { setFilters, clearFilters, clearError } = dailyActionGamesSlice.actions;

// Export selectors
export const selectDailyActionGames = (state: RootState) => state.dailyActionGames?.data || [];
export const selectDailyActionGamesLoading = (state: RootState) => state.dailyActionGames?.loading || false;
export const selectDailyActionGamesError = (state: RootState) => state.dailyActionGames?.error || null;
export const selectDailyActionGamesFilters = (state: RootState) => state.dailyActionGames?.filters || {};
export const selectDailyActionGamesTotalCount = (state: RootState) => state.dailyActionGames?.totalCount || 0;
export const selectDailyActionGamesDateRange = (state: RootState) => ({
  startDate: state.dailyActionGames?.startDate || null,
  endDate: state.dailyActionGames?.endDate || null
});

// Export reducer
export default dailyActionGamesSlice.reducer;
