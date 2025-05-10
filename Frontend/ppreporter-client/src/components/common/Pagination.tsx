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
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import { PaginationProps } from '../../types/pagination';

/**
 * Enhanced pagination component with page size selection
 */
const Pagination: React.FC<PaginationProps> = ({
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
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number): void => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (event: SelectChangeEvent<number>): void => {
    const newPageSize = event.target.value as number;
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
