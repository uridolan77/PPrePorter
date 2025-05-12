import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../store/store';
import { DATE_FORMAT_OPTIONS } from '../constants';

/**
 * Select the analytics state from the root state
 */
export const selectAnalyticsState = (state: RootState) => state.analytics;

/**
 * Select the active tab index
 */
export const selectActiveTab = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.activeTab
);

/**
 * Select the dashboard summary statistics
 */
export const selectSummaryStats = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.summaryStats
);

/**
 * Select the recent transactions
 */
export const selectRecentTransactions = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.recentTransactions
);

/**
 * Select the casino revenue data
 */
export const selectCasinoRevenue = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.casinoRevenue
);

/**
 * Select the top games data
 */
export const selectTopGames = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.topGames
);

/**
 * Select the player registrations data
 */
export const selectPlayerRegistrations = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.playerRegistrations
);

/**
 * Select the loading state
 */
export const selectIsLoading = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.isLoading
);

/**
 * Select the error state
 */
export const selectError = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.error
);

/**
 * Select the filter options
 */
export const selectFilters = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.filters
);

/**
 * Select the last updated timestamp
 */
export const selectLastUpdated = createSelector(
  [selectAnalyticsState],
  (analytics) => analytics.lastUpdated
);

/**
 * Select the formatted last updated time
 */
export const selectFormattedLastUpdated = createSelector(
  [selectLastUpdated],
  (lastUpdated) => {
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString(undefined, DATE_FORMAT_OPTIONS);
  }
);

/**
 * Select all dashboard data
 */
export const selectDashboardData = createSelector(
  [
    selectSummaryStats,
    selectRecentTransactions,
    selectCasinoRevenue,
    selectTopGames,
    selectPlayerRegistrations
  ],
  (summaryStats, recentTransactions, casinoRevenue, topGames, playerRegistrations) => ({
    summaryStats,
    recentTransactions,
    casinoRevenue,
    topGames,
    playerRegistrations
  })
);

/**
 * Select props for the overview tab
 */
export const selectOverviewTabProps = createSelector(
  [selectSummaryStats, selectRecentTransactions, selectIsLoading, selectError],
  (summaryStats, recentTransactions, isLoading, error) => ({
    summaryStats,
    recentTransactions,
    isLoading,
    error
  })
);

/**
 * Select props for the performance tab
 */
export const selectPerformanceTabProps = createSelector(
  [selectCasinoRevenue, selectIsLoading, selectError],
  (casinoRevenue, isLoading, error) => ({
    casinoRevenue,
    isLoading,
    error
  })
);

/**
 * Select props for the player analysis tab
 */
export const selectPlayerAnalysisTabProps = createSelector(
  [selectPlayerRegistrations, selectIsLoading, selectError],
  (playerRegistrations, isLoading, error) => ({
    playerRegistrations,
    isLoading,
    error
  })
);

/**
 * Select props for the game analysis tab
 */
export const selectGameAnalysisTabProps = createSelector(
  [selectTopGames, selectIsLoading, selectError],
  (topGames, isLoading, error) => ({
    topGames,
    isLoading,
    error
  })
);
