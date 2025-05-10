/**
 * Schedule Report Mock Data
 */

/**
 * Get mock data for report scheduling
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated schedule data
 */
const getData = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const reportId = params?.reportId;
  const frequency = params?.frequency;
  const status = params?.status;

  // Generate schedule data
  let schedules = generateSchedules(30);

  // Apply filters
  if (reportId) {
    schedules = schedules.filter(schedule => schedule.reportId === reportId);
  }

  if (frequency) {
    schedules = schedules.filter(schedule => schedule.frequency === frequency);
  }

  if (status !== undefined) {
    schedules = schedules.filter(schedule => schedule.isActive === status);
  }

  // Calculate pagination
  const total = schedules.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSchedules = schedules.slice(startIndex, endIndex);

  return {
    data: paginatedSchedules,
    total,
    page,
    pageSize,
    totalPages
  };
};

/**
 * Create a new schedule
 * @param params Schedule parameters
 * @returns Created schedule
 */
const createSchedule = (params?: any): any => {
  const reportId = params?.reportId;
  const reportName = params?.reportName;
  const frequency = params?.frequency || 'daily';
  const time = params?.time || '08:00';
  const day = params?.day;
  const recipients = params?.recipients || [];
  const format = params?.format || 'pdf';
  const isActive = params?.isActive !== undefined ? params?.isActive : true;

  const newSchedule = {
    id: `schedule-${Date.now()}`,
    reportId,
    reportName,
    frequency,
    time,
    day,
    recipients,
    format,
    isActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastRun: null,
    nextRun: calculateNextRun(frequency, time, day)
  };

  return {
    success: true,
    message: 'Schedule created successfully',
    schedule: newSchedule
  };
};

/**
 * Update an existing schedule
 * @param params Schedule parameters
 * @returns Updated schedule
 */
const updateSchedule = (params?: any): any => {
  const scheduleId = params?.id;
  const frequency = params?.frequency;
  const time = params?.time;
  const day = params?.day;
  const recipients = params?.recipients;
  const format = params?.format;
  const isActive = params?.isActive;

  // Find the schedule in the mock data
  const schedules = generateSchedules(30);
  const schedule = schedules.find(s => s.id === scheduleId);

  if (!schedule) {
    return {
      success: false,
      message: 'Schedule not found'
    };
  }

  // Update the schedule
  const updatedSchedule = {
    ...schedule,
    frequency: frequency || schedule.frequency,
    time: time || schedule.time,
    day: day !== undefined ? day : schedule.day,
    recipients: recipients || schedule.recipients,
    format: format || schedule.format,
    isActive: isActive !== undefined ? isActive : schedule.isActive,
    updatedAt: new Date().toISOString(),
    nextRun: calculateNextRun(
      frequency || schedule.frequency,
      time || schedule.time,
      day !== undefined ? day : schedule.day
    )
  };

  return {
    success: true,
    message: 'Schedule updated successfully',
    schedule: updatedSchedule
  };
};

/**
 * Delete a schedule
 * @param params Schedule parameters
 * @returns Delete result
 */
const deleteSchedule = (params?: any): any => {
  const scheduleId = params?.id;

  return {
    success: true,
    message: 'Schedule deleted successfully',
    id: scheduleId
  };
};

/**
 * Generate mock schedules
 * @param count Number of schedules to generate
 * @returns Array of mock schedules
 */
const generateSchedules = (count: number): any[] => {
  const schedules = [];

  // Frequencies
  const frequencies = ['daily', 'weekly', 'monthly'];

  // Formats
  const formats = ['pdf', 'excel', 'csv'];

  // Report types
  const reportTypes = [
    'daily_actions',
    'player_activity',
    'revenue',
    'promotional',
    'compliance'
  ];

  // Email domains
  const emailDomains = ['example.com', 'test.com', 'casino.com', 'gaming.com', 'analytics.com'];

  for (let i = 0; i < count; i++) {
    // Random report type
    const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)];

    // Random report name
    const reportName = `${reportType.replace(/_/g, ' ')} report`;

    // Random frequency
    const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];

    // Random time (00:00 - 23:59)
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    // Random day (for weekly and monthly)
    const day = frequency === 'weekly'
      ? Math.floor(Math.random() * 7) // 0-6 (Sunday-Saturday)
      : frequency === 'monthly'
        ? Math.floor(Math.random() * 28) + 1 // 1-28
        : undefined;

    // Random recipients (1-5)
    const recipientCount = Math.floor(Math.random() * 5) + 1;
    const recipients = [];

    for (let j = 0; j < recipientCount; j++) {
      const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
      recipients.push(`recipient${i}${j}@${domain}`);
    }

    // Random format
    const format = formats[Math.floor(Math.random() * formats.length)];

    // Random active status
    const isActive = Math.random() > 0.2; // 80% active

    // Random created date between 90 days ago and today
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

    // Random updated date between created date and today
    const updatedAt = new Date();
    updatedAt.setDate(updatedAt.getDate() - Math.floor(Math.random() * (new Date().getDate() - createdAt.getDate())));

    // Random last run date (if active)
    const lastRun = isActive ? new Date(updatedAt) : null;
    if (lastRun) {
      lastRun.setDate(lastRun.getDate() - Math.floor(Math.random() * 7) - 1); // 1-7 days ago
    }

    // Calculate next run
    const nextRun = isActive ? calculateNextRun(frequency, time, day) : null;

    schedules.push({
      id: `schedule-${i + 1}`,
      reportId: `report-${Math.floor(Math.random() * 1000) + 1}`,
      reportName,
      frequency,
      time,
      day,
      recipients,
      format,
      isActive,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      lastRun: lastRun ? lastRun.toISOString() : null,
      nextRun: nextRun ? nextRun.toISOString() : null
    });
  }

  // Sort by created date (newest first)
  return schedules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Calculate the next run date based on frequency, time, and day
 * @param frequency Schedule frequency
 * @param time Schedule time
 * @param day Schedule day (for weekly and monthly)
 * @returns Next run date
 */
const calculateNextRun = (frequency: string, time: string, day?: number): Date => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const nextRun = new Date();

  nextRun.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, start from tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  if (frequency === 'weekly' && day !== undefined) {
    // Set to the next occurrence of the specified day of the week
    const currentDay = nextRun.getDay();
    const daysUntilTargetDay = (day - currentDay + 7) % 7;

    nextRun.setDate(nextRun.getDate() + daysUntilTargetDay);
  } else if (frequency === 'monthly' && day !== undefined) {
    // Set to the specified day of the current or next month
    const currentDate = nextRun.getDate();

    if (currentDate > day) {
      // Move to next month
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    // Set the day of the month
    nextRun.setDate(day);

    // If the day is invalid (e.g., February 30), it will roll over to the next month
    // Adjust if needed
    if (nextRun.getDate() !== day) {
      // Set to the last day of the previous month
      nextRun.setDate(0);
    }
  }

  return nextRun;
};

/**
 * Get metadata for schedule functionality
 * @returns Metadata for schedule functionality
 */
const getMetadata = (): any => {
  return {
    frequencies: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' }
    ],
    formats: [
      { value: 'pdf', label: 'PDF' },
      { value: 'excel', label: 'Excel' },
      { value: 'csv', label: 'CSV' }
    ],
    weekDays: [
      { value: 0, label: 'Sunday' },
      { value: 1, label: 'Monday' },
      { value: 2, label: 'Tuesday' },
      { value: 3, label: 'Wednesday' },
      { value: 4, label: 'Thursday' },
      { value: 5, label: 'Friday' },
      { value: 6, label: 'Saturday' }
    ]
  };
};

export default {
  getData,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getMetadata,
  generateSchedules
};
