import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Divider,
  IconButton,
  Grid,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Alert,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {
  ReportScheduleDialogProps,
  Schedule,
  ScheduleFormErrors
} from '../../types/scheduling';

/**
 * ReportScheduleDialog component for scheduling automated report generation and delivery
 */
const ReportScheduleDialog: React.FC<ReportScheduleDialogProps> = ({
  open,
  onClose,
  report = {},
  schedules = [],
  exportFormats = [
    { id: 'pdf', name: 'PDF' },
    { id: 'excel', name: 'Excel' },
    { id: 'csv', name: 'CSV' }
  ],
  recipients = [],
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  loading = false,
  error = null
}) => {
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    frequency: 'daily',
    weekday: 1, // Monday
    monthDay: 1,
    time: new Date(new Date().setHours(8, 0, 0, 0)), // 8:00 AM
    exportFormat: 'pdf',
    recipientIds: [],
    includeEmail: false,
    includeNotification: true,
    active: true
  });

  const [errors, setErrors] = useState<ScheduleFormErrors>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = (): void => {
    setNewSchedule({
      frequency: 'daily',
      weekday: 1,
      monthDay: 1,
      time: new Date(new Date().setHours(8, 0, 0, 0)),
      exportFormat: 'pdf',
      recipientIds: [],
      includeEmail: false,
      includeNotification: true,
      active: true
    });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement> | SelectChangeEvent): void => {
    const { name, value, checked, type } = event.target as HTMLInputElement;
    setNewSchedule(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTimeChange = (time: Date | null): void => {
    if (time) {
      setNewSchedule(prev => ({
        ...prev,
        time
      }));
    }
  };

  const handleRecipientToggle = (recipientId: string): void => {
    setNewSchedule(prev => {
      const isSelected = prev.recipientIds.includes(recipientId);
      let updatedRecipients: string[];

      if (isSelected) {
        updatedRecipients = prev.recipientIds.filter(id => id !== recipientId);
      } else {
        updatedRecipients = [...prev.recipientIds, recipientId];
      }

      return {
        ...prev,
        recipientIds: updatedRecipients
      };
    });

    if (errors.recipientIds) {
      setErrors(prev => ({ ...prev, recipientIds: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ScheduleFormErrors = {};

    if (!newSchedule.includeEmail && !newSchedule.includeNotification) {
      newErrors.deliveryMethod = 'At least one delivery method must be selected';
    }

    if (newSchedule.includeEmail && newSchedule.recipientIds.length === 0) {
      newErrors.recipientIds = 'At least one recipient must be selected for email delivery';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSchedule = (): void => {
    if (!validateForm()) return;

    const scheduleData: Schedule = {
      ...newSchedule,
      id: isEditing ? editingId || undefined : undefined
    };

    if (isEditing && onUpdateSchedule) {
      onUpdateSchedule(scheduleData);
    } else if (onAddSchedule) {
      onAddSchedule(scheduleData);
    }

    resetForm();
  };

  const handleEditSchedule = (schedule: Schedule): void => {
    setNewSchedule({
      frequency: schedule.frequency,
      weekday: schedule.weekday,
      monthDay: schedule.monthDay,
      time: new Date(schedule.time),
      exportFormat: schedule.exportFormat,
      recipientIds: [...schedule.recipientIds],
      includeEmail: schedule.includeEmail,
      includeNotification: schedule.includeNotification,
      active: schedule.active
    });
    setIsEditing(true);
    setEditingId(schedule.id || null);
  };

  const handleDeleteSchedule = (scheduleId: string): void => {
    if (onDeleteSchedule) {
      onDeleteSchedule(scheduleId);
    }
  };

  const getFrequencyText = (schedule: Schedule): string => {
    switch (schedule.frequency) {
      case 'daily':
        return 'Every day';
      case 'weekly':
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Every ${weekdays[schedule.weekday]}`;
      case 'monthly':
        return `Every month on day ${schedule.monthDay}`;
      case 'quarterly':
        return 'Every quarter';
      case 'yearly':
        return 'Every year';
      default:
        return 'Custom schedule';
    }
  };

  const getTimeText = (time: Date | string): string => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDeliveryMethodText = (schedule: Schedule): string => {
    const methods: string[] = [];
    if (schedule.includeEmail) methods.push('Email');
    if (schedule.includeNotification) methods.push('Notification');
    return methods.join(' & ');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              {isEditing ? 'Edit Schedule' : 'Schedule Report'}
            </Typography>
          </Box>
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
            {report.title || 'Report'}
          </Typography>
          {report.description && (
            <Typography variant="body2" color="text.secondary">
              {report.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Schedule Configuration
          </Typography>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="frequency-label">Frequency</InputLabel>
                  <Select
                    labelId="frequency-label"
                    name="frequency"
                    value={newSchedule.frequency}
                    onChange={handleInputChange}
                    label="Frequency"
                    disabled={loading}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {newSchedule.frequency === 'weekly' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="weekday-label">Day of Week</InputLabel>
                    <Select
                      labelId="weekday-label"
                      name="weekday"
                      value={newSchedule.weekday}
                      onChange={handleInputChange}
                      label="Day of Week"
                      disabled={loading}
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
                </Grid>
              )}

              {newSchedule.frequency === 'monthly' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="monthday-label">Day of Month</InputLabel>
                    <Select
                      labelId="monthday-label"
                      name="monthDay"
                      value={newSchedule.monthDay}
                      onChange={handleInputChange}
                      label="Day of Month"
                      disabled={loading}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <MenuItem key={day} value={day}>{day}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Time"
                    value={newSchedule.time}
                    onChange={handleTimeChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    disabled={loading}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="export-format-label">Export Format</InputLabel>
                  <Select
                    labelId="export-format-label"
                    name="exportFormat"
                    value={newSchedule.exportFormat}
                    onChange={handleInputChange}
                    label="Export Format"
                    disabled={loading}
                  >
                    {exportFormats.map(format => (
                      <MenuItem key={format.id} value={format.id}>
                        {format.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Methods
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSchedule.includeEmail}
                        onChange={handleInputChange}
                        name="includeEmail"
                        disabled={loading}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">Email</Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={newSchedule.includeNotification}
                        onChange={handleInputChange}
                        name="includeNotification"
                        disabled={loading}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2">In-app Notification</Typography>
                      </Box>
                    }
                  />
                </Box>
                {errors.deliveryMethod && (
                  <FormHelperText error>{errors.deliveryMethod}</FormHelperText>
                )}
              </Grid>

              {newSchedule.includeEmail && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recipients
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, maxHeight: 200, overflow: 'auto' }}>
                    <List dense>
                      {recipients.length === 0 ? (
                        <ListItem>
                          <ListItemText primary="No recipients available" primaryTypographyProps={{ color: 'text.secondary' }} />
                        </ListItem>
                      ) : (
                        recipients.map(recipient => {
                          const isSelected = newSchedule.recipientIds.includes(recipient.id);
                          return (
                            <ListItem
                              key={recipient.id}
                              button
                              onClick={() => handleRecipientToggle(recipient.id)}
                              selected={isSelected}
                            >
                              <ListItemText
                                primary={recipient.name}
                                secondary={recipient.email}
                              />
                              <Switch
                                edge="end"
                                checked={isSelected}
                                onChange={() => handleRecipientToggle(recipient.id)}
                                disabled={loading}
                              />
                            </ListItem>
                          );
                        })
                      )}
                    </List>
                  </Paper>
                  {errors.recipientIds && (
                    <FormHelperText error>{errors.recipientIds}</FormHelperText>
                  )}
                </Grid>
              )}
            </Grid>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Existing Schedules
          </Typography>

          {schedules.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No schedules configured yet
              </Typography>
            </Paper>
          ) : (
            <Paper variant="outlined">
              <List>
                {schedules.map((schedule) => (
                  <ListItem key={schedule.id} divider>
                    <ListItemIcon>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <EventIcon color={schedule.active ? 'primary' : 'disabled'} />
                        <Typography variant="caption" color={schedule.active ? 'primary' : 'text.disabled'}>
                          {getTimeText(schedule.time)}
                        </Typography>
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={getFrequencyText(schedule)}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={getDeliveryMethodText(schedule)}
                            icon={schedule.includeEmail ? <EmailIcon fontSize="small" /> : <NotificationsIcon fontSize="small" />}
                          />
                          <Chip
                            size="small"
                            label={exportFormats.find(f => f.id === schedule.exportFormat)?.name || schedule.exportFormat}
                            icon={<CloudDownloadIcon fontSize="small" />}
                          />
                          {schedule.includeEmail && (
                            <Typography variant="caption" color="text.secondary">
                              {schedule.recipientIds.length} recipient{schedule.recipientIds.length !== 1 ? 's' : ''}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Edit">
                        <IconButton
                          edge="end"
                          onClick={() => handleEditSchedule(schedule)}
                          disabled={loading}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteSchedule(schedule.id as string)}
                          disabled={loading}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveSchedule}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : isEditing ? <EditIcon /> : <AddIcon />}
        >
          {isEditing ? 'Update Schedule' : 'Add Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportScheduleDialog;
