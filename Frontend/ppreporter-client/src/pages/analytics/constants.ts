/**
 * Analytics page constants
 */

export interface TabDefinition {
  id: string;
  label: string;
  ariaControls: string;
}

export const ANALYTICS_TABS: TabDefinition[] = [
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

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
};
