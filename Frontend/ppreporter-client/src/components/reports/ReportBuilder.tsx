import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import FilterListIcon from '@mui/icons-material/FilterList';
import { CommonProps } from '../../types/common';

// Type definitions
export interface DataSource {
  id: string;
  name: string;
  description?: string;
}

export interface VisualizationType {
  id: string;
  name: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface Column {
  id: string;
  name: string;
  dataType: string;
  description?: string;
}

export interface Filter {
  column: string;
  operator: string;
  value: string;
}

export interface SortConfig {
  column: Column;
  direction: 'asc' | 'desc';
}

export interface ReportConfiguration {
  title: string;
  description: string;
  dataSource: string;
  visualizationType: string;
  selectedColumns: Column[];
  filters: Filter[];
  groupBy: Column[];
  sortBy: SortConfig | null;
  isPublic: boolean;
  refreshInterval: number;
}

export interface ReportBuilderProps extends CommonProps {
  dataSources?: DataSource[];
  visualizationTypes?: VisualizationType[];
  columns?: Column[];
  onSave?: (config: ReportConfiguration) => void;
  onPreview?: (config: ReportConfiguration) => void;
  onLoadDataSource?: (dataSourceId: string) => void;
  initialReport?: ReportConfiguration | null;
  onCancel?: () => void;
}

interface FormErrors {
  title?: string;
  dataSource?: string;
  selectedColumns?: string;
  visualizationType?: string;
  [key: string]: string | undefined;
}

/**
 * ReportBuilder component for creating and editing custom reports
 */
const ReportBuilder: React.FC<ReportBuilderProps> = ({
  dataSources = [],
  visualizationTypes = [],
  columns = [],
  onSave,
  onPreview,
  onLoadDataSource,
  initialReport = null,
  onCancel,
  sx
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [reportConfig, setReportConfig] = useState<ReportConfiguration>({
    title: initialReport?.title || '',
    description: initialReport?.description || '',
    dataSource: initialReport?.dataSource || '',
    visualizationType: initialReport?.visualizationType || '',
    selectedColumns: initialReport?.selectedColumns || [],
    filters: initialReport?.filters || [],
    groupBy: initialReport?.groupBy || [],
    sortBy: initialReport?.sortBy || null,
    isPublic: initialReport?.isPublic || false,
    refreshInterval: initialReport?.refreshInterval || 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load columns when data source changes
  useEffect(() => {
    if (reportConfig.dataSource && onLoadDataSource) {
      onLoadDataSource(reportConfig.dataSource);
    }
  }, [reportConfig.dataSource, onLoadDataSource]);

  const steps: string[] = [
    'Basic Information',
    'Data Source',
    'Column Selection',
    'Filters & Grouping',
    'Visualization',
    'Schedule & Share'
  ];

  const handleNext = (): void => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = (): void => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 0) {
      if (!reportConfig.title.trim()) {
        newErrors.title = 'Report title is required';
      }
    } else if (step === 1) {
      if (!reportConfig.dataSource) {
        newErrors.dataSource = 'Data source is required';
      }
    } else if (step === 2) {
      if (reportConfig.selectedColumns.length === 0) {
        newErrors.selectedColumns = 'At least one column must be selected';
      }
    } else if (step === 4) {
      if (!reportConfig.visualizationType) {
        newErrors.visualizationType = 'Visualization type is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string | number>): void => {
    const name = event.target.name as keyof ReportConfiguration;
    const value = (event.target as HTMLInputElement).type === 'checkbox'
      ? (event.target as HTMLInputElement).checked
      : event.target.value;

    setReportConfig((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleColumnToggle = (column: Column): void => {
    setReportConfig((prev) => {
      const isSelected = prev.selectedColumns.some(col => col.id === column.id);
      let updatedColumns;

      if (isSelected) {
        updatedColumns = prev.selectedColumns.filter(col => col.id !== column.id);
      } else {
        updatedColumns = [...prev.selectedColumns, column];
      }

      return {
        ...prev,
        selectedColumns: updatedColumns
      };
    });

    // Clear selection error if any columns are selected
    if (errors.selectedColumns) {
      setErrors((prev) => ({ ...prev, selectedColumns: undefined }));
    }
  };

  const handleAddFilter = (): void => {
    setReportConfig((prev) => ({
      ...prev,
      filters: [...prev.filters, { column: '', operator: '=', value: '' }]
    }));
  };

  const handleFilterChange = (index: number, field: keyof Filter, value: string): void => {
    setReportConfig((prev) => {
      const updatedFilters = [...prev.filters];
      updatedFilters[index] = { ...updatedFilters[index], [field]: value };
      return {
        ...prev,
        filters: updatedFilters
      };
    });
  };

  const handleRemoveFilter = (index: number): void => {
    setReportConfig((prev) => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const handleGroupByToggle = (column: Column): void => {
    setReportConfig((prev) => {
      const isSelected = prev.groupBy.some(col => col.id === column.id);
      let updatedGroupBy;

      if (isSelected) {
        updatedGroupBy = prev.groupBy.filter(col => col.id !== column.id);
      } else {
        updatedGroupBy = [...prev.groupBy, column];
      }

      return {
        ...prev,
        groupBy: updatedGroupBy
      };
    });
  };

  const handleSortByChange = (column: Column | null, direction: 'asc' | 'desc'): void => {
    setReportConfig((prev) => ({
      ...prev,
      sortBy: column ? { column, direction } : null
    }));
  };

  const handlePreview = (): void => {
    if (onPreview) {
      onPreview(reportConfig);
    }
  };

  const handleSave = (): void => {
    if (validateAllSteps() && onSave) {
      onSave(reportConfig);
    }
  };

  const validateAllSteps = (): boolean => {
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return false;
      }
    }
    return true;
  };

  const renderStepContent = (step: number): React.ReactNode => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <TextField
              fullWidth
              label="Report Title"
              name="title"
              value={reportConfig.title}
              onChange={handleInputChange}
              margin="normal"
              error={!!errors.title}
              helperText={errors.title}
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={reportConfig.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Data Source
            </Typography>
            <FormControl fullWidth margin="normal" error={!!errors.dataSource}>
              <InputLabel id="data-source-label">Data Source</InputLabel>
              <Select
                labelId="data-source-label"
                name="dataSource"
                value={reportConfig.dataSource}
                onChange={handleInputChange}
                label="Data Source"
                required
              >
                {dataSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.dataSource && (
                <Typography color="error" variant="caption">
                  {errors.dataSource}
                </Typography>
              )}
            </FormControl>

            {reportConfig.dataSource && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Data Source Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dataSources.find(ds => ds.id === reportConfig.dataSource)?.description || 'No description available'}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Columns
            </Typography>

            {errors.selectedColumns && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.selectedColumns}
              </Alert>
            )}

            <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
              <List>
                {columns.map((column) => {
                  const isSelected = reportConfig.selectedColumns.some(col => col.id === column.id);
                  return (
                    <ListItem key={column.id} divider>
                      <ListItemIcon>
                        <ViewColumnIcon color={isSelected ? 'primary' : 'action'} />
                      </ListItemIcon>
                      <ListItemText
                        primary={column.name}
                        secondary={`${column.dataType} • ${column.description || 'No description'}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleColumnToggle(column)}
                          color={isSelected ? 'primary' : 'default'}
                        >
                          {isSelected ? <RemoveIcon /> : <AddIcon />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Selected Columns ({reportConfig.selectedColumns.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {reportConfig.selectedColumns.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No columns selected
                  </Typography>
                ) : (
                  reportConfig.selectedColumns.map((column) => (
                    <Chip
                      key={column.id}
                      label={column.name}
                      onDelete={() => handleColumnToggle(column)}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                )}
              </Box>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Filters
                </Typography>

                {reportConfig.filters.map((filter, index) => (
                  <Box key={index} sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <FormControl sx={{ minWidth: 150 }}>
                      <InputLabel>Column</InputLabel>
                      <Select
                        value={filter.column}
                        onChange={(e) => handleFilterChange(index, 'column', e.target.value)}
                        label="Column"
                        size="small"
                      >
                        {reportConfig.selectedColumns.map((column) => (
                          <MenuItem key={column.id} value={column.id}>
                            {column.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={filter.operator}
                        onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                        label="Operator"
                        size="small"
                      >
                        <MenuItem value="=">=</MenuItem>
                        <MenuItem value="!=">!=</MenuItem>
                        <MenuItem value=">">&gt;</MenuItem>
                        <MenuItem value=">=">&gt;=</MenuItem>
                        <MenuItem value="<">&lt;</MenuItem>
                        <MenuItem value="<=">&lt;=</MenuItem>
                        <MenuItem value="contains">Contains</MenuItem>
                        <MenuItem value="starts_with">Starts with</MenuItem>
                        <MenuItem value="ends_with">Ends with</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Value"
                      value={filter.value}
                      onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />

                    <IconButton color="error" onClick={() => handleRemoveFilter(index)}>
                      <RemoveIcon />
                    </IconButton>
                  </Box>
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddFilter}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Filter
                </Button>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Group By & Sort
                </Typography>

                <Typography variant="subtitle2" gutterBottom>
                  Group By
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {reportConfig.selectedColumns.map((column) => {
                    const isSelected = reportConfig.groupBy.some(col => col.id === column.id);
                    return (
                      <Chip
                        key={column.id}
                        label={column.name}
                        onClick={() => handleGroupByToggle(column)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                      />
                    );
                  })}

                  {reportConfig.selectedColumns.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Select columns first
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Sort By
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Column</InputLabel>
                      <Select
                        value={reportConfig.sortBy?.column?.id || ''}
                        onChange={(e) => {
                          const column = reportConfig.selectedColumns.find(col => col.id === e.target.value);
                          handleSortByChange(column || null, reportConfig.sortBy?.direction || 'asc');
                        }}
                        label="Column"
                      >
                        <MenuItem value="">None</MenuItem>
                        {reportConfig.selectedColumns.map((column) => (
                          <MenuItem key={column.id} value={column.id}>
                            {column.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small" disabled={!reportConfig.sortBy?.column}>
                      <InputLabel>Direction</InputLabel>
                      <Select
                        value={reportConfig.sortBy?.direction || 'asc'}
                        onChange={(e) => handleSortByChange(reportConfig.sortBy?.column || null, e.target.value as 'asc' | 'desc')}
                        label="Direction"
                      >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Visualization
            </Typography>

            <FormControl fullWidth margin="normal" error={!!errors.visualizationType}>
              <InputLabel id="visualization-type-label">Visualization Type</InputLabel>
              <Select
                labelId="visualization-type-label"
                name="visualizationType"
                value={reportConfig.visualizationType}
                onChange={handleInputChange}
                label="Visualization Type"
                required
              >
                {visualizationTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.visualizationType && (
                <Typography color="error" variant="caption">
                  {errors.visualizationType}
                </Typography>
              )}
            </FormControl>

            {reportConfig.visualizationType && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Visualization Options
                </Typography>

                {/* Here you would include specific options for each visualization type */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  Additional configuration options for {visualizationTypes.find(t => t.id === reportConfig.visualizationType)?.name} will be displayed here.
                </Alert>
              </Box>
            )}
          </Box>
        );

      case 5:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Schedule & Share
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel id="refresh-interval-label">Refresh Interval</InputLabel>
              <Select<number>
                labelId="refresh-interval-label"
                name="refreshInterval"
                value={reportConfig.refreshInterval}
                onChange={(e) => handleInputChange(e as SelectChangeEvent<number>)}
                label="Refresh Interval"
              >
                <MenuItem value={0}>Manual refresh only</MenuItem>
                <MenuItem value={15}>Every 15 minutes</MenuItem>
                <MenuItem value={30}>Every 30 minutes</MenuItem>
                <MenuItem value={60}>Every hour</MenuItem>
                <MenuItem value={360}>Every 6 hours</MenuItem>
                <MenuItem value={720}>Every 12 hours</MenuItem>
                <MenuItem value={1440}>Every day</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={reportConfig.isPublic}
                  onChange={handleInputChange}
                  name="isPublic"
                />
              }
              label="Make this report public"
              sx={{ mt: 2 }}
            />

            {reportConfig.isPublic && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Public reports can be viewed by anyone with the link, without requiring login.
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ borderRadius: 1, overflow: 'hidden', ...sx }}>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" component="h2">
          {initialReport ? 'Edit Report' : 'Create New Report'}
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ py: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider />

      <Box>
        {renderStepContent(activeStep)}
      </Box>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
        <Button
          onClick={onCancel}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>

        <Box>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            Back
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          ) : (
            <Box sx={{ display: 'flex' }}>
              <Button
                variant="outlined"
                onClick={handlePreview}
                startIcon={<VisibilityIcon />}
                sx={{ mr: 1 }}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                Save Report
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ReportBuilder;
