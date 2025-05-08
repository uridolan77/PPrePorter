import React, { useState } from 'react';
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
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/**
 * A reusable data grid component for displaying tabular data with sorting, pagination, and filtering
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions (id, label, align, format, minWidth, etc.)
 * @param {Array} props.data - Array of data objects to display
 * @param {Function} props.onRowClick - Function to call when a row is clicked
 * @param {boolean} props.loading - Whether the data is loading
 * @param {boolean} props.selectable - Whether rows can be selected
 * @param {Array} props.selectedRows - Array of selected row IDs
 * @param {Function} props.onSelectRows - Function to call when row selection changes
 * @param {Function} props.onRefresh - Function to call when the refresh button is clicked
 * @param {Function} props.onSearch - Function to call when the search input changes
 * @param {string} props.searchPlaceholder - Placeholder text for the search input
 * @param {React.ReactNode} props.actions - Actions to display in the toolbar
 * @param {string} props.emptyMessage - Message to display when there is no data
 * @param {number} props.rowsPerPageOptions - Options for rows per page
 */
const DataGrid = ({
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
}) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(columns[0]?.id || '');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all click
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row[idField]);
      onSelectRows(newSelected);
      return;
    }
    onSelectRows([]);
  };

  // Handle row selection click
  const handleSelectClick = (event, id) => {
    event.stopPropagation();
    
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, id];
    } else {
      newSelected = selectedRows.filter((rowId) => rowId !== id);
    }

    onSelectRows(newSelected);
  };

  // Handle row click
  const handleRowClick = (event, row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Check if a row is selected
  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  // Calculate empty rows to maintain consistent page height
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
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
              ) : (
                // Display actual data
                data
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
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
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (onRowClick ? 1 : 0)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default DataGrid;