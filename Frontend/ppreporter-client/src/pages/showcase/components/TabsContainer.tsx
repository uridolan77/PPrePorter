import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import TabPanel from '../../../components/common/TabPanel';

interface TabItem {
  label: string;
  content: React.ReactNode;
}

interface TabsContainerProps {
  tabs: TabItem[];
}

/**
 * TabsContainer component for the showcase
 * Wraps the TabPanel component with Tabs for navigation
 */
const TabsContainer: React.FC<TabsContainerProps> = ({ tabs }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="tabs">
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} id={`tab-${index}`} aria-controls={`tabpanel-${index}`} />
          ))}
        </Tabs>
      </Box>
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Box>
  );
};

export default TabsContainer;
