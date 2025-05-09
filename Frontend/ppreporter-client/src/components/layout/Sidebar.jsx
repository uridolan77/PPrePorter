import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import CasinoIcon from '@mui/icons-material/Casino';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import SportsIcon from '@mui/icons-material/Sports';
import CampaignIcon from '@mui/icons-material/Campaign';

/**
 * Sidebar navigation component with collapsible sections
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the sidebar is open
 * @param {Function} props.onClose - Function to close the sidebar
 */
const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState({
    reports: false,
    players: false,
    games: false
  });

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < theme.breakpoints.values.md) {
      onClose();
    }
  };

  const handleToggle = (section) => {
    setExpandedItems({
      ...expandedItems,
      [section]: !expandedItems[section]
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawerWidth = 240;

  // Sidebar navigation items
  const navItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      active: isActive('/dashboard')
    },
    {
      label: 'API Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard/api',
      active: isActive('/dashboard/api')
    },
    {
      label: 'Reports',
      icon: <BarChartIcon />,
      children: [
        { label: 'Financial', path: '/reports/financial', active: isActive('/reports/financial') },
        { label: 'Player Activity', path: '/reports/player-activity', active: isActive('/reports/player-activity') },
        { label: 'Game Performance', path: '/reports/game-performance', active: isActive('/reports/game-performance') },
        { label: 'Promotions', path: '/reports/promotions', active: isActive('/reports/promotions') },
      ],
      expanded: expandedItems.reports
    },
    {
      label: 'Players',
      icon: <PeopleIcon />,
      children: [
        { label: 'Player List', path: '/players/list', active: isActive('/players/list') },
        { label: 'Segments', path: '/players/segments', active: isActive('/players/segments') },
        { label: 'Journey Analysis', path: '/players/journey', active: isActive('/players/journey') },
      ],
      expanded: expandedItems.players
    },
    {
      label: 'Games',
      icon: <CasinoIcon />,
      children: [
        { label: 'Casino', path: '/games/casino', active: isActive('/games/casino'), icon: <CasinoIcon fontSize="small" /> },
        { label: 'Sports', path: '/games/sports', active: isActive('/games/sports'), icon: <SportsIcon fontSize="small" /> },
        { label: 'Live', path: '/games/live', active: isActive('/games/live'), icon: <LiveTvIcon fontSize="small" /> },
      ],
      expanded: expandedItems.games
    },
    {
      label: 'Insights',
      icon: <InsightsIcon />,
      path: '/insights',
      active: isActive('/insights')
    },
    {
      label: 'Promotions',
      icon: <CampaignIcon />,
      path: '/promotions',
      active: isActive('/promotions')
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      active: isActive('/settings')
    },
    {
      label: 'Help',
      icon: <HelpIcon />,
      path: '/help',
      active: isActive('/help')
    },
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, height: 64, display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo.png"
          alt="ProgressPlay Logo"
          style={{ height: 40, width: 'auto' }}
          onError={(e) => { e.target.src = '/fallback-logo.png'; }}
        />
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          item.children ? (
            <React.Fragment key={item.label}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleToggle(item.label.toLowerCase())}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.expanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={item.expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.label} disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => handleNavigate(child.path)}
                        selected={child.active}
                      >
                        {child.icon && <ListItemIcon>{child.icon}</ListItemIcon>}
                        <ListItemText primary={child.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={item.active}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;