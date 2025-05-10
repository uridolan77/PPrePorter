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
  if (actionType) {
    actions = actions.filter(action => action.actionType === actionType);
  }
  
  if (startDate) {
    const start = new Date(startDate);
    actions = actions.filter(action => new Date(action.date) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    actions = actions.filter(action => new Date(action.date) <= end);
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
  
  return {
    data: paginatedActions,
    total,
    page,
    pageSize,
    totalPages
  };
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
