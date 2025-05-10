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
export const LazyAdvancedRadarChart = lazy(() => import('./AdvancedRadarChart'));
export const LazyRecentTransactionsTable = lazy(() => import('./RecentTransactionsTable'));
export const LazyParallelCoordinatesPlot = lazy(() => import('./ParallelCoordinatesPlot'));
export const LazyMultiVariableHeatmap = lazy(() => import('./MultiVariableHeatmap'));
export const LazyPlayerJourneySankey = lazy(() => import('./PlayerJourneySankey'));
export const LazyMicroCharts = lazy(() => import('./MicroCharts'));
export const LazyEnhancedDataTable = lazy(() => import('./EnhancedDataTable'));

// Lazy load dashboard components
export const LazyDashboardTabs = lazy(() => import('./DashboardTabs'));
export const LazyAdaptiveDashboard = lazy(() => import('./AdaptiveDashboard'));
export const LazyDashboardPreferences = lazy(() => import('./DashboardPreferences'));
export const LazyAdvancedDashboardHeader = lazy(() => import('./AdvancedDashboardHeader'));
export const LazyContextualDataExplorer = lazy(() => import('./ContextualDataExplorer'));

// Lazy load analysis and insight components
export const LazyTrendAnalysis = lazy(() => import('./TrendAnalysis'));
export const LazyMetricExplanation = lazy(() => import('./MetricExplanation'));
export const LazyContextualExplanation = lazy(() => import('./ContextualExplanation'));
export const LazyInteractiveDrillDownExplorer = lazy(() => import('./InteractiveDrillDownExplorer'));
export const LazyWhatIfScenarioModeler = lazy(() => import('./WhatIfScenarioModeler'));
export const LazySegmentComparisonGrid = lazy(() => import('./SegmentComparisonGrid'));
export const LazyDataAnnotation = lazy(() => import('./DataAnnotation'));
export const LazyInsightPanel = lazy(() => import('./InsightPanel'));

// Lazy load natural language and AI components
export const LazyNaturalLanguageSearch = lazy(() => import('./NaturalLanguageSearch'));
export const LazyNaturalLanguageResults = lazy(() => import('./NaturalLanguageResults'));
export const LazyNaturalLanguageQuery = lazy(() => import('./NaturalLanguageQuery'));

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

// Advanced chart components wrappers
export const AdvancedRadarChart: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAdvancedRadarChart {...props} />
  </Suspense>
);

export const ParallelCoordinatesPlot: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyParallelCoordinatesPlot {...props} />
  </Suspense>
);

export const MultiVariableHeatmap: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyMultiVariableHeatmap {...props} />
  </Suspense>
);

export const PlayerJourneySankey: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyPlayerJourneySankey {...props} />
  </Suspense>
);

export const MicroCharts: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyMicroCharts {...props} />
  </Suspense>
);

export const EnhancedDataTable: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyEnhancedDataTable {...props} />
  </Suspense>
);

// Dashboard components wrappers
export const DashboardPreferences: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDashboardPreferences {...props} />
  </Suspense>
);

export const AdvancedDashboardHeader: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyAdvancedDashboardHeader {...props} />
  </Suspense>
);

// Analysis and insight components wrappers
export const TrendAnalysis: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyTrendAnalysis {...props} />
  </Suspense>
);

export const MetricExplanation: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyMetricExplanation {...props} />
  </Suspense>
);

export const ContextualExplanation: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyContextualExplanation {...props} />
  </Suspense>
);

export const InteractiveDrillDownExplorer: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyInteractiveDrillDownExplorer {...props} />
  </Suspense>
);

export const WhatIfScenarioModeler: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyWhatIfScenarioModeler {...props} />
  </Suspense>
);

export const SegmentComparisonGrid: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazySegmentComparisonGrid {...props} />
  </Suspense>
);

export const DataAnnotation: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyDataAnnotation {...props} />
  </Suspense>
);

export const InsightPanel: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyInsightPanel {...props} />
  </Suspense>
);

// Natural language and AI components wrappers
export const NaturalLanguageSearch: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyNaturalLanguageSearch {...props} />
  </Suspense>
);

export const NaturalLanguageResults: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyNaturalLanguageResults {...props} />
  </Suspense>
);

export const NaturalLanguageQuery: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyNaturalLanguageQuery {...props} />
  </Suspense>
);
