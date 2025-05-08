import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert,
  Chip,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SortIcon from '@mui/icons-material/Sort';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * Component for selecting columns to include in a report and configuring sorting and grouping
 * @param {Object} props - Component props
 * @param {Object} props.dataSource - The selected data source
 * @param {Array} props.selectedColumns - Currently selected columns
 * @param {Function} props.onChange - Function called when selected columns change
 * @param {Object} props.sortBy - Sort configuration
 * @param {Function} props.onSortChange - Function called when sort configuration changes
 * @param {Object} props.groupBy - Group by configuration
 * @param {Function} props.onGroupChange - Function called when group by configuration changes
 */
const ReportColumnSelector = ({
  dataSource,
  selectedColumns = [],
  onChange,
  sortBy,
  onSortChange,
  groupBy,
  onGroupChange
}) => {
  // State for available columns from the data source
  const [availableColumns, setAvailableColumns] = useState([]);
  
  // Load available columns from data source
  useEffect(() => {
    if (dataSource?.schema) {
      // Convert schema to available columns
      const columns = dataSource.schema.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        description: field.description,
        isSortable: field.sortable !== false,
        isGroupable: field.groupable !== false,
        isAggregatable: field.aggregatable === true,
        aggregationFunctions: field.aggregationFunctions || []
      }));
      
      setAvailableColumns(columns);
      
      // If no columns are selected and we have available columns, select the first few by default
      if (selectedColumns.length === 0 && columns.length > 0) {
        const defaultColumns = columns.slice(0, Math.min(5, columns.length)).map(col => ({
          id: col.id,
          name: col.name,
          type: col.type,
          width: 'auto',
          visible: true,
          aggregation: null
        }));
        
        onChange(defaultColumns);
      }
    }
  }, [dataSource, onChange, selectedColumns.length]);

  // Add a column to the selection
  const handleAddColumn = (column) => {
    // Check if column is already selected
    if (selectedColumns.some(col => col.id === column.id)) {
      return;
    }
    
    const newColumn = {
      id: column.id,
      name: column.name,
      type: column.type,
      width: 'auto',
      visible: true,
      aggregation: null
    };
    
    onChange([...selectedColumns, newColumn]);
  };
  
  // Remove a column from the selection
  const handleRemoveColumn = (columnId) => {
    const updatedColumns = selectedColumns.filter(col => col.id !== columnId);
    onChange(updatedColumns);
    
    // If the removed column was used for sorting, clear sorting
    if (sortBy?.columnId === columnId) {
      onSortChange(null);
    }
    
    // If the removed column was used for grouping, clear grouping
    if (groupBy?.columnId === columnId) {
      onGroupChange(null);
    }
  };
  
  // Move a column up in the order
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    
    const updatedColumns = [...selectedColumns];
    [updatedColumns[index], updatedColumns[index - 1]] = [updatedColumns[index - 1], updatedColumns[index]];
    
    onChange(updatedColumns);
  };
  
  // Move a column down in the order
  const handleMoveDown = (index) => {
    if (index >= selectedColumns.length - 1) return;
    
    const updatedColumns = [...selectedColumns];
    [updatedColumns[index], updatedColumns[index + 1]] = [updatedColumns[index + 1], updatedColumns[index]];
    
    onChange(updatedColumns);
  };
  
  // Update column width
  const handleWidthChange = (columnId, width) => {
    const updatedColumns = selectedColumns.map(col => {
      if (col.id === columnId) {
        return { ...col, width };
      }
      return col;
    });
    
    onChange(updatedColumns);
  };
  
  // Update column visibility
  const handleVisibilityChange = (columnId, visible) => {
    const updatedColumns = selectedColumns.map(col => {
      if (col.id === columnId) {
        return { ...col, visible };
      }
      return col;
    });
    
    onChange(updatedColumns);
  };
  
  // Update column aggregation
  const handleAggregationChange = (columnId, aggregation) => {
    const updatedColumns = selectedColumns.map(col => {
      if (col.id === columnId) {
        return { ...col, aggregation };
      }
      return col;
    });
    
    onChange(updatedColumns);
  };
  
  // Handle sort configuration change
  const handleSortChange = (columnId, direction) => {
    if (!columnId) {
      onSortChange(null);
      return;
    }
    
    onSortChange({
      columnId,
      direction
    });
  };
  
  // Handle group by configuration change
  const handleGroupChange = (columnId) => {
    if (!columnId) {
      onGroupChange(null);
      return;
    }
    
    onGroupChange({
      columnId
    });
  };
  
  // Get column info from available columns
  const getColumnInfo = (columnId) => {
    return availableColumns.find(col => col.id === columnId) || {};
  };
  
  // Get sortable columns
  const getSortableColumns = () => {
    return selectedColumns.filter(col => {
      const columnInfo = getColumnInfo(col.id);
      return columnInfo.isSortable;
    });
  };
  
  // Get groupable columns
  const getGroupableColumns = () => {
    return selectedColumns.filter(col => {
      const columnInfo = getColumnInfo(col.id);
      return columnInfo.isGroupable;
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Columns
      </Typography>
      
      {!dataSource && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please select a data source first.
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Available columns */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ height: '100%' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ViewColumnIcon sx={{ mr: 1 }} />
                Available Columns
              </Typography>
            </Box>
            <Divider />
            
            {availableColumns.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No columns available in the selected data source.
                </Typography>
              </Box>
            ) : (
              <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                {availableColumns.map((column) => (
                  <ListItem
                    key={column.id}
                    secondaryAction={
                      selectedColumns.some(col => col.id === column.id) ? (
                        <Chip size="small" label="Added" color="primary" variant="outlined" />
                      ) : (
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleAddColumn(column)}
                          disabled={selectedColumns.some(col => col.id === column.id)}
                        >
                          <AddIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {column.name}
                          {column.description && (
                            <Tooltip title={column.description} arrow>
                              <InfoOutlinedIcon fontSize="small" color="action" sx={{ ml: 1 }} />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={column.type}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
        
        {/* Selected columns */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined">
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Columns ({selectedColumns.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag to reorder columns. Configure visibility, width, and aggregation functions.
              </Typography>
            </Box>
            <Divider />
            
            {selectedColumns.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No columns selected yet. Add columns from the available list.
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {selectedColumns.map((column, index) => {
                  const columnInfo = getColumnInfo(column.id);
                  
                  return (
                    <React.Fragment key={column.id}>
                      <ListItem>
                        <ListItemIcon>
                          <DragIndicatorIcon color="action" />
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {column.name}
                              {column.aggregation && (
                                <Chip 
                                  label={column.aggregation} 
                                  size="small" 
                                  color="secondary" 
                                  sx={{ ml: 1 }} 
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={column.visible}
                                    onChange={(e) => handleVisibilityChange(column.id, e.target.checked)}
                                    size="small"
                                  />
                                }
                                label="Visible"
                              />
                              
                              <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel id={`width-label-${column.id}`}>Width</InputLabel>
                                <Select
                                  labelId={`width-label-${column.id}`}
                                  value={column.width}
                                  label="Width"
                                  onChange={(e) => handleWidthChange(column.id, e.target.value)}
                                >
                                  <MenuItem value="auto">Auto</MenuItem>
                                  <MenuItem value="small">Small</MenuItem>
                                  <MenuItem value="medium">Medium</MenuItem>
                                  <MenuItem value="large">Large</MenuItem>
                                </Select>
                              </FormControl>
                              
                              {columnInfo.isAggregatable && (
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                  <InputLabel id={`aggregation-label-${column.id}`}>Aggregation</InputLabel>
                                  <Select
                                    labelId={`aggregation-label-${column.id}`}
                                    value={column.aggregation || ''}
                                    label="Aggregation"
                                    onChange={(e) => handleAggregationChange(column.id, e.target.value || null)}
                                  >
                                    <MenuItem value="">None</MenuItem>
                                    {columnInfo.aggregationFunctions?.length > 0 ? (
                                      columnInfo.aggregationFunctions.map(func => (
                                        <MenuItem key={func} value={func}>
                                          {func}
                                        </MenuItem>
                                      ))
                                    ) : (
                                      <>
                                        <MenuItem value="sum">Sum</MenuItem>
                                        <MenuItem value="avg">Average</MenuItem>
                                        <MenuItem value="min">Minimum</MenuItem>
                                        <MenuItem value="max">Maximum</MenuItem>
                                        <MenuItem value="count">Count</MenuItem>
                                      </>
                                    )}
                                  </Select>
                                </FormControl>
                              )}
                            </Box>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0}
                            sx={{ mr: 1 }}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === selectedColumns.length - 1}
                            sx={{ mr: 1 }}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => handleRemoveColumn(column.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>
          
          {/* Sorting and Grouping */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SortIcon sx={{ mr: 1 }} />
                  Sort By
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="sort-column-label">Column</InputLabel>
                        <Select
                          labelId="sort-column-label"
                          value={sortBy?.columnId || ''}
                          label="Column"
                          onChange={(e) => handleSortChange(e.target.value, sortBy?.direction || 'asc')}
                        >
                          <MenuItem value="">None</MenuItem>
                          {getSortableColumns().map((column) => (
                            <MenuItem key={column.id} value={column.id}>
                              {column.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <FormControl fullWidth size="small" disabled={!sortBy?.columnId}>
                        <InputLabel id="sort-direction-label">Direction</InputLabel>
                        <Select
                          labelId="sort-direction-label"
                          value={sortBy?.direction || 'asc'}
                          label="Direction"
                          onChange={(e) => handleSortChange(sortBy?.columnId, e.target.value)}
                        >
                          <MenuItem value="asc">Ascending</MenuItem>
                          <MenuItem value="desc">Descending</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupWorkIcon sx={{ mr: 1 }} />
                  Group By
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="group-column-label">Column</InputLabel>
                    <Select
                      labelId="group-column-label"
                      value={groupBy?.columnId || ''}
                      label="Column"
                      onChange={(e) => handleGroupChange(e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem>
                      {getGroupableColumns().map((column) => (
                        <MenuItem key={column.id} value={column.id}>
                          {column.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportColumnSelector;