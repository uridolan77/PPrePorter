import apiClient from './apiClient';
import { DailyActionGamesResponse, DailyActionGame } from '../../types/reports';
import { API_ENDPOINTS } from '../../config/constants';

/**
 * Query parameters for daily action games
 */
export interface DailyActionGamesQueryParams {
  /**
   * Start date (YYYY-MM-DD)
   */
  startDate?: string;

  /**
   * End date (YYYY-MM-DD)
   */
  endDate?: string;

  /**
   * Player ID
   */
  playerId?: number;

  /**
   * Game ID
   */
  gameId?: number;

  /**
   * API version
   */
  'api-version'?: string;
}

/**
 * Service for Daily Action Games API integration
 */
class DailyActionGamesService {
  /**
   * Get daily action games data
   * @param params Query parameters
   * @returns Promise with daily action games data
   */
  async getData(params: DailyActionGamesQueryParams = {}): Promise<DailyActionGamesResponse> {
    try {
      console.log('[DAILY_ACTION_GAMES_SERVICE] Fetching data with params:', params);
      // Use the correct API endpoint from constants
      const endpoint = API_ENDPOINTS.REPORTS.DAILY_ACTION_GAMES + '/data';
      console.log('[DAILY_ACTION_GAMES_SERVICE] Using API endpoint:', endpoint);
      const response = await apiClient.get<any>(
        endpoint,
        { params }
      );
      console.log('[DAILY_ACTION_GAMES_SERVICE] Raw response data:', response.data);

      // Based on the screenshot, the response appears to be an array of objects with properties like
      // id, gameDate, playerId, gameId, platform, etc.

      // Check if the response has the expected structure
      if (response.data && Array.isArray(response.data)) {
        // If the response is an array, wrap it in the expected structure
        console.log('[DAILY_ACTION_GAMES_SERVICE] Converting array response to expected format');

        // Map the response data to our expected format
        const mappedData = response.data.map((item: any, index: number) => {
          // Create a game object with default values
          const game: DailyActionGame = {
            id: item.id || index + 1,
            gameDate: item.gameDate || new Date().toISOString(),
            playerId: typeof item.playerId === 'number' ? item.playerId : 0,
            gameId: typeof item.gameId === 'number' ? item.gameId : 0,
            platform: item.platform || 'Unknown',
            realBetAmount: typeof item.realBetAmount === 'number' ? item.realBetAmount : 0,
            realWinAmount: typeof item.realWinAmount === 'number' ? item.realWinAmount : 0,
            bonusBetAmount: typeof item.bonusBetAmount === 'number' ? item.bonusBetAmount : 0,
            bonusWinAmount: typeof item.bonusWinAmount === 'number' ? item.bonusWinAmount : 0,
            netGamingRevenue: typeof item.netGamingRevenue === 'number' ? item.netGamingRevenue : 0,
            numberOfRealBets: typeof item.numberOfRealBets === 'number' ? item.numberOfRealBets : 0,
            numberOfBonusBets: typeof item.numberOfBonusBets === 'number' ? item.numberOfBonusBets : 0,
            numberOfSessions: typeof item.numberOfSessions === 'number' ? item.numberOfSessions : 0,
            numberOfRealWins: typeof item.numberOfRealWins === 'number' ? item.numberOfRealWins : 0,
            numberOfBonusWins: typeof item.numberOfBonusWins === 'number' ? item.numberOfBonusWins : 0,
            realBetAmountOriginal: typeof item.realBetAmountOriginal === 'number' ? item.realBetAmountOriginal : 0,
            realWinAmountOriginal: typeof item.realWinAmountOriginal === 'number' ? item.realWinAmountOriginal : 0,
            bonusBetAmountOriginal: typeof item.bonusBetAmountOriginal === 'number' ? item.bonusBetAmountOriginal : 0,
            bonusWinAmountOriginal: typeof item.bonusWinAmountOriginal === 'number' ? item.bonusWinAmountOriginal : 0,
            netGamingRevenueOriginal: typeof item.netGamingRevenueOriginal === 'number' ? item.netGamingRevenueOriginal : 0,
            updateDate: item.updateDate || new Date().toISOString()
          };

          console.log(`[DAILY_ACTION_GAMES_SERVICE] Mapped game ${index}:`, game);
          return game;
        });

        const formattedResponse: DailyActionGamesResponse = {
          data: mappedData,
          totalCount: mappedData.length,
          startDate: params.startDate || new Date().toISOString().split('T')[0],
          endDate: params.endDate || new Date().toISOString().split('T')[0]
        };

        console.log('[DAILY_ACTION_GAMES_SERVICE] Formatted response:', formattedResponse);
        return formattedResponse;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // If the response already has the expected structure
        console.log('[DAILY_ACTION_GAMES_SERVICE] Response already in expected format');
        return response.data as DailyActionGamesResponse;
      } else if (response.data && typeof response.data === 'object') {
        // If the response is an object but not in the expected format,
        // try to extract data from it
        console.log('[DAILY_ACTION_GAMES_SERVICE] Response is an object, trying to extract data');

        // Create an array from the object values if possible
        const extractedData = Object.values(response.data).filter(item => item && typeof item === 'object');

        if (extractedData.length > 0) {
          console.log('[DAILY_ACTION_GAMES_SERVICE] Extracted data from object:', extractedData);

          // Map the extracted data to our expected format
          const mappedData = extractedData.map((item: any, index: number) => {
            // Create a game object with default values
            const game: DailyActionGame = {
              id: item.id || index + 1,
              gameDate: item.gameDate || new Date().toISOString(),
              playerId: typeof item.playerId === 'number' ? item.playerId : 0,
              gameId: typeof item.gameId === 'number' ? item.gameId : 0,
              platform: item.platform || 'Unknown',
              realBetAmount: typeof item.realBetAmount === 'number' ? item.realBetAmount : 0,
              realWinAmount: typeof item.realWinAmount === 'number' ? item.realWinAmount : 0,
              bonusBetAmount: typeof item.bonusBetAmount === 'number' ? item.bonusBetAmount : 0,
              bonusWinAmount: typeof item.bonusWinAmount === 'number' ? item.bonusWinAmount : 0,
              netGamingRevenue: typeof item.netGamingRevenue === 'number' ? item.netGamingRevenue : 0,
              numberOfRealBets: typeof item.numberOfRealBets === 'number' ? item.numberOfRealBets : 0,
              numberOfBonusBets: typeof item.numberOfBonusBets === 'number' ? item.numberOfBonusBets : 0,
              numberOfSessions: typeof item.numberOfSessions === 'number' ? item.numberOfSessions : 0,
              numberOfRealWins: typeof item.numberOfRealWins === 'number' ? item.numberOfRealWins : 0,
              numberOfBonusWins: typeof item.numberOfBonusWins === 'number' ? item.numberOfBonusWins : 0,
              realBetAmountOriginal: typeof item.realBetAmountOriginal === 'number' ? item.realBetAmountOriginal : 0,
              realWinAmountOriginal: typeof item.realWinAmountOriginal === 'number' ? item.realWinAmountOriginal : 0,
              bonusBetAmountOriginal: typeof item.bonusBetAmountOriginal === 'number' ? item.bonusBetAmountOriginal : 0,
              bonusWinAmountOriginal: typeof item.bonusWinAmountOriginal === 'number' ? item.bonusWinAmountOriginal : 0,
              netGamingRevenueOriginal: typeof item.netGamingRevenueOriginal === 'number' ? item.netGamingRevenueOriginal : 0,
              updateDate: item.updateDate || new Date().toISOString()
            };

            return game;
          });

          const formattedResponse: DailyActionGamesResponse = {
            data: mappedData,
            totalCount: mappedData.length,
            startDate: params.startDate || new Date().toISOString().split('T')[0],
            endDate: params.endDate || new Date().toISOString().split('T')[0]
          };

          console.log('[DAILY_ACTION_GAMES_SERVICE] Formatted response from extracted data:', formattedResponse);
          return formattedResponse;
        }
      }

      // If we couldn't extract data in any way, return an empty response
      console.warn('[DAILY_ACTION_GAMES_SERVICE] Unexpected response format, returning empty data');
      return {
        data: [],
        totalCount: 0,
        startDate: params.startDate || new Date().toISOString().split('T')[0],
        endDate: params.endDate || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('[DAILY_ACTION_GAMES_SERVICE] Error fetching data:', error);
      throw error;
    }
  }

  /**
   * Export daily action games data
   * @param params Query parameters
   * @param format Export format (csv, excel, pdf)
   * @returns Promise with blob data
   */
  async exportData(
    params: DailyActionGamesQueryParams = {},
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<Blob> {
    try {
      console.log('[DAILY_ACTION_GAMES_SERVICE] Exporting data with params:', { ...params, format });

      const exportParams = {
        ...params,
        format
      };

      // Use the correct API endpoint from constants
      const endpoint = API_ENDPOINTS.REPORTS.DAILY_ACTION_GAMES + '/export';
      console.log('[DAILY_ACTION_GAMES_SERVICE] Using API endpoint:', endpoint);
      const response = await apiClient.get(endpoint, {
        params: exportParams,
        responseType: 'blob'
      });

      console.log('[DAILY_ACTION_GAMES_SERVICE] Export response received');
      return response.data;
    } catch (error) {
      console.error('[DAILY_ACTION_GAMES_SERVICE] Error exporting data:', error);
      throw error;
    }
  }
}

export default new DailyActionGamesService();
