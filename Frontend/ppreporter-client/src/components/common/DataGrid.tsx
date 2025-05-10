import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Toolbar,
  Tooltip,
  alpha,
  FormControlLabel,
  Switch
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VirtualizedList from './VirtualizedList';
import { DataGridProps, ColumnDef } from '../../types/common';

/**
 * A reusable data grid component for displaying tabular data with sorting, pagination, and filtering
 * Enhanced with virtualization for improved performance with large datasets
 */
function DataGrid<T extends Record<string, any>>({
  columns = [],
  data = [],
  onRowClick,
  loading = false,
  selectable = false,
  selectedRows = [],
  onSelectRows,
  onRefresh,
  onSearch,
  searchPlaceholder = 'Search...',
  actions,
  emptyMessage = 'No data to display',
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 10,
  idField = 'id',
  virtualized = false,
  virtualizedHeight = 400,
  rowHeight = 53,
  sx
}: DataGridProps<T>): React.ReactElement {
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>(columns[0]?.id || '');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(defaultRowsPerPage);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [useVirtualization, setUseVirtualization] = useState<boolean>(virtualized);

  // Handle sort request
  const handleRequestSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all click
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (onSelectRows) {
      if (event.target.checked) {
        const newSelected = data.map((row) => row[idField]);
        onSelectRows(newSelected);
        return;
      }
      onSelectRows([]);
    }
  };

  // Handle row selection click
  const handleSelectClick = (event: React.MouseEvent, id: string | number): void => {
    event.stopPropagation();

    if (onSelectRows) {
      // Cast selectedRows to (string | number)[] to fix TypeScript error
      const typedSelectedRows = selectedRows as (string | number)[];
      const selectedIndex = typedSelectedRows.indexOf(id);
      let newSelected: (string | number)[] = [];

      if (selectedIndex === -1) {
        newSelected = [...typedSelectedRows, id];
      } else {
        newSelected = typedSelectedRows.filter((rowId) => rowId !== id);
      }

      // Cast back to expected type for the callback
      onSelectRows(newSelected as any);
    }
  };

  // Handle row click
  const handleRowClick = (event: React.MouseEvent, row: T): void => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Check if a row is selected
  const isSelected = (id: string | number): boolean => (selectedRows as (string | number)[]).indexOf(id) !== -1;

  // Calculate empty rows to maintain consistent page height
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  // Toggle virtualization
  const handleVirtualizationToggle = useCallback((): void => {
    setUseVirtualization(prev => !prev);
  }, []);

  // Get sorted and paginated data
  const displayData = useMemo(() => {
    // Sort the data
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === bValue) return 0;

      if (order === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    // Apply pagination if not using virtualization
    if (!useVirtualization) {
      return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }

    return sortedData;
  }, [data, orderBy, order, page, rowsPerPage, useVirtualization]);

  // Memoized row renderer for virtualized list
  const renderRow = useCallback(({ style, data: row, index }: { style: React.CSSProperties; data: T; index: number }) => {
    const isItemSelected = selectable && isSelected(row[idField]);
    const labelId = `enhanced-table-checkbox-${index}`;

    return (
      <div style={style}>
        <TableRow
          hover
          onClick={(event) => handleRowClick(event, row)}
          role="checkbox"
          aria-checked={isItemSelected}
          tabIndex={-1}
          key={row[idField] || index}
          selected={isItemSelected}
          sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
        >
          {selectable && onSelectRows && (
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                checked={isItemSelected}
                onClick={(event) => handleSelectClick(event, row[idField])}
                inputProps={{
                  'aria-labelledby': labelId,
                }}
              />
            </TableCell>
          )}
          {columns.map((column) => {
            const value = row[column.id];
            return (
              <TableCell key={column.id} align={column.align || 'left'}>
                {column.format ? column.format(value, row) : value}
              </TableCell>
            );
          })}
          {onRowClick && (
            <TableCell align="right">
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </TableCell>
          )}
        </TableRow>
      </div>
    );
  }, [columns, handleRowClick, handleSelectClick, idField, isSelected, onRowClick, onSelectRows, selectable]);

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selectedRows.length > 0 && {
              bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
            }),
          }}
        >
          {selectedRows.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selectedRows.length} selected
            </Typography>
          ) : (
            <TextField
              variant="outlined"
              placeholder={searchPlaceholder}
              size="small"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 500 }}
            />
          )}

          {selectedRows.length > 0 ? (
            <Tooltip title="Delete">
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton onClick={onRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Filter list">
                <IconButton>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <FormControlLabel
                control={
                  <Switch
                    checked={useVirtualization}
                    onChange={handleVirtualizationToggle}
                    name="virtualization"
                    color="primary"
                    size="small"
                  />
                }
                label="Virtualize"
                sx={{ ml: 1 }}
              />
              {actions && (
                <Box sx={{ display: 'flex' }}>
                  {actions}
                </Box>
              )}
            </>
          )}
        </Toolbar>

        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <TableHead>
              <TableRow>
                {selectable && onSelectRows && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={handleSelectAllClick}
                      inputProps={{
                        'aria-label': 'select all',
                      }}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    padding={column.disablePadding ? 'none' : 'normal'}
                    sortDirection={orderBy === column.id ? order : false}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
                {onRowClick && <TableCell width={50} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (onRowClick ? 1 : 0)} align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (onRowClick ? 1 : 0)} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                      {emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : useVirtualization ? (
                // Virtualized view for large datasets
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (onRowClick ? 1 : 0)} padding="none">
                    <Box sx={{ height: virtualizedHeight }}>
                      <VirtualizedList
                        data={displayData}
                        renderRow={renderRow}
                        height={virtualizedHeight}
                        itemSize={rowHeight}
                        loading={loading}
                        emptyMessage={emptyMessage}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                // Standard view for smaller datasets
                displayData.map((row, index) => {
                  const isItemSelected = selectable && isSelected(row[idField]);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleRowClick(event, row)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row[idField] || index}
                      selected={isItemSelected}
                      sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    >
                      {selectable && onSelectRows && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            onClick={(event) => handleSelectClick(event, row[idField])}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell key={column.id} align={column.align || 'left'}>
                            {column.format ? column.format(value, row) : value}
                          </TableCell>
                        );
                      })}
                      {onRowClick && (
                        <TableCell align="right">
                          <IconButton size="small">
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
              {!useVirtualization && emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (onRowClick ? 1 : 0)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {!useVirtualization && (
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
}

export default memo(DataGrid) as <T extends Record<string, any>>(props: DataGridProps<T>) => React.ReactElement;
