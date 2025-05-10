/**
 * Natural Language Query Suggestions Mock Data
 */

/**
 * Get mock query suggestions
 * @returns Mock query suggestions
 */
const getSuggestions = (): any => {
  return {
    suggestions: [
      {
        id: 'suggestion-1',
        query: 'Show me revenue for the last 30 days',
        category: 'revenue',
        popularity: 95
      },
      {
        id: 'suggestion-2',
        query: 'How many active players do we have this month?',
        category: 'players',
        popularity: 90
      },
      {
        id: 'suggestion-3',
        query: 'What are our top 10 games by revenue?',
        category: 'games',
        popularity: 85
      },
      {
        id: 'suggestion-4',
        query: 'Show me deposit transactions by payment method',
        category: 'transactions',
        popularity: 80
      },
      {
        id: 'suggestion-5',
        query: 'What is our player retention rate?',
        category: 'players',
        popularity: 75
      },
      {
        id: 'suggestion-6',
        query: 'Compare revenue between desktop and mobile',
        category: 'revenue',
        popularity: 70
      },
      {
        id: 'suggestion-7',
        query: 'Show me player registrations by country',
        category: 'players',
        popularity: 65
      },
      {
        id: 'suggestion-8',
        query: 'What is our average deposit amount?',
        category: 'transactions',
        popularity: 60
      },
      {
        id: 'suggestion-9',
        query: 'Show me revenue by game category',
        category: 'revenue',
        popularity: 55
      },
      {
        id: 'suggestion-10',
        query: 'What is our conversion rate from registration to first deposit?',
        category: 'players',
        popularity: 50
      }
    ]
  };
};

export default {
  getSuggestions
};
