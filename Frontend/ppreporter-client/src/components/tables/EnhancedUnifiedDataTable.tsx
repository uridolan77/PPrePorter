import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Tooltip,
  Typography,
  Switch,
  Chip,
  Paper,
  TableRow,
  TableCell,
  Table,
  TableBody
} from '@mui/material';
import UnifiedDataTable, { ColumnDef, UnifiedDataTableProps } from './UnifiedDataTable';
import FilterPanel, { FilterDefinition, FilterType } from '../common/FilterPanel';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import SettingsIcon from '@mui/icons-material/Settings';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PinIcon from '@mui/icons-material/PushPin';
import DevicesIcon from '@mui/icons-material/Devices';

// Export formats
export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json'
}

// Aggregation function type
export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

// Aggregation definition interface
export interface AggregationDefinition {
  columnId: string;
  function: AggregationFunction;
  label?: string;
}

// Row detail renderer function type
export type RowDetailRenderer = (row: any) => React.ReactNode;

// Drill-down configuration interface
export interface DrillDownConfig {
  // The source grouping level (e.g., 'Month', 'Label')
  sourceGrouping: string;
  // The target grouping level (e.g., 'Day', 'Player')
  targetGrouping: string;
  // Optional filter transformation function
  transformFilter?: (row: any) => Record<string, any>;
  // Label for the drill-down action
  label?: string;
}

// Enhanced props interface
export interface EnhancedUnifiedDataTableProps extends UnifiedDataTableProps {
  // Additional props for enhanced features
  enableColumnSelection?: boolean;
  enableAdvancedFiltering?: boolean;
  enableExportOptions?: boolean;
  enableColumnReordering?: boolean;
  enableRowGrouping?: boolean;
  enableSummaryRow?: boolean;
  enableExpandableRows?: boolean;
  enableKeyboardNavigation?: boolean;
  enableStickyColumns?: boolean;
  enableResponsiveDesign?: boolean;
  enableDrillDown?: boolean;
  filterDefinitions?: FilterDefinition[];
  groupableColumns?: string[];
  aggregations?: AggregationDefinition[];
  stickyColumnIds?: string[];
  drillDownConfig?: DrillDownConfig[];
  renderRowDetail?: RowDetailRenderer;
  onExportFormat?: (format: ExportFormat) => void;
  onApplyAdvancedFilters?: (filters: Record<string, any>) => void;
  onColumnOrderChange?: (columns: ColumnDef[]) => void;
  onGroupingChange?: (groupBy: string | null) => void;
  onRowExpand?: (rowId: string, expanded: boolean) => void;
  onDrillDown?: (row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => void;
}

/**
 * EnhancedUnifiedDataTable component
 * Extends UnifiedDataTable with additional features like column selection, advanced filtering, and enhanced export options
 */
const EnhancedUnifiedDataTable: React.FC<EnhancedUnifiedDataTableProps> = ({
  // Destructure props with defaults
  data = [],
  columns = [],
  title = '',
  loading = false,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectRows,
  onRefresh,
  onSearch,
  onExport,
  features = {
    sorting: true,
    filtering: true,
    pagination: true,
    virtualization: false,
    microVisualizations: false,
    exportable: true
  },
  emptyMessage = 'No data to display',
  maxHeight = '600px',
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
  idField = 'id',
  sx,
  // Enhanced features
  enableColumnSelection = true,
  enableAdvancedFiltering = true,
  enableExportOptions = true,
  enableColumnReordering = true,
  enableRowGrouping = true,
  enableSummaryRow = true,
  enableExpandableRows = false,
  enableKeyboardNavigation = true,
  enableStickyColumns = false,
  enableResponsiveDesign = true,
  enableDrillDown = false,
  filterDefinitions = [],
  groupableColumns = [],
  aggregations = [],
  stickyColumnIds = [],
  drillDownConfig = [],
  renderRowDetail,
  onExportFormat,
  onApplyAdvancedFilters,
  onColumnOrderChange,
  onGroupingChange,
  onRowExpand,
  onDrillDown
}) => {
  // State for enhanced features
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => col.id));
  const [columnSelectorAnchorEl, setColumnSelectorAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [groupingAnchorEl, setGroupingAnchorEl] = useState<null | HTMLElement>(null);
  const [summaryAnchorEl, setSummaryAnchorEl] = useState<null | HTMLElement>(null);
  const [drillDownAnchorEl, setDrillDownAnchorEl] = useState<null | HTMLElement>(null);
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  const [columnOrder, setColumnOrder] = useState<string[]>(columns.map(col => col.id));
  const [groupByColumn, setGroupByColumn] = useState<string | null>(null);
  const [enabledAggregations, setEnabledAggregations] = useState<string[]>(
    aggregations.map(agg => `${agg.columnId}_${agg.function}`)
  );
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [focusedCell, setFocusedCell] = useState<{rowIndex: number, colIndex: number} | null>(null);
  const [responsiveMode, setResponsiveMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Filtered and ordered columns based on visibility and order
  const orderedVisibleColumns = useMemo(() => {
    // First filter by visibility
    const visible = columns.filter(col => visibleColumns.includes(col.id));

    // Then sort by the order
    return [...visible].sort((a, b) => {
      const indexA = columnOrder.indexOf(a.id);
      const indexB = columnOrder.indexOf(b.id);
      return indexA - indexB;
    });
  }, [columns, visibleColumns, columnOrder]);

  // Handle column visibility toggle
  const handleColumnVisibilityChange = (columnId: string) => {
    const currentVisibleColumns = [...visibleColumns];
    const columnIndex = currentVisibleColumns.indexOf(columnId);

    if (columnIndex === -1) {
      // Add column
      currentVisibleColumns.push(columnId);
    } else if (currentVisibleColumns.length > 1) {
      // Remove column (ensure at least one column remains visible)
      currentVisibleColumns.splice(columnIndex, 1);
    }

    setVisibleColumns(currentVisibleColumns);
  };

  // Column selector menu handlers
  const handleColumnSelectorOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setColumnSelectorAnchorEl(event.currentTarget);
  };

  const handleColumnSelectorClose = () => {
    setColumnSelectorAnchorEl(null);
  };

  // Filter panel handlers
  const handleFilterOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  // Export menu handlers
  const handleExportOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  // Handle export format selection
  const handleExportFormat = (format: ExportFormat) => {
    if (onExportFormat) {
      onExportFormat(format);
    } else if (onExport) {
      // Fall back to default export if no format handler
      onExport();
    }
    handleExportClose();
  };

  // Handle filter change
  const handleFilterChange = (id: string, value: any) => {
    setAdvancedFilters({
      ...advancedFilters,
      [id]: value
    });
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    if (onApplyAdvancedFilters) {
      onApplyAdvancedFilters(advancedFilters);
    }
    handleFilterClose();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    setAdvancedFilters({});
  };

  // Handle column reordering
  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Reorder the column order array
    const newColumnOrder = [...columnOrder];
    const [removed] = newColumnOrder.splice(sourceIndex, 1);
    newColumnOrder.splice(destinationIndex, 0, removed);

    setColumnOrder(newColumnOrder);

    // Notify parent component if callback provided
    if (onColumnOrderChange) {
      const reorderedColumns = newColumnOrder.map(
        colId => columns.find(col => col.id === colId)!
      );
      onColumnOrderChange(reorderedColumns);
    }
  };

  // Grouping menu handlers
  const handleGroupingOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setGroupingAnchorEl(event.currentTarget);
  };

  const handleGroupingClose = () => {
    setGroupingAnchorEl(null);
  };

  // Handle grouping selection
  const handleGroupingChange = (columnId: string | null) => {
    setGroupByColumn(columnId);

    // Notify parent component if callback provided
    if (onGroupingChange) {
      onGroupingChange(columnId);
    }

    handleGroupingClose();
  };

  // Summary menu handlers
  const handleSummaryOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSummaryAnchorEl(event.currentTarget);
  };

  const handleSummaryClose = () => {
    setSummaryAnchorEl(null);
  };

  // Handle aggregation toggle
  const handleAggregationToggle = (aggregationId: string) => {
    const currentEnabledAggregations = [...enabledAggregations];
    const aggregationIndex = currentEnabledAggregations.indexOf(aggregationId);

    if (aggregationIndex === -1) {
      // Add aggregation
      currentEnabledAggregations.push(aggregationId);
    } else {
      // Remove aggregation
      currentEnabledAggregations.splice(aggregationIndex, 1);
    }

    setEnabledAggregations(currentEnabledAggregations);
  };

  // Calculate aggregations for summary row
  const calculateAggregations = useCallback(() => {
    if (!enableSummaryRow || !data.length || !enabledAggregations.length) {
      return null;
    }

    const result: Record<string, any> = {};

    enabledAggregations.forEach(aggId => {
      const [columnId, func] = aggId.split('_');

      switch (func as AggregationFunction) {
        case 'sum':
          result[aggId] = data.reduce((sum, row) => {
            const value = Number(row[columnId]) || 0;
            return sum + value;
          }, 0);
          break;
        case 'avg':
          const sum = data.reduce((acc, row) => {
            const value = Number(row[columnId]) || 0;
            return acc + value;
          }, 0);
          result[aggId] = sum / data.length;
          break;
        case 'min':
          result[aggId] = Math.min(...data.map(row => Number(row[columnId]) || 0));
          break;
        case 'max':
          result[aggId] = Math.max(...data.map(row => Number(row[columnId]) || 0));
          break;
        case 'count':
          result[aggId] = data.length;
          break;
      }
    });

    return result;
  }, [data, enableSummaryRow, enabledAggregations]);

  // Group data by selected column
  const groupedData = useMemo(() => {
    if (!groupByColumn || !data.length) {
      return null;
    }

    // Group data by the selected column
    const groups: Record<string, any[]> = {};

    data.forEach(row => {
      const groupValue = String(row[groupByColumn] || 'Unknown');
      if (!groups[groupValue]) {
        groups[groupValue] = [];
      }
      groups[groupValue].push(row);
    });

    // Calculate aggregations for each group
    return Object.entries(groups).map(([groupValue, rows]) => {
      const aggregations: Record<string, any> = {
        [groupByColumn]: groupValue,
        _groupRows: rows.length
      };

      // Calculate aggregations for numeric columns
      columns.forEach(column => {
        if (column.id !== groupByColumn) {
          // Sum numeric values
          if (column.type === 'number' || column.type === 'currency') {
            aggregations[column.id] = rows.reduce((sum, row) => {
              const value = Number(row[column.id]) || 0;
              return sum + value;
            }, 0);
          }
        }
      });

      return aggregations;
    });
  }, [groupByColumn, data, columns]);

  // Custom toolbar buttons for enhanced features
  const enhancedToolbarButtons = (
    <>
      {/* Column Selector */}
      {enableColumnSelection && (
        <Tooltip title="Select columns">
          <IconButton size="small" onClick={handleColumnSelectorOpen}>
            <ViewColumnIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Advanced Filtering */}
      {enableAdvancedFiltering && filterDefinitions.length > 0 && (
        <Tooltip title="Advanced filters">
          <IconButton size="small" onClick={handleFilterOpen}>
            <FilterListIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Row Grouping */}
      {enableRowGrouping && groupableColumns.length > 0 && (
        <Tooltip title={groupByColumn ? "Change grouping" : "Group by column"}>
          <IconButton
            size="small"
            onClick={handleGroupingOpen}
            color={groupByColumn ? "primary" : "default"}
          >
            <GroupWorkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Summary Row */}
      {enableSummaryRow && aggregations.length > 0 && (
        <Tooltip title="Summary calculations">
          <IconButton
            size="small"
            onClick={handleSummaryOpen}
            color={enabledAggregations.length > 0 ? "primary" : "default"}
          >
            <SummarizeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Drill Down */}
      {enableDrillDown && drillDownConfig.length > 0 && groupByColumn && (
        <Tooltip title="Drill down options">
          <IconButton
            size="small"
            onClick={(e) => {
              if (selectedRow) {
                handleDrillDown(selectedRow);
              }
            }}
            color={drillDownConfig.some(config => config.sourceGrouping === groupByColumn) ? "primary" : "default"}
            disabled={!selectedRow}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Expandable Rows */}
      {enableExpandableRows && renderRowDetail && (
        <Tooltip title={expandedRows.length > 0 ? "Collapse all rows" : "Expand all rows"}>
          <IconButton
            size="small"
            onClick={() => {
              if (expandedRows.length > 0) {
                setExpandedRows([]);
              } else {
                setExpandedRows(data.map(row => row[idField]));
              }
            }}
            color={expandedRows.length > 0 ? "primary" : "default"}
          >
            {expandedRows.length > 0 ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      )}

      {/* Sticky Columns */}
      {enableStickyColumns && (
        <Tooltip title="Pin/unpin columns">
          <IconButton
            size="small"
            onClick={handleColumnSelectorOpen}
            color={stickyColumnIds.length > 0 ? "primary" : "default"}
          >
            <PinIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Responsive Design */}
      {enableResponsiveDesign && (
        <Tooltip title={`Current mode: ${responsiveMode}`}>
          <IconButton
            size="small"
            color="default"
            disabled
          >
            <DevicesIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Export Options */}
      {enableExportOptions && features.exportable && (
        <Tooltip title="Export options">
          <IconButton size="small" onClick={handleExportOpen}>
            <GetAppIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </>
  );

  // Calculate summary row data
  const summaryData = calculateAggregations();

  // Handle expandable rows
  const handleRowExpand = (rowId: string) => {
    const currentExpandedRows = [...expandedRows];
    const rowIndex = currentExpandedRows.indexOf(rowId);

    if (rowIndex === -1) {
      // Expand row
      currentExpandedRows.push(rowId);
    } else {
      // Collapse row
      currentExpandedRows.splice(rowIndex, 1);
    }

    setExpandedRows(currentExpandedRows);

    // Notify parent component if callback provided
    if (onRowExpand) {
      onRowExpand(rowId, rowIndex === -1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (!enableKeyboardNavigation) return;

    const maxRowIndex = displayData.length - 1;
    const maxColIndex = orderedVisibleColumns.length - 1;

    let newRowIndex = rowIndex;
    let newColIndex = colIndex;

    switch (event.key) {
      case 'ArrowUp':
        newRowIndex = Math.max(0, rowIndex - 1);
        event.preventDefault();
        break;
      case 'ArrowDown':
        newRowIndex = Math.min(maxRowIndex, rowIndex + 1);
        event.preventDefault();
        break;
      case 'ArrowLeft':
        newColIndex = Math.max(0, colIndex - 1);
        event.preventDefault();
        break;
      case 'ArrowRight':
        newColIndex = Math.min(maxColIndex, colIndex + 1);
        event.preventDefault();
        break;
      case 'Home':
        newColIndex = 0;
        event.preventDefault();
        break;
      case 'End':
        newColIndex = maxColIndex;
        event.preventDefault();
        break;
      case 'PageUp':
        newRowIndex = Math.max(0, rowIndex - 10);
        event.preventDefault();
        break;
      case 'PageDown':
        newRowIndex = Math.min(maxRowIndex, rowIndex + 10);
        event.preventDefault();
        break;
      case 'Enter':
        // Handle row selection or expansion
        if (expandedRows.includes(displayData[rowIndex][idField])) {
          handleRowExpand(displayData[rowIndex][idField]);
        } else if (onRowClick) {
          onRowClick(displayData[rowIndex]);
        }
        event.preventDefault();
        break;
    }

    if (newRowIndex !== rowIndex || newColIndex !== colIndex) {
      setFocusedCell({ rowIndex: newRowIndex, colIndex: newColIndex });

      // Focus the cell
      const cellId = `cell-${newRowIndex}-${newColIndex}`;
      const cellElement = document.getElementById(cellId);
      if (cellElement) {
        cellElement.focus();
      }
    }
  };

  // Handle drill-down
  const handleDrillDown = (row: any) => {
    if (!enableDrillDown || !groupByColumn || !onDrillDown) return;

    // Find applicable drill-down configurations
    const applicableDrillDowns = drillDownConfig.filter(
      config => config.sourceGrouping === groupByColumn
    );

    if (applicableDrillDowns.length === 0) return;

    // If only one drill-down config, use it directly
    if (applicableDrillDowns.length === 1) {
      const config = applicableDrillDowns[0];
      const filters = config.transformFilter ? config.transformFilter(row) : { [groupByColumn]: row[groupByColumn] };
      onDrillDown(row, config.sourceGrouping, config.targetGrouping, filters);
    } else {
      // If multiple drill-down configs, show menu
      setSelectedRow(row);
      setDrillDownAnchorEl(document.activeElement as HTMLElement);
    }
  };

  // Drill-down menu handlers
  const handleDrillDownMenuClose = () => {
    setDrillDownAnchorEl(null);
    setSelectedRow(null);
  };

  // Handle drill-down selection from menu
  const handleDrillDownSelect = (config: DrillDownConfig) => {
    if (!selectedRow || !onDrillDown) return;

    const filters = config.transformFilter
      ? config.transformFilter(selectedRow)
      : { [config.sourceGrouping]: selectedRow[config.sourceGrouping] };

    onDrillDown(selectedRow, config.sourceGrouping, config.targetGrouping, filters);
    handleDrillDownMenuClose();
  };

  // Handle responsive design
  useEffect(() => {
    if (!enableResponsiveDesign) return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) {
        setResponsiveMode('mobile');
      } else if (width < 960) {
        setResponsiveMode('tablet');
      } else {
        setResponsiveMode('desktop');
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enableResponsiveDesign]);

  // Determine which data to display
  const displayData = groupByColumn && groupedData ? groupedData : data;

  return (
    <>
      {/* Main Table Component */}
      <Box sx={{
        width: '100%',
        overflowX: enableResponsiveDesign ? 'auto' : undefined,
        ...(enableStickyColumns && stickyColumnIds.length > 0 ? {
          '& .MuiTableCell-root': {
            position: 'relative',
            zIndex: 1
          },
          '& .sticky-column': {
            position: 'sticky',
            left: 0,
            zIndex: 2,
            backgroundColor: theme => theme.palette.background.paper,
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
          }
        } : {})
      }}>
        <UnifiedDataTable
          data={displayData}
          columns={orderedVisibleColumns.map(col => ({
            ...col,
            cellProps: {
              ...(col.cellProps || {}),
              ...(enableStickyColumns && stickyColumnIds.includes(col.id) ? {
                className: 'sticky-column'
              } : {}),
              ...(enableKeyboardNavigation ? {
                tabIndex: 0,
                onKeyDown: (event: React.KeyboardEvent) => {
                  // Get the row data from a data attribute
                  const rowData = JSON.parse((event.currentTarget as HTMLElement).getAttribute('data-row') || '{}');
                  const rowIndex = displayData.findIndex(row => JSON.stringify(row) === JSON.stringify(rowData));
                  const colIndex = orderedVisibleColumns.findIndex(column => column.id === col.id);
                  if (rowIndex !== -1 && colIndex !== -1) {
                    handleKeyDown(event, rowIndex, colIndex);
                  }
                }
              } : {})
            }
          }))}
          title={title}
          loading={loading}
          onRowClick={enableDrillDown && groupByColumn ? (row) => {
            setSelectedRow(row);
            if (onRowClick) onRowClick(row);
          } : onRowClick}
          selectable={selectable}
          selectedRows={selectedRows}
          onSelectRows={onSelectRows}
          onRefresh={onRefresh}
          onSearch={onSearch}
          onExport={onExport}
          features={features}
          emptyMessage={emptyMessage}
          maxHeight={maxHeight}
          rowsPerPageOptions={rowsPerPageOptions}
          defaultRowsPerPage={defaultRowsPerPage}
          idField={idField}
          sx={{
            ...sx,
            ...(responsiveMode === 'mobile' ? {
              '& .MuiTableCell-root': {
                padding: '8px 4px'
              }
            } : {})
          }}
          toolbarExtraContent={enhancedToolbarButtons}
          renderRowExtra={enableExpandableRows && renderRowDetail ? (row) => {
            const rowId = row[idField];
            const isExpanded = expandedRows.includes(rowId);

            return (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleRowExpand(rowId)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                {isExpanded && (
                  <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    {renderRowDetail(row)}
                  </Box>
                )}
              </>
            );
          } : undefined}
        />
      </Box>

      {/* Summary Row (if enabled) */}
      {enableSummaryRow && summaryData && enabledAggregations.length > 0 && (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            mt: 1,
            p: 1,
            backgroundColor: (theme) => theme.palette.mode === 'dark'
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
                {orderedVisibleColumns.map(column => {
                  // Find aggregations for this column
                  const columnAggs = enabledAggregations
                    .filter(aggId => aggId.startsWith(column.id + '_'))
                    .map(aggId => {
                      const [_, func] = aggId.split('_');
                      return {
                        function: func as AggregationFunction,
                        value: summaryData[aggId]
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
      )}

      {/* Column Selector Menu */}
      <Menu
        anchorEl={columnSelectorAnchorEl}
        open={Boolean(columnSelectorAnchorEl)}
        onClose={handleColumnSelectorClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Show/Hide Columns
        </Typography>
        <Divider />
        {enableColumnReordering ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="column-selector">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {columnOrder.map((columnId, index) => {
                    const column = columns.find(col => col.id === columnId);
                    if (!column) return null;

                    return (
                      <Draggable key={column.id} draggableId={column.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <MenuItem dense>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <DragIndicatorIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={visibleColumns.includes(column.id)}
                                      onChange={() => handleColumnVisibilityChange(column.id)}
                                      disabled={visibleColumns.length === 1 && visibleColumns.includes(column.id)}
                                    />
                                  }
                                  label={column.label}
                                  sx={{ flex: 1 }}
                                />
                              </Box>
                            </MenuItem>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          columns.map((column) => (
            <MenuItem key={column.id} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.id)}
                    onChange={() => handleColumnVisibilityChange(column.id)}
                    disabled={visibleColumns.length === 1 && visibleColumns.includes(column.id)}
                  />
                }
                label={column.label}
                sx={{ width: '100%' }}
              />
            </MenuItem>
          ))
        )}
      </Menu>

      {/* Advanced Filter Popover */}
      <Popover
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle1" gutterBottom>
            Advanced Filters
          </Typography>
          <FilterPanel
            filters={filterDefinitions}
            values={advancedFilters}
            onChange={handleFilterChange}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button size="small" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button size="small" variant="contained" onClick={handleApplyFilters}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>

      {/* Grouping Menu */}
      <Menu
        anchorEl={groupingAnchorEl}
        open={Boolean(groupingAnchorEl)}
        onClose={handleGroupingClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Group By Column
        </Typography>
        <Divider />
        <MenuItem onClick={() => handleGroupingChange(null)}>
          <Typography color={!groupByColumn ? 'primary' : 'inherit'}>
            None (No Grouping)
          </Typography>
        </MenuItem>
        {groupableColumns.map(columnId => {
          const column = columns.find(col => col.id === columnId);
          if (!column) return null;

          return (
            <MenuItem
              key={column.id}
              onClick={() => handleGroupingChange(column.id)}
              selected={groupByColumn === column.id}
            >
              {column.label}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Summary Menu */}
      <Menu
        anchorEl={summaryAnchorEl}
        open={Boolean(summaryAnchorEl)}
        onClose={handleSummaryClose}
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
                    checked={enabledAggregations.includes(aggregationId)}
                    onChange={() => handleAggregationToggle(aggregationId)}
                  />
                }
                label={`${agg.label || `${column.label} (${agg.function.toUpperCase()})`}`}
                sx={{ width: '100%' }}
              />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Export Options Menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleExportClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Export Format
        </Typography>
        <Divider />
        <MenuItem onClick={() => handleExportFormat(ExportFormat.CSV)}>
          CSV
        </MenuItem>
        <MenuItem onClick={() => handleExportFormat(ExportFormat.EXCEL)}>
          Excel
        </MenuItem>
        <MenuItem onClick={() => handleExportFormat(ExportFormat.PDF)}>
          PDF
        </MenuItem>
        <MenuItem onClick={() => handleExportFormat(ExportFormat.JSON)}>
          JSON
        </MenuItem>
      </Menu>

      {/* Drill Down Menu */}
      <Menu
        anchorEl={drillDownAnchorEl}
        open={Boolean(drillDownAnchorEl)}
        onClose={handleDrillDownMenuClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Drill Down Options
        </Typography>
        <Divider />
        {drillDownConfig
          .filter(config => config.sourceGrouping === groupByColumn)
          .map((config, index) => (
            <MenuItem
              key={`drill-down-${index}`}
              onClick={() => handleDrillDownSelect(config)}
            >
              {config.label || `View by ${config.targetGrouping}`}
            </MenuItem>
          ))
        }
      </Menu>
    </>
  );
};

export default EnhancedUnifiedDataTable;
