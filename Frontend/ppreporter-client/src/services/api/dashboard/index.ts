/**
 * Dashboard API Services Index
 * Exports all dashboard-related API services
 */

import summaryService from './summaryService';
import revenueService from './revenueService';
import registrationsService from './registrationsService';
import topGamesService from './topGamesService';
import transactionsService from './transactionsService';
import contextualService from './contextualService';
import playerJourneyService from './playerJourneyService';
import heatmapService from './heatmapService';
import segmentComparisonService from './segmentComparisonService';
import microChartsService from './microChartsService';
import preferencesService from './preferencesService';
import a11yService from './a11yService';

/**
 * Combined dashboard service
 */
const dashboardService = {
  // Get all dashboard data in one call
  getDashboardData: async (filters?: any) => {
    try {
      // This is a convenience method that calls the main dashboard endpoint
      // that returns all dashboard data in a single call
      const response = await fetch(`/api/Dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: filters ? JSON.stringify(filters) : undefined,
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // Summary stats
  getDashboardSummary: summaryService.getDashboardSummary,

  // Revenue chart
  getRevenueChart: revenueService.getRevenueChart,

  // Registrations chart
  getRegistrationsChart: registrationsService.getRegistrationsChart,

  // Top games
  getTopGames: topGamesService.getTopGames,

  // Recent transactions
  getRecentTransactions: transactionsService.getRecentTransactions,

  // Contextual explorer
  getContextualExplorer: contextualService.getContextualExplorer,

  // Player journey
  getPlayerJourney: playerJourneyService.getPlayerJourney,

  // Heatmap
  getHeatmap: heatmapService.getHeatmap,

  // Segment comparison
  getSegmentComparison: segmentComparisonService.getSegmentComparison,

  // Micro charts
  getMicroCharts: microChartsService.getMicroCharts,

  // User preferences
  getUserPreferences: preferencesService.getUserPreferences,
  saveUserPreferences: preferencesService.saveUserPreferences,

  // Accessibility optimized
  getA11yOptimized: a11yService.getA11yOptimized,
};

export default dashboardService;
