import React, { useState } from 'react';
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

// Import components to showcase
import { ReportFilterSelector } from '../components/reports';
import NaturalLanguageQueryPanel from '../components/reports/NaturalLanguageQueryPanel';
import ReportViewer from '../components/reports/ReportViewer';
import DailyActionsReport from '../components/reports/DailyActionsReport';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import common components
import {
  Pagination,
  DateRangePicker,
  ErrorDisplay,
  ConfirmDialog,
  KPICard,
  MultiSelect
} from '../components/common';
import {
  mockFilterData,
  mockReportData,
  mockQuerySuggestions,
  mockDailyActionsData
} from '../mockData/showcase';

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
 * Component Showcase Page
 * Displays various UI components with mock data for exploration
 */
const ComponentShowcase: React.FC = () => {
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
      id: 'common',
      name: 'Common Components',
      components: [
        {
          id: 'pagination',
          name: 'Pagination',
          description: 'Component for paginating through data',
          component: (
            <Paper sx={{ p: 3 }}>
              <Pagination
                page={1}
                count={10}
                onPageChange={(page) => console.log('Page changed:', page)}
              />
            </Paper>
          )
        },
        {
          id: 'dateRangePicker',
          name: 'Date Range Picker',
          description: 'Component for selecting a date range',
          component: (
            <Paper sx={{ p: 3 }}>
              <DateRangePicker
                startDate={new Date()}
                endDate={new Date()}
                onChange={(range) => console.log('Date range changed:', range)}
              />
            </Paper>
          )
        },
        {
          id: 'kpiCard',
          name: 'KPI Card',
          description: 'Card for displaying key performance indicators',
          component: (
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="Total Revenue"
                    value="$1,234,567"
                    trend={12.5}
                    trendLabel="vs last period"
                    icon={<Box sx={{ width: 24, height: 24, bgcolor: 'primary.main', borderRadius: '50%' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <KPICard
                    title="New Users"
                    value="1,234"
                    trend={-5.2}
                    trendLabel="vs last period"
                    icon={<Box sx={{ width: 24, height: 24, bgcolor: 'secondary.main', borderRadius: '50%' }} />}
                  />
                </Grid>
              </Grid>
            </Paper>
          )
        },
        {
          id: 'multiSelect',
          name: 'Multi Select',
          description: 'Component for selecting multiple options',
          component: (
            <Paper sx={{ p: 3 }}>
              <MultiSelect
                label="Select Options"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                  { value: 'option4', label: 'Option 4' }
                ]}
                value={['option1']}
                onChange={(value) => console.log('Selection changed:', value)}
              />
            </Paper>
          )
        }
      ]
    },
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
          id: 'datePicker',
          name: 'Date Picker',
          description: 'Date selection component',
          component: (
            <Paper sx={{ p: 3 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={new Date()}
                  onChange={(date) => console.log('Date selected:', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
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
        }
      ]
    },
    {
      id: 'dialogs',
      name: 'Dialogs & Modals',
      components: [
        {
          id: 'confirmDialog',
          name: 'Confirm Dialog',
          description: 'Dialog for confirming user actions',
          component: (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body1">
                  Click the button below to open a confirm dialog:
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => console.log('Open confirm dialog')}
                >
                  Open Confirm Dialog
                </Button>
                <ConfirmDialog
                  open={false}
                  onClose={() => console.log('Dialog closed')}
                  onConfirm={() => console.log('Action confirmed')}
                  title="Confirm Action"
                  message="Are you sure you want to perform this action? This cannot be undone."
                  confirmText="Confirm"
                  cancelText="Cancel"
                />
              </Box>
            </Paper>
          )
        },
        {
          id: 'errorDisplay',
          name: 'Error Display',
          description: 'Component for displaying error messages',
          component: (
            <Paper sx={{ p: 3 }}>
              <ErrorDisplay
                error={{
                  message: 'An error occurred while processing your request',
                  details: 'Error details would be displayed here'
                }}
                onRetry={() => console.log('Retry action')}
              />
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
      <Typography variant="h4" gutterBottom>
        Component Showcase
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Explore UI components with mock data
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

export default ComponentShowcase;
