import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Grid,
  Paper,
  Tooltip,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import InsightsIcon from '@mui/icons-material/Insights';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';
import EventIcon from '@mui/icons-material/Event';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import {
  Annotation,
  NewAnnotation,
  DataPoint,
  FormErrors,
  User,
  AnnotationType,
  AnnotationVisibility
} from '../../types/annotations';
import { CommonProps } from '../../types/common';

export interface DataAnnotationProps extends CommonProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Data point
   */
  dataPoint?: DataPoint;

  /**
   * Data type
   */
  dataType?: string;

  /**
   * Metric type
   */
  metricType?: string;

  /**
   * Current user ID
   */
  currentUserId: string;

  /**
   * Save handler
   */
  onSave: (annotations: Annotation[]) => void;

  /**
   * Annotations
   */
  annotations?: Annotation[];

  /**
   * Loading state
   */
  isLoading?: boolean;
}

/**
 * DataAnnotation component for adding notes and context to dashboard data
 */
const DataAnnotation: React.FC<DataAnnotationProps> = ({
  open,
  onClose,
  dataPoint,
  dataType,
  metricType,
  currentUserId,
  onSave,
  annotations = [],
  isLoading = false
}) => {
  const theme = useTheme();
  const [newAnnotation, setNewAnnotation] = useState<NewAnnotation>({
    content: '',
    type: 'note',
    visibility: 'team',
    isPinned: false,
    isHighPriority: false,
    associatedDate: new Date(),
    tags: []
  });
  const [currentTag, setCurrentTag] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [localAnnotations, setLocalAnnotations] = useState<Annotation[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setLocalAnnotations(annotations);

      // Pre-fill some fields if dataPoint is provided
      if (dataPoint) {
        setNewAnnotation(prev => ({
          ...prev,
          content: dataPoint.description || '',
          associatedDate: dataPoint.date ? new Date(dataPoint.date) : new Date()
        }));
      } else {
        resetForm();
      }
    }
  }, [open, annotations, dataPoint]);

  const resetForm = (): void => {
    setNewAnnotation({
      content: '',
      type: 'note',
      visibility: 'team',
      isPinned: false,
      isHighPriority: false,
      associatedDate: new Date(),
      tags: []
    });
    setCurrentTag('');
    setEditingIndex(-1);
    setErrors({});
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setNewAnnotation(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<AnnotationType | AnnotationVisibility>): void => {
    const { name, value } = e.target;
    setNewAnnotation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;
    setNewAnnotation(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleDateChange = (date: Date | null): void => {
    setNewAnnotation(prev => ({
      ...prev,
      associatedDate: date || new Date()
    }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = (): void => {
    if (!currentTag.trim()) return;

    if (!newAnnotation.tags.includes(currentTag.trim())) {
      setNewAnnotation(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
    }

    setCurrentTag('');
  };

  const removeTag = (tagToRemove: string): void => {
    setNewAnnotation(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!newAnnotation.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (!validateForm()) return;

    const annotationToSave: Annotation = {
      ...newAnnotation,
      id: editingIndex >= 0 ? localAnnotations[editingIndex].id : `annotation-${Date.now()}`,
      userId: currentUserId,
      createdAt: editingIndex >= 0 ? localAnnotations[editingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataType: dataType || '',
      metricType: metricType || '',
      dataPointId: dataPoint?.id
    };

    if (editingIndex >= 0) {
      // Update existing annotation
      const updatedAnnotations = [...localAnnotations];
      updatedAnnotations[editingIndex] = annotationToSave;
      setLocalAnnotations(updatedAnnotations);
      onSave(updatedAnnotations);
    } else {
      // Add new annotation
      const updatedAnnotations = [...localAnnotations, annotationToSave];
      setLocalAnnotations(updatedAnnotations);
      onSave(updatedAnnotations);
    }

    resetForm();
  };

  const handleEdit = (index: number): void => {
    const annotation = localAnnotations[index];
    setNewAnnotation({
      content: annotation.content,
      type: annotation.type,
      visibility: annotation.visibility,
      isPinned: annotation.isPinned,
      isHighPriority: annotation.isHighPriority,
      associatedDate: new Date(annotation.associatedDate),
      tags: annotation.tags || []
    });
    setEditingIndex(index);
  };

  const handleDelete = (index: number): void => {
    const updatedAnnotations = [...localAnnotations];
    updatedAnnotations.splice(index, 1);
    setLocalAnnotations(updatedAnnotations);
    onSave(updatedAnnotations);
  };

  const handleCancel = (): void => {
    if (editingIndex >= 0) {
      resetForm();
    } else {
      onClose();
    }
  };

  const getAnnotationTypeLabel = (type: AnnotationType): string => {
    switch (type) {
      case 'note': return 'Note';
      case 'insight': return 'Insight';
      case 'action': return 'Action Item';
      case 'event': return 'Event';
      case 'question': return 'Question';
      default: return type;
    }
  };

  const getAnnotationTypeIcon = (type: AnnotationType): React.ReactNode => {
    switch (type) {
      case 'note': return <CommentIcon />;
      case 'insight': return <InsightsIcon />;
      case 'action': return <FlagIcon />;
      case 'event': return <EventIcon />;
      case 'question': return <HelpOutlineIcon />;
      default: return <CommentIcon />;
    }
  };

  const getVisibilityIcon = (visibility: AnnotationVisibility): React.ReactNode => {
    switch (visibility) {
      case 'private': return <VisibilityOffIcon fontSize="small" />;
      case 'team': return <VisibilityIcon fontSize="small" />;
      case 'public': return <VisibilityIcon fontSize="small" />;
      default: return <VisibilityIcon fontSize="small" />;
    }
  };

  const getVisibilityLabel = (visibility: AnnotationVisibility): string => {
    switch (visibility) {
      case 'private': return 'Only me';
      case 'team': return 'Team';
      case 'public': return 'Everyone';
      default: return visibility;
    }
  };

  const getDummyUser = (userId: string): User => {
    const users: Record<string, User> = {
      'user1': { name: 'John Smith', avatar: '/avatars/john.png' },
      'user2': { name: 'Sarah Johnson', avatar: '/avatars/sarah.png' },
      'user3': { name: 'David Lee', avatar: '/avatars/david.png' }
    };

    return users[userId] || { name: 'Unknown User', avatar: null };
  };

  const formatDate = (date: string | Date): string => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CommentIcon sx={{ mr: 1 }} />
          Data Annotations
          {dataPoint && (
            <Typography variant="subtitle2" sx={{ ml: 1, color: 'text.secondary' }}>
              {metricType && `for ${metricType}`} {dataPoint.date && `(${formatDate(dataPoint.date)})`}
            </Typography>
          )}
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editingIndex >= 0 ? 'Edit Annotation' : 'Add New Annotation'}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="content"
                    label="Annotation"
                    multiline
                    rows={4}
                    fullWidth
                    value={newAnnotation.content}
                    onChange={handleInputChange}
                    error={Boolean(errors.content)}
                    helperText={errors.content}
                    placeholder="Add your notes, insights, or context about this data point..."
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="annotation-type-label">Annotation Type</InputLabel>
                    <Select
                      labelId="annotation-type-label"
                      name="type"
                      value={newAnnotation.type}
                      onChange={handleSelectChange}
                      label="Annotation Type"
                    >
                      <MenuItem value="note">Note</MenuItem>
                      <MenuItem value="insight">Insight</MenuItem>
                      <MenuItem value="action">Action Item</MenuItem>
                      <MenuItem value="event">Event</MenuItem>
                      <MenuItem value="question">Question</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="visibility-label">Visibility</InputLabel>
                    <Select
                      labelId="visibility-label"
                      name="visibility"
                      value={newAnnotation.visibility}
                      onChange={handleSelectChange}
                      label="Visibility"
                    >
                      <MenuItem value="private">Only me</MenuItem>
                      <MenuItem value="team">Team</MenuItem>
                      <MenuItem value="public">Everyone</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Associated Date"
                      value={newAnnotation.associatedDate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newAnnotation.isPinned}
                          onChange={handleSwitchChange}
                          name="isPinned"
                        />
                      }
                      label="Pin to Dashboard"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={newAnnotation.isHighPriority}
                          onChange={handleSwitchChange}
                          name="isHighPriority"
                        />
                      }
                      label="High Priority"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add tags..."
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Button variant="outlined" size="small" onClick={addTag} disabled={!currentTag.trim()}>
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {newAnnotation.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button onClick={handleCancel} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  {editingIndex >= 0 ? 'Update' : 'Add Annotation'}
                </Button>
              </Box>
            </Paper>

            {localAnnotations.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Existing Annotations ({localAnnotations.length})
                </Typography>
                <List>
                  {localAnnotations.map((annotation, index) => {
                    const user = getDummyUser(annotation.userId);
                    return (
                      <Paper
                        key={annotation.id || index}
                        variant="outlined"
                        sx={{
                          mb: 2,
                          borderLeft: annotation.isHighPriority ? 3 : 1,
                          borderColor: annotation.isHighPriority ? 'warning.main' : 'divider'
                        }}
                      >
                        <ListItem
                          alignItems="flex-start"
                          secondaryAction={
                            <Box>
                              <Tooltip title="Edit">
                                <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(index)}>
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(index)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar alt={user.name} src={user.avatar}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Typography variant="subtitle1" component="span">
                                  {user.name}
                                </Typography>
                                <Chip
                                  icon={getAnnotationTypeIcon(annotation.type)}
                                  label={getAnnotationTypeLabel(annotation.type)}
                                  size="small"
                                  variant="outlined"
                                  sx={{ ml: 1, mr: 1 }}
                                />
                                <Tooltip title={`Visibility: ${getVisibilityLabel(annotation.visibility)}`}>
                                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {getVisibilityIcon(annotation.visibility)}
                                  </Box>
                                </Tooltip>
                                {annotation.isPinned && (
                                  <Tooltip title="Pinned to Dashboard">
                                    <PushPinIcon fontSize="small" sx={{ ml: 0.5 }} />
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ display: 'block', my: 1 }}
                                >
                                  {annotation.content}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                    {annotation.createdAt && `Added: ${formatDate(annotation.createdAt)}`}
                                    {annotation.createdAt !== annotation.updatedAt && annotation.updatedAt &&
                                      ` (Updated: ${formatDate(annotation.updatedAt)})`}
                                  </Typography>
                                  {annotation.associatedDate && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                      Associated Date: {formatDate(annotation.associatedDate)}
                                    </Typography>
                                  )}
                                </Box>
                                {annotation.tags && annotation.tags.length > 0 && (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                    {annotation.tags.map((tag, idx) => (
                                      <Chip key={idx} label={tag} size="small" variant="outlined" />
                                    ))}
                                  </Box>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      </Paper>
                    );
                  })}
                </List>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataAnnotation;
