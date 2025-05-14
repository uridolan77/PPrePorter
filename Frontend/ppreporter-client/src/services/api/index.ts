import apiClient from './apiClient';
import dashboardService from './dashboardService';
import contextualService from './contextualService';
import playersService from './playersService';
import gamesService from './gamesService';
import dailyActionGamesService from './dailyActionGamesService';
import financialService from './financialService';
import performanceService from './performanceService';
import geographicService from './geographicService';

/**
 * API services index
 * Exports all API services for centralized access
 */
export default {
  client: apiClient,
  dashboard: dashboardService,
  contextual: contextualService,
  players: playersService,
  games: gamesService,
  dailyActionGames: dailyActionGamesService,
  financial: financialService,
  performance: performanceService,
  geographic: geographicService
};
