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

      // Just dispatch the error
      dispatch(fetchDashboardDataFailure(`Error connecting to API: ${error.message || 'Unknown error'}`));
    }
  };
};
