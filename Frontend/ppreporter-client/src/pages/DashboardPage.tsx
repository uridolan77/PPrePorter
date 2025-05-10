import React, { useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Tabs, Tab, Divider, useTheme } from '@mui/material';
import ContextualDataExplorer from '../components/dashboard/ContextualDataExplorer';
import TabPanel from '../components/common/TabPanel';
import VisualQueryBuilder from '../components/reports/VisualQueryBuilder';
import InteractiveDrillDownExplorer from '../components/dashboard/InteractiveDrillDownExplorer';
import DataAnnotation, { AnnotationData } from '../components/visualization/DataAnnotation';
import { DashboardTab } from '../types/dashboard';

// Type definitions
interface DashboardConfig {
  title: string;
  defaultActiveTab: number;
  tabs: DashboardTab[];
}

interface Filters {
  timeRange: string;
  gameCategory: string;
  country: string;
  [key: string]: string;
}

interface DataPoint {
  id: string;
  value: number;
  label: string;
  [key: string]: any;
}

interface Metric {
  id: string;
  name: string;
  value: number;
  [key: string]: any;
}



// Sample dashboard layout configurations
const dashboardConfig: DashboardConfig = {
  title: 'ProgressPlay Performance Dashboard',
  defaultActiveTab: 0,
  tabs: [
    { id: 'overview', label: 'Overview', icon: 'Dashboard' },
    { id: 'reports', label: 'Reports', icon: 'AssessmentIcon' },
    { id: 'insights', label: 'AI Insights', icon: 'LightbulbIcon' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChartIcon' },
  ]
};

/**
 * Main Dashboard Page component that integrates all enhanced visualization components
 */
const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<number>(dashboardConfig.defaultActiveTab);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(null);
  const [filters, setFilters] = useState<Filters>({
    timeRange: 'last7days',
    gameCategory: 'all',
    country: 'all'
  });

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  // Handle view change in data explorer
  const handleViewChange = (view: string, metric?: Metric, dataPoint?: DataPoint): void => {
    if (metric) setSelectedMetric(metric);
    if (dataPoint) setSelectedDataPoint(dataPoint);
  };

  // Handle data point selection
  const handleDataPointSelect = (dataPoint: DataPoint): void => {
    setSelectedDataPoint(dataPoint);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<Filters>): void => {
    setFilters((prev: Filters) => {
      const updatedFilters: Filters = {
        ...prev,
        ...newFilters as Filters
      };
      return updatedFilters;
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {dashboardConfig.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Explore performance metrics, generate custom reports, and discover AI-powered insights
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
          >
            {dashboardConfig.tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={tab.label}
                id={`dashboard-tab-${index}`}
                aria-controls={`dashboard-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%'
              }}
            >
              <ContextualDataExplorer
                onAnnotationCreate={(annotation) => console.log('Annotation created:', annotation)}
              />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                minHeight: '600px'
              }}
            >
              <Typography variant="h5" gutterBottom>Visual Report Builder</Typography>
              <Divider sx={{ mb: 3 }} />
              <VisualQueryBuilder />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                minHeight: '600px'
              }}
            >
              <Typography variant="h5" gutterBottom>Interactive Exploration</Typography>
              <Divider sx={{ mb: 3 }} />
              <InteractiveDrillDownExplorer />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                height: '100%',
                minHeight: '600px'
              }}
            >
              <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>Player Retention Analysis</Typography>
                <DataAnnotation
                  data={{
                    title: "Player Retention Trend",
                    description: "This chart shows the 30-day retention rate for new players",
                    insights: [
                      "Retention has improved by 8.3% over last quarter",
                      "Weekend promotions correlate with higher retention rates",
                      "Players from Germany show the highest retention rates (32%)"
                    ]
                  } as AnnotationData}
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Revenue Distribution</Typography>
                <DataAnnotation
                  data={{
                    title: "Revenue Distribution by Game Type",
                    description: "Breakdown of revenue across different game categories",
                    insights: [
                      "Slots generate 45% of total revenue",
                      "Live Casino shows fastest growth at 27% YoY",
                      "Table Games provide the highest margin at 8.5%"
                    ]
                  } as AnnotationData}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default DashboardPage;
