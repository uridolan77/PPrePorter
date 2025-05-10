/**
 * Players Mock Data
 */
import { Player } from '../../types/reportsData';

/**
 * Mock player statuses
 */
const playerStatuses = [
  'active',
  'inactive',
  'suspended',
  'pending',
  'blocked'
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
 * Mock player tiers
 */
const playerTiers = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond'
];

/**
 * Mock KYC statuses
 */
const kycStatuses = [
  'verified',
  'pending',
  'rejected',
  'not_submitted'
];

/**
 * Generate a random player
 * @param index Index for generating unique ID
 * @returns Random player object
 */
const generatePlayer = (index: number): Player => {
  const id = `player-${index + 1}`;
  const username = `user${index + 1}`;
  const email = `${username}@example.com`;
  
  // Generate a random registration date within the last 2 years
  const registrationDate = new Date();
  registrationDate.setFullYear(registrationDate.getFullYear() - Math.floor(Math.random() * 2));
  registrationDate.setMonth(Math.floor(Math.random() * 12));
  registrationDate.setDate(Math.floor(Math.random() * 28) + 1);
  
  const status = playerStatuses[Math.floor(Math.random() * playerStatuses.length)];
  const country = countries[Math.floor(Math.random() * countries.length)];
  const balance = Math.floor(Math.random() * 10000);
  const tier = playerTiers[Math.floor(Math.random() * playerTiers.length)];
  
  // Generate a random last login date within the last 30 days
  const lastLogin = new Date();
  lastLogin.setDate(lastLogin.getDate() - Math.floor(Math.random() * 30));
  
  // Random device
  const devices = ['Desktop', 'Mobile - Android', 'Mobile - iOS', 'Tablet - Android', 'Tablet - iOS'];
  const device = devices[Math.floor(Math.random() * devices.length)];
  
  // Random white label
  const whiteLabels = ['Casino Royale', 'Lucky Spin', 'Golden Bet', 'Diamond Play', 'Royal Flush'];
  const whiteLabel = whiteLabels[Math.floor(Math.random() * whiteLabels.length)];
  
  // Random KYC status
  const kycStatus = kycStatuses[Math.floor(Math.random() * kycStatuses.length)];
  
  // Random lifetime metrics
  const lifetimeDeposits = Math.floor(Math.random() * 50000);
  const lifetimeWithdrawals = Math.floor(Math.random() * lifetimeDeposits);
  const lifetimeBets = Math.floor(Math.random() * 100000);
  const lifetimeWins = Math.floor(Math.random() * lifetimeBets);
  const lifetimeGGR = lifetimeBets - lifetimeWins;
  
  // Random tags
  const allTags = ['VIP', 'High Roller', 'Bonus Hunter', 'Slot Player', 'Table Player', 'Live Casino', 'Sports Bettor', 'Poker Player', 'New Player', 'Returning Player'];
  const numTags = Math.floor(Math.random() * 3);
  const tags: string[] = [];
  
  for (let i = 0; i < numTags; i++) {
    const tag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  // Random notes
  const notes = Math.random() > 0.7 ? `Player notes for ${username}` : undefined;
  
  // Random risk score (1-100)
  const riskScore = Math.floor(Math.random() * 100) + 1;
  
  // Random favorite games
  const allGames = ['Starburst', 'Gonzo\'s Quest', 'Book of Dead', 'Blackjack', 'Roulette', 'Poker', 'Baccarat', 'Craps', 'Slots', 'Mega Moolah'];
  const numGames = Math.floor(Math.random() * 3);
  const favoriteGames: string[] = [];
  
  for (let i = 0; i < numGames; i++) {
    const game = allGames[Math.floor(Math.random() * allGames.length)];
    if (!favoriteGames.includes(game)) {
      favoriteGames.push(game);
    }
  }
  
  // Random preferred payment method
  const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Skrill', 'Neteller', 'Bitcoin', 'Apple Pay', 'Google Pay'];
  const preferredPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  
  // Random marketing preferences
  const marketingPreferences = {
    email: Math.random() > 0.3,
    sms: Math.random() > 0.5,
    push: Math.random() > 0.4
  };
  
  return {
    id,
    username,
    email,
    registrationDate: registrationDate.toISOString(),
    status,
    country,
    balance,
    tier,
    lastLogin: lastLogin.toISOString(),
    device,
    whiteLabel,
    kycStatus,
    lifetimeDeposits,
    lifetimeWithdrawals,
    lifetimeBets,
    lifetimeWins,
    lifetimeGGR,
    tags,
    notes,
    riskScore,
    favoriteGames,
    preferredPaymentMethod,
    marketingPreferences
  };
};

/**
 * Generate mock players
 * @param count Number of players to generate
 * @returns Array of mock players
 */
const generatePlayers = (count: number): Player[] => {
  const players: Player[] = [];
  
  for (let i = 0; i < count; i++) {
    players.push(generatePlayer(i));
  }
  
  return players;
};

/**
 * Get mock players data
 * @param params Parameters for filtering and pagination
 * @returns Filtered and paginated players data
 */
const getPlayers = (params?: any): any => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const status = params?.status;
  const country = params?.country;
  const tier = params?.tier;
  const kycStatus = params?.kycStatus;
  const searchTerm = params?.searchTerm;
  
  // Generate 100 players
  let players = generatePlayers(100);
  
  // Apply filters
  if (status) {
    players = players.filter(player => player.status === status);
  }
  
  if (country) {
    players = players.filter(player => player.country === country);
  }
  
  if (tier) {
    players = players.filter(player => player.tier === tier);
  }
  
  if (kycStatus) {
    players = players.filter(player => player.kycStatus === kycStatus);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    players = players.filter(player => 
      player.username.toLowerCase().includes(term) || 
      player.email.toLowerCase().includes(term)
    );
  }
  
  // Calculate pagination
  const total = players.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPlayers = players.slice(startIndex, endIndex);
  
  return {
    data: paginatedPlayers,
    total,
    page,
    pageSize,
    totalPages
  };
};

export default {
  getPlayers,
  generatePlayers,
  generatePlayer,
  playerStatuses,
  countries,
  playerTiers,
  kycStatuses
};
