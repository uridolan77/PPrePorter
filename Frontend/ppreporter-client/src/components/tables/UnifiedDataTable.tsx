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
import { CommonProps } from '../../types/common';

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

// Import micro-visualizations
import { MicroSparkline, MicroBarChart, MicroBulletChart } from '../dashboard/MicroCharts';

// Import formatters if available
let formatCurrency, formatNumber, formatPercentage;
try {
  const formatters = require('../../utils/formatters');
  formatCurrency = formatters.formatCurrency;
  formatNumber = formatters.formatNumber;
  formatPercentage = formatters.formatPercentage;
} catch (error) {
  // Fallback implementations if formatters are not available
  formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  formatNumber = (value: number) => value.toLocaleString();
  formatPercentage = (value: number) => `${value}%`;
}

// Type definitions
export interface ColumnDef {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: any) => React.ReactNode;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'status' | 'sparkline' | 'progress' | 'bars';
  wrap?: boolean;
  maxWidth?: string;
  valueKey?: string;
  comparativeKey?: string;
  target?: number;
  sortable?: boolean;
}

export interface TableFeatures {
  sorting?: boolean;
  filtering?: boolean;
  pagination?: boolean;
  virtualization?: boolean;
  microVisualizations?: boolean;
  exportable?: boolean;
}

export interface UnifiedDataTableProps extends CommonProps {
  data?: any[];
  columns?: ColumnDef[];
  title?: string;
  loading?: boolean;
  onRowClick?: (row: any) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRows?: (selectedIds: string[]) => void;
  onRefresh?: () => void;
  onSearch?: (searchTerm: string) => void;
  onExport?: () => void;
  features?: TableFeatures;
  emptyMessage?: string;
  maxHeight?: string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  idField?: string;
}

interface VirtualRowProps {
  style: React.CSSProperties;
  data: any;
  index: number;
}

/**
 * UnifiedDataTable component
 * A comprehensive data table component that combines features from DataGrid and EnhancedDataTable
 */
const UnifiedDataTable: React.FC<UnifiedDataTableProps> = ({
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
  sx
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>(columns[0]?.id || '');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(defaultRowsPerPage);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [useVirtualization, setUseVirtualization] = useState<boolean>(features.virtualization || false);

  // Handle sort request
  const handleRequestSort = (property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle select all click
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!onSelectRows) return;

    if (event.target.checked) {
      const newSelected = data.map((row) => row[idField]);
      onSelectRows(newSelected);
      return;
    }
    onSelectRows([]);
  };

  // Handle row selection click
  const handleSelectClick = (event: React.MouseEvent<HTMLButtonElement>, id: string): void => {
    if (!onSelectRows) return;
    event.stopPropagation();

    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedRows, id];
    } else {
      newSelected = selectedRows.filter((rowId) => rowId !== id);
    }

    onSelectRows(newSelected);
  };

  // Handle row click
  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, row: any): void => {
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

  // Handle row menu open
  const handleRowMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, row: any): void => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  // Handle row menu close
  const handleRowMenuClose = (): void => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // Check if a row is selected
  const isSelected = (id: string): boolean => selectedRows.indexOf(id) !== -1;

  // Format cell content based on type
  const renderCellContent = (column: ColumnDef, row: any): React.ReactNode => {
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
            actual={value}
            target={column.target || 100}
            comparative={row[column.comparativeKey || '']}
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
  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (!status) return 'default';

    const statusMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
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
  const handleVirtualizationToggle = useCallback((): void => {
    setUseVirtualization(prev => !prev);
  }, []);

  // Memoized row renderer for virtualized list
  const renderRow = useCallback(({ style, data: row, index }: VirtualRowProps): React.ReactElement => {
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
                onClick={(event) => handleSelectClick(event as React.MouseEvent<HTMLButtonElement>, row[idField])}
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
    <Paper elevation={0} variant="outlined" sx={{ width: '100%', mb: 2, ...sx }}>
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
              <Tooltip title={useVirtualization ? "Disable virtualization" : "Enable virtualization"}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useVirtualization}
                      onChange={handleVirtualizationToggle}
                      size="small"
                    />
                  }
                  label="Virtual"
                  sx={{ ml: 1, mr: 0 }}
                />
              </Tooltip>
            )}
          </Box>
        )}
      </Toolbar>

      {/* Table content */}
      <TableContainer sx={{ maxHeight }}>
        {useVirtualization ? (
          <Box sx={{ height: maxHeight, width: '100%' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {selectable && (
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
                      sortDirection={orderBy === column.id ? order : false}
                    >
                      {column.sortable !== false && features.sorting ? (
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
            </Table>
            <VirtualizedList
              height={parseInt(maxHeight) - 56} // Subtract header height
              width="100%"
              itemCount={sortedAndFilteredData.length}
              itemSize={53} // Default MUI TableRow height
              itemData={sortedAndFilteredData}
              renderRow={renderRow}
            />
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {selectable && (
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
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.sortable !== false && features.sorting ? (
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
              {paginatedData.map((row, index) => {
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
                          onClick={(event) => handleSelectClick(event as React.MouseEvent<HTMLButtonElement>, row[idField])}
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
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={columns.length + (selectable ? 2 : 1)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Empty state */}
      {data.length === 0 && !loading && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      )}

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
        <MenuItem onClick={handleRowMenuClose}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        <MenuItem onClick={handleRowMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={handleRowMenuClose}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Duplicate" />
        </MenuItem>
        <MenuItem onClick={handleRowMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default UnifiedDataTable;
