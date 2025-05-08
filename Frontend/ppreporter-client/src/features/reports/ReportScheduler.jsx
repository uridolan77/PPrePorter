import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Grid,
  Divider,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RepeatIcon from '@mui/icons-material/Repeat';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Component for configuring scheduled report generation
 * @param {Object} props - Component props
 * @param {Array} props.schedules - Current schedule configurations
 * @param {Function} props.onChange - Function called when schedules change
 */
const ReportScheduler = ({
  schedules = [],
  onChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Default schedule template
  const defaultSchedule = {
    id: '',
    name: '',
    frequency: 'daily',
    time: new Date(),
    weekday: 1, // Monday
    monthDay: 1,
    startDate: new Date(),
    endDate: null,
    active: true,
    recipients: [],
    deliveryMethod: 'email',
    storageLocation: ''
  };
  
  // Open dialog to add a new schedule
  const handleAddSchedule = () => {
    setCurrentSchedule({
      ...defaultSchedule,
      id: `schedule_${Date.now()}`,
      time: new Date(new Date().setHours(8, 0, 0, 0)) // Default to 8 AM
    });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };
  
  // Open dialog to edit an existing schedule
  const handleEditSchedule = (schedule) => {
    setCurrentSchedule({...schedule});
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Remove a schedule
  const handleRemoveSchedule = (scheduleId) => {
    const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
    onChange(updatedSchedules);
  };
  
  // Update schedule field
  const handleScheduleChange = (field, value) => {
    setCurrentSchedule({
      ...currentSchedule,
      [field]: value
    });
  };
  
  // Add recipient to the current schedule
  const handleAddRecipient = () => {
    // Get recipient from input field
    const recipientInput = document.getElementById('recipient-input');
    const recipient = recipientInput.value.trim();
    
    if (!recipient) return;
    
    // Check if recipient is valid email
    const isValidEmail = /\S+@\S+\.\S+/.test(recipient);
    
    if (!isValidEmail) {
      // TODO: Show validation error
      return;
    }
    
    // Add recipient if not already in the list
    if (!currentSchedule.recipients.includes(recipient)) {
      setCurrentSchedule({
        ...currentSchedule,
        recipients: [...currentSchedule.recipients, recipient]
      });
    }
    
    // Clear input field
    recipientInput.value = '';
  };
  
  // Remove recipient from the current schedule
  const handleRemoveRecipient = (recipient) => {
    setCurrentSchedule({
      ...currentSchedule,
      recipients: currentSchedule.recipients.filter(r => r !== recipient)
    });
  };
  
  // Save the current schedule
  const handleSaveSchedule = () => {
    // Validate schedule
    if (!currentSchedule.name) {
      // TODO: Show validation error
      return;
    }
    
    if (isEditMode) {
      // Update existing schedule
      const updatedSchedules = schedules.map(schedule => 
        schedule.id === currentSchedule.id ? currentSchedule : schedule
      );
      onChange(updatedSchedules);
    } else {
      // Add new schedule
      onChange([...schedules, currentSchedule]);
    }
    
    // Close dialog
    setIsDialogOpen(false);
  };
  
  // Get display text for frequency
  const getFrequencyDisplay = (schedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return `Weekly on ${getWeekdayName(schedule.weekday)}`;
      case 'monthly':
        return `Monthly on day ${schedule.monthDay}`;
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      default:
        return 'Custom';
    }
  };
  
  // Get weekday name
  const getWeekdayName = (weekday) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[weekday] || 'Monday';
  };
  
  // Get time display
  const getTimeDisplay = (time) => {
    if (!time) return '';
    
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get next run time
  const getNextRunTime = (schedule) => {
    if (!schedule.active) return 'Schedule is inactive';
    
    // This is a simplified calculation - a real implementation would be more complex
    const now = new Date();
    const scheduleTime = new Date(schedule.time);
    let nextRun = new Date();
    
    nextRun.setHours(scheduleTime.getHours(), scheduleTime.getMinutes(), 0, 0);
    
    if (nextRun < now) {
      // If the time today is already past, set to tomorrow
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    switch (schedule.frequency) {
      case 'daily':
        // Already set correctly
        break;
      case 'weekly':
        // Adjust to the next occurrence of the weekday
        const currentDay = nextRun.getDay();
        const daysUntilWeekday = (schedule.weekday - currentDay + 7) % 7;
        
        if (daysUntilWeekday > 0 || (daysUntilWeekday === 0 && nextRun < now)) {
          nextRun.setDate(nextRun.getDate() + daysUntilWeekday);
        }
        break;
      case 'monthly':
        // Set to the specified day of current month
        nextRun.setDate(schedule.monthDay);
        
        // If that day this month is already past, go to next month
        if (nextRun < now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
      // Other frequencies would have more complex calculations
      default:
        return 'Calculation pending';
    }
    
    return nextRun.toLocaleString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <ScheduleIcon sx={{ mr: 1 }} />
          Report Schedules
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSchedule}
        >
          Add Schedule
        </Button>
      </Box>
      
      {schedules.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No schedules configured yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set up automated report generation and delivery schedules.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSchedule}
          >
            Add Your First Schedule
          </Button>
        </Paper>
      ) : (
        <List>
          {schedules.map((schedule) => (
            <Paper key={schedule.id} variant="outlined" sx={{ mb: 2 }}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton edge="end" onClick={() => handleEditSchedule(schedule)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" color="error" onClick={() => handleRemoveSchedule(schedule.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemIcon>
                  <RepeatIcon color={schedule.active ? "primary" : "disabled"} />
                </ListItemIcon>
                
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {schedule.name}
                      {!schedule.active && (
                        <Chip label="Inactive" size="small" color="default" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <RepeatIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">
                            {getFrequencyDisplay(schedule)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">
                            {getTimeDisplay(schedule.time)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DateRangeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                          <Typography variant="body2">
                            Next run: {getNextRunTime(schedule)}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            Delivery:
                          </Typography>
                          
                          {schedule.deliveryMethod === 'email' && (
                            <Chip 
                              icon={<EmailIcon />} 
                              label={`Email to ${schedule.recipients.length} recipient(s)`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                          
                          {schedule.deliveryMethod === 'storage' && (
                            <Chip 
                              icon={<CloudUploadIcon />} 
                              label={`Upload to ${schedule.storageLocation}`} 
                              size="small" 
                              color="secondary" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
      
      {/* Add/Edit Schedule Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Edit Schedule' : 'Add New Schedule'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Schedule Name */}
            <Grid item xs={12}>
              <TextField
                label="Schedule Name"
                value={currentSchedule?.name || ''}
                onChange={(e) => handleScheduleChange('name', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            {/* Schedule Active Status */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSchedule?.active || false}
                    onChange={(e) => handleScheduleChange('active', e.target.checked)}
                  />
                }
                label="Schedule Active"
              />
            </Grid>
            
            {/* Frequency */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  value={currentSchedule?.frequency || 'daily'}
                  label="Frequency"
                  onChange={(e) => handleScheduleChange('frequency', e.target.value)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Time */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Time"
                  value={currentSchedule?.time || null}
                  onChange={(time) => handleScheduleChange('time', time)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Weekday (for weekly frequency) */}
            {currentSchedule?.frequency === 'weekly' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="weekday-label">Day of Week</InputLabel>
                  <Select
                    labelId="weekday-label"
                    value={currentSchedule?.weekday || 1}
                    label="Day of Week"
                    onChange={(e) => handleScheduleChange('weekday', e.target.value)}
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {/* Month Day (for monthly frequency) */}
            {currentSchedule?.frequency === 'monthly' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="month-day-label">Day of Month</InputLabel>
                  <Select
                    labelId="month-day-label"
                    value={currentSchedule?.monthDay || 1}
                    label="Day of Month"
                    onChange={(e) => handleScheduleChange('monthDay', e.target.value)}
                  >
                    {[...Array(31)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {/* Start and End Dates */}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={currentSchedule?.startDate || null}
                  onChange={(date) => handleScheduleChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date (Optional)"
                  value={currentSchedule?.endDate || null}
                  onChange={(date) => handleScheduleChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Delivery Method */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="delivery-method-label">Delivery Method</InputLabel>
                <Select
                  labelId="delivery-method-label"
                  value={currentSchedule?.deliveryMethod || 'email'}
                  label="Delivery Method"
                  onChange={(e) => handleScheduleChange('deliveryMethod', e.target.value)}
                >
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="storage">Cloud Storage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Email Recipients */}
            {currentSchedule?.deliveryMethod === 'email' && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    id="recipient-input"
                    label="Add Recipient Email"
                    placeholder="user@example.com"
                    fullWidth
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddRecipient();
                        e.preventDefault();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton edge="end" onClick={handleAddRecipient}>
                          <AddIcon />
                        </IconButton>
                      ),
                    }}
                  />
                </Box>
                
                <Box>
                  {currentSchedule?.recipients?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentSchedule.recipients.map((recipient) => (
                        <Chip
                          key={recipient}
                          label={recipient}
                          icon={<EmailIcon />}
                          onDelete={() => handleRemoveRecipient(recipient)}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recipients added yet.
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
            
            {/* Storage Location */}
            {currentSchedule?.deliveryMethod === 'storage' && (
              <Grid item xs={12}>
                <TextField
                  label="Storage Location"
                  value={currentSchedule?.storageLocation || ''}
                  onChange={(e) => handleScheduleChange('storageLocation', e.target.value)}
                  fullWidth
                  placeholder="e.g., S3://bucket-name/folder/"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveSchedule}
          >
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportScheduler;