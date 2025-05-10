import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import {
  NaturalLanguageState,
  QueryResult,
  ExtractedEntities
} from '../../types/naturalLanguage';
import { RootState } from '../../types/store';

/**
 * Clarification prompt interface
 */
interface ClarificationPrompt {
  /**
   * Prompt ID
   */
  id: string;

  /**
   * Prompt question
   */
  question: string;

  /**
   * Prompt options
   */
  options?: string[];

  /**
   * Prompt type
   */
  type: string;
}

/**
 * Clarification response interface
 */
interface ClarificationResponse {
  /**
   * Whether clarification is needed
   */
  needsClarification: boolean;

  /**
   * Clarification prompts
   */
  clarificationPrompts?: ClarificationPrompt[];

  /**
   * Original entities
   */
  originalEntities?: ExtractedEntities;

  /**
   * Query result
   */
  queryResult?: QueryResult;
}

/**
 * Clarification request interface
 */
interface ClarificationRequest {
  /**
   * Original query
   */
  originalQuery: string;

  /**
   * Original entities
   */
  originalEntities: ExtractedEntities;

  /**
   * Clarification responses
   */
  clarificationResponses: Record<string, string>;
}

/**
 * Recent query interface
 */
interface RecentQuery {
  /**
   * Query text
   */
  query: string;

  /**
   * Query timestamp
   */
  timestamp: string;
}

// Async thunks for API interaction
export const processNaturalLanguageQuery = createAsyncThunk<
  QueryResult | ClarificationResponse,
  string,
  { rejectValue: string }
>(
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
      const err = error as AxiosError;
      return rejectWithValue(
        (err.response?.data as any)?.error || 'Failed to process query'
      );
    }
  }
);

export const applyClarification = createAsyncThunk<
  QueryResult | ClarificationResponse,
  ClarificationRequest,
  { rejectValue: string }
>(
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
      const err = error as AxiosError;
      return rejectWithValue(
        (err.response?.data as any)?.error || 'Failed to process clarification'
      );
    }
  }
);

/**
 * Extended natural language state
 */
interface ExtendedNaturalLanguageState extends NaturalLanguageState {
  /**
   * Whether clarification is needed
   */
  clarificationNeeded: boolean;

  /**
   * Clarification prompts
   */
  clarificationPrompts: ClarificationPrompt[];

  /**
   * Original entities
   */
  originalEntities: ExtractedEntities | null;

  /**
   * Recent queries
   */
  recentQueries: RecentQuery[];

  /**
   * Maximum number of queries to store in history
   */
  maxQueryHistory: number;
}

const initialState: ExtendedNaturalLanguageState = {
  queryText: '',
  queryResult: null,
  clarificationNeeded: false,
  clarificationPrompts: [],
  originalEntities: null,
  isProcessing: false,
  error: null,
  recentQueries: [],
  queryHistory: [],
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
    saveQueryToHistory: (state, action: PayloadAction<{ query: string }>) => {
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

      // Also update queryHistory for compatibility
      if (!state.queryHistory.includes(action.payload.query)) {
        state.queryHistory = [
          action.payload.query,
          ...state.queryHistory
        ].slice(0, state.maxQueryHistory);
      }
    },
    clearQueryHistory: (state) => {
      state.recentQueries = [];
      state.queryHistory = [];
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
          state.queryText = action.meta.arg;
          state.recentQueries = [
            {
              query: action.meta.arg,
              timestamp: new Date().toISOString()
            },
            ...state.recentQueries
          ].slice(0, state.maxQueryHistory);

          // Also update queryHistory for compatibility
          if (!state.queryHistory.includes(action.meta.arg)) {
            state.queryHistory = [
              action.meta.arg,
              ...state.queryHistory
            ].slice(0, state.maxQueryHistory);
          }
        }

        const payload = action.payload as (QueryResult | ClarificationResponse);

        // Check if clarification is needed
        if ('needsClarification' in payload && payload.needsClarification) {
          state.clarificationNeeded = true;
          state.clarificationPrompts = payload.clarificationPrompts || [];
          state.originalEntities = payload.originalEntities || null;
        } else {
          // Store the results
          state.queryResult = payload as QueryResult;
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

        const payload = action.payload as (QueryResult | ClarificationResponse);

        // Check if additional clarification is needed
        if ('needsClarification' in payload && payload.needsClarification) {
          state.clarificationNeeded = true;
          state.clarificationPrompts = payload.clarificationPrompts || [];
          state.originalEntities = payload.originalEntities || null;
        } else {
          // Store the results and clear clarification state
          state.queryResult = payload as QueryResult;
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

// Selector
export const selectNaturalLanguage = (state: RootState): ExtendedNaturalLanguageState => state.naturalLanguage;

export default naturalLanguageSlice.reducer;
