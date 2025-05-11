import React from 'react';
import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ExpandableRowsConfig, RowDetailRenderer } from '../types';

interface ExpandButtonProps {
  expanded: boolean;
  onClick: (event?: React.MouseEvent) => void;
}

/**
 * Expand/collapse button component
 */
export const ExpandButton: React.FC<ExpandButtonProps> = ({
  expanded,
  onClick
}) => {
  return (
    <Tooltip title={expanded ? "Collapse" : "Expand"}>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{ ml: 1 }}
      >
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Tooltip>
  );
};

interface ExpandedRowProps {
  colSpan: number;
  expanded: boolean;
  renderDetail: RowDetailRenderer;
  row: any;
}

/**
 * Expanded row content component
 */
export const ExpandedRow: React.FC<ExpandedRowProps> = ({
  colSpan,
  expanded,
  renderDetail,
  row
}) => {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{
          py: 0,
          borderBottom: expanded ? undefined : 'none'
        }}
      >
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ py: 2, px: 1 }}>
            {renderDetail(row)}
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

interface ExpandAllButtonProps {
  config: ExpandableRowsConfig;
  expandedRows: string[];
  totalRows: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

/**
 * Expand/collapse all button component
 */
export const ExpandAllButton: React.FC<ExpandAllButtonProps> = ({
  config,
  expandedRows,
  totalRows,
  onExpandAll,
  onCollapseAll
}) => {
  const allExpanded = expandedRows.length === totalRows && totalRows > 0;

  return (
    <Tooltip title={allExpanded ? "Collapse all rows" : "Expand all rows"}>
      <IconButton
        size="small"
        onClick={allExpanded ? onCollapseAll : onExpandAll}
        color={expandedRows.length > 0 ? "primary" : "default"}
      >
        {allExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

export default {
  ExpandButton,
  ExpandedRow,
  ExpandAllButton
};
