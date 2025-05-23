import apiClient from './apiClient';
import { DailyActionGamesResponse, DailyActionGame } from '../../types/reports';
// Import from TypeScript version of constants
import { API_ENDPOINTS } from '../../config/constants';

// Fallback endpoint in case the import structure is different
const DAILY_ACTION_GAMES_ENDPOINT = '/reports/daily-action-games';

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

      // Try to get the endpoint from the TypeScript structure, fall back to direct path if not available
      let endpoint;
      try {
        // Check if the nested structure exists
        if (API_ENDPOINTS.REPORTS && API_ENDPOINTS.REPORTS.DAILY_ACTION_GAMES) {
          endpoint = API_ENDPOINTS.REPORTS.DAILY_ACTION_GAMES + '/data';
          console.log('[DAILY_ACTION_GAMES_SERVICE] Using TypeScript structure endpoint');
        } else if ((API_ENDPOINTS as any).DAILY_ACTION_GAMES) {
          // Try the JavaScript structure
          endpoint = (API_ENDPOINTS as any).DAILY_ACTION_GAMES.GET_DATA;
          console.log('[DAILY_ACTION_GAMES_SERVICE] Using JavaScript structure endpoint');
        } else {
          // Fall back to hardcoded endpoint
          endpoint = DAILY_ACTION_GAMES_ENDPOINT + '/data';
          console.log('[DAILY_ACTION_GAMES_SERVICE] Using fallback endpoint');
        }
      } catch (error) {
        // If any error occurs during endpoint resolution, use the fallback
        console.error('[DAILY_ACTION_GAMES_SERVICE] Error resolving endpoint:', error);
        endpoint = DAILY_ACTION_GAMES_ENDPOINT + '/data';
        console.log('[DAILY_ACTION_GAMES_SERVICE] Using fallback endpoint after error');
      }

      console.log('[DAILY_ACTION_GAMES_SERVICE] Using API endpoint:', endpoint);
      const response = await apiClient.get<any>(
        endpoint,
        { params }
      );
      console.log('[DAILY_ACTION_GAMES_SERVICE] Raw response data:', response.data);

      // Based on the screenshot, the response appears to be an array of objects with properties like
      // id, gameDate, playerId, gameId, platform, etc.

      // Check if the response has the expected structure
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // If the response already has the expected structure with data property
        console.log('[DAILY_ACTION_GAMES_SERVICE] Response already has data property with array');

        // Map the response data to our expected format
        const mappedData = response.data.data.map((item: any, index: number) => {
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
      } else if (response.data && Array.isArray(response.data)) {
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

      // Try to get the endpoint from the TypeScript structure, fall back to direct path if not available
      let endpoint;
      try {
        // Check if the nested structure exists
        if (API_ENDPOINTS.REPORTS && API_ENDPOINTS.REPORTS.DAILY_ACTION_GAMES) {
          endpoint = API_ENDPOINTS.REPORTS.DAILY_ACTION_GAMES + '/export';
          console.log('[DAILY_ACTION_GAMES_SERVICE] Using TypeScript structure endpoint for export');
        } else if ((API_ENDPOINTS as any).DAILY_ACTION_GAMES) {
          // Try the JavaScript structure
          endpoint = (API_ENDPOINTS as any).DAILY_ACTION_GAMES.EXPORT;
          console.log('[DAILY_ACTION_GAMES_SERVICE] Using JavaScript structure endpoint for export');
        } else {
          // Fall back to hardcoded endpoint
          endpoint = DAILY_ACTION_GAMES_ENDPOINT + '/export';
          console.log('[DAILY_ACTION_GAMES_SERVICE] Using fallback endpoint for export');
        }
      } catch (error) {
        // If any error occurs during endpoint resolution, use the fallback
        console.error('[DAILY_ACTION_GAMES_SERVICE] Error resolving export endpoint:', error);
        endpoint = DAILY_ACTION_GAMES_ENDPOINT + '/export';
        console.log('[DAILY_ACTION_GAMES_SERVICE] Using fallback endpoint for export after error');
      }

      console.log('[DAILY_ACTION_GAMES_SERVICE] Using API endpoint for export:', endpoint);
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
