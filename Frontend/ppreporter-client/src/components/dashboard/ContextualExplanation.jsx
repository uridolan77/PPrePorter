import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Collapse,
  IconButton,
  Button,
  Divider,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TimelineIcon from '@mui/icons-material/Timeline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import contextualService from '../../services/api/contextualService';

/**
 * ContextualExplanation component provides explanations for metrics, trends, and anomalies
 * to help users understand their dashboard data
 */
const ContextualExplanation = ({
  metric,
  data,
  insightType = 'trend',
  isLoading = false,
  showDetailedView = false,
  onShowDetailedView,
  className
}) => {  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [explanationLoading, setExplanationLoading] = useState(false);
    useEffect(() => {
    if (data && metric) {
      generateExplanation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, metric, insightType]);
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const generateExplanation = async () => {
    try {
      const params = {
        metric: metric,
        data: data,
        insightType: insightType
      };
      
      // Set loading state
      setExplanationLoading(true);
      
      // Call the API to get the contextual explanation
      const response = await contextualService.getContextualExplanation(params);
      setExplanation(response);
      
      // In case the API fails, we'll fall back to local calculation
    } catch (error) {
      console.error('Error fetching contextual explanation:', error);
      
      // Fallback to locally generated explanations
      const explanations = {
        trend: {
          title: 'Trend Analysis',
          content: `This ${metric.name} shows a ${getTrendDirection(data)} trend over the selected period. 
                  ${getPerformanceInsight(data, metric)}`,
          insights: [
            `The average ${metric.name} is ${calculateAverage(data).toFixed(2)}${metric.unit || ''}`,
            `This represents a ${calculateChange(data).toFixed(2)}% change from the previous period`,
            `The trend indicates ${getBusinessImpact(data, metric)}`
          ],
          recommendations: [
            `Consider ${getRecommendation(data, metric, 'trend')}`,
            `Monitor this metric closely over the next reporting period`
          ]
        },
        anomaly: {
          title: 'Anomaly Detection',
          content: `We've detected ${getAnomalyCount(data)} unusual data point(s) in your ${metric.name} metric. 
                  ${getAnomalyInsight(data, metric)}`,
          insights: [
            `The anomalies occurred on ${getAnomalyDates(data)}`,
            `These values deviate from the expected range by ${getDeviationAmount(data).toFixed(2)}%`,
            `${getAnomalyImpact(data, metric)}`
          ],
          recommendations: [
            `${getRecommendation(data, metric, 'anomaly')}`,
            `Consider investigating factors that might have contributed to these anomalies`
          ]
        },
        forecast: {
          title: 'Forecast Analysis',
          content: `Based on historical patterns, we project that your ${metric.name} will 
                  ${getForecastDirection(data)} in the upcoming period.`,
          insights: [
            `The projected value for next month is ${getForecastValue(data).toFixed(2)}${metric.unit || ''}`,
            `This represents a ${getForecastChange(data).toFixed(2)}% change from the current period`,
            `Confidence in this prediction: ${getPredictionConfidence(data)}`
          ],
          recommendations: [
            `${getRecommendation(data, metric, 'forecast')}`,
            `Update your targets based on these projections`
          ]
        },
        comparison: {
          title: 'Comparative Analysis',
          content: `Your ${metric.name} performance compared to industry benchmarks is 
                  ${getComparisonResult(data, metric)}.`,
          insights: [
            `You are ${getPerformanceGap(data, metric).toFixed(2)}% ${getComparisonDirection(data)} the industry average`,
            `You rank in the ${getPerformanceTier(data)} tier among similar businesses`,
            `${getCompetitiveInsight(data, metric)}`
          ],
          recommendations: [
            `${getRecommendation(data, metric, 'comparison')}`,
            `Consider analyzing competitors' strategies in this area`
          ]
        },
        correlation: {
          title: 'Correlation Analysis',
          content: `We've found a ${getCorrelationStrength(data)} correlation between ${metric.name} 
                  and ${getCorrelatedMetric(data, metric)}.`,
          insights: [
            `Correlation coefficient: ${getCorrelationCoefficient(data).toFixed(2)}`,
            `This suggests that ${getCorrelationMeaning(data, metric)}`,
            `${getCorrelationInsight(data, metric)}`
          ],
          recommendations: [
            `${getRecommendation(data, metric, 'correlation')}`,
            `Consider this relationship when planning your strategies`
          ]
        }
      };
      
      setExplanation(explanations[insightType] || explanations.trend);
    } finally {
      // Reset loading state
      setExplanationLoading(false);
    }
  };
  
  // Helper functions for generating dynamic content
  const getTrendDirection = (data) => {
    // Calculate trend direction based on data
    if (!data || data.length < 2) return 'stable';
    
    const first = data[0]?.value || 0;
    const last = data[data.length - 1]?.value || 0;
    const change = ((last - first) / first) * 100;
    
    if (change > 5) return 'upward';
    if (change < -5) return 'downward';
    return 'stable';
  };
  
  const calculateAverage = (data) => {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (item.value || 0), 0);
    return sum / data.length;
  };
  
  const calculateChange = (data) => {
    if (!data || data.length < 2) return 0;
    
    const first = data[0]?.value || 0;
    const last = data[data.length - 1]?.value || 0;
    
    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  };
  
  const getPerformanceInsight = (data, metric) => {
    const direction = getTrendDirection(data);
    const change = calculateChange(data);
    
    if (metric.higherIsBetter) {
      if (direction === 'upward') return `This positive trend indicates improving performance.`;
      if (direction === 'downward') return `This downward trend may require attention.`;
    } else {
      if (direction === 'upward') return `This upward trend may indicate an issue that needs attention.`;
      if (direction === 'downward') return `This downward trend shows improvement in performance.`;
    }
    
    return `Performance has remained relatively stable.`;
  };
  
  const getBusinessImpact = (data, metric) => {
    const direction = getTrendDirection(data);
    
    if (metric.higherIsBetter) {
      if (direction === 'upward') return `potentially positive impact on your business outcomes`;
      if (direction === 'downward') return `potential challenges that may affect business outcomes`;
    } else {
      if (direction === 'upward') return `potential issues that may negatively impact business outcomes`;
      if (direction === 'downward') return `positive improvements that should benefit business outcomes`;
    }
    
    return `stable business performance in this area`;
  };
  
  const getRecommendation = (data, metric, type) => {
    // Generate recommendations based on metric type and data trends
    const direction = getTrendDirection(data);
    
    if (type === 'trend') {
      if (metric.higherIsBetter) {
        if (direction === 'upward') return `continuing the strategies that are driving this positive trend`;
        if (direction === 'downward') return `investigating factors contributing to the decline and implementing corrective actions`;
      } else {
        if (direction === 'upward') return `investigating the root causes of this increase and implementing mitigation strategies`;
        if (direction === 'downward') return `continuing the effective strategies that are driving this positive trend`;
      }
      return `maintaining current strategies while looking for optimization opportunities`;
    }
    
    if (type === 'anomaly') {
      return `conducting a detailed review of the days where anomalies occurred to identify potential causes`;
    }
    
    if (type === 'forecast') {
      const forecastDirection = getForecastDirection(data);
      
      if (metric.higherIsBetter) {
        if (forecastDirection.includes('increase')) return `preparing to capitalize on the projected growth`;
        if (forecastDirection.includes('decrease')) return `developing strategies to reverse the projected decline`;
      } else {
        if (forecastDirection.includes('increase')) return `preparing mitigation strategies for the projected increase`;
        if (forecastDirection.includes('decrease')) return `maintaining the effective strategies driving this positive trend`;
      }
      return `maintaining current strategies while monitoring for changes`;
    }
    
    if (type === 'comparison') {
      const comparison = getComparisonResult(data, metric);
      
      if (comparison.includes('above average')) return `sharing best practices with your team that are driving this success`;
      if (comparison.includes('below average')) return `examining industry leaders' strategies to identify improvement opportunities`;
      
      return `identifying specific areas where you can gain competitive advantage`;
    }
    
    if (type === 'correlation') {
      return `exploring how changes to ${getCorrelatedMetric(data, metric)} might impact ${metric.name}`;
    }
    
    return `monitoring this metric closely and adjusting strategies as needed`;
  };
  
  // Anomaly-specific helper functions
  const getAnomalyCount = (data) => {
    // In a real implementation, this would be determined by statistical analysis
    // Here we're simulating anomalies
    return data?.filter(item => item.isAnomaly)?.length || 0;
  };
  
  const getAnomalyDates = (data) => {
    // Get dates of anomalies
    const anomalies = data?.filter(item => item.isAnomaly) || [];
    if (anomalies.length === 0) return 'N/A';
    
    return anomalies.map(a => new Date(a.date).toLocaleDateString()).join(', ');
  };
  
  const getDeviationAmount = (data) => {
    // Calculate deviation amount
    const anomalies = data?.filter(item => item.isAnomaly) || [];
    if (anomalies.length === 0) return 0;
    
    const avg = calculateAverage(data);
    const avgDeviation = anomalies.reduce((acc, item) => {
      return acc + Math.abs(((item.value - avg) / avg) * 100);
    }, 0) / anomalies.length;
    
    return avgDeviation;
  };
  
  const getAnomalyInsight = (data, metric) => {
    const count = getAnomalyCount(data);
    if (count === 0) return 'No anomalies detected.';
    
    return `These anomalies may indicate unusual patterns that warrant investigation.`;
  };
  
  const getAnomalyImpact = (data, metric) => {
    const anomalies = data?.filter(item => item.isAnomaly) || [];
    if (anomalies.length === 0) return 'No impact detected.';
    
    const avgValue = calculateAverage(data);
    const anomalyAvg = anomalies.reduce((acc, item) => acc + item.value, 0) / anomalies.length;
    
    if (metric.higherIsBetter) {
      if (anomalyAvg > avgValue) return 'These anomalies represent positive spikes in performance.';
      return 'These anomalies represent concerning drops in performance.';
    } else {
      if (anomalyAvg > avgValue) return 'These anomalies represent concerning spikes that may indicate issues.';
      return 'These anomalies represent positive drops in this metric.';
    }
  };
  
  // Forecast-specific helper functions
  const getForecastDirection = (data) => {
    // In a real implementation, this would be based on predictive modeling
    // Here we're simulating a forecast based on the current trend
    const direction = getTrendDirection(data);
    
    if (direction === 'upward') return 'continue to increase';
    if (direction === 'downward') return 'continue to decrease';
    return 'remain relatively stable';
  };
  
  const getForecastValue = (data) => {
    // Simple linear projection for demonstration
    if (!data || data.length < 2) return 0;
    
    const lastValue = data[data.length - 1]?.value || 0;
    const secondLastValue = data[data.length - 2]?.value || 0;
    const change = lastValue - secondLastValue;
    
    return lastValue + change;
  };
  
  const getForecastChange = (data) => {
    if (!data || data.length < 1) return 0;
    
    const lastValue = data[data.length - 1]?.value || 0;
    const forecastValue = getForecastValue(data);
    
    if (lastValue === 0) return 0;
    return ((forecastValue - lastValue) / lastValue) * 100;
  };
  
  const getPredictionConfidence = (data) => {
    // In a real implementation, this would be based on the model's confidence score
    // Here we're simulating a confidence level
    const variance = getVariance(data);
    
    if (variance < 10) return 'High';
    if (variance < 30) return 'Medium';
    return 'Low';
  };
  
  const getVariance = (data) => {
    if (!data || data.length < 2) return 0;
    
    const avg = calculateAverage(data);
    const squaredDiffs = data.map(item => Math.pow((item.value || 0) - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
    
    return Math.sqrt(avgSquaredDiff);
  };
  
  // Comparison-specific helper functions
  const getComparisonResult = (data, metric) => {
    // In a real implementation, this would compare to actual industry benchmarks
    // Here we're simulating a comparison
    const avg = calculateAverage(data);
    const industryAvg = avg * (1 + (Math.random() * 0.4 - 0.2)); // +/- 20% of your average
    
    const diff = ((avg - industryAvg) / industryAvg) * 100;
    
    if (metric.higherIsBetter) {
      if (diff > 10) return 'significantly above average';
      if (diff > 0) return 'above average';
      if (diff > -10) return 'slightly below average';
      return 'below average';
    } else {
      if (diff < -10) return 'significantly better than average';
      if (diff < 0) return 'better than average';
      if (diff < 10) return 'slightly worse than average';
      return 'worse than average';
    }
  };
  
  const getPerformanceGap = (data, metric) => {
    const avg = calculateAverage(data);
    const industryAvg = avg * (1 + (Math.random() * 0.4 - 0.2)); // +/- 20% of your average
    
    return Math.abs(((avg - industryAvg) / industryAvg) * 100);
  };
  
  const getComparisonDirection = (data) => {
    const avg = calculateAverage(data);
    const industryAvg = avg * (1 + (Math.random() * 0.4 - 0.2)); // +/- 20% of your average
    
    return avg > industryAvg ? 'above' : 'below';
  };
  
  const getPerformanceTier = (data) => {
    // Simulate performance tier
    const tiers = ['top', 'upper', 'middle', 'lower', 'bottom'];
    const avg = calculateAverage(data);
    const industryAvg = avg * (1 + (Math.random() * 0.4 - 0.2)); // +/- 20% of your average
    
    const diff = ((avg - industryAvg) / industryAvg) * 100;
    
    if (diff > 20) return tiers[0];
    if (diff > 10) return tiers[1];
    if (diff > -10) return tiers[2];
    if (diff > -20) return tiers[3];
    return tiers[4];
  };
  
  const getCompetitiveInsight = (data, metric) => {
    const tier = getPerformanceTier(data);
    
    if (tier === 'top' || tier === 'upper') {
      return 'Your performance in this area provides a competitive advantage';
    }
    if (tier === 'middle') {
      return 'This area has potential for creating competitive advantage with further improvements';
    }
    return 'This area may be creating competitive disadvantage and needs attention';
  };
  
  // Correlation-specific helper functions
  const getCorrelatedMetric = (data, metric) => {
    // In a real implementation, this would be based on actual correlation analysis
    // Here we're simulating correlated metrics
    const correlatedMetrics = {
      'revenue': 'customer acquisition',
      'customer acquisition': 'marketing spend',
      'conversion rate': 'website traffic',
      'churn rate': 'customer satisfaction',
      'average order value': 'product range',
      'page views': 'marketing campaigns',
      'session duration': 'content quality',
      'bounce rate': 'page load time'
    };
    
    return correlatedMetrics[metric.name.toLowerCase()] || 'another key performance indicator';
  };
  
  const getCorrelationCoefficient = (data) => {
    // Simulate correlation coefficient (-1 to 1)
    return Math.random() * 1.6 - 0.8; // between -0.8 and 0.8
  };
  
  const getCorrelationStrength = (data) => {
    const coeff = Math.abs(getCorrelationCoefficient(data));
    
    if (coeff > 0.7) return 'strong';
    if (coeff > 0.4) return 'moderate';
    if (coeff > 0.2) return 'weak';
    return 'very weak';
  };
  
  const getCorrelationMeaning = (data, metric) => {
    const coeff = getCorrelationCoefficient(data);
    const correlated = getCorrelatedMetric(data, metric);
    
    if (coeff > 0) {
      return `as ${metric.name} increases, ${correlated} tends to increase as well`;
    } else {
      return `as ${metric.name} increases, ${correlated} tends to decrease`;
    }
  };
  
  const getCorrelationInsight = (data, metric) => {
    const strength = getCorrelationStrength(data);
    const correlated = getCorrelatedMetric(data, metric);
    const coeff = getCorrelationCoefficient(data);
    
    if (Math.abs(coeff) > 0.4) {
      return `This suggests a meaningful relationship that you should consider in your strategic planning`;
    } else {
      return `While the relationship exists, it may not be strong enough to warrant significant strategy changes`;
    }
  };
  
  // Get the appropriate icon based on insight type
  const getInsightIcon = () => {
    switch (insightType) {
      case 'trend':
        return <TimelineIcon />;
      case 'anomaly':
        return <WarningAmberIcon />;
      case 'forecast':
        return <TrendingUpIcon />;
      case 'comparison':
        return <BoltIcon />;
      case 'correlation':
        return <LightbulbOutlinedIcon />;
      default:
        return <InfoOutlinedIcon />;
    }
  };
  
  // Get trend icon based on direction
  const getTrendIcon = () => {
    const direction = getTrendDirection(data);
    
    switch (direction) {
      case 'upward':
        return <TrendingUpIcon color={metric?.higherIsBetter ? "success" : "error"} />;
      case 'downward':
        return <TrendingDownIcon color={metric?.higherIsBetter ? "error" : "success"} />;
      default:
        return <TrendingFlatIcon color="action" />;
    }
  };
  
  // Get color based on performance
  const getPerformanceColor = () => {
    if (insightType === 'comparison') {
      const comparison = getComparisonResult(data, metric);
      
      if (metric?.higherIsBetter) {
        if (comparison.includes('above')) return theme.palette.success.main;
        return theme.palette.error.main;
      } else {
        if (comparison.includes('better')) return theme.palette.success.main;
        return theme.palette.error.main;
      }
    }
    
    if (insightType === 'trend') {
      const direction = getTrendDirection(data);
      
      if (metric?.higherIsBetter) {
        if (direction === 'upward') return theme.palette.success.main;
        if (direction === 'downward') return theme.palette.error.main;
      } else {
        if (direction === 'upward') return theme.palette.error.main;
        if (direction === 'downward') return theme.palette.success.main;
      }
    }
    
    return theme.palette.primary.main;
  };
    if (isLoading || explanationLoading) {
    return (
      <Card className={className} variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  if (!explanation) {
    return null;
  }
  
  return (
    <Card 
      className={className} 
      variant="outlined"
      sx={{
        borderLeft: 3,
        borderColor: getPerformanceColor(),
        position: 'relative',
        mb: 2
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                mr: 1.5,
                display: 'flex',
                p: 0.8,
                borderRadius: '50%',
                backgroundColor: alpha(getPerformanceColor(), 0.1)
              }}
            >
              {getInsightIcon()}
            </Box>
            <Typography variant="h6" component="div">
              {explanation.title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {insightType === 'trend' && getTrendIcon()}
            <IconButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              size="small"
              sx={{ ml: 0.5 }}
            >
              <ExpandMoreIcon
                sx={{ 
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: theme.transitions.create('transform', {
                    duration: theme.transitions.duration.shortest,
                  }),
                }}
              />
            </IconButton>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {explanation.content}
        </Typography>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Insights:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 0 }}>
              {explanation.insights.map((insight, index) => (
                <Box component="li" key={index} sx={{ mb: 0.5 }}>
                  <Typography variant="body2">{insight}</Typography>
                </Box>
              ))}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1.5 }}>
              Recommendations:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 0 }}>
              {explanation.recommendations.map((recommendation, index) => (
                <Box component="li" key={index} sx={{ mb: 0.5 }}>
                  <Typography variant="body2">{recommendation}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
      
      {showDetailedView ? null : (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pb: 1 }}>
          <Button 
            size="small" 
            onClick={onShowDetailedView}
            endIcon={<HelpOutlineIcon fontSize="small" />}
          >
            Learn More
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default ContextualExplanation;