import apiClient from './apiClient';
import {
  Game,
  GamePerformance,
  GameCategory,
  GameProvider,
  PlayerDemographics,
  GameSession,
  GamesQueryParams,
  TopGamesQueryParams,
  GamePerformanceQueryParams
} from '../../types/games';
import { ApiResponse } from '../../types/api';

/**
 * Get all games with pagination and filtering
 * @param params - Query parameters
 * @returns Promise object with games data
 */
const getGames = async (params: GamesQueryParams = {}): Promise<ApiResponse<Game[]>> => {
  try {
    console.log('[GAMES_SERVICE] Using API endpoint: /api/games');
    const response = await apiClient.get<ApiResponse<Game[]>>('/api/games', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game by ID
 * @param id - Game ID
 * @returns Promise object with game data
 */
const getGameById = async (id: string): Promise<Game> => {
  try {
    console.log(`[GAMES_SERVICE] Using API endpoint: /api/games/${id}`);
    const response = await apiClient.get<Game>(`/api/games/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game performance metrics
 * @param id - Game ID
 * @param params - Query parameters
 * @returns Promise object with game performance data
 */
const getGamePerformance = async (id: string, params: GamePerformanceQueryParams = {}): Promise<GamePerformance> => {
  try {
    console.log(`[GAMES_SERVICE] Using API endpoint: /api/games/${id}/performance`);
    const response = await apiClient.get<GamePerformance>(`/api/games/${id}/performance`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get top games by metric
 * @param params - Query parameters
 * @returns Promise object with top games data
 */
const getTopGames = async (params: TopGamesQueryParams = {}): Promise<Game[]> => {
  try {
    console.log('[GAMES_SERVICE] Using API endpoint: /api/games/top');
    const response = await apiClient.get<Game[]>('/api/games/top', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game categories
 * @returns Promise object with game categories
 */
const getGameCategories = async (): Promise<GameCategory[]> => {
  try {
    console.log('[GAMES_SERVICE] Using API endpoint: /api/games/categories');
    const response = await apiClient.get<GameCategory[]>('/api/games/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game providers
 * @returns Promise object with game providers
 */
const getGameProviders = async (): Promise<GameProvider[]> => {
  try {
    console.log('[GAMES_SERVICE] Using API endpoint: /api/games/providers');
    const response = await apiClient.get<GameProvider[]>('/api/games/providers');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game player demographics
 * @param id - Game ID
 * @returns Promise object with player demographics for the game
 */
const getGamePlayerDemographics = async (id: string): Promise<PlayerDemographics> => {
  try {
    console.log(`[GAMES_SERVICE] Using API endpoint: /api/games/${id}/player-demographics`);
    const response = await apiClient.get<PlayerDemographics>(`/api/games/${id}/player-demographics`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get game session data
 * @param id - Game ID
 * @param params - Query parameters
 * @returns Promise object with game session data
 */
const getGameSessions = async (id: string, params: GamePerformanceQueryParams = {}): Promise<GameSession[]> => {
  try {
    console.log(`[GAMES_SERVICE] Using API endpoint: /api/games/${id}/sessions`);
    const response = await apiClient.get<GameSession[]>(`/api/games/${id}/sessions`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export games data
 * @param params - Query parameters
 * @returns Promise object with blob data
 */
const exportGames = async (params: GamesQueryParams = {}): Promise<Blob> => {
  try {
    console.log('[GAMES_SERVICE] Using API endpoint: /api/games/export');
    const response = await apiClient.get('/api/games/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getGames,
  getGameById,
  getGamePerformance,
  getTopGames,
  getGameCategories,
  getGameProviders,
  getGamePlayerDemographics,
  getGameSessions,
  exportGames
};
