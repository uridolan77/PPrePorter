import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Collapse,
  Button
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVert as MoreVertIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  InfoOutlined as InfoOutlinedIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Dashboard as DashboardIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import CasinoRevenueChart from './CasinoRevenueChart';
import PlayerRegistrationsChart from './PlayerRegistrationsChart';
import TopGamesChart from './TopGamesChart';
import MultiDimensionalRadarChart from './MultiDimensionalRadarChart';
import EnhancedDataTable from './EnhancedDataTable';
import { MicroSparkline, MicroBarChart } from './MicroCharts';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

/**
 * AdaptiveDashboard component
 * Provides a customizable, accessible dashboard with responsive design
 * Features universal design principles for various user needs
 */
const AdaptiveDashboard = ({
  data = {},
  isLoading = false,
  onRefresh = () => {},
  onExport = () => {},
  onConfigChange = () => {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef(null);
  
  // Dashboard configuration state
  const [dashConfig, setDashConfig] = useState({
    layout: 'grid', // grid, list
    density: 'comfortable', // comfortable, compact
    highContrast: false,
    animations: true,
    fullscreenWidget: null,
    visibleWidgets: [
      'revenue', 
      'registrations', 
      'topGames', 
      'playerAnalysis',
      'recentActivity'
    ],
    widgetPreferences: {
      // Specific widget preferences (chart types, etc.)
    }
  });
  
  // Menu state
  const [widgetMenuAnchor, setWidgetMenuAnchor] = useState(null);
  const [activeWidgetId, setActiveWidgetId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // List of available widgets
  const availableWidgets = [
    { id: 'revenue', label: 'Revenue Overview', icon: <DashboardIcon /> },
    { id: 'registrations', label: 'Player Registrations', icon: <DashboardIcon /> },
    { id: 'topGames', label: 'Top Games', icon: <DashboardIcon /> },
    { id: 'playerAnalysis', label: 'Player Analysis', icon: <DashboardIcon /> },
    { id: 'recentActivity', label: 'Recent Activity', icon: <DashboardIcon /> }
  ];
  
  // Handle layout change
  const handleLayoutChange = (newLayout) => {
    setDashConfig(prev => ({
      ...prev,
      layout: newLayout
    }));
  };
  
  // Handle density change
  const handleDensityChange = (newDensity) => {
    setDashConfig(prev => ({
      ...prev,
      density: newDensity
    }));
  };
  
  // Handle widget menu open
  const handleWidgetMenuOpen = (event, widgetId) => {
    setWidgetMenuAnchor(event.currentTarget);
    setActiveWidgetId(widgetId);
  };
  
  // Handle widget menu close
  const handleWidgetMenuClose = () => {
    setWidgetMenuAnchor(null);
    setActiveWidgetId(null);
  };
  
  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId) => {
    setDashConfig(prev => {
      const visibleWidgets = [...prev.visibleWidgets];
      const index = visibleWidgets.indexOf(widgetId);
      
      if (index > -1) {
        visibleWidgets.splice(index, 1);
      } else {
        visibleWidgets.push(widgetId);
      }
      
      return {
        ...prev,
        visibleWidgets
      };
    });
    
    handleWidgetMenuClose();
  };
  
  // Toggle fullscreen for a widget
  const toggleFullscreen = (widgetId) => {
    setDashConfig(prev => ({
      ...prev,
      fullscreenWidget: prev.fullscreenWidget === widgetId ? null : widgetId
    }));
    
    handleWidgetMenuClose();
  };
  
  // Apply design tokens based on current settings
  const getDesignTokens = () => {
    return {
      spacing: dashConfig.density === 'compact' ? 1 : 2,
      borderRadius: dashConfig.density === 'compact' ? 1 : theme.shape.borderRadius,
      textSizeAdjust: dashConfig.density === 'compact' ? 0.9 : 1,
      contrast: dashConfig.highContrast ? 'high' : 'normal'
    };
  };
  
  // Get widget grid sizing based on layout and screen size
  const getWidgetGridSize = (widgetId) => {
    // Default sizes for different layouts and screen sizes
    const sizeMappings = {
      grid: {
        revenue: { xs: 12, sm: 12, md: 8, lg: 8 },
        registrations: { xs: 12, sm: 12, md: 4, lg: 4 },
        topGames: { xs: 12, sm: 12, md: 6, lg: 6 },
        playerAnalysis: { xs: 12, sm: 12, md: 6, lg: 6 },
        recentActivity: { xs: 12, sm: 12, md: 12, lg: 12 }
      },
      list: {
        // In list layout, all widgets take full width
        revenue: { xs: 12, sm: 12, md: 12, lg: 12 },
        registrations: { xs: 12, sm: 12, md: 12, lg: 12 },
        topGames: { xs: 12, sm: 12, md: 12, lg: 12 },
        playerAnalysis: { xs: 12, sm: 12, md: 12, lg: 12 },
        recentActivity: { xs: 12, sm: 12, md: 12, lg: 12 }
      }
    };
    
    return sizeMappings[dashConfig.layout][widgetId] || { xs: 12 };
  };
  
  // Apply widget title with accessibility features
  const WidgetTitle = ({ title, widgetId, helpText }) => (
    <Box 
      component="div" 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: getDesignTokens().spacing,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography 
          variant={dashConfig.density === 'compact' ? 'subtitle1' : 'h6'} 
          component="h2"
          sx={{ 
            fontSize: `calc(1rem * ${getDesignTokens().textSizeAdjust})`,
            fontWeight: 'medium'
          }}
        >
          {title}
        </Typography>
        
        {helpText && (
          <Tooltip title={helpText} arrow>
            <IconButton size="small" sx={{ ml: 0.5 }} aria-label={`Information about ${title}`}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <IconButton 
        size="small" 
        onClick={(e) => handleWidgetMenuOpen(e, widgetId)}
        aria-label={`Options for ${title}`}
        aria-haspopup="true"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
  
  // Render the widget content based on ID
  const renderWidgetContent = (widgetId) => {
    const isFullscreen = dashConfig.fullscreenWidget === widgetId;
    const designTokens = getDesignTokens();
    
    switch (widgetId) {
      case 'revenue':
        return (
          <CasinoRevenueChart 
            data={data.revenueData} 
            isLoading={isLoading} 
            height={isFullscreen ? 500 : 300}
          />
        );
        
      case 'registrations':
        return (
          <PlayerRegistrationsChart 
            data={data.registrationsData} 
            isLoading={isLoading}
            height={isFullscreen ? 500 : 300}
          />
        );
        
      case 'topGames':
        return (
          <TopGamesChart 
            data={data.topGamesData} 
            isLoading={isLoading}
            height={isFullscreen ? 500 : 300}
          />
        );
        
      case 'playerAnalysis':
        return (
          <MultiDimensionalRadarChart
            data={data.playerSegmentData || []}
            title=""
            isLoading={isLoading}
            metrics={[
              { id: 'deposits', label: 'Deposits', format: 'currency' },
              { id: 'withdrawals', label: 'Withdrawals', format: 'currency' },
              { id: 'bets', label: 'Bets', format: 'currency' },
              { id: 'wins', label: 'Wins', format: 'currency' },
              { id: 'activeGames', label: 'Active Games', format: 'number' },
              { id: 'timeSpent', label: 'Time Spent', format: 'number' },
              { id: 'conversionRate', label: 'Conversion Rate', format: 'percentage' },
              { id: 'retention', label: 'Retention', format: 'percentage' }
            ]}
            entities={[
              { id: 'highRollers', label: 'High Rollers', color: theme.palette.primary.main },
              { id: 'casual', label: 'Casual Players', color: theme.palette.secondary.main },
              { id: 'new', label: 'New Players', color: theme.palette.success.main },
              { id: 'inactive', label: 'Inactive Players', color: theme.palette.warning.main }
            ]}
          />
        );
        
      case 'recentActivity':
        return (
          <EnhancedDataTable
            title=""
            data={data.recentActivityData || []}
            isLoading={isLoading}
            columns={[
              { id: 'timestamp', label: 'Time', type: 'datetime' },
              { id: 'playerId', label: 'Player', type: 'text' },
              { id: 'action', label: 'Action', type: 'text' },
              { id: 'amount', label: 'Amount', type: 'currency', align: 'right' },
              { id: 'change', label: 'Trend', type: 'sparkline', align: 'center', sortable: false },
              { id: 'status', label: 'Status', type: 'status', align: 'center' }
            ]}
            maxHeight={isFullscreen ? '500px' : '300px'}
          />
        );
        
      default:
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <Typography variant="body2" color="text.secondary">
              Widget content not available
            </Typography>
          </Box>
        );
    }
  };
  
  // Get widget container props
  const getWidgetContainerProps = (widgetId) => {
    const isFullscreen = dashConfig.fullscreenWidget === widgetId;
    const tokens = getDesignTokens();
    
    return {
      component: motion.div,
      layout: true,
      initial: dashConfig.animations ? { opacity: 0, y: 20 } : false,
      animate: dashConfig.animations ? { opacity: 1, y: 0 } : false,
      exit: dashConfig.animations ? { opacity: 0, scale: 0.9 } : false,
      transition: { duration: 0.3 },
      sx: {
        padding: tokens.spacing,
        borderRadius: tokens.borderRadius,
        boxShadow: isFullscreen ? theme.shadows[3] : theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        ...(isFullscreen && {
          position: 'fixed',
          top: '5%',
          left: '5%',
          width: '90%',
          height: '90%',
          zIndex: 1200,
          backgroundColor: theme.palette.background.paper,
          overflow: 'auto'
        })
      }
    };
  };
  
  // Apply high contrast mode if enabled
  const themeStyles = dashConfig.highContrast ? {
    palette: {
      text: {
        primary: '#ffffff',
        secondary: '#eeeeee'
      },
      background: {
        paper: '#272727',
        default: '#121212'
      },
      divider: 'rgba(255, 255, 255, 0.2)'
    },
    typography: {
      allVariants: {
        fontWeight: 500
      }
    }
  } : {};
  
  // Generate sample data if needed
  const generateSampleData = () => {
    // Generate trend data for each row in recent activity
    if (data.recentActivityData) {
      data.recentActivityData = data.recentActivityData.map(item => {
        if (!item.trendData) {
          // Generate sample trend data for the sparkline
          item.trendData = Array(7).fill().map((_, i) => ({
            value: Math.random() * 100 + 50
          }));
        }
        return item;
      });
    }
  };
  
  useEffect(() => {
    // Call generateSampleData on initial load if needed
    if (data && !isLoading) {
      generateSampleData();
    }
    
    // Notify parent of configuration changes
    onConfigChange(dashConfig);
  }, [dashConfig, data, isLoading]);
  
  // Render a loading state if data is loading
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, height: 400 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  
  return (
    <Box 
      ref={containerRef}
      sx={{ 
        ...themeStyles,
        width: '100%',
        transition: 'all 0.3s ease',
        px: dashConfig.density === 'compact' ? 1 : 2 
      }}
    >
      {/* Dashboard header with controls */}
      <Box sx={{ 
        mb: getDesignTokens().spacing,
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Box>
          <Typography 
            variant="h5" 
            component="h1"
            sx={{ 
              mb: 0.5,
              fontSize: `calc(1.25rem * ${getDesignTokens().textSizeAdjust})`,
              fontWeight: dashConfig.highContrast ? 700 : 600
            }}
          >
            Dashboard Overview
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              fontSize: `calc(0.875rem * ${getDesignTokens().textSizeAdjust})`,
            }}
          >
            Updated {new Date().toLocaleDateString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={onRefresh} aria-label="Refresh dashboard data">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Dashboard settings">
            <IconButton 
              onClick={() => setSettingsOpen(prev => !prev)}
              aria-label="Dashboard settings"
              aria-expanded={settingsOpen ? 'true' : 'false'}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export dashboard">
            <IconButton onClick={onExport} aria-label="Export dashboard data">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Dashboard settings panel */}
      <Collapse in={settingsOpen}>
        <Paper 
          sx={{ 
            p: 2, 
            mb: 2,
            borderRadius: getDesignTokens().borderRadius
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>Dashboard Settings</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" gutterBottom>Layout</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant={dashConfig.layout === 'grid' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleLayoutChange('grid')}
                >
                  Grid
                </Button>
                <Button 
                  variant={dashConfig.layout === 'list' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleLayoutChange('list')}
                >
                  List
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" gutterBottom>Density</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant={dashConfig.density === 'comfortable' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleDensityChange('comfortable')}
                >
                  Comfortable
                </Button>
                <Button 
                  variant={dashConfig.density === 'compact' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleDensityChange('compact')}
                >
                  Compact
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={dashConfig.highContrast}
                    onChange={(e) => setDashConfig(prev => ({ ...prev, highContrast: e.target.checked }))}
                  />
                }
                label="High contrast"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={dashConfig.animations}
                    onChange={(e) => setDashConfig(prev => ({ ...prev, animations: e.target.checked }))}
                  />
                }
                label="Animations"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Visible Widgets</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableWidgets.map(widget => (
                  <Button
                    key={widget.id}
                    variant={dashConfig.visibleWidgets.includes(widget.id) ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={dashConfig.visibleWidgets.includes(widget.id) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    onClick={() => toggleWidgetVisibility(widget.id)}
                  >
                    {widget.label}
                  </Button>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
      
      {/* Dashboard widgets */}
      <AnimatePresence>
        <Grid container spacing={dashConfig.density === 'compact' ? 1 : 2}>
          {availableWidgets.filter(widget => dashConfig.visibleWidgets.includes(widget.id)).map(widget => {
            const widgetSizes = getWidgetGridSize(widget.id);
            
            // Skip rendering widgets that are not currently visible
            if (!dashConfig.visibleWidgets.includes(widget.id) && dashConfig.fullscreenWidget !== widget.id) {
              return null;
            }
            
            // If we're in fullscreen mode, only render the fullscreen widget
            if (dashConfig.fullscreenWidget && dashConfig.fullscreenWidget !== widget.id) {
              return null;
            }
            
            return (
              <Grid 
                item 
                key={widget.id} 
                {...widgetSizes}
                sx={{ 
                  display: dashConfig.fullscreenWidget && dashConfig.fullscreenWidget !== widget.id ? 'none' : 'block',
                }}
              >
                <Paper {...getWidgetContainerProps(widget.id)}>
                  <WidgetTitle 
                    title={widget.label} 
                    widgetId={widget.id} 
                    helpText={`View ${widget.label.toLowerCase()} data`}
                  />
                  <Box sx={{ 
                    height: dashConfig.fullscreenWidget === widget.id ? 'calc(100% - 40px)' : 'auto',
                  }}>
                    {renderWidgetContent(widget.id)}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </AnimatePresence>
      
      {/* Widget options menu */}
      <Menu
        anchorEl={widgetMenuAnchor}
        open={Boolean(widgetMenuAnchor)}
        onClose={handleWidgetMenuClose}
        PaperProps={{
          elevation: 2,
          sx: { width: 200 },
        }}
      >
        <MenuItem onClick={() => toggleFullscreen(activeWidgetId)}>
          <ListItemIcon>
            {dashConfig.fullscreenWidget === activeWidgetId ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {dashConfig.fullscreenWidget === activeWidgetId ? 'Exit Fullscreen' : 'Fullscreen'}
          </ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => toggleWidgetVisibility(activeWidgetId)}>
          <ListItemIcon>
            <VisibilityOffIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hide Widget</ListItemText>
        </MenuItem>
        
        <MenuItem>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Widget</ListItemText>
        </MenuItem>
        
        <MenuItem>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Refresh Data</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdaptiveDashboard;