import React from 'react';
import {
  Box,
  Pagination as MuiPagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';

/**
 * Enhanced pagination component with page size selection
 * @param {Object} props - Component props
 * @param {number} props.page - Current page (1-based)
 * @param {number} props.count - Total number of items
 * @param {number} props.pageSize - Number of items per page
 * @param {Array<number>} props.pageSizeOptions - Available page size options
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onPageSizeChange - Callback when page size changes
 * @param {boolean} props.showPageSizeSelector - Whether to show page size selector
 * @param {boolean} props.showTotalCount - Whether to show total count
 * @param {string} props.labelPageSize - Label for page size selector
 * @param {string} props.labelTotalItems - Label for total items
 * @param {Object} props.sx - Additional styles
 */
const Pagination = ({
  page = 1,
  count = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showTotalCount = true,
  labelPageSize = "Items per page:",
  labelTotalItems = "of",
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Calculate total number of pages
  const totalPages = Math.ceil(count / pageSize);
  
  // Handle page change
  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (event) => {
    const newPageSize = event.target.value;
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mt: 2,
        ...sx
      }}
    >
      {/* Page size selector */}
      {showPageSizeSelector && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {labelPageSize}
          </Typography>
          <FormControl size="small" variant="outlined">
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              displayEmpty
              sx={{ minWidth: 80 }}
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* Pagination component */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showTotalCount && (
          <Typography variant="body2" color="text.secondary">
            {isMobile 
              ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, count)} ${labelTotalItems} ${count}`
              : `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, count)} ${labelTotalItems} ${count} items`
            }
          </Typography>
        )}
        
        <MuiPagination
          page={page}
          count={totalPages}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          size={isMobile ? "small" : "medium"}
          showFirstButton={!isMobile}
          showLastButton={!isMobile}
        />
      </Box>
    </Box>
  );
};

export default Pagination;