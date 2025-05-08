import React from 'react';
import { Box } from '@mui/material';

/**
 * TabPanel component that displays content based on the active tab
 * @param {Object} props - Component props
 * @param {Number} props.value - Current active tab index
 * @param {Number} props.index - This tab's index
 * @param {ReactNode} props.children - Tab content
 * @returns {ReactNode} - Rendered tab panel
 */
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;