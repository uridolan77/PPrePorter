import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InfoIcon from '@mui/icons-material/Info';

/**
 * Test component for contextual explanation feature
 * This is a placeholder component for testing purposes
 */
const TestContextualExplanation: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sample data for demonstration
  const sampleData = [
    { metric: 'Revenue', value: '$12,345.67', change: '+15%' },
    { metric: 'Users', value: '1,234', change: '+8%' },
    { metric: 'Conversion Rate', value: '3.45%', change: '-2%' },
    { metric: 'Average Order Value', value: '$45.67', change: '+5%' }
  ];

  // Handle query submission
  const handleSubmit = () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      try {
        // Generate a response based on the query
        let generatedResponse = '';
        
        if (query.toLowerCase().includes('revenue')) {
          generatedResponse = 'Revenue has increased by 15% compared to last month. This growth is primarily driven by the new product line and improved conversion rates from the latest marketing campaign.';
        } else if (query.toLowerCase().includes('user') || query.toLowerCase().includes('customer')) {
          generatedResponse = 'User growth is up 8% month-over-month. The majority of new users are coming from mobile devices, suggesting our mobile optimization efforts are paying off.';
        } else if (query.toLowerCase().includes('conversion')) {
          generatedResponse = 'Conversion rate has decreased by 2% compared to last month. This might be related to the recent website changes. We recommend A/B testing different checkout flows to identify improvement opportunities.';
        } else if (query.toLowerCase().includes('order') || query.toLowerCase().includes('aov')) {
          generatedResponse = 'Average Order Value has increased by 5%. The upsell feature implemented last month appears to be working effectively, with 23% of customers adding recommended products to their cart.';
        } else {
          generatedResponse = 'I analyzed the dashboard data and found several interesting trends. Revenue is up 15%, user count increased by 8%, though conversion rate dropped slightly by 2%. The average order value improved by 5%, indicating higher quality purchases.';
        }
        
        setResponse(generatedResponse);
        setLoading(false);
      } catch (err) {
        setError('Failed to generate explanation. Please try again.');
        setLoading(false);
      }
    }, 1500); // Simulate network delay
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Contextual Data Explanation
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        This test component demonstrates how natural language processing can be used to explain dashboard data.
        Ask a question about the metrics below to get an AI-generated explanation.
      </Typography>
      
      {/* Sample metrics display */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {sampleData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {item.metric}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1 }}>
                {item.value}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: item.change.startsWith('+') ? 'success.main' : 'error.main',
                  mt: 1
                }}
              >
                {item.change} vs last month
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Query input */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ask about the data
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="e.g., 'Why did revenue increase?' or 'Explain the conversion rate drop'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={loading || !query.trim()}
            >
              Ask
            </Button>
          </Box>
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <InfoIcon fontSize="small" color="info" sx={{ mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Try asking specific questions about trends, changes, or relationships in the data.
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* Response display */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {response && !loading && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Explanation
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              {response}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TestContextualExplanation;
