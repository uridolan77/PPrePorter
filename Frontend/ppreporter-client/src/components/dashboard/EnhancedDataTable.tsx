import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { MicroSparkline, MicroBarChart, MicroBulletChart } from './MicroCharts';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import VirtualizedList from '../common/VirtualizedList';
import { CommonProps, ColumnDef } from '../../types/common';

// Column definition with additional properties for enhanced data table
interface EnhancedColumnDef extends ColumnDef {
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'status' | 'sparkline' | 'progress' | 'datetime';
  valueKey?: string;
  comparativeKey?: string;
  target?: number;
  minWidth?: number;
  maxWidth?: number;
  wrap?: boolean;
}

// Props interface for EnhancedDataTable
interface EnhancedDataTableProps<T> extends CommonProps {
  data: T[];
  columns: EnhancedColumnDef[];
  title?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  onExport?: () => void;
  initialSortBy?: string;
  initialSortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  maxHeight?: string | number;
  useVirtualization?: boolean;
  rowHeight?: number;
}

/**
 * EnhancedDataTable component
 * Displays tabular data with integrated micro-visualizations
 * Features sorting, filtering, and responsive design
 */
function EnhancedDataTable<T extends Record<string, any>>({
  data = [],
  columns = [],
  title = '',
  isLoading = false,
  onRowClick = null,
  onExport = () => {},
  initialSortBy = 'id',
  initialSortDirection = 'asc',
  emptyMessage = 'No data available',
  maxHeight = '600px',
  useVirtualization = false,
  rowHeight = 53,
  sx
}: EnhancedDataTableProps<T>): React.ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Handle sort request
  const handleRequestSort = useCallback((property: string): void => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  }, [sortBy, sortDirection]);

  // Get status color based on value
  const getStatusColor = useCallback((status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    status = status.toLowerCase();
    if (status === 'active' || status === 'completed' || status === 'approved' || status === 'success') {
      return 'success';
    } else if (status === 'pending' || status === 'in progress' || status === 'processing') {
      return 'warning';
    } else if (status === 'inactive' || status === 'failed' || status === 'rejected' || status === 'error') {
      return 'error';
    } else if (status === 'new' || status === 'open') {
      return 'info';
    }
    return 'default';
  }, []);

  // Render cell content based on column type
  const renderCellContent = useCallback((column: EnhancedColumnDef, row: T): React.ReactNode => {
    const value = row[column.id];
    
    if (value === undefined || value === null) {
      return '-';
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
        // Assume trendData is provided in the row
        return row.trendData ? (
          <MicroSparkline
            data={row.trendData}
            width={60}
            height={24}
            valueKey={column.valueKey || 'value'}
            accessibilityLabel={column.label}
          />
        ) : (
          '-'
        );
      
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
      
      case 'datetime':
        // Format date if it's a valid date string
        try {
          const date = new Date(value);
          return date.toLocaleString();
        } catch (e) {
          return value;
        }
      
      default:
        return value;
    }
  }, [getStatusColor]);

  // Filter and sort data
  const sortedAndFilteredData = useMemo(() => {
    // Filter data based on search term
    let filteredData = data;
    if (searchTerm) {
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
    
    // Sort data based on sort column and direction
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // Handle null or undefined values
      if (aValue === undefined || aValue === null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortDirection === 'asc' ? 1 : -1;
      
      // Handle different value types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Default numeric comparison
      return sortDirection === 'asc' 
        ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
        : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);
    });
  }, [data, searchTerm, sortBy, sortDirection]);

  // Memoized row renderer for virtualized list
  const renderRow = useCallback(({ style, data: row, index }: { style: React.CSSProperties; data: T; index: number }) => {
    return (
      <div style={style}>
        <TableRow
          hover
          key={row.id || index}
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
        >
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
          
          {onRowClick && (
            <TableCell padding="checkbox">
              <IconButton size="small">
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </TableCell>
          )}
        </TableRow>
      </div>
    );
  }, [columns, onRowClick, renderCellContent]);

  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, ...sx }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ width: '100%', mb: 2, ...sx }}>
      {/* Table header with search and actions */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: isMobile ? 120 : 200 }}
          />
          
          <Tooltip title="Filter data">
            <IconButton size="small">
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export data">
            <IconButton size="small" onClick={onExport}>
              <GetAppIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Table content */}
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader size="small" aria-label={title}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                  sx={{ 
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    minWidth: column.minWidth || 'auto',
                    maxWidth: column.maxWidth || 'auto',
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              
              {onRowClick && (
                <TableCell padding="checkbox" />
              )}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {sortedAndFilteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onRowClick ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : useVirtualization ? (
              // Virtualized view for large datasets
              <TableRow>
                <TableCell colSpan={columns.length + (onRowClick ? 1 : 0)} padding="none">
                  <Box sx={{ height: typeof maxHeight === 'number' ? maxHeight - 100 : 400 }}>
                    <VirtualizedList
                      data={sortedAndFilteredData}
                      renderRow={renderRow}
                      height={typeof maxHeight === 'number' ? maxHeight - 100 : 400}
                      itemSize={rowHeight}
                      loading={isLoading}
                      emptyMessage={emptyMessage}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              // Standard view for smaller datasets
              sortedAndFilteredData.map((row, index) => (
                <TableRow
                  hover
                  key={row.id || index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
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
                  
                  {onRowClick && (
                    <TableCell padding="checkbox">
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default memo(EnhancedDataTable) as <T extends Record<string, any>>(props: EnhancedDataTableProps<T>) => React.ReactElement;
