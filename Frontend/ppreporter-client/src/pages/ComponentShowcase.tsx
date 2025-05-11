import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CardActionArea,
  Divider,
  Button
} from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';

/**
 * Component Showcase Hub
 * Main entry point for exploring all UI components
 */
const ComponentShowcase: React.FC = () => {
  // Define component categories
  const categories = [
    {
      id: 'common',
      name: 'Common Components',
      description: 'Basic UI building blocks and utility components',
      icon: <ViewModuleIcon fontSize="large" />,
      count: 20,
      path: '/showcase/common'
    },
    {
      id: 'dashboard',
      name: 'Dashboard Components',
      description: 'Charts, metrics, and visualization components',
      icon: <DashboardIcon fontSize="large" />,
      count: 25,
      path: '/showcase/dashboard'
    },
    {
      id: 'reports',
      name: 'Report Components',
      description: 'Components for building and displaying reports',
      icon: <AssessmentIcon fontSize="large" />,
      count: 30,
      path: '/showcase/reports'
    },
    {
      id: 'tables',
      name: 'Table Components',
      description: 'Data tables and grid components',
      icon: <TableChartIcon fontSize="large" />,
      count: 10,
      path: '/showcase/tables'
    },
    {
      id: 'visualization',
      name: 'Visualization Components',
      description: 'Advanced data visualization components',
      icon: <BarChartIcon fontSize="large" />,
      count: 15,
      path: '/showcase/visualization'
    },
    {
      id: 'auth',
      name: 'Authentication Components',
      description: 'Login, registration, and user management components',
      icon: <PersonIcon fontSize="large" />,
      count: 8,
      path: '/showcase/auth'
    },
    {
      id: 'notification',
      name: 'Notification Components',
      description: 'Alerts, toasts, and notification components',
      icon: <NotificationsIcon fontSize="large" />,
      count: 5,
      path: '/showcase/notification'
    },
    {
      id: 'settings',
      name: 'Settings Components',
      description: 'Configuration and settings components',
      icon: <SettingsIcon fontSize="large" />,
      count: 7,
      path: '/showcase/settings'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Component Showcase
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Explore all UI components with mock data
        </Typography>
        <Typography variant="body1" paragraph>
          This showcase provides a comprehensive library of all UI components used in the PPreporter application.
          Each component is displayed with mock data to demonstrate its functionality without making actual API calls.
        </Typography>
        <Typography variant="body1">
          Select a category below to explore the components:
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={RouterLink} to={category.path}>
                <CardHeader
                  title={category.name}
                  subheader={`${category.count} components`}
                />
                <Divider />
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    borderRadius: '50%',
                    p: 2
                  }}>
                    {category.icon}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/showcase/all"
          sx={{ mr: 2 }}
        >
          View All Components
        </Button>
        <Button
          variant="outlined"
          component={RouterLink}
          to="/"
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default ComponentShowcase;
