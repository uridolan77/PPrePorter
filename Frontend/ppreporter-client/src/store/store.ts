import { configureStore, combineReducers } from '@reduxjs/toolkit';
import dashboardReducer from './slices/dashboardSlice';
import authReducer from './slices/authSlice';
import reportsReducer from './slices/reportsSlice';
import naturalLanguageReducer from './slices/naturalLanguageSlice';
import entitiesReducer from './slices/entitiesSlice';
import uiReducer from './slices/uiSlice';
import dailyActionGamesReducer from './slices/dailyActionGamesSlice';
import integratedReportsReducer from './slices/integratedReportsSlice';
import analyticsReducer from '../features/analytics/store/slice';
import { RootState } from '../types/redux';

// Combine all reducers
const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  auth: authReducer,
  reports: reportsReducer,
  naturalLanguage: naturalLanguageReducer,
  entities: entitiesReducer,
  ui: uiReducer,
  dailyActionGames: dailyActionGamesReducer,
  integratedReports: integratedReportsReducer,
  analytics: analyticsReducer
});

// Configure the Redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in action payloads
        ignoredActionPaths: [
          'payload.timestamp',
          'meta.arg.startDate',
          'meta.arg.endDate'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'reports.scheduledReports',
          'dashboard.segmentComparisonData',
          'naturalLanguage.originalEntities',
          'entities.errors',
          'ui.notifications'
        ],
      },
    }),
});

// Export types for dispatch and selector
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof store.getState>;
export type { RootState };

export default store;
