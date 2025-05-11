import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Typography,
  Avatar,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

export interface SidebarItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

export interface ModernSidebarProps {
  open: boolean;
  onToggle: () => void;
  width?: number;
  items?: SidebarItem[];
  user?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  logo?: React.ReactNode;
  title?: string;
}

// Default sidebar items if none provided
const defaultItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <AssessmentIcon />,
    children: [
      {
        id: 'players',
        label: 'Players',
        path: '/reports/players'
      },
      {
        id: 'games',
        label: 'Games',
        path: '/reports/games'
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChartIcon />,
    children: [
      {
        id: 'performance',
        label: 'Performance',
        path: '/analytics/performance'
      },
      {
        id: 'statistics',
        label: 'Statistics',
        path: '/analytics/statistics'
      }
    ]
  },
  {
    id: 'players',
    label: 'Players',
    path: '/players',
    icon: <PeopleIcon />
  },
  {
    id: 'games',
    label: 'Games',
    path: '/games',
    icon: <SportsEsportsIcon />
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />
  }
];

/**
 * ModernSidebar component
 * A sidebar with modern styling based on the dashboard image
 */
const ModernSidebar: React.FC<ModernSidebarProps> = ({
  open,
  onToggle,
  width = 240,
  items = defaultItems,
  user = { name: 'User Name', role: 'Admin' },
  logo,
  title = 'PPrePorter'
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Toggle submenu expansion
  const handleToggleSubmenu = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Check if a path is active
  const isActive = (path?: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Check if a parent item should be highlighted (if any child is active)
  const isParentActive = (item: SidebarItem): boolean => {
    if (!item.children) return false;
    return item.children.some(child => isActive(child.path));
  };

  // Render a sidebar item
  const renderItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.path) || isParentActive(item);
    const isExpanded = expandedItems[item.id] || isParentActive(item);

    return (
      <React.Fragment key={item.id}>
        <ListItem 
          disablePadding 
          sx={{ 
            display: 'block',
            pl: level * 2
          }}
        >
          <ListItemButton
            selected={isItemActive}
            onClick={() => {
              if (hasChildren) {
                handleToggleSubmenu(item.id);
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            sx={{
              minHeight: 48,
              px: 2.5,
              borderRadius: '8px',
              mx: 1,
              my: 0.5,
              color: isItemActive ? theme.palette.primary.main : theme.palette.text.primary,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              },
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isItemActive ? theme.palette.primary.main : theme.palette.text.primary,
                }}
              >
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: isItemActive ? 600 : 400,
              }}
            />
            {hasChildren && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map(child => renderItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? width : 72,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: open ? width : 72,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
          border: 'none',
        },
      }}
    >
      {/* Sidebar header with logo and toggle button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding: theme.spacing(2),
          minHeight: 64,
        }}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {logo || (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  mr: 1,
                }}
              >
                P
              </Box>
            )}
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              noWrap
            >
              {title}
            </Typography>
          </Box>
        )}
        
        <IconButton onClick={onToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      
      <Divider />
      
      {/* User profile section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: open ? 'flex-start' : 'center',
          padding: theme.spacing(2),
        }}
      >
        <Avatar
          src={user.avatar}
          alt={user.name}
          sx={{
            width: 40,
            height: 40,
            mb: open ? 1 : 0,
          }}
        />
        
        {open && (
          <>
            <Typography
              variant="subtitle2"
              fontWeight="medium"
              noWrap
            >
              {user.name}
            </Typography>
            
            {user.role && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {user.role}
              </Typography>
            )}
          </>
        )}
      </Box>
      
      <Divider />
      
      {/* Navigation items */}
      <List
        sx={{
          pt: 1,
          pb: 1,
        }}
      >
        {items.map(item => renderItem(item))}
      </List>
    </Drawer>
  );
};

export default ModernSidebar;
