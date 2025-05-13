import React, { useMemo } from 'react';
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
  Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';

// Import SimpleBox to fix TypeScript errors
import SimpleBox from '../../../components/common/SimpleBox';

// Import components
import Card from '../../../components/common/Card';
import {
  CasinoRevenueChart,
  PlayerRegistrationsChart,
  TopGamesChart,
  MicroCharts
} from '../../../components/dashboard';

// Import utilities
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/formatters';

/**
 * KPI data interface
 */
interface KpiMetric {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Dashboard data interface for Overview tab
 */
interface DashboardData {
  revenue: any[];
  players: any[];
  topGames: any[];
  kpi: {
    revenue?: KpiMetric;
    players?: KpiMetric;
    deposits?: KpiMetric;
    withdrawals?: KpiMetric;
    [key: string]: KpiMetric | undefined;
  };
}

/**
 * MicroChart data point interface
 */
interface MicroChartDataPoint {
  value: number;
  label: string;
}

/**
 * Overview tab content props
 */
interface OverviewTabContentProps {
  /** Dashboard data containing KPIs and chart data */
  dashboardData: DashboardData;
  /** Loading state indicator */
  isLoading: boolean;
  /** Selected time period */
  timePeriod: string;
  /** Handler for time period change */
  onTimePeriodChange: (event: SelectChangeEvent) => void;
}

/**
 * Overview Tab Content
 *
 * Displays key metrics, charts, and summary data for the analytics dashboard.
 * Features include:
 * - KPI metrics with trend indicators and micro charts
 * - Revenue trend chart
 * - Player registrations chart
 * - Top games chart
 *
 * @param props - Component props
 * @returns React component
 */
const OverviewTabContent: React.FC<OverviewTabContentProps> = ({
  dashboardData,
  isLoading,
  timePeriod,
  onTimePeriodChange
}) => {
  // Extract data from props with fallbacks
  const kpiData = dashboardData.kpi || {};
  const revenueData = Array.isArray(dashboardData.revenue) ? dashboardData.revenue : [];
  const playerData = Array.isArray(dashboardData.players) ? dashboardData.players : [];
  const topGamesData = Array.isArray(dashboardData.topGames) ? dashboardData.topGames : [];

  /**
   * Prepare micro charts data with memoization to prevent unnecessary recalculations
   */
  const microChartsData = useMemo(() => {
    // Create a safe mapping function that handles potential null/undefined items
    const safeMap = (data: any[], mapFn: (item: any) => MicroChartDataPoint): MicroChartDataPoint[] => {
      if (!Array.isArray(data) || data.length === 0) {
        return []; // Return empty array if data is not valid
      }
      return data.map(mapFn);
    };

    return {
      revenue: safeMap(revenueData, (item: any): MicroChartDataPoint => ({
        value: item?.revenue || 0,
        label: item?.date || item?.month || item?.week || 'Unknown'
      })),
      players: safeMap(playerData, (item: any): MicroChartDataPoint => ({
        value: item?.registrations || 0,
        label: item?.date || item?.month || item?.week || 'Unknown'
      })),
      deposits: safeMap(revenueData, (item: any): MicroChartDataPoint => ({
        value: (item?.revenue || 0) * 0.8, // Mock data for deposits
        label: item?.date || item?.month || item?.week || 'Unknown'
      })),
      withdrawals: safeMap(revenueData, (item: any): MicroChartDataPoint => ({
        value: (item?.revenue || 0) * 0.5, // Mock data for withdrawals
        label: item?.date || item?.month || item?.week || 'Unknown'
      }))
    };
  }, [revenueData, playerData]);

  return (
    <Grid container spacing={3}>
      {/* KPI Metrics Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Key Performance Indicators</Typography>
            <SimpleBox>
              <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                <InputLabel id="time-period-label">Period</InputLabel>
                <Select
                  labelId="time-period-label"
                  id="time-period-select"
                  value={timePeriod}
                  label="Period"
                  onChange={onTimePeriodChange}
                >
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="week">Week</MenuItem>
                  <MenuItem value="month">Month</MenuItem>
                  <MenuItem value="quarter">Quarter</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Download report">
                <IconButton size="small">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </SimpleBox>
          </SimpleBox>

          {/* KPI Card Component */}
          {(() => {
            /**
             * KPI Card Props
             */
            interface KpiCardProps {
              /** Title of the KPI card */
              title: string;
              /** KPI metric data */
              metric?: KpiMetric;
              /** Micro chart data */
              chartData: MicroChartDataPoint[];
              /** Loading state */
              isLoading: boolean;
              /** Format function for the value */
              formatValue: (value: number) => string;
            }

            /**
             * KPI Card Component
             * Displays a single KPI metric with trend and micro chart
             */
            const KpiCard: React.FC<KpiCardProps> = ({
              title,
              metric,
              chartData,
              isLoading,
              formatValue
            }) => (
              <Grid item xs={12} sm={6} md={3}>
                <SimpleBox
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {title}
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width="80%" height={40} />
                  ) : (
                    <>
                      <Typography variant="h4" gutterBottom>
                        {formatValue(metric?.current || 0)}
                      </Typography>
                      <SimpleBox
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 'auto'
                        }}
                      >
                        <Typography
                          variant="body2"
                          color={
                            !metric?.trend ? 'text.secondary' :
                            metric.trend === 'up' ? 'success.main' :
                            metric.trend === 'down' ? 'error.main' :
                            'text.secondary'
                          }
                          aria-label={`${formatPercentage(metric?.change || 0)} compared to previous period`}
                        >
                          {formatPercentage(metric?.change || 0)} vs previous
                        </Typography>
                        <MicroCharts.Sparkline
                          data={chartData}
                          height={30}
                          width={80}
                          valueKey="value"
                        />
                      </SimpleBox>
                    </>
                  )}
                </SimpleBox>
              </Grid>
            );

            return (
              <Grid container spacing={3}>
                <KpiCard
                  title="Revenue"
                  metric={kpiData.revenue}
                  chartData={microChartsData.revenue}
                  isLoading={isLoading}
                  formatValue={formatCurrency}
                />

                <KpiCard
                  title="Active Players"
                  metric={kpiData.players}
                  chartData={microChartsData.players}
                  isLoading={isLoading}
                  formatValue={formatNumber}
                />

                <KpiCard
                  title="Deposits"
                  metric={kpiData.deposits}
                  chartData={microChartsData.deposits}
                  isLoading={isLoading}
                  formatValue={formatCurrency}
                />

                <KpiCard
                  title="Withdrawals"
                  metric={kpiData.withdrawals}
                  chartData={microChartsData.withdrawals}
                  isLoading={isLoading}
                  formatValue={formatCurrency}
                />
              </Grid>
            );
          })()}
        </Paper>
      </Grid>

      {/* Charts Section */}
      {(() => {
        /**
         * Chart Card Props
         */
        interface ChartCardProps {
          /** Title of the chart */
          title: string;
          /** Chart component */
          children: React.ReactNode;
        }

        /**
         * Chart Card Component
         * Wrapper for chart components with consistent styling and actions
         */
        const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
          <Card
            title={title}
            action={
              <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Download report">
                  <IconButton
                    size="small"
                    sx={{ mr: 1 }}
                    aria-label={`Download ${title} report`}
                    disabled={isLoading}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings">
                  <IconButton
                    size="small"
                    aria-label={`${title} settings`}
                    disabled={isLoading}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </SimpleBox>
            }
          >
            {children}
          </Card>
        );

        /**
         * Loading Skeleton Component
         */
        const ChartSkeleton = () => (
          <SimpleBox sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={350} />
          </SimpleBox>
        );

        return (
          <>
            <Grid item xs={12} md={8}>
              <ChartCard title="Revenue Trend">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <CasinoRevenueChart
                    data={revenueData}
                    isLoading={false}
                    height={350}
                  />
                )}
              </ChartCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <ChartCard title="Player Registrations">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <PlayerRegistrationsChart
                    data={playerData}
                    isLoading={false}
                    height={350}
                    showFTD={true}
                  />
                )}
              </ChartCard>
            </Grid>

            <Grid item xs={12}>
              <ChartCard title="Top Games">
                {isLoading ? (
                  <ChartSkeleton />
                ) : (
                  <TopGamesChart
                    data={topGamesData}
                    isLoading={false}
                    height={350}
                    showLegend={true}
                  />
                )}
              </ChartCard>
            </Grid>
          </>
        );
      })()}
    </Grid>
  );
};

export default OverviewTabContent;
