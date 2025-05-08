import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Divider,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NaturalLanguageService from '../../services/NaturalLanguageService';

const NaturalLanguageQuery = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [clarificationQuestions, setClarificationQuestions] = useState([]);
  const [clarificationResponses, setClarificationResponses] = useState({});
  const [originalQuery, setOriginalQuery] = useState('');
  const [previousQueryId, setPreviousQueryId] = useState(null);
  const [suggestedQueries, setSuggestedQueries] = useState([
    'What was our total revenue last month?',
    'Show me active players by country',
    'Which games generated the most revenue this quarter?',
    'What is the average deposit amount by payment method?'
  ]);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    setClarificationQuestions([]);
    
    try {
      // If we have a previous query ID, treat this as a follow-up question
      if (previousQueryId) {
        const response = await NaturalLanguageService.submitFollowUpQuery(query, previousQueryId);
        handleQueryResponse(response);
      } else {
        // Otherwise, treat as a new query
        const response = await NaturalLanguageService.submitQuery(query);
        handleQueryResponse(response);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    // Toggle voice recognition if browser supports it
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      if (!isListening) {
        // Start listening
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        // Stop listening
        recognition.stop();
        setIsListening(false);
      }
    } else {
      setError('Speech recognition is not supported in your browser');
    }
  };

  const handleQueryResponse = (response) => {
    if (response.status === 'Success') {
      setResults(response.results);
      setPreviousQueryId(response.queryId || Math.random().toString(36).substring(2, 10));
      // Clear clarification-related state
      setClarificationQuestions([]);
      setClarificationResponses({});
      setOriginalQuery('');
    } else if (response.status === 'Clarification') {
      setClarificationQuestions(response.clarificationQuestions || []);
      setOriginalQuery(query);
      setResults(null);
    } else if (response.status === 'Error') {
      setError(response.errorMessage || 'An error occurred');
      setResults(null);
    }
  };

  const handleClarificationChange = (questionId, value) => {
    setClarificationResponses({
      ...clarificationResponses,
      [questionId]: value
    });
  };

  const submitClarification = async () => {
    setIsLoading(true);
    
    try {
      const response = await NaturalLanguageService.submitClarification(
        originalQuery,
        clarificationResponses
      );
      
      handleQueryResponse(response);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting clarification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQueryClick = (suggestedQuery) => {
    setQuery(suggestedQuery);
    setTimeout(() => {
      handleQuerySubmit();
    }, 100);
  };

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Natural Language Query
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Ask questions about your data in plain English. For example: "Show me total revenue by game for the last 30 days"
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
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" mb={1}>
            Try asking:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestedQueries.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => handleSuggestedQueryClick(suggestion)}
                clickable
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      </Paper>
      
      {error && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#fdeded' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      {clarificationQuestions.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            I need some clarification
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please provide more details to help me understand your query better:
          </Typography>
          
          {clarificationQuestions.map((question) => (
            <Box key={question.id} sx={{ mb: 3 }}>
              <Typography variant="subtitle1">{question.question}</Typography>
              
              {question.type === 'MultipleChoice' && (
                <FormControl component="fieldset">
                  <RadioGroup
                    value={clarificationResponses[question.id] || ''}
                    onChange={(e) => handleClarificationChange(question.id, e.target.value)}
                  >
                    {question.options.map((option, idx) => (
                      <FormControlLabel
                        key={idx}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
              
              {question.type === 'FreeText' && (
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={clarificationResponses[question.id] || ''}
                  onChange={(e) => handleClarificationChange(question.id, e.target.value)}
                  margin="normal"
                />
              )}
              
              {question.type === 'YesNo' && (
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={clarificationResponses[question.id] || ''}
                    onChange={(e) => handleClarificationChange(question.id, e.target.value)}
                  >
                    <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="No" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              )}
            </Box>
          ))}
          
          <Button
            variant="contained"
            color="primary"
            onClick={submitClarification}
            disabled={
              isLoading ||
              Object.keys(clarificationResponses).length !== clarificationQuestions.length
            }
          >
            Submit Clarification
          </Button>
        </Paper>
      )}
      
      {results && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          
          {/* Display the results. The actual implementation will depend on the data structure */}
          <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
            {/* This is a placeholder. Actual results rendering will depend on the response format */}
            {typeof results === 'object' && !Array.isArray(results) ? (
              <pre>{JSON.stringify(results, null, 2)}</pre>
            ) : Array.isArray(results) ? (
              <List>
                {results.map((item, index) => (
                  <ListItem key={index} divider={index < results.length - 1}>
                    <ListItemText
                      primary={
                        typeof item === 'object'
                          ? JSON.stringify(item)
                          : item.toString()
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>{results.toString()}</Typography>
            )}
          </Box>
          
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
            <Typography variant="body2" color="textSecondary">
              You can ask a follow-up question or start a new query
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default NaturalLanguageQuery;