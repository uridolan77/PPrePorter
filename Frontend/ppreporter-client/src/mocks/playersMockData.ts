/**
 * Mock data for players report
 */

export interface Player {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  status?: string;
  registrationDate?: string;
  lastLoginDate?: string;
  balance?: number;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalBets?: number;
  totalWins?: number;
  netProfit?: number;
  currency?: string;
  vipLevel?: string;
  kycStatus?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  gender?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
  notes?: string;
  tags?: string[];
  whiteLabel?: string;
  whiteLabelId?: number;
  platform?: string;
  device?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  referrer?: string;
  affiliateId?: string;
  campaignId?: string;
  promotionCode?: string;
  bonusEligible?: boolean;
  smsEnabled?: boolean;
  emailEnabled?: boolean;
  phoneEnabled?: boolean;
  postEnabled?: boolean;
}

export interface WhiteLabel {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface Status {
  id: string;
  name: string;
}

export const mockWhiteLabels: WhiteLabel[] = [
  { id: '1', name: 'Casino Royale' },
  { id: '2', name: 'Lucky Star' },
  { id: '3', name: 'Golden Palace' },
  { id: '4', name: 'Diamond Club' },
  { id: '5', name: 'Silver Sands' }
];

export const mockCountries: Country[] = [
  { id: 'US', name: 'United States' },
  { id: 'UK', name: 'United Kingdom' },
  { id: 'CA', name: 'Canada' },
  { id: 'DE', name: 'Germany' },
  { id: 'FR', name: 'France' },
  { id: 'ES', name: 'Spain' },
  { id: 'IT', name: 'Italy' },
  { id: 'AU', name: 'Australia' },
  { id: 'NZ', name: 'New Zealand' },
  { id: 'SE', name: 'Sweden' }
];

export const mockStatuses: Status[] = [
  { id: 'Active', name: 'Active' },
  { id: 'Inactive', name: 'Inactive' },
  { id: 'Blocked', name: 'Blocked' },
  { id: 'Pending', name: 'Pending' },
  { id: 'Suspended', name: 'Suspended' }
];

export const mockPlayersMetadata = {
  whiteLabels: mockWhiteLabels,
  countries: mockCountries,
  statuses: mockStatuses
};

export const mockPlayers: Player[] = [
  {
    id: '1',
    username: 'johndoe123',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    country: 'United States',
    status: 'Active',
    registrationDate: '2022-01-15T10:30:00Z',
    lastLoginDate: '2023-05-20T15:45:00Z',
    balance: 1250.75,
    totalDeposits: 5000,
    totalWithdrawals: 2500,
    totalBets: 15000,
    totalWins: 13750,
    netProfit: -1250,
    currency: 'USD',
    vipLevel: 'Gold',
    kycStatus: 'Verified',
    phoneNumber: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    postalCode: '10001',
    gender: 'Male',
    dateOfBirth: '1985-06-12',
    isVerified: true,
    whiteLabel: 'Casino Royale',
    whiteLabelId: 1,
    platform: 'Web',
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    ipAddress: '192.168.1.1',
    referrer: 'Google',
    smsEnabled: true,
    emailEnabled: true,
    phoneEnabled: false,
    postEnabled: false,
    bonusEligible: true
  },
  {
    id: '2',
    username: 'janesmith456',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    country: 'United Kingdom',
    status: 'Active',
    registrationDate: '2022-02-20T14:15:00Z',
    lastLoginDate: '2023-05-21T09:30:00Z',
    balance: 750.25,
    totalDeposits: 3000,
    totalWithdrawals: 1500,
    totalBets: 8000,
    totalWins: 7500,
    netProfit: -500,
    currency: 'GBP',
    vipLevel: 'Silver',
    kycStatus: 'Verified',
    phoneNumber: '+4412345678',
    address: '456 High Street',
    city: 'London',
    postalCode: 'SW1A 1AA',
    gender: 'Female',
    dateOfBirth: '1990-03-25',
    isVerified: true,
    whiteLabel: 'Lucky Star',
    whiteLabelId: 2,
    platform: 'Mobile',
    device: 'iPhone',
    browser: 'Safari',
    os: 'iOS',
    ipAddress: '192.168.1.2',
    referrer: 'Facebook',
    smsEnabled: true,
    emailEnabled: true,
    phoneEnabled: true,
    postEnabled: false,
    bonusEligible: true
  },
  {
    id: '3',
    username: 'mikebrown789',
    email: 'mike.brown@example.com',
    firstName: 'Mike',
    lastName: 'Brown',
    country: 'Canada',
    status: 'Inactive',
    registrationDate: '2022-03-10T11:45:00Z',
    lastLoginDate: '2022-12-15T18:20:00Z',
    balance: 0,
    totalDeposits: 1000,
    totalWithdrawals: 1200,
    totalBets: 5000,
    totalWins: 5200,
    netProfit: 200,
    currency: 'CAD',
    vipLevel: 'Bronze',
    kycStatus: 'Verified',
    phoneNumber: '+1987654321',
    address: '789 Maple Ave',
    city: 'Toronto',
    postalCode: 'M5V 2L7',
    gender: 'Male',
    dateOfBirth: '1988-11-30',
    isVerified: true,
    whiteLabel: 'Golden Palace',
    whiteLabelId: 3,
    platform: 'Web',
    device: 'Desktop',
    browser: 'Firefox',
    os: 'macOS',
    ipAddress: '192.168.1.3',
    referrer: 'Direct',
    smsEnabled: false,
    emailEnabled: true,
    phoneEnabled: false,
    postEnabled: false,
    bonusEligible: false
  },
  {
    id: '4',
    username: 'sarahwilson',
    email: 'sarah.wilson@example.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    country: 'Australia',
    status: 'Active',
    registrationDate: '2022-04-05T09:00:00Z',
    lastLoginDate: '2023-05-19T22:10:00Z',
    balance: 3500.50,
    totalDeposits: 7000,
    totalWithdrawals: 2000,
    totalBets: 20000,
    totalWins: 18500,
    netProfit: -1500,
    currency: 'AUD',
    vipLevel: 'Platinum',
    kycStatus: 'Verified',
    phoneNumber: '+6198765432',
    address: '101 Beach Road',
    city: 'Sydney',
    postalCode: '2000',
    gender: 'Female',
    dateOfBirth: '1992-07-18',
    isVerified: true,
    whiteLabel: 'Diamond Club',
    whiteLabelId: 4,
    platform: 'Mobile',
    device: 'Android',
    browser: 'Chrome',
    os: 'Android',
    ipAddress: '192.168.1.4',
    referrer: 'Instagram',
    smsEnabled: true,
    emailEnabled: true,
    phoneEnabled: true,
    postEnabled: true,
    bonusEligible: true
  },
  {
    id: '5',
    username: 'davidmiller',
    email: 'david.miller@example.com',
    firstName: 'David',
    lastName: 'Miller',
    country: 'Germany',
    status: 'Blocked',
    registrationDate: '2022-05-12T16:30:00Z',
    lastLoginDate: '2022-11-30T13:45:00Z',
    balance: 0,
    totalDeposits: 2500,
    totalWithdrawals: 0,
    totalBets: 10000,
    totalWins: 7500,
    netProfit: -2500,
    currency: 'EUR',
    vipLevel: 'Silver',
    kycStatus: 'Rejected',
    phoneNumber: '+4923456789',
    address: '234 Hauptstrasse',
    city: 'Berlin',
    postalCode: '10115',
    gender: 'Male',
    dateOfBirth: '1983-09-05',
    isVerified: false,
    whiteLabel: 'Silver Sands',
    whiteLabelId: 5,
    platform: 'Web',
    device: 'Desktop',
    browser: 'Edge',
    os: 'Windows',
    ipAddress: '192.168.1.5',
    referrer: 'Affiliate',
    affiliateId: 'AFF123',
    smsEnabled: false,
    emailEnabled: false,
    phoneEnabled: false,
    postEnabled: false,
    bonusEligible: false
  },
  {
    id: '6',
    username: 'emilyjohnson',
    email: 'emily.johnson@example.com',
    firstName: 'Emily',
    lastName: 'Johnson',
    country: 'France',
    status: 'Active',
    registrationDate: '2022-06-18T10:15:00Z',
    lastLoginDate: '2023-05-21T11:30:00Z',
    balance: 1800.25,
    totalDeposits: 4000,
    totalWithdrawals: 1000,
    totalBets: 12000,
    totalWins: 10800,
    netProfit: -1200,
    currency: 'EUR',
    vipLevel: 'Gold',
    kycStatus: 'Verified',
    phoneNumber: '+3312345678',
    address: '567 Rue de Paris',
    city: 'Paris',
    postalCode: '75001',
    gender: 'Female',
    dateOfBirth: '1995-02-14',
    isVerified: true,
    whiteLabel: 'Casino Royale',
    whiteLabelId: 1,
    platform: 'Mobile',
    device: 'iPhone',
    browser: 'Safari',
    os: 'iOS',
    ipAddress: '192.168.1.6',
    referrer: 'Twitter',
    smsEnabled: true,
    emailEnabled: true,
    phoneEnabled: false,
    postEnabled: false,
    bonusEligible: true
  },
  {
    id: '7',
    username: 'roberttaylor',
    email: 'robert.taylor@example.com',
    firstName: 'Robert',
    lastName: 'Taylor',
    country: 'Spain',
    status: 'Active',
    registrationDate: '2022-07-25T13:45:00Z',
    lastLoginDate: '2023-05-20T19:20:00Z',
    balance: 950.75,
    totalDeposits: 3500,
    totalWithdrawals: 2000,
    totalBets: 9000,
    totalWins: 8450,
    netProfit: -550,
    currency: 'EUR',
    vipLevel: 'Silver',
    kycStatus: 'Verified',
    phoneNumber: '+3498765432',
    address: '890 Calle Mayor',
    city: 'Madrid',
    postalCode: '28001',
    gender: 'Male',
    dateOfBirth: '1987-12-03',
    isVerified: true,
    whiteLabel: 'Lucky Star',
    whiteLabelId: 2,
    platform: 'Web',
    device: 'Desktop',
    browser: 'Chrome',
    os: 'Windows',
    ipAddress: '192.168.1.7',
    referrer: 'Google',
    smsEnabled: false,
    emailEnabled: true,
    phoneEnabled: true,
    postEnabled: false,
    bonusEligible: true
  },
  {
    id: '8',
    username: 'oliviamartin',
    email: 'olivia.martin@example.com',
    firstName: 'Olivia',
    lastName: 'Martin',
    country: 'Italy',
    status: 'Pending',
    registrationDate: '2022-08-30T15:30:00Z',
    lastLoginDate: '2023-05-18T14:15:00Z',
    balance: 250.50,
    totalDeposits: 500,
    totalWithdrawals: 0,
    totalBets: 2000,
    totalWins: 1750,
    netProfit: -250,
    currency: 'EUR',
    vipLevel: 'Bronze',
    kycStatus: 'Pending',
    phoneNumber: '+3912345678',
    address: '123 Via Roma',
    city: 'Rome',
    postalCode: '00100',
    gender: 'Female',
    dateOfBirth: '1993-05-22',
    isVerified: false,
    whiteLabel: 'Golden Palace',
    whiteLabelId: 3,
    platform: 'Mobile',
    device: 'Android',
    browser: 'Chrome',
    os: 'Android',
    ipAddress: '192.168.1.8',
    referrer: 'Affiliate',
    affiliateId: 'AFF456',
    smsEnabled: true,
    emailEnabled: true,
    phoneEnabled: false,
    postEnabled: false,
    bonusEligible: true
  },
  {
    id: '9',
    username: 'williamclark',
    email: 'william.clark@example.com',
    firstName: 'William',
    lastName: 'Clark',
    country: 'Sweden',
    status: 'Active',
    registrationDate: '2022-09-15T11:00:00Z',
    lastLoginDate: '2023-05-21T08:45:00Z',
    balance: 4200.25,
    totalDeposits: 10000,
    totalWithdrawals: 5000,
    totalBets: 25000,
    totalWins: 24200,
    netProfit: -800,
    currency: 'SEK',
    vipLevel: 'Diamond',
    kycStatus: 'Verified',
    phoneNumber: '+4687654321',
    address: '456 Kungsgatan',
    city: 'Stockholm',
    postalCode: '111 22',
    gender: 'Male',
    dateOfBirth: '1980-08-10',
    isVerified: true,
    whiteLabel: 'Diamond Club',
    whiteLabelId: 4,
    platform: 'Web',
    device: 'Desktop',
    browser: 'Firefox',
    os: 'Linux',
    ipAddress: '192.168.1.9',
    referrer: 'Direct',
    smsEnabled: true,
    emailEnabled: true,
    phoneEnabled: true,
    postEnabled: true,
    bonusEligible: true
  },
  {
    id: '10',
    username: 'sophialee',
    email: 'sophia.lee@example.com',
    firstName: 'Sophia',
    lastName: 'Lee',
    country: 'New Zealand',
    status: 'Inactive',
    registrationDate: '2022-10-20T09:30:00Z',
    lastLoginDate: '2023-01-15T16:20:00Z',
    balance: 0,
    totalDeposits: 1500,
    totalWithdrawals: 1800,
    totalBets: 6000,
    totalWins: 6300,
    netProfit: 300,
    currency: 'NZD',
    vipLevel: 'Bronze',
    kycStatus: 'Verified',
    phoneNumber: '+6412345678',
    address: '789 Queen Street',
    city: 'Auckland',
    postalCode: '1010',
    gender: 'Female',
    dateOfBirth: '1991-11-15',
    isVerified: true,
    whiteLabel: 'Silver Sands',
    whiteLabelId: 5,
    platform: 'Mobile',
    device: 'iPhone',
    browser: 'Safari',
    os: 'iOS',
    ipAddress: '192.168.1.10',
    referrer: 'Email',
    smsEnabled: false,
    emailEnabled: true,
    phoneEnabled: false,
    postEnabled: false,
    bonusEligible: false
  }
];
