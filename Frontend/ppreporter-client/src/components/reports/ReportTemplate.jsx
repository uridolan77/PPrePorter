import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SaveIcon from '@mui/icons-material/Save';
import ViewListIcon from '@mui/icons-material/ViewList';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

/**
 * ReportTemplate component for creating and customizing report templates
 * @param {Object} props - Component props
 * @param {Object} props.template - Current report template
 * @param {Function} props.onSave - Function called when template is saved
 * @param {Function} props.onCancel - Function called when editing is canceled
 * @param {Array} props.availableVisualizations - Available visualizations for adding to template
 * @param {Array} props.availableDataSources - Available data sources for the template
 */
const ReportTemplate = ({
  template = {
    id: '',
    name: '',
    description: '',
    sections: [],
    dataSource: null,
    filters: [],
    isPublic: false,
    createdBy: '',
    createdAt: null,
    updatedAt: null
  },
  onSave,
  onCancel,
  availableVisualizations = [],
  availableDataSources = []
}) => {
  const [currentTemplate, setCurrentTemplate] = useState({ ...template });
  const [currentSection, setCurrentSection] = useState(null);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [visualizationDialogOpen, setVisualizationDialogOpen] = useState(false);

  // Handle template field changes
  const handleTemplateChange = (field, value) => {
    setCurrentTemplate({
      ...currentTemplate,
      [field]: value
    });
  };

  // Handle opening the add/edit section dialog
  const handleOpenSectionDialog = (section = null) => {
    setCurrentSection(section || {
      id: `section_${Date.now()}`,
      title: '',
      description: '',
      visualizations: [],
      expanded: true
    });
    setSectionDialogOpen(true);
  };

  // Handle closing the section dialog
  const handleCloseSectionDialog = () => {
    setSectionDialogOpen(false);
    setCurrentSection(null);
  };

  // Handle saving a section
  const handleSaveSection = () => {
    const sections = [...currentTemplate.sections];
    
    // Find if we're updating an existing section
    const existingIndex = sections.findIndex(s => s.id === currentSection.id);
    
    if (existingIndex >= 0) {
      // Update existing section
      sections[existingIndex] = { ...currentSection };
    } else {
      // Add new section
      sections.push({ ...currentSection });
    }
    
    setCurrentTemplate({
      ...currentTemplate,
      sections
    });
    
    handleCloseSectionDialog();
  };

  // Handle deleting a section
  const handleDeleteSection = (sectionId) => {
    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.filter(s => s.id !== sectionId)
    });
  };

  // Handle opening visualization dialog
  const handleOpenVisualizationDialog = () => {
    setVisualizationDialogOpen(true);
  };

  // Handle closing visualization dialog
  const handleCloseVisualizationDialog = () => {
    setVisualizationDialogOpen(false);
  };

  // Handle adding a visualization to a section
  const handleAddVisualization = (visualization) => {
    setCurrentSection({
      ...currentSection,
      visualizations: [
        ...currentSection.visualizations,
        {
          id: `viz_${Date.now()}`,
          type: visualization.type,
          title: visualization.title,
          config: { ...visualization.defaultConfig },
          dataField: '',
          width: 12 // Default to full width (12 columns in Grid)
        }
      ]
    });
    setVisualizationDialogOpen(false);
  };

  // Handle removing a visualization from a section
  const handleRemoveVisualization = (vizId) => {
    setCurrentSection({
      ...currentSection,
      visualizations: currentSection.visualizations.filter(v => v.id !== vizId)
    });
  };

  // Handle visualization config change
  const handleVisualizationChange = (vizId, field, value) => {
    setCurrentSection({
      ...currentSection,
      visualizations: currentSection.visualizations.map(v => 
        v.id === vizId ? { ...v, [field]: value } : v
      )
    });
  };

  // Handle on drag end for reordering sections
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(currentTemplate.sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCurrentTemplate({
      ...currentTemplate,
      sections: items
    });
  };

  // Handle saving the entire template
  const handleSaveTemplate = () => {
    if (onSave) {
      onSave({
        ...currentTemplate,
        updatedAt: new Date()
      });
    }
  };

  return (
    <Box>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {currentTemplate.id ? 'Edit Report Template' : 'Create New Report Template'}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Template Name"
              value={currentTemplate.name}
              onChange={(e) => handleTemplateChange('name', e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Data Source</InputLabel>
              <Select
                value={currentTemplate.dataSource || ''}
                onChange={(e) => handleTemplateChange('dataSource', e.target.value)}
                label="Data Source"
                required
              >
                <MenuItem value=""><em>Select a data source</em></MenuItem>
                {availableDataSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Description"
              value={currentTemplate.description}
              onChange={(e) => handleTemplateChange('description', e.target.value)}
              fullWidth
              multiline
              rows={2}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentTemplate.isPublic}
                  onChange={(e) => handleTemplateChange('isPublic', e.target.checked)}
                  color="primary"
                />
              }
              label="Make this report template available to all users"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Report Sections
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => handleOpenSectionDialog()}
          >
            Add Section
          </Button>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {currentTemplate.sections.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ViewListIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              No sections added yet. Add a section to start building your report.
            </Typography>
          </Box>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <List {...provided.droppableProps} ref={provided.innerRef}>
                  {currentTemplate.sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          divider
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                            <DragIndicatorIcon color="action" />
                          </Box>
                          
                          <ListItemText
                            primary={section.title}
                            secondary={
                              <>
                                {section.description && (
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {section.description}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {section.visualizations.length} visualization{section.visualizations.length !== 1 ? 's' : ''}
                                </Typography>
                              </>
                            }
                          />
                          
                          <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => handleOpenSectionDialog(section)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDeleteSection(section.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveTemplate}
          disabled={!currentTemplate.name || !currentTemplate.dataSource}
        >
          Save Template
        </Button>
      </Box>
      
      {/* Section Dialog */}
      <Dialog
        open={sectionDialogOpen}
        onClose={handleCloseSectionDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentSection && currentSection.title ? `Edit Section: ${currentSection.title}` : 'Add New Section'}
        </DialogTitle>
        
        <DialogContent dividers>
          <TextField
            label="Section Title"
            value={currentSection?.title || ''}
            onChange={(e) => setCurrentSection({ ...currentSection, title: e.target.value })}
            fullWidth
            required
            margin="normal"
          />
          
          <TextField
            label="Section Description"
            value={currentSection?.description || ''}
            onChange={(e) => setCurrentSection({ ...currentSection, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            margin="normal"
          />
          
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Visualizations
            </Typography>
            
            <List>
              {currentSection?.visualizations.map((viz, index) => (
                <ListItem
                  key={viz.id}
                  divider={index < currentSection.visualizations.length - 1}
                  sx={{ bgcolor: 'action.hover', borderRadius: 1, mb: 1 }}
                >
                  <ListItemText
                    primary={viz.title}
                    secondary={`Type: ${viz.type}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveVisualization(viz.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenVisualizationDialog}
              sx={{ mt: 2 }}
            >
              Add Visualization
            </Button>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseSectionDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveSection} 
            variant="contained"
            disabled={!currentSection?.title}
          >
            Save Section
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Visualization Selection Dialog */}
      <Dialog
        open={visualizationDialogOpen}
        onClose={handleCloseVisualizationDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Select Visualization
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            {availableVisualizations.map((viz) => (
              <Grid item xs={12} sm={6} md={4} key={viz.type}>
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => handleAddVisualization(viz)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    {viz.icon}
                  </Box>
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    {viz.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {viz.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseVisualizationDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportTemplate;