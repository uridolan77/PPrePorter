import React, { memo, useCallback } from 'react';
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Chip,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import VirtualizedList from '../common/VirtualizedList';

/**
 * Recent Transactions Table component that displays the latest financial activities
 * with responsive behavior for mobile devices
 */
const RecentTransactionsTable = ({ data, isLoading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="textSecondary">
          No transactions available
        </Typography>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'info';
    }
  };

  // Mobile card view for transactions with virtualization
  if (isMobile) {
    // Memoized row renderer for mobile view
    const renderMobileRow = useCallback(({ style, data: transaction }) => (
      <div style={style}>
        <Card
          key={transaction.transactionID}
          sx={{ mb: 2, border: '1px solid rgba(0, 0, 0, 0.12)' }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="primary">
                {transaction.playerAlias || `Player #${transaction.playerID}`}
              </Typography>
              <Chip
                size="small"
                label={transaction.status}
                color={getStatusColor(transaction.status)}
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {formatDateTime(transaction.transactionDate)}
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Type
                </Typography>
                <Typography variant="body2">
                  {transaction.transactionType}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Amount
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(transaction.amount, transaction.currencyCode)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Method
                </Typography>
                <Typography variant="body2">
                  {transaction.paymentMethod || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">
                  Platform
                </Typography>
                <Typography variant="body2">
                  {transaction.platform || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    ), []);

    return (
      <VirtualizedList
        data={data}
        renderRow={renderMobileRow}
        height={500}
        itemSize={180} // Approximate height of each card
        loading={isLoading}
        emptyMessage="No transactions available"
      />
    );
  }

  // Desktop table view with virtualization
  // Table header component
  const TableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell>Date</TableCell>
        <TableCell>Player</TableCell>
        <TableCell>Type</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
  );

  // Memoized row renderer for desktop view
  const renderDesktopRow = useCallback(({ style, data: transaction }) => (
    <div style={style}>
      <TableRow
        key={transaction.transactionID}
        hover
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      >
        <TableCell>{formatDateTime(transaction.transactionDate)}</TableCell>
        <TableCell>
          <Typography noWrap sx={{ maxWidth: 120 }}>
            {transaction.playerAlias || `Player #${transaction.playerID}`}
          </Typography>
        </TableCell>
        <TableCell>{transaction.transactionType}</TableCell>
        <TableCell>
          {formatCurrency(transaction.amount, transaction.currencyCode)}
        </TableCell>
        <TableCell>
          <Chip
            size="small"
            label={transaction.status}
            color={getStatusColor(transaction.status)}
            variant="outlined"
          />
        </TableCell>
      </TableRow>
    </div>
  ), []);

  return (
    <Paper sx={{ height: 300, width: '100%' }}>
      <TableContainer sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHeader />
          <TableBody>
            <VirtualizedList
              data={data}
              renderRow={renderDesktopRow}
              height={250} // Leave room for the header
              itemSize={53} // Height of each row
              loading={isLoading}
              emptyMessage="No transactions available"
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

// Export as memoized component to prevent unnecessary re-renders
export default memo(RecentTransactionsTable);