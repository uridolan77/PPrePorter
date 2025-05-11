import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';
import TuneIcon from '@mui/icons-material/Tune';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import PublicIcon from '@mui/icons-material/Public';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

// Type definitions
interface SubNavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  subItems?: SubNavItem[];
}

interface UserMenuItem {
  text: string;
  icon: React.ReactElement;
  action: () => void;
}

interface User {
  fullName?: string;
  username?: string;
  email?: string;
}

const drawerWidth = 260;

/**
 * Main layout component that wraps the application with a header, sidebar, and footer
 */
const MainLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // State for user menu
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const userMenuOpen = Boolean(anchorEl);

  // Handle drawer toggle
  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  // Handle user menu open
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleUserMenuClose = (): void => {
    setAnchorEl(null);
  };

  // Check if a route is active
  const isActiveRoute = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  // Navigation items
  const mainNavItems: NavItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Reports', icon: <AssessmentIcon />, path: '/reports',
      subItems: [
        { text: 'Daily Actions', icon: <TableChartIcon />, path: '/reports/daily-actions' },
        { text: 'Advanced Daily Actions', icon: <TableChartIcon />, path: '/reports/daily-actions/advanced' },
        { text: 'Players Report', icon: <PersonIcon />, path: '/reports/players' },
        { text: 'Games Report', icon: <VideogameAssetIcon />, path: '/reports/games' },
        { text: 'Financial', icon: <BarChartIcon />, path: '/reports/financial' },
        { text: 'Performance', icon: <TimelineIcon />, path: '/reports/performance' },
        { text: 'Geographic', icon: <PublicIcon />, path: '/reports/geographic' }
      ]
    },
    { text: 'Analytics', icon: <AutoGraphIcon />, path: '/analytics' },
    { text: 'Configuration', icon: <TuneIcon />, path: '/configuration' },
    { text: 'API Test', icon: <HelpIcon />, path: '/api-test' }
  ];

  // User menu items
  const userMenuItems: UserMenuItem[] = [
    { text: 'Profile', icon: <AccountCircleIcon />, action: () => navigate('/profile') },
    { text: 'Settings', icon: <SettingsIcon />, action: () => navigate('/settings') },
    { text: 'Help', icon: <HelpIcon />, action: () => navigate('/help') },
    { text: 'Logout', icon: <LogoutIcon />, action: () => {
      logout();
      navigate('/login');
    }}
  ];

  // Create the navigation drawer content
  const drawerContent = (
    <>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TableChartIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            PPRePorter
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1 }}>
        {mainNavItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={isActiveRoute(item.path)}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mx: 1,
                  pl: 2,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.12)',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActiveRoute(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>

            {/* Render sub-items if they exist */}
            {item.subItems && isActiveRoute(item.path) && (
              <List disablePadding>
                {item.subItems.map((subItem) => (
                  <ListItem key={subItem.text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(subItem.path);
                        if (isMobile) setMobileOpen(false);
                      }}
                      selected={location.pathname === subItem.path}
                      sx={{
                        pl: 7,
                        borderRadius: '0 20px 20px 0',
                        mx: 1,
                        '&.Mui-selected': {
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                          '&:hover': {
                            bgcolor: 'rgba(25, 118, 210, 0.12)',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: 36,
                        color: location.pathname === subItem.path ? 'primary.main' : 'inherit'
                      }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: location.pathname === subItem.path ? 'medium' : 'normal'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            {/* Breadcrumbs or page title could go here */}
            <Typography variant="h6" color="text.primary">
              {location.pathname.includes('daily-actions') ? 'Daily Actions Report' :
               location.pathname.includes('players') ? 'Players Report' :
               location.pathname.includes('games') ? 'Games Report' :
               'Dashboard'}
            </Typography>
          </Box>

          {/* Notification Icon */}
          <Tooltip title="Notifications">
            <IconButton sx={{ mx: 1 }}>
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings Icon */}
          <Tooltip title="Settings">
            <IconButton sx={{ mx: 1 }}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* User Profile */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ padding: 0 }}
                aria-controls={userMenuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuOpen ? 'true' : undefined}
              >
                <Avatar
                  sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                  alt={user?.fullName || user?.username || 'User'}
                >
                  {user?.fullName ? `${user.fullName.split(' ')[0][0]}${user.fullName.split(' ')[1]?.[0] || ''}` :
                   user?.username ? user.username[0].toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                width: 200,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {user?.fullName || user?.username || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || ''}
              </Typography>
            </Box>
            <Divider />
            {userMenuItems.map((item) => (
              <MenuItem
                key={item.text}
                onClick={item.action}
                sx={{ py: 1 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="main navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          overflow: 'auto',
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* This adds spacing below the app bar */}
        <Outlet /> {/* This renders the current route */}
      </Box>
    </Box>
  );
};

export default MainLayout;
