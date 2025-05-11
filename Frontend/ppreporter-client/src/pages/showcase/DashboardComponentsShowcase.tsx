import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Sample component categories
const componentCategories = [
  {
    id: 'metrics',
    name: 'Metric Components',
    components: [
      {
        id: 'kpiCards',
        name: 'KPI Cards',
        description: 'Cards displaying key performance indicators',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">KPI Cards</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display KPI cards with metrics
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">KPI Cards Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'charts',
    name: 'Chart Components',
    components: [
      {
        id: 'lineCharts',
        name: 'Line Charts',
        description: 'Charts for displaying trends over time',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Line Charts</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display line charts for trend analysis
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Line Chart Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'tables',
    name: 'Table Components',
    components: [
      {
        id: 'dataTable',
        name: 'Data Tables',
        description: 'Tables for displaying structured data',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Data Tables</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display data tables with sorting and filtering
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">Data Table Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  }
];

/**
 * Dashboard Components Showcase
 * Displays all dashboard components in a categorized list
 */
const DashboardComponentsShowcase: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button
          component={RouterLink}
          to="/showcase"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Showcase
        </Button>
        <Typography variant="h4" component="h1">
          Dashboard Components
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4 }}>
        This showcase demonstrates the various dashboard components available in the application.
        Note: Some components require external dependencies that are not currently installed.
      </Typography>

      {componentCategories.map((category) => (
        <Box key={category.id} sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {category.name}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <List>
            {category.components.map((component) => (
              <ListItem key={component.id} sx={{ display: 'block', mb: 4 }}>
                <ListItemButton
                  component="div"
                  disableRipple
                  sx={{ display: 'block', p: 0, cursor: 'default' }}
                >
                  <ListItemText
                    primary={component.name}
                    secondary={component.description}
                    primaryTypographyProps={{ variant: 'h6' }}
                    sx={{ mb: 2 }}
                  />
                  {component.component}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Container>
  );
};

export default DashboardComponentsShowcase;
