import React, { useState } from 'react';
import {
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import { ExportConfig, ExportFormat } from '../types';

interface ExportProps {
  config: ExportConfig;
  onExport: (format: ExportFormat) => void;
}

/**
 * Export component for tables
 */
const Export: React.FC<ExportProps> = ({
  config,
  onExport
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: ExportFormat) => {
    onExport(format);
    handleClose();
  };

  // Use configured formats or default to all formats
  const formats = config.formats || [
    ExportFormat.CSV,
    ExportFormat.EXCEL,
    ExportFormat.PDF,
    ExportFormat.JSON
  ];

  return (
    <>
      <Tooltip title="Export data">
        <IconButton size="small" onClick={handleOpen}>
          <GetAppIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Export Format
        </Typography>
        <Divider />
        {formats.includes(ExportFormat.CSV) && (
          <MenuItem onClick={() => handleExport(ExportFormat.CSV)}>
            CSV
          </MenuItem>
        )}
        {formats.includes(ExportFormat.EXCEL) && (
          <MenuItem onClick={() => handleExport(ExportFormat.EXCEL)}>
            Excel
          </MenuItem>
        )}
        {formats.includes(ExportFormat.PDF) && (
          <MenuItem onClick={() => handleExport(ExportFormat.PDF)}>
            PDF
          </MenuItem>
        )}
        {formats.includes(ExportFormat.JSON) && (
          <MenuItem onClick={() => handleExport(ExportFormat.JSON)}>
            JSON
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default Export;
