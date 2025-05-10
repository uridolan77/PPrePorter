/**
 * KPI Mock Data
 */

/**
 * Mock KPI data
 */
const kpiData = {
  revenue: {
    current: 1250000,
    previous: 1150000,
    target: 1300000,
    change: 0.087, // 8.7% increase
    trend: 'up',
    vsTarget: -0.038, // 3.8% below target
    forecast: 1280000
  },
  ggr: {
    current: 450000,
    previous: 420000,
    target: 480000,
    change: 0.071, // 7.1% increase
    trend: 'up',
    vsTarget: -0.063, // 6.3% below target
    forecast: 460000
  },
  ngr: {
    current: 380000,
    previous: 350000,
    target: 400000,
    change: 0.086, // 8.6% increase
    trend: 'up',
    vsTarget: -0.05, // 5% below target
    forecast: 390000
  },
  deposits: {
    current: 2500000,
    previous: 2300000,
    target: 2600000,
    change: 0.087, // 8.7% increase
    trend: 'up',
    vsTarget: -0.038, // 3.8% below target
    forecast: 2550000
  },
  withdrawals: {
    current: 1800000,
    previous: 1700000,
    target: 1850000,
    change: 0.059, // 5.9% increase
    trend: 'up',
    vsTarget: -0.027, // 2.7% below target
    forecast: 1830000
  },
  activePlayers: {
    current: 45000,
    previous: 42000,
    target: 48000,
    change: 0.071, // 7.1% increase
    trend: 'up',
    vsTarget: -0.063, // 6.3% below target
    forecast: 46500
  },
  newPlayers: {
    current: 12500,
    previous: 11800,
    target: 13000,
    change: 0.059, // 5.9% increase
    trend: 'up',
    vsTarget: -0.038, // 3.8% below target
    forecast: 12800
  },
  firstTimeDepositors: {
    current: 5500,
    previous: 5200,
    target: 5800,
    change: 0.058, // 5.8% increase
    trend: 'up',
    vsTarget: -0.052, // 5.2% below target
    forecast: 5650
  },
  conversionRate: {
    current: 0.35,
    previous: 0.33,
    target: 0.38,
    change: 0.061, // 6.1% increase
    trend: 'up',
    vsTarget: -0.079, // 7.9% below target
    forecast: 0.36
  },
  averageDepositAmount: {
    current: 120,
    previous: 115,
    target: 125,
    change: 0.043, // 4.3% increase
    trend: 'up',
    vsTarget: -0.04, // 4% below target
    forecast: 122
  },
  churnRate: {
    current: 0.08,
    previous: 0.09,
    target: 0.07,
    change: -0.111, // 11.1% decrease
    trend: 'down', // Down is good for churn rate
    vsTarget: 0.143, // 14.3% above target (bad)
    forecast: 0.078
  },
  ltv: {
    current: 850,
    previous: 820,
    target: 900,
    change: 0.037, // 3.7% increase
    trend: 'up',
    vsTarget: -0.056, // 5.6% below target
    forecast: 870
  },
  marketingCost: {
    current: 250000,
    previous: 240000,
    target: 230000,
    change: 0.042, // 4.2% increase
    trend: 'up', // Up is bad for costs
    vsTarget: 0.087, // 8.7% above target (bad)
    forecast: 245000
  },
  cpa: {
    current: 45,
    previous: 48,
    target: 42,
    change: -0.063, // 6.3% decrease
    trend: 'down', // Down is good for CPA
    vsTarget: 0.071, // 7.1% above target (bad)
    forecast: 44
  },
  roi: {
    current: 3.2,
    previous: 3.1,
    target: 3.5,
    change: 0.032, // 3.2% increase
    trend: 'up',
    vsTarget: -0.086, // 8.6% below target
    forecast: 3.3
  }
};

export default {
  kpiData
};
