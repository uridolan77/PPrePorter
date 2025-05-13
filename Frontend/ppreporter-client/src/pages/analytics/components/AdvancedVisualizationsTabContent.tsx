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
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

// Import components
import SimpleBox from '../../../components/common/SimpleBox';
import AdvancedInteractiveChart from '../../../components/reports/interactive/AdvancedInteractiveChart';

/**
 * Time series data point interface
 */
interface TimeSeriesDataPoint {
  date: string;
  revenue: number;
  players: number;
  newPlayers: number;
  churn: number;
}

/**
 * Scatter data point interface
 */
interface ScatterDataPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  size: number;
  group: string;
  label: string;
}

/**
 * Network node interface
 */
interface NetworkNode {
  id: string;
  name: string;
  value: number;
  group: string;
}

/**
 * Network link interface
 */
interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

/**
 * Network data interface
 */
interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

/**
 * Sankey node interface
 */
interface SankeyNode {
  id: string;
  name: string;
}

/**
 * Sankey link interface
 */
interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

/**
 * Sankey data interface
 */
interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

/**
 * 3D data point interface
 */
interface ThreeDDataPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  value: number;
  label: string;
  group: string;
}

/**
 * Advanced visualizations tab content props
 */
interface AdvancedVisualizationsTabContentProps {
  /** Dashboard data */
  dashboardData: any;
  /** Loading state indicator */
  isLoading: boolean;
}

/**
 * AdvancedVisualizationsTabContent component
 *
 * Displays advanced and interactive visualizations with configurable options.
 * Features include:
 * - Time series analysis with zoom and drill-down
 * - Multi-dimensional scatter plots with lasso selection
 * - Network visualization (placeholder)
 * - Sankey diagram for player journey (placeholder)
 * - 3D data visualization (placeholder)
 *
 * @param props - Component props
 * @returns React component
 */
const AdvancedVisualizationsTabContent: React.FC<AdvancedVisualizationsTabContentProps> = ({
  dashboardData,
  isLoading
}) => {
  // Visualization state
  const [interactiveMode, setInteractiveMode] = useState<boolean>(true);
  const [selectedVisualization, setSelectedVisualization] = useState<string>('timeSeries');

  /**
   * Handle interactive mode toggle
   * @param event - Change event
   */
  const handleInteractiveModeToggle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInteractiveMode(event.target.checked);
  };

  /**
   * Handle visualization type change
   * @param event - Select change event
   */
  const handleVisualizationChange = (event: SelectChangeEvent): void => {
    setSelectedVisualization(event.target.value);
  };

  /**
   * Visualization data with memoization to prevent unnecessary recalculations
   */
  const visualizationData = useMemo(() => ({
    // Time series data
    timeSeriesData: Array.from({ length: 30 }, (_, i): TimeSeriesDataPoint => ({
      date: `2023-${Math.floor(i / 30) + 1}-${(i % 30) + 1}`,
      revenue: 10000 + Math.random() * 5000,
      players: 500 + Math.random() * 300,
      newPlayers: 100 + Math.random() * 50,
      churn: 50 + Math.random() * 30
    })),

    // Scatter plot data
    scatterData: Array.from({ length: 50 }, (_, i): ScatterDataPoint => ({
      id: `point-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      size: Math.random() * 20 + 5,
      group: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
      label: `Data Point ${i + 1}`
    })),

    // Network visualization data
    networkData: {
      nodes: Array.from({ length: 20 }, (_, i): NetworkNode => ({
        id: `node-${i}`,
        name: `Node ${i + 1}`,
        value: Math.random() * 100,
        group: ['Players', 'Games', 'Transactions', 'Promotions'][Math.floor(Math.random() * 4)]
      })),
      links: Array.from({ length: 30 }, (_, i): NetworkLink => ({
        source: `node-${Math.floor(Math.random() * 20)}`,
        target: `node-${Math.floor(Math.random() * 20)}`,
        value: Math.random() * 10
      }))
    } as NetworkData,

    // Sankey diagram data
    sankeyData: {
      nodes: [
        { id: 'acquisition', name: 'Acquisition' },
        { id: 'registration', name: 'Registration' },
        { id: 'deposit', name: 'First Deposit' },
        { id: 'active', name: 'Active Player' },
        { id: 'inactive', name: 'Inactive' },
        { id: 'churn', name: 'Churn' },
        { id: 'reactivated', name: 'Reactivated' }
      ],
      links: [
        { source: 'acquisition', target: 'registration', value: 1000 },
        { source: 'registration', target: 'deposit', value: 700 },
        { source: 'registration', target: 'inactive', value: 300 },
        { source: 'deposit', target: 'active', value: 650 },
        { source: 'deposit', target: 'inactive', value: 50 },
        { source: 'active', target: 'active', value: 500 },
        { source: 'active', target: 'inactive', value: 150 },
        { source: 'inactive', target: 'churn', value: 200 },
        { source: 'inactive', target: 'reactivated', value: 150 },
        { source: 'reactivated', target: 'active', value: 100 },
        { source: 'reactivated', target: 'inactive', value: 50 }
      ]
    } as SankeyData,

    // 3D visualization data
    threeDData: Array.from({ length: 100 }, (_, i): ThreeDDataPoint => ({
      id: `point-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
      value: Math.random() * 100,
      label: `Point ${i + 1}`,
      group: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
    }))
  }), []);

  /**
   * Render visualization based on selected type
   * @returns React component for the selected visualization
   */
  const renderVisualization = () => {
    // Show skeleton while loading
    if (isLoading) {
      return <Skeleton variant="rectangular" height={500} />;
    }

    /**
     * Placeholder visualization component
     */
    const PlaceholderVisualization = ({
      title,
      description
    }: {
      title: string;
      description: string
    }) => (
      <SimpleBox
        sx={{
          height: 500,
          border: '1px solid',
          borderColor: 'divider',
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
        <SimpleBox
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 400,
            flexGrow: 1
          }}
        >
          <InfoOutlinedIcon
            sx={{ mr: 1, color: 'info.main' }}
            aria-hidden="true"
          />
          <Typography>
            {title} would be displayed here
          </Typography>
        </SimpleBox>
      </SimpleBox>
    );

    // Render appropriate visualization based on selected type
    switch (selectedVisualization) {
      case 'timeSeries':
        return (
          <SimpleBox
            role="region"
            aria-label="Time series visualization"
          >
            <AdvancedInteractiveChart
              id="time-series-chart"
              title="Revenue and Player Trends Over Time"
              description="Interactive time series visualization with drill-down capabilities"
              type={interactiveMode ? 'zoomableTimeSeries' : 'timeSeries'}
              data={visualizationData.timeSeriesData}
              xKey="date"
              yKeys={['revenue', 'players', 'newPlayers']}
              height={500}
              showLegend={true}
              showGrid={true}
              enableDrilldown={interactiveMode}
              enableZoom={interactiveMode}
              enableTooltip={true}
              enableCrossFiltering={interactiveMode}
              enableAnnotations={interactiveMode}
              enableExport={true}
              enableFullscreen={true}
            />
          </SimpleBox>
        );

      case 'scatter':
        return (
          <SimpleBox
            role="region"
            aria-label="Multi-dimensional scatter plot"
          >
            <AdvancedInteractiveChart
              id="scatter-chart"
              title="Multi-dimensional Data Exploration"
              description="Interactive scatter plot with lasso selection and cross-filtering"
              type={interactiveMode ? 'lassoScatter' : 'scatter'}
              data={visualizationData.scatterData}
              xKey="x"
              yKeys={['y', 'z']}
              nameKey="label"
              valueKey="size"
              height={500}
              showLegend={true}
              showGrid={true}
              enableDrilldown={interactiveMode}
              enableLassoSelection={interactiveMode}
              enableTooltip={true}
              enableCrossFiltering={interactiveMode}
              enableAnnotations={interactiveMode}
              enableExport={true}
              enableFullscreen={true}
            />
          </SimpleBox>
        );

      case 'network':
        return (
          <SimpleBox
            role="region"
            aria-label="Network visualization placeholder"
          >
            <PlaceholderVisualization
              title="Network Visualization"
              description="This visualization requires the NetworkGraph component from reports/visualizations directory."
            />
          </SimpleBox>
        );

      case 'sankey':
        return (
          <SimpleBox
            role="region"
            aria-label="Sankey diagram placeholder"
          >
            <PlaceholderVisualization
              title="Player Journey Sankey Diagram"
              description="This visualization requires the SankeyDiagram component from reports/visualizations directory."
            />
          </SimpleBox>
        );

      case '3d':
        return (
          <SimpleBox
            role="region"
            aria-label="3D visualization placeholder"
          >
            <PlaceholderVisualization
              title="3D Data Visualization"
              description="This visualization requires the Interactive3DChart component from reports/visualizations directory."
            />
          </SimpleBox>
        );

      default:
        return (
          <SimpleBox
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 500
            }}
            role="region"
            aria-label="No visualization selected"
          >
            <Typography>
              Select a visualization type from the dropdown above
            </Typography>
          </SimpleBox>
        );
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Controls */}
      <Grid item xs={12}>
        <Paper
          sx={{ p: 3, mb: 3 }}
          component="section"
          aria-labelledby="advanced-visualizations-title"
        >
          <SimpleBox
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            <Typography
              variant="h5"
              id="advanced-visualizations-title"
              component="h2"
            >
              Advanced Visualizations
            </Typography>

            <SimpleBox
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
              }}
            >
              <FormControl
                size="small"
                sx={{ minWidth: 220 }}
              >
                <InputLabel id="visualization-type-label">Visualization Type</InputLabel>
                <Select
                  labelId="visualization-type-label"
                  id="visualization-type-select"
                  value={selectedVisualization}
                  label="Visualization Type"
                  onChange={handleVisualizationChange}
                  disabled={isLoading}
                  aria-describedby="visualization-type-helper"
                >
                  <MenuItem value="timeSeries">Time Series Analysis</MenuItem>
                  <MenuItem value="scatter">Multi-dimensional Scatter</MenuItem>
                  <MenuItem value="network">Network Visualization</MenuItem>
                  <MenuItem value="sankey">Player Journey Sankey</MenuItem>
                  <MenuItem value="3d">3D Data Visualization</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={interactiveMode}
                    onChange={handleInteractiveModeToggle}
                    color="primary"
                    disabled={isLoading}
                    inputProps={{
                      'aria-label': 'Toggle interactive mode',
                      'aria-describedby': 'interactive-mode-helper'
                    }}
                  />
                }
                label="Interactive Mode"
              />

              <SimpleBox>
                <Tooltip title="Download visualization">
                  <span>
                    <IconButton
                      size="small"
                      disabled={isLoading}
                      aria-label="Download visualization"
                      sx={{ mr: 1 }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="View in fullscreen">
                  <span>
                    <IconButton
                      size="small"
                      disabled={isLoading}
                      aria-label="View in fullscreen"
                    >
                      <FullscreenIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </SimpleBox>
            </SimpleBox>
          </SimpleBox>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="body2"
            color="text.secondary"
            paragraph
            id="interactive-mode-helper"
          >
            Advanced visualizations provide interactive exploration capabilities including drill-down,
            cross-filtering, annotations, and more. Enable interactive mode to access these features.
          </Typography>
        </Paper>
      </Grid>

      {/* Visualization */}
      <Grid item xs={12}>
        <Paper
          sx={{
            p: 0,
            overflow: 'hidden',
            '& .recharts-responsive-container': {
              // Improve chart accessibility
              '& svg': { overflow: 'visible' },
              '& .recharts-tooltip-cursor': { stroke: 'rgba(0,0,0,0.2)' }
            }
          }}
        >
          {renderVisualization()}
        </Paper>
      </Grid>

      {/* Features Description */}
      <Grid item xs={12}>
        <Paper
          sx={{ p: 3 }}
          component="section"
          aria-labelledby="interactive-features-title"
        >
          <Typography
            variant="h6"
            gutterBottom
            id="interactive-features-title"
            component="h3"
          >
            Interactive Features
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{ mt: 1 }}
            role="list"
            aria-label="Interactive features list"
          >
            {/* Feature cards */}
            {[
              {
                title: 'Drill-down',
                description: 'Click on data points to explore detailed information and see underlying data.',
                icon: '🔍'
              },
              {
                title: 'Cross-filtering',
                description: 'Select data in one visualization to filter related data in other visualizations.',
                icon: '🔗'
              },
              {
                title: 'Zoom & Pan',
                description: 'Zoom into specific time periods or data regions, and pan to navigate through the data.',
                icon: '🔎'
              },
              {
                title: 'Annotations',
                description: 'Add comments and annotations to data points to highlight insights and share with team.',
                icon: '📝'
              }
            ].map((feature, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={index}
                role="listitem"
              >
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
                  <SimpleBox sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography
                      variant="subtitle1"
                      component="h4"
                      sx={{ mr: 1 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="span"
                      aria-hidden="true"
                    >
                      {feature.icon}
                    </Typography>
                  </SimpleBox>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </SimpleBox>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AdvancedVisualizationsTabContent;
