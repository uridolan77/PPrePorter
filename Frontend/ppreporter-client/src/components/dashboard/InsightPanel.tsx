import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Collapse,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  BubbleChart as BubbleChartIcon,
  FindReplace as FindReplaceIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Insights,
  Anomaly,
  Trend,
  Recommendation,
  DataQualityIssue,
  ExpandedSections,
  ExpandedItems,
  SeverityLevel,
  TrendDirection,
  ActionType
} from '../../types/insights';
import { CommonProps } from '../../types/common';

// Sample insights data for demonstration
const sampleInsights: Insights = {
  anomalies: [
    {
      id: 'anomaly1',
      title: 'Unusual drop in player activity',
      description: 'There is a significant 17% decrease in player logins from Germany over the past 48 hours, which deviates from the typical pattern.',
      severity: 'high',
      timestamp: '2025-05-07T14:30:00Z',
      status: 'unresolved',
      category: 'player-behavior',
      relatedMetrics: ['player-logins', 'active-players'],
      recommendation: 'Investigate technical issues affecting German players or check if any recent promotions ended.'
    },
    {
      id: 'anomaly2',
      title: 'Spike in failed payment attempts',
      description: 'Payment failures increased by 23% in the last 24 hours, primarily affecting visa card transactions.',
      severity: 'medium',
      timestamp: '2025-05-08T09:15:00Z',
      status: 'investigating',
      category: 'payments',
      relatedMetrics: ['payment-failures', 'deposits'],
      recommendation: 'Check payment processor status and contact the payment gateway provider.'
    }
  ],
  trends: [
    {
      id: 'trend1',
      title: 'Increasing mobile usage',
      description: 'Mobile platform usage has grown 8.5% week-over-week, now accounting for 67% of all activity.',
      direction: 'up',
      magnitude: 8.5,
      timeframe: 'week',
      category: 'platform',
      opportunity: 'Consider optimizing more games for mobile play and improving mobile UI for deposit flows.'
    },
    {
      id: 'trend2',
      title: 'Rising popularity of live dealer games',
      description: 'Live dealer games revenue increased by 15.2% month-over-month, outpacing all other game categories.',
      direction: 'up',
      magnitude: 15.2,
      timeframe: 'month',
      category: 'game-type',
      opportunity: 'Feature live dealer games more prominently and consider adding more tables during peak hours.'
    },
    {
      id: 'trend3',
      title: 'Declining slot performance',
      description: 'Classic slots revenue is down 3.7% month-over-month despite stable player numbers.',
      direction: 'down',
      magnitude: 3.7,
      timeframe: 'month',
      category: 'game-type',
      opportunity: 'Review RTP settings and consider refreshing the slots offering with new titles.'
    }
  ],
  recommendations: [
    {
      id: 'rec1',
      title: 'Optimize bonus structure for high-value players',
      description: 'Analysis shows that VIP players respond better to cashback offers than deposit match bonuses.',
      impact: 'high',
      effort: 'medium',
      category: 'player-retention',
      expectedOutcome: 'Projected 12% increase in VIP player deposits and 8% improvement in retention.'
    },
    {
      id: 'rec2',
      title: 'Implement dynamic bet limits',
      description: 'Setting dynamic bet limits based on player behavior patterns could improve risk management.',
      impact: 'medium',
      effort: 'high',
      category: 'risk-management',
      expectedOutcome: 'Potential 5% reduction in bonus abuse and improved regulatory compliance.'
    },
    {
      id: 'rec3',
      title: 'Launch targeted weekend promotion',
      description: 'Data indicates an opportunity for a targeted promotion to re-engage dormant players this weekend.',
      impact: 'medium',
      effort: 'low',
      category: 'marketing',
      expectedOutcome: 'Expected to reactivate 5-8% of dormant players from the last 30 days.'
    }
  ],
  dataQualityIssues: [
    {
      id: 'dq1',
      title: 'Missing geolocation data',
      description: 'Approximately 3.2% of new registrations in the last week have missing or invalid geolocation data.',
      severity: 'low',
      status: 'investigating',
      affectedSystems: ['player-database', 'compliance-reporting'],
      recommendation: 'Check the geolocation API integration and validation rules.'
    }
  ]
};

export interface InsightPanelProps extends CommonProps {
  /**
   * Insights data
   */
  insights?: Insights;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Insight action handler
   */
  onInsightAction?: (insightId: string, actionType: ActionType) => void;

  /**
   * Refresh insights handler
   */
  onRefreshInsights?: () => void;

  /**
   * Feedback handler
   */
  onFeedback?: (insightId: string, isPositive: boolean) => void;
}

/**
 * InsightPanel component that displays AI-powered insights and recommendations
 * based on data analysis
 */
const InsightPanel: React.FC<InsightPanelProps> = ({
  insights = sampleInsights,
  isLoading = false,
  onInsightAction = () => {},
  onRefreshInsights = () => {},
  onFeedback = () => {}
}) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    anomalies: true,
    trends: true,
    recommendations: true,
    dataQualityIssues: false
  });
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({});

  // Toggle a section's expanded state
  const toggleSection = (section: keyof ExpandedSections): void => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Toggle an item's expanded state
  const toggleItem = (itemId: string): void => {
    setExpandedItems({
      ...expandedItems,
      [itemId]: !expandedItems[itemId]
    });
  };

  // Handle feedback (thumbs up/down)
  const handleFeedback = (insightId: string, isPositive: boolean): void => {
    onFeedback(insightId, isPositive);
  };

  // Get color for severity or impact
  const getSeverityColor = (severity: SeverityLevel): string => {
    switch(severity.toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Get icon for trend direction
  const getTrendIcon = (direction: TrendDirection): React.ReactNode => {
    return direction === 'up'
      ? <TrendingUpIcon color="success" />
      : <TrendingDownIcon color="error" />;
  };

  // Format relative date
  const formatRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Render section header
  const renderSectionHeader = (title: string, count: number, section: keyof ExpandedSections): React.ReactNode => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        py: 1,
        px: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        mb: 1
      }}
      onClick={() => toggleSection(section)}
    >
      <Typography variant="h6" component="h3">
        {title}
      </Typography>
      {count > 0 && (
        <Chip
          label={count}
          size="small"
          sx={{ ml: 1 }}
          color={section === 'anomalies' ? 'error' : 'primary'}
        />
      )}
      <Box sx={{ flexGrow: 1 }} />
      {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </Box>
  );

  // Render anomalies section
  const renderAnomalies = (): React.ReactNode => (
    <Box sx={{ mb: 3 }}>
      {renderSectionHeader('Anomalies', insights.anomalies.length, 'anomalies')}

      <Collapse in={expandedSections.anomalies}>
        {insights.anomalies.length === 0 ? (
          <Typography sx={{ p: 2, fontStyle: 'italic' }}>
            No anomalies detected at this time
          </Typography>
        ) : (
          <List sx={{ pt: 0 }}>
            {insights.anomalies.map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    mb: 2,
                    borderLeft: 4,
                    borderColor: getSeverityColor(anomaly.severity),
                    overflow: 'hidden'
                  }}
                >
                  <ListItem
                    button
                    onClick={() => toggleItem(anomaly.id)}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <ListItemIcon>
                      <WarningIcon color={anomaly.severity === 'high' ? 'error' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography fontWeight="bold">
                            {anomaly.title}
                          </Typography>
                          <Chip
                            label={anomaly.severity}
                            size="small"
                            sx={{ ml: 1 }}
                            color={
                              anomaly.severity === 'high'
                                ? 'error'
                                : anomaly.severity === 'medium'
                                  ? 'warning'
                                  : 'info'
                            }
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            {formatRelativeDate(anomaly.timestamp)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {anomaly.description}
                        </Typography>
                      }
                    />
                    {expandedItems[anomaly.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>

                  <Collapse in={expandedItems[anomaly.id]}>
                    <Box sx={{ px: 3, pb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommendation:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {anomaly.recommendation}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          Category: {anomaly.category}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onInsightAction(anomaly.id, 'resolve')}
                            sx={{ mr: 1 }}
                          >
                            Investigate
                          </Button>
                          <Tooltip title="Thumbs Up">
                            <IconButton size="small" onClick={() => handleFeedback(anomaly.id, true)}>
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Thumbs Down">
                            <IconButton size="small" onClick={() => handleFeedback(anomaly.id, false)}>
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </motion.div>
            ))}
          </List>
        )}
      </Collapse>
    </Box>
  );

  // Render trends section
  const renderTrends = (): React.ReactNode => (
    <Box sx={{ mb: 3 }}>
      {renderSectionHeader('Trends', insights.trends.length, 'trends')}

      <Collapse in={expandedSections.trends}>
        {insights.trends.length === 0 ? (
          <Typography sx={{ p: 2, fontStyle: 'italic' }}>
            No significant trends identified at this time
          </Typography>
        ) : (
          <List sx={{ pt: 0 }}>
            {insights.trends.map((trend, index) => (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    mb: 2,
                    borderLeft: 4,
                    borderColor: trend.direction === 'up'
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                    overflow: 'hidden'
                  }}
                >
                  <ListItem
                    button
                    onClick={() => toggleItem(trend.id)}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <ListItemIcon>
                      {getTrendIcon(trend.direction)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography fontWeight="bold">
                            {trend.title}
                          </Typography>
                          <Chip
                            label={`${trend.direction === 'up' ? '+' : '-'}${trend.magnitude}%`}
                            size="small"
                            sx={{ ml: 1 }}
                            color={trend.direction === 'up' ? 'success' : 'error'}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            {trend.timeframe}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {trend.description}
                        </Typography>
                      }
                    />
                    {expandedItems[trend.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>

                  <Collapse in={expandedItems[trend.id]}>
                    <Box sx={{ px: 3, pb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Opportunity:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {trend.opportunity}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          Category: {trend.category}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onInsightAction(trend.id, 'analyze')}
                            sx={{ mr: 1 }}
                          >
                            Analyze
                          </Button>
                          <Tooltip title="Thumbs Up">
                            <IconButton size="small" onClick={() => handleFeedback(trend.id, true)}>
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Thumbs Down">
                            <IconButton size="small" onClick={() => handleFeedback(trend.id, false)}>
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </motion.div>
            ))}
          </List>
        )}
      </Collapse>
    </Box>
  );

  // Render recommendations section
  const renderRecommendations = (): React.ReactNode => (
    <Box sx={{ mb: 3 }}>
      {renderSectionHeader('Recommendations', insights.recommendations.length, 'recommendations')}

      <Collapse in={expandedSections.recommendations}>
        {insights.recommendations.length === 0 ? (
          <Typography sx={{ p: 2, fontStyle: 'italic' }}>
            No recommendations available at this time
          </Typography>
        ) : (
          <List sx={{ pt: 0 }}>
            {insights.recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    mb: 2,
                    borderLeft: 4,
                    borderColor: getSeverityColor(rec.impact),
                    overflow: 'hidden'
                  }}
                >
                  <ListItem
                    button
                    onClick={() => toggleItem(rec.id)}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <ListItemIcon>
                      <LightbulbIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography fontWeight="bold">
                            {rec.title}
                          </Typography>
                          <Box sx={{ display: 'flex', ml: 1 }}>
                            <Chip
                              label={`Impact: ${rec.impact}`}
                              size="small"
                              sx={{ mr: 0.5 }}
                              color={
                                rec.impact === 'high'
                                  ? 'success'
                                  : rec.impact === 'medium'
                                    ? 'primary'
                                    : 'default'
                              }
                            />
                            <Chip
                              label={`Effort: ${rec.effort}`}
                              size="small"
                              color={
                                rec.effort === 'low'
                                  ? 'success'
                                  : rec.effort === 'medium'
                                    ? 'primary'
                                    : 'default'
                              }
                            />
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {rec.description}
                        </Typography>
                      }
                    />
                    {expandedItems[rec.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>

                  <Collapse in={expandedItems[rec.id]}>
                    <Box sx={{ px: 3, pb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Expected Outcome:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {rec.expectedOutcome}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          Category: {rec.category}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => onInsightAction(rec.id, 'implement')}
                            sx={{ mr: 1 }}
                          >
                            Implement
                          </Button>
                          <Tooltip title="Thumbs Up">
                            <IconButton size="small" onClick={() => handleFeedback(rec.id, true)}>
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Thumbs Down">
                            <IconButton size="small" onClick={() => handleFeedback(rec.id, false)}>
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </motion.div>
            ))}
          </List>
        )}
      </Collapse>
    </Box>
  );

  // Render data quality issues section
  const renderDataQualityIssues = (): React.ReactNode => (
    <Box sx={{ mb: 3 }}>
      {renderSectionHeader('Data Quality Issues', insights.dataQualityIssues.length, 'dataQualityIssues')}

      <Collapse in={expandedSections.dataQualityIssues}>
        {insights.dataQualityIssues.length === 0 ? (
          <Typography sx={{ p: 2, fontStyle: 'italic' }}>
            No data quality issues detected at this time
          </Typography>
        ) : (
          <List sx={{ pt: 0 }}>
            {insights.dataQualityIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    mb: 2,
                    borderLeft: 4,
                    borderColor: getSeverityColor(issue.severity),
                    overflow: 'hidden'
                  }}
                >
                  <ListItem
                    button
                    onClick={() => toggleItem(issue.id)}
                    sx={{ alignItems: 'flex-start' }}
                  >
                    <ListItemIcon>
                      <InfoIcon color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography fontWeight="bold">
                            {issue.title}
                          </Typography>
                          <Chip
                            label={issue.severity}
                            size="small"
                            sx={{ ml: 1 }}
                            color={
                              issue.severity === 'high'
                                ? 'error'
                                : issue.severity === 'medium'
                                  ? 'warning'
                                  : 'info'
                            }
                          />
                          <Chip
                            label={issue.status}
                            size="small"
                            sx={{ ml: 0.5 }}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {issue.description}
                        </Typography>
                      }
                    />
                    {expandedItems[issue.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItem>

                  <Collapse in={expandedItems[issue.id]}>
                    <Box sx={{ px: 3, pb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Recommendation:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {issue.recommendation}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          Affected Systems: {issue.affectedSystems.join(', ')}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onInsightAction(issue.id, 'resolve')}
                            sx={{ mr: 1 }}
                          >
                            Investigate
                          </Button>
                          <Tooltip title="Thumbs Up">
                            <IconButton size="small" onClick={() => handleFeedback(issue.id, true)}>
                              <ThumbUpIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Thumbs Down">
                            <IconButton size="small" onClick={() => handleFeedback(issue.id, false)}>
                              <ThumbDownIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>
              </motion.div>
            ))}
          </List>
        )}
      </Collapse>
    </Box>
  );

  // Main render
  return (
    <Card sx={{ ...sx }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BubbleChartIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="span">
              AI Insights
            </Typography>
          </Box>
        }
        action={
          <Box>
            <Tooltip title="Refresh Insights">
              <IconButton onClick={onRefreshInsights} disabled={isLoading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Trends">
              <IconButton>
                <TimelineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Advanced Analysis">
              <IconButton>
                <FindReplaceIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      <CardContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                AI-powered analysis has identified {insights.anomalies.length} anomalies,
                {insights.trends.length} trends, and {insights.recommendations.length} recommendations
                based on your data.
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {insights.anomalies.length > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={`${insights.anomalies.length} Anomalies`}
                    color="error"
                    variant="outlined"
                    onClick={() => toggleSection('anomalies')}
                  />
                )}
                {insights.trends.length > 0 && (
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${insights.trends.length} Trends`}
                    color="primary"
                    variant="outlined"
                    onClick={() => toggleSection('trends')}
                  />
                )}
                {insights.recommendations.length > 0 && (
                  <Chip
                    icon={<LightbulbIcon />}
                    label={`${insights.recommendations.length} Recommendations`}
                    color="success"
                    variant="outlined"
                    onClick={() => toggleSection('recommendations')}
                  />
                )}
                {insights.dataQualityIssues.length > 0 && (
                  <Chip
                    icon={<InfoIcon />}
                    label={`${insights.dataQualityIssues.length} Data Quality Issues`}
                    color="info"
                    variant="outlined"
                    onClick={() => toggleSection('dataQualityIssues')}
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />
            </Box>

            {/* Insights sections */}
            {renderAnomalies()}
            {renderTrends()}
            {renderRecommendations()}
            {renderDataQualityIssues()}

            {/* No insights state */}
            {insights.anomalies.length === 0 &&
             insights.trends.length === 0 &&
             insights.recommendations.length === 0 &&
             insights.dataQualityIssues.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  All Clear
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No significant insights or issues detected at this time.
                </Typography>
                <Button
                  startIcon={<RefreshIcon />}
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={onRefreshInsights}
                >
                  Refresh Analysis
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightPanel;
