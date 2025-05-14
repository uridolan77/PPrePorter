import React from 'react';
import { Paper, Typography, CircularProgress } from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';
import { EnhancedTable } from '../../../components/tables/enhanced';
import { BaseColumnDef, TableState } from '../../../components/tables/enhanced/types';
import { DailyAction } from './types';

// Define a custom column type that matches what EnhancedTable expects
type TableColumnDef = BaseColumnDef;

interface DailyActionsTableProps {
  data: DailyAction[];
  loading: boolean;
  visibleColumns: string[];
  groupBy: string;
  hierarchicalGrouping: {
    enabled: boolean;
    groupByLevels: string[];
  };
  handleColumnVisibilityChange: (columns: string[]) => void;
  onStateChange?: (state: TableState) => void;
  onDrillDown?: (row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => void;
}

const DailyActionsTableNew: React.FC<DailyActionsTableProps> = ({
  data,
  loading,
  visibleColumns,
  groupBy,
  hierarchicalGrouping,
  handleColumnVisibilityChange,
  onStateChange,
  onDrillDown
}) => {
  // Define columns based on the groupBy value
  const getColumns = (): TableColumnDef[] => {
    const baseColumns: TableColumnDef[] = [
      {
        id: 'groupValue',
        label: groupBy === 'Day' ? 'Date' : groupBy,
        format: (value, row) => row.groupValue
      },
      {
        id: 'registrations',
        label: 'Registrations',
        align: 'right',
        format: (value, row) => row.registrations
      },
      {
        id: 'ftd',
        label: 'FTD',
        align: 'right',
        format: (value, row) => row.ftd
      },
      {
        id: 'deposits',
        label: 'Deposits',
        align: 'right',
        format: (value, row) => row.deposits
      },
      {
        id: 'paidCashouts',
        label: 'Cashouts',
        align: 'right',
        format: (value, row) => row.paidCashouts
      },
      {
        id: 'ggrCasino',
        label: 'Casino GGR',
        align: 'right',
        type: 'currency',
        format: (value, row) => row.ggrCasino.toFixed(2)
      },
      {
        id: 'ggrSport',
        label: 'Sport GGR',
        align: 'right',
        type: 'currency',
        format: (value, row) => row.ggrSport.toFixed(2)
      },
      {
        id: 'ggrLive',
        label: 'Live GGR',
        align: 'right',
        type: 'currency',
        format: (value, row) => row.ggrLive.toFixed(2)
      },
      {
        id: 'totalGGR',
        label: 'Total GGR',
        align: 'right',
        type: 'currency',
        format: (value, row) => row.totalGGR.toFixed(2)
      }
    ];

    return baseColumns;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <TableChartIcon style={{ marginRight: 8 }} />
        <Typography variant="h6">Daily Actions Data</Typography>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <CircularProgress />
        </div>
      ) : (
        <EnhancedTable
          title=""
          columns={getColumns()}
          data={data}
          loading={false}
          emptyMessage="No data available for the selected filters. Try adjusting your filters or click 'Apply Filters' to load data."
          idField="id"
          onStateChange={onStateChange}
          onDrillDown={onDrillDown}
          features={{
            columnManagement: {
              enabled: true,
              allowReordering: true,
              allowHiding: true
            },
            filtering: {
              enabled: true,
              advancedFilter: true
            },
            export: {
              enabled: true
            },
            grouping: {
              enabled: hierarchicalGrouping.enabled,
              hierarchical: hierarchicalGrouping.enabled,
              defaultGroupByLevels: hierarchicalGrouping.groupByLevels
            },
            sorting: {
              enabled: true
            },
            pagination: {
              enabled: true
            }
          }}
          initialState={{
            grouping: {
              groupByColumn: hierarchicalGrouping.enabled ? null : groupBy,
              groupByLevels: hierarchicalGrouping.groupByLevels,
              expandedGroups: [],
              hierarchical: hierarchicalGrouping.enabled
            },
            columns: {
              visible: visibleColumns,
              order: getColumns().map(col => col.id),
              sticky: [],
              widths: {}
            }
          }}
          // Key prop to force re-initialization when hierarchical grouping changes
          key={`table-${hierarchicalGrouping.enabled}-${hierarchicalGrouping.groupByLevels.join('-')}`}
        />
      )}
    </Paper>
  );
};

export default DailyActionsTableNew;
