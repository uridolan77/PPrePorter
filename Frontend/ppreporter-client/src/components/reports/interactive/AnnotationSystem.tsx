import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Popover,
  Paper,
  useTheme,
  Badge,
  Chip,
  Avatar,
  Box as MuiBox
} from '@mui/material';
import SimpleBox from '../../../components/common/SimpleBox';
import CommentIcon from '@mui/icons-material/Comment';
import AddCommentIcon from '@mui/icons-material/AddComment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import { format as formatDate } from 'date-fns';

// Annotation type
export interface Annotation {
  id: string;
  chartId: string;
  dataPointId: string | number;
  text: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  type: 'comment' | 'flag' | 'insight';
  position?: {
    x: number;
    y: number;
  };
  metadata?: {
    [key: string]: any;
  };
}

// Annotation context state
interface AnnotationContextState {
  annotations: Annotation[];
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAnnotation: (id: string, text: string, type: Annotation['type']) => void;
  deleteAnnotation: (id: string) => void;
  getAnnotationsForChart: (chartId: string) => Annotation[];
  getAnnotationsForDataPoint: (chartId: string, dataPointId: string | number) => Annotation[];
}

// Create context
const AnnotationContext = createContext<AnnotationContextState | undefined>(undefined);

// Annotation context provider props
interface AnnotationContextProviderProps {
  children: ReactNode;
}

/**
 * AnnotationContextProvider component
 * Provides annotation state and methods for managing annotations
 */
export const AnnotationContextProvider: React.FC<AnnotationContextProviderProps> = ({ children }) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Add a new annotation
  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };

    setAnnotations(prev => [...prev, newAnnotation]);
  }, []);

  // Update an annotation
  const updateAnnotation = useCallback((id: string, text: string, type: Annotation['type']) => {
    setAnnotations(prev => prev.map(annotation => {
      if (annotation.id === id) {
        return {
          ...annotation,
          text,
          type,
          updatedAt: new Date().toISOString()
        };
      }
      return annotation;
    }));
  }, []);

  // Delete an annotation
  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(annotation => annotation.id !== id));
  }, []);

  // Get annotations for a chart
  const getAnnotationsForChart = useCallback((chartId: string) => {
    return annotations.filter(annotation => annotation.chartId === chartId);
  }, [annotations]);

  // Get annotations for a data point
  const getAnnotationsForDataPoint = useCallback((chartId: string, dataPointId: string | number) => {
    return annotations.filter(
      annotation => annotation.chartId === chartId && annotation.dataPointId === dataPointId
    );
  }, [annotations]);

  // Context value
  const value: AnnotationContextState = {
    annotations,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    getAnnotationsForChart,
    getAnnotationsForDataPoint
  };

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
};

// Custom hook to use annotation context
export const useAnnotationContext = () => {
  const context = useContext(AnnotationContext);
  if (context === undefined) {
    throw new Error('useAnnotationContext must be used within an AnnotationContextProvider');
  }
  return context;
};

// Annotation dialog props
interface AnnotationDialogProps {
  open: boolean;
  onClose: () => void;
  chartId: string;
  dataPointId: string | number;
  dataPointLabel: string;
  existingAnnotations: Annotation[];
}

/**
 * AnnotationDialog component
 * Dialog for adding, editing, and viewing annotations
 */
export const AnnotationDialog: React.FC<AnnotationDialogProps> = ({
  open,
  onClose,
  chartId,
  dataPointId,
  dataPointLabel,
  existingAnnotations
}) => {
  const theme = useTheme();
  const { addAnnotation, updateAnnotation, deleteAnnotation } = useAnnotationContext();

  const [newAnnotationText, setNewAnnotationText] = useState<string>('');
  const [newAnnotationType, setNewAnnotationType] = useState<Annotation['type']>('comment');
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);

  // Handle add annotation
  const handleAddAnnotation = () => {
    if (!newAnnotationText.trim()) return;

    addAnnotation({
      chartId,
      dataPointId,
      text: newAnnotationText,
      author: 'Current User', // Would come from auth context in a real app
      type: newAnnotationType
    });

    // Reset form
    setNewAnnotationText('');
    setNewAnnotationType('comment');
  };

  // Handle edit annotation
  const handleEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setNewAnnotationText(annotation.text);
    setNewAnnotationType(annotation.type);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingAnnotation || !newAnnotationText.trim()) return;

    updateAnnotation(editingAnnotation.id, newAnnotationText, newAnnotationType);

    // Reset form
    setEditingAnnotation(null);
    setNewAnnotationText('');
    setNewAnnotationType('comment');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingAnnotation(null);
    setNewAnnotationText('');
    setNewAnnotationType('comment');
  };

  // Handle delete annotation
  const handleDeleteAnnotation = (id: string) => {
    deleteAnnotation(id);

    // If deleting the annotation being edited, reset form
    if (editingAnnotation && editingAnnotation.id === id) {
      handleCancelEdit();
    }
  };

  // Get annotation type icon
  const getAnnotationTypeIcon = (type: Annotation['type']) => {
    switch (type) {
      case 'comment':
        return <CommentIcon fontSize="small" />;
      case 'flag':
        return <FlagIcon fontSize="small" color="error" />;
      case 'insight':
        return <AddCommentIcon fontSize="small" color="primary" />;
      default:
        return <CommentIcon fontSize="small" />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Annotations for {dataPointLabel}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </SimpleBox>
      </DialogTitle>
      <DialogContent dividers>
        {/* Existing annotations */}
        {existingAnnotations.length > 0 ? (
          <List>
            {existingAnnotations.map((annotation) => (
              <React.Fragment key={annotation.id}>
                <ListItem alignItems="flex-start">
                  <SimpleBox sx={{ mr: 1, mt: 0.5 }}>
                    {getAnnotationTypeIcon(annotation.type)}
                  </SimpleBox>
                  <ListItemText
                    primary={
                      <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2">
                          {annotation.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(new Date(annotation.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </SimpleBox>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                      >
                        {annotation.text}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditAnnotation(annotation)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteAnnotation(annotation.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <SimpleBox sx={{ py: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No annotations yet. Add one below.
            </Typography>
          </SimpleBox>
        )}

        {/* Add/Edit annotation form */}
        <SimpleBox sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {editingAnnotation ? 'Edit Annotation' : 'Add Annotation'}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add your annotation here..."
            value={newAnnotationText}
            onChange={(e) => setNewAnnotationText(e.target.value)}
            variant="outlined"
            size="small"
          />
          <SimpleBox sx={{ display: 'flex', mt: 1, gap: 1 }}>
            <Chip
              icon={<CommentIcon />}
              label="Comment"
              onClick={() => setNewAnnotationType('comment')}
              color={newAnnotationType === 'comment' ? 'primary' : 'default'}
              variant={newAnnotationType === 'comment' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<FlagIcon />}
              label="Flag"
              onClick={() => setNewAnnotationType('flag')}
              color={newAnnotationType === 'flag' ? 'primary' : 'default'}
              variant={newAnnotationType === 'flag' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<AddCommentIcon />}
              label="Insight"
              onClick={() => setNewAnnotationType('insight')}
              color={newAnnotationType === 'insight' ? 'primary' : 'default'}
              variant={newAnnotationType === 'insight' ? 'filled' : 'outlined'}
            />
          </SimpleBox>
        </SimpleBox>
      </DialogContent>
      <DialogActions>
        {editingAnnotation ? (
          <>
            <Button onClick={handleCancelEdit}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              color="primary"
              disabled={!newAnnotationText.trim()}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Close</Button>
            <Button
              onClick={handleAddAnnotation}
              variant="contained"
              color="primary"
              disabled={!newAnnotationText.trim()}
            >
              Add Annotation
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

// Annotation marker props
interface AnnotationMarkerProps {
  chartId: string;
  dataPointId: string | number;
  dataPointLabel: string;
  position: {
    x: number;
    y: number;
  };
}

/**
 * AnnotationMarker component
 * Displays a marker for annotations on a chart
 */
export const AnnotationMarker: React.FC<AnnotationMarkerProps> = ({
  chartId,
  dataPointId,
  dataPointLabel,
  position
}) => {
  const theme = useTheme();
  const { getAnnotationsForDataPoint } = useAnnotationContext();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Get annotations for this data point
  const annotations = getAnnotationsForDataPoint(chartId, dataPointId);

  // Handle marker click
  const handleMarkerClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle popover close
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // Handle dialog open
  const handleDialogOpen = () => {
    setDialogOpen(true);
    handlePopoverClose();
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Popover open state
  const open = Boolean(anchorEl);

  return (
    <>
      <Badge
        badgeContent={annotations.length}
        color="primary"
        overlap="circular"
        sx={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}
      >
        <Avatar
          sx={{
            width: 24,
            height: 24,
            bgcolor: annotations.length > 0 ? theme.palette.primary.main : theme.palette.grey[300],
            cursor: 'pointer'
          }}
          onClick={handleMarkerClick}
        >
          <CommentIcon sx={{ fontSize: 14 }} />
        </Avatar>
      </Badge>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            {dataPointLabel}
          </Typography>

          {annotations.length > 0 ? (
            <>
              <Typography variant="body2" gutterBottom>
                {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
              </Typography>
              <List dense>
                {annotations.slice(0, 2).map((annotation) => (
                  <ListItem key={annotation.id}>
                    <ListItemText
                      primary={annotation.text.length > 50 ? `${annotation.text.substring(0, 50)}...` : annotation.text}
                      secondary={`${annotation.author} - ${formatDate(new Date(annotation.createdAt), 'MMM dd')}`}
                    />
                  </ListItem>
                ))}
              </List>
              {annotations.length > 2 && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  {annotations.length - 2} more...
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2">
              No annotations yet. Add one now.
            </Typography>
          )}

          <SimpleBox sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" onClick={handleDialogOpen}>
              {annotations.length > 0 ? 'View All' : 'Add Annotation'}
            </Button>
          </SimpleBox>
        </Paper>
      </Popover>

      <AnnotationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        chartId={chartId}
        dataPointId={dataPointId}
        dataPointLabel={dataPointLabel}
        existingAnnotations={annotations}
      />
    </>
  );
};

export default AnnotationContext;
