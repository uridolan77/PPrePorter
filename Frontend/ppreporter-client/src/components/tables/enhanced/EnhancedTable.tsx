import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Toolbar,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Alert,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnhancedTableProps, TableState, ColumnDef, ExportFormat, HierarchicalGroup } from './types';
import { decodeStateFromUrl, encodeStateToUrl, filterData, sortData, groupData, createHierarchicalData } from './utils';
import Sorting from './features/Sorting';
import Filtering, { AdvancedFilter, QuickFilter } from './features/Filtering';
import ColumnManagement from './features/ColumnManagement';
import Pagination from './features/Pagination';
import Grouping from './features/Grouping';
import HierarchicalGrouping from './features/HierarchicalGrouping';
import Aggregation, { AggregationRow } from './features/Aggregation';
import DrillDown from './features/DrillDown';
import { ExpandAllButton } from './features/ExpandableRows';
import Export from './features/Export';
import TableContent from './features/TableContent';
import HierarchicalTableContent from './features/HierarchicalTableContent';

// Default table state
const DEFAULT_TABLE_STATE: TableState = {
  sorting: {
    column: '',
    direction: 'asc'
  },
  filtering: {
    quickFilter: '',
    advancedFilters: {}
  },
  pagination: {
    page: 0,
    pageSize: 10
  },
  grouping: {
    groupByColumn: null,
    groupByLevels: [],
    expandedGroups: []
  },
  columns: {
    visible: [],
    order: [],
    sticky: [],
    widths: {}
  },
  aggregation: {
    enabled: []
  },
  expandedRows: [],
  selectedRows: [],
  treeData: {
    expandedNodes: []
  },
  infiniteScroll: {
    loadedPages: 0
  },
  history: {
    undoStack: [],
    redoStack: []
  },
  calculatedColumns: {
    values: {}
  }
};

/**
 * Enhanced table component with advanced features
 */
const EnhancedTable: React.FC<EnhancedTableProps> = ({
  // Base props
  data = [],
  columns = [],
  title = '',
  loading = false,
  emptyMessage = 'No data to display',
  idField = 'id',
  sx,

  // Event handlers
  onRowClick,
  onRefresh,
  onExport,
  onStateChange,
  onDrillDown,
  onLoadGroupChildren,

  // Feature configurations
  features = {},

  // Feature-specific props
  renderRowDetail,
  initialState,
  stateFromUrl = false,

  // Legacy EnhancedUnifiedDataTable compatibility props
  enableColumnSelection,
  enableAdvancedFiltering,
  enableExportOptions,
  enableColumnReordering,
  enableRowGrouping,
  enableSummaryRow,
  enableExpandableRows,
  enableKeyboardNavigation,
  enableStickyColumns,
  enableResponsiveDesign,
  enableDrillDown,
  filterDefinitions,
  groupableColumns,
  stickyColumnIds,
  drillDownConfig: drillDownConfigProp,
  aggregations,
  onExportFormat,
  onApplyAdvancedFilters,
  onColumnOrderChange,
  onGroupingChange,
  onRowExpand
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize feature configurations with defaults, using legacy props if provided
  const sortingConfig = useMemo(() => {
    if (typeof features.sorting === 'boolean') {
      return features.sorting ? { enabled: true } : { enabled: false };
    }
    return features.sorting || { enabled: false };
  }, [features.sorting]);

  const filteringConfig = useMemo(() => {
    // Use enableAdvancedFiltering if provided
    if (enableAdvancedFiltering !== undefined) {
      return { enabled: true, quickFilter: true, advancedFilter: enableAdvancedFiltering };
    }
    if (typeof features.filtering === 'boolean') {
      return features.filtering ? { enabled: true, quickFilter: true, advancedFilter: true } : { enabled: false };
    }
    return features.filtering || { enabled: false };
  }, [features.filtering, enableAdvancedFiltering]);

  const paginationConfig = useMemo(() => {
    if (typeof features.pagination === 'boolean') {
      return features.pagination ? { enabled: true, pageSizeOptions: [10, 25, 50, 100] } : { enabled: false };
    }
    return features.pagination || { enabled: false };
  }, [features.pagination]);

  const groupingConfig = useMemo(() => {
    // Use enableRowGrouping if provided
    if (enableRowGrouping !== undefined) {
      return { enabled: enableRowGrouping };
    }
    if (typeof features.grouping === 'boolean') {
      return features.grouping ? { enabled: true } : { enabled: false };
    }
    return features.grouping || { enabled: false };
  }, [features.grouping, enableRowGrouping]);

  const aggregationConfig = useMemo(() => {
    // Use enableSummaryRow if provided
    if (enableSummaryRow !== undefined) {
      return { enabled: enableSummaryRow, showInFooter: true };
    }
    if (typeof features.aggregation === 'boolean') {
      return features.aggregation ? { enabled: true, showInFooter: true } : { enabled: false };
    }
    return features.aggregation || { enabled: false };
  }, [features.aggregation, enableSummaryRow]);

  const columnManagementConfig = useMemo(() => {
    // Use enableColumnSelection and enableColumnReordering if provided
    if (enableColumnSelection !== undefined || enableColumnReordering !== undefined) {
      return {
        enabled: enableColumnSelection || enableColumnReordering || false,
        allowReordering: enableColumnReordering || false,
        allowHiding: enableColumnSelection || false,
        allowPinning: false,
        allowResizing: false
      };
    }
    if (typeof features.columnManagement === 'boolean') {
      return features.columnManagement ? { enabled: true, allowReordering: true, allowHiding: true, allowPinning: true, allowResizing: true } : { enabled: false };
    }
    return features.columnManagement || { enabled: false };
  }, [features.columnManagement, enableColumnSelection, enableColumnReordering]);

  const columnResizingConfig = useMemo(() => {
    if (typeof features.columnResizing === 'boolean') {
      return features.columnResizing ? { enabled: true, minWidth: 50, maxWidth: 500, persistWidths: true } : { enabled: false };
    }
    return features.columnResizing || { enabled: false };
  }, [features.columnResizing]);

  const expandableRowsConfig = useMemo(() => {
    // Use enableExpandableRows if provided
    if (enableExpandableRows !== undefined) {
      return { enabled: enableExpandableRows };
    }
    if (typeof features.expandableRows === 'boolean') {
      return features.expandableRows ? { enabled: true } : { enabled: false };
    }
    return features.expandableRows || { enabled: false };
  }, [features.expandableRows, enableExpandableRows]);

  const keyboardNavigationConfig = useMemo(() => {
    // Use enableKeyboardNavigation if provided
    if (enableKeyboardNavigation !== undefined) {
      return { enabled: enableKeyboardNavigation, allowCellNavigation: true };
    }
    if (typeof features.keyboardNavigation === 'boolean') {
      return features.keyboardNavigation ? { enabled: true, allowCellNavigation: true } : { enabled: false };
    }
    return features.keyboardNavigation || { enabled: false };
  }, [features.keyboardNavigation, enableKeyboardNavigation]);

  const stickyColumnsConfig = useMemo(() => {
    // Use enableStickyColumns if provided
    if (enableStickyColumns !== undefined) {
      return { enabled: enableStickyColumns };
    }
    if (typeof features.stickyColumns === 'boolean') {
      return features.stickyColumns ? { enabled: true } : { enabled: false };
    }
    return features.stickyColumns || { enabled: false };
  }, [features.stickyColumns, enableStickyColumns]);

  const responsiveConfig = useMemo(() => {
    // Use enableResponsiveDesign if provided
    if (enableResponsiveDesign !== undefined) {
      return { enabled: enableResponsiveDesign };
    }
    if (typeof features.responsive === 'boolean') {
      return features.responsive ? { enabled: true } : { enabled: false };
    }
    return features.responsive || { enabled: false };
  }, [features.responsive, enableResponsiveDesign]);

  const drillDownConfig = useMemo(() => {
    // Use enableDrillDown and drillDownConfigProp if provided
    if (enableDrillDown !== undefined) {
      return {
        enabled: enableDrillDown,
        configs: drillDownConfigProp || []
      };
    }
    if (typeof features.drillDown === 'boolean') {
      return features.drillDown ? { enabled: true } : { enabled: false };
    }
    return features.drillDown || { enabled: false };
  }, [features.drillDown, enableDrillDown, drillDownConfigProp]);

  const exportConfig = useMemo(() => {
    // Use enableExportOptions if provided
    if (enableExportOptions !== undefined) {
      return { enabled: enableExportOptions };
    }
    if (typeof features.export === 'boolean') {
      return features.export ? { enabled: true } : { enabled: false };
    }
    return features.export || { enabled: false };
  }, [features.export, enableExportOptions]);

  // Initialize state
  const [tableState, setTableState] = useState<TableState>(() => {
    // Start with default state
    const defaultState = {
      ...DEFAULT_TABLE_STATE,
      columns: {
        visible: columns.map(col => col.id),
        order: columns.map(col => col.id),
        sticky: stickyColumnIds || columns.filter(col => col.pinned).map(col => col.id),
        widths: columns.reduce((acc, col) => ({ ...acc, [col.id]: col.width || 150 }), {})
      }
    };

    // Apply initial state from props
    const state = initialState ? { ...defaultState, ...initialState } : defaultState;

    // Apply state from URL if enabled
    if (stateFromUrl) {
      return decodeStateFromUrl(location.search, state);
    }

    return state;
  });

  // Update URL when state changes
  useEffect(() => {
    if (stateFromUrl && onStateChange) {
      const queryString = encodeStateToUrl(tableState);
      navigate({ search: queryString }, { replace: true });
      onStateChange(tableState);
    } else if (onStateChange) {
      onStateChange(tableState);
    }
  }, [tableState, stateFromUrl, navigate, onStateChange]);

  // State for hierarchical data
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalGroup[]>([]);
  const [isLoadingHierarchicalData, setIsLoadingHierarchicalData] = useState(false);

  // Process data based on current state
  const processedData = useMemo(() => {
    // Ensure data is an array
    let result = Array.isArray(data) ? [...data] : [];

    // Log data processing
    console.log('EnhancedTable processing data:', {
      dataIsArray: Array.isArray(data),
      dataLength: Array.isArray(data) ? data.length : 'N/A',
      resultLength: result.length
    });

    // Apply filtering
    if (filteringConfig.enabled) {
      result = filterData(
        result,
        tableState.filtering.quickFilter,
        tableState.filtering.advancedFilters
      );
      console.log('After filtering:', { resultLength: result.length });
    }

    // Apply sorting
    if (sortingConfig.enabled && tableState.sorting.column) {
      result = sortData(
        result,
        tableState.sorting.column,
        tableState.sorting.direction
      );
      console.log('After sorting:', { resultLength: result.length });
    }

    return result;
  }, [data, filteringConfig.enabled, sortingConfig.enabled, tableState.filtering, tableState.sorting]);

  // Generate hierarchical data when groupByLevels change
  useEffect(() => {
    if (groupingConfig.hierarchical && tableState.grouping.groupByLevels.length > 0) {
      setIsLoadingHierarchicalData(true);

      // Create hierarchical data structure from flat data
      const firstLevelGroupBy = tableState.grouping.groupByLevels[0];
      if (firstLevelGroupBy) {
        const hierarchical = createHierarchicalData(
          processedData,
          firstLevelGroupBy,
          0,
          columns
        );
        setHierarchicalData(hierarchical);
      }

      setIsLoadingHierarchicalData(false);
    }
  }, [processedData, tableState.grouping.groupByLevels, groupingConfig.hierarchical, columns]);

  // Handle sorting
  const handleSort = useCallback((columnId: string) => {
    setTableState(prevState => {
      const isAsc = prevState.sorting.column === columnId && prevState.sorting.direction === 'asc';
      return {
        ...prevState,
        sorting: {
          column: columnId,
          direction: isAsc ? 'desc' : 'asc'
        },
        // Reset to first page when sorting changes
        pagination: {
          ...prevState.pagination,
          page: 0
        }
      };
    });
  }, []);

  // Handle quick filter change
  const handleQuickFilterChange = useCallback((value: string) => {
    setTableState(prevState => ({
      ...prevState,
      filtering: {
        ...prevState.filtering,
        quickFilter: value
      },
      // Reset to first page when filter changes
      pagination: {
        ...prevState.pagination,
        page: 0
      }
    }));
  }, []);

  // Handle advanced filters change
  const handleAdvancedFiltersChange = useCallback((filters: Record<string, any>) => {
    setTableState(prevState => ({
      ...prevState,
      filtering: {
        ...prevState.filtering,
        advancedFilters: filters
      },
      // Reset to first page when filter changes
      pagination: {
        ...prevState.pagination,
        page: 0
      }
    }));

    // Call legacy callback if provided
    if (onApplyAdvancedFilters) {
      onApplyAdvancedFilters(filters);
    }
  }, [onApplyAdvancedFilters]);

  // Handle column visibility change
  const handleColumnVisibilityChange = useCallback((columnId: string, visible: boolean) => {
    setTableState(prevState => {
      const newVisibleColumns = visible
        ? [...prevState.columns.visible, columnId]
        : prevState.columns.visible.filter(id => id !== columnId);

      return {
        ...prevState,
        columns: {
          ...prevState.columns,
          visible: newVisibleColumns
        }
      };
    });
  }, []);

  // Handle column order change
  const handleColumnOrderChange = useCallback((newOrder: string[]) => {
    setTableState(prevState => ({
      ...prevState,
      columns: {
        ...prevState.columns,
        order: newOrder
      }
    }));

    // Call legacy callback if provided
    if (onColumnOrderChange) {
      onColumnOrderChange(newOrder.map(id => ({ id })));
    }
  }, [onColumnOrderChange]);

  // Handle sticky column change
  const handleStickyColumnChange = useCallback((columnId: string, sticky: boolean) => {
    setTableState(prevState => {
      const newStickyColumns = sticky
        ? [...prevState.columns.sticky, columnId]
        : prevState.columns.sticky.filter(id => id !== columnId);

      return {
        ...prevState,
        columns: {
          ...prevState.columns,
          sticky: newStickyColumns
        }
      };
    });
  }, []);

  // Handle column resize
  const handleColumnResize = useCallback((columnId: string, width: number) => {
    setTableState(prevState => ({
      ...prevState,
      columns: {
        ...prevState.columns,
        widths: {
          ...prevState.columns.widths,
          [columnId]: width
        }
      }
    }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setTableState(prevState => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        page
      }
    }));
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((pageSize: number) => {
    setTableState(prevState => ({
      ...prevState,
      pagination: {
        ...prevState.pagination,
        page: 0, // Reset to first page
        pageSize
      }
    }));
  }, []);

  // Handle grouping change
  const handleGroupingChange = useCallback((columnId: string | null) => {
    setTableState(prevState => ({
      ...prevState,
      grouping: {
        ...prevState.grouping,
        groupByColumn: columnId
      }
    }));

    // Call legacy callback if provided
    if (onGroupingChange) {
      onGroupingChange(columnId);
    }
  }, [onGroupingChange]);

  // Handle hierarchical grouping levels change
  const handleGroupingLevelsChange = useCallback((columnIds: string[]) => {
    setTableState(prevState => ({
      ...prevState,
      grouping: {
        ...prevState.grouping,
        groupByLevels: columnIds,
        expandedGroups: [] // Reset expanded groups when levels change
      }
    }));
  }, []);

  // Handle toggle group expansion in hierarchical view
  const handleToggleGroup = useCallback((path: string) => {
    setTableState(prevState => {
      const expandedGroups = [...prevState.grouping.expandedGroups];
      const index = expandedGroups.indexOf(path);

      if (index === -1) {
        // Expand group
        expandedGroups.push(path);
      } else {
        // Collapse group
        expandedGroups.splice(index, 1);
      }

      return {
        ...prevState,
        grouping: {
          ...prevState.grouping,
          expandedGroups
        }
      };
    });
  }, []);

  // Handle loading children for a hierarchical group
  const handleLoadGroupChildren = useCallback(async (parentPath: string, childLevel: number, groupBy: string) => {
    if (!onLoadGroupChildren) return;

    try {
      // Call the provided callback to load children
      const children = await onLoadGroupChildren(parentPath, childLevel, groupBy);

      // Update hierarchical data with the loaded children
      setHierarchicalData(prevData => {
        // Find the parent group by path and update its children
        const updateChildren = (groups: HierarchicalGroup[]): HierarchicalGroup[] => {
          return groups.map(group => {
            if (group.path === parentPath) {
              return {
                ...group,
                children,
                childrenLoaded: true
              };
            } else if (group.children && group.children.length > 0) {
              return {
                ...group,
                children: updateChildren(group.children)
              };
            }
            return group;
          });
        };

        return updateChildren(prevData);
      });
    } catch (error) {
      console.error('Error loading group children:', error);
    }
  }, [onLoadGroupChildren]);

  // Handle aggregation toggle
  const handleAggregationToggle = useCallback((aggregationId: string) => {
    setTableState(prevState => {
      const currentEnabledAggregations = [...prevState.aggregation.enabled];
      const aggregationIndex = currentEnabledAggregations.indexOf(aggregationId);

      if (aggregationIndex === -1) {
        // Add aggregation
        currentEnabledAggregations.push(aggregationId);
      } else {
        // Remove aggregation
        currentEnabledAggregations.splice(aggregationIndex, 1);
      }

      return {
        ...prevState,
        aggregation: {
          ...prevState.aggregation,
          enabled: currentEnabledAggregations
        }
      };
    });
  }, []);

  // Handle row expansion
  const handleRowExpand = useCallback((rowId: string) => {
    setTableState(prevState => {
      const currentExpandedRows = [...prevState.expandedRows];
      const rowIndex = currentExpandedRows.indexOf(rowId);
      const isExpanded = rowIndex === -1;

      // Call legacy callback if provided
      if (onRowExpand) {
        onRowExpand(rowId, isExpanded);
      }

      if (isExpanded) {
        // Expand row
        if (expandableRowsConfig.singleExpand) {
          // If single expand, replace the array
          return {
            ...prevState,
            expandedRows: [rowId]
          };
        } else {
          // Otherwise add to the array
          return {
            ...prevState,
            expandedRows: [...currentExpandedRows, rowId]
          };
        }
      } else {
        // Collapse row
        currentExpandedRows.splice(rowIndex, 1);
        return {
          ...prevState,
          expandedRows: currentExpandedRows
        };
      }
    });
  }, [expandableRowsConfig, onRowExpand]);

  // Handle expand all rows
  const handleExpandAllRows = useCallback(() => {
    setTableState(prevState => ({
      ...prevState,
      expandedRows: processedData.map(row => row[idField])
    }));
  }, [processedData, idField]);

  // Handle collapse all rows
  const handleCollapseAllRows = useCallback(() => {
    setTableState(prevState => ({
      ...prevState,
      expandedRows: []
    }));
  }, []);

  // Get visible and ordered columns
  const visibleOrderedColumns = useMemo(() => {
    return columns
      .filter(col => tableState.columns.visible.includes(col.id))
      .sort((a, b) => {
        const indexA = tableState.columns.order.indexOf(a.id);
        const indexB = tableState.columns.order.indexOf(b.id);
        return indexA - indexB;
      });
  }, [columns, tableState.columns.visible, tableState.columns.order]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (!keyboardNavigationConfig.enabled) return;

    const maxRowIndex = processedData.length - 1;
    const maxColIndex = visibleOrderedColumns.length - 1;

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
        const rowId = processedData[rowIndex][idField];
        if (tableState.expandedRows.includes(rowId)) {
          handleRowExpand(rowId);
        } else if (onRowClick) {
          onRowClick(processedData[rowIndex]);
        }
        event.preventDefault();
        break;
    }

    // Focus the cell
    if (newRowIndex !== rowIndex || newColIndex !== colIndex) {
      const cellId = `cell-${newRowIndex}-${newColIndex}`;
      const cellElement = document.getElementById(cellId);
      if (cellElement) {
        cellElement.focus();
      }
    }
  }, [keyboardNavigationConfig.enabled, processedData, visibleOrderedColumns.length, idField, tableState.expandedRows, handleRowExpand, onRowClick]);

  // Handle export
  const handleExport = useCallback((format: ExportFormat) => {
    // Get all data or just visible columns
    const exportData = processedData.map(row => {
      const exportRow: Record<string, any> = {};

      // Include only visible columns if configured
      const columnsToExport = exportConfig.includeHiddenColumns
        ? columns
        : columns.filter(col => tableState.columns.visible.includes(col.id));

      columnsToExport.forEach(column => {
        exportRow[column.label] = row[column.id];
      });

      return exportRow;
    });

    // Call legacy callback if provided
    if (onExportFormat) {
      onExportFormat(format.toString());
    }

    // Call standard callback if provided
    if (onExport) {
      onExport(format, exportData);
    }
  }, [onExport, onExportFormat, processedData, columns, tableState.columns.visible, exportConfig]);

  // Handle drill down
  const handleDrillDown = useCallback((row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => {
    if (onDrillDown) {
      onDrillDown(row, sourceGrouping, targetGrouping, filters);
    }
  }, [onDrillDown]);

  // Set selected row
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Process data for grouping
  const groupedData = useMemo(() => {
    if (!groupingConfig.enabled || !tableState.grouping.groupByColumn) {
      return null;
    }

    const groups = groupData(processedData, tableState.grouping.groupByColumn);

    // Convert groups to array of objects
    return Object.entries(groups).map(([groupValue, rows]) => {
      const groupRow: Record<string, any> = {
        [tableState.grouping.groupByColumn!]: groupValue,
        _groupRows: rows.length,
        _isGroupRow: true,
        [idField]: `group_${groupValue}`
      };

      // Calculate aggregations for numeric columns
      columns.forEach(column => {
        if (column.id !== tableState.grouping.groupByColumn && (column.type === 'number' || column.type === 'currency')) {
          // Sum numeric values
          groupRow[column.id] = rows.reduce((sum, row) => {
            const value = Number(row[column.id]) || 0;
            return sum + value;
          }, 0);
        }
      });

      return groupRow;
    });
  }, [groupingConfig.enabled, tableState.grouping.groupByColumn, processedData, columns, idField]);

  // Determine which data to display
  const displayData = groupingConfig.enabled && tableState.grouping.groupByColumn && groupedData
    ? groupedData
    : processedData;

  // Debug data
  const debugData = () => {
    console.log('EnhancedTable data:', data);
    console.log('EnhancedTable processedData:', processedData);
    console.log('EnhancedTable displayData:', displayData);
    console.log('EnhancedTable columns:', columns);
    console.log('EnhancedTable tableState:', tableState);
  };

  // Render loading state
  if (loading) {
    return (
      <div style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <CircularProgress />
      </div>
    );
  }



  return (
    <Paper elevation={0} variant="outlined" sx={{ width: '100%', mb: 2, ...sx }}>

      {/* Table header with title, search, and actions */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Filtering */}
          {filteringConfig.enabled && (
            <Filtering
              columns={columns}
              config={filteringConfig}
              quickFilterValue={tableState.filtering.quickFilter}
              advancedFilters={tableState.filtering.advancedFilters}
              onQuickFilterChange={handleQuickFilterChange}
              onAdvancedFiltersChange={handleAdvancedFiltersChange}
            />
          )}

          {/* Column Management */}
          {columnManagementConfig.enabled && (
            <ColumnManagement
              columns={columns}
              config={columnManagementConfig}
              visibleColumns={tableState.columns.visible}
              columnOrder={tableState.columns.order}
              stickyColumns={tableState.columns.sticky}
              onVisibilityChange={handleColumnVisibilityChange}
              onOrderChange={handleColumnOrderChange}
              onStickyChange={handleStickyColumnChange}
            />
          )}

          {/* Grouping */}
          {groupingConfig.enabled && !groupingConfig.hierarchical && (
            <Grouping
              columns={columns}
              config={groupingConfig}
              groupByColumn={tableState.grouping.groupByColumn}
              onGroupingChange={handleGroupingChange}
            />
          )}

          {/* Hierarchical Grouping */}
          {groupingConfig.enabled && groupingConfig.hierarchical && (
            <HierarchicalGrouping
              columns={columns}
              config={groupingConfig}
              groupByLevels={tableState.grouping.groupByLevels}
              onGroupingLevelsChange={handleGroupingLevelsChange}
            />
          )}

          {/* Aggregation */}
          {aggregationConfig.enabled && (
            <Aggregation
              columns={columns}
              config={aggregationConfig}
              data={processedData}
              enabledAggregations={tableState.aggregation.enabled}
              visibleColumns={tableState.columns.visible}
              onAggregationToggle={handleAggregationToggle}
            />
          )}

          {/* Expandable Rows */}
          {expandableRowsConfig.enabled && renderRowDetail && (
            <ExpandAllButton
              config={expandableRowsConfig}
              expandedRows={tableState.expandedRows}
              totalRows={displayData.length}
              onExpandAll={handleExpandAllRows}
              onCollapseAll={handleCollapseAllRows}
            />
          )}

          {/* Drill Down */}
          {drillDownConfig.enabled && onDrillDown && (
            <DrillDown
              configs={(drillDownConfig as any).configs || []}
              sourceGrouping={tableState.grouping.groupByColumn}
              selectedRow={selectedRow}
              onDrillDown={handleDrillDown}
            />
          )}

          {/* Export */}
          {exportConfig.enabled && onExport && (
            <Export
              config={exportConfig}
              onExport={handleExport}
            />
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Toolbar>

      {/* Table content */}
      <div
        style={{
          width: '100%',
          overflowX: responsiveConfig.enabled ? 'auto' : undefined
        }}
      >
        {displayData.length === 0 && !groupingConfig.hierarchical ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {emptyMessage}
            </Typography>
          </div>
        ) : groupingConfig.hierarchical && tableState.grouping.groupByLevels.length > 0 ? (
          <HierarchicalTableContent
            columns={columns}
            groupByLevels={tableState.grouping.groupByLevels.map(id => id)}
            hierarchicalData={hierarchicalData}
            expandedGroups={tableState.grouping.expandedGroups}
            loading={isLoadingHierarchicalData}
            emptyMessage={emptyMessage}
            onToggleGroup={handleToggleGroup}
            onLoadChildren={handleLoadGroupChildren}
          />
        ) : (
          <TableContent
            data={displayData}
            columns={columns}
            visibleColumns={tableState.columns.visible}
            stickyColumns={tableState.columns.sticky}
            orderBy={tableState.sorting.column}
            order={tableState.sorting.direction}
            page={tableState.pagination.page}
            pageSize={tableState.pagination.pageSize}
            idField={idField}
            emptyMessage={emptyMessage}
            expandedRows={tableState.expandedRows}
            selectedRow={selectedRow}
            keyboardNavConfig={keyboardNavigationConfig}
            stickyColumnsConfig={stickyColumnsConfig}
            renderRowDetail={renderRowDetail}
            onSort={handleSort}
            onRowClick={onRowClick}
            onRowExpand={handleRowExpand}
            onKeyDown={handleKeyDown}
            onSetSelectedRow={setSelectedRow}
          />
        )}
      </div>

      {/* Aggregation Row */}
      {aggregationConfig.enabled && aggregationConfig.showInFooter && tableState.aggregation.enabled.length > 0 && (
        <AggregationRow
          columns={columns}
          data={processedData}
          enabledAggregations={tableState.aggregation.enabled}
          visibleColumns={tableState.columns.visible}
        />
      )}

      {/* Pagination */}
      {paginationConfig.enabled && (
        <Pagination
          config={paginationConfig}
          totalCount={processedData.length}
          page={tableState.pagination.page}
          pageSize={tableState.pagination.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Paper>
  );
};

export default EnhancedTable;
