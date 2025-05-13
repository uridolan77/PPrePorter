import React, { useState } from 'react';
import {
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Paper
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import { ExportFormat } from '../../../components/tables/enhanced/types';

interface SimpleReportExportProps {
  onExport: (format: ExportFormat) => void;
}

const SimpleReportExport: React.FC<SimpleReportExportProps> = ({ onExport }) => {
  const [format, setFormat] = useState<ExportFormat>(ExportFormat.CSV);

  // Handle format change
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFormat(event.target.value as ExportFormat);
  };

  // Handle export button click
  const handleExport = (): void => {
    onExport(format);
  };

  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        Export Format
      </Typography>

      <Paper variant="outlined" style={{ padding: 16, marginBottom: 16 }}>
        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            aria-label="export-format"
            name="format"
            value={format}
            onChange={handleFormatChange}
          >
            <FormControlLabel
              value={ExportFormat.CSV}
              control={<Radio />}
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon color="primary" style={{ marginRight: 8 }} />
                  <Typography>CSV File</Typography>
                </div>
              }
            />
            <FormControlLabel
              value={ExportFormat.EXCEL}
              control={<Radio />}
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <TableChartIcon color="success" style={{ marginRight: 8 }} />
                  <Typography>Excel Spreadsheet</Typography>
                </div>
              }
            />
            <FormControlLabel
              value={ExportFormat.PDF}
              control={<Radio />}
              label={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PictureAsPdfIcon color="error" style={{ marginRight: 8 }} />
                  <Typography>PDF Document</Typography>
                </div>
              }
            />
          </RadioGroup>
        </FormControl>
      </Paper>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button
          onClick={handleExport}
          variant="contained"
          color="primary"
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default SimpleReportExport;
