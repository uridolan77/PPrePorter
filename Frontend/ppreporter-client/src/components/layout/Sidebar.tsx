import React, { useState } from 'react';
import {
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
import { CommonProps } from '../../types/common';
import SimpleBox from '../common/SimpleBox';
import { createSx } from '../../utils/styleUtils';

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

// Type definitions
interface ExpandedItems {
  [key: string]: boolean;
}

interface NavItemChild {
  label: string;
  path: string;
  active: boolean;
  icon?: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  active?: boolean;
  children?: NavItemChild[];
  expanded?: boolean;
}

export interface SidebarProps extends CommonProps {
  /**
   * Whether the sidebar is open
   */
  open: boolean;

  /**
   * Function to close the sidebar
   */
  onClose: () => void;
}

/**
 * Sidebar navigation component with collapsible sections
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onClose, sx }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<ExpandedItems>({
    reports: true,
    players: false,
    games: false
  });

  const handleNavigate = (path: string): void => {
    navigate(path);
    if (window.innerWidth < theme.breakpoints.values.md) {
      onClose();
    }
  };

  const handleToggle = (section: string): void => {
    setExpandedItems({
      ...expandedItems,
      [section]: !expandedItems[section]
    });
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const drawerWidth = 240;

  // Sidebar navigation items
  const navItems: NavItem[] = [
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
        { label: 'Performance', path: '/reports/performance', active: isActive('/reports/performance') },
        { label: 'Geographic', path: '/reports/geographic', active: isActive('/reports/geographic') },
        { label: 'Daily Actions', path: '/reports/daily-action-games', active: isActive('/reports/daily-action-games') },
        { label: 'Integrated', path: '/reports/integrated', active: isActive('/reports/integrated') },
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
    <SimpleBox>
      <SimpleBox sx={createSx({ p: 2, height: 64, display: 'flex', alignItems: 'center' })}>
        <img
          src="/logo.png"
          alt="ProgressPlay Logo"
          style={{ height: 40, width: 'auto' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/fallback-logo.png';
          }}
        />
      </SimpleBox>
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
                onClick={() => item.path && handleNavigate(item.path)}
                selected={item.active}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </SimpleBox>
  );

  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={createSx({
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
        ...sx
      })}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
