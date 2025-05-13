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
  Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';

// Import components
import SimpleBox from '../../../components/common/SimpleBox';
import Card from '../../../components/common/Card';
import {
  ReportAreaChart,
  ReportBarChart,
  ReportPieChart
} from '../../../components/reports/charts/ReportCharts';
import {
  ReportScatterChart,
  ReportRadarChart
} from '../../../components/reports/charts/AdvancedCharts';
import { MultiDimensionalRadarChart } from '../../../components/dashboard';
import { Metric, Entity, DataItem } from '../../../types/multiDimensionalRadarChart';

/**
 * Chart data point interface
 */
interface ChartDataPoint {
  date: string;
  revenue: number;
  players: number;
  bets: number;
}

/**
 * Pie chart data point interface
 */
interface PieChartDataPoint {
  name: string;
  value: number;
}

/**
 * Radar chart data point interface
 */
interface RadarChartDataPoint {
  subject: string;
  [key: string]: string | number;
}

/**
 * Performance tab content props
 */
interface PerformanceTabContentProps {
  /** Dashboard data containing chart data */
  dashboardData: {
    revenue: any[];
    players: any[];
  };
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * Performance Tab Content
 *
 * Displays detailed performance metrics and charts with interactive controls.
 * Features include:
 * - Selectable chart types (area, bar, pie, scatter, radar)
 * - Selectable metrics (revenue, players)
 * - Multi-dimensional radar chart for comparative analysis
 *
 * @param props - Component props
 * @returns React component
 */
const PerformanceTabContent: React.FC<PerformanceTabContentProps> = ({
  dashboardData,
  isLoading
}) => {
  // Chart type and metric selection state
  const [chartType, setChartType] = useState<string>('area');
  const [metricType, setMetricType] = useState<string>('revenue');

  /**
   * Handle chart type change
   * @param event - Select change event
   */
  const handleChartTypeChange = (event: SelectChangeEvent): void => {
    setChartType(event.target.value);
  };

  /**
   * Handle metric type change
   * @param event - Select change event
   */
  const handleMetricTypeChange = (event: SelectChangeEvent): void => {
    setMetricType(event.target.value);
  };

  // Extract data from props with fallbacks
  const revenueData = dashboardData.revenue || [];
  const playerData = dashboardData.players || [];

  /**
   * Transform data for charts with memoization to prevent unnecessary recalculations
   */
  const chartData = useMemo(() => {
    // Transform data for area and bar charts
    const transformedData = revenueData.map((item: any): ChartDataPoint => ({
      date: item.date || item.month || item.week || 'Unknown',
      revenue: item.revenue || 0,
      players: item.players || 0,
      bets: item.bets || 0
    }));

    return {
      // Area chart data - use all data
      areaChartData: transformedData,

      // Bar chart data - use only first 10 items for better readability
      barChartData: transformedData.slice(0, 10),

      // Pie chart data - static data for product distribution
      pieChartData: [
        { name: 'Casino', value: 45 },
        { name: 'Sports', value: 30 },
        { name: 'Poker', value: 15 },
        { name: 'Bingo', value: 10 }
      ] as PieChartDataPoint[],

      // Scatter chart data - derived from revenue data
      scatterChartData: transformedData.map(item => ({
        revenue: item.revenue,
        players: item.players,
        date: item.date
      })),

      // Radar chart data - static data for performance metrics
      radarChartData: [
        { subject: 'Revenue', A: 120, B: 110, fullMark: 150 },
        { subject: 'Players', A: 98, B: 130, fullMark: 150 },
        { subject: 'Retention', A: 86, B: 130, fullMark: 150 },
        { subject: 'Conversion', A: 99, B: 100, fullMark: 150 },
        { subject: 'Engagement', A: 85, B: 90, fullMark: 150 },
        { subject: 'ARPU', A: 65, B: 85, fullMark: 150 }
      ] as RadarChartDataPoint[],

      // Multi-dimensional radar chart data - static data for comparative analysis
      multiDimensionalData: [
        { entityId: 'casino', values: { revenue: 120, players: 98, retention: 86, conversion: 99, engagement: 85 } },
        { entityId: 'sports', values: { revenue: 110, players: 130, retention: 130, conversion: 100, engagement: 90 } },
        { entityId: 'poker', values: { revenue: 90, players: 100, retention: 110, conversion: 80, engagement: 95 } },
        { entityId: 'bingo', values: { revenue: 80, players: 70, retention: 100, conversion: 50, engagement: 75 } }
      ] as DataItem[]
    };
  }, [revenueData]);

  /**
   * Render chart based on selected type and metric
   * @returns React component for the selected chart type
   */
  const renderChart = () => {
    // If loading, show skeleton
    if (isLoading) {
      return <Skeleton variant="rectangular" height="100%" />;
    }

    // Chart titles based on selected metric
    const chartTitles = {
      revenue: {
        area: 'Revenue Trend Over Time',
        bar: 'Revenue by Period'
      },
      players: {
        area: 'Player Trend Over Time',
        bar: 'Players by Period'
      }
    };

    // Get title based on chart type and metric
    const getTitle = (type: string): string => {
      if (type === 'area' || type === 'bar') {
        return chartTitles[metricType as keyof typeof chartTitles]?.[type as keyof typeof chartTitles.revenue] || 'Chart';
      }

      const titles = {
        pie: 'Revenue Distribution by Product',
        scatter: 'Revenue vs Players Correlation',
        radar: 'Performance Metrics Comparison'
      };

      return titles[type as keyof typeof titles] || 'Chart';
    };

    // Render appropriate chart based on type
    switch (chartType) {
      case 'area':
        return (
          <ReportAreaChart
            data={chartData.areaChartData}
            xKey="date"
            yKeys={metricType === 'revenue' ? ['revenue'] : ['players']}
            height={350}
            loading={false}
            title={getTitle('area')}
            showLegend={true}
            showGrid={true}
          />
        );

      case 'bar':
        return (
          <ReportBarChart
            data={chartData.barChartData}
            xKey="date"
            yKeys={metricType === 'revenue' ? ['revenue'] : ['players']}
            height={350}
            loading={false}
            title={getTitle('bar')}
            showLegend={true}
            showGrid={true}
          />
        );

      case 'pie':
        return (
          <ReportPieChart
            data={chartData.pieChartData}
            nameKey="name"
            valueKey="value"
            height={350}
            loading={false}
            title={getTitle('pie')}
            showLegend={true}
          />
        );

      case 'scatter':
        return (
          <ReportScatterChart
            data={chartData.scatterChartData}
            xKey="revenue"
            yKey="players"
            nameKey="date"
            height={350}
            loading={false}
            title={getTitle('scatter')}
            showLegend={true}
          />
        );

      case 'radar':
        return (
          <ReportRadarChart
            data={chartData.radarChartData}
            dataKey="A"
            nameKey="subject"
            height={350}
            loading={false}
            title={getTitle('radar')}
            showLegend={true}
          />
        );

      default:
        // Fallback to area chart
        return (
          <ReportAreaChart
            data={chartData.areaChartData}
            xKey="date"
            yKeys={['revenue']}
            height={350}
            loading={false}
            title="Revenue Trend"
            showLegend={true}
            showGrid={true}
          />
        );
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Chart Controls */}
      <Grid item xs={12}>
        <Paper
          sx={{ p: 3, mb: 3 }}
          component="section"
          aria-labelledby="performance-analysis-title"
        >
          <SimpleBox
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              mb: 2,
              gap: 2
            }}
          >
            <Typography
              variant="h5"
              id="performance-analysis-title"
              component="h2"
            >
              Performance Analysis
            </Typography>

            <SimpleBox
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}
            >
              <FormControl
                size="small"
                sx={{ minWidth: 150 }}
              >
                <InputLabel id="chart-type-label">Chart Type</InputLabel>
                <Select
                  labelId="chart-type-label"
                  id="chart-type-select"
                  value={chartType}
                  label="Chart Type"
                  onChange={handleChartTypeChange}
                  disabled={isLoading}
                  aria-describedby="chart-type-helper"
                >
                  <MenuItem value="area">Area Chart</MenuItem>
                  <MenuItem value="bar">Bar Chart</MenuItem>
                  <MenuItem value="pie">Pie Chart</MenuItem>
                  <MenuItem value="scatter">Scatter Plot</MenuItem>
                  <MenuItem value="radar">Radar Chart</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{ minWidth: 150 }}
              >
                <InputLabel id="metric-type-label">Metric</InputLabel>
                <Select
                  labelId="metric-type-label"
                  id="metric-type-select"
                  value={metricType}
                  label="Metric"
                  onChange={handleMetricTypeChange}
                  disabled={isLoading || chartType === 'pie' || chartType === 'radar'}
                  aria-describedby="metric-type-helper"
                >
                  <MenuItem value="revenue">Revenue</MenuItem>
                  <MenuItem value="players">Players</MenuItem>
                </Select>
              </FormControl>

              <SimpleBox>
                <Tooltip title="Download report">
                  <span>
                    <IconButton
                      size="small"
                      sx={{ mr: 1 }}
                      disabled={isLoading}
                      aria-label="Download performance report"
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Chart settings">
                  <span>
                    <IconButton
                      size="small"
                      disabled={isLoading}
                      aria-label="Chart settings"
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </SimpleBox>
            </SimpleBox>
          </SimpleBox>

          <SimpleBox
            sx={{
              height: 400,
              position: 'relative',
              '& .recharts-responsive-container': {
                // Improve chart accessibility
                '& svg': { overflow: 'visible' },
                '& .recharts-tooltip-cursor': { stroke: 'rgba(0,0,0,0.2)' }
              }
            }}
            role="region"
            aria-label={`${chartType} chart of ${metricType} data`}
          >
            {renderChart()}
          </SimpleBox>
        </Paper>
      </Grid>

      {/* Multi-dimensional Analysis */}
      <Grid item xs={12}>
        <Card
          title="Multi-dimensional Performance Analysis"
          action={
            <SimpleBox>
              <Tooltip title="Download report">
                <span>
                  <IconButton
                    size="small"
                    sx={{ mr: 1 }}
                    disabled={isLoading}
                    aria-label="Download multi-dimensional analysis report"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Chart settings">
                <span>
                  <IconButton
                    size="small"
                    disabled={isLoading}
                    aria-label="Multi-dimensional chart settings"
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </SimpleBox>
          }
        >
          {isLoading ? (
            <SimpleBox sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={400} />
            </SimpleBox>
          ) : (
            <SimpleBox
              role="region"
              aria-label="Multi-dimensional radar chart comparing metrics across different categories"
            >
              <MultiDimensionalRadarChart
                data={chartData.multiDimensionalData}
                isLoading={false}
                metrics={[
                  { id: 'revenue', label: 'Revenue', format: 'currency' },
                  { id: 'players', label: 'Players', format: 'number' },
                  { id: 'retention', label: 'Retention', format: 'percentage' },
                  { id: 'conversion', label: 'Conversion', format: 'percentage' },
                  { id: 'engagement', label: 'Engagement', format: 'number' }
                ]}
                entities={[
                  { id: 'casino', name: 'Casino' } as Entity,
                  { id: 'sports', name: 'Sports' } as Entity,
                  { id: 'poker', name: 'Poker' } as Entity,
                  { id: 'bingo', name: 'Bingo' } as Entity
                ]}
              />
            </SimpleBox>
          )}
        </Card>
      </Grid>
    </Grid>
  );
};

export default PerformanceTabContent;
