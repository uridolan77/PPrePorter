/**
 * Daily Actions Report Mock Data
 */
import { DailyAction } from '../../types/reportsData';

/**
 * Mock action types
 */
const actionTypes = [
  'login',
  'deposit',
  'withdrawal',
  'bet',
  'win',
  'bonus',
  'registration',
  'profile_update',
  'password_change',
  'account_verification'
];

/**
 * Mock payment methods
 */
const paymentMethods = [
  'Credit Card',
  'PayPal',
  'Bank Transfer',
  'Skrill',
  'Neteller',
  'Bitcoin',
  'Apple Pay',
  'Google Pay'
];

/**
 * Mock statuses
 */
const statuses = [
  'completed',
  'pending',
  'failed',
  'cancelled',
  'processing'
];

/**
 * Mock white labels
 */
const whiteLabels = [
  'Casino Royale',
  'Lucky Spin',
  'Golden Bet',
  'Diamond Play',
  'Royal Flush'
];

/**
 * Mock countries
 */
const countries = [
  'United States',
  'United Kingdom',
  'Germany',
  'Canada',
  'Australia',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden'
];

/**
 * Mock devices
 */
const devices = [
  'Desktop',
  'Mobile - Android',
  'Mobile - iOS',
  'Tablet - Android',
  'Tablet - iOS'
];

/**
 * Generate a random daily action
 * @param index Index for generating unique ID
 * @returns Random daily action
 */
const generateDailyAction = (index: number): DailyAction => {
  const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
  const amount = actionType === 'deposit' || actionType === 'withdrawal' || actionType === 'bet' || actionType === 'win'
    ? Math.floor(Math.random() * 1000) + 10
    : 0;

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const whiteLabel = whiteLabels[Math.floor(Math.random() * whiteLabels.length)];
  const country = countries[Math.floor(Math.random() * countries.length)];
  const device = devices[Math.floor(Math.random() * devices.length)];

  // Generate a random timestamp within the last 30 days
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));

  const playerId = `player-${Math.floor(Math.random() * 1000) + 1}`;
  const playerUsername = `user${Math.floor(Math.random() * 1000) + 1}`;

  const paymentMethod = (actionType === 'deposit' || actionType === 'withdrawal')
    ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    : undefined;

  const game = (actionType === 'bet' || actionType === 'win')
    ? `Game ${Math.floor(Math.random() * 100) + 1}`
    : undefined;

  return {
    id: `action-${Date.now()}-${index}`,
    date: date.toISOString(),
    playerId,
    playerUsername,
    actionType,
    amount,
    game,
    paymentMethod,
    status,
    whiteLabel,
    country,
    device,
    ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    location: country
  };
};

/**
 * Generate mock daily actions
 * @param count Number of actions to generate
 * @returns Array of mock daily actions
 */
const generateDailyActions = (count: number): DailyAction[] => {
  const actions: DailyAction[] = [];

  for (let i = 0; i < count; i++) {
    actions.push(generateDailyAction(i));
  }

  // Sort by date (newest first)
  return actions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Get mock data for daily actions report
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated daily actions data
 */
const getData = (params?: any): any => {
  console.log('[DAILY ACTIONS MOCK] Getting data with params:', params);

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const actionType = params?.actionType;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const whiteLabel = params?.whiteLabel;
  const country = params?.country;
  const status = params?.status;

  // Generate 100 actions
  let actions = generateDailyActions(100);

  // Apply filters
  console.log('[DAILY ACTIONS MOCK] Applying filters:', { actionType, startDate, endDate, whiteLabel, country, status });

  if (actionType) {
    actions = actions.filter(action => action.actionType === actionType);
  }

  if (startDate) {
    console.log(`[DAILY ACTIONS MOCK] Start date filter: ${startDate} - ignoring for demo`);
    // In a real implementation, we would filter by date:
    // const start = new Date(startDate);
    // actions = actions.filter(action => new Date(action.date) >= start);
  }

  if (endDate) {
    console.log(`[DAILY ACTIONS MOCK] End date filter: ${endDate} - ignoring for demo`);
    // In a real implementation, we would filter by date:
    // const end = new Date(endDate);
    // actions = actions.filter(action => new Date(action.date) <= end);
  }

  if (whiteLabel) {
    actions = actions.filter(action => action.whiteLabel === whiteLabel);
  }

  if (country) {
    actions = actions.filter(action => action.country === country);
  }

  if (status) {
    actions = actions.filter(action => action.status === status);
  }

  // Calculate pagination
  const total = actions.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedActions = actions.slice(startIndex, endIndex);

  // Generate summary data
  const totalRegistrations = Math.floor(Math.random() * 1000) + 100;
  const totalFTD = Math.floor(Math.random() * 500) + 50;
  const totalDeposits = Math.floor(Math.random() * 10000) + 1000;
  const totalCashouts = Math.floor(Math.random() * 8000) + 800;
  const totalGGR = Math.floor(Math.random() * 50000) + 5000;

  // Create daily actions in the format expected by the page
  const allDailyActions = [
    {
      id: 'day-1',
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
      id: 'day-2',
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
      id: 'day-3',
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
      id: 'day-4',
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
      id: 'day-5',
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
      id: 'day-6',
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
    }
  ];

  // Filter by white label if specified
  let dailyActions = [...allDailyActions];

  if (params?.whiteLabelId && params.whiteLabelId !== '' && params.whiteLabelId !== 'all') {
    console.log(`[DAILY ACTIONS MOCK] Filtering daily actions by white label ID: ${params.whiteLabelId}`);
    dailyActions = dailyActions.filter(action => action.whiteLabelId === params.whiteLabelId);
  }

  // Calculate summary metrics from filtered data
  const filteredTotalRegistrations = dailyActions.reduce((sum, item) => sum + item.registrations, 0);
  const filteredTotalFTD = dailyActions.reduce((sum, item) => sum + item.ftd, 0);
  const filteredTotalDeposits = dailyActions.reduce((sum, item) => sum + item.deposits, 0);
  const filteredTotalCashouts = dailyActions.reduce((sum, item) => sum + item.paidCashouts, 0);
  const filteredTotalGGR = dailyActions.reduce((sum, item) => sum + item.totalGGR, 0);

  const result = {
    data: paginatedActions,
    dailyActions: dailyActions,
    totalRegistrations: filteredTotalRegistrations,
    totalFTD: filteredTotalFTD,
    totalDeposits: filteredTotalDeposits,
    totalCashouts: filteredTotalCashouts,
    totalGGR: filteredTotalGGR,
    total,
    page,
    pageSize,
    totalPages,
    summary: {
      totalRegistrations: filteredTotalRegistrations,
      totalFTD: filteredTotalFTD,
      totalDeposits: filteredTotalDeposits,
      totalCashouts: filteredTotalCashouts,
      totalGGR: filteredTotalGGR
    }
  };

  console.log('[DAILY ACTIONS MOCK] Returning data:', result);
  return result;
};

/**
 * Get metadata for daily actions report
 * @returns Metadata for daily actions report
 */
const getMetadata = (): any => {
  return {
    filters: [
      {
        id: 'actionType',
        label: 'Action Type',
        type: 'select',
        options: actionTypes.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))
      },
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'dateRange'
      },
      {
        id: 'whiteLabel',
        label: 'White Label',
        type: 'select',
        options: whiteLabels.map(label => ({ value: label, label }))
      },
      {
        id: 'country',
        label: 'Country',
        type: 'select',
        options: countries.map(country => ({ value: country, label: country }))
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: statuses.map(status => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1) }))
      }
    ],
    columns: [
      {
        id: 'date',
        label: 'Date',
        type: 'date',
        sortable: true,
        filterable: true
      },
      {
        id: 'playerUsername',
        label: 'Player',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'actionType',
        label: 'Action Type',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'amount',
        label: 'Amount',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'game',
        label: 'Game',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'paymentMethod',
        label: 'Payment Method',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'status',
        label: 'Status',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'whiteLabel',
        label: 'White Label',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'country',
        label: 'Country',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'device',
        label: 'Device',
        type: 'string',
        sortable: true,
        filterable: true
      }
    ]
  };
};

export default {
  getData,
  getMetadata,
  generateDailyActions,
  actionTypes,
  paymentMethods,
  statuses,
  whiteLabels,
  countries,
  devices
};
