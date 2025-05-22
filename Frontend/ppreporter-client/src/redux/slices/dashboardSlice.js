import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API call
const fetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: {
          total: 5248 + Math.floor(Math.random() * 200),
          trend: 12.5 + (Math.random() * 2 - 1),
          isUp: true
        },
        revenue: {
          total: 138750 + Math.floor(Math.random() * 5000),
          trend: -2.3 + (Math.random() * 2 - 1),
          isUp: false
        },
        games: {
          total: 325 + Math.floor(Math.random() * 10),
          trend: 5.7 + (Math.random() * 2 - 1),
          isUp: true
        }
      });
    }, 1000);
  });
};

// Async thunk for fetching dashboard data
export const getDashboardData = createAsyncThunk(
  'dashboard/getData',
  async () => {
    const response = await fetchDashboardData();
    return response;
  }
);

// Initial state
const initialState = {
  users: {
    total: 0,
    trend: 0,
    isUp: true
  },
  revenue: {
    total: 0,
    trend: 0,
    isUp: true
  },
  games: {
    total: 0,
    trend: 0,
    isUp: true
  },
  loading: false,
  error: null
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.revenue = action.payload.revenue;
        state.games = action.payload.games;
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

// Export selector
export const selectDashboard = (state) => state.dashboard;

// Export reducer
export default dashboardSlice.reducer;
