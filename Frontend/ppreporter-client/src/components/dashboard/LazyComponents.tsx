import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Loading component for suspense fallback
export const LoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, width: '100%' }}>
    <CircularProgress />
  </Box>
);

// Lazy load tab components
export const LazyEnhancedOverviewTab = lazy(() => import('./tabs/EnhancedOverviewTab'));
export const LazyPerformanceTab = lazy(() => import('./tabs/PerformanceTab'));
export const LazyPlayersTab = lazy(() => import('./tabs/PlayersTab'));
export const LazyGamesTab = lazy(() => import('./tabs/GamesTab'));

// Lazy load chart components
export const LazyCasinoRevenueChart = lazy(() => import('./CasinoRevenueChart'));
export const LazyPlayerRegistrationsChart = lazy(() => import('./PlayerRegistrationsChart'));
export const LazyTopGamesChart = lazy(() => import('./TopGamesChart'));
export const LazyMultiDimensionalRadarChart = lazy(() => import('./MultiDimensionalRadarChart'));
export const LazyRecentTransactionsTable = lazy(() => import('./RecentTransactionsTable'));

// Lazy load dashboard components
export const LazyDashboardTabs = lazy(() => import('./DashboardTabs'));
export const LazyAdaptiveDashboard = lazy(() => import('./AdaptiveDashboard'));
export const LazyContextualDataExplorer = lazy(() => import('./ContextualDataExplorer'));

// Wrapper components with Suspense
export const EnhancedOverviewTab: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyEnhancedOverviewTab {...props} />
  </Suspense>
);

export const PerformanceTab: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPerformanceTab {...props} />
  </Suspense>
);

export const PlayersTab: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPlayersTab {...props} />
  </Suspense>
);

export const GamesTab: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyGamesTab {...props} />
  </Suspense>
);

export const CasinoRevenueChart: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyCasinoRevenueChart {...props} />
  </Suspense>
);

export const PlayerRegistrationsChart: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPlayerRegistrationsChart {...props} />
  </Suspense>
);

export const TopGamesChart: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyTopGamesChart {...props} />
  </Suspense>
);

export const MultiDimensionalRadarChart: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyMultiDimensionalRadarChart {...props} />
  </Suspense>
);

export const RecentTransactionsTable: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyRecentTransactionsTable {...props} />
  </Suspense>
);

export const DashboardTabs: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDashboardTabs {...props} />
  </Suspense>
);

export const AdaptiveDashboard: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAdaptiveDashboard {...props} />
  </Suspense>
);

export const ContextualDataExplorer: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyContextualDataExplorer {...props} />
  </Suspense>
);
