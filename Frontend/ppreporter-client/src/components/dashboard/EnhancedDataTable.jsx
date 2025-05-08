import React, { useState, useMemo } from 'react';
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

/**
 * EnhancedDataTable component
 * Displays tabular data with integrated micro-visualizations
 * Features sorting, filtering, and responsive design
 */
const EnhancedDataTable = ({
  data = [],
  columns = [],
  title = '',
  isLoading = false,
  onRowClick = null,
  onExport = () => {},
  initialSortBy = 'id',
  initialSortDirection = 'asc',
  emptyMessage = 'No data available',
  maxHeight = '600px'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Format cell content based on type
  const renderCellContent = (column, row) => {
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
      
      case 'bars':
        // Assume barData is provided in the row
        return row.barData ? (
          <MicroBarChart
            data={row.barData}
            width={60}
            height={24}
            valueKey={column.valueKey || 'value'}
            accessibilityLabel={column.label}
          />
        ) : (
          '-'
        );
      
      default:
        return value;
    }
  };

  // Get color for status chips
  const getStatusColor = (status) => {
    const statusMap = {
      active: 'success',
      inactive: 'default',
      pending: 'warning',
      error: 'error',
      completed: 'success',
      processing: 'info'
    };
    
    return statusMap[status.toLowerCase()] || 'default';
  };

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

    // Sort data
    return filteredData.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      // Handle null/undefined values
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;
      
      // Compare based on type
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Default string comparison
      return sortDirection === 'asc'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }, [data, searchTerm, sortBy, sortDirection]);

  // Render loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ width: '100%', mb: 2 }}>
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
            {sortedAndFilteredData.length > 0 ? (
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
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (onRowClick ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default EnhancedDataTable;