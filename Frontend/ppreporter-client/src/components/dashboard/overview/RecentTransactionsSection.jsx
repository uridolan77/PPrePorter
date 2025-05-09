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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Common components
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';

// Dashboard components
import RecentTransactionsTable from '../RecentTransactionsTable';

/**
 * Recent Transactions Section Component
 * Displays recent transactions in a table format
 */
const RecentTransactionsSection = ({
  data,
  isLoading,
  onDownload,
  onSettings
}) => {
  // Memoize the transactions data to prevent unnecessary re-renders
  const transactionsData = useMemo(() => {
    return data || [];
  }, [data]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Recent Transactions
        </Typography>
        <Box>
          <Tooltip title="Download report">
            <IconButton 
              size="small" 
              sx={{ mr: 1 }} 
              onClick={onDownload}
              aria-label="Download transactions report"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton 
              size="small" 
              onClick={onSettings}
              aria-label="Transactions settings"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Card>
        {isLoading && transactionsData.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={300} />
          </Box>
        ) : !transactionsData.length ? (
          <EmptyState 
            message="No recent transactions available" 
            icon={<AttachMoneyIcon sx={{ fontSize: 48 }} />} 
          />
        ) : (
          <RecentTransactionsTable
            data={transactionsData}
            isLoading={isLoading}
            errorFallback={(error) => (
              <EmptyState 
                message={`Error loading transactions: ${error.message}`} 
                icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />} 
              />
            )}
          />
        )}
      </Card>
    </Box>
  );
};

export default RecentTransactionsSection;
