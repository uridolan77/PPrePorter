import { createSlice, createEntityAdapter, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Player, Game, Transaction, EntitiesState } from '../../types/redux';
import { RootState } from '../store';
import api from '../../services/api';

// Create entity adapters
const playersAdapter = createEntityAdapter<Player>({
  selectId: (player) => player.id,
  sortComparer: (a, b) => a.username.localeCompare(b.username)
});

const gamesAdapter = createEntityAdapter<Game>({
  selectId: (game) => game.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const transactionsAdapter = createEntityAdapter<Transaction>({
  selectId: (transaction) => transaction.id,
  sortComparer: (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
});

// Initial state
const initialState: EntitiesState = {
  players: playersAdapter.getInitialState(),
  games: gamesAdapter.getInitialState(),
  transactions: transactionsAdapter.getInitialState(),
  loading: {
    players: false,
    games: false,
    transactions: false
  },
  errors: {
    players: null,
    games: null,
    transactions: null
  }
};

// Async thunks
export const fetchPlayers = createAsyncThunk(
  'entities/fetchPlayers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/players');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGames = createAsyncThunk(
  'entities/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/games');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'entities/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/transactions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the slice
const entitiesSlice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors.players = null;
      state.errors.games = null;
      state.errors.transactions = null;
    },
    addPlayer: (state, action: PayloadAction<Player>) => {
      playersAdapter.addOne(state.players, action.payload);
    },
    updatePlayer: (state, action: PayloadAction<Player>) => {
      playersAdapter.updateOne(state.players, {
        id: action.payload.id,
        changes: action.payload
      });
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      playersAdapter.removeOne(state.players, action.payload);
    },
    addGame: (state, action: PayloadAction<Game>) => {
      gamesAdapter.addOne(state.games, action.payload);
    },
    updateGame: (state, action: PayloadAction<Game>) => {
      gamesAdapter.updateOne(state.games, {
        id: action.payload.id,
        changes: action.payload
      });
    },
    removeGame: (state, action: PayloadAction<string>) => {
      gamesAdapter.removeOne(state.games, action.payload);
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      transactionsAdapter.addOne(state.transactions, action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      transactionsAdapter.updateOne(state.transactions, {
        id: action.payload.id,
        changes: action.payload
      });
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      transactionsAdapter.removeOne(state.transactions, action.payload);
    }
  },
  extraReducers: (builder) => {
    // Players
    builder
      .addCase(fetchPlayers.pending, (state) => {
        state.loading.players = true;
        state.errors.players = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.loading.players = false;
        playersAdapter.setAll(state.players, action.payload);
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        state.loading.players = false;
        state.errors.players = action.payload as Error;
      });

    // Games
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading.games = true;
        state.errors.games = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading.games = false;
        gamesAdapter.setAll(state.games, action.payload);
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading.games = false;
        state.errors.games = action.payload as Error;
      });

    // Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading.transactions = true;
        state.errors.transactions = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false;
        transactionsAdapter.setAll(state.transactions, action.payload);
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading.transactions = false;
        state.errors.transactions = action.payload as Error;
      });
  }
});

// Export actions
export const {
  clearErrors,
  addPlayer,
  updatePlayer,
  removePlayer,
  addGame,
  updateGame,
  removeGame,
  addTransaction,
  updateTransaction,
  removeTransaction
} = entitiesSlice.actions;

// Export selectors
export const {
  selectAll: selectAllPlayers,
  selectById: selectPlayerById,
  selectIds: selectPlayerIds
} = playersAdapter.getSelectors<RootState>((state) => state.entities.players);

export const {
  selectAll: selectAllGames,
  selectById: selectGameById,
  selectIds: selectGameIds
} = gamesAdapter.getSelectors<RootState>((state) => state.entities.games);

export const {
  selectAll: selectAllTransactions,
  selectById: selectTransactionById,
  selectIds: selectTransactionIds
} = transactionsAdapter.getSelectors<RootState>((state) => state.entities.transactions);

// Export reducer
export default entitiesSlice.reducer;
