import apiClient from './apiClient';
import dashboardService from './dashboardService';
import contextualService from './contextualService';
import playersService from './playersService';
import gamesService from './gamesService';
import dailyActionGamesService from './dailyActionGamesService';

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
  dailyActionGames: dailyActionGamesService
};
