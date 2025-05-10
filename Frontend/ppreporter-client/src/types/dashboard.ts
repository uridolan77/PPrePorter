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
  /**
   * Tab identifier
   */
  id: string;

  /**
   * Tab display label
   */
  label: string;

  /**
   * Tab icon name or React node
   */
  icon?: ReactNode | string;

  /**
   * Tab content
   */
  content?: ReactNode;

  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
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

/**
 * Player registration data point
 */
export interface PlayerRegistration {
  /**
   * Date of registration
   */
  date: string;

  /**
   * Number of registrations
   */
  count: number;

  /**
   * Source of registration (e.g., 'web', 'mobile', 'affiliate')
   */
  source?: string;
}

/**
 * Game performance data
 */
export interface GamePerformance {
  /**
   * Game identifier
   */
  id: string;

  /**
   * Game name
   */
  name: string;

  /**
   * Game category
   */
  category: string;

  /**
   * Number of players
   */
  players: number;

  /**
   * Total bets placed
   */
  bets: number;

  /**
   * Total revenue generated
   */
  revenue: number;

  /**
   * Average session duration in minutes
   */
  avgSessionDuration: number;

  /**
   * Trend data for visualizations
   */
  trendData?: Array<{ date: string; value: number }>;
}

/**
 * Player segment data
 */
export interface PlayerSegment {
  /**
   * Segment identifier
   */
  id: string;

  /**
   * Segment name
   */
  name: string;

  /**
   * Number of players in segment
   */
  count: number;

  /**
   * Average revenue per user
   */
  arpu: number;

  /**
   * Retention rate percentage
   */
  retention: number;

  /**
   * Churn rate percentage
   */
  churn: number;
}

/**
 * Chart data structure
 */
export interface ChartData {
  /**
   * Labels for the chart (e.g., dates, categories)
   */
  labels: string[];

  /**
   * Datasets for the chart
   */
  datasets: Array<{
    /**
     * Dataset label
     */
    label: string;

    /**
     * Dataset values
     */
    data: number[];

    /**
     * Background color(s)
     */
    backgroundColor?: string | string[];

    /**
     * Border color(s)
     */
    borderColor?: string | string[];

    /**
     * Additional dataset properties
     */
    [key: string]: any;
  }>;
}
