import React, { lazy, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Error Boundary
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';

// Redux Provider
import { Provider } from 'react-redux';
import store from './store/store';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Lazy load all page components for better performance
// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Dashboard pages
const SimpleDashboard = lazy(() => import('./pages/SimpleDashboard'));
const DashboardSimple = lazy(() => import('./pages/DashboardSimple'));
const ApiDashboard = lazy(() => import('./pages/ApiDashboard'));
const TestContextualExplanation = lazy(() => import('./components/dashboard/TestContextualExplanation'));

// Report pages
const DailyActionsPage = lazy(() => import('./pages/reports/DailyActionsPage'));
const DailyActionsAdvancedPage = lazy(() => import('./pages/reports/DailyActionsAdvancedPage'));

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
            <Route path="/login" element={
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<LoadingFallback />}>
                <RegisterPage />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ForgotPasswordPage />
              </Suspense>
            } />
            <Route path="/reset-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ResetPasswordPage />
              </Suspense>
            } />
              {/* Protected Routes with MainLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />
                  <Route path="/dashboard/redux" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DashboardSimple />
                    </Suspense>
                  } />
                  <Route path="/dashboard/api" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ApiDashboard />
                    </Suspense>
                  } />
                  <Route path="/dashboard/contextual-explanation" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <TestContextualExplanation />
                    </Suspense>
                  } />

                  {/* Reports Routes */}
                  <Route path="/reports" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />
                  <Route path="/reports/daily-actions" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DailyActionsPage />
                    </Suspense>
                  } />
                  <Route path="/reports/daily-actions/advanced" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DailyActionsAdvancedPage />
                    </Suspense>
                  } />
                  <Route path="/reports/*" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />

                  {/* Analytics Routes */}
                  <Route path="/analytics" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />
                  <Route path="/analytics/*" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />

                  {/* Configuration Routes */}
                  <Route path="/configuration" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />
                  <Route path="/configuration/*" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />
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