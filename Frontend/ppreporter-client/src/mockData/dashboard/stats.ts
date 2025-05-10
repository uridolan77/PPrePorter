/**
 * Dashboard Stats Mock Data
 */

/**
 * Mock dashboard stats
 */
const stats = {
  summary: {
    totalRevenue: 1250000,
    totalPlayers: 45000,
    activePlayersToday: 12500,
    newPlayersToday: 350,
    depositAmount: 450000,
    withdrawalAmount: 320000,
    netGaming: 130000,
    conversionRate: 0.35,
    averageSessionTime: 25, // minutes
    churnRate: 0.08
  },
  comparison: {
    revenue: {
      current: 1250000,
      previous: 1150000,
      change: 0.087, // 8.7% increase
      trend: 'up'
    },
    players: {
      current: 45000,
      previous: 42000,
      change: 0.071, // 7.1% increase
      trend: 'up'
    },
    activePlayers: {
      current: 12500,
      previous: 11800,
      change: 0.059, // 5.9% increase
      trend: 'up'
    },
    newPlayers: {
      current: 350,
      previous: 320,
      change: 0.094, // 9.4% increase
      trend: 'up'
    },
    deposits: {
      current: 450000,
      previous: 420000,
      change: 0.071, // 7.1% increase
      trend: 'up'
    },
    withdrawals: {
      current: 320000,
      previous: 290000,
      change: 0.103, // 10.3% increase
      trend: 'up'
    },
    netGaming: {
      current: 130000,
      previous: 130000,
      change: 0, // 0% change
      trend: 'stable'
    },
    conversionRate: {
      current: 0.35,
      previous: 0.33,
      change: 0.061, // 6.1% increase
      trend: 'up'
    },
    sessionTime: {
      current: 25,
      previous: 23,
      change: 0.087, // 8.7% increase
      trend: 'up'
    },
    churnRate: {
      current: 0.08,
      previous: 0.09,
      change: -0.111, // 11.1% decrease
      trend: 'down' // Down is good for churn rate
    }
  },
  timeframe: 'month'
};

export default {
  stats
};
