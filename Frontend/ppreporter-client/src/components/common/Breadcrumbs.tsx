import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box, useTheme } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { CommonProps } from '../../types/common';

// Breadcrumb item interface
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

// Component props interface
export interface BreadcrumbsProps extends CommonProps {
  items?: BreadcrumbItem[];
  autoGenerate?: boolean;
  routeMapping?: Record<string, string>;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
}

/**
 * Breadcrumbs navigation component
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items = [],
  autoGenerate = false,
  routeMapping = {},
  showHomeIcon = true,
  separator = <NavigateNextIcon fontSize="small" />,
  maxItems = 8,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
  sx
}) => {
  const theme = useTheme();
  const location = useLocation();
  
  // Generate breadcrumbs from current route if autoGenerate is true
  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    if (!autoGenerate) {
      return items;
    }
    
    const pathnames = location.pathname.split('/').filter(x => x);
    
    // Start with home
    const generatedItems: BreadcrumbItem[] = [
      { label: 'Home', path: '/', icon: <HomeIcon fontSize="small" /> }
    ];
    
    // Add each path segment
    let currentPath = '';
    pathnames.forEach((segment) => {
      currentPath += `/${segment}`;
      
      // Get readable name from mapping or capitalize the segment
      const label = routeMapping[segment] || 
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      generatedItems.push({
        label,
        path: currentPath
      });
    });
    
    return generatedItems;
  }, [autoGenerate, items, location.pathname, routeMapping]);
  
  return (
    <Box sx={{ mb: 2, ...sx }}>
      <MuiBreadcrumbs
        separator={separator}
        aria-label="breadcrumb"
        maxItems={maxItems}
        itemsBeforeCollapse={itemsBeforeCollapse}
        itemsAfterCollapse={itemsAfterCollapse}
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          // Last item is current page (not clickable)
          if (isLast) {
            return (
              <Typography
                key={item.label}
                color="text.primary"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 'medium'
                }}
              >
                {item.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                )}
                {item.label}
              </Typography>
            );
          }
          
          // Other items are links
          return (
            <Link
              key={item.label}
              component={RouterLink}
              to={item.path || '#'}
              color="inherit"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {item.icon && (
                <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </Box>
              )}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
