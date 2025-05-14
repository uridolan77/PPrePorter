import React, { lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import flatModernTheme from './theme/flatModernTheme';

// Error Boundary
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary';

// Redux Provider
import { Provider } from 'react-redux';
import store from './store/store';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Import custom loading container
import LoadingContainer from './components/loading/LoadingContainer';

// Import directly (not lazy loaded)
import DirectGridTestPage from './pages/test/DirectGridTestPage';
import CustomGridTestPage from './pages/test/CustomGridTestPage';
import SafeGridTestPage from './pages/test/SafeGridTestPage';

// Loading component for suspense fallback
const LoadingFallback: React.FC = () => {
  return (
    <LoadingContainer>
      <CircularProgress />
    </LoadingContainer>
  );
};

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

// Analytics pages
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));
const AdvancedAnalyticsPage = lazy(() => import('./pages/analytics/AdvancedAnalyticsPage'));

// Report pages
const DailyActionsPage = lazy(() => import('./pages/showcase/reports/DailyActionsPage'));
const DailyActionsPageNew = lazy(() => import('./pages/showcase/reports/DailyActionsPageNew'));
const DailyActionsAdvancedPage = lazy(() => import('./pages/showcase/reports/DailyActionsAdvancedPage'));
const PlayersPage = lazy(() => import('./pages/showcase/reports/PlayersPage'));
const GamesPage = lazy(() => import('./pages/showcase/reports/GamesPage'));
const DailyActionGamesPage = lazy(() => import('./pages/reports/DailyActionGamesPage'));
const IntegratedReportsPage = lazy(() => import('./pages/reports/IntegratedReportsPage'));
const FinancialPage = lazy(() => import('./pages/reports/FinancialPage'));
const PerformancePage = lazy(() => import('./pages/reports/PerformancePage'));
const GeographicPage = lazy(() => import('./pages/reports/GeographicPage'));

// Test pages
const ApiTestPage = lazy(() => import('./pages/ApiTestPage'));
const GridTestPage = lazy(() => import('./pages/test/GridTestPage'));

// Showcase pages
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'));
const CommonComponentsShowcase = lazy(() => import('./pages/showcase/CommonComponentsShowcase'));
const TableComponentsShowcase = lazy(() => import('./pages/showcase/TableComponentsShowcase'));
const ReportComponentsShowcase = lazy(() => import('./pages/showcase/ReportComponentsShowcase'));
const DashboardComponentsShowcase = lazy(() => import('./pages/showcase/DashboardComponentsShowcase'));
const VisualizationComponentsShowcase = lazy(() => import('./pages/showcase/VisualizationComponentsShowcase'));
const AuthComponentsShowcase = lazy(() => import('./pages/showcase/AuthComponentsShowcase'));
const NotificationComponentsShowcase = lazy(() => import('./pages/showcase/NotificationComponentsShowcase'));
const SettingsComponentsShowcase = lazy(() => import('./pages/showcase/SettingsComponentsShowcase'));
const TealDashboardShowcase = lazy(() => import('./pages/showcase/TealDashboardShowcase'));
const FlatModernUIShowcase = lazy(() => import('./pages/showcase/FlatModernUIShowcase'));
const FlatModernStyleExample = lazy(() => import('./pages/showcase/FlatModernStyleExample'));

// Using flatModernTheme imported above

const App: React.FC = () => {
  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <ThemeProvider theme={flatModernTheme}>
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
                  <Route path="/reports/daily-actions/new" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DailyActionsPageNew />
                    </Suspense>
                  } />
                  <Route path="/reports/daily-actions/advanced" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DailyActionsAdvancedPage />
                    </Suspense>
                  } />
                  <Route path="/reports/players" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PlayersPage />
                    </Suspense>
                  } />
                  <Route path="/reports/players/advanced" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />
                  <Route path="/reports/games" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <GamesPage />
                    </Suspense>
                  } />
                  <Route path="/reports/games/advanced" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleDashboard />
                    </Suspense>
                  } />
                  <Route path="/reports/daily-action-games" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DailyActionGamesPage />
                    </Suspense>
                  } />
                  <Route path="/reports/integrated" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <IntegratedReportsPage />
                    </Suspense>
                  } />
                  <Route path="/reports/financial" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <FinancialPage />
                    </Suspense>
                  } />
                  <Route path="/reports/performance" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <PerformancePage />
                    </Suspense>
                  } />
                  <Route path="/reports/geographic" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <GeographicPage />
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
                      <AnalyticsPage />
                    </Suspense>
                  } />
                  <Route path="/analytics/advanced" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AdvancedAnalyticsPage />
                    </Suspense>
                  } />
                  <Route path="/analytics/*" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AnalyticsPage />
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

              {/* Public test routes */}
              <Route path="/api-test" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ApiTestPage />
                </Suspense>
              } />
              <Route path="/grid-test" element={
                <Suspense fallback={<LoadingFallback />}>
                  <GridTestPage />
                </Suspense>
              } />
              <Route path="/direct-grid-test" element={<DirectGridTestPage />} />
              <Route path="/custom-grid-test" element={<CustomGridTestPage />} />
              <Route path="/safe-grid-test" element={<SafeGridTestPage />} />

              {/* Component Showcase */}
              <Route path="/showcase" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ComponentShowcase />
                </Suspense>
              } />
              <Route path="/showcase/common" element={
                <Suspense fallback={<LoadingFallback />}>
                  <CommonComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/tables" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TableComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/reports" element={
                <Suspense fallback={<LoadingFallback />}>
                  <ReportComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/dashboard" element={
                <Suspense fallback={<LoadingFallback />}>
                  <DashboardComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/visualization" element={
                <Suspense fallback={<LoadingFallback />}>
                  <VisualizationComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/auth" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AuthComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/notification" element={
                <Suspense fallback={<LoadingFallback />}>
                  <NotificationComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/settings" element={
                <Suspense fallback={<LoadingFallback />}>
                  <SettingsComponentsShowcase />
                </Suspense>
              } />
              <Route path="/showcase/teal-dashboard" element={
                <Suspense fallback={<LoadingFallback />}>
                  <TealDashboardShowcase />
                </Suspense>
              } />
              <Route path="/showcase/flat-modern-ui" element={
                <Suspense fallback={<LoadingFallback />}>
                  <FlatModernUIShowcase />
                </Suspense>
              } />
              <Route path="/showcase/flat-modern-style-example" element={
                <Suspense fallback={<LoadingFallback />}>
                  <FlatModernStyleExample />
                </Suspense>
              } />

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
};

export default App;
