/**
 * Player Journey Mock Data
 */

/**
 * Mock player journey data
 */
const playerJourney = {
  stages: [
    {
      name: 'Acquisition',
      count: 12500,
      percentage: 100,
      conversion: 100,
      channels: [
        { name: 'Organic Search', count: 3750, percentage: 30 },
        { name: 'Paid Search', count: 2500, percentage: 20 },
        { name: 'Social Media', count: 2000, percentage: 16 },
        { name: 'Referral', count: 1875, percentage: 15 },
        { name: 'Direct', count: 1250, percentage: 10 },
        { name: 'Other', count: 1125, percentage: 9 }
      ]
    },
    {
      name: 'Registration',
      count: 5000,
      percentage: 40,
      conversion: 40,
      devices: [
        { name: 'Desktop', count: 2000, percentage: 40 },
        { name: 'Mobile', count: 2500, percentage: 50 },
        { name: 'Tablet', count: 500, percentage: 10 }
      ],
      countries: [
        { name: 'United States', count: 1500, percentage: 30 },
        { name: 'United Kingdom', count: 1000, percentage: 20 },
        { name: 'Germany', count: 750, percentage: 15 },
        { name: 'Canada', count: 500, percentage: 10 },
        { name: 'Australia', count: 500, percentage: 10 },
        { name: 'Other', count: 750, percentage: 15 }
      ]
    },
    {
      name: 'First Deposit',
      count: 2500,
      percentage: 20,
      conversion: 50,
      methods: [
        { name: 'Credit Card', count: 1000, percentage: 40 },
        { name: 'PayPal', count: 625, percentage: 25 },
        { name: 'Bank Transfer', count: 375, percentage: 15 },
        { name: 'Skrill', count: 250, percentage: 10 },
        { name: 'Neteller', count: 125, percentage: 5 },
        { name: 'Other', count: 125, percentage: 5 }
      ],
      amounts: [
        { range: '0-50', count: 750, percentage: 30 },
        { range: '51-100', count: 625, percentage: 25 },
        { range: '101-200', count: 500, percentage: 20 },
        { range: '201-500', count: 375, percentage: 15 },
        { range: '501+', count: 250, percentage: 10 }
      ]
    },
    {
      name: 'First Game',
      count: 2250,
      percentage: 18,
      conversion: 90,
      categories: [
        { name: 'Slots', count: 1125, percentage: 50 },
        { name: 'Table Games', count: 450, percentage: 20 },
        { name: 'Live Casino', count: 337, percentage: 15 },
        { name: 'Poker', count: 225, percentage: 10 },
        { name: 'Other', count: 113, percentage: 5 }
      ],
      timeToPlay: [
        { range: '0-1 hour', count: 1125, percentage: 50 },
        { range: '1-24 hours', count: 675, percentage: 30 },
        { range: '1-3 days', count: 337, percentage: 15 },
        { range: '3+ days', count: 113, percentage: 5 }
      ]
    },
    {
      name: 'Repeat Deposit',
      count: 1500,
      percentage: 12,
      conversion: 66.7,
      frequency: [
        { range: 'Within 24 hours', count: 600, percentage: 40 },
        { range: '1-3 days', count: 450, percentage: 30 },
        { range: '4-7 days', count: 300, percentage: 20 },
        { range: '8+ days', count: 150, percentage: 10 }
      ],
      amounts: [
        { range: '0-50', count: 375, percentage: 25 },
        { range: '51-100', count: 450, percentage: 30 },
        { range: '101-200', count: 375, percentage: 25 },
        { range: '201-500', count: 225, percentage: 15 },
        { range: '501+', count: 75, percentage: 5 }
      ]
    },
    {
      name: 'Active Player',
      count: 1000,
      percentage: 8,
      conversion: 66.7,
      frequency: [
        { range: 'Daily', count: 200, percentage: 20 },
        { range: '2-3 times per week', count: 300, percentage: 30 },
        { range: 'Weekly', count: 300, percentage: 30 },
        { range: 'Monthly', count: 200, percentage: 20 }
      ],
      sessionLength: [
        { range: '0-15 minutes', count: 200, percentage: 20 },
        { range: '16-30 minutes', count: 300, percentage: 30 },
        { range: '31-60 minutes', count: 300, percentage: 30 },
        { range: '60+ minutes', count: 200, percentage: 20 }
      ]
    }
  ],
  dropoffs: [
    {
      fromStage: 'Acquisition',
      toStage: 'Registration',
      count: 7500,
      percentage: 60,
      reasons: [
        { reason: 'Abandoned registration form', percentage: 40 },
        { reason: 'No account creation intent', percentage: 30 },
        { reason: 'Technical issues', percentage: 15 },
        { reason: 'Other', percentage: 15 }
      ]
    },
    {
      fromStage: 'Registration',
      toStage: 'First Deposit',
      count: 2500,
      percentage: 50,
      reasons: [
        { reason: 'Payment method issues', percentage: 35 },
        { reason: 'Trust concerns', percentage: 25 },
        { reason: 'Changed mind', percentage: 20 },
        { reason: 'Other', percentage: 20 }
      ]
    },
    {
      fromStage: 'First Deposit',
      toStage: 'First Game',
      count: 250,
      percentage: 10,
      reasons: [
        { reason: 'Technical issues', percentage: 40 },
        { reason: 'Game selection issues', percentage: 30 },
        { reason: 'Changed mind', percentage: 20 },
        { reason: 'Other', percentage: 10 }
      ]
    },
    {
      fromStage: 'First Game',
      toStage: 'Repeat Deposit',
      count: 750,
      percentage: 33.3,
      reasons: [
        { reason: 'Lost interest', percentage: 40 },
        { reason: 'Lost money', percentage: 30 },
        { reason: 'Found another site', percentage: 20 },
        { reason: 'Other', percentage: 10 }
      ]
    },
    {
      fromStage: 'Repeat Deposit',
      toStage: 'Active Player',
      count: 500,
      percentage: 33.3,
      reasons: [
        { reason: 'Infrequent play', percentage: 45 },
        { reason: 'Lost interest', percentage: 25 },
        { reason: 'Found another site', percentage: 20 },
        { reason: 'Other', percentage: 10 }
      ]
    }
  ],
  timeframe: 'last 30 days'
};

export default {
  playerJourney
};
