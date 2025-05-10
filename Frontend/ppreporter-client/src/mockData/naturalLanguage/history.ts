/**
 * Natural Language Query History Mock Data
 */

/**
 * Get mock query history
 * @returns Mock query history
 */
const getQueryHistory = (): any => {
  return {
    queries: [
      {
        id: 'query-1',
        query: 'Show me revenue for the last 30 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        result: {
          visualization: 'line',
          dataPoints: 30
        }
      },
      {
        id: 'query-2',
        query: 'How many active players do we have this month?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        result: {
          visualization: 'line',
          dataPoints: 30
        }
      },
      {
        id: 'query-3',
        query: 'What are our top 10 games by revenue?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        result: {
          visualization: 'bar',
          dataPoints: 10
        }
      },
      {
        id: 'query-4',
        query: 'Show me deposit transactions by payment method',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        result: {
          visualization: 'pie',
          dataPoints: 8
        }
      },
      {
        id: 'query-5',
        query: 'What is our player retention rate?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        result: {
          visualization: 'number',
          dataPoints: 1
        }
      },
      {
        id: 'query-6',
        query: 'Compare revenue between desktop and mobile',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
        result: {
          visualization: 'bar',
          dataPoints: 2
        }
      },
      {
        id: 'query-7',
        query: 'Show me player registrations by country',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        result: {
          visualization: 'map',
          dataPoints: 20
        }
      },
      {
        id: 'query-8',
        query: 'What is our average deposit amount?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
        result: {
          visualization: 'number',
          dataPoints: 1
        }
      },
      {
        id: 'query-9',
        query: 'Show me revenue by game category',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        result: {
          visualization: 'pie',
          dataPoints: 6
        }
      },
      {
        id: 'query-10',
        query: 'What is our conversion rate from registration to first deposit?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
        result: {
          visualization: 'number',
          dataPoints: 1
        }
      }
    ]
  };
};

export default {
  getQueryHistory
};
