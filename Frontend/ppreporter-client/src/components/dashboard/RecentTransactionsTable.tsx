import React, { memo, useMemo, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Skeleton,
  useTheme
} from '@mui/material';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { TransactionData } from '../../types/redux';
import { useDispatch } from 'react-redux';
import { fetchRecentTransactions } from '../../store/slices/dashboardSlice';

interface RecentTransactionsTableProps {
  data: TransactionData[];
  isLoading?: boolean;
  maxHeight?: number | string;
  showHeader?: boolean;
  errorFallback?: (error: Error) => React.ReactElement;
}

/**
 * Recent Transactions Table component
 * Displays a table of recent transactions
 */
const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  data,
  isLoading = false,
  maxHeight = 400,
  showHeader = true
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Fetch recent transactions data if not provided
  useEffect(() => {
    if (!data || data.length === 0) {
      if (!isLoading) {
        dispatch(fetchRecentTransactions() as any);
      }
    }
  }, [dispatch, data, isLoading]);

  // Get status color based on transaction status
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return theme.palette.success.main;
      case 'pending':
      case 'processing':
        return theme.palette.warning.main;
      case 'failed':
      case 'declined':
        return theme.palette.error.main;
      case 'refunded':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get transaction type color
  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return theme.palette.success.main;
      case 'withdrawal':
        return theme.palette.error.main;
      case 'bonus':
        return theme.palette.info.main;
      case 'wager':
        return theme.palette.warning.main;
      case 'win':
        return theme.palette.success.light;
      default:
        return theme.palette.grey[500];
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <TableContainer component={Paper} sx={{ maxHeight }}>
        <Table stickyHeader size="small">
          {showHeader && (
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {Array.from(new Array(5)).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell align="right"><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={100} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography variant="body1" color="text.secondary">
          No transaction data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight }}>
      <Table stickyHeader size="small">
        {showHeader && (
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data.map((transaction) => (
            <TableRow key={transaction.id} hover>
              <TableCell>
                <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                  {transaction.playerName}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={transaction.type}
                  size="small"
                  sx={{
                    bgcolor: `${getTypeColor(transaction.type)}20`,
                    color: getTypeColor(transaction.type),
                    fontWeight: 'medium',
                    fontSize: '0.75rem'
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color={
                    transaction.type.toLowerCase() === 'deposit' || transaction.type.toLowerCase() === 'win'
                      ? 'success.main'
                      : transaction.type.toLowerCase() === 'withdrawal'
                      ? 'error.main'
                      : 'text.primary'
                  }
                >
                  {formatCurrency(transaction.amount, transaction.currency)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(transaction.timestamp)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={transaction.status}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(transaction.status)}20`,
                    color: getStatusColor(transaction.status),
                    fontWeight: 'medium',
                    fontSize: '0.75rem'
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(RecentTransactionsTable);
