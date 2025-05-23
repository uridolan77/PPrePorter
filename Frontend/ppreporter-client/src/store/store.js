import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import authReducer from './slices/authSlice';
import reportsReducer from './slices/reportsSlice';
import naturalLanguageReducer from './slices/naturalLanguageSlice';
import dailyActionGamesReducer from './slices/dailyActionGamesSlice';

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    auth: authReducer,
    reports: reportsReducer,
    naturalLanguage: naturalLanguageReducer,
    dailyActionGames: dailyActionGamesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in action payloads
        ignoredActionPaths: ['payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: [
          'reports.scheduledReports',
          'dashboard.segmentComparisonData',
          'naturalLanguage.originalEntities'
        ],
      },
    }),
});

export default store;