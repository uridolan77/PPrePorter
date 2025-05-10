import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import HistoryIcon from '@mui/icons-material/History';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { CommonProps } from '../../types/common';
import { AppDispatch, AppState } from '../../store/store';

interface NaturalLanguageQueryProps extends CommonProps {
  onQuerySubmit?: (query: string) => void;
  onClearHistory?: () => void;
  suggestedQueries?: string[];
  queryHistory?: Array<{ id: string; query: string; timestamp: string }>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Natural Language Query component
 * Allows users to query data using natural language
 */
const NaturalLanguageQuery: React.FC<NaturalLanguageQueryProps> = ({
  onQuerySubmit,
  onClearHistory,
  suggestedQueries = [
    'Show me revenue by game for the last 7 days',
    'How many new players registered yesterday?',
    'What are the top 5 games by revenue this month?',
    'Compare player registrations between this month and last month'
  ],
  queryHistory = [],
  isLoading = false,
  error = null,
  sx
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition if available
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
  };

  const handleQuerySubmit = (): void => {
    if (query.trim() && onQuerySubmit) {
      onQuerySubmit(query.trim());
    }
  };

  const handleVoiceInput = (): void => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.abort();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleSuggestedQuery = (suggestedQuery: string): void => {
    setQuery(suggestedQuery);
    if (onQuerySubmit) {
      onQuerySubmit(suggestedQuery);
    }
  };

  const handleHistoryQuery = (historyQuery: string): void => {
    setQuery(historyQuery);
    if (onQuerySubmit) {
      onQuerySubmit(historyQuery);
    }
  };

  const handleClearHistory = (): void => {
    if (onClearHistory) {
      onClearHistory();
    }
  };

  return (
    <Box sx={{ ...sx }}>
      <Typography variant="h6" gutterBottom>
        Natural Language Query
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <TextField
            fullWidth
            label="Ask a question about your data"
            variant="outlined"
            value={query}
            onChange={handleQueryChange}
            onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
            disabled={isLoading}
            multiline
            maxRows={3}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleQuerySubmit}
            disabled={isLoading || !query.trim()}
            startIcon={isLoading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ ml: 1, height: '56px' }}
          >
            {isLoading ? 'Processing...' : 'Send'}
          </Button>
          <Button
            variant="outlined"
            color={isListening ? 'secondary' : 'primary'}
            onClick={handleVoiceInput}
            sx={{ ml: 1, minWidth: '56px', height: '56px', p: 0 }}
          >
            <MicIcon />
          </Button>
        </Box>
        
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {/* Suggested Queries */}
        <Box sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 1
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Suggested Queries
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={showSuggestions}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestedQueries.map((suggestedQuery, index) => (
                <Chip
                  key={index}
                  label={suggestedQuery}
                  onClick={() => handleSuggestedQuery(suggestedQuery)}
                  clickable
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
        
        {/* Query History */}
        {queryHistory.length > 0 && (
          <Box>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Recent Queries
              </Typography>
              <Box>
                <IconButton 
                  size="small" 
                  onClick={() => setShowHistory(!showHistory)}
                  sx={{ mr: 1 }}
                >
                  {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <Tooltip title="Clear history">
                  <IconButton 
                    size="small" 
                    onClick={handleClearHistory}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Collapse in={showHistory}>
              <List dense>
                {queryHistory.map((item) => (
                  <ListItem 
                    key={item.id}
                    button
                    onClick={() => handleHistoryQuery(item.query)}
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.query}
                      secondary={new Date(item.timestamp).toLocaleString()}
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        noWrap: true
                      }}
                      secondaryTypographyProps={{ 
                        variant: 'caption',
                        noWrap: true
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default NaturalLanguageQuery;
