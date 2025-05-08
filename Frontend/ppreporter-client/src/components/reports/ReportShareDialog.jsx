import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * ReportShareDialog component for sharing reports with users or generating public links
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function called when dialog is closed
 * @param {Object} props.report - Report being shared
 * @param {Array} props.sharedUsers - Users that the report is already shared with
 * @param {Array} props.availableUsers - Users available to share with
 * @param {boolean} props.isPublic - Whether the report is publicly accessible
 * @param {string} props.publicUrl - Public URL for the report
 * @param {Date} props.expirationDate - Expiration date for public link
 * @param {Function} props.onAddUser - Function called when a user is added
 * @param {Function} props.onRemoveUser - Function called when a user is removed
 * @param {Function} props.onPermissionChange - Function called when a user's permission changes
 * @param {Function} props.onPublicToggle - Function called when public access is toggled
 * @param {Function} props.onExpirationChange - Function called when expiration date changes
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message to display
 */
const ReportShareDialog = ({
  open,
  onClose,
  report = {},
  sharedUsers = [],
  availableUsers = [],
  isPublic = false,
  publicUrl = '',
  expirationDate = null,
  onAddUser,
  onRemoveUser,
  onPermissionChange,
  onPublicToggle,
  onExpirationChange,
  loading = false,
  error = null
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newPermission, setNewPermission] = useState('view');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tempPublicState, setTempPublicState] = useState(isPublic);
  const [tempExpirationDate, setTempExpirationDate] = useState(expirationDate);
  
  // Update state when props change
  useEffect(() => {
    setTempPublicState(isPublic);
  }, [isPublic]);
  
  useEffect(() => {
    setTempExpirationDate(expirationDate);
  }, [expirationDate]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSelectUser = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };
  
  const handlePermissionChange = (event) => {
    setNewPermission(event.target.value);
  };
  
  const handleAddUsers = () => {
    if (selectedUsers.length > 0 && onAddUser) {
      onAddUser(selectedUsers, newPermission);
      setSelectedUsers([]);
      setSnackbarMessage(`${selectedUsers.length} user(s) added successfully`);
      setSnackbarOpen(true);
    }
  };
  
  const handleRemoveUser = (user) => {
    if (onRemoveUser) {
      onRemoveUser(user);
    }
  };
  
  const handleUserPermissionChange = (user, permission) => {
    if (onPermissionChange) {
      onPermissionChange(user, permission);
    }
  };
  
  const handlePublicToggle = () => {
    setTempPublicState(!tempPublicState);
  };
  
  const handleExpirationDateChange = (date) => {
    setTempExpirationDate(date);
  };
  
  const handleSavePublicSettings = () => {
    if (onPublicToggle) {
      onPublicToggle(tempPublicState);
    }
    
    if (onExpirationChange && tempPublicState) {
      onExpirationChange(tempExpirationDate);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Link copied to clipboard');
    setSnackbarOpen(true);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  const filteredAvailableUsers = availableUsers.filter(user => {
    // Exclude users that are already shared with
    const isAlreadyShared = sharedUsers.some(sharedUser => sharedUser.id === user.id);
    if (isAlreadyShared) return false;
    
    // Filter by search term
    if (!searchTerm) return true;
    
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Share Report</Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {report.title || 'Report'}
          </Typography>
          {report.description && (
            <Typography variant="body2" color="text.secondary">
              {report.description}
            </Typography>
          )}
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Share with People" />
          <Tab label="Public Access" />
        </Tabs>
        
        {/* Share with People Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Add people
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Search users..."
                size="small"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={newPermission}
                  onChange={handlePermissionChange}
                >
                  <FormControlLabel value="view" control={<Radio size="small" />} label="View" />
                  <FormControlLabel value="edit" control={<Radio size="small" />} label="Edit" />
                  <FormControlLabel value="manage" control={<Radio size="small" />} label="Manage" />
                </RadioGroup>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleAddUsers}
                disabled={selectedUsers.length === 0 || loading}
              >
                Add
              </Button>
            </Box>
            
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', mb: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : filteredAvailableUsers.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No users found matching your search' : 'No users available to add'}
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {filteredAvailableUsers.map((user) => {
                    const isSelected = selectedUsers.some(u => u.id === user.id);
                    return (
                      <ListItem
                        key={user.id}
                        divider
                        dense
                        button
                        selected={isSelected}
                        onClick={() => handleSelectUser(user)}
                      >
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                        />
                        <Switch
                          edge="end"
                          checked={isSelected}
                          onChange={() => handleSelectUser(user)}
                          size="small"
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Paper>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                People with access
              </Typography>
              <Paper variant="outlined">
                <List disablePadding>
                  {sharedUsers.length === 0 ? (
                    <ListItem divider dense>
                      <ListItemText
                        primary="No users have access to this report yet"
                        primaryTypographyProps={{ color: 'text.secondary', align: 'center' }}
                      />
                    </ListItem>
                  ) : (
                    sharedUsers.map((user) => (
                      <ListItem key={user.id} divider dense>
                        <ListItemText
                          primary={user.name}
                          secondary={user.email}
                        />
                        <FormControl size="small" sx={{ minWidth: 100, mr: 1 }}>
                          <select
                            value={user.permission}
                            onChange={(e) => handleUserPermissionChange(user, e.target.value)}
                            style={{ 
                              padding: '5px 10px', 
                              borderRadius: '4px', 
                              border: '1px solid #ccc' 
                            }}
                          >
                            <option value="view">View</option>
                            <option value="edit">Edit</option>
                            <option value="manage">Manage</option>
                          </select>
                        </FormControl>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveUser(user)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Box>
          </Box>
        )}
        
        {/* Public Access Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tempPublicState}
                    onChange={handlePublicToggle}
                    disabled={loading}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {tempPublicState ? (
                      <PublicIcon color="primary" sx={{ mr: 1 }} />
                    ) : (
                      <LockIcon sx={{ mr: 1 }} />
                    )}
                    <Typography>
                      {tempPublicState ? 'Public access enabled' : 'Private report'}
                    </Typography>
                  </Box>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5 }}>
                {tempPublicState
                  ? 'Anyone with the link can view this report without logging in'
                  : 'Only users with explicit access can view this report'}
              </Typography>
            </Box>
            
            {tempPublicState && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Public link
                  </Typography>
                  <TextField
                    fullWidth
                    value={publicUrl || 'Link will be generated when you save'}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      ),
                      endAdornment: publicUrl && (
                        <InputAdornment position="end">
                          <Tooltip title="Copy link">
                            <IconButton
                              edge="end"
                              onClick={() => copyToClipboard(publicUrl)}
                              size="small"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Link expiration
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!tempExpirationDate}
                            onChange={() => setTempExpirationDate(tempExpirationDate ? null : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
                          />
                        }
                        label="Set expiration date"
                      />
                      
                      {tempExpirationDate && (
                        <DatePicker
                          label="Expiration date"
                          value={tempExpirationDate}
                          onChange={handleExpirationDateChange}
                          renderInput={(params) => <TextField {...params} size="small" />}
                          minDate={new Date()}
                          disabled={loading}
                        />
                      )}
                    </Box>
                  </LocalizationProvider>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {tempExpirationDate
                      ? `The link will expire on ${tempExpirationDate.toLocaleDateString()}`
                      : 'The link will not expire'}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        {activeTab === 0 ? (
          <Button onClick={onClose} variant="contained">
            Done
          </Button>
        ) : (
          <Button
            onClick={handleSavePublicSettings}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        )}
      </DialogActions>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Dialog>
  );
};

export default ReportShareDialog;