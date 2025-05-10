/**
 * Utility functions for toggling between mock data and real API calls
 */

/**
 * Check if mock data mode is enabled
 * @returns {boolean} True if mock data mode is enabled
 */
export const isMockDataEnabled = (): boolean => {
  return localStorage.getItem('USE_MOCK_DATA_FOR_UI_TESTING') === 'true';
};

/**
 * Enable mock data mode
 */
export const enableMockData = (): void => {
  localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'true');
  console.log('Mock data mode enabled');
  // Reload the page to apply the change
  window.location.reload();
};

/**
 * Disable mock data mode
 */
export const disableMockData = (): void => {
  localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'false');
  console.log('Mock data mode disabled');
  // Reload the page to apply the change
  window.location.reload();
};

/**
 * Toggle mock data mode
 * @returns {boolean} The new state of mock data mode
 */
export const toggleMockData = (): boolean => {
  const currentState = isMockDataEnabled();
  const newState = !currentState;
  
  localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', newState ? 'true' : 'false');
  console.log(`Mock data mode ${newState ? 'enabled' : 'disabled'}`);
  
  // Reload the page to apply the change
  window.location.reload();
  
  return newState;
};

export default {
  isMockDataEnabled,
  enableMockData,
  disableMockData,
  toggleMockData
};
