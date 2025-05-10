import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './store/store';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { FEATURES } from './config/constants';

// Initialize mock data flag for UI testing
// This ensures the flag is set when the application starts
localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'true');
console.log('Mock data mode is enabled for UI testing');

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
