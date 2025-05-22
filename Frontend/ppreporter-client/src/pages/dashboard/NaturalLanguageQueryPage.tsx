import React, { useState } from 'react';
import {
  Grid,
  Container,
  Typography,
  Paper,
  useTheme,
  Divider,
  Stack
} from '@mui/material';
import SimpleBox from '../../components/common/SimpleBox';
import NaturalLanguageSearch from '../../components/dashboard/NaturalLanguageSearch';
import NaturalLanguageResults from '../../components/dashboard/NaturalLanguageResults';

/**
 * NaturalLanguageQueryPage component provides a dedicated page for natural language queries
 * Allows users to explore their data through conversational queries
 */
const NaturalLanguageQueryPage: React.FC = () => {
  const theme = useTheme();
  const [hasResults, setHasResults] = useState<boolean>(false);

  const handleResultsReceived = (results: any): void => {
    setHasResults(true);
  };

  return (
    <Container maxWidth="xl">
      <SimpleBox sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Natural Language Query
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ask questions about your data in plain English and get instant insights
        </Typography>
      </SimpleBox>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <NaturalLanguageSearch onResultsReceived={handleResultsReceived} />
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <NaturalLanguageResults height={600} />
        </Grid>
      </Grid>

      <SimpleBox sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Examples of questions you can ask</Typography>
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight="medium">
              "Show me the top 10 games by revenue for UK players over the last month"
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight="medium">
              "What was our GGR by country last quarter?"
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight="medium">
              "Compare deposits vs withdrawals by payment method this year"
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight="medium">
              "Show me retention rates for mobile players segmented by game type"
            </Typography>
          </Paper>
        </Stack>
      </SimpleBox>
    </Container>
  );
};

export default NaturalLanguageQueryPage;
