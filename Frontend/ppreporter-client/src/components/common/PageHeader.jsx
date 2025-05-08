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
import Breadcrumbs from './Breadcrumbs';

/**
 * Page header component with title, description, and actions
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Optional page subtitle or description
 * @param {React.ReactNode} props.actions - Action buttons to display
 * @param {boolean} props.showBackButton - Whether to show back button
 * @param {string} props.backButtonLink - Link for back button
 * @param {Function} props.onBackButtonClick - Callback for back button click
 * @param {boolean} props.showBreadcrumbs - Whether to show breadcrumbs
 * @param {Array} props.breadcrumbItems - Breadcrumb items when not auto-generated
 * @param {boolean} props.autoBreadcrumbs - Whether to auto-generate breadcrumbs
 * @param {Object} props.breadcrumbRouteMapping - Route mapping for auto-generated breadcrumbs
 * @param {boolean} props.showDivider - Whether to show divider below header
 * @param {boolean} props.elevated - Whether to show header with elevation
 * @param {React.ReactNode} props.icon - Optional icon to display next to title
 */
const PageHeader = ({
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
  icon
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    if (onBackButtonClick) {
      onBackButtonClick();
    } else if (backButtonLink) {
      navigate(backButtonLink);
    } else {
      navigate(-1);
    }
  };
  
  const HeaderContent = () => (
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
          borderRadius: 2 
        }}
      >
        <HeaderContent />
      </Paper>
    );
  }
  
  return <HeaderContent />;
};

export default PageHeader;