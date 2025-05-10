import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Slider,
  Chip,
  IconButton
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { Annotation, WhatIfParameters } from '../../../types/dataExplorer';

interface NLHelpDialogProps {
  open: boolean;
  onClose: () => void;
  suggestedQueries: string[];
  onQuerySelect: (query: string) => void;
}

/**
 * Natural Language Help Dialog
 */
export const NLHelpDialog: React.FC<NLHelpDialogProps> = ({
  open,
  onClose,
  suggestedQueries,
  onQuerySelect
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 1 }} />
          Natural Language Search Guide
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" gutterBottom>How to use natural language search</Typography>
        <Typography variant="body1" paragraph>
          You can analyze data by asking questions in natural language. The system understands questions about your data
          and generates appropriate visualizations.
        </Typography>

        <Typography variant="subtitle1" gutterBottom>Example queries:</Typography>
        <Box sx={{ mb: 3 }}>
          {suggestedQueries.map((query, index) => (
            <Chip
              key={index}
              label={query}
              clickable
              onClick={() => {
                onQuerySelect(query);
                onClose();
              }}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>

        <Typography variant="subtitle1" gutterBottom>Tips for effective queries:</Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Be specific about metrics:</strong> "Show deposits and withdrawals" is better than "Show data"
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Specify time periods:</strong> "Last month", "year to date", "last 7 days"
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Mention visualization type:</strong> "as a bar chart", "in a pie chart", "on a line graph"
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body2">
              <strong>Ask for comparisons:</strong> "Compare deposit trends across game types"
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">
              <strong>Request specific insights:</strong> "Which game has the highest return rate?"
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" gutterBottom color="primary">
            Data available for querying:
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Time Series Data:</strong> deposits, withdrawals, newUsers, activeUsers, profit, betCount
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Game Performance:</strong> revenue, players, bets, returnRate, growth by game type
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Player Segments:</strong> VIP, High Value, Regular, Casual, New players
          </Typography>
          <Typography variant="body2">
            <strong>Geographic Data:</strong> player counts, revenue, deposits by country
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

interface WhatIfDialogProps {
  open: boolean;
  onClose: () => void;
  dataSource: string;
  parameters: WhatIfParameters;
  onParameterChange: (param: string, value: number) => void;
  onApply: () => void;
}

/**
 * What-If Scenario Dialog
 */
export const WhatIfDialog: React.FC<WhatIfDialogProps> = ({
  open,
  onClose,
  dataSource,
  parameters,
  onParameterChange,
  onApply
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        What-If Scenario Modeling
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" paragraph>
          Adjust parameters to model different business scenarios and see their impact on your metrics.
        </Typography>

        {dataSource === 'gamePerformanceData' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Revenue Growth (%)
            </Typography>
            <Slider
              value={parameters.revenueGrowth || 0}
              onChange={(_, value) => onParameterChange('revenueGrowth', value as number)}
              aria-labelledby="revenue-growth-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={-20}
              max={50}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Player Growth (%)
            </Typography>
            <Slider
              value={parameters.playerGrowth || 0}
              onChange={(_, value) => onParameterChange('playerGrowth', value as number)}
              aria-labelledby="player-growth-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={-20}
              max={50}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Return Rate Adjustment (%)
            </Typography>
            <Slider
              value={parameters.returnRateAdjustment || 0}
              onChange={(_, value) => onParameterChange('returnRateAdjustment', value as number)}
              aria-labelledby="return-rate-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={-10}
              max={10}
            />
          </Box>
        )}

        {dataSource === 'timeSeriesData' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Deposit Growth (%)
            </Typography>
            <Slider
              value={parameters.depositGrowth || 0}
              onChange={(_, value) => onParameterChange('depositGrowth', value as number)}
              aria-labelledby="deposit-growth-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={-20}
              max={50}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Withdrawal Reduction (%)
            </Typography>
            <Slider
              value={parameters.withdrawalReduction || 0}
              onChange={(_, value) => onParameterChange('withdrawalReduction', value as number)}
              aria-labelledby="withdrawal-reduction-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={-20}
              max={50}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Player Retention Improvement (%)
            </Typography>
            <Slider
              value={parameters.playerRetentionImprovement || 0}
              onChange={(_, value) => onParameterChange('playerRetentionImprovement', value as number)}
              aria-labelledby="player-retention-slider"
              valueLabelDisplay="auto"
              step={1}
              marks
              min={-10}
              max={30}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onApply}
          variant="contained"
          color="primary"
        >
          Apply Scenario
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface AnnotationDialogProps {
  open: boolean;
  onClose: () => void;
  annotation: Annotation;
  onAnnotationTextChange: (text: string) => void;
  onSave: () => void;
}

/**
 * Annotation Dialog
 */
export const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  open,
  onClose,
  annotation,
  onAnnotationTextChange,
  onSave
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Add Annotation
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          id="annotation-text"
          label="Annotation"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={annotation.text}
          onChange={(e) => onAnnotationTextChange(e.target.value)}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          disabled={!annotation.text.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
