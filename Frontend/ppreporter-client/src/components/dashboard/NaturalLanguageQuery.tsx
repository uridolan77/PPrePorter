import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Fade,
  Alert,
  Collapse,
  AlertColor
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useSelector, useDispatch } from 'react-redux';
import {
  submitNaturalLanguageQuery,
  clearQueryResults,
  saveQueryToFavorites,
  removeQueryFromFavorites
} from '../../store/slices/dashboardSlice';
// Placeholder for Nivo imports
// import { ResponsiveBar } from '@nivo/bar';
// import { ResponsiveLine } from '@nivo/line';
// import { ResponsivePie } from '@nivo/pie';
// import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { RootState } from '../../store/store';
import { CommonProps } from '../../types/common';

// Visualization types
type VisualizationType = 'bar' | 'line' | 'pie' | 'scatter' | 'table' | 'text';

// Query feedback interface
interface QueryFeedback {
  severity: AlertColor;
  message: string;
}

// Favorite query interface
interface FavoriteQuery {
  id: string;
  text: string;
  timestamp: string;
}

// Query result data interface
interface QueryResult {
  visualizationType: VisualizationType;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
  insights?: string[];
}

// Component props interface
interface NaturalLanguageQueryProps extends CommonProps {
  height?: number;
}

/**
 * NaturalLanguageQuery component allows users to analyze data using natural language.
 * It translates natural language questions into visualizations and insights.
 */
const NaturalLanguageQuery: React.FC<NaturalLanguageQueryProps> = ({
  height = 600,
  sx
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    nlQueryResults,
    nlQueryLoading,
    nlQueryError,
    favoriteQueries
  } = useSelector((state: RootState) => state.dashboard);

  const [query, setQuery] = useState<string>('');
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [queryFeedback, setQueryFeedback] = useState<QueryFeedback>({
    severity: 'info',
    message: ''
  });

  // Example queries that users can try
  const exampleQueries: string[] = [
    "Show me revenue trends by country for the last 6 months",
    "What's the distribution of player segments by game category?",
    "Compare conversion rates between mobile and desktop players",
    "Which games had the highest retention last month?",
    "Show player activity by time of day and day of week"
  ];

  // Handle query submission
  const handleSubmitQuery = (): void => {
    if (!query.trim()) return;

    dispatch(submitNaturalLanguageQuery(query.trim()) as any);

    // Add to recent queries if not already there
    if (!recentQueries.includes(query.trim())) {
      const updatedQueries = [query.trim(), ...recentQueries.slice(0, 9)];
      setRecentQueries(updatedQueries);
      localStorage.setItem('recentNLQueries', JSON.stringify(updatedQueries));
    }

    // Show feedback
    setQueryFeedback({
      severity: 'info',
      message: 'Processing your query...'
    });
    setFeedbackOpen(true);

    // Hide feedback after 3 seconds
    setTimeout(() => {
      setFeedbackOpen(false);
    }, 3000);
  };

  // Handle selecting a query from history or examples
  const handleSelectQuery = (selectedQuery: string): void => {
    setQuery(selectedQuery);
    setShowHistory(false);
  };

  // Handle keypress (Enter) to submit
  const handleKeyPress = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter') {
      handleSubmitQuery();
    }
  };

  // Toggle favorite status for a query
  const handleToggleFavorite = (queryText: string): void => {
    if (isFavoriteQuery(queryText)) {
      dispatch(removeQueryFromFavorites(queryText));
    } else {
      dispatch(saveQueryToFavorites(queryText));
    }
  };

  // Check if a query is in favorites
  const isFavoriteQuery = (queryText: string): boolean => {
    return favoriteQueries.some(q => q.text === queryText);
  };

  // Load recent queries from localStorage on component mount
  useEffect(() => {
    const savedQueries = localStorage.getItem('recentNLQueries');
    if (savedQueries) {
      setRecentQueries(JSON.parse(savedQueries));
    }
  }, []);

  // Effect to handle API response feedback
  useEffect(() => {
    if (nlQueryError) {
      setQueryFeedback({
        severity: 'error',
        message: `Error: ${nlQueryError}`
      });
      setFeedbackOpen(true);
    } else if (nlQueryResults) {
      setQueryFeedback({
        severity: 'success',
        message: 'Results ready!'
      });
      setFeedbackOpen(true);

      // Hide feedback after 3 seconds
      setTimeout(() => {
        setFeedbackOpen(false);
      }, 3000);
    }
  }, [nlQueryResults, nlQueryError]);

  // Render appropriate visualization based on result type
  const renderVisualization = (): React.ReactNode => {
    if (!nlQueryResults || !nlQueryResults.data) {
      return null;
    }

    const { visualizationType, data, xAxis, yAxis, title } = nlQueryResults;

    switch (visualizationType) {
      case 'bar':
        return (
          <div style={{
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: '4px',
            padding: '24px'
          }}>
            <Typography variant="h6" gutterBottom>
              Bar Chart Placeholder
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              This component requires the @nivo/bar package which is not currently installed.
              <br />
              Please install the package to view the bar chart visualization.
            </Typography>
          </div>
        );

      case 'line':
        return (
          <div style={{
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: '4px',
            padding: '24px'
          }}>
            <Typography variant="h6" gutterBottom>
              Line Chart Placeholder
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              This component requires the @nivo/line package which is not currently installed.
              <br />
              Please install the package to view the line chart visualization.
            </Typography>
          </div>
        );
    }
  };

  // Continue with more visualization types
  const renderVisualizationPart2 = (): React.ReactNode => {
    if (!nlQueryResults || !nlQueryResults.data) {
      return null;
    }

    const { visualizationType, data, xAxis, yAxis, title } = nlQueryResults;

    switch (visualizationType) {
      case 'pie':
        const pieChartBoxSx = {
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1,
          p: 3
        };

        return (
          <Box component="div" sx={pieChartBoxSx}>
            <Typography variant="h6" gutterBottom>
              Pie Chart Placeholder
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              This component requires the @nivo/pie package which is not currently installed.
              <br />
              Please install the package to view the pie chart visualization.
            </Typography>
          </Box>
        );

      case 'scatter':
        const scatterPlotBoxSx = {
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 1,
          p: 3
        };

        return (
          <Box component="div" sx={scatterPlotBoxSx}>
            <Typography variant="h6" gutterBottom>
              Scatter Plot Placeholder
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              This component requires the @nivo/scatterplot package which is not currently installed.
              <br />
              Please install the package to view the scatter plot visualization.
            </Typography>
          </Box>
        );

      default:
        // If no specific visualization type is provided, display as a table or text
        return (
          <Box component="div" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {title || 'Query Results'}
            </Typography>
            {Array.isArray(data) ? (
              <Paper sx={{ overflowX: 'auto', maxHeight: 400 }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead">
                    <Box component="tr" sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                      {data.length > 0 && Object.keys(data[0]).map(key => (
                        <Box
                          component="th"
                          key={key}
                          sx={{
                            p: 1.5,
                            textAlign: 'left',
                            fontWeight: 'bold',
                            backgroundColor: theme.palette.background.default
                          }}
                        >
                          {key}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {data.map((row, i) => (
                      <Box
                        component="tr"
                        key={i}
                        sx={{
                          '&:nth-of-type(even)': {
                            backgroundColor: theme.palette.action.hover
                          },
                          '&:hover': {
                            backgroundColor: theme.palette.action.selected
                          }
                        }}
                      >
                        {Object.values(row).map((cell, j) => (
                          <Box
                            component="td"
                            key={j}
                            sx={{
                              p: 1.5,
                              borderBottom: `1px solid ${theme.palette.divider}`
                            }}
                          >
                            {typeof cell === 'object' ? JSON.stringify(cell) : String(cell)}
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Typography variant="body1">
                {typeof data === 'object' ? JSON.stringify(data) : String(data)}
              </Typography>
            )}
          </Box>
        );
    }
  };

  // Combine visualization renderers
  const renderFullVisualization = (): React.ReactNode => {
    if (!nlQueryResults || !nlQueryResults.data) {
      return null;
    }

    const { visualizationType } = nlQueryResults;

    switch (visualizationType) {
      case 'bar':
      case 'line':
        return renderVisualization();
      case 'pie':
      case 'scatter':
      default:
        return renderVisualizationPart2();
    }
  };

  // Render insights section if available
  const renderInsights = (): React.ReactNode => {
    if (!nlQueryResults || !nlQueryResults.insights) {
      return null;
    }

    return (
      <Box component="div" sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Paper sx={{ p: 2 }}>
          {nlQueryResults.insights.map((insight: string, index: number) => (
            <Box component="div" key={index} sx={{ mb: index < nlQueryResults.insights.length - 1 ? 2 : 0 }}>
              <Typography variant="body1">
                {insight}
              </Typography>
              {index < nlQueryResults.insights.length - 1 && (
                <Divider sx={{ my: 1 }} />
              )}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  return (
    <Card elevation={0} sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Natural Language Query
            <Tooltip title="Ask questions about your data in plain English. The system will interpret your question and generate appropriate visualizations and insights.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            color: 'white'
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ask questions about your data in natural language:
          </Typography>

          <Box component="div" sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <TextField
              fullWidth
              placeholder="e.g., 'Show me revenue trends by country for the last 6 months'"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                sx: {
                  bgcolor: 'white',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  }
                }
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              disabled={!query.trim() || nlQueryLoading}
              onClick={handleSubmitQuery}
              sx={{ ml: 1, height: 56, minWidth: 56, borderRadius: 2 }}
            >
              {nlQueryLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
            </Button>
            <IconButton
              color="inherit"
              onClick={() => setShowHistory(!showHistory)}
              sx={{ ml: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <HistoryIcon />
            </IconButton>
          </Box>

          <Collapse in={feedbackOpen}>
            <Alert
              severity={queryFeedback.severity}
              sx={{
                mt: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                '& .MuiAlert-icon': {
                  color: theme.palette[queryFeedback.severity].main
                }
              }}
            >
              {queryFeedback.message}
            </Alert>
          </Collapse>

          {/* History and suggestions dropdown */}
          <Collapse in={showHistory}>
            <Paper sx={{ mt: 2, p: 2, maxHeight: 300, overflow: 'auto' }}>
              {recentQueries.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Recent Queries
                  </Typography>
                  <Box component="div" sx={{ mb: 2 }}>
                    {recentQueries.map((recentQuery, index) => (
                      <Box
                        component="div"
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box
                          component="span"
                          onClick={() => handleSelectQuery(recentQuery)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                            flex: 1
                          }}
                        >
                          {recentQuery}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleFavorite(recentQuery)}
                          color={isFavoriteQuery(recentQuery) ? "primary" : "default"}
                        >
                          {isFavoriteQuery(recentQuery) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              <Typography variant="subtitle2" gutterBottom>
                Example Queries
              </Typography>
              <Box component="div">
                {exampleQueries.map((exampleQuery, index) => (
                  <Box
                    key={index}
                    component="span"
                    onClick={() => handleSelectQuery(exampleQuery)}
                    sx={{
                      display: 'block',
                      cursor: 'pointer',
                      mb: 1,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {exampleQuery}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Collapse>

          <Box component="div" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {favoriteQueries.slice(0, 5).map((fav: { text: string }, index: number) => (
              <Chip
                key={index}
                label={fav.text}
                color="secondary"
                variant="outlined"
                onClick={() => handleSelectQuery(fav.text)}
                onDelete={() => handleToggleFavorite(fav.text)}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { color: 'white' }
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        {nlQueryLoading ? (
          <Box
            component="div"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 400,
              flexDirection: 'column',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
              Analyzing your question and generating insights...
            </Typography>
          </Box>
        ) : nlQueryError ? (
          <Box component="div" sx={{ p: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {nlQueryError}
            </Alert>
            <Typography variant="body1">
              Try rephrasing your question or use one of the example queries.
            </Typography>
          </Box>
        ) : nlQueryResults ? (
          <Fade in={Boolean(nlQueryResults)}>
            <Box component="div">
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {nlQueryResults.title || 'Query Results'}
                </Typography>
                {renderFullVisualization()}
              </Paper>
              {renderInsights()}
            </Box>
          </Fade>
        ) : (
          <Box component="div" sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Ask a question about your data
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Use natural language to explore your data. For example:
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {exampleQueries.map((example, index) => (
                <Grid item key={index}>
                  <Chip
                    label={example}
                    onClick={() => handleSelectQuery(example)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NaturalLanguageQuery;