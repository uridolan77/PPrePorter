import React, { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ClearIcon from '@mui/icons-material/Clear';
import { ColumnDef, GroupingConfig } from '../types';

interface GroupingProps {
  columns: ColumnDef[];
  config: GroupingConfig;
  groupByColumn: string | null;
  onGroupingChange: (columnId: string | null) => void;
}

/**
 * Grouping component for tables
 */
const Grouping: React.FC<GroupingProps> = ({
  columns,
  config,
  groupByColumn,
  onGroupingChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGroupingChange = (columnId: string | null) => {
    onGroupingChange(columnId);
    handleClose();
  };

  // Filter columns that can be grouped
  const groupableColumns = columns.filter(col => col.groupable !== false);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={groupByColumn ? "Change grouping" : "Group by column"}>
          <IconButton
            size="small"
            onClick={handleOpen}
            color={groupByColumn ? "primary" : "default"}
          >
            <GroupWorkIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {groupByColumn && (
          <Chip
            size="small"
            label={`Grouped by: ${columns.find(col => col.id === groupByColumn)?.label || groupByColumn}`}
            onDelete={() => onGroupingChange(null)}
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Group By Column
        </Typography>
        <Divider />
        <MenuItem
          onClick={() => handleGroupingChange(null)}
          selected={groupByColumn === null}
        >
          <Typography color={!groupByColumn ? 'primary' : 'inherit'}>
            None (No Grouping)
          </Typography>
        </MenuItem>
        {groupableColumns.map(column => (
          <MenuItem
            key={column.id}
            onClick={() => handleGroupingChange(column.id)}
            selected={groupByColumn === column.id}
          >
            {column.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Grouping;
