import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SettingsIcon from '@mui/icons-material/Settings';
import PreviewIcon from '@mui/icons-material/Preview';
import ShareIcon from '@mui/icons-material/Share';

import ReportDataSourceSelector from './ReportDataSourceSelector';
import ReportFilterSelector from './ReportFilterSelector';
import ReportColumnSelector from './ReportColumnSelector';
import ReportPreview from './ReportPreview';
import ReportExportSettings from './ReportExportSettings';
import ReportScheduleSettings from './ReportScheduleSettings';

/**
 * Report Builder component that guides users through creating and configuring reports
 * @param {Object} props - Component props
 * @param {Object} props.initialConfig - Initial report configuration
 * @param {Function} props.onSave - Function called when report is saved
 * @param {Function} props.onCancel - Function called when report creation is cancelled
 * @param {boolean} props.isEdit - Whether we're editing an existing report
 * @param {Array} props.availableDataSources - Available data sources for reports
 * @param {Function} props.onPreviewData - Function to get preview data
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message if any
 */
const ReportBuilder = ({
  initialConfig = {},
  onSave,
  onCancel,
  isEdit = false,
  availableDataSources = [],
  onPreviewData,
  loading = false,
  error = null
}) => {
  // Steps in the report configuration process
  const steps = [
    { label: 'Select Data Source', icon: <DescriptionIcon /> },
    { label: 'Define Filters', icon: <FilterAltIcon /> },
    { label: 'Select Columns', icon: <ViewColumnIcon /> },
    { label: 'Preview Report', icon: <PreviewIcon /> },
    { label: 'Configure Settings', icon: <SettingsIcon /> }
  ];

  // State for active step and report configuration
  const [activeStep, setActiveStep] = useState(0);
  const [reportConfig, setReportConfig] = useState({
    name: initialConfig.name || '',
    description: initialConfig.description || '',
    dataSource: initialConfig.dataSource || null,
    filters: initialConfig.filters || [],
    columns: initialConfig.columns || [],
    sortBy: initialConfig.sortBy || null,
    groupBy: initialConfig.groupBy || null,
    exportSettings: initialConfig.exportSettings || {
      format: 'excel',
      includeHeaders: true,
      includeSubtotals: false
    },
    scheduleSettings: initialConfig.scheduleSettings || {
      enabled: false,
      frequency: 'never',
      time: null,
      day: null,
      recipients: []
    }
  });
  
  // State for preview data
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  
  // Handle step navigation
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Update report configuration
  const updateConfig = (section, data) => {
    setReportConfig(prev => ({
      ...prev,
      [section]: data
    }));
  };

  // Fetch preview data when reaching the preview step
  useEffect(() => {
    if (activeStep === 3 && onPreviewData && reportConfig.dataSource) {
      setPreviewLoading(true);
      setPreviewError(null);
      
      onPreviewData(reportConfig)
        .then(data => {
          setPreviewData(data);
          setPreviewLoading(false);
        })
        .catch(err => {
          setPreviewError(err.message || 'Failed to load preview data');
          setPreviewLoading(false);
        });
    }
  }, [activeStep, onPreviewData, reportConfig]);

  // Handle save action
  const handleSave = () => {
    if (onSave) {
      onSave(reportConfig);
    }
  };

  // Render content based on the active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ReportDataSourceSelector
            selected={reportConfig.dataSource}
            availableDataSources={availableDataSources}
            onChange={(dataSource) => updateConfig('dataSource', dataSource)}
            name={reportConfig.name}
            description={reportConfig.description}
            onNameChange={(name) => updateConfig('name', name)}
            onDescriptionChange={(description) => updateConfig('description', description)}
          />
        );
      case 1:
        return (
          <ReportFilterSelector
            dataSource={reportConfig.dataSource}
            filters={reportConfig.filters}
            onChange={(filters) => updateConfig('filters', filters)}
          />
        );
      case 2:
        return (
          <ReportColumnSelector
            dataSource={reportConfig.dataSource}
            selectedColumns={reportConfig.columns}
            onChange={(columns) => updateConfig('columns', columns)}
            sortBy={reportConfig.sortBy}
            onSortChange={(sortBy) => updateConfig('sortBy', sortBy)}
            groupBy={reportConfig.groupBy}
            onGroupChange={(groupBy) => updateConfig('groupBy', groupBy)}
          />
        );
      case 3:
        return (
          <ReportPreview
            config={reportConfig}
            data={previewData}
            loading={previewLoading}
            error={previewError}
            onConfigChange={setReportConfig}
          />
        );
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ReportExportSettings
                settings={reportConfig.exportSettings}
                onChange={(settings) => updateConfig('exportSettings', settings)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReportScheduleSettings
                settings={reportConfig.scheduleSettings}
                onChange={(settings) => updateConfig('scheduleSettings', settings)}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={onCancel} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            {isEdit ? 'Edit Report' : 'Create New Report'}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel StepIconProps={{ icon: step.icon }}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Paper sx={{ p: 3 }} elevation={1}>
        <Box>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #eaeaea' }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box>
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {isEdit ? 'Update Report' : 'Save Report'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!reportConfig.dataSource && activeStep === 0}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportBuilder;