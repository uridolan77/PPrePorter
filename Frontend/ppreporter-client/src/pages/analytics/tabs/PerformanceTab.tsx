import React, { memo } from 'react';
import { Grid, Paper, Typography, styled } from '@mui/material';
import { CARD_STYLE, HEADING_STYLE, PLACEHOLDER_STYLE } from '../styles';

// Styled component for placeholder to avoid complex style objects
const PlaceholderContainer = styled('div')(PLACEHOLDER_STYLE);

/**
 * PerformanceTab component
 * Displays detailed performance analytics
 */
const PerformanceTab: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper style={CARD_STYLE}>
          <Typography
            variant="h5"
            style={HEADING_STYLE}
            id="performance-analytics-heading"
          >
            Performance Analytics
          </Typography>
          <Typography variant="body1" paragraph>
            This section will contain detailed performance analytics including revenue analysis,
            player registrations, and performance heatmaps.
          </Typography>

          <PlaceholderContainer aria-label="Performance analytics placeholder">
            <Typography variant="body2" color="text.secondary">
              Performance analytics content will be displayed here
            </Typography>
          </PlaceholderContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default memo(PerformanceTab);
