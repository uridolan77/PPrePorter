import React, { useState, useEffect } from 'react';
import {
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  TextField,
  Box as MuiBox
} from '@mui/material';
import SimpleBox from '../../../components/common/SimpleBox';
import KPICard from '../../common/KPICard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CasinoIcon from '@mui/icons-material/Casino';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import {
  DailyActionsSummary,
  SummaryMetricType,
  ComparisonPeriodType,
  MetricDefinition
} from '../../../types/reports';

// Available metrics with their definitions
const availableMetrics: MetricDefinition[] = [
  {
    id: 'totalPlayers',
    label: 'Total Players',
    description: 'Total number of unique players',
    format: 'number',
    icon: <PeopleAltIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'newRegistrations',
    label: 'New Registrations',
    description: 'New player registrations',
    format: 'number',
    icon: <PersonAddIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'totalDeposits',
    label: 'Total Deposits',
    description: 'Total deposit amount',
    format: 'currency',
    icon: <MonetizationOnIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'totalBets',
    label: 'Total Bets',
    description: 'Total bet amount',
    format: 'currency',
    icon: <CasinoIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'totalWithdrawals',
    label: 'Total Withdrawals',
    description: 'Total withdrawal amount',
    format: 'currency',
    icon: <AccountBalanceIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'totalGGR',
    label: 'Total GGR',
    description: 'Gross Gaming Revenue',
    format: 'currency',
    icon: <TrendingUpIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'avgBetAmount',
    label: 'Avg. Bet Amount',
    description: 'Average bet amount per player',
    format: 'currency',
    icon: <CasinoIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'conversionRate',
    label: 'Conversion Rate',
    description: 'Percentage of players who made a deposit',
    format: 'percentage',
    icon: <RepeatIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'avgSessionDuration',
    label: 'Avg. Session Duration',
    description: 'Average time spent by players',
    format: 'time',
    icon: <AccessTimeIcon />,
    defaultComparisonPeriod: 'previous'
  },
  {
    id: 'betCount',
    label: 'Bet Count',
    description: 'Total number of bets placed',
    format: 'number',
    icon: <CasinoIcon />,
    defaultComparisonPeriod: 'previous'
  }
];

// Comparison period options
const comparisonPeriodOptions = [
  { value: 'previous', label: 'Previous Period' },
  { value: 'lastWeek', label: 'Last Week' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Period' }
];

// Default metrics to display
const defaultMetrics: SummaryMetricType[] = [
  'totalPlayers',
  'newRegistrations',
  'totalDeposits',
  'totalBets'
];

interface ConfigurableSummaryCardsProps {
  summary: DailyActionsSummary | null;
  isLoading: boolean;
  error: string | null;
  selectedMetrics?: SummaryMetricType[];
  comparisonPeriods?: Record<SummaryMetricType, ComparisonPeriodType>;
  onMetricsChange?: (metrics: SummaryMetricType[]) => void;
  onComparisonPeriodChange?: (metricId: SummaryMetricType, period: ComparisonPeriodType) => void;
}

const ConfigurableSummaryCards: React.FC<ConfigurableSummaryCardsProps> = ({
  summary,
  isLoading,
  error,
  selectedMetrics: selectedMetricsProp,
  comparisonPeriods: comparisonPeriodsProp,
  onMetricsChange,
  onComparisonPeriodChange
}) => {
  // State for selected metrics
  const [selectedMetricsState, setSelectedMetricsState] = useState<SummaryMetricType[]>(defaultMetrics);
  // Use prop if provided, otherwise use state
  const selectedMetrics = selectedMetricsProp || selectedMetricsState;

  // State for comparison periods for each metric
  const [comparisonPeriodsState, setComparisonPeriodsState] = useState<Record<SummaryMetricType, ComparisonPeriodType>>(() => {
    const periods: Record<SummaryMetricType, ComparisonPeriodType> = {} as Record<SummaryMetricType, ComparisonPeriodType>;
    availableMetrics.forEach(metric => {
      periods[metric.id] = metric.defaultComparisonPeriod;
    });
    return periods;
  });
  // Use prop if provided, otherwise use state
  const comparisonPeriods = comparisonPeriodsProp || comparisonPeriodsState;

  // State for menu anchor
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMetric, setActiveMetric] = useState<SummaryMetricType | null>(null);
  const [currentEvent, setCurrentEvent] = useState<React.MouseEvent<HTMLElement> | null>(null);

  // State for loading individual metrics
  const [loadingMetric, setLoadingMetric] = useState<SummaryMetricType | null>(null);

  // State for metric selection dialog
  const [metricDialogOpen, setMetricDialogOpen] = useState(false);
  const [availableMetricsDialog, setAvailableMetricsDialog] = useState<SummaryMetricType[]>([]);

  // State for the metric being replaced (separate from activeMetric)
  const [metricToReplace, setMetricToReplace] = useState<SummaryMetricType | null>(null);

  // Initialize available metrics for dialog
  useEffect(() => {
    updateAvailableMetricsDialog();
  }, [selectedMetrics]);

  // Update available metrics when metricToReplace changes
  useEffect(() => {
    if (metricToReplace && metricDialogOpen) {
      console.log('Metric to replace changed, updating available metrics dialog');
      updateAvailableMetricsDialog();
    }
  }, [metricToReplace, metricDialogOpen]);

  // Update available metrics for dialog
  const updateAvailableMetricsDialog = () => {
    // Show metrics that are not already selected, except for the one being replaced
    const availableMetricsForDialog = availableMetrics
      .filter(metric => {
        // Include the metric if:
        // 1. It's not already selected, OR
        // 2. It's the one being replaced (which we'll filter out later)
        return !selectedMetrics.includes(metric.id) || metric.id === metricToReplace;
      })
      // Then filter out the metric being replaced
      .filter(metric => metric.id !== metricToReplace)
      .map(metric => metric.id);

    console.log('Available metrics for dialog:', availableMetricsForDialog);
    console.log('Selected metrics:', selectedMetrics);
    console.log('Metric to replace:', metricToReplace);

    setAvailableMetricsDialog(availableMetricsForDialog);
  };

  // Update internal state when props change
  useEffect(() => {
    if (selectedMetricsProp) {
      setSelectedMetricsState(selectedMetricsProp);
    }
  }, [selectedMetricsProp]);

  useEffect(() => {
    if (comparisonPeriodsProp) {
      setComparisonPeriodsState(comparisonPeriodsProp);
    }
  }, [comparisonPeriodsProp]);

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, metricId: SummaryMetricType) => {
    console.log('Menu opened for metric:', metricId);
    console.log('Event target:', event.currentTarget);
    setMenuAnchorEl(event.currentTarget);
    setActiveMetric(metricId);
    setMetricToReplace(metricId); // Store the metric to replace
    setCurrentEvent(event);
  };

  // Handle menu close
  const handleMenuClose = () => {
    console.log('Closing menu');
    setMenuAnchorEl(null);
    // Only reset the active metric if the dialog is not open
    if (!metricDialogOpen) {
      console.log('Resetting active metric');
      setActiveMetric(null);
    } else {
      console.log('Dialog is open, keeping active metric:', activeMetric);
    }
  };

  // Handle comparison period change
  const handleComparisonPeriodChange = (period: ComparisonPeriodType) => {
    if (activeMetric) {
      const newPeriods = { ...comparisonPeriods, [activeMetric]: period };

      // If we're using internal state, update it
      if (!comparisonPeriodsProp) {
        setComparisonPeriodsState(newPeriods);
      }

      // Always call the callback if provided
      if (onComparisonPeriodChange) {
        onComparisonPeriodChange(activeMetric, period);
      }
    }
    handleMenuClose();
  };

  // Handle metric dialog open
  const handleMetricDialogOpen = () => {
    console.log('Opening metric dialog');
    console.log('Active metric before dialog open:', activeMetric);
    console.log('Metric to replace:', metricToReplace);

    // First set the dialog open state to true
    setMetricDialogOpen(true);

    // Then update available metrics
    updateAvailableMetricsDialog();

    // Close the menu
    handleMenuClose();
  };

  // Handle metric dialog close
  const handleMetricDialogClose = () => {
    console.log('Closing metric dialog');
    setMetricDialogOpen(false);
    // Reset both the active metric and the metric to replace when the dialog is closed
    console.log('Resetting active metric and metric to replace on dialog close');
    setActiveMetric(null);
    setMetricToReplace(null);
  };

  // Handle metric change
  const handleMetricChange = (newMetric: SummaryMetricType) => {
    // Use the stored metricToReplace state
    if (!metricToReplace) {
      console.log('No metric to replace set, cannot change metric');
      return;
    }

    console.log('Changing metric:', metricToReplace, 'to', newMetric);

    const newMetrics = selectedMetrics.map(m => m === metricToReplace ? newMetric : m);
    console.log('New metrics:', newMetrics);

    // If we're using internal state, update it
    if (!selectedMetricsProp) {
      setSelectedMetricsState(newMetrics);
    }

    // Always call the callback if provided
    if (onMetricsChange) {
      onMetricsChange(newMetrics);
    }

    // Set loading state for the new metric
    setLoadingMetric(newMetric);

    // Simulate a delay to show loading state
    setTimeout(() => {
      setLoadingMetric(null);
    }, 500);

    // No need to call handleMenuClose() here as it will be called by handleMetricDialogClose()
  };

  // Get trend value for a metric based on its comparison period
  const getTrendValue = (metricId: SummaryMetricType): number | null => {
    if (!summary) return null;

    // Check if we have the new trends structure
    if (summary.trends && summary.trends[metricId] && summary.trends[metricId]?.[comparisonPeriods[metricId]]) {
      return summary.trends[metricId]?.[comparisonPeriods[metricId]] || null;
    }

    // Fallback to legacy trend fields
    switch (metricId) {
      case 'totalPlayers': return summary.playersTrend || null;
      case 'newRegistrations': return summary.registrationsTrend || null;
      case 'totalDeposits': return summary.depositsTrend || null;
      case 'totalBets': return summary.betsTrend || null;
      default: return null;
    }
  };

  // Get trend label based on comparison period
  const getTrendLabel = (metricId: SummaryMetricType): string => {
    const period = comparisonPeriods[metricId];
    switch (period) {
      case 'previous': return 'vs previous period';
      case 'lastWeek': return 'vs last week';
      case 'lastMonth': return 'vs last month';
      case 'lastYear': return 'vs last year';
      case 'custom': return 'vs custom period';
      default: return 'vs previous period';
    }
  };

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {selectedMetrics.map((metricId) => {
          const metricDef = availableMetrics.find(m => m.id === metricId);
          if (!metricDef) return null;

          // Get value based on metric type
          let value: number | string = 0;
          if (summary) {
            if (metricId in summary) {
              // Use the value from summary if available, otherwise use 0
              const summaryValue = summary[metricId as keyof DailyActionsSummary];
              // Make sure we only use number or string values
              if (typeof summaryValue === 'number' || typeof summaryValue === 'string') {
                value = summaryValue;
              }
            }
          }

          // Format value based on metric type
          const isCurrency = metricDef.format === 'currency';
          const isPercentage = metricDef.format === 'percentage';
          const isTime = metricDef.format === 'time';

          return (
            <Grid item xs={12} sm={6} md={3} key={metricId}>
              <KPICard
                id={`metric-card-${metricId}`}
                title={metricDef.label}
                value={value}
                trend={getTrendValue(metricId)}
                trendLabel={getTrendLabel(metricId)}
                icon={metricDef.icon}
                loading={isLoading || loadingMetric === metricId}
                error={error}
                description={metricDef.description}
                prefix={isPercentage ? '' : ''}
                valueFormatOptions={
                  isCurrency ? { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 } :
                  isPercentage ? { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 } :
                  isTime ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } :
                  metricDef.format === 'number' ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } :
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                }
                onMoreClick={(event) => {
                  // Use the actual event target
                  handleMenuOpen(event, metricId);
                }}
              />
            </Grid>
          );
        })}
      </Grid>

      {/* Menu for metric options */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMetricDialogOpen}>
          <ListItemIcon>
            <SwapHorizIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Metric</ListItemText>
        </MenuItem>

        <Divider />

        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
          Compare To:
        </Typography>

        {comparisonPeriodOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleComparisonPeriodChange(option.value as ComparisonPeriodType)}
            selected={activeMetric ? comparisonPeriods[activeMetric] === option.value : false}
          >
            <ListItemText inset>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Dialog for metric selection */}
      {/* Debugging logs moved outside of JSX */}
      <Dialog
        key={`metric-dialog-${metricToReplace || 'none'}`}
        open={metricDialogOpen}
        onClose={handleMetricDialogClose}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Change Metric</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select a new metric to replace {metricToReplace ? availableMetrics.find(m => m.id === metricToReplace)?.label : ''}
            {availableMetricsDialog.length === 0 && (
              <SimpleBox sx={{ mt: 1, color: 'error.main' }}>
                No available metrics to choose from. All metrics are already selected.
              </SimpleBox>
            )}
          </Typography>

          {/* Log for debugging */}
          {/* Moved console.log outside of JSX */}
          <Grid container spacing={2}>
            {availableMetricsDialog.map((metricId) => {
              // Debugging logs
              const metric = availableMetrics.find(m => m.id === metricId);
              if (!metric) {
                return null;
              }

              return (
                <Grid item xs={12} sm={6} key={metricId}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={metric.icon}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Metric button clicked:', metricId);
                      console.log('Metric to replace:', metricToReplace);

                      // Call the handleMetricChange function with the new metric
                      handleMetricChange(metricId);

                      // Close the dialog
                      handleMetricDialogClose();
                    }}
                    sx={{ justifyContent: 'flex-start', textAlign: 'left', py: 1 }}
                  >
                    <SimpleBox>
                      <Typography variant="body2" component="div">
                        {metric.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metric.description}
                      </Typography>
                    </SimpleBox>
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMetricDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfigurableSummaryCards;
