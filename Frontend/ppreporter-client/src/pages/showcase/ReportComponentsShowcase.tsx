import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Button,
  Card as MuiCard,
  CardContent,
  CardHeader
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import report components
import {
  ReportFilterSelector,
  ReportColumnSelector,
  ReportDataSourceSelector,
  ReportFilterSelector as ReportFilter,
  ReportList,
  ReportPreview,
  ReportScheduleDialog,
  ReportShareDialog,
  ReportTemplate
} from '../../components/reports';
import NaturalLanguageQueryPanel from '../../components/reports/NaturalLanguageQueryPanel';
import ReportViewer from '../../components/reports/ReportViewer';
import DailyActionsReport from '../../components/reports/DailyActionsReport';

// Import mock data
import {
  mockFilterData,
  mockReportData,
  mockQuerySuggestions,
  mockDailyActionsData
} from '../../mockData/showcase';

// Define component categories
interface ComponentCategory {
  id: string;
  name: string;
  components: ComponentItem[];
}

interface ComponentItem {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
}

/**
 * Report Components Showcase Page
 * Displays report UI components with mock data for exploration
 */
const ReportComponentsShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('filters');
  const [selectedComponent, setSelectedComponent] = useState<string>('reportFilterSelector');

  // Prepare mock data for components
  const mockReportSections = mockReportData.sections.map(section => ({
    ...section,
    content: (
      <Box p={2}>
        <Typography variant="body1">
          {section.content}
        </Typography>
      </Box>
    )
  }));

  // Define component categories and their components
  const componentCategories: ComponentCategory[] = [
    {
      id: 'filters',
      name: 'Filters & Selectors',
      components: [
        {
          id: 'reportFilterSelector',
          name: 'Report Filter Selector',
          description: 'Component for defining report filters',
          component: (
            <Paper sx={{ p: 3 }}>
              <ReportFilterSelector
                dataSource={mockFilterData.dataSource}
                filters={mockFilterData.filters}
                onChange={(filters) => console.log('Filters changed:', filters)}
              />
            </Paper>
          )
        },

        {
          id: 'reportColumnSelector',
          name: 'Report Column Selector',
          description: 'Component for selecting columns to display in a report',
          component: (
            <Paper sx={{ p: 3 }}>
              <ReportColumnSelector
                dataSource={{
                  schema: [
                    { id: 'date', name: 'Date', type: 'date' },
                    { id: 'label', name: 'Label', type: 'string' },
                    { id: 'country', name: 'Country', type: 'string' },
                    { id: 'registrations', name: 'Registrations', type: 'number' },
                    { id: 'deposits', name: 'Deposits', type: 'number' },
                    { id: 'withdrawals', name: 'Withdrawals', type: 'number' }
                  ]
                }}
                selectedColumns={[
                  { id: 'date', name: 'Date', type: 'date', width: '150px', visible: true, aggregation: null },
                  { id: 'label', name: 'Label', type: 'string', width: '150px', visible: true, aggregation: null },
                  { id: 'registrations', name: 'Registrations', type: 'number', width: '150px', visible: true, aggregation: null },
                  { id: 'deposits', name: 'Deposits', type: 'number', width: '150px', visible: true, aggregation: null },
                  { id: 'withdrawals', name: 'Withdrawals', type: 'number', width: '150px', visible: false, aggregation: null }
                ]}
                onChange={(columns) => console.log('Columns changed:', columns)}
              />
            </Paper>
          )
        },
        {
          id: 'reportDataSourceSelector',
          name: 'Report Data Source Selector',
          description: 'Component for selecting the data source for a report',
          component: (
            <Paper sx={{ p: 3 }}>
              <ReportDataSourceSelector
                availableDataSources={[
                  { id: 'dailyActions', name: 'Daily Actions', type: 'database', description: 'Daily player activity data' },
                  { id: 'transactions', name: 'Transactions', type: 'database', description: 'Financial transaction data' },
                  { id: 'players', name: 'Players', type: 'database', description: 'Player profile data' }
                ]}
                selected={{ id: 'dailyActions', name: 'Daily Actions', type: 'database', description: 'Daily player activity data' }}
                onChange={(dataSource) => console.log('Data source changed:', dataSource)}
              />
            </Paper>
          )
        }
      ]
    },
    {
      id: 'reports',
      name: 'Report Components',
      components: [
        {
          id: 'reportViewer',
          name: 'Report Viewer',
          description: 'Component for displaying report data and sections',
          component: (
            <ReportViewer
              title="Sample Report"
              description="This is a sample report for demonstration purposes"
              sections={mockReportSections}
              data={mockReportData.data}
              onRefresh={() => console.log('Refresh report')}
              onExport={(format) => console.log('Export report as', format)}
              showExport={true}
            />
          )
        },
        {
          id: 'dailyActionsReport',
          name: 'Daily Actions Report',
          description: 'Comprehensive daily actions reporting component',
          component: (
            <DailyActionsReport
              data={mockDailyActionsData}
              onFilterChange={(filters) => console.log('Filters changed:', filters)}
              onRefresh={(filters) => console.log('Refresh with filters:', filters)}
              onExport={(format) => console.log('Export as', format)}
            />
          )
        },
        {
          id: 'reportPreview',
          name: 'Report Preview',
          description: 'Component for previewing a report before generating it',
          component: (
            <Paper sx={{ p: 3 }}>
              <ReportPreview
                report={{
                  title: 'Daily Actions Report',
                  description: 'Summary of daily player actions',
                  filters: [
                    { name: 'Date Range', value: 'Last 7 days' },
                    { name: 'Labels', value: 'All' },
                    { name: 'Group By', value: 'Day' }
                  ],
                  columns: ['Date', 'Label', 'Registrations', 'Deposits', 'Withdrawals'],
                  previewData: mockDailyActionsData.slice(0, 5)
                }}
                onGenerate={() => console.log('Generate report')}
                onEdit={() => console.log('Edit report')}
              />
            </Paper>
          )
        },
        {
          id: 'reportTemplate',
          name: 'Report Template',
          description: 'Component for creating and editing report templates',
          component: (
            <Paper sx={{ p: 3 }}>
              <ReportTemplate
                template={{
                  id: '1',
                  name: 'Daily Activity Summary',
                  description: 'Daily summary of player activities',
                  dataSource: 'dailyActions',
                  filters: {
                    dateRange: 'last7Days',
                    labels: [],
                    groupBy: 'day'
                  },
                  columns: ['date', 'label', 'registrations', 'deposits', 'withdrawals']
                }}
                onChange={(template) => console.log('Template changed:', template)}
              />
            </Paper>
          )
        }
      ]
    },
    {
      id: 'query',
      name: 'Query Components',
      components: [
        {
          id: 'naturalLanguageQuery',
          name: 'Natural Language Query',
          description: 'Component for querying data using natural language',
          component: (
            <NaturalLanguageQueryPanel
              onSearch={(query) => console.log('Search query:', query)}
              suggestions={mockQuerySuggestions}
            />
          )
        },

      ]
    },
    {
      id: 'management',
      name: 'Report Management',
      components: [
        {
          id: 'reportList',
          name: 'Report List',
          description: 'Component for displaying a list of reports',
          component: (
            <Paper sx={{ p: 3 }}>
              <ReportList
                reports={[
                  { id: '1', name: 'Daily Activity Report', lastRun: new Date(), schedule: 'Daily' },
                  { id: '2', name: 'Monthly Revenue Report', lastRun: new Date(), schedule: 'Monthly' },
                  { id: '3', name: 'Player Retention Analysis', lastRun: new Date(), schedule: 'Weekly' }
                ]}
                onViewReport={(id) => console.log('View report:', id)}
                onEditReport={(id) => console.log('Edit report:', id)}
                onDeleteReport={(id) => console.log('Delete report:', id)}
                onRunReport={(id) => console.log('Run report:', id)}
              />
            </Paper>
          )
        },

        {
          id: 'reportScheduleDialog',
          name: 'Report Schedule Dialog',
          description: 'Dialog for scheduling reports',
          component: (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1">
                  Click the button below to open the schedule dialog:
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => console.log('Open schedule dialog')}
                >
                  Schedule Report
                </Button>
                <ReportScheduleDialog
                  open={false}
                  onClose={() => console.log('Dialog closed')}
                  onSave={(schedule) => console.log('Schedule saved:', schedule)}
                  schedule={{
                    frequency: 'daily',
                    time: '08:00',
                    days: ['monday', 'wednesday', 'friday'],
                    recipients: ['john@example.com', 'jane@example.com']
                  }}
                />
              </Box>
            </Paper>
          )
        },
        {
          id: 'reportShareDialog',
          name: 'Report Share Dialog',
          description: 'Dialog for sharing reports',
          component: (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1">
                  Click the button below to open the share dialog:
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => console.log('Open share dialog')}
                >
                  Share Report
                </Button>
                <ReportShareDialog
                  open={false}
                  onClose={() => console.log('Dialog closed')}
                  onShare={(recipients) => console.log('Report shared with:', recipients)}
                  report={{
                    id: '1',
                    name: 'Daily Activity Report'
                  }}
                />
              </Box>
            </Paper>
          )
        }
      ]
    }
  ];

  // Find the currently selected component
  const getSelectedComponent = () => {
    const category = componentCategories.find(cat => cat.id === selectedCategory);
    if (!category) return null;

    const component = category.components.find(comp => comp.id === selectedComponent);
    return component;
  };

  const currentComponent = getSelectedComponent();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={RouterLink}
          to="/showcase"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Showcase
        </Button>
        <Typography variant="h4">
          Report Components
        </Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Components for building and displaying reports
      </Typography>

      <Grid container spacing={3}>
        {/* Sidebar with component categories and list */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 0, height: '100%' }}>
            <Tabs
              value={selectedCategory}
              onChange={(_, value) => {
                setSelectedCategory(value);
                // Select the first component in the category
                const category = componentCategories.find(cat => cat.id === value);
                if (category && category.components.length > 0) {
                  setSelectedComponent(category.components[0].id);
                }
              }}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {componentCategories.map((category) => (
                <Tab key={category.id} label={category.name} value={category.id} />
              ))}
            </Tabs>

            <List sx={{ pt: 0 }}>
              {componentCategories
                .find(cat => cat.id === selectedCategory)
                ?.components.map((component) => (
                  <ListItem key={component.id} disablePadding>
                    <ListItemButton
                      selected={selectedComponent === component.id}
                      onClick={() => setSelectedComponent(component.id)}
                    >
                      <ListItemText
                        primary={component.name}
                        secondary={component.description}
                        primaryTypographyProps={{
                          fontWeight: selectedComponent === component.id ? 'bold' : 'normal'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </Paper>
        </Grid>

        {/* Main content area */}
        <Grid item xs={12} md={9}>
          {currentComponent && (
            <Box>
              <MuiCard sx={{ mb: 3 }}>
                <CardHeader
                  title={currentComponent.name}
                  subheader={currentComponent.description}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    This is a preview of the component with mock data. No API calls are being made.
                  </Typography>
                </CardContent>
              </MuiCard>

              {/* Component display */}
              {currentComponent.component}
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportComponentsShowcase;
