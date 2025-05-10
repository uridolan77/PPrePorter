import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Loading component for suspense fallback
export const LoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, width: '100%' }}>
    <CircularProgress />
  </Box>
);

// Lazy load report components
export const LazyDailyActionsTable = lazy(() => import('./DailyActionsTable'));
export const LazyDailyActionsChart = lazy(() => import('./DailyActionsChart'));
export const LazyDailyActionsFilter = lazy(() => import('./DailyActionsFilter'));
export const LazyDailyActionsSummary = lazy(() => import('./DailyActionsSummary'));
export const LazyDailyActionsExport = lazy(() => import('./DailyActionsExport'));

// Lazy load player report components
export const LazyPlayerTable = lazy(() => import('./PlayerTable'));
export const LazyPlayerDetails = lazy(() => import('./PlayerDetails'));
export const LazyPlayerActivity = lazy(() => import('./PlayerActivity'));
export const LazyPlayerFilter = lazy(() => import('./PlayerFilter'));

// Wrapper components with Suspense
export const DailyActionsTable: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDailyActionsTable {...props} />
  </Suspense>
);

export const DailyActionsChart: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDailyActionsChart {...props} />
  </Suspense>
);

export const DailyActionsFilter: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDailyActionsFilter {...props} />
  </Suspense>
);

export const DailyActionsSummary: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDailyActionsSummary {...props} />
  </Suspense>
);

export const DailyActionsExport: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDailyActionsExport {...props} />
  </Suspense>
);

export const PlayerTable: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPlayerTable {...props} />
  </Suspense>
);

export const PlayerDetails: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPlayerDetails {...props} />
  </Suspense>
);

export const PlayerActivity: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPlayerActivity {...props} />
  </Suspense>
);

export const PlayerFilter: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPlayerFilter {...props} />
  </Suspense>
);
