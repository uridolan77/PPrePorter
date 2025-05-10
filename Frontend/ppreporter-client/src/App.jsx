import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Error Boundary
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';

// Redux Provider
import { Provider } from 'react-redux';
import store from './store/store';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Report pages
import DailyActionsAdvancedPage from './pages/reports/DailyActionsAdvancedPage';

// Dashboard pages
// import DashboardPage from './pages/Dashboard'; // Using Redux, commenting out for now
import SimpleDashboard from './pages/SimpleDashboard';
import DashboardSimple from './pages/DashboardSimple';
import ApiDashboard from './pages/ApiDashboard';
import TestContextualExplanation from './components/dashboard/TestContextualExplanation';

// Report pages
import DailyActionsPage from './pages/reports/DailyActionsPage';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontSize: 14,
    h5: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
              {/* Protected Routes with MainLayout */}            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<SimpleDashboard />} />
                <Route path="/dashboard/redux" element={<DashboardSimple />} />
                <Route path="/dashboard/api" element={<ApiDashboard />} />
                <Route path="/dashboard/contextual-explanation" element={<TestContextualExplanation />} />

                {/* Reports Routes */}
                <Route path="/reports" element={<SimpleDashboard />} />
                <Route path="/reports/daily-actions" element={<DailyActionsPage />} />
                <Route path="/reports/daily-actions/advanced" element={<DailyActionsAdvancedPage />} />
                <Route path="/reports/*" element={<SimpleDashboard />} />

                {/* Analytics Routes */}
                <Route path="/analytics" element={<SimpleDashboard />} />
                <Route path="/analytics/*" element={<SimpleDashboard />} />

                {/* Configuration Routes */}
                <Route path="/configuration" element={<SimpleDashboard />} />
                <Route path="/configuration/*" element={<SimpleDashboard />} />
              </Route>
            </Route>

            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </Router>
        </ThemeProvider>
      </Provider>
    </GlobalErrorBoundary>
  );
}

export default App;