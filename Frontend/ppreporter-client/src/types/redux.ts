import { DashboardStats, DashboardComponentErrors } from './dashboard';
import { EntityState } from '@reduxjs/toolkit';

/**
 * Root state interface for the entire Redux store
 */
export interface RootState {
  dashboard: DashboardState;
  auth: AuthState;
  reports: ReportsState;
  naturalLanguage: NaturalLanguageState;
  entities: EntitiesState;
  ui: UIState;
}

/**
 * Dashboard state interface
 */
export interface DashboardState {
  summaryStats: DashboardStats | null;
  casinoRevenue: RevenueData[];
  playerRegistrations: RegistrationData[];
  topGames: GameData[];
  recentTransactions: TransactionData[];
  isLoading: boolean;
  componentErrors: DashboardComponentErrors;
  error: Error | string | null;
}

/**
 * Revenue data interface
 */
export interface RevenueData {
  date: string;
  day?: string;
  fullDate?: string | Date;
  revenue: number;
  value?: number;
}

/**
 * Registration data interface
 */
export interface RegistrationData {
  date: string;
  registrations: number;
  ftd: number;
}

/**
 * Game data interface
 */
export interface GameData {
  id: string;
  name: string;
  revenue: number;
  players: number;
  sessions: number;
  category: string;
}

/**
 * Transaction data interface
 */
export interface TransactionData {
  id: string;
  playerId: string;
  playerName: string;
  type: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | string | null;
}

/**
 * User interface
 */
export interface User {
  id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Reports state interface
 */
export interface ReportsState {
  players: {
    data: any | null;
    metadata: any | null;
    loading: boolean;
    error: Error | string | null;
    selectedPlayer: any | null;
    playerDetails: any | null;
  };
  dailyActions: {
    data: any | null;
    metadata: any | null;
    loading: boolean;
    error: Error | string | null;
  };
  configurations: {
    saved: any[];
    loading: boolean;
    error: Error | string | null;
  };
}

/**
 * Natural language state interface
 */
export interface NaturalLanguageState {
  queryResult: any | null;
  queryHistory: any[];
  suggestedQueries: string[];
  isProcessing: boolean;
  error: Error | string | null;
}

/**
 * API error response interface
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Async thunk configuration
 */
export interface ThunkConfig {
  rejectValue: string | Error;
}

/**
 * Dashboard filters interface
 */
export interface DashboardFilters {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  gameCategory?: string | null;
  playerStatus?: string | null;
  country?: string | null;
  minRevenue?: number | null;
  maxRevenue?: number | null;
  playMode?: string | null;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

/**
 * Registration data interface
 */
export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * UI state interface
 */
export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  activeTab: number;
  notifications: any[];
  userPreferences: {
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
}

/**
 * Normalized entity state interfaces
 */

// Player entity
export interface Player {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  registrationDate: string;
  status: string;
  country?: string;
  totalDeposits?: number;
  totalWithdrawals?: number;
  lastLoginDate?: string;
  kycStatus?: string;
}

// Game entity
export interface Game {
  id: string;
  name: string;
  category: string;
  provider: string;
  releaseDate?: string;
  popularity?: number;
  rtp?: number;
  volatility?: string;
  minBet?: number;
  maxBet?: number;
  features?: string[];
}

// Transaction entity
export interface Transaction {
  id: string;
  playerId: string;
  type: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

// Normalized entities state
export interface EntitiesState {
  players: EntityState<Player>;
  games: EntityState<Game>;
  transactions: EntityState<Transaction>;
  loading: {
    players: boolean;
    games: boolean;
    transactions: boolean;
  };
  errors: {
    players: Error | null;
    games: Error | null;
    transactions: Error | null;
  };
}
