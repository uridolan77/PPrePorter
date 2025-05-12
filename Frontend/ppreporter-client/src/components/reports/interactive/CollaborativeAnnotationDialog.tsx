import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
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
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Paper,
  Popper,
  ClickAwayListener,
  Grow,
  MenuList,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CommentIcon from '@mui/icons-material/Comment';
import FlagIcon from '@mui/icons-material/Flag';
import AddCommentIcon from '@mui/icons-material/AddComment';
import PersonIcon from '@mui/icons-material/Person';
import { format as formatDate } from 'date-fns';
import { 
  CollaborativeAnnotation, 
  User, 
  useCollaborativeAnnotationContext 
} from './CollaborativeAnnotationSystem';

// Annotation dialog props
interface CollaborativeAnnotationDialogProps {
  open: boolean;
  onClose: () => void;
  chartId: string;
  dataPointId: string | number;
  dataPointLabel: string;
}

/**
 * CollaborativeAnnotationDialog component
 * Dialog for adding, editing, and viewing annotations with real-time collaboration
 */
const CollaborativeAnnotationDialog: React.FC<CollaborativeAnnotationDialogProps> = ({
  open,
  onClose,
  chartId,
  dataPointId,
  dataPointLabel
}) => {
  const theme = useTheme();
  const { 
    annotations, 
    users, 
    currentUser, 
    loading, 
    addAnnotation, 
    updateAnnotation, 
    deleteAnnotation, 
    getAnnotationsForDataPoint 
  } = useCollaborativeAnnotationContext();
  
  // Get annotations for this data point
  const existingAnnotations = getAnnotationsForDataPoint(chartId, dataPointId);
  
  // State
  const [newAnnotationText, setNewAnnotationText] = useState<string>('');
  const [newAnnotationType, setNewAnnotationType] = useState<CollaborativeAnnotation['type']>('comment');
  const [editingAnnotation, setEditingAnnotation] = useState<CollaborativeAnnotation | null>(null);
  const [mentionSearch, setMentionSearch] = useState<string>('');
  const [mentionAnchorEl, setMentionAnchorEl] = useState<HTMLElement | null>(null);
  const [mentionPosition, setMentionPosition] = useState<{ start: number; end: number } | null>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewAnnotationText('');
      setNewAnnotationType('comment');
      setEditingAnnotation(null);
    }
  }, [open]);
  
  // Handle text change and detect mentions
  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setNewAnnotationText(text);
    
    // Check for mention
    const cursorPosition = event.target.selectionStart || 0;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const mentionText = mentionMatch[1];
      setMentionSearch(mentionText);
      setMentionPosition({
        start: cursorPosition - mentionText.length - 1,
        end: cursorPosition
      });
      
      // Position the mention dropdown
      if (textFieldRef.current) {
        setMentionAnchorEl(textFieldRef.current);
      }
    } else {
      setMentionAnchorEl(null);
      setMentionPosition(null);
    }
  }, []);
  
  // Filter users based on mention search
  const filteredUsers = mentionSearch
    ? users.filter(user => 
        user.name.toLowerCase().includes(mentionSearch.toLowerCase()) &&
        user.id !== currentUser.id
      )
    : [];
  
  // Handle mention selection
  const handleMentionSelect = useCallback((user: User) => {
    if (!mentionPosition) return;
    
    const beforeMention = newAnnotationText.substring(0, mentionPosition.start);
    const afterMention = newAnnotationText.substring(mentionPosition.end);
    
    // Replace the @mention with the selected user
    const updatedText = `${beforeMention}@${user.name.replace(/\s+/g, '')} ${afterMention}`;
    setNewAnnotationText(updatedText);
    
    // Close the mention dropdown
    setMentionAnchorEl(null);
    setMentionPosition(null);
  }, [newAnnotationText, mentionPosition]);
  
  // Handle add annotation
  const handleAddAnnotation = useCallback(() => {
    if (!newAnnotationText.trim()) return;
    
    addAnnotation({
      chartId,
      dataPointId,
      text: newAnnotationText,
      author: currentUser.name,
      type: newAnnotationType,
      position: { x: 50, y: 50 }, // Default position
      metadata: { label: dataPointLabel }
    });
    
    // Reset form
    setNewAnnotationText('');
    setNewAnnotationType('comment');
  }, [
    newAnnotationText, 
    newAnnotationType, 
    chartId, 
    dataPointId, 
    dataPointLabel, 
    currentUser.name, 
    addAnnotation
  ]);
  
  // Handle edit annotation
  const handleEditAnnotation = useCallback((annotation: CollaborativeAnnotation) => {
    setEditingAnnotation(annotation);
    setNewAnnotationText(annotation.text);
    setNewAnnotationType(annotation.type);
  }, []);
  
  // Handle save edit
  const handleSaveEdit = useCallback(() => {
    if (!editingAnnotation || !newAnnotationText.trim()) return;
    
    updateAnnotation(editingAnnotation.id, newAnnotationText, newAnnotationType);
    
    // Reset form
    setEditingAnnotation(null);
    setNewAnnotationText('');
    setNewAnnotationType('comment');
  }, [editingAnnotation, newAnnotationText, newAnnotationType, updateAnnotation]);
  
  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingAnnotation(null);
    setNewAnnotationText('');
    setNewAnnotationType('comment');
  }, []);
  
  // Handle delete annotation
  const handleDeleteAnnotation = useCallback((id: string) => {
    deleteAnnotation(id);
    
    // If deleting the annotation being edited, reset form
    if (editingAnnotation && editingAnnotation.id === id) {
      handleCancelEdit();
    }
  }, [deleteAnnotation, editingAnnotation, handleCancelEdit]);
  
  // Get annotation type icon
  const getAnnotationTypeIcon = useCallback((type: CollaborativeAnnotation['type']) => {
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
  }, []);
  
  // Format text with mentions highlighted
  const formatTextWithMentions = useCallback((text: string) => {
    const parts = [];
    let lastIndex = 0;
    const mentionRegex = /@(\w+)/g;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the mention
      const mentionName = match[1];
      const user = users.find(u => u.name.toLowerCase().replace(/\s+/g, '') === mentionName.toLowerCase());
      
      if (user) {
        parts.push(
          <Chip
            key={`mention-${match.index}`}
            size="small"
            label={user.name}
            avatar={<Avatar>{user.name.charAt(0)}</Avatar>}
            sx={{ 
              height: 24, 
              '& .MuiChip-label': { 
                px: 1,
                fontSize: '0.75rem'
              }
            }}
          />
        );
      } else {
        parts.push(`@${mentionName}`);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts;
  }, [users]);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Existing annotations */}
        {existingAnnotations.length > 0 ? (
          <List>
            {existingAnnotations.map((annotation) => (
              <React.Fragment key={annotation.id}>
                <ListItem alignItems="flex-start">
                  <Box sx={{ mr: 1, mt: 0.5 }}>
                    {getAnnotationTypeIcon(annotation.type)}
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}
                          >
                            {annotation.author.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2">
                            {annotation.author}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(new Date(annotation.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          component="div"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {formatTextWithMentions(annotation.text)}
                        </Typography>
                        
                        {annotation.updatedAt !== annotation.createdAt && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Edited {formatDate(new Date(annotation.updatedAt), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  {annotation.authorId === currentUser.id && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditAnnotation(annotation)}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteAnnotation(annotation.id)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No annotations yet. Add one below.
            </Typography>
          </Box>
        )}
        
        {/* Add/Edit annotation form */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {editingAnnotation ? 'Edit Annotation' : 'Add Annotation'}
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add your annotation here... Use @ to mention users"
            value={newAnnotationText}
            onChange={handleTextChange}
            variant="outlined"
            size="small"
            ref={textFieldRef}
            disabled={loading}
          />
          
          {/* Mention dropdown */}
          <Popper
            open={Boolean(mentionAnchorEl) && filteredUsers.length > 0}
            anchorEl={mentionAnchorEl}
            placement="bottom-start"
            transition
          >
            {({ TransitionProps }) => (
              <Grow {...TransitionProps}>
                <Paper elevation={3} sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                  <ClickAwayListener onClickAway={() => setMentionAnchorEl(null)}>
                    <MenuList>
                      {filteredUsers.map(user => (
                        <MenuItem key={user.id} onClick={() => handleMentionSelect(user)}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{user.name}</Typography>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
          
          <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
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
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Tip: Use @ to mention users (e.g., @JohnDoe)
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        {editingAnnotation ? (
          <>
            <Button onClick={handleCancelEdit} disabled={loading}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              color="primary"
              disabled={!newAnnotationText.trim() || loading}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={loading}>Close</Button>
            <Button
              onClick={handleAddAnnotation}
              variant="contained"
              color="primary"
              disabled={!newAnnotationText.trim() || loading}
            >
              Add Annotation
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CollaborativeAnnotationDialog;
