import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Loading component for suspense fallback
export const LoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, width: '100%' }}>
    <CircularProgress />
  </Box>
);

// Lazy load settings components
export const LazyProfileSettings = lazy(() => import('./ProfileSettings'));
export const LazyAccountSettings = lazy(() => import('./AccountSettings'));
export const LazyNotificationSettings = lazy(() => import('./NotificationSettings'));
export const LazyAppearanceSettings = lazy(() => import('./AppearanceSettings'));
export const LazySecuritySettings = lazy(() => import('./SecuritySettings'));
export const LazyApiSettings = lazy(() => import('./ApiSettings'));
export const LazyIntegrationSettings = lazy(() => import('./IntegrationSettings'));

// Wrapper components with Suspense
export const ProfileSettings: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyProfileSettings {...props} />
  </Suspense>
);

export const AccountSettings: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAccountSettings {...props} />
  </Suspense>
);

export const NotificationSettings: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyNotificationSettings {...props} />
  </Suspense>
);

export const AppearanceSettings: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAppearanceSettings {...props} />
  </Suspense>
);

export const SecuritySettings: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazySecuritySettings {...props} />
  </Suspense>
);

export const ApiSettings: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyApiSettings {...props} />
  </Suspense>
);

export const IntegrationSettings: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyIntegrationSettings {...props} />
  </Suspense>
);
