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
    const response = await apiClient.get<ApiResponse<Game[]>>('/games', { params });
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
    const response = await apiClient.get<Game>(`/games/${id}`);
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
    const response = await apiClient.get<GamePerformance>(`/games/${id}/performance`, { params });
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
    const response = await apiClient.get<Game[]>('/games/top', { params });
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
    const response = await apiClient.get<GameCategory[]>('/games/categories');
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
    const response = await apiClient.get<GameProvider[]>('/games/providers');
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
    const response = await apiClient.get<PlayerDemographics>(`/games/${id}/player-demographics`);
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
    const response = await apiClient.get<GameSession[]>(`/games/${id}/sessions`, { params });
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
    const response = await apiClient.get('/games/export', {
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
