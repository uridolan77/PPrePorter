import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import NetworkGraph, { GraphData } from './NetworkGraph';
import SankeyDiagram, { SankeyData } from './SankeyDiagram';
import Interactive3DChart, { DataPoint3D } from './Interactive3DChart';
import NotificationSystem from '../interactive/NotificationSystem';
import { CollaborativeAnnotationContextProvider } from '../interactive/CollaborativeAnnotationSystem';
import CollaborativeAnnotationDialog from '../interactive/CollaborativeAnnotationDialog';

// Visualization types
export type AdvancedVisualizationType = 'networkGraph' | 'sankeyDiagram' | '3dScatter' | '3dBar' | '3dSurface';

// Advanced visualization container props
interface AdvancedVisualizationContainerProps {
  id: string;
  title: string;
  description?: string;
  type: AdvancedVisualizationType;
  data: any;
  height?: number;
  loading?: boolean;
  error?: string | null;
  enableFullscreen?: boolean;
  enableExport?: boolean;
  enableShare?: boolean;
  enableNotifications?: boolean;
  enableAnnotations?: boolean;
  onExport?: (format: string) => void;
  onShare?: () => void;
}

/**
 * AdvancedVisualizationContainer component
 * A container for advanced visualizations with interactive features
 */
const AdvancedVisualizationContainer: React.FC<AdvancedVisualizationContainerProps> = ({
  id,
  title,
  description,
  type,
  data,
  height = 500,
  loading = false,
  error = null,
  enableFullscreen = true,
  enableExport = true,
  enableShare = true,
  enableNotifications = true,
  enableAnnotations = true,
  onExport,
  onShare
}) => {
  const theme = useTheme();
  
  // State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [annotationDialogOpen, setAnnotationDialogOpen] = useState<boolean>(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  
  // Handle menu open
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);
  
  // Handle menu close
  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);
  
  // Handle export
  const handleExport = useCallback((format: string) => {
    if (onExport) {
      onExport(format);
    } else {
      console.log(`Exporting visualization in ${format} format`);
    }
    
    handleMenuClose();
  }, [onExport, handleMenuClose]);
  
  // Handle share
  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else {
      console.log('Sharing visualization');
    }
    
    handleMenuClose();
  }, [onShare, handleMenuClose]);
  
  // Handle tab change
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);
  
  // Handle data point click
  const handleDataPointClick = useCallback((dataPoint: any) => {
    setSelectedDataPoint(dataPoint);
    
    if (enableAnnotations) {
      setAnnotationDialogOpen(true);
    }
  }, [enableAnnotations]);
  
  // Handle notification click
  const handleNotificationClick = useCallback((notification: any) => {
    // Find the data point associated with the notification
    const dataPointId = notification.dataPointId;
    
    // Open annotation dialog for the data point
    setSelectedDataPoint({ id: dataPointId, label: 'Data Point' });
    setAnnotationDialogOpen(true);
  }, []);
  
  // Render visualization based on type
  const renderVisualization = useCallback(() => {
    switch (type) {
      case 'networkGraph':
        return (
          <NetworkGraph
            id={`${id}-network`}
            title={title}
            description={description}
            data={data as GraphData}
            height={height}
            loading={loading}
            error={error}
            enableNodeSelection={true}
            enableLinkSelection={true}
            enableSearch={true}
            enableFiltering={true}
            enableAnnotations={enableAnnotations}
            onNodeClick={handleDataPointClick}
          />
        );
        
      case 'sankeyDiagram':
        return (
          <SankeyDiagram
            id={`${id}-sankey`}
            title={title}
            description={description}
            data={data as SankeyData}
            height={height}
            loading={loading}
            error={error}
            enableSearch={true}
            enableFiltering={true}
            enableExport={true}
            enableAnnotations={enableAnnotations}
            onNodeClick={handleDataPointClick}
            onLinkClick={handleDataPointClick}
          />
        );
        
      case '3dScatter':
      case '3dBar':
      case '3dSurface':
        return (
          <Interactive3DChart
            id={`${id}-3d`}
            title={title}
            description={description}
            data={data as DataPoint3D[]}
            height={height}
            loading={loading}
            error={error}
            enableRotation={true}
            enableZoom={true}
            enableLabels={true}
            enableGrid={true}
            enableAxes={true}
            enableAnnotations={enableAnnotations}
            chartType={type === '3dScatter' ? '3dScatter' : type === '3dBar' ? '3dBar' : '3dSurface'}
            onPointClick={handleDataPointClick}
          />
        );
        
      default:
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
            <Typography color="text.secondary">Unsupported visualization type</Typography>
          </Box>
        );
    }
  }, [type, id, title, description, data, height, loading, error, enableAnnotations, handleDataPointClick]);
  
  // Get data point label
  const getDataPointLabel = useCallback(() => {
    if (!selectedDataPoint) return 'Data Point';
    
    if (selectedDataPoint.label) {
      return selectedDataPoint.label;
    }
    
    if (selectedDataPoint.name) {
      return selectedDataPoint.name;
    }
    
    if (type === 'networkGraph') {
      return `Node ${selectedDataPoint.id}`;
    }
    
    if (type === 'sankeyDiagram') {
      return `Node ${selectedDataPoint.id}`;
    }
    
    if (type.startsWith('3d')) {
      return `Point (${selectedDataPoint.x}, ${selectedDataPoint.y}, ${selectedDataPoint.z})`;
    }
    
    return `Data Point ${selectedDataPoint.id}`;
  }, [selectedDataPoint, type]);
  
  return (
    <CollaborativeAnnotationContextProvider>
      <Paper
        sx={{
          height: isFullscreen ? '100vh' : height,
          width: isFullscreen ? '100vw' : '100%',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 1300 : 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        elevation={isFullscreen ? 24 : 1}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6">{title}</Typography>
            {description && (
              <Tooltip title={description}>
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notifications */}
            {enableNotifications && (
              <NotificationSystem onNotificationClick={handleNotificationClick} />
            )}
            
            {/* Fullscreen toggle */}
            {enableFullscreen && (
              <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                <IconButton onClick={handleFullscreenToggle}>
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
            )}
            
            {/* More options */}
            {(enableExport || enableShare) && (
              <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            )}
            
            {/* Options menu */}
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              {enableExport && (
                <>
                  <MenuItem onClick={() => handleExport('png')}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as PNG</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('svg')}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as SVG</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleExport('csv')}>
                    <ListItemIcon>
                      <DownloadIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export Data as CSV</ListItemText>
                  </MenuItem>
                </>
              )}
              
              {enableExport && enableShare && <Divider />}
              
              {enableShare && (
                <MenuItem onClick={handleShare}>
                  <ListItemIcon>
                    <ShareIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Share Visualization</ListItemText>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
        
        {/* Tabs for different views (if applicable) */}
        {type.startsWith('3d') && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="visualization tabs">
              <Tab label="3D View" />
              <Tab label="2D Projection" />
              <Tab label="Data Table" />
            </Tabs>
          </Box>
        )}
        
        {/* Visualization */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {renderVisualization()}
        </Box>
        
        {/* Annotation Dialog */}
        {selectedDataPoint && (
          <CollaborativeAnnotationDialog
            open={annotationDialogOpen}
            onClose={() => setAnnotationDialogOpen(false)}
            chartId={id}
            dataPointId={selectedDataPoint.id}
            dataPointLabel={getDataPointLabel()}
          />
        )}
      </Paper>
    </CollaborativeAnnotationContextProvider>
  );
};

export default AdvancedVisualizationContainer;
