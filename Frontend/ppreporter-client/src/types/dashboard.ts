import { ReactNode } from 'react';

/**
 * Dashboard statistics data structure
 */
export interface DashboardStats {
  revenue: {
    value: number;
    change: number;
    period?: string;
  };
  players: {
    value: number;
    change: number;
    period?: string;
  };
  games: {
    value: number;
    change: number;
    period?: string;
  };
  engagement: {
    value: number;
    change: number;
    period?: string;
  };
  registrations?: number;
  registrationsChange?: number;
  ftd?: number;
  ftdChange?: number;
  deposits?: number;
  depositsChange?: number;
}

/**
 * Dashboard chart data structure
 */
export interface DashboardChartData {
  revenueByDay: RevenueDataPoint[];
  playersByGame: GameDataPoint[];
}

/**
 * Revenue data point structure
 */
export interface RevenueDataPoint {
  day: string;
  date?: string;
  value: number;
  revenue?: number;
  fullDate?: string | Date;
}

/**
 * Game data point structure
 */
export interface GameDataPoint {
  game: string;
  value: number;
  color?: string;
}

/**
 * Dashboard component error structure
 */
export interface DashboardComponentErrors {
  summary?: Error | null;
  revenue?: Error | null;
  registrations?: Error | null;
  topGames?: Error | null;
  transactions?: Error | null;
  [key: string]: Error | null | undefined;
}

/**
 * Dashboard tab structure
 */
export interface DashboardTab {
  id: string;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
}

/**
 * Time period options
 */
export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Dashboard preferences structure
 */
export interface DashboardPreferences {
  colorScheme: {
    baseTheme: 'light' | 'dark' | 'system';
    colorMode: 'standard' | 'high-contrast';
    primaryColor: string;
    secondaryColor: string;
    positiveColor: string;
    negativeColor: string;
    neutralColor: string;
    contrastLevel: number;
  };
  informationDensity: 'low' | 'medium' | 'high';
  preferredChartTypes: {
    revenue: string;
    registrations: string;
    topGames: string;
    transactions: string;
    [key: string]: string;
  };
}
