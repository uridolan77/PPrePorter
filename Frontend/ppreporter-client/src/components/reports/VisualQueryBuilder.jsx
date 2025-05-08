import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip,
  Grid,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  CircularProgress,
  Alert,
  useTheme,
  Badge,
  Zoom,
  Collapse,
  Popover
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SortIcon from '@mui/icons-material/Sort';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data schema
const availableFields = [
  { id: 'playerID', name: 'Player ID', type: 'number', group: 'Player' },
  { id: 'playerAlias', name: 'Player Alias', type: 'string', group: 'Player' },
  { id: 'registrationDate', name: 'Registration Date', type: 'date', group: 'Player' },
  { id: 'country', name: 'Country', type: 'string', group: 'Player' },
  { id: 'whiteLabelId', name: 'White Label ID', type: 'number', group: 'Casino' },
  { id: 'whiteLabelName', name: 'White Label Name', type: 'string', group: 'Casino' },
  { id: 'gameId', name: 'Game ID', type: 'number', group: 'Game' },
  { id: 'gameName', name: 'Game Name', type: 'string', group: 'Game' },
  { id: 'gameType', name: 'Game Type', type: 'string', group: 'Game' },
  { id: 'provider', name: 'Provider', type: 'string', group: 'Game' },
  { id: 'betAmount', name: 'Bet Amount', type: 'currency', group: 'Transaction' },
  { id: 'winAmount', name: 'Win Amount', type: 'currency', group: 'Transaction' },
  { id: 'revenue', name: 'Revenue', type: 'currency', group: 'Transaction' },
  { id: 'transactionDate', name: 'Transaction Date', type: 'date', group: 'Transaction' },
  { id: 'transactionType', name: 'Transaction Type', type: 'string', group: 'Transaction' },
  { id: 'platform', name: 'Platform', type: 'string', group: 'System' },
  { id: 'currency', name: 'Currency', type: 'string', group: 'Transaction' }
];

// Available operators based on field type
const operatorsByType = {
  string: [
    { id: 'equals', label: 'Equals', symbol: '=' },
    { id: 'notEquals', label: 'Not Equals', symbol: '≠' },
    { id: 'contains', label: 'Contains', symbol: '∋' },
    { id: 'startsWith', label: 'Starts With', symbol: '≺' },
    { id: 'endsWith', label: 'Ends With', symbol: '≻' },
    { id: 'isNull', label: 'Is Null', symbol: '∅' },
    { id: 'isNotNull', label: 'Is Not Null', symbol: '!∅' }
  ],
  number: [
    { id: 'equals', label: 'Equals', symbol: '=' },
    { id: 'notEquals', label: 'Not Equals', symbol: '≠' },
    { id: 'greaterThan', label: 'Greater Than', symbol: '>' },
    { id: 'greaterThanEqual', label: 'Greater Than or Equal', symbol: '≥' },
    { id: 'lessThan', label: 'Less Than', symbol: '<' },
    { id: 'lessThanEqual', label: 'Less Than or Equal', symbol: '≤' },
    { id: 'between', label: 'Between', symbol: '⟨⟩' },
    { id: 'isNull', label: 'Is Null', symbol: '∅' },
    { id: 'isNotNull', label: 'Is Not Null', symbol: '!∅' }
  ],
  currency: [
    { id: 'equals', label: 'Equals', symbol: '=' },
    { id: 'notEquals', label: 'Not Equals', symbol: '≠' },
    { id: 'greaterThan', label: 'Greater Than', symbol: '>' },
    { id: 'greaterThanEqual', label: 'Greater Than or Equal', symbol: '≥' },
    { id: 'lessThan', label: 'Less Than', symbol: '<' },
    { id: 'lessThanEqual', label: 'Less Than or Equal', symbol: '≤' },
    { id: 'between', label: 'Between', symbol: '⟨⟩' },
    { id: 'isNull', label: 'Is Null', symbol: '∅' },
    { id: 'isNotNull', label: 'Is Not Null', symbol: '!∅' }
  ],
  date: [
    { id: 'equals', label: 'Equals', symbol: '=' },
    { id: 'notEquals', label: 'Not Equals', symbol: '≠' },
    { id: 'after', label: 'After', symbol: '>' },
    { id: 'afterOrOn', label: 'After or On', symbol: '≥' },
    { id: 'before', label: 'Before', symbol: '<' },
    { id: 'beforeOrOn', label: 'Before or On', symbol: '≤' },
    { id: 'between', label: 'Between', symbol: '⟨⟩' },
    { id: 'isNull', label: 'Is Null', symbol: '∅' },
    { id: 'isNotNull', label: 'Is Not Null', symbol: '!∅' },
    { id: 'inLast', label: 'In Last', symbol: '⏱' }
  ]
};

const sortDirections = [
  { id: 'asc', label: 'Ascending', symbol: '↑' },
  { id: 'desc', label: 'Descending', symbol: '↓' }
];

// Define initial state for the query builder
const initialQueryState = {
  columns: [],
  filters: [],
  sort: [],
  groupBy: []
};

/**
 * Visual Query Builder component with drag and drop functionality
 * and real-time preview capability
 */
const VisualQueryBuilder = ({ 
  onQueryChange, 
  initialQuery = initialQueryState,
  onExecuteQuery,
  dataPreview = null,
  isLoading = false,
  error = null
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState(initialQuery);
  const [previewMode, setPreviewMode] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [hoveredField, setHoveredField] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [queryVisualizationMode, setQueryVisualizationMode] = useState(false);
  const previewContainerRef = useRef(null);
  
  // Keep parent component in sync with query changes
  useEffect(() => {
    if (onQueryChange) {
      onQueryChange(query);
    }
  }, [query, onQueryChange]);
  
  // Group available fields by category
  const fieldsByGroup = availableFields.reduce((groups, field) => {
    if (!groups[field.group]) {
      groups[field.group] = [];
    }
    groups[field.group].push(field);
    return groups;
  }, {});
  
  // Handle drag and drop between areas of the query builder
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    // Same position as before
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Available fields to a query section
    if (source.droppableId === 'availableFields') {
      const field = availableFields.find(f => f.id === draggableId);
      if (!field) return;
      
      // Dropped into columns area
      if (destination.droppableId === 'columns') {
        if (!query.columns.some(c => c.id === field.id)) {
          setQuery(prev => ({
            ...prev,
            columns: [...prev.columns, { ...field }]
          }));
        }
      }
      // Dropped into filters area
      else if (destination.droppableId === 'filters') {
        if (!query.filters.some(f => f.field.id === field.id)) {
          const fieldType = field.type;
          const availableOperators = operatorsByType[fieldType] || [];
          
          setQuery(prev => ({
            ...prev,
            filters: [...prev.filters, {
              id: `filter-${Date.now()}`,
              field: { ...field },
              operator: availableOperators.length > 0 ? availableOperators[0].id : null,
              value: null,
              secondValue: null // For between operators
            }]
          }));
        }
      }
      // Dropped into sort area
      else if (destination.droppableId === 'sort') {
        if (!query.sort.some(s => s.field.id === field.id)) {
          setQuery(prev => ({
            ...prev,
            sort: [...prev.sort, {
              id: `sort-${Date.now()}`,
              field: { ...field },
              direction: 'asc'
            }]
          }));
        }
      }
      // Dropped into group by area
      else if (destination.droppableId === 'groupBy') {
        if (!query.groupBy.some(g => g.id === field.id)) {
          setQuery(prev => ({
            ...prev,
            groupBy: [...prev.groupBy, { ...field }]
          }));
        }
      }
    }
    // Reordering within a query section
    else if (source.droppableId === destination.droppableId) {
      const section = source.droppableId;
      const items = Array.from(query[section]);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      
      setQuery(prev => ({
        ...prev,
        [section]: items
      }));
    }
  };
  
  // Remove field from a query section
  const handleRemoveItem = (section, index) => {
    const items = Array.from(query[section]);
    items.splice(index, 1);
    
    setQuery(prev => ({
      ...prev,
      [section]: items
    }));
  };
  
  // Update filter operator
  const handleFilterOperatorChange = (index, operatorId) => {
    const filters = Array.from(query.filters);
    filters[index] = {
      ...filters[index],
      operator: operatorId,
      // Reset values when changing operator
      value: null,
      secondValue: null
    };
    
    setQuery(prev => ({
      ...prev,
      filters
    }));
  };
  
  // Update filter value
  const handleFilterValueChange = (index, value, isSecondValue = false) => {
    const filters = Array.from(query.filters);
    
    if (isSecondValue) {
      filters[index] = {
        ...filters[index],
        secondValue: value
      };
    } else {
      filters[index] = {
        ...filters[index],
        value: value
      };
    }
    
    setQuery(prev => ({
      ...prev,
      filters
    }));
  };
  
  // Update sort direction
  const handleSortDirectionChange = (index, direction) => {
    const sort = Array.from(query.sort);
    sort[index] = {
      ...sort[index],
      direction
    };
    
    setQuery(prev => ({
      ...prev,
      sort
    }));
  };
  
  // Toggle preview mode
  const handleTogglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode && onExecuteQuery) {
      onExecuteQuery(query);
    }
  };
  
  // Execute the query
  const handleExecuteQuery = () => {
    if (onExecuteQuery) {
      onExecuteQuery(query);
      setPreviewMode(true);
    }
  };
  
  // Toggle expanded state for field groups
  const toggleGroupExpanded = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };
  
  // Show field detail on hover
  const handleFieldMouseEnter = (event, field) => {
    setHoveredField(field);
    setAnchorEl(event.currentTarget);
  };
  
  const handleFieldMouseLeave = () => {
    setHoveredField(null);
    setAnchorEl(null);
  };
  
  // Toggle query visualization mode
  const toggleQueryVisualizationMode = () => {
    setQueryVisualizationMode(prev => !prev);
  };
  
  // Render field chip with appropriate styling based on type
  const renderFieldChip = (field, showDelete = false, onDelete = null) => {
    const getTypeColor = (type) => {
      switch (type) {
        case 'string': return theme.palette.info.light;
        case 'number': return theme.palette.success.light;
        case 'date': return theme.palette.warning.light;
        case 'currency': return theme.palette.error.light;
        default: return theme.palette.grey[300];
      }
    };
    
    return (
      <Chip
        label={field.name}
        size="small"
        sx={{
          backgroundColor: getTypeColor(field.type),
          '& .MuiChip-label': {
            color: theme.palette.getContrastText(getTypeColor(field.type))
          }
        }}
        onDelete={showDelete ? onDelete : undefined}
      />
    );
  };
  
  // Get operator options for a field
  const getOperatorsForField = (field) => {
    return operatorsByType[field.type] || [];
  };
  
  // Get operator by ID
  const getOperatorById = (fieldType, operatorId) => {
    const operators = operatorsByType[fieldType] || [];
    return operators.find(op => op.id === operatorId) || null;
  };
  
  // Render input for filter value based on field type
  const renderFilterValueInput = (filter, index, isSecondValue = false) => {
    const { field, operator, value, secondValue } = filter;
    const currentValue = isSecondValue ? secondValue : value;
    const fieldType = field.type;
    
    // Skip for isNull and isNotNull operators
    if (operator === 'isNull' || operator === 'isNotNull') {
      return null;
    }
    
    switch (fieldType) {
      case 'string':
        return (
          <TextField
            size="small"
            placeholder={`Enter ${isSecondValue ? 'second ' : ''}value`}
            value={currentValue || ''}
            onChange={(e) => handleFilterValueChange(index, e.target.value, isSecondValue)}
            fullWidth
            margin="dense"
          />
        );
      case 'number':
      case 'currency':
        return (
          <TextField
            size="small"
            placeholder={`Enter ${isSecondValue ? 'second ' : ''}value`}
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleFilterValueChange(
              index, 
              e.target.value === '' ? null : Number(e.target.value), 
              isSecondValue
            )}
            fullWidth
            margin="dense"
            InputProps={{
              startAdornment: fieldType === 'currency' ? '£' : null
            }}
          />
        );
      case 'date':
        return (
          <TextField
            size="small"
            placeholder={`Enter ${isSecondValue ? 'second ' : ''}date`}
            type="date"
            value={currentValue || ''}
            onChange={(e) => handleFilterValueChange(index, e.target.value, isSecondValue)}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
        );
      default:
        return (
          <TextField
            size="small"
            placeholder={`Enter ${isSecondValue ? 'second ' : ''}value`}
            value={currentValue || ''}
            onChange={(e) => handleFilterValueChange(index, e.target.value, isSecondValue)}
            fullWidth
            margin="dense"
          />
        );
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {/* Left panel - Available fields */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                Available Fields
                <Tooltip title="Drag fields to columns, filters, sort or group by sections">
                  <HelpOutlineIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Tooltip>
              </Typography>
              <Droppable droppableId="availableFields" isDropDisabled={true}>
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ mt: 2 }}
                  >
                    {Object.entries(fieldsByGroup).map(([group, fields], groupIndex) => (
                      <Box key={group} sx={{ mb: 2 }}>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            '&:hover': {
                              color: theme.palette.primary.main
                            }
                          }}
                          onClick={() => toggleGroupExpanded(group)}
                        >
                          <Typography variant="subtitle2" color="text.secondary">
                            {group}
                          </Typography>
                          <IconButton size="small">
                            {expandedGroups[group] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </Box>
                        
                        <Collapse in={expandedGroups[group]} timeout="auto" unmountOnExit>
                          <Box sx={{ pl: 1 }}>
                            {fields.map((field, fieldIndex) => (
                              <Draggable
                                key={field.id}
                                draggableId={field.id}
                                index={fieldIndex + groupIndex * 100} // Ensure unique indices
                                isDragDisabled={!dragEnabled}
                              >
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{ my: 1 }}
                                    onMouseEnter={(e) => handleFieldMouseEnter(e, field)}
                                    onMouseLeave={handleFieldMouseLeave}
                                  >
                                    {renderFieldChip(field)}
                                  </Box>
                                )}
                              </Draggable>
                            ))}
                          </Box>
                        </Collapse>
                      </Box>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
              
              {/* Field info popover */}
              <Popover
                open={Boolean(anchorEl) && Boolean(hoveredField)}
                anchorEl={anchorEl}
                onClose={handleFieldMouseLeave}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                sx={{ pointerEvents: 'none' }}
              >
                {hoveredField && (
                  <Paper sx={{ p: 2, maxWidth: 320 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {hoveredField.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ mr: 1, fontWeight: 'bold' }}>
                        ID:
                      </Typography>
                      <Typography variant="caption">
                        {hoveredField.id}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ mr: 1, fontWeight: 'bold' }}>
                        Type:
                      </Typography>
                      <Chip
                        label={hoveredField.type} 
                        size="small" 
                        color={
                          hoveredField.type === 'string' ? 'info' :
                          hoveredField.type === 'number' ? 'success' :
                          hoveredField.type === 'date' ? 'warning' :
                          hoveredField.type === 'currency' ? 'error' : 'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ mr: 1, fontWeight: 'bold' }}>
                        Group:
                      </Typography>
                      <Typography variant="caption">
                        {hoveredField.group}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="caption" color="text.secondary">
                      Drag this field to add it to your query
                    </Typography>
                  </Paper>
                )}
              </Popover>
            </Paper>
          </Grid>
          
          {/* Right panel - Query builder and preview */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 2 }}>
              <Card>
                <CardHeader 
                  title="Visual Query Builder" 
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant={previewMode ? "contained" : "outlined"}
                        color="primary"
                        startIcon={<PreviewIcon />}
                        onClick={handleTogglePreview}
                      >
                        {previewMode ? "Hide Preview" : "Show Preview"}
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={query.columns.length === 0}
                      >
                        Save Query
                      </Button>
                    </Box>
                  }
                />
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Columns Section */}
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ViewColumnIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Columns</Typography>
                        </Box>
                        <Droppable droppableId="columns" direction="horizontal">
                          {(provided) => (
                            <Box
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                minHeight: 40,
                                p: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1
                              }}
                            >
                              {query.columns.map((column, index) => (
                                <Draggable
                                  key={column.id}
                                  draggableId={`column-${column.id}`}
                                  index={index}
                                  isDragDisabled={!dragEnabled}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                          {...provided.dragHandleProps}
                                          sx={{ cursor: 'move', display: 'flex', mr: 0.5 }}
                                        >
                                          <DragIndicatorIcon fontSize="small" />
                                        </Box>
                                        {renderFieldChip(
                                          column, 
                                          true, 
                                          () => handleRemoveItem('columns', index)
                                        )}
                                      </Box>
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </Paper>
                    </Grid>
                    
                    {/* Filters Section */}
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FilterListIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Filters</Typography>
                        </Box>
                        <Droppable droppableId="filters">
                          {(provided) => (
                            <Box
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                minHeight: 40,
                                p: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1
                              }}
                            >
                              {query.filters.map((filter, index) => (
                                <Draggable
                                  key={filter.id}
                                  draggableId={filter.id}
                                  index={index}
                                  isDragDisabled={!dragEnabled}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        bgcolor: 'background.paper'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                        <Box
                                          {...provided.dragHandleProps}
                                          sx={{ cursor: 'move', display: 'flex', mr: 1, mt: 1 }}
                                        >
                                          <DragIndicatorIcon fontSize="small" />
                                        </Box>
                                        
                                        <Grid container spacing={1} alignItems="center">
                                          <Grid item xs={12} sm={3}>
                                            {renderFieldChip(filter.field)}
                                          </Grid>
                                          
                                          <Grid item xs={12} sm={3}>
                                            <TextField
                                              select
                                              size="small"
                                              fullWidth
                                              value={filter.operator || ''}
                                              onChange={(e) => handleFilterOperatorChange(index, e.target.value)}
                                              label="Operator"
                                            >
                                              {getOperatorsForField(filter.field).map((op) => (
                                                <MenuItem key={op.id} value={op.id}>
                                                  {op.symbol} {op.label}
                                                </MenuItem>
                                              ))}
                                            </TextField>
                                          </Grid>
                                          
                                          <Grid item xs={12} sm={filter.operator === 'between' ? 2.5 : 5}>
                                            {renderFilterValueInput(filter, index)}
                                          </Grid>
                                          
                                          {filter.operator === 'between' && (
                                            <>
                                              <Grid item xs={12} sm={1} sx={{ textAlign: 'center' }}>
                                                <Typography variant="body1">and</Typography>
                                              </Grid>
                                              
                                              <Grid item xs={12} sm={2.5}>
                                                {renderFilterValueInput(filter, index, true)}
                                              </Grid>
                                            </>
                                          )}
                                          
                                          <Grid item xs={12} sm={1}>
                                            <IconButton 
                                              size="small" 
                                              onClick={() => handleRemoveItem('filters', index)}
                                              color="error"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Grid>
                                        </Grid>
                                      </Box>
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </Paper>
                    </Grid>
                    
                    {/* Sort Section */}
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SortIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Sort</Typography>
                        </Box>
                        <Droppable droppableId="sort">
                          {(provided) => (
                            <Box
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                minHeight: 40,
                                p: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1
                              }}
                            >
                              {query.sort.map((sort, index) => (
                                <Draggable
                                  key={sort.id}
                                  draggableId={sort.id}
                                  index={index}
                                  isDragDisabled={!dragEnabled}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        bgcolor: 'background.paper'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                          {...provided.dragHandleProps}
                                          sx={{ cursor: 'move', display: 'flex', mr: 1 }}
                                        >
                                          <DragIndicatorIcon fontSize="small" />
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                                          {renderFieldChip(sort.field)}
                                          
                                          <TextField
                                            select
                                            size="small"
                                            value={sort.direction}
                                            onChange={(e) => handleSortDirectionChange(index, e.target.value)}
                                            sx={{ ml: 1, width: 120 }}
                                          >
                                            {sortDirections.map((dir) => (
                                              <MenuItem key={dir.id} value={dir.id}>
                                                {dir.symbol} {dir.label}
                                              </MenuItem>
                                            ))}
                                          </TextField>
                                          
                                          <IconButton 
                                            size="small" 
                                            onClick={() => handleRemoveItem('sort', index)}
                                            color="error"
                                            sx={{ ml: 'auto' }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </Paper>
                    </Grid>
                    
                    {/* Group By Section */}
                    <Grid item xs={12} md={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ViewColumnIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1">Group By</Typography>
                        </Box>
                        <Droppable droppableId="groupBy" direction="horizontal">
                          {(provided) => (
                            <Box
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                minHeight: 40,
                                p: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1
                              }}
                            >
                              {query.groupBy.map((group, index) => (
                                <Draggable
                                  key={group.id}
                                  draggableId={`groupby-${group.id}`}
                                  index={index}
                                  isDragDisabled={!dragEnabled}
                                >
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                          {...provided.dragHandleProps}
                                          sx={{ cursor: 'move', display: 'flex', mr: 0.5 }}
                                        >
                                          <DragIndicatorIcon fontSize="small" />
                                        </Box>
                                        {renderFieldChip(
                                          group, 
                                          true, 
                                          () => handleRemoveItem('groupBy', index)
                                        )}
                                      </Box>
                                    </Box>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {/* Execute Query Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleExecuteQuery}
                      disabled={query.columns.length === 0 || isLoading}
                      sx={{ minWidth: 150 }}
                    >
                      {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Execute Query"
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            {/* Data Preview */}
            {previewMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader title="Data Preview" />
                  <Divider />
                  <CardContent>
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}
                    
                    {isLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : dataPreview && dataPreview.length > 0 ? (
                      <Box sx={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {query.columns.map((column) => (
                                <th 
                                  key={column.id}
                                  style={{ 
                                    textAlign: 'left', 
                                    padding: '8px 16px',
                                    backgroundColor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText
                                  }}
                                >
                                  {column.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dataPreview.map((row, rowIndex) => (
                              <tr 
                                key={rowIndex}
                                style={{ 
                                  backgroundColor: rowIndex % 2 === 0 
                                    ? theme.palette.background.default 
                                    : theme.palette.background.paper
                                }}
                              >
                                {query.columns.map((column) => (
                                  <td 
                                    key={`${rowIndex}-${column.id}`}
                                    style={{ 
                                      padding: '8px 16px',
                                      borderBottom: `1px solid ${theme.palette.divider}`
                                    }}
                                  >
                                    {row[column.id] !== undefined ? row[column.id] : 'N/A'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        No data available. Execute a query to see results.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Grid>
        </Grid>
      </DragDropContext>
    </Box>
  );
};

export default VisualQueryBuilder;