import { configureStore } from '@reduxjs/toolkit';

// Import your reducers here
import userReducer from './slices/userSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    user: userReducer,
    dashboard: dashboardReducer,
  },
  // Add middleware or other store enhancers if needed
});

export default store;
