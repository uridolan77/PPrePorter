import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './store/store';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FEATURES } from './config/constants';
import { preloadCriticalComponents } from './utils/preloadComponents';

// Initialize mock data flag for UI testing
// This ensures the flag is set when the application starts
localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'false');
console.log('Mock data mode is disabled, using real API calls');

// Preload mock data service to ensure it's initialized
if (FEATURES.USE_MOCK_DATA_FOR_UI_TESTING) {
  console.log('Preloading mock data service...');
  import('./mockData').then(module => {
    console.log('Mock data service preloaded successfully');
    // Store the mock data service in window for debugging
    window.mockDataService = module.default;
  }).catch(error => {
    console.error('Failed to preload mock data service:', error);
  });
}

// Preload critical components to avoid chunk loading errors
console.log('Preloading critical components...');
preloadCriticalComponents().catch(error => {
  console.error('Error preloading critical components:', error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
