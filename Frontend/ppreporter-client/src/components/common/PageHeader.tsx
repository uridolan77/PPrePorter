import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';
import { CommonProps } from '../../types/common';

// Component props interface
export interface PageHeaderProps extends CommonProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showBackButton?: boolean;
  backButtonLink?: string;
  onBackButtonClick?: () => void;
  showBreadcrumbs?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  autoBreadcrumbs?: boolean;
  breadcrumbRouteMapping?: Record<string, string>;
  showDivider?: boolean;
  elevated?: boolean;
  icon?: React.ReactNode;
}

/**
 * Page header component with title, description, and actions
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showBackButton = false,
  backButtonLink,
  onBackButtonClick,
  showBreadcrumbs = true,
  breadcrumbItems = [],
  autoBreadcrumbs = true,
  breadcrumbRouteMapping = {},
  showDivider = true,
  elevated = false,
  icon,
  sx
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const handleBackClick = (): void => {
    if (onBackButtonClick) {
      onBackButtonClick();
    } else if (backButtonLink) {
      navigate(backButtonLink);
    } else {
      navigate(-1);
    }
  };
  
  const HeaderContent: React.FC = () => (
    <>
      {showBreadcrumbs && (
        <Breadcrumbs
          items={breadcrumbItems}
          autoGenerate={autoBreadcrumbs}
          routeMapping={breadcrumbRouteMapping}
        />
      )}
      
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {showBackButton && (
            <IconButton 
              onClick={handleBackClick}
              sx={{ mr: 1, ml: -1 }}
              aria-label="back"
              edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          
          {icon && (
            <Box sx={{ mr: 2, display: 'flex' }}>
              {icon}
            </Box>
          )}
          
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'medium' }}>
              {title}
            </Typography>
            
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: isMobile ? 2 : 0 }}>
            {actions}
          </Box>
        )}
      </Box>
      
      {showDivider && <Divider sx={{ mb: 3 }} />}
    </>
  );
  
  if (elevated) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          ...sx
        }}
      >
        <HeaderContent />
      </Paper>
    );
  }
  
  return <Box sx={sx}><HeaderContent /></Box>;
};

export default PageHeader;
