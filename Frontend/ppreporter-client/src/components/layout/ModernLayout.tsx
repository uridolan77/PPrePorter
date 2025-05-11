import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import ModernSidebar, { SidebarItem } from './ModernSidebar';
import ModernHeader from './ModernHeader';

export interface ModernLayoutProps {
  children: React.ReactNode;
  title?: string;
  sidebarItems?: SidebarItem[];
  user?: {
    name: string;
    avatar?: string;
    email?: string;
    role?: string;
  };
  logo?: React.ReactNode;
  sidebarTitle?: string;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  notificationCount?: number;
}

/**
 * ModernLayout component
 * A layout with modern styling based on the dashboard image
 */
const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  title = 'Dashboard',
  sidebarItems,
  user = { 
    name: 'User Name', 
    email: 'user@example.com',
    role: 'Admin'
  },
  logo,
  sidebarTitle,
  onLogout,
  onProfileClick,
  onSettingsClick,
  notificationCount = 0
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const sidebarWidth = 240;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <ModernSidebar
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
        width={sidebarWidth}
        items={sidebarItems}
        user={user}
        logo={logo}
        title={sidebarTitle}
      />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${sidebarOpen ? sidebarWidth : 72}px)` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <ModernHeader
          title={title}
          user={user}
          onLogout={onLogout}
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
          notificationCount={notificationCount}
          sidebarWidth={sidebarWidth}
          sidebarOpen={sidebarOpen}
        />
        
        <Toolbar sx={{ minHeight: '64px !important' }} />
        
        {/* Content area */}
        <Box
          sx={{
            p: 3,
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: theme.palette.background.default,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default ModernLayout;
