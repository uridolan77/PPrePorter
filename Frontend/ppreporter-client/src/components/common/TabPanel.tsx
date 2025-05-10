import React from 'react';
import { Box } from '@mui/material';
import { TabPanelProps } from '../../types/common';

/**
 * TabPanel component that displays content based on the active tab
 * Enhanced with proper accessibility attributes
 */
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  label,
  sx,
  ...other
}) => {
  const isSelected = value === index;
  
  return (
    <div
      role="tabpanel"
      hidden={!isSelected}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      aria-label={label}
      {...other}
    >
      {isSelected && (
        <Box sx={{ p: 3, ...sx }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
