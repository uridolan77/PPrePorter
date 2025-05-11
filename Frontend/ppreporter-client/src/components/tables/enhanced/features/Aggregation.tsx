import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import { AggregationConfig, AggregationDefinition, AggregationFunction, ColumnDef } from '../types';
import { calculateAggregation } from '../utils';

interface AggregationMenuProps {
  columns: ColumnDef[];
  aggregations: AggregationDefinition[];
  enabledAggregations: string[];
  onAggregationToggle: (aggregationId: string) => void;
}

/**
 * Aggregation menu component
 */
const AggregationMenu: React.FC<AggregationMenuProps> = ({
  columns,
  aggregations,
  enabledAggregations,
  onAggregationToggle
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = (aggregationId: string) => {
    onAggregationToggle(aggregationId);
  };

  return (
    <>
      <Tooltip title="Summary calculations">
        <IconButton
          size="small"
          onClick={handleOpen}
          color={enabledAggregations.length > 0 ? "primary" : "default"}
        >
          <SummarizeIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 250
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Summary Calculations
        </Typography>
        <Divider />
        {aggregations.map(agg => {
          const column = columns.find(col => col.id === agg.columnId);
          if (!column) return null;
          
          const aggregationId = `${agg.columnId}_${agg.function}`;
          
          return (
            <MenuItem key={aggregationId} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={enabledAggregations.includes(aggregationId)}
                    onChange={() => handleToggle(aggregationId)}
                  />
                }
                label={agg.label || `${column.label} (${agg.function.toUpperCase()})`}
                sx={{ width: '100%' }}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

interface AggregationRowProps {
  columns: ColumnDef[];
  data: any[];
  enabledAggregations: string[];
  visibleColumns: string[];
}

/**
 * Aggregation row component
 */
export const AggregationRow: React.FC<AggregationRowProps> = ({
  columns,
  data,
  enabledAggregations,
  visibleColumns
}) => {
  if (!data.length || !enabledAggregations.length) return null;

  // Calculate aggregations
  const aggregationResults: Record<string, any> = {};
  
  enabledAggregations.forEach(aggId => {
    const [columnId, func] = aggId.split('_');
    aggregationResults[aggId] = calculateAggregation(
      data,
      columnId,
      func as AggregationFunction
    );
  });

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        mt: 1,
        p: 1,
        backgroundColor: theme => theme.palette.mode === 'dark'
          ? theme.palette.grey[800]
          : theme.palette.grey[100]
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <SummarizeIcon fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="subtitle2">Summary</Typography>
      </Box>
      <Table size="small">
        <TableBody>
          <TableRow>
            {visibleColumns.map(columnId => {
              const column = columns.find(col => col.id === columnId);
              if (!column) return null;

              // Find aggregations for this column
              const columnAggs = enabledAggregations
                .filter(aggId => aggId.startsWith(column.id + '_'))
                .map(aggId => {
                  const [_, func] = aggId.split('_');
                  return {
                    function: func as AggregationFunction,
                    value: aggregationResults[aggId]
                  };
                });

              if (columnAggs.length === 0) {
                return (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    -
                  </TableCell>
                );
              }

              return (
                <TableCell key={column.id} align={column.align || 'left'}>
                  {columnAggs.map(agg => {
                    let displayValue = agg.value;
                    
                    // Format the value based on column type
                    if (column.format && typeof displayValue === 'number') {
                      displayValue = column.format(displayValue, {});
                    } else if (column.type === 'currency' && typeof displayValue === 'number') {
                      displayValue = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(displayValue);
                    } else if (column.type === 'number' && typeof displayValue === 'number') {
                      displayValue = displayValue.toLocaleString();
                    }
                    
                    return (
                      <Box key={agg.function} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Chip
                          size="small"
                          label={agg.function.toUpperCase()}
                          sx={{ mr: 1, fontSize: '0.7rem' }}
                        />
                        <Typography variant="body2">{displayValue}</Typography>
                      </Box>
                    );
                  })}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};

interface AggregationProps {
  columns: ColumnDef[];
  config: AggregationConfig;
  data: any[];
  enabledAggregations: string[];
  visibleColumns: string[];
  onAggregationToggle: (aggregationId: string) => void;
}

/**
 * Main aggregation component
 */
const Aggregation: React.FC<AggregationProps> = ({
  columns,
  config,
  data,
  enabledAggregations,
  visibleColumns,
  onAggregationToggle
}) => {
  // Create aggregation definitions from columns
  const aggregations = columns
    .filter(col => col.aggregatable !== false && (col.type === 'number' || col.type === 'currency'))
    .flatMap(col => {
      const funcs: AggregationFunction[] = ['sum', 'avg'];
      return funcs.map(func => ({
        columnId: col.id,
        function: func,
        label: `${col.label} (${func.toUpperCase()})`
      }));
    });

  return (
    <AggregationMenu
      columns={columns}
      aggregations={aggregations}
      enabledAggregations={enabledAggregations}
      onAggregationToggle={onAggregationToggle}
    />
  );
};

export default Aggregation;
