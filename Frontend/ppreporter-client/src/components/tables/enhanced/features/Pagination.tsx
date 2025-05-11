import React from 'react';
import { TablePagination } from '@mui/material';
import { PaginationConfig } from '../types';

interface PaginationProps {
  config: PaginationConfig;
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Pagination component for tables
 */
const Pagination: React.FC<PaginationProps> = ({
  config,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  return (
    <TablePagination
      component="div"
      count={totalCount}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={pageSize}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={config.pageSizeOptions || [10, 25, 50, 100]}
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
      labelRowsPerPage="Rows per page:"
      sx={{
        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
          margin: 0
        }
      }}
    />
  );
};

export default Pagination;
