import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AppsIcon from '@mui/icons-material/Apps';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export interface ModernHeaderProps {
  title?: string;
  user?: {
    name: string;
    avatar?: string;
    email?: string;
  };
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  notificationCount?: number;
  sidebarWidth: number;
  sidebarOpen: boolean;
}

/**
 * ModernHeader component
 * A header with modern styling based on the dashboard image
 */
const ModernHeader: React.FC<ModernHeaderProps> = ({
  title = 'Dashboard',
  user = { name: 'User Name', email: 'user@example.com' },
  onLogout,
  onProfileClick,
  onSettingsClick,
  notificationCount = 0,
  sidebarWidth,
  sidebarOpen
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick();
    handleProfileMenuClose();
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) onSettingsClick();
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    handleProfileMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${sidebarOpen ? sidebarWidth : 72}px)` },
        ml: { sm: `${sidebarOpen ? sidebarWidth : 72}px` },
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Page title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          {title}
        </Typography>

        {/* Search bar */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: 20,
            backgroundColor: alpha(theme.palette.grey[200], 0.5),
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[200], 0.8),
            },
            marginLeft: 2,
            width: 'auto',
            [theme.breakpoints.up('md')]: {
              marginLeft: 4,
              width: 'auto',
            },
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon sx={{ color: theme.palette.text.secondary }} />
          </Box>
          <InputBase
            placeholder="Search…"
            sx={{
              color: theme.palette.text.primary,
              padding: theme.spacing(1, 1, 1, 0),
              paddingLeft: `calc(1em + ${theme.spacing(4)})`,
              transition: theme.transitions.create('width'),
              width: '100%',
              [theme.breakpoints.up('md')]: {
                width: '20ch',
                '&:focus': {
                  width: '30ch',
                },
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Action icons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Apps menu */}
          <Tooltip title="Apps">
            <IconButton
              size="large"
              color="inherit"
              sx={{ 
                ml: 1,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <AppsIcon />
            </IconButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="Help">
            <IconButton
              size="large"
              color="inherit"
              sx={{ 
                ml: 1,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ 
                ml: 1,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              size="large"
              color="inherit"
              onClick={handleSettingsClick}
              sx={{ 
                ml: 1,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* User profile */}
          <Tooltip title="Account">
            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              sx={{ 
                ml: 1,
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              {user.avatar ? (
                <Avatar 
                  src={user.avatar} 
                  alt={user.name}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Profile menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 200,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfileClick}>
          <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <SettingsIcon fontSize="small" sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            borderRadius: 2,
            minWidth: 300,
            maxWidth: 360,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Notifications
          </Typography>
        </Box>
        <Divider />
        {notificationCount > 0 ? (
          Array.from(new Array(Math.min(notificationCount, 3))).map((_, index) => (
            <MenuItem key={index} onClick={handleNotificationMenuClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">
                  Notification {index + 1}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This is a sample notification message
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No new notifications
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={handleNotificationMenuClose} sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default ModernHeader;
