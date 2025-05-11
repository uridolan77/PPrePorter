import React, { useState } from 'react';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PushPinIcon from '@mui/icons-material/PushPin';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ColumnDef, ColumnManagementConfig } from '../types';

interface ColumnManagementProps {
  columns: ColumnDef[];
  config: ColumnManagementConfig;
  visibleColumns: string[];
  columnOrder: string[];
  stickyColumns: string[];
  onVisibilityChange: (columnId: string, visible: boolean) => void;
  onOrderChange: (newOrder: string[]) => void;
  onStickyChange: (columnId: string, sticky: boolean) => void;
}

/**
 * Column management component
 */
const ColumnManagement: React.FC<ColumnManagementProps> = ({
  columns,
  config,
  visibleColumns,
  columnOrder,
  stickyColumns,
  onVisibilityChange,
  onOrderChange,
  onStickyChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleVisibilityChange = (columnId: string) => {
    const isVisible = visibleColumns.includes(columnId);
    onVisibilityChange(columnId, !isVisible);
  };

  const handleStickyChange = (columnId: string) => {
    const isSticky = stickyColumns.includes(columnId);
    onStickyChange(columnId, !isSticky);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const newOrder = [...columnOrder];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, removed);

    onOrderChange(newOrder);
  };

  return (
    <>
      <Tooltip title="Manage columns">
        <IconButton size="small" onClick={handleOpen}>
          <ViewColumnIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 250
          }
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Manage Columns
        </Typography>
        <Divider />

        {config.allowReordering ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="column-manager">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {columnOrder.map((columnId, index) => {
                    const column = columns.find(col => col.id === columnId);
                    if (!column) return null;

                    return (
                      <Draggable
                        key={column.id}
                        draggableId={column.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <MenuItem
                              dense
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <DragIndicatorIcon
                                  fontSize="small"
                                  sx={{ mr: 1, color: 'text.secondary' }}
                                />
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={visibleColumns.includes(column.id)}
                                      onChange={() => handleVisibilityChange(column.id)}
                                      disabled={visibleColumns.length === 1 && visibleColumns.includes(column.id)}
                                    />
                                  }
                                  label={column.label}
                                  sx={{ m: 0 }}
                                />
                              </Box>
                              {config.allowPinning && (
                                <Tooltip title={stickyColumns.includes(column.id) ? "Unpin column" : "Pin column"}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStickyChange(column.id);
                                    }}
                                    color={stickyColumns.includes(column.id) ? "primary" : "default"}
                                  >
                                    <PushPinIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </MenuItem>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          columns.map(column => (
            <MenuItem key={column.id} dense>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={visibleColumns.includes(column.id)}
                    onChange={() => handleVisibilityChange(column.id)}
                    disabled={visibleColumns.length === 1 && visibleColumns.includes(column.id)}
                  />
                }
                label={column.label}
                sx={{ width: '100%' }}
              />
              {config.allowPinning && (
                <Tooltip title={stickyColumns.includes(column.id) ? "Unpin column" : "Pin column"}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStickyChange(column.id);
                    }}
                    color={stickyColumns.includes(column.id) ? "primary" : "default"}
                  >
                    <PushPinIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default ColumnManagement;
