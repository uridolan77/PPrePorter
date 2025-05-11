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

// Import common components
import {
  Pagination,
  DateRangePicker,
  ErrorDisplay,
  ConfirmDialog,
  KPICard,
  MultiSelect,
  Card,
  EmptyState,
  FilterPanel,
  TabPanel,
  Tooltip,
  VirtualizedList
} from '../../components/common';

// Import date pickers
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
 * Common Components Showcase Page
 * Displays common UI components with mock data for exploration
 */
const CommonComponentsShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('display');
  const [selectedComponent, setSelectedComponent] = useState<string>('card');

  // Define component categories and their components
  const componentCategories: ComponentCategory[] = [
    {
      id: 'display',
      name: 'Display Components',
      components: [
        {
          id: 'card',
          name: 'Card',
          description: 'Basic card component for displaying content',
          component: (
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card
                    title="Sample Card"
                    subheader="Card subtitle"
                    action={
                      <Button variant="contained" size="small">
                        Action
                      </Button>
                    }
                  >
                    <Box p={2}>
                      <Typography variant="body2">
                        This is a sample card component with content.
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )
        },
        {
          id: 'emptyState',
          name: 'Empty State',
          description: 'Component for displaying when no data is available',
          component: (
            <Paper sx={{ p: 3 }}>
              <EmptyState
                message="No Data Available"
                description="There is no data to display at this time."
                icon={<Box sx={{ width: 48, height: 48, bgcolor: 'action.disabled', borderRadius: '50%' }} />}
                action={
                  <Button variant="contained">
                    Create New
                  </Button>
                }
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
          id: 'tooltip',
          name: 'Tooltip',
          description: 'Component for displaying additional information on hover',
          component: (
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
              <Tooltip title="This is a tooltip with additional information">
                <Button variant="outlined">Hover Me</Button>
              </Tooltip>
            </Paper>
          )
        }
      ]
    },
    {
      id: 'input',
      name: 'Input Components',
      components: [
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
        },
        {
          id: 'filterPanel',
          name: 'Filter Panel',
          description: 'Component for filtering data',
          component: (
            <Paper sx={{ p: 3 }}>
              <FilterPanel
                filters={[
                  { id: 'name', label: 'Name', type: 'text' },
                  { id: 'status', label: 'Status', type: 'select', options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'pending', label: 'Pending' }
                  ]},
                  { id: 'date', label: 'Date', type: 'date' }
                ]}
                values={{}}
                onChange={(id, value) => console.log('Filter changed:', id, value)}
                onApply={() => console.log('Filters applied')}
                onReset={() => console.log('Filters reset')}
              />
            </Paper>
          )
        }
      ]
    },
    {
      id: 'navigation',
      name: 'Navigation Components',
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
          id: 'tabPanel',
          name: 'Tab Panel',
          description: 'Component for organizing content in tabs',
          component: (
            <Paper sx={{ p: 3 }}>
              <Box>
                <Tabs value={0} onChange={() => {}}>
                  <Tab label="Tab 1" />
                  <Tab label="Tab 2" />
                  <Tab label="Tab 3" />
                </Tabs>
                <TabPanel value={0} index={0}>
                  <Typography>Content for Tab 1</Typography>
                </TabPanel>
              </Box>
            </Paper>
          )
        }
      ]
    },
    {
      id: 'feedback',
      name: 'Feedback Components',
      components: [
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
        },
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
        }
      ]
    },
    {
      id: 'utility',
      name: 'Utility Components',
      components: [
        {
          id: 'virtualizedList',
          name: 'Virtualized List',
          description: 'Component for efficiently rendering large lists',
          component: (
            <Paper sx={{ p: 3, height: 300 }}>
              <VirtualizedList
                data={Array.from({ length: 1000 }, (_, i) => ({
                  id: i.toString(),
                  primary: `Item ${i + 1}`,
                  secondary: `Description for item ${i + 1}`
                }))}
                renderRow={({ data, style }) => (
                  <ListItem style={style}>
                    <ListItemText primary={data.primary} secondary={data.secondary} />
                  </ListItem>
                )}
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
          Common Components
        </Typography>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Basic UI building blocks and utility components
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

export default CommonComponentsShowcase;
