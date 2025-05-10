/**
 * Compliance Report Mock Data
 */

/**
 * Get mock data for compliance report
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated compliance data
 */
const getData = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const complianceType = params?.complianceType;
  const status = params?.status;
  const severity = params?.severity;
  
  // Generate compliance data
  let complianceItems = generateComplianceItems(100);
  
  // Apply filters
  if (startDate) {
    const start = new Date(startDate);
    complianceItems = complianceItems.filter(item => new Date(item.date) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    complianceItems = complianceItems.filter(item => new Date(item.date) <= end);
  }
  
  if (complianceType) {
    complianceItems = complianceItems.filter(item => item.type === complianceType);
  }
  
  if (status) {
    complianceItems = complianceItems.filter(item => item.status === status);
  }
  
  if (severity) {
    complianceItems = complianceItems.filter(item => item.severity === severity);
  }
  
  // Calculate pagination
  const total = complianceItems.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = complianceItems.slice(startIndex, endIndex);
  
  return {
    data: paginatedItems,
    total,
    page,
    pageSize,
    totalPages
  };
};

/**
 * Generate mock compliance items
 * @param count Number of compliance items to generate
 * @returns Array of mock compliance items
 */
const generateComplianceItems = (count: number): any[] => {
  const complianceItems = [];
  const today = new Date();
  
  // Compliance types
  const complianceTypes = [
    'kyc_verification',
    'aml_check',
    'responsible_gambling',
    'underage_gambling',
    'fraud_detection',
    'self_exclusion',
    'deposit_limit',
    'regulatory_reporting'
  ];
  
  // Compliance statuses
  const statuses = ['open', 'in_progress', 'resolved', 'escalated', 'closed'];
  
  // Severity levels
  const severityLevels = ['low', 'medium', 'high', 'critical'];
  
  // Countries
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
  
  for (let i = 0; i < count; i++) {
    // Random date between 90 days ago and today
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 90));
    
    // Random compliance type
    const type = complianceTypes[Math.floor(Math.random() * complianceTypes.length)];
    
    // Random status
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random severity
    const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    // Random player ID
    const playerId = `player-${Math.floor(Math.random() * 1000) + 1}`;
    
    // Random player username
    const playerUsername = `user${Math.floor(Math.random() * 1000) + 1}`;
    
    // Random country
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    // Random resolution date for resolved/closed items
    let resolutionDate = null;
    if (status === 'resolved' || status === 'closed') {
      resolutionDate = new Date(date);
      resolutionDate.setDate(date.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days after detection
      
      // Ensure resolution date is not in the future
      if (resolutionDate > today) {
        resolutionDate = today;
      }
    }
    
    // Random assigned to
    const assignedTo = status !== 'open' ? `agent-${Math.floor(Math.random() * 10) + 1}` : null;
    
    complianceItems.push({
      id: `compliance-${Date.now()}-${i}`,
      date: date.toISOString(),
      type,
      description: `${type.replace(/_/g, ' ')} compliance issue for player ${playerUsername}`,
      playerId,
      playerUsername,
      country,
      status,
      severity,
      resolutionDate: resolutionDate ? resolutionDate.toISOString() : null,
      assignedTo,
      notes: status !== 'open' ? `Notes for ${type} compliance issue` : null
    });
  }
  
  // Sort by date (newest first)
  return complianceItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Get metadata for compliance report
 * @returns Metadata for compliance report
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
        id: 'complianceType',
        label: 'Compliance Type',
        type: 'select',
        options: [
          { value: 'kyc_verification', label: 'KYC Verification' },
          { value: 'aml_check', label: 'AML Check' },
          { value: 'responsible_gambling', label: 'Responsible Gambling' },
          { value: 'underage_gambling', label: 'Underage Gambling' },
          { value: 'fraud_detection', label: 'Fraud Detection' },
          { value: 'self_exclusion', label: 'Self Exclusion' },
          { value: 'deposit_limit', label: 'Deposit Limit' },
          { value: 'regulatory_reporting', label: 'Regulatory Reporting' }
        ]
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'open', label: 'Open' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
          { value: 'escalated', label: 'Escalated' },
          { value: 'closed', label: 'Closed' }
        ]
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'select',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'critical', label: 'Critical' }
        ]
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
        id: 'type',
        label: 'Type',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'description',
        label: 'Description',
        type: 'string',
        sortable: false,
        filterable: false
      },
      {
        id: 'playerUsername',
        label: 'Player',
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
        id: 'status',
        label: 'Status',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'severity',
        label: 'Severity',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        id: 'resolutionDate',
        label: 'Resolution Date',
        type: 'date',
        sortable: true,
        filterable: true
      },
      {
        id: 'assignedTo',
        label: 'Assigned To',
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
  generateComplianceItems
};
