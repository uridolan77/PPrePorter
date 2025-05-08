import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for API interaction
export const processNaturalLanguageQuery = createAsyncThunk(
  'naturalLanguage/processQuery',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/NaturalLanguage/query', JSON.stringify(query), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to process query');
    }
  }
);

export const applyClarification = createAsyncThunk(
  'naturalLanguage/applyClarification',
  async (clarificationRequest, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/NaturalLanguage/clarify', clarificationRequest, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to process clarification');
    }
  }
);

const initialState = {
  queryResult: null,
  clarificationNeeded: false,
  clarificationPrompts: [],
  originalEntities: null,
  isProcessing: false,
  error: null,
  recentQueries: [],
  // Maximum number of queries to store in history
  maxQueryHistory: 10
};

export const naturalLanguageSlice = createSlice({
  name: 'naturalLanguage',
  initialState,
  reducers: {
    clearNlpError: (state) => {
      state.error = null;
    },
    saveQueryToHistory: (state, action) => {
      // Check if query already exists in history
      const queryExists = state.recentQueries.some(item => 
        item.query === action.payload.query
      );
      
      // If it doesn't exist, add it to the beginning of the array
      if (!queryExists) {
        state.recentQueries = [
          { 
            query: action.payload.query, 
            timestamp: new Date().toISOString() 
          },
          ...state.recentQueries
        ].slice(0, state.maxQueryHistory); // Keep only the most recent queries
      }
    },
    clearQueryHistory: (state) => {
      state.recentQueries = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Process Query
      .addCase(processNaturalLanguageQuery.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.queryResult = null;
        state.clarificationNeeded = false;
        state.clarificationPrompts = [];
      })
      .addCase(processNaturalLanguageQuery.fulfilled, (state, action) => {
        state.isProcessing = false;
        
        // Save query to history
        if (action.meta.arg) {
          state.recentQueries = [
            { 
              query: action.meta.arg, 
              timestamp: new Date().toISOString() 
            },
            ...state.recentQueries
          ].slice(0, state.maxQueryHistory);
        }
        
        // Check if clarification is needed
        if (action.payload.needsClarification) {
          state.clarificationNeeded = true;
          state.clarificationPrompts = action.payload.clarificationPrompts;
          state.originalEntities = action.payload.originalEntities;
        } else {
          // Store the results
          state.queryResult = action.payload;
        }
      })
      .addCase(processNaturalLanguageQuery.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'An error occurred while processing your query';
      })
      
      // Apply Clarification
      .addCase(applyClarification.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(applyClarification.fulfilled, (state, action) => {
        state.isProcessing = false;
        
        // Check if additional clarification is needed
        if (action.payload.needsClarification) {
          state.clarificationNeeded = true;
          state.clarificationPrompts = action.payload.clarificationPrompts;
          state.originalEntities = action.payload.originalEntities;
        } else {
          // Store the results and clear clarification state
          state.queryResult = action.payload;
          state.clarificationNeeded = false;
          state.clarificationPrompts = [];
          state.originalEntities = null;
        }
      })
      .addCase(applyClarification.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload || 'An error occurred while processing clarification';
      });
  }
});

export const { 
  clearNlpError, 
  saveQueryToHistory, 
  clearQueryHistory 
} = naturalLanguageSlice.actions;

export default naturalLanguageSlice.reducer;