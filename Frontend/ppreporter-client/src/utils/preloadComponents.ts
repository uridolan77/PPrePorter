/**
 * Utility to preload Material-UI components that might cause chunk loading errors
 */

// Preload the Grid component
export const preloadGridComponent = async (): Promise<void> => {
  try {
    // Import the Grid component to ensure it's loaded
    await import('@mui/material/Grid');
    console.log('Grid component preloaded successfully');
  } catch (error) {
    console.error('Failed to preload Grid component:', error);
  }
};

// Preload all critical components
export const preloadCriticalComponents = async (): Promise<void> => {
  await Promise.all([
    preloadGridComponent(),
    // Add other components that need preloading here
  ]);
  console.log('All critical components preloaded');
};

export default {
  preloadGridComponent,
  preloadCriticalComponents,
};
