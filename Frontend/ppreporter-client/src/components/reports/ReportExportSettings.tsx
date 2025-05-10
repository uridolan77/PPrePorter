import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Grid,
  Paper,
  Divider,
  IconButton,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EmailIcon from '@mui/icons-material/Email';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InfoIcon from '@mui/icons-material/Info';
import { CommonProps } from '../../types/common';

// Type definitions
export interface CustomOptions {
  pdfQuality?: string;
  pageSize?: string;
  orientation?: string;
  paginate?: boolean;
  freezeHeaders?: boolean;
  autoFilter?: boolean;
  separateSheets?: boolean;
  fitToPage?: boolean;
  delimiter?: string;
  encoding?: string;
  includeHeaders?: boolean;
  quoteStrings?: boolean;
  jsonFormat?: string;
  wrapInArray?: boolean;
  storagePath?: string;
  [key: string]: any;
}

export interface ExportSettings {
  format: string;
  includeCharts: boolean;
  includeTables: boolean;
  includeFilters: boolean;
  includeMetadata: boolean;
  compression: string;
  password: string;
  deliveryMethod: string;
  emailRecipients: string[];
  customOptions: CustomOptions;
}

export interface ReportExportSettingsProps extends CommonProps {
  exportSettings?: ExportSettings;
  onChange?: (settings: ExportSettings) => void;
}

/**
 * Component for configuring report export settings
 */
const ReportExportSettings: React.FC<ReportExportSettingsProps> = ({
  exportSettings = {
    format: 'pdf',
    includeCharts: true,
    includeTables: true,
    includeFilters: true,
    includeMetadata: true,
    compression: 'none',
    password: '',
    deliveryMethod: 'download',
    emailRecipients: [],
    customOptions: {},
  },
  onChange
}) => {

  // Handle changes to any export setting
  const handleSettingChange = (setting: keyof ExportSettings, value: any): void => {
    if (!onChange) return;

    const updatedSettings = {
      ...exportSettings,
      [setting]: value
    };
    onChange(updatedSettings);
  };

  // Handle changes to format-specific options
  const handleFormatOptionChange = (option: string, value: any): void => {
    const updatedCustomOptions = {
      ...exportSettings.customOptions,
      [option]: value
    };

    handleSettingChange('customOptions', updatedCustomOptions);
  };

  // Add email recipient
  const handleAddRecipient = (): void => {
    const recipientInput = document.getElementById('email-recipient-input') as HTMLInputElement;
    const recipient = recipientInput.value.trim();

    if (!recipient) return;

    // Check if recipient is valid email
    const isValidEmail = /\S+@\S+\.\S+/.test(recipient);

    if (!isValidEmail) {
      // TODO: Show validation error
      return;
    }

    // Add recipient if not already in the list
    if (!exportSettings.emailRecipients.includes(recipient)) {
      handleSettingChange('emailRecipients', [...exportSettings.emailRecipients, recipient]);
    }

    // Clear input field
    recipientInput.value = '';
  };

  // Remove email recipient
  const handleRemoveRecipient = (recipient: string): void => {
    handleSettingChange(
      'emailRecipients',
      exportSettings.emailRecipients.filter(r => r !== recipient)
    );
  };

  // Render format-specific options based on the selected format
  const renderFormatOptions = (): React.ReactNode => {
    switch (exportSettings.format) {
      case 'pdf':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="pdf-quality-label">PDF Quality</InputLabel>
                <Select
                  labelId="pdf-quality-label"
                  value={exportSettings.customOptions?.pdfQuality || 'high'}
                  label="PDF Quality"
                  onChange={(e) => handleFormatOptionChange('pdfQuality', e.target.value)}
                >
                  <MenuItem value="draft">Draft (smaller file size)</MenuItem>
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="high">High Quality</MenuItem>
                  <MenuItem value="print">Print Quality (larger file size)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="pdf-page-size-label">Page Size</InputLabel>
                <Select
                  labelId="pdf-page-size-label"
                  value={exportSettings.customOptions?.pageSize || 'A4'}
                  label="Page Size"
                  onChange={(e) => handleFormatOptionChange('pageSize', e.target.value)}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="letter">Letter</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                  <MenuItem value="tabloid">Tabloid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="pdf-orientation-label">Orientation</InputLabel>
                <Select
                  labelId="pdf-orientation-label"
                  value={exportSettings.customOptions?.orientation || 'portrait'}
                  label="Orientation"
                  onChange={(e) => handleFormatOptionChange('orientation', e.target.value)}
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.paginate ?? true}
                    onChange={(e) => handleFormatOptionChange('paginate', e.target.checked)}
                  />
                }
                label="Include Page Numbers"
              />
            </Grid>
          </>
        );

      case 'excel':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.freezeHeaders ?? true}
                    onChange={(e) => handleFormatOptionChange('freezeHeaders', e.target.checked)}
                  />
                }
                label="Freeze Header Row"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.autoFilter ?? true}
                    onChange={(e) => handleFormatOptionChange('autoFilter', e.target.checked)}
                  />
                }
                label="Enable Auto Filters"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.separateSheets ?? false}
                    onChange={(e) => handleFormatOptionChange('separateSheets', e.target.checked)}
                  />
                }
                label="Create Separate Sheets for Tables"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.fitToPage ?? true}
                    onChange={(e) => handleFormatOptionChange('fitToPage', e.target.checked)}
                  />
                }
                label="Fit Tables to Page Width"
              />
            </Grid>
          </>
        );

      case 'csv':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="csv-delimiter-label">Delimiter</InputLabel>
                <Select
                  labelId="csv-delimiter-label"
                  value={exportSettings.customOptions?.delimiter || 'comma'}
                  label="Delimiter"
                  onChange={(e) => handleFormatOptionChange('delimiter', e.target.value)}
                >
                  <MenuItem value="comma">Comma (,)</MenuItem>
                  <MenuItem value="semicolon">Semicolon (;)</MenuItem>
                  <MenuItem value="tab">Tab</MenuItem>
                  <MenuItem value="pipe">Pipe (|)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="csv-encoding-label">Encoding</InputLabel>
                <Select
                  labelId="csv-encoding-label"
                  value={exportSettings.customOptions?.encoding || 'utf8'}
                  label="Encoding"
                  onChange={(e) => handleFormatOptionChange('encoding', e.target.value)}
                >
                  <MenuItem value="utf8">UTF-8</MenuItem>
                  <MenuItem value="ascii">ASCII</MenuItem>
                  <MenuItem value="utf16">UTF-16</MenuItem>
                  <MenuItem value="iso8859">ISO-8859-1</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.includeHeaders ?? true}
                    onChange={(e) => handleFormatOptionChange('includeHeaders', e.target.checked)}
                  />
                }
                label="Include Column Headers"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.quoteStrings ?? true}
                    onChange={(e) => handleFormatOptionChange('quoteStrings', e.target.checked)}
                  />
                }
                label='Quote String Values'
              />
            </Grid>
          </>
        );

      case 'json':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="json-format-label">JSON Format</InputLabel>
                <Select
                  labelId="json-format-label"
                  value={exportSettings.customOptions?.jsonFormat || 'pretty'}
                  label="JSON Format"
                  onChange={(e) => handleFormatOptionChange('jsonFormat', e.target.value)}
                >
                  <MenuItem value="pretty">Pretty (Indented)</MenuItem>
                  <MenuItem value="compact">Compact (Minimized)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={exportSettings.customOptions?.wrapInArray ?? true}
                    onChange={(e) => handleFormatOptionChange('wrapInArray', e.target.checked)}
                  />
                }
                label="Wrap Records in Array"
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <InsertDriveFileIcon sx={{ mr: 1 }} />
        Export Settings
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Basic Export Settings */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="format-label">Export Format</InputLabel>
              <Select
                labelId="format-label"
                value={exportSettings.format}
                label="Export Format"
                onChange={(e) => handleSettingChange('format', e.target.value)}
                startAdornment={
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {exportSettings.format === 'pdf' && <PictureAsPdfIcon />}
                    {exportSettings.format === 'excel' && <TableChartIcon />}
                    {(exportSettings.format === 'csv' || exportSettings.format === 'json') && <CodeIcon />}
                  </Box>
                }
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                <MenuItem value="csv">CSV File</MenuItem>
                <MenuItem value="json">JSON Data</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="compression-label">Compression</InputLabel>
              <Select
                labelId="compression-label"
                value={exportSettings.compression}
                label="Compression"
                onChange={(e) => handleSettingChange('compression', e.target.value)}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="zip">ZIP Archive</MenuItem>
                <MenuItem value="gzip">GZIP</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Content Inclusion Options */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeCharts}
                  onChange={(e) => handleSettingChange('includeCharts', e.target.checked)}
                />
              }
              label="Include Charts"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeTables}
                  onChange={(e) => handleSettingChange('includeTables', e.target.checked)}
                />
              }
              label="Include Data Tables"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeFilters}
                  onChange={(e) => handleSettingChange('includeFilters', e.target.checked)}
                />
              }
              label="Include Applied Filters"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={exportSettings.includeMetadata}
                  onChange={(e) => handleSettingChange('includeMetadata', e.target.checked)}
                />
              }
              label="Include Report Metadata"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Export Password (Optional)"
              type="password"
              value={exportSettings.password}
              onChange={(e) => handleSettingChange('password', e.target.value)}
              helperText="Password protect your exported report"
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Format-specific options */}
          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="format-options-content"
                id="format-options-header"
              >
                <Typography>
                  {exportSettings.format === 'pdf' && 'PDF Options'}
                  {exportSettings.format === 'excel' && 'Excel Options'}
                  {exportSettings.format === 'csv' && 'CSV Options'}
                  {exportSettings.format === 'json' && 'JSON Options'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {renderFormatOptions()}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Delivery Method */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Delivery Method
            </Typography>

            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant={exportSettings.deliveryMethod === 'download' ? 'contained' : 'outlined'}
                  onClick={() => handleSettingChange('deliveryMethod', 'download')}
                  startIcon={<InsertDriveFileIcon />}
                  sx={{ mr: 1 }}
                >
                  Download
                </Button>
              </Grid>

              <Grid item>
                <Button
                  variant={exportSettings.deliveryMethod === 'email' ? 'contained' : 'outlined'}
                  onClick={() => handleSettingChange('deliveryMethod', 'email')}
                  startIcon={<EmailIcon />}
                  sx={{ mr: 1 }}
                >
                  Email
                </Button>
              </Grid>

              <Grid item>
                <Button
                  variant={exportSettings.deliveryMethod === 'cloud' ? 'contained' : 'outlined'}
                  onClick={() => handleSettingChange('deliveryMethod', 'cloud')}
                  startIcon={<CloudUploadIcon />}
                >
                  Cloud Storage
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/* Email recipients */}
          {exportSettings.deliveryMethod === 'email' && (
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="email-recipient-input"
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
                      <Button
                        onClick={handleAddRecipient}
                        variant="contained"
                        size="small"
                        sx={{ ml: 1 }}
                      >
                        Add
                      </Button>
                    ),
                  }}
                />
              </Box>

              <Box>
                {exportSettings.emailRecipients?.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {exportSettings.emailRecipients.map((recipient) => (
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

          {/* Cloud storage path */}
          {exportSettings.deliveryMethod === 'cloud' && (
            <Grid item xs={12}>
              <TextField
                label="Storage Location"
                value={exportSettings.customOptions?.storagePath || ''}
                onChange={(e) => handleFormatOptionChange('storagePath', e.target.value)}
                fullWidth
                placeholder="e.g., S3://bucket-name/reports/"
                helperText="Enter cloud storage location path"
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <InfoIcon color="info" fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Export settings can be saved as defaults in your profile preferences.
        </Typography>
      </Box>
    </Box>
  );
};

export default ReportExportSettings;
