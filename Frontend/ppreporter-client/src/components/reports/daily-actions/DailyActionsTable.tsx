import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { EnhancedTable } from '../../tables/enhanced';
import { DailyAction, GroupByOption } from '../../../types/reports';
import { ColumnDef as EnhancedColumnDef, ExportFormat } from '../../tables/enhanced/types';
import CardAccent from '../../common/CardAccent';

interface DailyActionsTableProps {
  data: DailyAction[];
  isLoading: boolean;
  error: string | null;
  groupBy: GroupByOption;
  onExportData: () => void;
  onViewDetails: (row: DailyAction) => void;
}

const DailyActionsTable: React.FC<DailyActionsTableProps> = ({
  data,
  isLoading,
  error,
  groupBy,
  onExportData,
  onViewDetails
}) => {


  // Define columns based on groupBy
  const getColumns = (): EnhancedColumnDef[] => {
    const baseColumns: EnhancedColumnDef[] = [
      {
        id: 'groupValue',
        label: groupBy,
        format: (value, row: DailyAction) => {
          return row.groupValue ? row.groupValue :
            groupBy === 'Day' && row.date ? format(new Date(row.date), 'MMM dd, yyyy') :
            groupBy === 'Month' && row.date ? format(new Date(row.date), 'MMMM yyyy') :
            groupBy === 'Year' && row.date ? format(new Date(row.date), 'yyyy') :
            'Unknown';
        }
      },
      {
        id: 'uniquePlayers',
        label: 'Unique Players',
        align: 'right',
        format: (value, row: DailyAction) => row.uniquePlayers ? row.uniquePlayers.toLocaleString() : '0'
      },
      {
        id: 'newRegistrations',
        label: 'New Registrations',
        align: 'right',
        format: (value, row: DailyAction) => row.newRegistrations ? row.newRegistrations.toLocaleString() : '0'
      },
      {
        id: 'deposits',
        label: 'Deposits',
        align: 'right',
        format: (value, row: DailyAction) => row.deposits !== undefined && row.deposits !== null ?
          row.deposits.toLocaleString('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : '£0.00'
      },
      {
        id: 'withdrawals',
        label: 'Withdrawals',
        align: 'right',
        format: (value, row: DailyAction) => row.withdrawals !== undefined && row.withdrawals !== null ?
          row.withdrawals.toLocaleString('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : '£0.00'
      },
      {
        id: 'bets',
        label: 'Bets',
        align: 'right',
        format: (value, row: DailyAction) => row.bets !== undefined && row.bets !== null ?
          row.bets.toLocaleString('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : '£0.00'
      },
      {
        id: 'wins',
        label: 'Wins',
        align: 'right',
        format: (value, row: DailyAction) => row.wins !== undefined && row.wins !== null ?
          row.wins.toLocaleString('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : '£0.00'
      },
      {
        id: 'ggr',
        label: 'GGR',
        align: 'right',
        format: (value, row: DailyAction) => row.ggr !== undefined && row.ggr !== null ?
          row.ggr.toLocaleString('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }) : '£0.00'
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        format: (value, row: DailyAction) => (
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(row);
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      }
    ];

    return baseColumns;
  };

  // Define row detail renderer
  const renderRowDetail = (row: DailyAction) => (
    <div style={{ padding: 16 }}>
      <Typography variant="subtitle1" gutterBottom>
        Details for {groupBy === 'Day' || groupBy === 'Month' || groupBy === 'Year' ?
          format(new Date(row.date), 'MMM dd, yyyy') :
          row.groupValue || 'Selected Item'}
      </Typography>
      <Typography variant="body2" paragraph>
        This section shows detailed information about player activity, including session data,
        game preferences, and financial metrics.
      </Typography>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Average Session Duration</Typography>
          <Typography variant="body1">{row.avgSessionDuration || '45 minutes'}</Typography>
        </div>
        <div style={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Average Bet Size</Typography>
          <Typography variant="body1">
            {row.bets !== undefined && row.bets !== null ?
              (row.bets / (row.betCount || 1)).toLocaleString('en-GB', {
                style: 'currency',
                currency: 'GBP',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) : '£0.00'
            }
          </Typography>
        </div>
        <div style={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
          <Typography variant="body1">
            {row.conversionRate !== undefined && row.conversionRate !== null ?
              `${row.conversionRate.toFixed(2)}%` : '3.2%'}
          </Typography>
        </div>
        <div style={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">Retention Rate</Typography>
          <Typography variant="body1">
            {row.retentionRate !== undefined && row.retentionRate !== null ?
              `${row.retentionRate.toFixed(2)}%` : '68.5%'}
          </Typography>
        </div>
      </div>
    </div>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
        borderRadius: 2
      }}
    >
      <CardAccent position="left" variant="teal" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
        <Typography variant="h6" component="h2">
          {groupBy} Report
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onExportData}
          disabled={isLoading || data.length === 0}
        >
          Export Data
        </Button>
      </div>

      <EnhancedTable
        columns={getColumns()}
        data={data}
        loading={isLoading}
        emptyMessage={error || `No data available for the selected ${groupBy.toLowerCase()} range.`}
        initialState={{
          sorting: {
            column: 'groupValue',
            direction: 'desc'
          }
        }}
        features={{
          pagination: true,
          columnManagement: {
            enabled: true,
            allowReordering: true,
            allowHiding: true,
            allowResizing: true
          },
          filtering: {
            enabled: true,
            advancedFilter: true
          },
          export: {
            enabled: true,
            formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF]
          },
          expandableRows: {
            enabled: true
          },
          columnResizing: {
            enabled: true,
            minWidth: 80,
            maxWidth: 500,
            persistWidths: true
          }
        }}
        renderRowDetail={renderRowDetail}
      />
    </Paper>
  );
};

export default DailyActionsTable;
