import dashboardService from '../../services/api/dashboardService';

// Dashboard action types
export const FETCH_DASHBOARD_START = 'dashboard/fetchStart';
export const FETCH_DASHBOARD_SUCCESS = 'dashboard/fetchSuccess';
export const FETCH_DASHBOARD_FAILURE = 'dashboard/fetchFailure';

// Action creators
export const fetchDashboardDataStart = () => ({
  type: FETCH_DASHBOARD_START
});

export const fetchDashboardDataSuccess = (data) => ({
  type: FETCH_DASHBOARD_SUCCESS,
  payload: data
});

export const fetchDashboardDataFailure = (error) => ({
  type: FETCH_DASHBOARD_FAILURE,
  payload: error
});

// Thunk action to fetch dashboard data
export const fetchDashboardData = (filters = {}) => {
  return async (dispatch) => {
    dispatch(fetchDashboardDataStart());

    try {
      // Prepare date parameters
      const startDate = filters.startDate || null;
      const endDate = filters.endDate || null;

      // Get dashboard stats with filters
      const stats = await dashboardService.getDashboardStats({
        startDate,
        endDate,
        gameCategory: filters.gameCategory,
        playerStatus: filters.playerStatus,
        country: filters.country,
        minRevenue: filters.minRevenue,
        maxRevenue: filters.maxRevenue
      });

      // Get player registrations data with date range
      const playerRegistrations = await dashboardService.getPlayerRegistrations({
        startDate,
        endDate,
        playerStatus: filters.playerStatus,
        country: filters.country
      });

      // Get recent transactions with filters
      const recentTransactions = await dashboardService.getRecentTransactions({
        limit: 10,
        startDate,
        endDate,
        playerStatus: filters.playerStatus,
        country: filters.country
      });

      // Get top games with filters
      const topGames = await dashboardService.getTopGames({
        metric: 'revenue',
        limit: 5,
        startDate,
        endDate,
        category: filters.gameCategory,
        minRevenue: filters.minRevenue,
        maxRevenue: filters.maxRevenue
      });

      // Get casino revenue with date range
      const casinoRevenue = await dashboardService.getCasinoRevenue({
        startDate,
        endDate,
        category: filters.gameCategory
      });

      // Get KPI data with filters
      const kpis = await dashboardService.getKpiData({
        startDate,
        endDate,
        gameCategory: filters.gameCategory,
        playerStatus: filters.playerStatus,
        country: filters.country
      });

      // Combine all data
      const dashboardData = {
        stats,
        playerRegistrations,
        recentTransactions,
        topGames,
        casinoRevenue,
        kpis,
        charts: {
          revenueByDay: casinoRevenue?.dailyRevenue || [],
          playersByGame: topGames?.map(game => ({ game: game.name, value: game.players })) || []
        }
      };

      dispatch(fetchDashboardDataSuccess(dashboardData));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      // If API fails, fall back to mock data for demonstration
      const mockData = {
        stats: {
          revenue: {
            value: 12567.89,
            change: 15.2,
            period: 'vs last week'
          },
          players: {
            value: 1432,
            change: 7.5,
            period: 'vs last week'
          },
          newPlayers: {
            value: 256,
            change: 12.8,
            period: 'vs last week'
          },
          gamesPlayed: {
            value: 5621,
            change: -3.2,
            period: 'vs last week'
          }
        },
        topGames: [
          { name: 'Poker Pro', revenue: 3200.56, players: 432 },
          { name: 'Blackjack Masters', revenue: 2800.32, players: 387 },
          { name: 'Slots Royale', revenue: 2300.18, players: 356 },
          { name: 'Roulette King', revenue: 1900.45, players: 289 },
          { name: 'Baccarat Elite', revenue: 1450.67, players: 218 }
        ],
        charts: {
          revenueByDay: [
            { day: 'Mon', value: 2100 },
            { day: 'Tue', value: 2400 },
            { day: 'Wed', value: 1800 },
            { day: 'Thu', value: 2200 },
            { day: 'Fri', value: 2600 },
            { day: 'Sat', value: 3100 },
            { day: 'Sun', value: 2500 }
          ],
          playersByGame: [
            { game: 'Poker', value: 450 },
            { game: 'Slots', value: 380 },
            { game: 'Roulette', value: 240 },
            { game: 'Blackjack', value: 190 },
            { game: 'Baccarat', value: 165 }
          ]
        },
        recentPlayers: [
          { id: 1, name: 'John Doe', registeredAt: '2023-05-01T08:30:00Z', status: 'active', country: 'USA' },
          { id: 2, name: 'Jane Smith', registeredAt: '2023-05-02T10:15:00Z', status: 'active', country: 'Canada' },
          { id: 3, name: 'Mike Johnson', registeredAt: '2023-05-03T14:45:00Z', status: 'inactive', country: 'UK' },
          { id: 4, name: 'Lisa Brown', registeredAt: '2023-05-04T09:20:00Z', status: 'active', country: 'Australia' },
          { id: 5, name: 'Robert Wilson', registeredAt: '2023-05-05T16:10:00Z', status: 'pending', country: 'Germany' }
        ]
      };

      // Dispatch success with mock data but include error message
      dispatch(fetchDashboardDataSuccess(mockData));
      dispatch(fetchDashboardDataFailure(`Error connecting to API: ${error.message || 'Unknown error'}. Showing mock data instead.`));
    }
  };
};
