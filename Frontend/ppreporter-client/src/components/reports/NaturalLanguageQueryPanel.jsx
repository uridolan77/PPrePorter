import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Alert,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ClearIcon from '@mui/icons-material/Clear';
import MicIcon from '@mui/icons-material/Mic';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

/**
 * NaturalLanguageQueryPanel component for enabling natural language queries for reports
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Function called when a search is executed
 * @param {Function} props.onSaveQuery - Function called when a query is saved
 * @param {Array} props.recentQueries - List of recent queries
 * @param {Array} props.savedQueries - List of saved queries
 * @param {boolean} props.loading - Whether a query is currently being processed
 * @param {string} props.error - Error message to display
 * @param {boolean} props.showSuggestions - Whether to show query suggestions
 * @param {Array} props.suggestions - List of query suggestions
 * @param {Function} props.onApplySuggestion - Function called when a suggestion is applied
 */
const NaturalLanguageQueryPanel = ({
  onSearch,
  onSaveQuery,
  recentQueries = [],
  savedQueries = [],
  loading = false,
  error = null,
  showSuggestions = true,
  suggestions = [],
  onApplySuggestion
}) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Set up speech recognition if available
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearQuery = () => {
    setQuery('');
  };

  const handleToggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleSelectQuery = (selectedQuery) => {
    setQuery(selectedQuery);
  };

  const handleSaveQuery = () => {
    if (query.trim() && onSaveQuery) {
      onSaveQuery(query.trim());
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const isSaved = (queryText) => {
    return savedQueries.some(saved => saved.text === queryText);
  };

  // Example query suggestions based on report context
  const defaultSuggestions = [
    "Show me total revenue by month for the last quarter",
    "What are the top 5 performing products?",
    "Compare conversion rates between desktop and mobile",
    "Show user growth trend over the past year",
    "Identify customers with declining activity"
  ];

  const queryExamples = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 1 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1, display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
          Ask a question about your data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use natural language to query your data. For example, "Show me sales by region for Q1"
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask a question about your data..."
            value={query}
            onChange={handleQueryChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex' }}>
                  {query && (
                    <IconButton size="small" onClick={handleClearQuery} edge="end">
                      <ClearIcon />
                    </IconButton>
                  )}
                  {recognition && (
                    <Tooltip title={isListening ? "Stop listening" : "Voice search"}>
                      <IconButton 
                        size="small" 
                        onClick={toggleSpeechRecognition} 
                        color={isListening ? "primary" : "default"}
                        edge="end"
                      >
                        <MicIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              ),
            }}
            sx={{ mr: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? 'Processing' : 'Search'}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', mt: 1, alignItems: 'center' }}>
          <Tooltip title="View search history">
            <IconButton size="small" onClick={handleToggleHistory}>
              {showHistory ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              <HistoryIcon fontSize="small" sx={{ ml: 0.5 }} />
            </IconButton>
          </Tooltip>
          
          {query.trim() && (
            <Tooltip title={isSaved(query.trim()) ? "Query already saved" : "Save this query"}>
              <IconButton 
                size="small" 
                onClick={handleSaveQuery} 
                disabled={isSaved(query.trim()) || !query.trim()}
              >
                {isSaved(query.trim()) ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          {error && (
            <Typography variant="caption" color="error" sx={{ ml: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>

      <Collapse in={showHistory}>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Recent Queries
          </Typography>
          {recentQueries.length > 0 ? (
            <List dense disablePadding>
              {recentQueries.slice(0, 5).map((item, index) => (
                <ListItem 
                  key={index} 
                  button 
                  onClick={() => handleSelectQuery(item.text)}
                  dense
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText 
                    primary={item.text} 
                    secondary={item.timestamp && new Date(item.timestamp).toLocaleString()}
                  />
                  {isSaved(item.text) && (
                    <BookmarkIcon fontSize="small" color="primary" />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recent queries
            </Typography>
          )}

          {savedQueries.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Saved Queries
              </Typography>
              <List dense disablePadding>
                {savedQueries.map((item, index) => (
                  <ListItem 
                    key={index} 
                    button 
                    onClick={() => handleSelectQuery(item.text)}
                    dense
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemText 
                      primary={item.text} 
                      secondary={item.name || item.description}
                    />
                    <BookmarkIcon fontSize="small" color="primary" />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Collapse>

      {showSuggestions && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LightbulbIcon fontSize="small" sx={{ mr: 0.5 }} color="warning" />
              Try asking
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {queryExamples.map((example, index) => (
                <Chip
                  key={index}
                  label={example}
                  onClick={() => handleSelectQuery(example)}
                  clickable
                  size="small"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default NaturalLanguageQueryPanel;