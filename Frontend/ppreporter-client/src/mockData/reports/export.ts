/**
 * Export Report Mock Data
 */

/**
 * Get mock data for export functionality
 * @param params Parameters for export
 * @returns Mock export response
 */
const getData = (params?: any): any => {
  const reportId = params?.reportId;
  const format = params?.format || 'csv';
  const options = params?.options || {};
  
  // Simulate export process
  return {
    success: true,
    message: `Report exported successfully in ${format.toUpperCase()} format`,
    downloadUrl: `https://example.com/exports/${reportId}.${format}`,
    format,
    timestamp: new Date().toISOString(),
    options
  };
};

/**
 * Get export history
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated export history
 */
const getExportHistory = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startDate = params?.startDate;
  const endDate = params?.endDate;
  const format = params?.format;
  const userId = params?.userId;
  
  // Generate export history
  let exports = generateExportHistory(50);
  
  // Apply filters
  if (startDate) {
    const start = new Date(startDate);
    exports = exports.filter(item => new Date(item.timestamp) >= start);
  }
  
  if (endDate) {
    const end = new Date(endDate);
    exports = exports.filter(item => new Date(item.timestamp) <= end);
  }
  
  if (format) {
    exports = exports.filter(item => item.format === format);
  }
  
  if (userId) {
    exports = exports.filter(item => item.userId === userId);
  }
  
  // Calculate pagination
  const total = exports.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExports = exports.slice(startIndex, endIndex);
  
  return {
    data: paginatedExports,
    total,
    page,
    pageSize,
    totalPages
  };
};

/**
 * Generate mock export history
 * @param count Number of export history items to generate
 * @returns Array of mock export history items
 */
const generateExportHistory = (count: number): any[] => {
  const exports = [];
  const today = new Date();
  
  // Export formats
  const formats = ['csv', 'excel', 'pdf', 'json'];
  
  // Report types
  const reportTypes = [
    'daily_actions',
    'player_activity',
    'revenue',
    'promotional',
    'compliance'
  ];
  
  // User IDs
  const userIds = [
    'user-1',
    'user-2',
    'user-3',
    'user-4',
    'user-5'
  ];
  
  // User names
  const userNames = [
    'Admin User',
    'Regular User',
    'Data Analyst',
    'Team Manager',
    'Guest User'
  ];
  
  for (let i = 0; i < count; i++) {
    // Random date between 30 days ago and today
    const timestamp = new Date();
    timestamp.setDate(today.getDate() - Math.floor(Math.random() * 30));
    
    // Random format
    const format = formats[Math.floor(Math.random() * formats.length)];
    
    // Random report type
    const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];
    
    // Random report name
    const reportName = `${reportType.replace(/_/g, ' ')} report`;
    
    // Random user
    const userIndex = Math.floor(Math.random() * userIds.length);
    const userId = userIds[userIndex];
    const userName = userNames[userIndex];
    
    // Random file size between 10KB and 10MB
    const fileSize = Math.floor(Math.random() * 10 * 1024 * 1024) + 10 * 1024;
    
    // Format file size
    const formattedFileSize = formatFileSize(fileSize);
    
    exports.push({
      id: `export-${Date.now()}-${i}`,
      timestamp: timestamp.toISOString(),
      reportId: `report-${Math.floor(Math.random() * 1000) + 1}`,
      reportName,
      reportType,
      format,
      fileSize,
      formattedFileSize,
      userId,
      userName,
      downloadUrl: `https://example.com/exports/${reportType}_${timestamp.getTime()}.${format}`
    });
  }
  
  // Sort by timestamp (newest first)
  return exports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * Format file size
 * @param bytes File size in bytes
 * @returns Formatted file size
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

/**
 * Get metadata for export functionality
 * @returns Metadata for export functionality
 */
const getMetadata = (): any => {
  return {
    formats: [
      { value: 'csv', label: 'CSV', icon: 'file-csv' },
      { value: 'excel', label: 'Excel', icon: 'file-excel' },
      { value: 'pdf', label: 'PDF', icon: 'file-pdf' },
      { value: 'json', label: 'JSON', icon: 'file-code' }
    ],
    options: [
      {
        id: 'includeHeaders',
        label: 'Include Headers',
        type: 'boolean',
        defaultValue: true,
        applicableFormats: ['csv', 'excel']
      },
      {
        id: 'delimiter',
        label: 'Delimiter',
        type: 'select',
        defaultValue: ',',
        options: [
          { value: ',', label: 'Comma (,)' },
          { value: ';', label: 'Semicolon (;)' },
          { value: '\t', label: 'Tab' },
          { value: '|', label: 'Pipe (|)' }
        ],
        applicableFormats: ['csv']
      },
      {
        id: 'includeMetadata',
        label: 'Include Metadata',
        type: 'boolean',
        defaultValue: true,
        applicableFormats: ['pdf', 'excel']
      },
      {
        id: 'includeLogo',
        label: 'Include Logo',
        type: 'boolean',
        defaultValue: true,
        applicableFormats: ['pdf', 'excel']
      },
      {
        id: 'orientation',
        label: 'Orientation',
        type: 'select',
        defaultValue: 'portrait',
        options: [
          { value: 'portrait', label: 'Portrait' },
          { value: 'landscape', label: 'Landscape' }
        ],
        applicableFormats: ['pdf']
      },
      {
        id: 'pageSize',
        label: 'Page Size',
        type: 'select',
        defaultValue: 'a4',
        options: [
          { value: 'a4', label: 'A4' },
          { value: 'letter', label: 'Letter' },
          { value: 'legal', label: 'Legal' }
        ],
        applicableFormats: ['pdf']
      },
      {
        id: 'compress',
        label: 'Compress',
        type: 'boolean',
        defaultValue: false,
        applicableFormats: ['json']
      }
    ]
  };
};

export default {
  getData,
  getExportHistory,
  getMetadata,
  generateExportHistory
};
