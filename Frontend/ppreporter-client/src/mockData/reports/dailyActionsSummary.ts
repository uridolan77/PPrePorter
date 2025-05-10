/**
 * Daily Actions Summary Report Mock Data
 */

/**
 * Generate mock summary data for daily actions report
 * @returns Summary data for daily actions report
 */
const getSummaryData = (params?: any): any => {
  console.log('[DAILY ACTIONS SUMMARY MOCK] Getting summary data with params:', params);

  // Define all daily actions
  const allDailyActions = [
    {
      date: '2023-05-01',
      whiteLabelName: 'Casino Royale',
      whiteLabelId: 'casino-royale',
      registrations: 45,
      ftd: 22,
      deposits: 156,
      paidCashouts: 89,
      ggrCasino: 3450,
      ggrSport: 1250,
      ggrLive: 980,
      totalGGR: 5680
    },
    {
      date: '2023-05-02',
      whiteLabelName: 'Casino Royale',
      whiteLabelId: 'casino-royale',
      registrations: 38,
      ftd: 19,
      deposits: 142,
      paidCashouts: 76,
      ggrCasino: 3120,
      ggrSport: 1180,
      ggrLive: 850,
      totalGGR: 5150
    },
    {
      date: '2023-05-03',
      whiteLabelName: 'Casino Royale',
      whiteLabelId: 'casino-royale',
      registrations: 52,
      ftd: 26,
      deposits: 178,
      paidCashouts: 95,
      ggrCasino: 3780,
      ggrSport: 1320,
      ggrLive: 1050,
      totalGGR: 6150
    },
    {
      date: '2023-05-04',
      whiteLabelName: 'Casino Royale',
      whiteLabelId: 'casino-royale',
      registrations: 41,
      ftd: 20,
      deposits: 165,
      paidCashouts: 82,
      ggrCasino: 3550,
      ggrSport: 1280,
      ggrLive: 920,
      totalGGR: 5750
    },
    {
      date: '2023-05-05',
      whiteLabelName: 'Casino Royale',
      whiteLabelId: 'casino-royale',
      registrations: 49,
      ftd: 24,
      deposits: 172,
      paidCashouts: 91,
      ggrCasino: 3680,
      ggrSport: 1310,
      ggrLive: 990,
      totalGGR: 5980
    },
    {
      date: '2023-05-01',
      whiteLabelName: 'Lucky Spin',
      whiteLabelId: 'lucky-spin',
      registrations: 35,
      ftd: 17,
      deposits: 128,
      paidCashouts: 65,
      ggrCasino: 2850,
      ggrSport: 980,
      ggrLive: 720,
      totalGGR: 4550
    },
    {
      date: '2023-05-02',
      whiteLabelName: 'Lucky Spin',
      whiteLabelId: 'lucky-spin',
      registrations: 32,
      ftd: 16,
      deposits: 118,
      paidCashouts: 59,
      ggrCasino: 2650,
      ggrSport: 920,
      ggrLive: 680,
      totalGGR: 4250
    },
    {
      date: '2023-05-03',
      whiteLabelName: 'Lucky Spin',
      whiteLabelId: 'lucky-spin',
      registrations: 39,
      ftd: 19,
      deposits: 135,
      paidCashouts: 68,
      ggrCasino: 2950,
      ggrSport: 1050,
      ggrLive: 750,
      totalGGR: 4750
    },
    {
      date: '2023-05-04',
      whiteLabelName: 'Lucky Spin',
      whiteLabelId: 'lucky-spin',
      registrations: 36,
      ftd: 18,
      deposits: 125,
      paidCashouts: 63,
      ggrCasino: 2750,
      ggrSport: 950,
      ggrLive: 700,
      totalGGR: 4400
    },
    {
      date: '2023-05-05',
      whiteLabelName: 'Lucky Spin',
      whiteLabelId: 'lucky-spin',
      registrations: 42,
      ftd: 21,
      deposits: 145,
      paidCashouts: 73,
      ggrCasino: 3150,
      ggrSport: 1100,
      ggrLive: 800,
      totalGGR: 5050
    },
    // Add Golden Bet data
    {
      date: '2023-05-01',
      whiteLabelName: 'Golden Bet',
      whiteLabelId: 'golden-bet',
      registrations: 28,
      ftd: 14,
      deposits: 110,
      paidCashouts: 55,
      ggrCasino: 2200,
      ggrSport: 850,
      ggrLive: 650,
      totalGGR: 3700
    },
    {
      date: '2023-05-02',
      whiteLabelName: 'Golden Bet',
      whiteLabelId: 'golden-bet',
      registrations: 30,
      ftd: 15,
      deposits: 115,
      paidCashouts: 58,
      ggrCasino: 2300,
      ggrSport: 900,
      ggrLive: 700,
      totalGGR: 3900
    }
  ];

  // Filter daily actions based on params
  let filteredActions = [...allDailyActions];

  // Apply date filters - but for demo purposes, ignore the actual dates
  // and just return data regardless of date range
  if (params?.startDate) {
    console.log(`[DAILY ACTIONS SUMMARY MOCK] Start date filter: ${params.startDate} - ignoring for demo`);
    // In a real implementation, we would filter by date:
    // const startDate = new Date(params.startDate);
    // filteredActions = filteredActions.filter(action => new Date(action.date) >= startDate);
  }

  if (params?.endDate) {
    console.log(`[DAILY ACTIONS SUMMARY MOCK] End date filter: ${params.endDate} - ignoring for demo`);
    // In a real implementation, we would filter by date:
    // const endDate = new Date(params.endDate);
    // filteredActions = filteredActions.filter(action => new Date(action.date) <= endDate);
  }

  // Apply white label filter
  if (params?.whiteLabelId && params.whiteLabelId !== 'all' && params.whiteLabelId !== '') {
    console.log(`[DAILY ACTIONS SUMMARY MOCK] Filtering by white label ID: ${params.whiteLabelId}`);
    filteredActions = filteredActions.filter(action => action.whiteLabelId === params.whiteLabelId);
  }

  // Calculate summary metrics from filtered data
  const totalRegistrations = filteredActions.reduce((sum, item) => sum + item.registrations, 0);
  const totalFTD = filteredActions.reduce((sum, item) => sum + item.ftd, 0);
  const totalDeposits = filteredActions.reduce((sum, item) => sum + item.deposits, 0);
  const totalCashouts = filteredActions.reduce((sum, item) => sum + item.paidCashouts, 0);
  const totalGGR = filteredActions.reduce((sum, item) => sum + item.totalGGR, 0);

  // Add unique IDs to each row
  const dailyActions = filteredActions.map((action, index) => ({
    ...action,
    id: `day-${index + 1}`
  }));

  const result = {
    totalRegistrations,
    totalFTD,
    totalDeposits,
    totalCashouts,
    totalGGR,
    dailyActions
  };

  console.log('[DAILY ACTIONS SUMMARY MOCK] Returning filtered data:', result);
  return result;
};

/**
 * Get metadata for daily actions summary report
 * @returns Metadata for daily actions summary report
 */
const getMetadata = (): any => {
  return {
    whiteLabels: [
      { id: 'all', name: 'All White Labels' },
      { id: 'casino-royale', name: 'Casino Royale' },
      { id: 'lucky-spin', name: 'Lucky Spin' },
      { id: 'golden-bet', name: 'Golden Bet' },
      { id: 'diamond-play', name: 'Diamond Play' },
      { id: 'royal-flush', name: 'Royal Flush' }
    ]
  };
};

export default {
  getSummaryData,
  getMetadata
};
