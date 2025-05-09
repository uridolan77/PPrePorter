import React, { useState } from 'react';
import { 
  AppBar, 
  Avatar, 
  Badge, 
  Box, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Toolbar, 
  Tooltip, 
  Typography 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { CommonProps } from '../../types/common';

/**
 * Props for the Header component
 */
export interface HeaderProps extends CommonProps {
  /**
   * Function to toggle the sidebar visibility
   */
  toggleSidebar: () => void;
}

/**
 * Header component for the application showing navigation, notifications, and user info
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar, sx }) => {
  const navigate = useNavigate();
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = (): void => {
    setAnchorElUser(null);
  };

  const handleProfileClick = (): void => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const handleSettingsClick = (): void => {
    handleCloseUserMenu();
    navigate('/settings');
  };

  const handleLogout = (): void => {
    handleCloseUserMenu();
    // Authentication logout logic would go here
    navigate('/login');
  };

  return (
    <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, ...sx }}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleSidebar}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          ProgressPlay Reporter
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Help">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account">
            <IconButton 
              onClick={handleOpenUserMenu} 
              color="inherit" 
              sx={{ ml: 1 }}
              aria-controls="user-menu"
              aria-haspopup="true"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            id="user-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={handleProfileClick}>
              <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleSettingsClick}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
