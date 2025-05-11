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

// Import auth components
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';

// Sample component categories
const componentCategories = [
  {
    id: 'authentication',
    name: 'Authentication Components',
    components: [
      {
        id: 'loginForm',
        name: 'Login Form',
        description: 'Form for user authentication',
        component: (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <LoginForm
                  onSubmit={(data) => console.log('Login submitted:', data)}
                  onGoogleLogin={() => console.log('Google login clicked')}
                  onMicrosoftLogin={() => console.log('Microsoft login clicked')}
                  showSocialLogin={true}
                  showForgotPassword={true}
                  showRegister={true}
                />
              </Grid>
            </Grid>
          </Paper>
        )
      },
      {
        id: 'registerForm',
        name: 'Register Form',
        description: 'Form for new user registration',
        component: (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <RegisterForm
                  onSubmit={(data) => console.log('Registration submitted:', data)}
                  onGoogleRegister={() => console.log('Google registration clicked')}
                  onMicrosoftRegister={() => console.log('Microsoft registration clicked')}
                  showSocialLogin={true}
                />
              </Grid>
            </Grid>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'passwordManagement',
    name: 'Password Management',
    components: [
      {
        id: 'forgotPassword',
        name: 'Forgot Password',
        description: 'Form for password recovery',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Forgot Password Form</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display a form for password recovery
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">Forgot Password Form Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'resetPassword',
        name: 'Reset Password',
        description: 'Form for setting a new password',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Reset Password Form</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display a form for setting a new password
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">Reset Password Form Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  },
  {
    id: 'userManagement',
    name: 'User Management',
    components: [
      {
        id: 'userProfile',
        name: 'User Profile',
        description: 'Component for displaying and editing user profile',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">User Profile</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display and allow editing of user profile information
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">User Profile Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      },
      {
        id: 'userPermissions',
        name: 'User Permissions',
        description: 'Component for managing user permissions',
        component: (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">User Permissions</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This component would display and allow management of user permissions
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              <Typography align="center">User Permissions Component Placeholder</Typography>
            </Box>
          </Paper>
        )
      }
    ]
  }
];

/**
 * Authentication Components Showcase
 * Displays all authentication and user management components in a categorized list
 */
const AuthComponentsShowcase: React.FC = () => {
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
          Authentication Components
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 4 }}>
        This showcase demonstrates the various authentication and user management components available in the application.
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

export default AuthComponentsShowcase;
