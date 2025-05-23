import React from 'react';
import { TabPanelProps } from '../../types/common';
import SimpleBox from './SimpleBox';

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
        <SimpleBox sx={{ p: 3, ...sx }}>
          {children}
        </SimpleBox>
      )}
    </div>
  );
};

export default TabPanel;
