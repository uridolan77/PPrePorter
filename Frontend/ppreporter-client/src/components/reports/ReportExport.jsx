import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Divider,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';

/**
 * Component for configuring and initiating report exports
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onExport - Function to call when export is confirmed
 * @param {Array} props.sections - Report sections that can be included in export
 * @param {boolean} props.loading - Whether export is in progress
 * @param {string} props.defaultFormat - Default export format
 * @param {Object} props.report - Report being exported
 */
const ReportExport = ({
  open,
  onClose,
  onExport,
  sections = [],
  loading = false,
  defaultFormat = 'pdf',
  report = {}
}) => {
  const [format, setFormat] = useState(defaultFormat);
  const [options, setOptions] = useState({
    includeFilters: true,
    includeLogo: true,
    includeMetadata: true,
    orientation: 'portrait',
    pageSize: 'a4',
    quality: 'high',
    includeAllSections: true,
    selectedSections: sections.map(section => section.id)
  });
  
  // Handle format change
  const handleFormatChange = (event) => {
    setFormat(event.target.value);
  };
  
  // Handle option change
  const handleOptionChange = (event) => {
    const { name, checked, value, type } = event.target;
    
    setOptions({
      ...options,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Special handling for includeAllSections toggle
    if (name === 'includeAllSections' && checked) {
      setOptions(prev => ({
        ...prev,
        selectedSections: sections.map(section => section.id)
      }));
    }
  };
  
  // Handle section selection change
  const handleSectionChange = (sectionId) => {
    const currentSelectedSections = [...options.selectedSections];
    const sectionIndex = currentSelectedSections.indexOf(sectionId);
    
    if (sectionIndex === -1) {
      // Add section
      currentSelectedSections.push(sectionId);
    } else {
      // Remove section
      currentSelectedSections.splice(sectionIndex, 1);
    }
    
    // Update includeAllSections state based on selection
    const allSectionsSelected = sections.length === currentSelectedSections.length;
    
    setOptions({
      ...options,
      selectedSections: currentSelectedSections,
      includeAllSections: allSectionsSelected
    });
  };
  
  // Handle export confirmation
  const handleExport = () => {
    if (onExport) {
      onExport({
        format,
        options,
        report
      });
    }
  };
  
  // Format specific options
  const renderFormatOptions = () => {
    switch (format) {
      case 'pdf':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Orientation</InputLabel>
                <Select
                  name="orientation"
                  value={options.orientation}
                  onChange={handleOptionChange}
                  label="Orientation"
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Page Size</InputLabel>
                <Select
                  name="pageSize"
                  value={options.pageSize}
                  onChange={handleOptionChange}
                  label="Page Size"
                >
                  <MenuItem value="a4">A4</MenuItem>
                  <MenuItem value="letter">Letter</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 'excel':
        return (
          <FormControl component="fieldset" fullWidth margin="normal">
            <Typography variant="subtitle2" gutterBottom>
              Excel Options
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeFormatting}
                    onChange={handleOptionChange}
                    name="includeFormatting"
                  />
                }
                label="Include formatting"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeSeparateSheets}
                    onChange={handleOptionChange}
                    name="includeSeparateSheets"
                  />
                }
                label="Create separate sheet for each section"
              />
            </FormGroup>
          </FormControl>
        );
        
      case 'csv':
        return (
          <FormControl component="fieldset" fullWidth margin="normal">
            <Typography variant="subtitle2" gutterBottom>
              CSV Options
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={options.includeHeaders}
                    onChange={handleOptionChange}
                    name="includeHeaders"
                    defaultChecked
                  />
                }
                label="Include column headers"
              />
            </FormGroup>
            <FormControl fullWidth margin="normal">
              <InputLabel>Delimiter</InputLabel>
              <Select
                name="delimiter"
                value={options.delimiter || ','}
                onChange={handleOptionChange}
                label="Delimiter"
              >
                <MenuItem value=",">Comma (,)</MenuItem>
                <MenuItem value=";">Semicolon (;)</MenuItem>
                <MenuItem value="\t">Tab</MenuItem>
                <MenuItem value="|">Pipe (|)</MenuItem>
              </Select>
            </FormControl>
          </FormControl>
        );
        
      case 'image':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Image Quality</InputLabel>
            <Select
              name="quality"
              value={options.quality}
              onChange={handleOptionChange}
              label="Image Quality"
            >
              <MenuItem value="low">Low (72 DPI)</MenuItem>
              <MenuItem value="medium">Medium (150 DPI)</MenuItem>
              <MenuItem value="high">High (300 DPI)</MenuItem>
            </Select>
          </FormControl>
        );
        
      default:
        return null;
    }
  };
  
  // Get format icon
  const getFormatIcon = () => {
    switch (format) {
      case 'pdf':
        return <PictureAsPdfIcon fontSize="large" color="error" />;
      case 'excel':
        return <TableChartIcon fontSize="large" color="success" />;
      case 'csv':
        return <DescriptionIcon fontSize="large" color="primary" />;
      case 'image':
        return <ImageIcon fontSize="large" color="secondary" />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="export-dialog-title"
    >
      <DialogTitle id="export-dialog-title">
        Export Report: {report.name}
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Left column - Format selection */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Export Format
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  aria-label="export-format"
                  name="format"
                  value={format}
                  onChange={handleFormatChange}
                >
                  <FormControlLabel
                    value="pdf"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />
                        <Typography>PDF Document</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="excel"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TableChartIcon color="success" sx={{ mr: 1 }} />
                        <Typography>Excel Spreadsheet</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="csv"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                        <Typography>CSV File</Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="image"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ImageIcon color="secondary" sx={{ mr: 1 }} />
                        <Typography>Image (PNG)</Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Paper>
            
            <Typography variant="subtitle1" gutterBottom>
              Content Options
            </Typography>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.includeFilters}
                      onChange={handleOptionChange}
                      name="includeFilters"
                    />
                  }
                  label="Include filters"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.includeLogo}
                      onChange={handleOptionChange}
                      name="includeLogo"
                    />
                  }
                  label="Include company logo"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={options.includeMetadata}
                      onChange={handleOptionChange}
                      name="includeMetadata"
                    />
                  }
                  label="Include metadata"
                />
              </FormGroup>
            </Paper>
          </Grid>
          
          {/* Right column - Format specific options */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ mr: 2 }}>
                {getFormatIcon()}
              </Box>
              <Box>
                <Typography variant="h6">
                  {format === 'pdf' ? 'PDF Document' : 
                   format === 'excel' ? 'Excel Spreadsheet' : 
                   format === 'csv' ? 'CSV File' : 'Image Export'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format === 'pdf' ? 'Export report as a PDF document with formatting and layout.' : 
                   format === 'excel' ? 'Export data to Excel format for further analysis.' : 
                   format === 'csv' ? 'Export raw data to CSV format for use in other applications.' : 
                   'Export report as a PNG image.'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Format specific options */}
            {renderFormatOptions()}
            
            <Divider sx={{ my: 2 }} />
            
            {/* Section selection */}
            <Typography variant="subtitle1" gutterBottom>
              Sections to Include
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includeAllSections}
                  onChange={handleOptionChange}
                  name="includeAllSections"
                />
              }
              label="Include all sections"
            />
            
            {!options.includeAllSections && sections.length > 0 && (
              <Paper variant="outlined" sx={{ mt: 1, p: 2, maxHeight: 200, overflow: 'auto' }}>
                <FormGroup>
                  {sections.map((section) => (
                    <FormControlLabel
                      key={section.id}
                      control={
                        <Checkbox
                          checked={options.selectedSections.includes(section.id)}
                          onChange={() => handleSectionChange(section.id)}
                        />
                      }
                      label={section.title}
                    />
                  ))}
                </FormGroup>
              </Paper>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading || (options.selectedSections.length === 0)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportExport;