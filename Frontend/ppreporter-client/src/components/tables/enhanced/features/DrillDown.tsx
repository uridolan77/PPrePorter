import React, { useState } from 'react';
import {
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { DrillDownConfig as DrillDownConfigType } from '../types';

interface DrillDownProps {
  configs: DrillDownConfigType[];
  sourceGrouping: string | null;
  selectedRow: any | null;
  onDrillDown: (row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => void;
}

/**
 * DrillDown component for tables
 */
const DrillDown: React.FC<DrillDownProps> = ({
  configs,
  sourceGrouping,
  selectedRow,
  onDrillDown
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedRow) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrillDown = (config: DrillDownConfigType) => {
    if (!selectedRow || !sourceGrouping) return;
    
    const filters = config.transformFilter 
      ? config.transformFilter(selectedRow) 
      : { [sourceGrouping]: selectedRow[sourceGrouping] };
    
    onDrillDown(selectedRow, config.sourceGrouping, config.targetGrouping, filters);
    handleClose();
  };

  // Filter applicable drill-down configurations
  const applicableConfigs = sourceGrouping
    ? configs.filter(config => config.sourceGrouping === sourceGrouping)
    : [];

  if (applicableConfigs.length === 0) {
    return null;
  }

  return (
    <>
      <Tooltip title="Drill down options">
        <IconButton
          size="small"
          onClick={handleOpen}
          color="primary"
          disabled={!selectedRow}
        >
          <ZoomInIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Drill Down Options
        </Typography>
        <Divider />
        {applicableConfigs.map((config, index) => (
          <MenuItem
            key={`drill-down-${index}`}
            onClick={() => handleDrillDown(config)}
          >
            {config.label || `View by ${config.targetGrouping}`}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DrillDown;
