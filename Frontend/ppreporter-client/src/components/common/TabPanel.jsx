import React from 'react';
import { Box } from '@mui/material';

/**
 * TabPanel component that displays content based on the active tab
 * Enhanced with proper accessibility attributes
 *
 * @param {Object} props - Component props
 * @param {Number} props.value - Current active tab index
 * @param {Number} props.index - This tab's index
 * @param {ReactNode} props.children - Tab content
 * @param {String} props.label - Optional label for the tab panel (for aria-label)
 * @returns {ReactNode} - Rendered tab panel
 */
const TabPanel = (props) => {
  const { children, value, index, label, ...other } = props;
  const isActive = value === index;

  return (
    <div
      role="tabpanel"
      hidden={!isActive}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      aria-hidden={!isActive}
      aria-label={label || `Tab panel ${index + 1}`}
      tabIndex={isActive ? 0 : -1}
      {...other}
    >
      {isActive && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;