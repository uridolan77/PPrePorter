import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Switch,
  Tooltip,
  Typography
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { GroupByOption } from './types';

interface HierarchicalGroupingSelectorProps {
  groupByOptions: GroupByOption[];
  selectedGroupings: string[];
  onGroupingChange: (groupings: string[]) => void;
  enableHierarchical: boolean;
  onEnableHierarchicalChange: (enabled: boolean) => void;
}

const HierarchicalGroupingSelector: React.FC<HierarchicalGroupingSelectorProps> = ({
  groupByOptions,
  selectedGroupings,
  onGroupingChange,
  enableHierarchical,
  onEnableHierarchicalChange
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddGrouping = (groupId: string, event?: React.MouseEvent) => {
    // Prevent event propagation to stop dialog from closing
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log('Adding grouping with event prevention:', groupId);
    } else {
      console.log('Adding grouping without event:', groupId);
    }

    if (!selectedGroupings.includes(groupId)) {
      const newGroupings = [...selectedGroupings, groupId];
      console.log('New groupings:', newGroupings);

      // Make sure hierarchical grouping is enabled when adding a grouping
      if (!enableHierarchical) {
        onEnableHierarchicalChange(true);
      }

      // Use setTimeout to ensure the enableHierarchical state is updated first
      setTimeout(() => {
        onGroupingChange(newGroupings);
      }, 0);
    } else {
      console.log('Grouping already included:', groupId);
    }
  };

  const handleRemoveGrouping = (index: number) => {
    const newGroupings = [...selectedGroupings];
    newGroupings.splice(index, 1);
    onGroupingChange(newGroupings);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;

    const newGroupings = [...selectedGroupings];
    const temp = newGroupings[index];
    newGroupings[index] = newGroupings[index - 1];
    newGroupings[index - 1] = temp;

    onGroupingChange(newGroupings);
  };

  const handleMoveDown = (index: number) => {
    if (index >= selectedGroupings.length - 1) return;

    const newGroupings = [...selectedGroupings];
    const temp = newGroupings[index];
    newGroupings[index] = newGroupings[index + 1];
    newGroupings[index + 1] = temp;

    onGroupingChange(newGroupings);
  };

  const handleClearAll = () => {
    onGroupingChange([]);
  };

  const getOptionName = (id: string): string => {
    const option = groupByOptions.find(opt => opt.id === id);
    return option ? option.name : id;
  };

  const availableOptions = groupByOptions.filter(
    option => !selectedGroupings.includes(option.id)
  );

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <AccountTreeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1" component="span">
            Hierarchical Grouping
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={enableHierarchical}
                onChange={(e) => onEnableHierarchicalChange(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label="Enable"
            sx={{ ml: 2 }}
          />
          <div style={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={!enableHierarchical}
          >
            Configure
          </Button>
        </div>

        {enableHierarchical && selectedGroupings.length > 0 && (
          <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selectedGroupings.map((groupId, index) => (
                <div key={groupId} style={{ display: 'flex', alignItems: 'center' }}>
                  {index > 0 && <ArrowRightIcon fontSize="small" sx={{ mx: 0.5, color: 'text.secondary' }} />}
                  <Chip
                    label={getOptionName(groupId)}
                    size="small"
                    color={index === 0 ? "primary" : "default"}
                    onDelete={() => handleRemoveGrouping(index)}
                  />
                </div>
              ))}
            </div>
          </Paper>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onClose={(event, reason) => {
          // Only close when explicitly clicking the close button
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleCloseDialog();
          }
        }}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>Configure Hierarchical Grouping</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Select columns to group by and arrange them in the desired order. Data will be grouped by the first level, then by the second level within each first-level group, and so on.
          </Typography>

          {selectedGroupings.length > 0 && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Current Grouping Levels
              </Typography>
              <List sx={{ mb: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {selectedGroupings.map((groupId, index) => (
                  <ListItem key={groupId}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Typography variant="body2" color="primary">
                        {index + 1}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={getOptionName(groupId)} />
                    <ListItemSecondaryAction>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton
                            edge="end"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            size="small"
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton
                            edge="end"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === selectedGroupings.length - 1}
                            size="small"
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton
                            edge="end"
                            onClick={() => handleRemoveGrouping(index)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Available Grouping Options
          </Typography>
          {availableOptions.length > 0 ? (
            <List sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              {availableOptions.map((option) => (
                <ListItem
                  key={option.id}
                  button
                  onClick={(e) => handleAddGrouping(option.id, e)}
                >
                  <ListItemText primary={option.name} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => handleAddGrouping(option.id, e)}
                      size="small"
                      color="primary"
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              All available grouping options have been selected.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearAll} color="error" disabled={selectedGroupings.length === 0}>
            Clear All
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HierarchicalGroupingSelector;
