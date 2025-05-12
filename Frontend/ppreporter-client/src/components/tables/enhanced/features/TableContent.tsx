import React, { useRef, useEffect } from 'react';
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { ColumnDef, KeyboardNavigationConfig, RowDetailRenderer, StickyColumnsConfig } from '../types';
import Sorting from './Sorting';
import { ExpandButton, ExpandedRow } from './ExpandableRows';

interface TableContentProps {
  data: any[];
  columns: ColumnDef[];
  visibleColumns: string[];
  stickyColumns: string[];
  orderBy: string;
  order: 'asc' | 'desc';
  page: number;
  pageSize: number;
  idField: string;
  emptyMessage: string;
  expandedRows: string[];
  selectedRow: any | null;
  keyboardNavConfig: KeyboardNavigationConfig;
  stickyColumnsConfig: StickyColumnsConfig;
  renderRowDetail?: RowDetailRenderer;
  onSort: (columnId: string) => void;
  onRowClick?: (row: any) => void;
  onRowExpand: (rowId: string) => void;
  onKeyDown: (event: React.KeyboardEvent, rowIndex: number, colIndex: number) => void;
  onSetSelectedRow: (row: any) => void;
}

/**
 * Table content component
 */
const TableContent: React.FC<TableContentProps> = ({
  data,
  columns,
  visibleColumns,
  stickyColumns,
  orderBy,
  order,
  page,
  pageSize,
  idField,
  emptyMessage,
  expandedRows,
  selectedRow,
  keyboardNavConfig,
  stickyColumnsConfig,
  renderRowDetail,
  onSort,
  onRowClick,
  onRowExpand,
  onKeyDown,
  onSetSelectedRow
}) => {
  const tableRef = useRef<HTMLDivElement>(null);

  // Get visible columns in the correct order
  const visibleOrderedColumns = columns.filter(col => visibleColumns.includes(col.id));

  // Calculate paginated data
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  // Handle row click
  const handleRowClick = (row: any) => {
    onSetSelectedRow(row);
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Handle row expansion
  const handleRowExpand = (event: React.MouseEvent, rowId: string) => {
    event.stopPropagation();
    onRowExpand(rowId);
  };

  // Render cell content
  const renderCellContent = (column: ColumnDef, row: any) => {
    const value = row[column.id];

    // If column has a custom formatter, use it
    if (column.format) {
      return column.format(value, row);
    }

    // Handle different column types
    switch (column.type) {
      case 'number':
        return value?.toLocaleString() || '-';

      case 'currency':
        return value !== undefined && value !== null
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(value)
          : '-';

      case 'percentage':
        return value !== undefined && value !== null
          ? `${value}%`
          : '-';

      case 'link':
        if (!column.linkConfig) return value;

        let url = '';
        let displayText = value;

        // Determine URL
        if (column.linkConfig.urlBuilder) {
          url = column.linkConfig.urlBuilder(row);
        } else if (column.linkConfig.urlField) {
          url = row[column.linkConfig.urlField] || '';
          if (column.linkConfig.urlPrefix) url = column.linkConfig.urlPrefix + url;
          if (column.linkConfig.urlSuffix) url = url + column.linkConfig.urlSuffix;
        } else {
          url = String(value);
        }

        // Determine display text
        if (column.linkConfig.displayField) {
          displayText = row[column.linkConfig.displayField] || value;
        }

        return (
          <Link
            href={url}
            target={column.linkConfig.openInNewTab ? '_blank' : '_self'}
            onClick={(e) => e.stopPropagation()}
            rel="noopener noreferrer"
            sx={{ textDecoration: 'none', color: 'primary.main' }}
          >
            {displayText}
          </Link>
        );

      default:
        return value !== undefined && value !== null ? value : '-';
    }
  };

  // Debug data
  console.log('TableContent data:', {
    dataType: typeof data,
    isArray: Array.isArray(data),
    dataLength: Array.isArray(data) ? data.length : 'N/A',
    paginatedDataLength: paginatedData.length,
    firstItem: paginatedData.length > 0 ? paginatedData[0] : null
  });

  // If no data, show empty message
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Debug: Data is {Array.isArray(data) ? 'an empty array' : `not an array (${typeof data})`}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <TableContainer ref={tableRef}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {/* Expand column if row details are enabled */}
            {renderRowDetail && (
              <TableCell padding="checkbox" />
            )}

            {/* Render column headers */}
            {visibleOrderedColumns.map((column, colIndex) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{
                  ...(stickyColumnsConfig.enabled && stickyColumns.includes(column.id) ? {
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
                    backgroundColor: theme => theme.palette.background.paper,
                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                  } : {})
                }}
              >
                <Sorting
                  column={column}
                  config={{ enabled: true }}
                  activeColumn={orderBy}
                  direction={order}
                  onSort={onSort}
                />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((row, rowIndex) => {
            const rowId = row[idField];
            const isExpanded = expandedRows.includes(rowId);
            const isSelected = selectedRow && selectedRow[idField] === rowId;

            return (
              <React.Fragment key={rowId || `row-${rowIndex}`}>
                <TableRow
                  hover
                  onClick={() => handleRowClick(row)}
                  selected={isSelected}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {/* Expand button if row details are enabled */}
                  {renderRowDetail && (
                    <TableCell padding="checkbox">
                      <ExpandButton
                        expanded={isExpanded}
                        onClick={(e) => {
                          if (e) handleRowExpand(e, rowId);
                          else handleRowExpand({} as React.MouseEvent, rowId);
                        }}
                      />
                    </TableCell>
                  )}

                  {/* Render cells */}
                  {visibleOrderedColumns.map((column, colIndex) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        whiteSpace: column.wrap ? 'normal' : 'nowrap',
                        maxWidth: column.maxWidth || 'auto',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        ...(stickyColumnsConfig.enabled && stickyColumns.includes(column.id) ? {
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          backgroundColor: theme => theme.palette.background.paper,
                          boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                        } : {})
                      }}
                      tabIndex={keyboardNavConfig.enabled ? 0 : -1}
                      onKeyDown={(e) => keyboardNavConfig.enabled && onKeyDown(e, rowIndex, colIndex)}
                      id={`cell-${rowIndex}-${colIndex}`}
                    >
                      {renderCellContent(column, row)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Expanded row content */}
                {renderRowDetail && (
                  <ExpandedRow
                    colSpan={visibleOrderedColumns.length + 1}
                    expanded={isExpanded}
                    renderDetail={renderRowDetail}
                    row={row}
                  />
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableContent;
