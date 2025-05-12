import { AnalyticsTab } from './types';

/**
 * Analytics tabs configuration
 */
export const ANALYTICS_TABS: AnalyticsTab[] = [
  {
    id: 'overview',
    label: 'Overview',
    ariaControls: 'tabpanel-overview'
  },
  {
    id: 'performance',
    label: 'Performance',
    ariaControls: 'tabpanel-performance'
  },
  {
    id: 'player-analysis',
    label: 'Player Analysis',
    ariaControls: 'tabpanel-player-analysis'
  },
  {
    id: 'game-analysis',
    label: 'Game Analysis',
    ariaControls: 'tabpanel-game-analysis'
  }
];

/**
 * Date format options for formatting timestamps
 */
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
};

/**
 * Spacing constants for styling
 */
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

/**
 * Border radius constants for styling
 */
export const BORDER_RADIUS = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

/**
 * Color constants for styling
 */
export const COLORS = {
  divider: 'rgba(0, 0, 0, 0.12)',
  placeholder: 'rgba(0, 0, 0, 0.08)',
};

/**
 * Card style constants
 */
export const CARD_STYLE = {
  padding: SPACING.lg,
  borderRadius: BORDER_RADIUS.md,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
};

/**
 * Heading style constants
 */
export const HEADING_STYLE = {
  marginBottom: SPACING.xs,
};

/**
 * Section style constants
 */
export const SECTION_STYLE = {
  marginBottom: SPACING.lg,
};

/**
 * Chart container style constants
 */
export const CHART_CONTAINER_STYLE = {
  height: 300,
  border: `1px dashed ${COLORS.divider}`,
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.lg,
};

/**
 * Tab container style constants
 */
export const TAB_CONTAINER_STYLE = {
  borderBottom: `1px solid ${COLORS.divider}`,
  marginBottom: SPACING.lg,
};

/**
 * Error container style constants
 */
export const ERROR_CONTAINER_STYLE = {
  marginBottom: SPACING.lg,
};

/**
 * Placeholder style constants
 */
export const PLACEHOLDER_STYLE = {
  backgroundColor: COLORS.placeholder,
  borderRadius: BORDER_RADIUS.md,
  padding: SPACING.lg,
  minHeight: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
