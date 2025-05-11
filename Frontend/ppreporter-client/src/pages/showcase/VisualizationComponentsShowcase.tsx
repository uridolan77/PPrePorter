import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Sample component categories
const componentCategories = [
  {
    id: 'charts',
    name: 'Chart Components',
    components: [
      {
        id: 'lineChart',
        name: 'Line Chart',
        description: 'Chart for displaying trends over time',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Line Chart</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component displays data trends over time
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Line Chart Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'barChart',
        name: 'Bar Chart',
        description: 'Chart for comparing values across categories',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Bar Chart</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component displays comparative data across categories
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Bar Chart Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'pieChart',
        name: 'Pie Chart',
        description: 'Chart for displaying proportional data',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Pie Chart</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component displays proportional data as slices of a circle
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Pie Chart Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'advanced',
    name: 'Advanced Visualizations',
    components: [
      {
        id: 'heatmap',
        name: 'Heatmap',
        description: 'Visualization for displaying data density',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Heatmap</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component displays data density using color intensity
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Heatmap Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'radarChart',
        name: 'Radar Chart',
        description: 'Chart for displaying multivariate data',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Radar Chart</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component displays multivariate data on multiple axes
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Radar Chart Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'scatterPlot',
        name: 'Scatter Plot',
        description: 'Chart for displaying correlation between variables',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Scatter Plot</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component displays correlation between two variables
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Scatter Plot Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'interactive',
    name: 'Interactive Visualizations',
    components: [
      {
        id: 'drillDown',
        name: 'Drill-Down Explorer',
        description: 'Interactive visualization for exploring hierarchical data',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Drill-Down Explorer</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component allows users to explore hierarchical data by drilling down into details
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Drill-Down Explorer Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'whatIf',
        name: 'What-If Scenario Modeler',
        description: 'Interactive tool for modeling different scenarios',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">What-If Scenario Modeler</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component allows users to model different scenarios by adjusting parameters
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">What-If Scenario Modeler Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  }
];

/**
 * Visualization Components Showcase
 * Displays all visualization components in a categorized list
 */
const VisualizationComponentsShowcase: React.FC = () => {
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
          Visualization Components
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4 }}>
        This showcase demonstrates the various visualization components available in the application.
        Note: Some components are currently displayed as placeholders.
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

export default VisualizationComponentsShowcase;
