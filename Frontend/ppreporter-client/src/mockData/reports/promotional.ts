/**
 * Promotional Report Mock Data
 */

/**
 * Get mock data for promotional report
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated promotional data
 */
const getData = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const promotionType = params?.promotionType;
  const status = params?.status;
  
  // Generate promotional data
  let promotions = generatePromotions(50);
  
  // Apply filters
  if (startDate) {
    const start = new Date(startDate);
    promotions = promotions.filter(promo => new Date(promo.startDate) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    promotions = promotions.filter(promo => new Date(promo.endDate) <= end);
  }
  
  if (promotionType) {
    promotions = promotions.filter(promo => promo.type === promotionType);
  }
  
  if (status) {
    promotions = promotions.filter(promo => promo.status === status);
  }
  
  // Calculate pagination
  const total = promotions.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPromotions = promotions.slice(startIndex, endIndex);
  
  return {
    data: paginatedPromotions,
    total,
    page,
    pageSize,
    totalPages
  };
};

/**
 * Generate mock promotions
 * @param count Number of promotions to generate
 * @returns Array of mock promotions
 */
const generatePromotions = (count: number): any[] => {
  const promotions = [];
  const today = new Date();
  
  // Promotion types
  const promotionTypes = [
    'welcome_bonus',
    'deposit_bonus',
    'free_spins',
    'cashback',
    'loyalty_bonus',
    'tournament',
    'referral_bonus'
  ];
  
  // Promotion statuses
  const statuses = ['active', 'scheduled', 'completed', 'cancelled'];
  
  for (let i = 0; i < count; i++) {
    // Random start date between 60 days ago and 30 days in the future
    const startDate = new Date();
    startDate.setDate(today.getDate() - Math.floor(Math.random() * 60) + Math.floor(Math.random() * 30));
    
    // Random end date between start date and 30 days after start date
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    // Random promotion type
    const type = promotionTypes[Math.floor(Math.random() * promotionTypes.length)];
    
    // Random status based on dates
    let status;
    if (startDate > today) {
      status = 'scheduled';
    } else if (endDate < today) {
      status = Math.random() > 0.2 ? 'completed' : 'cancelled';
    } else {
      status = 'active';
    }
    
    // Random budget between 1000 and 50000
    const budget = Math.floor(Math.random() * 49000) + 1000;
    
    // Random spent amount between 0 and budget
    const spent = status === 'completed' || status === 'cancelled' 
      ? Math.floor(Math.random() * budget)
      : status === 'active'
        ? Math.floor(Math.random() * budget * 0.8)
        : 0;
    
    // Random player count between 0 and 5000
    const playerCount = Math.floor(Math.random() * 5000);
    
    // Random conversion rate between 0 and 100%
    const conversionRate = Math.random();
    
    // Random ROI between -50% and 300%
    const roi = (Math.random() * 3.5) - 0.5;
    
    promotions.push({
      id: `promo-${Date.now()}-${i}`,
      name: `Promotion ${i + 1}`,
      type,
      description: `Description for ${type} promotion ${i + 1}`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status,
      budget,
      spent,
      remaining: budget - spent,
      playerCount,
      conversionRate,
      roi
    });
  }
  
  // Sort by start date (newest first)
  return promotions.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
};

/**
 * Get metadata for promotional report
 * @returns Metadata for promotional report
 */
const getMetadata = (): any => {
  return {
    filters: [
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'dateRange'
      },
      {
        id: 'promotionType',
        label: 'Promotion Type',
        type: 'select',
        options: [
          { value: 'welcome_bonus', label: 'Welcome Bonus' },
          { value: 'deposit_bonus', label: 'Deposit Bonus' },
          { value: 'free_spins', label: 'Free Spins' },
          { value: 'cashback', label: 'Cashback' },
          { value: 'loyalty_bonus', label: 'Loyalty Bonus' },
          { value: 'tournament', label: 'Tournament' },
          { value: 'referral_bonus', label: 'Referral Bonus' }
        ]
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      }
    ],
    columns: [
      {
        id: 'name',
        label: 'Name',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'type',
        label: 'Type',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'startDate',
        label: 'Start Date',
        type: 'date',
        sortable: true,
        filterable: true
      },
      {
        id: 'endDate',
        label: 'End Date',
        type: 'date',
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
        id: 'budget',
        label: 'Budget',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'spent',
        label: 'Spent',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'remaining',
        label: 'Remaining',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'playerCount',
        label: 'Players',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'conversionRate',
        label: 'Conversion Rate',
        type: 'number',
        sortable: true,
        filterable: true
      },
      {
        id: 'roi',
        label: 'ROI',
        type: 'number',
        sortable: true,
        filterable: true
      }
    ]
  };
};

export default {
  getData,
  getMetadata,
  generatePromotions
};
