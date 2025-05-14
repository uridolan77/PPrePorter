import React, { useState, useCallback, useMemo } from 'react';
import {
  Typography,
  Paper,
  TextareaAutosize
} from '@mui/material';
import FilterPanel, { FilterConfig, FilterValues } from './FilterPanel';

/**
 * Daily actions filter options
 */
export interface DailyActionsFilters {
  /** Date range for filtering */
  dateRange?: Date | null;
  /** Registration date */
  registration?: Date | null;
  /** First time deposit date */
  firstTimeDeposit?: Date | null;
  /** Last deposit date */
  lastDepositDate?: Date | null;
  /** Last login date */
  lastLogin?: Date | null;
  /** Block date */
  blockDate?: Date | null;
  /** Unblock date */
  unblockDate?: Date | null;
  /** Last updated date */
  lastUpdated?: Date | null;
  /** Tracker information */
  trackers?: string;
  /** Promotion code */
  promotionCode?: string;
  /** Registration play modes */
  regPlayMode?: string[];
  /** Languages */
  languages?: string[];
  /** Countries */
  countries?: string[];
  /** Currencies */
  currency?: string[];
  /** Gender options */
  gender?: string[];
  /** Status options */
  status?: string[];
  /** Platform options */
  platform?: string[];
  /** Player type options */
  playersType?: string[];
  /** SMS enabled flag */
  smsEnabled?: string;
  /** Mail enabled flag */
  mailEnabled?: string;
  /** Phone enabled flag */
  phoneEnabled?: string;
  /** Post enabled flag */
  postEnabled?: string;
  /** Bonus enabled flag */
  bonusEnabled?: string;
  /** Player IDs or usernames */
  players?: string;
  /** Page size for results */
  pageSize?: number;
}

/**
 * Props for the DailyActionsFilterPanel component
 */
export interface DailyActionsFilterPanelProps {
  /** Callback for filter changes */
  onFilterChange?: (filters: DailyActionsFilters) => void;
  /** Callback for applying filters */
  onApplyFilters?: (filters: DailyActionsFilters) => void;
  /** Callback for resetting filters */
  onResetFilters?: () => void;
  /** Initial filter values */
  initialValues?: DailyActionsFilters;
  /** Whether the panel is expanded by default */
  defaultExpanded?: boolean;
}

/**
 * Filter panel for daily actions report
 */
const DailyActionsFilterPanel: React.FC<DailyActionsFilterPanelProps> = ({
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  initialValues = {},
  defaultExpanded = true
}) => {
  // State for players input
  const [players, setPlayers] = useState<string>(initialValues.players || '');
  /**
   * Define filter configurations - memoized to prevent unnecessary re-renders
   */
  const filterConfigs = React.useMemo<FilterConfig[]>(() => [
    // Text filters
    {
      id: 'trackers',
      label: 'Trackers',
      type: 'text',
    },
    {
      id: 'promotionCode',
      label: 'Promotion Code',
      type: 'text',
    },

    // Multi-select filters
    {
      id: 'regPlayMode',
      label: 'Reg Play Mode',
      type: 'multiselect',
      options: [
        { value: 'Casino', label: 'Casino' },
        { value: 'Sport', label: 'Sport' },
        { value: 'Live', label: 'Live' },
        { value: 'Bingo', label: 'Bingo' }
      ],
      defaultValue: []
    },
    {
      id: 'languages',
      label: 'Languages',
      type: 'multiselect',
      options: [
        { value: 'Arabic', label: 'Arabic' },
        { value: 'EN-Canada', label: 'EN-Canada' },
        { value: 'EN-CL', label: 'EN-CL' }
      ],
      defaultValue: []
    },
    {
      id: 'countries',
      label: 'Countries',
      type: 'multiselect',
      options: [
        { value: 'Afghanistan', label: 'Afghanistan' },
        { value: 'Albania', label: 'Albania' },
        { value: 'Algeria', label: 'Algeria' }
      ],
      defaultValue: []
    },
    {
      id: 'currency',
      label: 'Currency',
      type: 'multiselect',
      options: [
        { value: 'AUD', label: 'AUD' },
        { value: 'CAD', label: 'CAD' },
        { value: 'EUR', label: 'EUR' },
        { value: 'GBP', label: 'GBP' },
        { value: 'NZD', label: 'NZD' }
      ],
      defaultValue: []
    },
    {
      id: 'gender',
      label: 'Gender',
      type: 'multiselect',
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ],
      defaultValue: []
    },
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Blocked', label: 'Blocked' },
        { value: 'Inactive', label: 'Inactive' }
      ],
      defaultValue: []
    },
    {
      id: 'platform',
      label: 'Platform',
      type: 'multiselect',
      options: [
        { value: 'Mobile', label: 'Mobile' },
        { value: 'Web', label: 'Web' }
      ],
      defaultValue: []
    },
    {
      id: 'playersType',
      label: 'Players Type',
      type: 'multiselect',
      options: [
        { value: 'Real', label: 'Real' },
        { value: 'Fun', label: 'Fun' }
      ],
      defaultValue: []
    },

    // Yes/No select filters
    {
      id: 'smsEnabled',
      label: 'SMS Enabled',
      type: 'select',
      options: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ],
      defaultValue: ''
    },
    {
      id: 'mailEnabled',
      label: 'Mail Enabled',
      type: 'select',
      options: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ],
      defaultValue: ''
    },
    {
      id: 'phoneEnabled',
      label: 'Phone Enabled',
      type: 'select',
      options: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ],
      defaultValue: ''
    },
    {
      id: 'postEnabled',
      label: 'Post Enabled',
      type: 'select',
      options: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ],
      defaultValue: ''
    },
    {
      id: 'bonusEnabled',
      label: 'Bonus Enabled',
      type: 'select',
      options: [
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
      ],
      defaultValue: ''
    },

    // Date filters
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'date',
    },
    {
      id: 'registration',
      label: 'Registration',
      type: 'date',
    },
    {
      id: 'firstTimeDeposit',
      label: 'First Time Deposit',
      type: 'date',
    },
    {
      id: 'lastDepositDate',
      label: 'Last Deposit Date',
      type: 'date',
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      type: 'date',
    },
    {
      id: 'blockDate',
      label: 'Block Date',
      type: 'date',
    },
    {
      id: 'unblockDate',
      label: 'Unblock Date',
      type: 'date',
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      type: 'date',
    },

    // Page size filter
    {
      id: 'pageSize',
      label: 'Page Size',
      type: 'select',
      options: [
        { value: '10', label: '10' },
        { value: '25', label: '25' },
        { value: '50', label: '50' },
        { value: '100', label: '100' }
      ],
      defaultValue: '50'
    },
  ], []);

  /**
   * Handle filter changes
   * @param values - The updated filter values
   */
  const handleFilterChange = useCallback((values: FilterValues) => {
    if (onFilterChange) {
      onFilterChange(values as unknown as DailyActionsFilters);
    }
  }, [onFilterChange]);

  /**
   * Handle apply filters
   * @param values - The filter values to apply
   */
  const handleApplyFilters = useCallback((values: FilterValues) => {
    if (onApplyFilters) {
      onApplyFilters(values as unknown as DailyActionsFilters);
    }
  }, [onApplyFilters]);

  /**
   * Handle players input change
   * @param e - The change event
   */
  const handlePlayersChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPlayers(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        ...initialValues,
        players: e.target.value
      });
    }
  }, [initialValues, onFilterChange]);

  /**
   * Players input component
   */
  const PlayersInput = useMemo(() => (
    <div style={{ marginTop: 16 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Players
      </Typography>
      <TextareaAutosize
        minRows={3}
        placeholder="Enter player IDs or usernames (one per line)"
        style={{
          width: '100%',
          padding: '8px',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          borderRadius: '4px',
          borderColor: '#ccc'
        }}
        value={players}
        onChange={handlePlayersChange}
      />
    </div>
  ), [players, handlePlayersChange]);

  return (
    <div>
      <FilterPanel
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={onResetFilters}
        initialValues={initialValues as unknown as FilterValues}
        title="Daily Actions Filters"
      />
      <Paper sx={{ p: 2, mb: 3 }}>
        {PlayersInput}
      </Paper>
    </div>
  );
};

export default DailyActionsFilterPanel;
