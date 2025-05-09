import React, { useState } from 'react';
import { Box, Container, Typography, Button, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ContextualExplanation from './ContextualExplanation';

// Sample metrics
const metrics = [
  { id: 1, name: 'Revenue', unit: '$', higherIsBetter: true },
  { id: 2, name: 'Conversion Rate', unit: '%', higherIsBetter: true },
  { id: 3, name: 'Bounce Rate', unit: '%', higherIsBetter: false },
  { id: 4, name: 'Page Views', unit: '', higherIsBetter: true },
  { id: 5, name: 'Session Duration', unit: 'min', higherIsBetter: true }
];

// Sample data generator
const generateSampleData = (metricId, trend = 'up', anomalies = 1) => {
  const baseValue = Math.floor(Math.random() * 100) + 50;
  const dataPoints = 12;
  const result = [];

  for (let i = 0; i < dataPoints; i++) {
    const isAnomaly = i % (dataPoints / anomalies) === 0 && i > 0;
    let value;

    if (trend === 'up') {
      value = baseValue + (i * (baseValue * 0.05));
    } else if (trend === 'down') {
      value = baseValue - (i * (baseValue * 0.04));
    } else {
      value = baseValue + (Math.random() * 10 - 5);
    }

    // Add anomaly spike or drop
    if (isAnomaly) {
      value = value * (Math.random() > 0.5 ? 1.3 : 0.7);
    }

    result.push({
      date: new Date(2023, i, 1).toISOString(),
      value: Math.round(value * 100) / 100,
      isAnomaly
    });
  }

  return result;
};

const TestContextualExplanation = () => {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [insightType, setInsightType] = useState('trend');
  const [data, setData] = useState(generateSampleData(1, 'up'));
  const [showDetailedView, setShowDetailedView] = useState(false);

  const handleMetricChange = (e) => {
    const metric = metrics.find(m => m.id === e.target.value);
    setSelectedMetric(metric);
    
    // Generate new data when metric changes
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    setData(generateSampleData(metric.id, trend));
  };

  const handleInsightTypeChange = (e) => {
    setInsightType(e.target.value);
  };

  const handleRegenerateData = () => {
    const trends = ['up', 'down', 'stable'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    setData(generateSampleData(selectedMetric.id, trend, Math.floor(Math.random() * 3) + 1));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Contextual Explanation Component Test
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Metric</InputLabel>
            <Select
              value={selectedMetric.id}
              label="Metric"
              onChange={handleMetricChange}
            >
              {metrics.map(metric => (
                <MenuItem key={metric.id} value={metric.id}>{metric.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Insight Type</InputLabel>
            <Select
              value={insightType}
              label="Insight Type"
              onChange={handleInsightTypeChange}
            >
              <MenuItem value="trend">Trend Analysis</MenuItem>
              <MenuItem value="anomaly">Anomaly Detection</MenuItem>
              <MenuItem value="forecast">Forecast Analysis</MenuItem>
              <MenuItem value="comparison">Comparative Analysis</MenuItem>
              <MenuItem value="correlation">Correlation Analysis</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button 
            variant="contained" 
            onClick={handleRegenerateData}
            fullWidth
            sx={{ height: '56px' }}
          >
            Regenerate Sample Data
          </Button>
        </Grid>
      </Grid>
      
      <Box sx={{ mb: 2 }}>
        <ContextualExplanation
          metric={selectedMetric}
          data={data}
          insightType={insightType}
          isLoading={false}
          showDetailedView={showDetailedView}
          onShowDetailedView={() => setShowDetailedView(true)}
        />
      </Box>
      
      {showDetailedView && (
        <Box sx={{ mb: 2 }}>
          <Button onClick={() => setShowDetailedView(false)} variant="outlined">
            Hide Detailed View
          </Button>
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Current Sample Data:</Typography>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </Box>
    </Container>
  );
};

export default TestContextualExplanation;
