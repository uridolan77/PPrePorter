import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../types/redux';

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  darkMode: false,
  activeTab: 0,
  notifications: [],
  userPreferences: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  }
};

// Create the slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      state.userPreferences.theme = state.darkMode ? 'dark' : 'light';
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      state.userPreferences.theme = action.payload ? 'dark' : 'light';
    },
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<UIState['userPreferences']>>) => {
      state.userPreferences = {
        ...state.userPreferences,
        ...action.payload
      };
    }
  }
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  setActiveTab,
  addNotification,
  removeNotification,
  clearNotifications,
  updateUserPreferences
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;
