import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box, useTheme } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

/**
 * Breadcrumbs navigation component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of breadcrumb items (optional if autoGenerate is true)
 * @param {boolean} props.autoGenerate - Whether to automatically generate breadcrumbs from the current route
 * @param {Object} props.routeMapping - Mapping of route paths to readable names (for autoGenerate mode)
 */
const Breadcrumbs = ({
  items = [],
  autoGenerate = false,
  routeMapping = {},
}) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Generate breadcrumb items from the current route if autoGenerate is true
  const breadcrumbItems = React.useMemo(() => {
    if (!autoGenerate) return items;
    
    const defaultRouteMapping = {
      '': 'Home',
      'dashboard': 'Dashboard',
      'reports': 'Reports',
      'players': 'Players',
      'games': 'Games',
      'insights': 'Insights',
      'settings': 'Settings',
      'help': 'Help',
      ...routeMapping
    };
    
    // Split the pathname into segments
    const pathnameParts = location.pathname.split('/').filter(Boolean);
    
    if (pathnameParts.length === 0) {
      return [{ name: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> }];
    }
    
    const generatedItems = [
      { name: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> }
    ];
    
    let currentPath = '';
    
    // Build breadcrumb items from path segments
    pathnameParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === pathnameParts.length - 1;
      
      const name = defaultRouteMapping[part] || 
                  part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      
      generatedItems.push({
        name,
        path: isLast ? null : currentPath,
      });
    });
    
    return generatedItems;
  }, [autoGenerate, items, location.pathname, routeMapping]);

  return (
    <Box 
      sx={{ 
        py: 1, 
        px: 0,
        mb: 2
      }}
    >
      <MuiBreadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          // Display just text for the current/last item
          if (isLast || !item.path) {
            return (
              <Typography 
                key={index} 
                color="text.primary" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 'medium'
                }}
              >
                {item.icon && (
                  <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                )}
                {item.name}
              </Typography>
            );
          }
          
          // Display link for navigable items
          return (
            <Link
              key={index}
              component={RouterLink}
              underline="hover"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
              color="inherit"
              to={item.path}
            >
              {item.icon && (
                <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
              )}
              {item.name}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;