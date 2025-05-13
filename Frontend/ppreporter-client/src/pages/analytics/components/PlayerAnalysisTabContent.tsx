import React, { useState, useMemo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';

// Import SimpleBox to fix TypeScript errors
import SimpleBox from '../../../components/common/SimpleBox';

// Import components
import Card from '../../../components/common/Card';
import {
  ReportAreaChart,
  ReportBarChart,
  ReportPieChart
} from '../../../components/reports/charts/ReportCharts';
import {
  ReportTreemapChart
} from '../../../components/reports/charts/AdvancedCharts';

// Import utilities
import { formatNumber } from '../../../utils/formatters';

/**
 * Player segment data point interface
 */
interface PlayerSegmentDataPoint {
  name: string;
  value: number;
}

/**
 * Player acquisition data point interface
 */
interface PlayerAcquisitionDataPoint {
  date: string;
  organic: number;
  paid: number;
  referral: number;
}

/**
 * Player retention data point interface
 */
interface PlayerRetentionDataPoint {
  date: string;
  day1: number;
  day7: number;
  day30: number;
}

/**
 * Player analysis tab content props
 */
interface PlayerAnalysisTabContentProps {
  /** Dashboard data containing player-related data */
  dashboardData: any;
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * PlayerAnalysisTabContent component
 *
 * Displays player-related analytics and insights with interactive filters.
 * Features include:
 * - Player segment distribution
 * - Player activity frequency
 * - Player acquisition trends
 * - Player retention rates
 * - Player demographics
 * - Player geographic distribution
 * - Player game preferences
 *
 * @param props - Component props
 * @returns React component
 */
const PlayerAnalysisTabContent: React.FC<PlayerAnalysisTabContentProps> = ({
  dashboardData,
  isLoading
}) => {
  // Filter state
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('month');

  /**
   * Handle segment filter change
   * @param event - Select change event
   */
  const handleSegmentFilterChange = (event: SelectChangeEvent): void => {
    setSegmentFilter(event.target.value);
  };

  /**
   * Handle time range change
   * @param event - Select change event
   */
  const handleTimeRangeChange = (event: SelectChangeEvent): void => {
    setTimeRange(event.target.value);
  };

  /**
   * Chart data with memoization to prevent unnecessary recalculations
   */
  const chartData = useMemo(() => ({
    // Player segments data
    playerSegments: [
      { name: 'High Value', value: 25 },
      { name: 'Regular', value: 40 },
      { name: 'Casual', value: 25 },
      { name: 'New', value: 10 }
    ] as PlayerSegmentDataPoint[],

    // Player acquisition data
    playerAcquisitionData: [
      { date: '2023-01', organic: 120, paid: 80, referral: 30 },
      { date: '2023-02', organic: 140, paid: 90, referral: 35 },
      { date: '2023-03', organic: 160, paid: 100, referral: 40 },
      { date: '2023-04', organic: 180, paid: 110, referral: 45 },
      { date: '2023-05', organic: 200, paid: 120, referral: 50 },
      { date: '2023-06', organic: 220, paid: 130, referral: 55 }
    ] as PlayerAcquisitionDataPoint[],

    // Player retention data
    playerRetentionData: [
      { date: '2023-01', day1: 80, day7: 60, day30: 40 },
      { date: '2023-02', day1: 82, day7: 62, day30: 42 },
      { date: '2023-03', day1: 84, day7: 64, day30: 44 },
      { date: '2023-04', day1: 86, day7: 66, day30: 46 },
      { date: '2023-05', day1: 88, day7: 68, day30: 48 },
      { date: '2023-06', day1: 90, day7: 70, day30: 50 }
    ] as PlayerRetentionDataPoint[],

    // Player activity data
    playerActivityData: [
      { name: 'Daily', value: 30 },
      { name: 'Weekly', value: 25 },
      { name: 'Monthly', value: 20 },
      { name: 'Quarterly', value: 15 },
      { name: 'Inactive', value: 10 }
    ] as PlayerSegmentDataPoint[],

    // Player demographics data
    playerDemographicsData: [
      { name: '18-24', value: 15 },
      { name: '25-34', value: 30 },
      { name: '35-44', value: 25 },
      { name: '45-54', value: 20 },
      { name: '55+', value: 10 }
    ] as PlayerSegmentDataPoint[],

    // Player geographic distribution data
    playerGeoData: [
      { name: 'North America', value: 40 },
      { name: 'Europe', value: 35 },
      { name: 'Asia', value: 15 },
      { name: 'South America', value: 5 },
      { name: 'Africa', value: 3 },
      { name: 'Oceania', value: 2 }
    ] as PlayerSegmentDataPoint[],

    // Player behavior treemap data
    playerBehaviorData: [
      { name: 'Slots', value: 400 },
      { name: 'Poker', value: 300 },
      { name: 'Blackjack', value: 200 },
      { name: 'Roulette', value: 150 },
      { name: 'Baccarat', value: 100 },
      { name: 'Sports Betting', value: 350 },
      { name: 'Live Casino', value: 250 },
      { name: 'Bingo', value: 120 }
    ] as PlayerSegmentDataPoint[]
  }), []);

  return (
    <Grid container spacing={3}>
      {/* Filters */}
      <Grid item xs={12}>
        <Paper
          sx={{ p: 2, mb: 2 }}
          component="section"
          aria-labelledby="player-filters-title"
        >
          <SimpleBox
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <SimpleBox
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 1
              }}
            >
              <FilterListIcon
                sx={{ mr: 1 }}
                aria-hidden="true"
              />
              <Typography
                variant="subtitle1"
                id="player-filters-title"
              >
                Filters:
              </Typography>
            </SimpleBox>

            <FormControl
              size="small"
              sx={{ minWidth: 180 }}
            >
              <InputLabel id="segment-filter-label">Player Segment</InputLabel>
              <Select
                labelId="segment-filter-label"
                id="segment-filter-select"
                value={segmentFilter}
                label="Player Segment"
                onChange={handleSegmentFilterChange}
                disabled={isLoading}
                aria-describedby="segment-filter-helper"
              >
                <MenuItem value="all">All Segments</MenuItem>
                <MenuItem value="high-value">High Value</MenuItem>
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="new">New</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{ minWidth: 180 }}
            >
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range-select"
                value={timeRange}
                label="Time Range"
                onChange={handleTimeRangeChange}
                disabled={isLoading}
                aria-describedby="time-range-helper"
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>

            <SimpleBox sx={{ flexGrow: 1 }} />

            <Tooltip title="Download player analysis report">
              <span>
                <IconButton
                  size="small"
                  disabled={isLoading}
                  aria-label="Download player analysis report"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </SimpleBox>

          {segmentFilter !== 'all' && (
            <SimpleBox
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center'
              }}
              role="status"
              aria-live="polite"
            >
              <Typography variant="body2" sx={{ mr: 1 }}>
                Active filters:
              </Typography>
              <Chip
                label={`Segment: ${segmentFilter}`}
                size="small"
                onDelete={() => setSegmentFilter('all')}
                aria-label={`Remove filter: Segment ${segmentFilter}`}
              />
            </SimpleBox>
          )}
        </Paper>
      </Grid>

      {/* Create a reusable chart component */}
      {(() => {
        /**
         * Chart component props
         */
        interface ChartComponentProps {
          /** Title of the chart */
          title: string;
          /** Grid column configuration */
          gridConfig: {
            xs: number;
            md?: number;
          };
          /** Chart component */
          children: React.ReactNode;
        }

        /**
         * Chart component
         * Wrapper for chart components with consistent styling
         */
        const ChartComponent: React.FC<ChartComponentProps> = ({
          title,
          gridConfig,
          children
        }) => (
          <Grid item xs={gridConfig.xs} md={gridConfig.md}>
            <Card
              title={title}
              action={
                <Tooltip title={`Download ${title} chart`}>
                  <span>
                    <IconButton
                      size="small"
                      disabled={isLoading}
                      aria-label={`Download ${title} chart`}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            >
              {isLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <SimpleBox
                  role="region"
                  aria-label={title}
                >
                  {children}
                </SimpleBox>
              )}
            </Card>
          </Grid>
        );

        return (
          <>
            {/* Player Segments */}
            <ChartComponent
              title="Player Segments"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportPieChart
                data={chartData.playerSegments}
                nameKey="name"
                valueKey="value"
                height={300}
                showLegend={true}
              />
            </ChartComponent>

            {/* Player Activity */}
            <ChartComponent
              title="Player Activity Frequency"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportPieChart
                data={chartData.playerActivityData}
                nameKey="name"
                valueKey="value"
                height={300}
                showLegend={true}
              />
            </ChartComponent>

            {/* Player Acquisition */}
            <ChartComponent
              title="Player Acquisition Trends"
              gridConfig={{ xs: 12 }}
            >
              <ReportAreaChart
                data={chartData.playerAcquisitionData}
                xKey="date"
                yKeys={['organic', 'paid', 'referral']}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            </ChartComponent>

            {/* Player Retention */}
            <ChartComponent
              title="Player Retention Rates"
              gridConfig={{ xs: 12 }}
            >
              <ReportBarChart
                data={chartData.playerRetentionData}
                xKey="date"
                yKeys={['day1', 'day7', 'day30']}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            </ChartComponent>

            {/* Player Demographics */}
            <ChartComponent
              title="Player Demographics (Age)"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportBarChart
                data={chartData.playerDemographicsData}
                xKey="name"
                yKeys={['value']}
                height={300}
                showLegend={false}
                showGrid={true}
              />
            </ChartComponent>

            {/* Player Geographic Distribution */}
            <ChartComponent
              title="Player Geographic Distribution"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportPieChart
                data={chartData.playerGeoData}
                nameKey="name"
                valueKey="value"
                height={300}
                showLegend={true}
              />
            </ChartComponent>

            {/* Player Behavior */}
            <ChartComponent
              title="Player Game Preferences"
              gridConfig={{ xs: 12 }}
            >
              <ReportTreemapChart
                data={chartData.playerBehaviorData}
                dataKey="value"
                nameKey="name"
                height={400}
              />
            </ChartComponent>
          </>
        );
      })()}
    </Grid>
  );
};

export default PlayerAnalysisTabContent;
