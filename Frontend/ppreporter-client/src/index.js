import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Initialize mock data flag for UI testing
// This ensures the flag is set when the application starts
localStorage.setItem('USE_MOCK_DATA_FOR_UI_TESTING', 'true');
console.log('Mock data mode is enabled for UI testing');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
