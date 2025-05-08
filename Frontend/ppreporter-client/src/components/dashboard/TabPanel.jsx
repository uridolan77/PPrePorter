import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MoreVert as MoreVertIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Styled components
const StyledTabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  overflowY: 'auto'
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightMedium
  }
}));

const TabActions = styled(Box)(({ theme }) => ({
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const TabPanelHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3)
}));

/**
 * TabPanel component - A reusable tab panel system for organizing dashboard content
 * @param {Object} props - Component props
 * @param {Array} props.tabs - Array of tab objects with id, label, content, icon
 * @param {string} props.defaultTab - ID of the default selected tab
 * @param {function} props.onTabChange - Callback when tab changes
 * @param {function} props.onRefresh - Callback when refresh button is clicked
 * @param {function} props.onExport - Callback when export button is clicked
 * @param {function} props.onFullscreen - Callback when fullscreen button is clicked
 * @param {boolean} props.isFullscreen - Whether the panel is in fullscreen mode
 * @param {string} props.title - Optional title to display above tabs
 */
const TabPanel = ({
  tabs = [],
  defaultTab = tabs.length > 0 ? tabs[0].id : '',
  onTabChange = () => {},
  onRefresh = () => {},
  onExport = () => {},
  onFullscreen = () => {},
  isFullscreen = false,
  title = '',
  subTitle = '',
  helpText = '',
  showControls = true
}) => {
  const [selectedTab, setSelectedTab] = useState(defaultTab);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    onTabChange(newValue);
  };
  
  // Handle menu open
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Get current tab content
  const getCurrentTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === selectedTab);
    return currentTab ? currentTab.content : null;
  };

  // Get current tab
  const getCurrentTab = () => {
    return tabs.find(tab => tab.id === selectedTab);
  };
  
  // Render tab controls for mobile
  const renderMobileControls = () => (
    <>
      <IconButton
        aria-label="more"
        aria-controls="tab-menu"
        aria-haspopup="true"
        onClick={handleMenuClick}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="tab-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onRefresh(); handleMenuClose(); }}>
          Refresh
        </MenuItem>
        <MenuItem onClick={() => { onExport(); handleMenuClose(); }}>
          Export
        </MenuItem>
        <MenuItem onClick={() => { onFullscreen(); handleMenuClose(); }}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </MenuItem>
      </Menu>
    </>
  );
  
  // Render tab controls for desktop
  const renderDesktopControls = () => (
    <>
      <Tooltip title="Refresh data">
        <IconButton onClick={onRefresh} size="small">
          <RefreshIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Export data">
        <IconButton onClick={onExport} size="small">
          <DownloadIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
        <IconButton onClick={onFullscreen} size="small">
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Tooltip>
      {helpText && (
        <Tooltip title={helpText}>
          <IconButton size="small">
            <InfoIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <TabPanelHeader>
          <Box>
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
            {subTitle && (
              <Typography variant="body2" color="text.secondary">
                {subTitle}
              </Typography>
            )}
          </Box>
          {showControls && (
            <TabActions>
              {isMobile ? renderMobileControls() : renderDesktopControls()}
            </TabActions>
          )}
        </TabPanelHeader>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <StyledTabs 
          value={selectedTab} 
          onChange={handleTabChange} 
          aria-label="dashboard tabs"
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : 'auto'}
          allowScrollButtonsMobile
          sx={{ flexGrow: 1 }}
        >
          {tabs.map((tab) => (
            <StyledTab 
              key={tab.id} 
              label={tab.label} 
              value={tab.id} 
              icon={tab.icon ? tab.icon : undefined}
              iconPosition="start"
            />
          ))}
        </StyledTabs>
        
        {!title && showControls && (
          <TabActions>
            {isMobile ? renderMobileControls() : renderDesktopControls()}
          </TabActions>
        )}
      </Box>
      
      <StyledTabPanel>
        {getCurrentTabContent()}
      </StyledTabPanel>
    </Box>
  );
};

export default TabPanel;