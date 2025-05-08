import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import dashboardAnalyticsService from '../../services/dashboardAnalyticsService';

/**
 * Component for displaying contextual explanations of metrics
 * Implements data storytelling by explaining what metrics mean and why they're important
 */
const MetricExplanation = ({
  metricId,
  metricName,
  metricValue,
  metricTrend,
  userContext = {},
  onSaveReference,
  expanded = false
}) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);

  // Fetch explanation data when component mounts or metricId changes
  useEffect(() => {
    if (metricId && isExpanded) {
      fetchExplanation();
    }
  }, [metricId, isExpanded]);

  // Fetch explanation from API
  const fetchExplanation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await dashboardAnalyticsService.getMetricExplanation(metricId, userContext);
      setExplanation(data);
    } catch (err) {
      console.error('Error fetching metric explanation:', err);
      setError('Unable to load metric explanation. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle expanded state
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Toggle saved state
  const handleToggleSave = () => {
    setIsSaved(!isSaved);
    if (onSaveReference) {
      onSaveReference(metricId, !isSaved);
    }
  };

  // Render trend indicator
  const renderTrendIndicator = () => {
    if (!metricTrend || metricTrend === 0) return null;
    
    return metricTrend > 0 ? (
      <Chip 
        icon={<TrendingUpIcon />} 
        label={`+${metricTrend}%`} 
        color="success" 
        size="small" 
        variant="outlined"
      />
    ) : (
      <Chip 
        icon={<TrendingDownIcon />} 
        label={`${metricTrend}%`} 
        color="error" 
        size="small" 
        variant="outlined"
      />
    );
  };

  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">{metricName || 'Metric Explanation'}</Typography>
            {renderTrendIndicator()}
          </Box>
        }
        action={
          <Box>
            <Tooltip title={isSaved ? "Remove from saved references" : "Save for reference"}>
              <IconButton onClick={handleToggleSave} size="small">
                {isSaved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      
      <Accordion 
        expanded={isExpanded} 
        onChange={handleToggleExpand}
        disableGutters
        elevation={0}
        sx={{ 
          '&:before': { 
            display: 'none' 
          },
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="metric-explanation-content"
          id="metric-explanation-header"
        >
          <Typography>
            {isExpanded ? 'Hide explanation' : 'Show explanation'}
          </Typography>
        </AccordionSummary>
        
        <AccordionDetails>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : explanation ? (
            <Box>
              {/* Definition */}
              <Typography variant="subtitle1" gutterBottom>What is {explanation.name}?</Typography>
              <Typography variant="body2" paragraph>
                {explanation.definition}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Relevance */}
              <Typography variant="subtitle1" gutterBottom>Why it matters</Typography>
              <Typography variant="body2" paragraph>
                {explanation.relevance}
              </Typography>
              
              {explanation.calculation && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  {/* How it's calculated */}
                  <Typography variant="subtitle1" gutterBottom>How it's calculated</Typography>
                  <Typography variant="body2" paragraph>
                    {explanation.calculation}
                  </Typography>
                </>
              )}
              
              {explanation.benchmark && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Benchmarks */}
                  <Typography variant="subtitle1" gutterBottom>Benchmarks</Typography>
                  <Typography variant="body2" paragraph>
                    {explanation.benchmark}
                  </Typography>
                </>
              )}
              
              {explanation.recommendations && explanation.recommendations.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Recommendations */}
                  <Typography variant="subtitle1" gutterBottom>Recommendations</Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {explanation.recommendations.map((rec, index) => (
                      <Typography component="li" variant="body2" key={index} sx={{ mb: 1 }}>
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </>
              )}
              
              {explanation.relatedMetrics && explanation.relatedMetrics.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Related Metrics */}
                  <Typography variant="subtitle1" gutterBottom>Related Metrics</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {explanation.relatedMetrics.map((metric, index) => (
                      <Chip
                        key={index}
                        label={metric.name}
                        size="small"
                        clickable
                        onClick={() => {/* Handle related metric click */}}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <HelpOutlineIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
              <Typography color="textSecondary">
                No explanation available for this metric
              </Typography>
            </Box>
          )}
          
          {explanation && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                size="small" 
                startIcon={<InfoIcon />}
                onClick={() => {/* Open detailed documentation */}}
              >
                Detailed Documentation
              </Button>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

export default MetricExplanation;