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

// Types
import { RecentTransactionsSectionProps, Transaction } from '../../../types/recentTransactionsSection';

/**
 * Recent Transactions Section Component
 * Displays recent transactions in a table format
 */
const RecentTransactionsSection: React.FC<RecentTransactionsSectionProps> = ({
  data,
  isLoading = false,
  onDownload = () => {},
  onSettings = () => {}
}) => {
  // Memoize the transactions data to prevent unnecessary re-renders
  const transactionsData: Transaction[] = useMemo(() => {
    return data || [];
  }, [data]);

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography variant="h5">
          Recent Transactions
        </Typography>
        <div>
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
        </div>
      </div>
      <Card>
        {isLoading && transactionsData.length === 0 ? (
          <div style={{ padding: 24 }}>
            <Skeleton variant="rectangular" height={300} />
          </div>
        ) : !transactionsData.length ? (
          <EmptyState
            message="No recent transactions available"
            icon={<AttachMoneyIcon sx={{ fontSize: 48 }} />}
          />
        ) : (
          <RecentTransactionsTable
            data={transactionsData as any}
            isLoading={isLoading}
            errorFallback={(error: Error) => (
              <EmptyState
                message={`Error loading transactions: ${error.message}`}
                icon={<ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />}
              />
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default RecentTransactionsSection;
