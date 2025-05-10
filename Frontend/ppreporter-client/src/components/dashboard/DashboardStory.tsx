import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Button,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  Paper,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsightsIcon from '@mui/icons-material/Insights';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import AnnotateIcon from '@mui/icons-material/Create';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import {
  DashboardStoryProps,
  InsightListItemProps,
  Insight,
  StoryData
} from '../../types/dashboardStory';

/**
 * InsightListItem component displays a single insight with actions
 */
const InsightListItem: React.FC<InsightListItemProps> = ({
  insight,
  isSaved,
  onSave,
  onRemove,
  onAnnotate
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  // Get insight icon based on type and category
  const getInsightIcon = (insight: Insight): React.ReactNode => {
    if (insight.InsightType === 'Anomaly') {
      return <WarningIcon color="warning" />;
    }

    switch (insight.Category) {
      case 'Revenue':
        return <TrendingUpIcon color="success" />;
      case 'Summary':
        return <InsightsIcon color="primary" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Get trend icon based on trend direction
  const getTrendIcon = (trend: string | undefined): React.ReactNode => {
    switch (trend?.toLowerCase()) {
      case 'positive':
        return <TrendingUpIcon color="success" />;
      case 'negative':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="action" />;
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 2,
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderLeft: 4,
        borderLeftColor: insight.TrendDirection === 'Positive' ? 'success.main' :
                        insight.TrendDirection === 'Negative' ? 'error.main' : 'grey.500',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {getInsightIcon(insight)}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {insight.Title}
          </Typography>
        </Box>
        <Box>
          <Tooltip title={isSaved ? "Remove from saved insights" : "Save insight"}>
            <IconButton size="small" onClick={isSaved ? onRemove : onSave}>
              {isSaved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Annotate">
            <IconButton size="small" onClick={onAnnotate}>
              <AnnotateIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton size="small">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography variant="body1">
        {insight.Description}
      </Typography>

      {(insight.DetailedExplanation || insight.RecommendedAction) && (
        <>
          <Button
            onClick={() => setExpanded(!expanded)}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: '0.3s'
                }}
              />
            }
            size="small"
            sx={{ mt: 1 }}
          >
            {expanded ? "Less detail" : "More detail"}
          </Button>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2 }}>
              {insight.DetailedExplanation && (
                <Typography variant="body2" paragraph>
                  {insight.DetailedExplanation}
                </Typography>
              )}

              {insight.RecommendedAction && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Recommended Action</Typography>
                  <Typography variant="body2">{insight.RecommendedAction}</Typography>
                </Alert>
              )}
            </Box>
          </Collapse>
        </>
      )}

      <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
        <Chip
          size="small"
          label={insight.Category}
          variant="outlined"
        />
        <Chip
          size="small"
          icon={getTrendIcon(insight.TrendDirection) as React.ReactElement}
          label={insight.TrendDirection}
          color={
            insight.TrendDirection === 'Positive' ? 'success' :
            insight.TrendDirection === 'Negative' ? 'error' : 'default'
          }
          variant="outlined"
        />
        {insight.InsightType === 'Anomaly' && (
          <Chip size="small" label="Anomaly" color="warning" variant="outlined" />
        )}
      </Box>
    </Paper>
  );
};

/**
 * DashboardStory component displays narrative insights about dashboard data
 * Implements "Progressive disclosure of insights" pattern
 */
const DashboardStory: React.FC<DashboardStoryProps> = ({
  storyData,
  isLoading = false,
  onAnnotate,
  onSaveInsight
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [savedInsights, setSavedInsights] = useState<Record<string, Insight>>({});
  const [currentSection, setCurrentSection] = useState<string>('summary');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Track viewed sections for progressive disclosure
  const [viewedSections, setViewedSections] = useState<Record<string, boolean>>({
    summary: true,
    opportunities: false,
    risks: false,
    actions: false,
  });

  useEffect(() => {
    // Load saved insights from local storage
    const savedItems = localStorage.getItem('savedInsights');
    if (savedItems) {
      setSavedInsights(JSON.parse(savedItems));
    }
  }, []);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  const handleSectionChange = (section: string): void => {
    setCurrentSection(section);
    setViewedSections({ ...viewedSections, [section]: true });
  };

  const handleSaveInsight = (insight: Insight): void => {
    const newSavedInsights = {
      ...savedInsights,
      [insight.MetricKey]: insight
    };
    setSavedInsights(newSavedInsights);
    localStorage.setItem('savedInsights', JSON.stringify(newSavedInsights));

    if (onSaveInsight) {
      onSaveInsight(insight);
    }
  };

  const handleRemoveSavedInsight = (insightKey: string): void => {
    const newSavedInsights = { ...savedInsights };
    delete newSavedInsights[insightKey];
    setSavedInsights(newSavedInsights);
    localStorage.setItem('savedInsights', JSON.stringify(newSavedInsights));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: 3 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              Analyzing your data to generate insights...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!storyData) {
    return null;
  }

  const getImportanceColor = (importance: number): string => {
    if (importance >= 8) return theme.palette.error.main;
    if (importance >= 6) return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  const getTrendIcon = (trend: string | undefined): React.ReactNode => {
    switch (trend?.toLowerCase()) {
      case 'positive':
        return <TrendingUpIcon color="success" />;
      case 'negative':
        return <TrendingDownIcon color="error" />;
      default:
        return <TrendingFlatIcon color="action" />;
    }
  };

  const getInsightIcon = (insight: Insight): React.ReactNode => {
    if (insight.InsightType === 'Anomaly') {
      return <PriorityHighIcon style={{ color: getImportanceColor(insight.Importance) }} />;
    }
    return <InsightsIcon color="primary" />;
  };

  const renderInsightList = (insights: Insight[]): React.ReactNode => {
    if (!insights || insights.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
          No insights available for this section.
        </Typography>
      );
    }

    return (
      <List>
        {insights.map((insight, index) => (
          <InsightListItem
            key={index}
            insight={insight}
            isSaved={Boolean(savedInsights[insight.MetricKey])}
            onSave={() => handleSaveInsight(insight)}
            onRemove={() => handleRemoveSavedInsight(insight.MetricKey)}
            onAnnotate={() => onAnnotate && onAnnotate(insight)}
          />
        ))}
      </List>
    );
  };

  const renderSectionContent = (): React.ReactNode => {
    switch (currentSection) {
      case 'summary':
        return (
          <>
            <Typography variant="h6" gutterBottom>Key Insights</Typography>
            {renderInsightList(storyData.KeyInsights)}
          </>
        );
      case 'opportunities':
        return (
          <>
            <Typography variant="h6" gutterBottom>Opportunities</Typography>
            <Typography variant="body1" paragraph>{storyData.OpportunityAnalysis}</Typography>
            <Divider sx={{ my: 2 }} />
            {storyData.KeyInsights && renderInsightList(
              storyData.KeyInsights.filter(i => i.TrendDirection === 'Positive')
            )}
          </>
        );
      case 'risks':
        return (
          <>
            <Typography variant="h6" gutterBottom>Risks & Concerns</Typography>
            <Typography variant="body1" paragraph>{storyData.RiskAnalysis}</Typography>
            <Divider sx={{ my: 2 }} />
            {storyData.SignificantAnomalies && storyData.SignificantAnomalies.length > 0 && (
              <>
                <Typography variant="subtitle1" gutterBottom>Detected Anomalies</Typography>
                <List>
                  {storyData.SignificantAnomalies.map((anomaly, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon>
                        <WarningIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={anomaly.Title}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              {anomaly.Description}
                            </Typography>
                            {anomaly.PotentialCause && (
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Potential cause: {anomaly.PotentialCause}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </>
        );
      case 'actions':
        return (
          <>
            <Typography variant="h6" gutterBottom>Recommended Actions</Typography>
            {storyData.RecommendedActions && storyData.RecommendedActions.length > 0 ? (
              <List>
                {storyData.RecommendedActions.map((action, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Chip
                        label={index + 1}
                        color="primary"
                        size="small"
                        sx={{ borderRadius: '50%', minWidth: 30 }}
                      />
                    </ListItemIcon>
                    <ListItemText primary={action} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
                No specific actions recommended at this time.
              </Typography>
            )}
          </>
        );
      default:
        return null;
    }
  };

  // Get next recommended section based on what user has already viewed
  const getNextSection = (): string | null => {
    if (!viewedSections.opportunities) return 'opportunities';
    if (!viewedSections.risks) return 'risks';
    if (!viewedSections.actions) return 'actions';
    return null;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            {storyData.Title}
          </Typography>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
          >
            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
          </IconButton>
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph>
          {storyData.Summary}
        </Typography>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Business Context
          </Typography>
          <Typography variant="body2" paragraph>
            {storyData.BusinessContext}
          </Typography>
        </Collapse>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
          {storyData.Highlights.map((highlight, index) => (
            <Chip
              key={index}
              label={highlight}
              color={index === 0 ? "primary" : "default"}
              variant={index === 0 ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </Box>

        {/* Section navigation - desktop version */}
        {!isMobile && (
          <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Button
              onClick={() => handleSectionChange('summary')}
              sx={{
                minWidth: 120,
                py: 1,
                color: currentSection === 'summary' ? 'primary.main' : 'text.secondary',
                borderBottom: currentSection === 'summary' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0
              }}
            >
              Summary
            </Button>
            <Button
              onClick={() => handleSectionChange('opportunities')}
              sx={{
                minWidth: 120,
                py: 1,
                color: currentSection === 'opportunities' ? 'primary.main' : 'text.secondary',
                borderBottom: currentSection === 'opportunities' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0
              }}
            >
              Opportunities
            </Button>
            <Button
              onClick={() => handleSectionChange('risks')}
              sx={{
                minWidth: 120,
                py: 1,
                color: currentSection === 'risks' ? 'primary.main' : 'text.secondary',
                borderBottom: currentSection === 'risks' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0
              }}
            >
              Risks
            </Button>
            <Button
              onClick={() => handleSectionChange('actions')}
              sx={{
                minWidth: 120,
                py: 1,
                color: currentSection === 'actions' ? 'primary.main' : 'text.secondary',
                borderBottom: currentSection === 'actions' ? 2 : 0,
                borderColor: 'primary.main',
                borderRadius: 0
              }}
            >
              Actions
            </Button>
          </Box>
        )}

        {/* Section navigation - mobile version */}
        {isMobile && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip
              label="Summary"
              onClick={() => handleSectionChange('summary')}
              color={currentSection === 'summary' ? "primary" : "default"}
              variant={currentSection === 'summary' ? "filled" : "outlined"}
            />
            <Chip
              label="Opportunities"
              onClick={() => handleSectionChange('opportunities')}
              color={currentSection === 'opportunities' ? "primary" : "default"}
              variant={currentSection === 'opportunities' ? "filled" : "outlined"}
            />
            <Chip
              label="Risks"
              onClick={() => handleSectionChange('risks')}
              color={currentSection === 'risks' ? "primary" : "default"}
              variant={currentSection === 'risks' ? "filled" : "outlined"}
            />
            <Chip
              label="Actions"
              onClick={() => handleSectionChange('actions')}
              color={currentSection === 'actions' ? "primary" : "default"}
              variant={currentSection === 'actions' ? "filled" : "outlined"}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Current section content */}
        <Box sx={{ minHeight: 200 }}>
          {renderSectionContent()}
        </Box>

        {/* Progressive disclosure - Next section suggestion */}
        {getNextSection() && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Continue your analysis
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {getNextSection() === 'opportunities' && "Discover potential opportunities in your data"}
              {getNextSection() === 'risks' && "Review potential risks that require attention"}
              {getNextSection() === 'actions' && "See recommended actions based on current data"}
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleSectionChange(getNextSection() || '')}
              size="small"
            >
              {getNextSection() === 'opportunities' && "View Opportunities"}
              {getNextSection() === 'risks' && "View Risks"}
              {getNextSection() === 'actions' && "View Actions"}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardStory;
