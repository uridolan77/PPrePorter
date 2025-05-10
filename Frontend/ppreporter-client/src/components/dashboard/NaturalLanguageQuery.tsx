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
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
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
          <Box sx={{ height: 400 }}>
            <ResponsiveBar
              data={data}
              keys={data.length > 0 ? Object.keys(data[0]).filter(k => k !== xAxis) : []}
              indexBy={xAxis}
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'nivo' }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: xAxis,
                legendPosition: 'middle',
                legendOffset: 40
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: yAxis,
                legendPosition: 'middle',
                legendOffset: -40
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 2,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20
                }
              ]}
            />
          </Box>
        );

      case 'line':
        return (
          <Box sx={{ height: 400 }}>
            <ResponsiveLine
              data={data}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: xAxis,
                legendOffset: 40,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: yAxis,
                legendOffset: -40,
                legendPosition: 'middle'
              }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)'
                }
              ]}
            />
          </Box>
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
        return (
          <Box sx={{ height: 400 }}>
            <ResponsivePie
              data={data}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#999',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: 'circle',
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemTextColor: '#000'
                      }
                    }
                  ]
                }
              ]}
            />
          </Box>
        );

      case 'scatter':
        return (
          <Box sx={{ height: 400 }}>
            <ResponsiveScatterPlot
              data={data}
              margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
              xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              xFormat={(d: any) => `${d} ${xAxis}`}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              yFormat={(d: any) => `${d} ${yAxis}`}
              blendMode="multiply"
              axisTop={null}
              axisRight={null}
              axisBottom={{
                orient: 'bottom',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: xAxis,
                legendPosition: 'middle',
                legendOffset: 46
              }}
              axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: yAxis,
                legendPosition: 'middle',
                legendOffset: -60
              }}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 130,
                  translateY: 0,
                  itemWidth: 100,
                  itemHeight: 12,
                  itemsSpacing: 5,
                  itemDirection: 'left-to-right',
                  symbolSize: 12,
                  symbolShape: 'circle'
                }
              ]}
            />
          </Box>
        );

      default:
        // If no specific visualization type is provided, display as a table or text
        return (
          <Box sx={{ p: 2 }}>
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
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Insights
        </Typography>
        <Paper sx={{ p: 2 }}>
          {nlQueryResults.insights.map((insight: string, index: number) => (
            <Box key={index} sx={{ mb: index < nlQueryResults.insights.length - 1 ? 2 : 0 }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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

          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
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
                  <Box sx={{ mb: 2 }}>
                    {recentQueries.map((recentQuery, index) => (
                      <Box
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
              <Box>
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

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
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
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {nlQueryError}
            </Alert>
            <Typography variant="body1">
              Try rephrasing your question or use one of the example queries.
            </Typography>
          </Box>
        ) : nlQueryResults ? (
          <Fade in={Boolean(nlQueryResults)}>
            <Box>
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
          <Box sx={{ textAlign: 'center', p: 4 }}>
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