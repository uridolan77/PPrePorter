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
  useTheme,
  alpha
} from '@mui/material';
import { getFlatModernCardSx } from '../../utils/applyFlatModernStyle';
import CardAccent from '../common/CardAccent';

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
import RefreshIcon from '@mui/icons-material/Refresh';

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

const drawerWidth = 300; // Increased width for sidebar
const collapsedDrawerWidth = 64; // Width when sidebar is collapsed

/**
 * Main layout component that wraps the application with a header, sidebar, and footer
 */
const MainLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  // State for drawer
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // State for user menu
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const userMenuOpen = Boolean(anchorEl);

  // Handle mobile drawer toggle
  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  // Handle sidebar toggle
  const handleSidebarToggle = (): void => {
    setSidebarOpen(!sidebarOpen);
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
        { text: 'Integrated Reports', icon: <AssessmentIcon />, path: '/reports/integrated' },
        { text: 'Daily Actions', icon: <TableChartIcon />, path: '/reports/daily-actions' },
        { text: 'Advanced Daily Actions', icon: <TableChartIcon />, path: '/reports/daily-actions/advanced' },
        { text: 'Players Report', icon: <PersonIcon />, path: '/reports/players' },
        { text: 'Games Report', icon: <VideogameAssetIcon />, path: '/reports/games' },
        { text: 'Daily Action Games', icon: <VideogameAssetIcon />, path: '/reports/daily-action-games' },
        { text: 'Financial', icon: <BarChartIcon />, path: '/reports/financial' },
        { text: 'Performance', icon: <TimelineIcon />, path: '/reports/performance' },
        { text: 'Geographic', icon: <PublicIcon />, path: '/reports/geographic' }
      ]
    },
    { text: 'Analytics', icon: <AutoGraphIcon />, path: '/analytics',
      subItems: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/analytics' },
        { text: 'Performance', icon: <TimelineIcon />, path: '/analytics/performance' },
        { text: 'Player Analysis', icon: <PersonIcon />, path: '/analytics/players' },
        { text: 'Game Analysis', icon: <VideogameAssetIcon />, path: '/analytics/games' }
      ]
    },
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
      <Toolbar sx={{ px: 2, height: 128 }}>  {/* Increased height to match page header */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: 100,  /* Increased from 40 to 100 */
              height: 100, /* Increased from 40 to 100 */
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 16,
              userSelect: 'none', // Make unselectable
            }}
          >
            <img
              src="/assets/preplogo.png"
              alt="PPrePorter Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none', // Prevent cursor changes on click
              }}
              draggable="false" // Prevent dragging
            />
          </div>
          <div>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
              PPrePorter
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: -0.5 }}>
              Dashboard
            </Typography>
          </div>
        </div>
      </Toolbar>
      <Divider sx={{ borderColor: (theme) => theme.palette.grey[200], opacity: 0.6 }} />
      <List sx={{ pt: 2, px: 2 }}>
        {mainNavItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                selected={isActiveRoute(item.path)}
                sx={{
                  borderRadius: 0,
                  py: 1,
                  '&.Mui-selected': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '70%',
                      width: '2px',
                      bgcolor: 'primary.main',
                    }
                  },
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.grey[100], 0.6),
                  }
                }}
              >
                <ListItemIcon sx={{
                  color: isActiveRoute(item.path) ? 'primary.main' : 'text.secondary',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: isActiveRoute(item.path) ? 500 : 400,
                    color: isActiveRoute(item.path) ? 'text.primary' : 'text.secondary'
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* Render sub-items if they exist */}
            {item.subItems && isActiveRoute(item.path) && (
              <List disablePadding sx={{ ml: 1, mb: 1 }}>
                {item.subItems.map((subItem) => (
                  <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate(subItem.path);
                        if (isMobile) setMobileOpen(false);
                      }}
                      selected={location.pathname === subItem.path}
                      sx={{
                        pl: 4,
                        py: 0.75,
                        borderRadius: 0,
                        '&.Mui-selected': {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            height: '50%',
                            width: '2px',
                            bgcolor: 'primary.main',
                          }
                        },
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.grey[100], 0.6),
                        }
                      }}
                    >
                      <ListItemIcon sx={{
                        minWidth: 32,
                        color: location.pathname === subItem.path ? 'primary.main' : 'text.secondary'
                      }}>
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={subItem.text}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: location.pathname === subItem.path ? 500 : 400,
                          color: location.pathname === subItem.path ? 'text.primary' : 'text.secondary'
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

  // Use style prop instead of sx to avoid complex union type
  const mainContainerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100%'
  };

  return (
    <div style={mainContainerStyle}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)` },
          ml: { md: `${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          borderRadius: 0,
          zIndex: (theme) => theme.zIndex.drawer - 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          height: 128, // Fixed height for the AppBar (80px + 48px)
        }}
      >
        {/* Upper Toolbar - User info and actions */}
        <Toolbar sx={{ minHeight: 80, height: 80, borderBottom: '1px solid', borderColor: 'divider' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Desktop sidebar toggle */}
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={handleSidebarToggle}
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            <MenuIcon />
          </IconButton>

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary" style={{ marginRight: 8 }}>
              Welcome back,
            </Typography>
            <Typography variant="subtitle1" fontWeight={500} color="text.primary">
              {user?.fullName || user?.username || 'User'}
            </Typography>
          </div>

          {/* Right side actions */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Notification Icon */}
            <Tooltip title="Notifications">
              <IconButton sx={{ mx: 0.5 }} size="small">
                <Badge badgeContent={4} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}>
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Settings Icon */}
            <Tooltip title="Settings">
              <IconButton sx={{ mx: 0.5 }} size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* User Profile */}
            <div style={{ marginLeft: 12 }}>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  style={{ padding: 0 }}
                  aria-controls={userMenuOpen ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen ? 'true' : undefined}
                >
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                    alt={user?.fullName || user?.username || 'User'}
                  >
                    {user?.fullName ? `${user.fullName.split(' ')[0][0]}${user.fullName.split(' ')[1]?.[0] || ''}` :
                     user?.username ? user.username[0].toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </Toolbar>

        {/* Lower Toolbar - Page title and actions */}
        <Toolbar sx={{ minHeight: 48, height: 48 }}>
          <div style={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={500}
              style={{
                display: 'block',
                visibility: 'visible',
                whiteSpace: 'nowrap',
                overflow: 'visible'
              }}
            >
              {location.pathname.includes('daily-actions') ? 'Daily Actions Report' :
               location.pathname.includes('players') && !location.pathname.includes('analytics') ? 'Players Report' :
               location.pathname.includes('games') && !location.pathname.includes('daily-action-games') && !location.pathname.includes('analytics') ? 'Games Report' :
               location.pathname.includes('daily-action-games') ? 'Daily Action Games Report' :
               location.pathname.includes('integrated') ? 'Integrated Reports' :
               location.pathname.includes('analytics') ? 'Analytics Dashboard' :
               'Dashboard'}
            </Typography>
          </div>

          {/* Page-specific actions could go here */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Refresh">
              <IconButton size="small" style={{ marginLeft: 8 }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>

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
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
            mt: 1.5,
            width: 220,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            '& .MuiAvatar-root': {
              width: 28,
              height: 28,
              ml: -0.5,
              mr: 1.5,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'divider',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <div style={{ padding: '12px 16px' }}>
          <Typography variant="subtitle1" style={{ fontWeight: 500 }}>
            {user?.fullName || user?.username || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary" style={{ marginTop: 4 }}>
            {user?.email || ''}
          </Typography>
        </div>
        <Divider sx={{ borderColor: (theme) => theme.palette.grey[100] }} />
        {userMenuItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={item.action}
            sx={{
              py: 1,
              px: 2,
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontSize: '0.9rem' }}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Navigation Drawer */}
      <div
        style={{
          width: drawerWidth,
          flexShrink: 0
        }}
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
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              borderRadius: 0,
              bgcolor: (theme) => theme.palette.background.paper,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarOpen ? drawerWidth : collapsedDrawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              borderRadius: 0,
              bgcolor: (theme) => theme.palette.background.paper,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {sidebarOpen ? drawerContent : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16 }}>
              <div
                style={{
                  width: 60,  /* Increased from 40 to 60 for collapsed sidebar */
                  height: 60, /* Increased from 40 to 60 for collapsed sidebar */
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  userSelect: 'none', // Make unselectable
                  overflow: 'hidden', // Prevent overflow
                }}
              >
                <img
                  src="/assets/preplogo.png"
                  alt="PPrePorter Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none', // Prevent cursor changes on click
                  }}
                  draggable="false" // Prevent dragging
                />
              </div>
              {mainNavItems.map((item) => (
                <Tooltip key={item.text} title={item.text} placement="right">
                  <IconButton
                    onClick={() => {
                      if (item.path) navigate(item.path);
                    }}
                    sx={{
                      my: 1,
                      color: isActiveRoute(item.path) ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </div>
          )}
        </Drawer>
      </div>

      {/* Main Content */}
      <main
        style={{
          flexGrow: 1,
          padding: 0,
          width: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedDrawerWidth}px)`,
          overflow: 'hidden', // Changed from 'auto' to 'hidden'
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
          position: 'relative', // Add position relative
          maxWidth: '100%', // Ensure it doesn't exceed viewport width
        }}
      >
        {/* This adds spacing below the double header (80px + 48px = 128px) */}
        <div style={{ height: 128, flexShrink: 0 }} />

        {/* Content area */}
        <div style={{
          flexGrow: 1,
          width: '100%', // Changed from 'auto' to '100%'
          borderRadius: '16px 0 0 0',  // Round the top-left corner
          backgroundColor: theme.palette.background.paper,
          boxShadow: 'none',
          border: 'none',
          margin: 0,  // Remove margins
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Prevent outer overflow
        }}>
          <div style={{
            padding: 24,
            flexGrow: 1,
            overflow: 'auto', // Enable scrolling on inner content
            width: '100%',
            height: '100%', // Ensure full height
          }}>
            <Outlet /> {/* This renders the current route */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
