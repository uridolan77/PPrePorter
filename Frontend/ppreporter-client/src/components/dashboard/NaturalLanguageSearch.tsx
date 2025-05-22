import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Divider,
  Tooltip,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useSelector, useDispatch } from 'react-redux';
import {
  processNaturalLanguageQuery,
  applyClarification,
  saveQueryToHistory,
  clearNlpError,
  selectNaturalLanguage
} from '../../store/slices/naturalLanguageSlice';
import { AppDispatch } from '../../store/store';
import { QueryResult, ExtractedEntities, ClarificationPrompt } from '../../types/naturalLanguage';
import { CommonProps } from '../../types/common';

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

/**
 * Clarification responses
 */
type ClarificationResponses = Record<string, string>;

export interface NaturalLanguageSearchProps extends CommonProps {
  /**
   * Callback when results are received
   */
  onResultsReceived: (results: QueryResult) => void;

  /**
   * Whether to show example queries
   */
  showExamples?: boolean;

  /**
   * Whether to use full width
   */
  fullWidth?: boolean;
}

/**
 * NaturalLanguageSearch component provides a search interface for natural language queries
 * Allows users to ask questions about their data in plain English
 */
const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({
  onResultsReceived,
  showExamples = true,
  fullWidth = true,
  sx
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const {
    queryResult,
    clarificationNeeded,
    clarificationPrompts,
    originalEntities,
    isProcessing,
    error,
    recentQueries
  } = useSelector(selectNaturalLanguage);

  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showQueryHistory, setShowQueryHistory] = useState<boolean>(false);
  const [showExampleQueries, setShowExampleQueries] = useState<boolean>(false);
  const [clarificationResponses, setClarificationResponses] = useState<ClarificationResponses>({});

  const exampleQueries: string[] = [
    "Show me the top 10 games by revenue for UK players over the last month",
    "What was our GGR by country last quarter?",
    "Compare deposits vs withdrawals by payment method this year",
    "Show me retention rates for mobile players segmented by game type",
    "Which white labels had the highest player growth in the last 30 days?"
  ];

  useEffect(() => {
    if (queryResult && !clarificationNeeded && !isProcessing) {
      // Pass results to parent component
      onResultsReceived(queryResult);
    }
  }, [queryResult, clarificationNeeded, isProcessing, onResultsReceived]);

  // Clean up error on unmount
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearNlpError());
      }
    };
  }, [dispatch, error]);

  const handleQuerySubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!query.trim()) return;

    dispatch(processNaturalLanguageQuery(query));

    // Clear any previous clarification responses
    setClarificationResponses({});
  };

  const handleClarificationSubmit = (): void => {
    if (Object.keys(clarificationResponses).length === 0 || !originalEntities) return;

    dispatch(applyClarification({
      originalQuery: query,
      originalEntities,
      clarificationResponses
    }));
  };

  const handleClarificationResponse = (promptId: string, value: string): void => {
    setClarificationResponses(prev => ({
      ...prev,
      [promptId]: value
    }));
  };

  const handleListening = (): void => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  const handleQueryHistorySelect = (historicQuery: string): void => {
    setQuery(historicQuery);
    setShowQueryHistory(false);
  };

  const handleExampleSelect = (example: string): void => {
    setQuery(example);
    setShowExampleQueries(false);
  };

  const renderClarificationPrompts = (): React.ReactNode => {
    if (!clarificationPrompts || clarificationPrompts.length === 0) return null;

    return (
      <Paper elevation={3} sx={{ p: 3, mt: 2, bgcolor: theme.palette.background.paper }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Please clarify your query
        </Typography>

        {clarificationPrompts.map((prompt, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {prompt.question}
            </Typography>

            <FormControl component="fieldset">
              <RadioGroup
                value={clarificationResponses[(prompt as any).conflictId || prompt.id] || ''}
                onChange={(e) => handleClarificationResponse((prompt as any).conflictId || prompt.id, e.target.value)}
              >
                {prompt.options?.map((option, i) => (
                  <FormControlLabel
                    key={i}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {index < clarificationPrompts.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}

        <Button
          variant="contained"
          color="primary"
          onClick={handleClarificationSubmit}
          disabled={Object.keys(clarificationResponses).length !== clarificationPrompts.length}
        >
          Submit Clarification
        </Button>
      </Paper>
    );
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', ...sx }}>
      <Paper
        component="form"
        elevation={3}
        onSubmit={handleQuerySubmit}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.shape.borderRadius
        }}
      >
        <SearchIcon sx={{ color: 'action.active', mr: 1 }} />

        <TextField
          fullWidth
          placeholder="Ask a question about your data in plain English..."
          variant="standard"
          value={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          InputProps={{
            disableUnderline: true,
          }}
          sx={{ mr: 1 }}
        />

        {query && (
          <IconButton onClick={() => setQuery('')} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        <Tooltip title="Voice search">
          <IconButton
            onClick={handleListening}
            color={isListening ? 'primary' : 'default'}
            sx={{ ml: 0.5 }}
          >
            <MicIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Query history">
          <IconButton onClick={() => setShowQueryHistory(true)} sx={{ ml: 0.5 }}>
            <HistoryIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Example queries">
          <IconButton onClick={() => setShowExampleQueries(true)} sx={{ ml: 0.5 }}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!query.trim() || isProcessing}
          sx={{ ml: 2 }}
        >
          {isProcessing ? <CircularProgress size={24} /> : 'Search'}
        </Button>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}

      {clarificationNeeded && renderClarificationPrompts()}

      {/* Query History Dialog */}
      <Dialog
        open={showQueryHistory}
        onClose={() => setShowQueryHistory(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Recent Queries
          <IconButton
            aria-label="close"
            onClick={() => setShowQueryHistory(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {recentQueries && recentQueries.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recentQueries.map((historyItem, i) => (
                <Button
                  key={i}
                  variant="outlined"
                  onClick={() => handleQueryHistorySelect(historyItem.query)}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {historyItem.query}
                </Button>
              ))}
            </Box>
          ) : (
            <Typography>No recent queries</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Example Queries Dialog */}
      <Dialog
        open={showExampleQueries}
        onClose={() => setShowExampleQueries(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Example Queries
          <IconButton
            aria-label="close"
            onClick={() => setShowExampleQueries(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Try asking questions like these:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {exampleQueries.map((example, i) => (
              <Button
                key={i}
                variant="outlined"
                onClick={() => handleExampleSelect(example)}
                sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
              >
                {example}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default NaturalLanguageSearch;
