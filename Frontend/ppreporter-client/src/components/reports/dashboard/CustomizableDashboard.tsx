import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Grid, Paper, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardWidget, { Widget, WidgetType } from './DashboardWidget';
import { ColumnDef } from '../../tables/enhanced/types';

// Dashboard configuration interface
export interface DashboardConfig {
  id?: string;
  name: string;
  description?: string;
  widgets: Widget[];
  filters?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomizableDashboardProps {
  dashboardConfig: DashboardConfig;
  customizeMode: boolean;
  playerData: any[];
  gameData: any[];
  dailyActionData: any[];
  loading?: boolean;
  error?: string | null;
  playerColumns: ColumnDef[];
  gameColumns: ColumnDef[];
  dailyActionColumns: ColumnDef[];
  onToggleCustomizeMode: () => void;
  onSaveConfigDialogOpen: () => void;
  onShareDialogOpen: () => void;
  onAddWidgetDialogOpen: () => void;
  onDragEnd: (result: any) => void;
  onWidgetMenuOpen: (event: React.MouseEvent<HTMLElement>, widgetId: string) => void;
}

/**
 * CustomizableDashboard component
 * Renders a customizable dashboard with draggable widgets
 */
const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  dashboardConfig,
  customizeMode,
  playerData,
  gameData,
  dailyActionData,
  loading = false,
  error = null,
  playerColumns,
  gameColumns,
  dailyActionColumns,
  onToggleCustomizeMode,
  onSaveConfigDialogOpen,
  onShareDialogOpen,
  onAddWidgetDialogOpen,
  onDragEnd,
  onWidgetMenuOpen
}) => {
  // Get data for widget based on data source
  const getWidgetData = (dataSource: string) => {
    switch (dataSource) {
      case 'players':
        return playerData;
      case 'games':
        return gameData;
      case 'dailyActions':
        return dailyActionData;
      default:
        return [];
    }
  };

  // Get columns for widget based on data source
  const getWidgetColumns = (dataSource: string) => {
    switch (dataSource) {
      case 'players':
        return playerColumns;
      case 'games':
        return gameColumns;
      case 'dailyActions':
        return dailyActionColumns;
      default:
        return [];
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dashboard Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{dashboardConfig.name}</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={customizeMode ? "Exit Customize Mode" : "Customize Dashboard"}>
            <Button
              variant={customizeMode ? "contained" : "outlined"}
              color={customizeMode ? "primary" : "inherit"}
              startIcon={<DashboardCustomizeIcon />}
              onClick={onToggleCustomizeMode}
              size="small"
            >
              {customizeMode ? "Done" : "Customize"}
            </Button>
          </Tooltip>

          {customizeMode && (
            <>
              <Tooltip title="Add Widget">
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={onAddWidgetDialogOpen}
                  size="small"
                >
                  Add Widget
                </Button>
              </Tooltip>

              <Tooltip title="Save Configuration">
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={onSaveConfigDialogOpen}
                  size="small"
                >
                  Save
                </Button>
              </Tooltip>

              <Tooltip title="Share Dashboard">
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={onShareDialogOpen}
                  size="small"
                >
                  Share
                </Button>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      {/* Dashboard Description */}
      {dashboardConfig.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {dashboardConfig.description}
        </Typography>
      )}

      {/* Dashboard Widgets */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard-widgets" type="widget" direction="horizontal">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: 2
              }}
            >
              {dashboardConfig.widgets
                .sort((a, b) => a.position - b.position)
                .map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!customizeMode}
                  >
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          gridColumn: widget.size === 'small' ? 'span 4' :
                                      widget.size === 'medium' ? 'span 6' : 'span 12',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <DashboardWidget
                          widget={widget}
                          data={getWidgetData(widget.dataSource)}
                          loading={loading}
                          error={error}
                          customizeMode={customizeMode}
                          onMenuOpen={onWidgetMenuOpen}
                          columns={getWidgetColumns(widget.dataSource)}
                          enableInteractivity={!customizeMode}
                        />
                      </Box>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default CustomizableDashboard;
