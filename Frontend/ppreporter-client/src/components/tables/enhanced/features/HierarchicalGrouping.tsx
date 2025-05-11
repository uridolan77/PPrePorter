import React, { useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { ColumnDef, GroupingConfig } from '../types';

interface HierarchicalGroupingProps {
  columns: ColumnDef[];
  config: GroupingConfig;
  groupByLevels: string[];
  onGroupingLevelsChange: (columnIds: string[]) => void;
}

/**
 * Hierarchical Grouping component for tables
 * Allows selecting multiple grouping levels in a specific order
 */
const HierarchicalGrouping: React.FC<HierarchicalGroupingProps> = ({
  columns,
  config,
  groupByLevels,
  onGroupingLevelsChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter columns that can be grouped
  const groupableColumns = columns.filter(col => col.groupable !== false);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    handleClose();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleToggleGroupLevel = (columnId: string) => {
    const newGroupByLevels = [...groupByLevels];
    const index = newGroupByLevels.indexOf(columnId);
    
    if (index === -1) {
      // Add to the end of the list
      newGroupByLevels.push(columnId);
    } else {
      // Remove from the list
      newGroupByLevels.splice(index, 1);
    }
    
    onGroupingLevelsChange(newGroupByLevels);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    
    const newGroupByLevels = [...groupByLevels];
    const temp = newGroupByLevels[index];
    newGroupByLevels[index] = newGroupByLevels[index - 1];
    newGroupByLevels[index - 1] = temp;
    
    onGroupingLevelsChange(newGroupByLevels);
  };

  const handleMoveDown = (index: number) => {
    if (index >= groupByLevels.length - 1) return;
    
    const newGroupByLevels = [...groupByLevels];
    const temp = newGroupByLevels[index];
    newGroupByLevels[index] = newGroupByLevels[index + 1];
    newGroupByLevels[index + 1] = temp;
    
    onGroupingLevelsChange(newGroupByLevels);
  };

  const handleClearAll = () => {
    onGroupingLevelsChange([]);
    handleCloseDialog();
  };

  const handleApply = () => {
    handleCloseDialog();
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Configure hierarchical grouping">
          <IconButton
            size="small"
            onClick={handleOpen}
            color={groupByLevels.length > 0 ? "primary" : "default"}
          >
            <GroupWorkIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {groupByLevels.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
            {groupByLevels.map((columnId, index) => {
              const column = columns.find(col => col.id === columnId);
              return (
                <Box key={columnId} sx={{ display: 'flex', alignItems: 'center' }}>
                  {index > 0 && <ArrowRightIcon fontSize="small" sx={{ mx: 0.5 }} />}
                  <Chip
                    size="small"
                    label={column?.label || columnId}
                    onDelete={() => {
                      const newLevels = [...groupByLevels];
                      newLevels.splice(index, 1);
                      onGroupingLevelsChange(newLevels);
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Hierarchical Grouping
        </Typography>
        <Divider />
        <MenuItem onClick={handleOpenDialog}>
          Configure Group Levels
        </MenuItem>
        {groupByLevels.length > 0 && (
          <MenuItem onClick={() => onGroupingLevelsChange([])}>
            Clear All Grouping
          </MenuItem>
        )}
      </Menu>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Configure Hierarchical Grouping</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select columns to group by and arrange them in the desired order. Data will be grouped by the first level, then by the second level within each first-level group, and so on.
          </Typography>
          
          <List sx={{ width: '100%' }}>
            {groupableColumns.map(column => {
              const isSelected = groupByLevels.includes(column.id);
              const index = groupByLevels.indexOf(column.id);
              
              return (
                <ListItem 
                  key={column.id}
                  secondaryAction={
                    isSelected && (
                      <Box>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleMoveUp(index)}
                          disabled={index <= 0}
                          size="small"
                        >
                          ↑
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleMoveDown(index)}
                          disabled={index >= groupByLevels.length - 1}
                          size="small"
                        >
                          ↓
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      onChange={() => handleToggleGroupLevel(column.id)}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={column.label} 
                    secondary={isSelected ? `Level ${index + 1}` : null}
                  />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearAll}>Clear All</Button>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HierarchicalGrouping;
