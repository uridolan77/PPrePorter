import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  Grid,
  Paper,
  Chip,
  IconButton,
  Alert,
  RadioGroup,
  Radio,
  CircularProgress,
  Switch,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

/**
 * Component for scheduling reports for automated delivery
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onSave - Function to call when schedule is saved
 * @param {Object} props.report - Report being scheduled
 * @param {Object} props.schedule - Existing schedule if editing
 * @param {boolean} props.loading - Whether save operation is in progress
 */
const ReportScheduler = ({
  open,
  onClose,
  onSave,
  report = {},
  schedule = null,
  loading = false
}) => {
  const [currentSchedule, setCurrentSchedule] = useState({
    id: schedule?.id || '',
    name: schedule?.name || '',
    enabled: schedule?.enabled ?? true,
    frequency: schedule?.frequency || 'weekly',
    dayOfWeek: schedule?.dayOfWeek || 1, // Monday
    dayOfMonth: schedule?.dayOfMonth || 1,
    time: schedule?.time ? new Date(schedule.time) : new Date(),
    startDate: schedule?.startDate ? new Date(schedule.startDate) : new Date(),
    endDate: schedule?.endDate ? new Date(schedule.endDate) : null,
    hasEndDate: schedule?.endDate ? true : false,
    format: schedule?.format || 'pdf',
    recipients: schedule?.recipients || [],
    emailSubject: schedule?.emailSubject || `${report.name} - Automated Report`,
    emailBody: schedule?.emailBody || `Please find attached the automated report "${report.name}".\n\nThis report was automatically generated and sent by the PPrePorter system.`,
    includeFilters: schedule?.includeFilters ?? true,
    includeLogo: schedule?.includeLogo ?? true,
    includeDataAttachment: schedule?.includeDataAttachment ?? false
  });
  
  const [newRecipient, setNewRecipient] = useState('');
  const [error, setError] = useState(null);
  
  // Handle schedule field change
  const handleChange = (field, value) => {
    setCurrentSchedule({
      ...currentSchedule,
      [field]: value
    });
    
    // Clear any validation errors
    if (error) {
      setError(null);
    }
  };
  
  // Handle frequency change
  const handleFrequencyChange = (event) => {
    const frequency = event.target.value;
    handleChange('frequency', frequency);
    
    // Reset related fields based on frequency
    if (frequency === 'daily') {
      handleChange('dayOfWeek', null);
      handleChange('dayOfMonth', null);
    } else if (frequency === 'weekly') {
      handleChange('dayOfWeek', 1);
      handleChange('dayOfMonth', null);
    } else if (frequency === 'monthly') {
      handleChange('dayOfWeek', null);
      handleChange('dayOfMonth', 1);
    }
  };
  
  // Handle adding a recipient
  const handleAddRecipient = () => {
    if (!newRecipient) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if already added
    if (currentSchedule.recipients.includes(newRecipient)) {
      setError('This recipient has already been added');
      return;
    }
    
    handleChange('recipients', [...currentSchedule.recipients, newRecipient]);
    setNewRecipient('');
    setError(null);
  };
  
  // Handle removing a recipient
  const handleRemoveRecipient = (recipient) => {
    handleChange('recipients', currentSchedule.recipients.filter(r => r !== recipient));
  };
  
  // Handle saving the schedule
  const handleSave = () => {
    // Validate required fields
    if (!currentSchedule.name) {
      setError('Please provide a name for this schedule');
      return;
    }
    
    if (currentSchedule.recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }
    
    // Prepare the schedule object
    const finalSchedule = {
      ...currentSchedule,
      reportId: report.id,
      endDate: currentSchedule.hasEndDate ? currentSchedule.endDate : null
    };
    
    if (onSave) {
      onSave(finalSchedule);
    }
  };

  // Render day of week selection
  const renderDayOfWeekSelector = () => {
    return (
      <FormControl fullWidth margin="normal">
        <InputLabel>Day of Week</InputLabel>
        <Select
          value={currentSchedule.dayOfWeek || 1}
          onChange={(e) => handleChange('dayOfWeek', e.target.value)}
          label="Day of Week"
        >
          <MenuItem value={1}>Monday</MenuItem>
          <MenuItem value={2}>Tuesday</MenuItem>
          <MenuItem value={3}>Wednesday</MenuItem>
          <MenuItem value={4}>Thursday</MenuItem>
          <MenuItem value={5}>Friday</MenuItem>
          <MenuItem value={6}>Saturday</MenuItem>
          <MenuItem value={0}>Sunday</MenuItem>
        </Select>
      </FormControl>
    );
  };
  
  // Render day of month selection
  const renderDayOfMonthSelector = () => {
    return (
      <FormControl fullWidth margin="normal">
        <InputLabel>Day of Month</InputLabel>
        <Select
          value={currentSchedule.dayOfMonth || 1}
          onChange={(e) => handleChange('dayOfMonth', e.target.value)}
          label="Day of Month"
        >
          {[...Array(31)].map((_, index) => (
            <MenuItem key={index + 1} value={index + 1}>
              {index + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="schedule-dialog-title"
      >
        <DialogTitle id="schedule-dialog-title">
          {schedule ? 'Edit Schedule' : 'New Schedule'}: {report.name}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Schedule Details
              </Typography>
              
              <TextField
                label="Schedule Name"
                value={currentSchedule.name}
                onChange={(e) => handleChange('name', e.target.value)}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., Weekly Sales Report"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={currentSchedule.enabled}
                    onChange={(e) => handleChange('enabled', e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable this schedule"
                sx={{ mt: 1, mb: 1 }}
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={currentSchedule.frequency}
                  onChange={handleFrequencyChange}
                  label="Frequency"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </Select>
              </FormControl>
              
              {currentSchedule.frequency === 'weekly' && renderDayOfWeekSelector()}
              {currentSchedule.frequency === 'monthly' && renderDayOfMonthSelector()}
              
              <Box sx={{ mt: 2 }}>
                <TimePicker
                  label="Time"
                  value={currentSchedule.time}
                  onChange={(newTime) => handleChange('time', newTime)}
                  ampm={true}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date"
                      value={currentSchedule.startDate}
                      onChange={(newDate) => handleChange('startDate', newDate)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined'
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={currentSchedule.hasEndDate}
                            onChange={(e) => handleChange('hasEndDate', e.target.checked)}
                          />
                        }
                        label="Set End Date"
                      />
                      
                      {currentSchedule.hasEndDate && (
                        <DatePicker
                          label="End Date"
                          value={currentSchedule.endDate || null}
                          onChange={(newDate) => handleChange('endDate', newDate)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              variant: 'outlined'
                            }
                          }}
                          disabled={!currentSchedule.hasEndDate}
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Export Options
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={currentSchedule.format}
                    onChange={(e) => handleChange('format', e.target.value)}
                    label="Export Format"
                  >
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                    <MenuItem value="csv">CSV File</MenuItem>
                  </Select>
                </FormControl>
                
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentSchedule.includeFilters}
                        onChange={(e) => handleChange('includeFilters', e.target.checked)}
                      />
                    }
                    label="Include filters in report"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentSchedule.includeLogo}
                        onChange={(e) => handleChange('includeLogo', e.target.checked)}
                      />
                    }
                    label="Include company logo"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={currentSchedule.includeDataAttachment}
                        onChange={(e) => handleChange('includeDataAttachment', e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>Include raw data attachment</Typography>
                        <Tooltip title="Attach raw data in Excel/CSV format in addition to the report">
                          <IconButton size="small">
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                  />
                </FormGroup>
              </Box>
            </Grid>
            
            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Recipients
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Add Email Recipient"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  fullWidth
                  placeholder="email@example.com"
                  InputProps={{
                    startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <IconButton onClick={handleAddRecipient} edge="end">
                        <AddIcon />
                      </IconButton>
                    )
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRecipient();
                    }
                  }}
                />
                
                {error && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                )}
              </Box>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  minHeight: 150, 
                  maxHeight: 250, 
                  overflow: 'auto',
                  bgcolor: currentSchedule.recipients.length === 0 ? 'action.hover' : 'background.paper'
                }}
              >
                {currentSchedule.recipients.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography color="text.secondary" align="center">
                      No recipients added yet. Add at least one recipient to send the report to.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentSchedule.recipients.map((recipient) => (
                      <Chip
                        key={recipient}
                        label={recipient}
                        onDelete={() => handleRemoveRecipient(recipient)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Paper>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Email Customization
              </Typography>
              
              <TextField
                label="Email Subject"
                value={currentSchedule.emailSubject}
                onChange={(e) => handleChange('emailSubject', e.target.value)}
                fullWidth
                margin="normal"
              />
              
              <TextField
                label="Email Message"
                value={currentSchedule.emailBody}
                onChange={(e) => handleChange('emailBody', e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                placeholder="Enter a message to include in the email body..."
              />
              
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  This report will be automatically generated and sent to {currentSchedule.recipients.length} recipient{currentSchedule.recipients.length !== 1 ? 's' : ''} 
                  {currentSchedule.frequency === 'daily' && ' every day'}
                  {currentSchedule.frequency === 'weekly' && ` every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentSchedule.dayOfWeek]}`}
                  {currentSchedule.frequency === 'monthly' && ` on day ${currentSchedule.dayOfMonth} of each month`}
                  {currentSchedule.frequency === 'quarterly' && ' once every three months'} 
                  {currentSchedule.time && ` at ${currentSchedule.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !currentSchedule.name || currentSchedule.recipients.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ReportScheduler;