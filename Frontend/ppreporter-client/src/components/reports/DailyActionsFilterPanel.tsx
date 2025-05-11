import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  IconButton,
  SelectChangeEvent,
  Autocomplete,
  Chip,
  Stack,
  Divider,
  TextareaAutosize
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import FilterPanel, { FilterConfig, FilterValues } from './FilterPanel';

// Define specific filter types for DailyActions
export interface DailyActionsFilters {
  dateRange?: Date | null;
  registration?: Date | null;
  firstTimeDeposit?: Date | null;
  lastDepositDate?: Date | null;
  lastLogin?: Date | null;
  blockDate?: Date | null;
  unblockDate?: Date | null;
  lastUpdated?: Date | null;
  trackers?: string;
  promotionCode?: string;
  regPlayMode?: string[];
  languages?: string[];
  countries?: string[];
  currency?: string[];
  gender?: string[];
  status?: string[];
  platform?: string[];
  playersType?: string[];
  smsEnabled?: string;
  mailEnabled?: string;
  phoneEnabled?: string;
  postEnabled?: string;
  bonusEnabled?: string;
  players?: string;
  pageSize?: number;
}

export interface DailyActionsFilterPanelProps {
  onFilterChange?: (filters: DailyActionsFilters) => void;
  onApplyFilters?: (filters: DailyActionsFilters) => void;
  onResetFilters?: () => void;
  initialValues?: DailyActionsFilters;
}

const DailyActionsFilterPanel: React.FC<DailyActionsFilterPanelProps> = ({
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  initialValues = {}
}) => {
  // Define filter configurations
  const filterConfigs: FilterConfig[] = [
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
        { value: 'EN-CL', label: 'EN-CL' },
        // Add more languages as needed
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
        { value: 'Algeria', label: 'Algeria' },
        // Add more countries as needed
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
        { value: 'NZD', label: 'NZD' },
        // Add more currencies as needed
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
  ];

  // Handle filter changes
  const handleFilterChange = (values: FilterValues) => {
    if (onFilterChange) {
      onFilterChange(values as unknown as DailyActionsFilters);
    }
  };

  // Handle apply filters
  const handleApplyFilters = (values: FilterValues) => {
    if (onApplyFilters) {
      onApplyFilters(values as unknown as DailyActionsFilters);
    }
  };

  // Custom players input component
  const PlayersInput = () => {
    const [players, setPlayers] = useState(initialValues.players || '');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPlayers(e.target.value);
      if (onFilterChange) {
        onFilterChange({
          ...initialValues,
          players: e.target.value
        });
      }
    };

    return (
      <Box sx={{ mt: 2 }}>
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
          onChange={handleChange}
        />
      </Box>
    );
  };

  return (
    <Box>
      <FilterPanel
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={onResetFilters}
        initialValues={initialValues as unknown as FilterValues}
        title="Daily Actions Filters"
      />
      <Paper sx={{ p: 2, mb: 3 }}>
        <PlayersInput />
      </Paper>
    </Box>
  );
};

export default DailyActionsFilterPanel;
