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
      console.log('[REDUX THUNK] Starting fetchDailyActionGames with params:', params);

      // Use default filters if no params provided
      const queryParams = {
        ...params
      };

      console.log('[REDUX THUNK] Calling service with queryParams:', queryParams);
      const response = await dailyActionGamesService.getData(queryParams);
      console.log('[REDUX THUNK] Service response received:', response);
      console.log('[REDUX THUNK] Response type:', typeof response);
      console.log('[REDUX THUNK] Response is array:', Array.isArray(response));

      return response;
    } catch (error) {
      console.error('[REDUX THUNK] Error in fetchDailyActionGames:', error);
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.message || 'Failed to fetch daily action games data';
      console.error('[REDUX THUNK] Rejecting with error:', errorMessage);
      return rejectWithValue(errorMessage);
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
        console.log('Action payload type:', typeof action.payload);
        console.log('Action payload is array:', Array.isArray(action.payload));
        state.loading = false;

        // Ensure we have valid data
        if (action.payload && action.payload.data) {
          // If the response has the expected structure with a data property
          console.log('Processing payload.data:', action.payload.data);
          console.log('payload.data is array:', Array.isArray(action.payload.data));
          console.log('payload.data length:', action.payload.data.length);
          state.data = action.payload.data;
          state.totalCount = action.payload.totalCount || action.payload.data.length;
          state.startDate = action.payload.startDate || null;
          state.endDate = action.payload.endDate || null;
          console.log('Daily Action Games Data processed from payload.data:', state.data);
          console.log('State data length after assignment:', state.data.length);
        } else if (action.payload && Array.isArray(action.payload)) {
          // If the response is an array directly
          console.log('Processing array payload:', action.payload);
          console.log('Array payload length:', action.payload.length);
          state.data = action.payload;
          state.totalCount = action.payload.length;
          state.startDate = null;
          state.endDate = null;
          console.log('Daily Action Games Data processed from array payload:', state.data);
          console.log('State data length after assignment:', state.data.length);
        } else {
          console.warn('Invalid data format received from API');
          console.log('Payload structure:', action.payload);
          state.data = [];
          state.totalCount = 0;
        }
      })
      .addCase(fetchDailyActionGames.rejected, (state, action) => {
        console.error('[REDUX SLICE] fetchDailyActionGames.rejected triggered');
        console.error('[REDUX SLICE] Rejection payload:', action.payload);
        console.error('[REDUX SLICE] Rejection error:', action.error);
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
