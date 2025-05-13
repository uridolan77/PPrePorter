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
  Chip,
  TextField,
  Autocomplete
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
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
  ReportScatterChart,
  ReportHeatmap
} from '../../../components/reports/charts/AdvancedCharts';
import { TopGamesChart } from '../../../components/dashboard';

/**
 * Game category data point interface
 */
interface GameCategoryDataPoint {
  name: string;
  value: number;
}

/**
 * Game performance data point interface
 */
interface GamePerformanceDataPoint {
  date: string;
  revenue: number;
  players: number;
  bets: number;
}

/**
 * Game popularity data point interface
 */
interface GamePopularityDataPoint {
  game: string;
  players: number;
  sessions: number;
  avgSessionTime: number;
}

/**
 * Game engagement data point interface
 */
interface GameEngagementDataPoint {
  game: string;
  avgSessionTime: number;
  returnRate: number;
  churnRate: number;
}

/**
 * Game performance by time data point interface
 */
interface GamePerformanceByTimeDataPoint {
  hour: string;
  players: number;
  revenue: number;
}

/**
 * Game heatmap data point interface
 */
interface GameHeatmapDataPoint {
  day: string;
  time: string;
  value: number;
}

/**
 * Game analysis tab content props
 */
interface GameAnalysisTabContentProps {
  /** Dashboard data containing game-related data */
  dashboardData: {
    topGames: any[];
  };
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * GameAnalysisTabContent component
 *
 * Displays game-related analytics and insights with interactive filters.
 * Features include:
 * - Top performing games
 * - Game categories distribution
 * - Game performance trends
 * - Game popularity metrics
 * - Game engagement metrics
 * - Game performance by time of day
 * - Game activity heatmap
 *
 * @param props - Component props
 * @returns React component
 */
const GameAnalysisTabContent: React.FC<GameAnalysisTabContentProps> = ({
  dashboardData,
  isLoading
}) => {
  // Filter state
  const [gameCategory, setGameCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('month');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  /**
   * Handle game category change
   * @param event - Select change event
   */
  const handleGameCategoryChange = (event: SelectChangeEvent): void => {
    setGameCategory(event.target.value);
  };

  /**
   * Handle time range change
   * @param event - Select change event
   */
  const handleTimeRangeChange = (event: SelectChangeEvent): void => {
    setTimeRange(event.target.value);
  };

  /**
   * Handle game selection change
   * @param _event - React synthetic event
   * @param newValue - New selected game value
   */
  const handleGameSelectionChange = (_event: React.SyntheticEvent, newValue: string | null): void => {
    setSelectedGame(newValue);
  };

  // Extract top games data from props with fallback
  const topGamesData = dashboardData.topGames || [];

  /**
   * Chart data with memoization to prevent unnecessary recalculations
   */
  const chartData = useMemo(() => {
    // Days of week and time slots for heatmap
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];

    return {
      // Game categories data
      gameCategoriesData: [
        { name: 'Slots', value: 45 },
        { name: 'Table Games', value: 25 },
        { name: 'Live Casino', value: 15 },
        { name: 'Sports Betting', value: 10 },
        { name: 'Poker', value: 5 }
      ] as GameCategoryDataPoint[],

      // Game performance data
      gamePerformanceData: [
        { date: '2023-01', revenue: 120000, players: 5000, bets: 150000 },
        { date: '2023-02', revenue: 130000, players: 5200, bets: 160000 },
        { date: '2023-03', revenue: 140000, players: 5400, bets: 170000 },
        { date: '2023-04', revenue: 150000, players: 5600, bets: 180000 },
        { date: '2023-05', revenue: 160000, players: 5800, bets: 190000 },
        { date: '2023-06', revenue: 170000, players: 6000, bets: 200000 }
      ] as GamePerformanceDataPoint[],

      // Game popularity data
      gamePopularityData: [
        { game: 'Starburst', players: 1200, sessions: 5000, avgSessionTime: 15 },
        { game: 'Gonzo\'s Quest', players: 1000, sessions: 4500, avgSessionTime: 18 },
        { game: 'Book of Dead', players: 950, sessions: 4200, avgSessionTime: 20 },
        { game: 'Mega Moolah', players: 900, sessions: 4000, avgSessionTime: 12 },
        { game: 'Immortal Romance', players: 850, sessions: 3800, avgSessionTime: 16 },
        { game: 'Reactoonz', players: 800, sessions: 3600, avgSessionTime: 14 },
        { game: 'Dead or Alive', players: 750, sessions: 3400, avgSessionTime: 22 },
        { game: 'Twin Spin', players: 700, sessions: 3200, avgSessionTime: 17 },
        { game: 'Bonanza', players: 650, sessions: 3000, avgSessionTime: 19 },
        { game: 'Fire Joker', players: 600, sessions: 2800, avgSessionTime: 13 }
      ] as GamePopularityDataPoint[],

      // Game engagement data
      gameEngagementData: [
        { game: 'Starburst', avgSessionTime: 15, returnRate: 0.65, churnRate: 0.35 },
        { game: 'Gonzo\'s Quest', avgSessionTime: 18, returnRate: 0.70, churnRate: 0.30 },
        { game: 'Book of Dead', avgSessionTime: 20, returnRate: 0.75, churnRate: 0.25 },
        { game: 'Mega Moolah', avgSessionTime: 12, returnRate: 0.60, churnRate: 0.40 },
        { game: 'Immortal Romance', avgSessionTime: 16, returnRate: 0.68, churnRate: 0.32 }
      ] as GameEngagementDataPoint[],

      // Game performance by time data
      gamePerformanceByTimeData: [
        { hour: '00:00', players: 200, revenue: 5000 },
        { hour: '02:00', players: 150, revenue: 3500 },
        { hour: '04:00', players: 100, revenue: 2000 },
        { hour: '06:00', players: 120, revenue: 2500 },
        { hour: '08:00', players: 180, revenue: 4000 },
        { hour: '10:00', players: 250, revenue: 6000 },
        { hour: '12:00', players: 300, revenue: 7500 },
        { hour: '14:00', players: 350, revenue: 9000 },
        { hour: '16:00', players: 400, revenue: 10000 },
        { hour: '18:00', players: 450, revenue: 12000 },
        { hour: '20:00', players: 500, revenue: 15000 },
        { hour: '22:00', players: 350, revenue: 9000 }
      ] as GamePerformanceByTimeDataPoint[],

      // Game heatmap data
      gameHeatmapData: daysOfWeek.flatMap(day =>
        timeSlots.map(time => ({
          day,
          time,
          value: Math.floor(Math.random() * 100) + 20
        }))
      ) as GameHeatmapDataPoint[],

      // List of games for autocomplete
      gamesList: [
        'Starburst', 'Gonzo\'s Quest', 'Book of Dead', 'Mega Moolah', 'Immortal Romance',
        'Reactoonz', 'Dead or Alive', 'Twin Spin', 'Bonanza', 'Fire Joker'
      ]
    };
  }, []);

  return (
    <Grid container spacing={3}>
      {/* Filters */}
      <Grid item xs={12}>
        <Paper
          sx={{ p: 2, mb: 2 }}
          component="section"
          aria-labelledby="game-filters-title"
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
                id="game-filters-title"
              >
                Filters:
              </Typography>
            </SimpleBox>

            <FormControl
              size="small"
              sx={{ minWidth: 180 }}
            >
              <InputLabel id="game-category-label">Game Category</InputLabel>
              <Select
                labelId="game-category-label"
                id="game-category-select"
                value={gameCategory}
                label="Game Category"
                onChange={handleGameCategoryChange}
                disabled={isLoading}
                aria-describedby="game-category-helper"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="slots">Slots</MenuItem>
                <MenuItem value="table-games">Table Games</MenuItem>
                <MenuItem value="live-casino">Live Casino</MenuItem>
                <MenuItem value="sports-betting">Sports Betting</MenuItem>
                <MenuItem value="poker">Poker</MenuItem>
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

            <Autocomplete
              id="game-select"
              options={chartData.gamesList}
              sx={{ width: 220 }}
              value={selectedGame}
              onChange={handleGameSelectionChange}
              disabled={isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Game"
                  size="small"
                  aria-describedby="game-select-helper"
                />
              )}
            />

            <SimpleBox sx={{ flexGrow: 1 }} />

            <Tooltip title="Download game analysis report">
              <span>
                <IconButton
                  size="small"
                  disabled={isLoading}
                  aria-label="Download game analysis report"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </SimpleBox>

          {(gameCategory !== 'all' || selectedGame) && (
            <SimpleBox
              sx={{
                mt: 2,
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1
              }}
              role="status"
              aria-live="polite"
            >
              <Typography variant="body2" sx={{ mr: 1 }}>
                Active filters:
              </Typography>

              {gameCategory !== 'all' && (
                <Chip
                  label={`Category: ${gameCategory}`}
                  size="small"
                  onDelete={() => setGameCategory('all')}
                  aria-label={`Remove filter: Category ${gameCategory}`}
                />
              )}

              {selectedGame && (
                <Chip
                  label={`Game: ${selectedGame}`}
                  size="small"
                  onDelete={() => setSelectedGame(null)}
                  aria-label={`Remove filter: Game ${selectedGame}`}
                />
              )}
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
            {/* Top Games */}
            <ChartComponent
              title="Top Performing Games"
              gridConfig={{ xs: 12 }}
            >
              <TopGamesChart
                data={topGamesData}
                isLoading={false}
                height={350}
                showLegend={true}
              />
            </ChartComponent>

            {/* Game Categories */}
            <ChartComponent
              title="Game Categories Distribution"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportPieChart
                data={chartData.gameCategoriesData}
                nameKey="name"
                valueKey="value"
                height={300}
                showLegend={true}
              />
            </ChartComponent>

            {/* Game Performance */}
            <ChartComponent
              title="Game Performance Trend"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportAreaChart
                data={chartData.gamePerformanceData}
                xKey="date"
                yKeys={['revenue']}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            </ChartComponent>

            {/* Game Popularity */}
            <ChartComponent
              title="Game Popularity Metrics"
              gridConfig={{ xs: 12 }}
            >
              <ReportBarChart
                data={chartData.gamePopularityData}
                xKey="game"
                yKeys={['players', 'sessions']}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            </ChartComponent>

            {/* Game Engagement */}
            <ChartComponent
              title="Game Engagement Metrics"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportScatterChart
                data={chartData.gameEngagementData}
                xKey="avgSessionTime"
                yKey="returnRate"
                nameKey="game"
                height={300}
                showLegend={true}
              />
            </ChartComponent>

            {/* Game Performance by Time */}
            <ChartComponent
              title="Game Performance by Time of Day"
              gridConfig={{ xs: 12, md: 6 }}
            >
              <ReportBarChart
                data={chartData.gamePerformanceByTimeData}
                xKey="hour"
                yKeys={['players', 'revenue']}
                height={300}
                showLegend={true}
                showGrid={true}
              />
            </ChartComponent>

            {/* Game Heatmap */}
            <ChartComponent
              title="Game Activity Heatmap (Day of Week vs Time of Day)"
              gridConfig={{ xs: 12 }}
            >
              <ReportHeatmap
                data={chartData.gameHeatmapData}
                xKey="day"
                yKey="time"
                valueKey="value"
                height={350}
              />
            </ChartComponent>
          </>
        );
      })()}
    </Grid>
  );
};

export default GameAnalysisTabContent;
