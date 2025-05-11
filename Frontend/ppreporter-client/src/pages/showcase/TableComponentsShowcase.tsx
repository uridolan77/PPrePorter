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
    id: 'tables',
    name: 'Table Components',
    components: [
      {
        id: 'basicTable',
        name: 'Basic Table',
        description: 'Simple table for displaying data',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Basic Table</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display a basic table with data
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">Basic Table Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'dataGrid',
        name: 'Data Grid',
        description: 'Advanced grid for displaying and manipulating data',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Data Grid</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display an advanced data grid with sorting, filtering, and pagination
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, height: 200 }}>
              <Typography align="center">Data Grid Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'lists',
    name: 'List Components',
    components: [
      {
        id: 'virtualizedList',
        name: 'Virtualized List',
        description: 'Efficiently rendering large lists',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Virtualized List</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display a virtualized list for efficient rendering of large datasets
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">Virtualized List Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  }
];

/**
 * Table Components Showcase
 * Displays all table and list components in a categorized list
 */
const TableComponentsShowcase: React.FC = () => {
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
          Table Components
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4 }}>
        This showcase demonstrates the various table and list components available in the application.
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

export default TableComponentsShowcase;
