import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

// Auth selectors
export const selectAuthState = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectCurrentUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

// Dashboard selectors
export const selectDashboardState = (state: RootState) => state.dashboard;

export const selectDashboardData = createSelector(
  [selectDashboardState],
  (dashboard) => ({
    summaryStats: dashboard.summaryStats,
    casinoRevenue: dashboard.casinoRevenue,
    playerRegistrations: dashboard.playerRegistrations,
    topGames: dashboard.topGames,
    recentTransactions: dashboard.recentTransactions,
    heatmapData: dashboard.heatmapData,
    playerJourneyData: dashboard.playerJourneyData,
    segmentComparisonData: dashboard.segmentComparisonData
  })
);

export const selectDashboardLoading = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.isLoading
);

export const selectDashboardError = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.error
);

export const selectSummaryStats = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.summaryStats
);

export const selectCasinoRevenue = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.casinoRevenue
);

export const selectPlayerRegistrations = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.playerRegistrations
);

export const selectTopGames = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.topGames
);

export const selectRecentTransactions = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.recentTransactions
);

export const selectHeatmapData = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.heatmapData
);

export const selectPlayerJourneyData = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.playerJourneyData
);

export const selectSegmentComparisonData = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.segmentComparisonData
);

export const selectComponentErrors = createSelector(
  [selectDashboardState],
  (dashboard) => dashboard.componentErrors
);

// Computed selectors that combine data
export const selectDashboardSummary = createSelector(
  [selectSummaryStats, selectDashboardLoading, selectComponentErrors],
  (summaryStats, loading, errors) => ({
    data: summaryStats,
    loading,
    error: errors?.summary || null
  })
);

export const selectRevenueChartData = createSelector(
  [selectCasinoRevenue, selectDashboardLoading, selectComponentErrors],
  (casinoRevenue, loading, errors) => ({
    data: casinoRevenue,
    loading,
    error: errors?.revenue || null
  })
);

export const selectRegistrationsChartData = createSelector(
  [selectPlayerRegistrations, selectDashboardLoading, selectComponentErrors],
  (playerRegistrations, loading, errors) => ({
    data: playerRegistrations,
    loading,
    error: errors?.registrations || null
  })
);

export const selectTopGamesChartData = createSelector(
  [selectTopGames, selectDashboardLoading, selectComponentErrors],
  (topGames, loading, errors) => ({
    data: topGames,
    loading,
    error: errors?.topGames || null
  })
);

export const selectTransactionsTableData = createSelector(
  [selectRecentTransactions, selectDashboardLoading, selectComponentErrors],
  (recentTransactions, loading, errors) => ({
    data: recentTransactions,
    loading,
    error: errors?.transactions || null
  })
);

// Reports selectors
export const selectReportsState = (state: RootState) => state.reports;

export const selectReportsData = createSelector(
  [selectReportsState],
  (reports) => ({
    players: reports.players.data,
    dailyActions: reports.dailyActions.data
  })
);

export const selectReportsLoading = createSelector(
  [selectReportsState],
  (reports) => reports.players.loading || reports.dailyActions.loading
);

export const selectReportsError = createSelector(
  [selectReportsState],
  (reports) => reports.players.error || reports.dailyActions.error
);

// UI selectors
export const selectUIState = (state: RootState) => state.ui;

export const selectSidebarOpen = createSelector(
  [selectUIState],
  (ui) => ui.sidebarOpen
);

export const selectDarkMode = createSelector(
  [selectUIState],
  (ui) => ui.darkMode
);

export const selectActiveTab = createSelector(
  [selectUIState],
  (ui) => ui.activeTab
);

// Combined selectors for components
export const selectDashboardTabsProps = createSelector(
  [selectDashboardData, selectDashboardLoading, selectDashboardError, selectActiveTab],
  (data, loading, error, activeTab) => ({
    dashboardData: data,
    isLoading: loading,
    error,
    activeTab
  })
);
