import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Common components
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';

// Dashboard components
import TopGamesChart from '../TopGamesChart';

// Types
import { TopGamesSectionProps, TopGame } from '../../../types/topGamesSection';

/**
 * Top Games Section Component
 * Displays top performing games visualization
 */
const TopGamesSection: React.FC<TopGamesSectionProps> = ({
  data,
  isLoading = false,
  onDownload = () => {},
  onSettings = () => {}
}) => {
  // Memoize the games data to prevent unnecessary re-renders
  const gamesData: TopGame[] = useMemo(() => {
    return data || [];
  }, [data]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Top Performing Games
        </Typography>
        <Box>
          <Tooltip title="Download report">
            <IconButton
              size="small"
              sx={{ mr: 1 }}
              onClick={onDownload}
              aria-label="Download top games report"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton
              size="small"
              onClick={onSettings}
              aria-label="Top games settings"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Card>
        {isLoading && gamesData.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={300} />
          </Box>
        ) : (
          <TopGamesChart
            data={gamesData as any}
            isLoading={isLoading}
            emptyStateMessage="No game data available"
            errorFallback={(error: Error) => (
              <EmptyState
                message={`Error loading games data: ${error.message}`}
                icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
              />
            )}
          />
        )}
      </Card>
    </Box>
  );
};

export default TopGamesSection;
