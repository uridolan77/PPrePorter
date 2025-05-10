import React, { useState, useMemo, useCallback, memo } from 'react';
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
  Chip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch
} from '@mui/material';
import VirtualizedList from '../common/VirtualizedList';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GetAppIcon from '@mui/icons-material/GetApp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Import micro-visualizations if available
let MicroSparkline, MicroBarChart, MicroBulletChart;
try {
  const MicroCharts = require('../dashboard/MicroCharts');
  MicroSparkline = MicroCharts.MicroSparkline;
  MicroBarChart = MicroCharts.MicroBarChart;
  MicroBulletChart = MicroCharts.MicroBulletChart;
} catch (error) {
  // Fallback implementations if MicroCharts is not available
  MicroSparkline = () => <span>Sparkline</span>;
  MicroBarChart = () => <span>BarChart</span>;
  MicroBulletChart = () => <span>BulletChart</span>;
}

// Import formatters if available
let formatCurrency, formatNumber, formatPercentage;
try {
  const formatters = require('../../utils/formatters');
  formatCurrency = formatters.formatCurrency;
  formatNumber = formatters.formatNumber;
  formatPercentage = formatters.formatPercentage;
} catch (error) {
  // Fallback implementations if formatters are not available
  formatCurrency = (value) => `$${value.toFixed(2)}`;
  formatNumber = (value) => value.toLocaleString();
  formatPercentage = (value) => `${value}%`;
}

/**
 * UnifiedDataTable component
 * A comprehensive data table component that combines features from DataGrid and EnhancedDataTable
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Array of column definitions
 * @param {string} props.title - Table title
 * @param {boolean} props.loading - Whether data is loading
 * @param {Function} props.onRowClick - Function to call when a row is clicked
 * @param {boolean} props.selectable - Whether rows can be selected
 * @param {Array} props.selectedRows - Array of selected row IDs
 * @param {Function} props.onSelectRows - Function to call when row selection changes
 * @param {Function} props.onRefresh - Function to call when refresh button is clicked
 * @param {Function} props.onSearch - Function to call when search input changes
 * @param {Function} props.onExport - Function to call when export button is clicked
 * @param {Object} props.features - Features to enable/disable
 * @param {string} props.emptyMessage - Message to display when there is no data
 * @param {string} props.maxHeight - Maximum height of the table
 * @param {string} props.idField - Field to use as ID
 * @returns {React.ReactNode} - Rendered component
 */
const UnifiedDataTable = ({
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
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(columns[0]?.id || '');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [useVirtualization, setUseVirtualization] = useState(features.virtualization);

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all click
  const handleSelectAllClick = (event) => {
    if (!onSelectRows) return;

    if (event.target.checked) {
      const newSelected = data.map((row) => row[idField]);
      onSelectRows(newSelected);
      return;
    }
    onSelectRows([]);
  };

  // Handle row selection click
  const handleSelectClick = (event, id) => {
    if (!onSelectRows) return;
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

  // Handle row menu open
  const handleRowMenuOpen = (event, row) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  // Handle row menu close
  const handleRowMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // Check if a row is selected
  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  // Format cell content based on type
  const renderCellContent = (column, row) => {
    const value = row[column.id];

    if (value === undefined || value === null) {
      return '-';
    }

    if (column.format) {
      return column.format(value, row);
    }

    if (!features.microVisualizations) {
      return value;
    }

    switch (column.type) {
      case 'currency':
        return formatCurrency(value);

      case 'number':
        return formatNumber(value);

      case 'percentage':
        return formatPercentage(value);

      case 'status':
        return (
          <Chip
            label={value}
            color={getStatusColor(value)}
            size="small"
            variant="outlined"
          />
        );

      case 'sparkline':
        return row.trendData ? (
          <MicroSparkline
            data={row.trendData}
            width={60}
            height={24}
            valueKey={column.valueKey || 'value'}
            accessibilityLabel={column.label}
          />
        ) : '-';

      case 'progress':
        return (
          <MicroBulletChart
            percentComplete={value}
            target={column.target || 100}
            comparative={row[column.comparativeKey]}
            width={60}
            height={24}
            accessibilityLabel={column.label}
          />
        );

      case 'bars':
        return row.barData ? (
          <MicroBarChart
            data={row.barData}
            width={60}
            height={24}
            valueKey={column.valueKey || 'value'}
            accessibilityLabel={column.label}
          />
        ) : '-';

      default:
        return value;
    }
  };

  // Get color for status chips
  const getStatusColor = (status) => {
    if (!status) return 'default';

    const statusMap = {
      active: 'success',
      inactive: 'default',
      pending: 'warning',
      error: 'error',
      completed: 'success',
      processing: 'info'
    };

    return statusMap[status.toString().toLowerCase()] || 'default';
  };

  // Filter and sort data
  const sortedAndFilteredData = useMemo(() => {
    // Filter data based on search term
    let filteredData = data;
    if (searchTerm && features.filtering) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredData = data.filter(row => {
        return Object.keys(row).some(key => {
          const value = row[key];
          if (value === null || value === undefined) return false;
          if (typeof value === 'object') return false;
          return String(value).toLowerCase().includes(lowerCaseSearchTerm);
        });
      });
    }

    // Sort data if sorting is enabled
    if (features.sorting) {
      return filteredData.sort((a, b) => {
        const valueA = a[orderBy];
        const valueB = b[orderBy];

        // Handle null/undefined values
        if (valueA === null || valueA === undefined) return 1;
        if (valueB === null || valueB === undefined) return -1;

        // Compare based on type
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return order === 'asc' ? valueA - valueB : valueB - valueA;
        }

        // Default string comparison
        return order === 'asc'
          ? String(valueA).localeCompare(String(valueB))
          : String(valueB).localeCompare(String(valueA));
      });
    }

    return filteredData;
  }, [data, searchTerm, orderBy, order, features.filtering, features.sorting]);

  // Calculate empty rows to maintain consistent page height
  const emptyRows = features.pagination && page > 0
    ? Math.max(0, (1 + page) * rowsPerPage - sortedAndFilteredData.length)
    : 0;

  // Get paginated data
  const paginatedData = features.pagination && !useVirtualization
    ? sortedAndFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedAndFilteredData;

  // Toggle virtualization
  const handleVirtualizationToggle = useCallback(() => {
    setUseVirtualization(prev => !prev);
  }, []);

  // Memoized row renderer for virtualized list
  const renderRow = useCallback(({ style, data: row, index }) => {
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

          {columns.map((column) => (
            <TableCell
              key={column.id}
              align={column.align || 'left'}
              sx={{
                whiteSpace: column.wrap ? 'normal' : 'nowrap',
                maxWidth: column.maxWidth || 'auto',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {renderCellContent(column, row)}
            </TableCell>
          ))}

          <TableCell padding="checkbox">
            <IconButton
              size="small"
              onClick={(event) => handleRowMenuOpen(event, row)}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </TableCell>
        </TableRow>
      </div>
    );
  }, [columns, handleRowClick, handleSelectClick, idField, isSelected, onRowClick, onSelectRows, selectable, handleRowMenuOpen, renderCellContent]);

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ width: '100%', mb: 2 }}>
      {/* Table header with search and actions */}
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
          <Typography variant="h6" component="div" sx={{ flex: '1 1 100%' }}>
            {title}
          </Typography>
        )}

        {selectedRows.length > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {features.filtering && (
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: isMobile ? 120 : 200 }}
              />
            )}

            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {features.filtering && (
              <Tooltip title="Filter list">
                <IconButton size="small">
                  <FilterListIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {features.exportable && onExport && (
              <Tooltip title="Export data">
                <IconButton size="small" onClick={onExport}>
                  <GetAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {features.virtualization && (
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
            )}
          </Box>
        )}
      </Toolbar>

      {/* Table content */}
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader size="medium" aria-labelledby={title}>
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
                  sx={{
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    minWidth: column.minWidth || 'auto',
                    maxWidth: column.maxWidth || 'auto',
                  }}
                >
                  {features.sorting && column.sortable !== false ? (
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

              <TableCell padding="checkbox" />
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedAndFilteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + 1}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : useVirtualization ? (
              // Virtualized view for large datasets
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + 1} padding="none">
                  <Box sx={{ height: typeof maxHeight === 'number' ? maxHeight - 100 : 500 }}>
                    <VirtualizedList
                      data={sortedAndFilteredData}
                      renderRow={renderRow}
                      height={typeof maxHeight === 'number' ? maxHeight - 100 : 500}
                      itemSize={53} // Height of each row
                      loading={loading}
                      emptyMessage={emptyMessage}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              // Standard view for smaller datasets
              paginatedData.map((row, index) => {
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

                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align || 'left'}
                        sx={{
                          whiteSpace: column.wrap ? 'normal' : 'nowrap',
                          maxWidth: column.maxWidth || 'auto',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {renderCellContent(column, row)}
                      </TableCell>
                    ))}

                    <TableCell padding="checkbox">
                      <IconButton
                        size="small"
                        onClick={(event) => handleRowMenuOpen(event, row)}
                      >
                        <MoreHorizIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}

            {!useVirtualization && emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + 1} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {features.pagination && !useVirtualization && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={sortedAndFilteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Row actions menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleRowMenuClose}
      >
        {onRowClick && (
          <MenuItem onClick={() => { onRowClick(selectedRow); handleRowMenuClose(); }}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleRowMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRowMenuClose}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRowMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default memo(UnifiedDataTable);
