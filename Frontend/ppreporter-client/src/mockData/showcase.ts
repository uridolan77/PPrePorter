/**
 * Mock data for component showcase
 */

// Mock data for filter components
export const mockFilterData = {
  dataSource: {
    schema: [
      { id: 'date', name: 'Date', type: 'date', filterable: true, description: 'Transaction date' },
      { id: 'amount', name: 'Amount', type: 'number', filterable: true, description: 'Transaction amount' },
      { id: 'status', name: 'Status', type: 'string', filterable: true, description: 'Transaction status' },
      { id: 'customer', name: 'Customer', type: 'string', filterable: true, description: 'Customer name' },
      { id: 'country', name: 'Country', type: 'string', filterable: true, description: 'Country' },
      { id: 'isActive', name: 'Is Active', type: 'boolean', filterable: true, description: 'Active status' }
    ]
  },
  filters: [
    {
      id: 'filter_1',
      field: 'date',
      operator: 'between',
      value: { from: new Date('2023-01-01'), to: new Date('2023-12-31') },
      displayValue: 'From 01/01/2023 to 12/31/2023'
    },
    {
      id: 'filter_2',
      field: 'amount',
      operator: 'greaterThan',
      value: '1000',
      displayValue: '1000'
    }
  ]
};

// Mock data for report components
export const mockReportData = {
  sections: [
    {
      id: 'section-1',
      title: 'Summary Metrics',
      description: 'Key performance indicators',
      content: 'This section would display summary metrics and KPIs.'
    },
    {
      id: 'section-2',
      title: 'Data Visualization',
      description: 'Charts and graphs',
      content: 'This section would display charts and data visualizations.'
    },
    {
      id: 'section-3',
      title: 'Detailed Data',
      description: 'Tabular data display',
      content: 'This section would display detailed tabular data.'
    }
  ],
  data: {
    summary: {
      totalRevenue: 1245678,
      totalOrders: 8765,
      averageOrderValue: 142.12,
      conversionRate: 3.45
    },
    byDimension: [
      { id: 'dim-1', name: 'Category A', value: 450000 },
      { id: 'dim-2', name: 'Category B', value: 325000 },
      { id: 'dim-3', name: 'Category C', value: 275000 },
      { id: 'dim-4', name: 'Category D', value: 195678 }
    ]
  }
};

// Mock data for natural language query
export const mockQuerySuggestions = [
  "Show me total revenue by month for last quarter",
  "What are the top 5 performing products?",
  "Compare conversion rates between desktop and mobile",
  "Show user growth trend over the past year",
  "Which countries have the highest average order value?",
  "Show me daily active users for the past week"
];

// Mock data for daily actions report
export const mockDailyActionsData = {
  summary: {
    totalRegistrations: 12345,
    totalFTD: 5678,
    totalDeposits: 98765,
    totalCashouts: 76543,
    totalGGR: 543210
  },
  dailyActions: [
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
    }
  ]
};

export default {
  mockFilterData,
  mockReportData,
  mockQuerySuggestions,
  mockDailyActionsData
};
