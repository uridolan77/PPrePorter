/**
 * Utility functions for toggling between real API and mock data mode
 */

// Local storage key for mock data flag
const MOCK_DATA_FLAG = 'USE_MOCK_DATA_FOR_UI_TESTING';

/**
 * Check if mock data mode is enabled
 * @returns {boolean} True if mock data mode is enabled
 */
export const isMockDataEnabled = () => {
  const value = localStorage.getItem(MOCK_DATA_FLAG);
  return value === 'true';
};

/**
 * Enable mock data mode
 */
export const enableMockData = () => {
  localStorage.setItem(MOCK_DATA_FLAG, 'true');
  console.log('Mock data mode enabled');
};

/**
 * Disable mock data mode
 */
export const disableMockData = () => {
  localStorage.setItem(MOCK_DATA_FLAG, 'false');
  console.log('Mock data mode disabled');
};

/**
 * Toggle mock data mode
 * @returns {boolean} New state of mock data mode
 */
export const toggleMockData = () => {
  const newState = !isMockDataEnabled();
  
  if (newState) {
    enableMockData();
  } else {
    disableMockData();
  }
  
  return newState;
};
