import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { ResponsiveSankey } from '@nivo/sankey';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import {
  fetchPlayerJourneyData,
  clearComponentError
} from '../../store/slices/dashboardSlice';
import {
  PlayerJourneySankeyProps,
  JourneyTypeOption,
  ColorModeOption,
  SankeyNode,
  SankeyLink
} from '../../types/playerJourneySankey';

/**
 * PlayerJourneySankey component for visualizing player flow through the system
 * Uses Sankey diagram to show relationships between different journey stages
 */
const PlayerJourneySankey: React.FC<PlayerJourneySankeyProps> = ({
  height = 600,
  isLoading = false,
  timeFrame = '30d'
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { playerJourneyData, playerJourneyLoading, playerJourneyError } = useSelector((state: any) => state.dashboard);

  const [journeyType, setJourneyType] = useState<string>('acquisition_to_game');
  const [colorMode, setColorMode] = useState<string>('category');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [nodeHovered, setNodeHovered] = useState<string | null>(null);
  const [linkHovered, setLinkHovered] = useState<string | null>(null);

  const availableJourneyTypes: JourneyTypeOption[] = [
    { value: 'acquisition_to_game', label: 'Acquisition to Game Type' },
    { value: 'deposit_to_game', label: 'Deposit Method to Game' },
    { value: 'game_to_churn', label: 'Game Type to Churn Reason' },
    { value: 'country_to_device', label: 'Country to Device Type' },
    { value: 'player_segment_journey', label: 'Player Segment Journey' }
  ];

  const colorModes: ColorModeOption[] = [
    { value: 'category', label: 'By Category' },
    { value: 'value', label: 'By Value' },
    { value: 'source', label: 'By Source' },
    { value: 'target', label: 'By Target' }
  ];

  useEffect(() => {
    if (!playerJourneyData || playerJourneyData.journeyType !== journeyType || playerJourneyData.timeFrame !== timeFrame) {
      dispatch(fetchPlayerJourneyData({
        journeyType,
        timeFrame
      }));
    }
  }, [dispatch, journeyType, timeFrame, playerJourneyData]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      if (playerJourneyError) {
        dispatch(clearComponentError({ component: 'playerJourney' }));
      }
    };
  }, [dispatch, playerJourneyError]);

  const handleJourneyTypeChange = (event: SelectChangeEvent): void => {
    setJourneyType(event.target.value);
  };

  const handleColorModeChange = (event: SelectChangeEvent): void => {
    setColorMode(event.target.value);
  };

  const handleZoomIn = (): void => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = (): void => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = (): void => {
    setZoomLevel(1);
  };

  // Generate node colors based on the selected color mode
  const getNodeColor = (node: SankeyNode): string => {
    const categoryColors: Record<string, string> = {
      // Source categories
      'acquisition': theme.palette.primary.main,
      'deposit': theme.palette.secondary.main,
      'game': theme.palette.success.main,
      'country': theme.palette.info.main,
      'player_segment': theme.palette.warning.main,

      // Target categories
      'game_type': theme.palette.success.light,
      'device': theme.palette.info.light,
      'churn': theme.palette.error.main
    };

    // Extract category from node id (e.g., 'acquisition_social' -> 'acquisition')
    const category = node.id.split('_')[0];

    switch (colorMode) {
      case 'category':
        return categoryColors[category] || theme.palette.grey[500];
      case 'value':
        // Higher value nodes get deeper color
        const maxValue = Math.max(...(playerJourneyData?.nodes || []).map((n: SankeyNode) => n.value));
        const intensity = node.value / maxValue;
        return `rgba(33, 150, 243, ${0.5 + (intensity * 0.5)})`;
      case 'source':
        return node.sourceNodes?.length ? theme.palette.primary.main : theme.palette.secondary.main;
      case 'target':
        return node.targetNodes?.length ? theme.palette.success.main : theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Generate link colors based on the selected color mode
  const getLinkColor = (link: SankeyLink): string | { from: string; to: string } => {
    switch (colorMode) {
      case 'category':
        // Use a gradient based on source and target
        return {
          from: getNodeColor(link.source as SankeyNode),
          to: getNodeColor(link.target as SankeyNode)
        };
      case 'value':
        // Higher value links get deeper color
        const maxValue = Math.max(...(playerJourneyData?.links || []).map((l: SankeyLink) => l.value));
        const intensity = link.value / maxValue;
        return `rgba(33, 150, 243, ${0.2 + (intensity * 0.6)})`;
      case 'source':
        return getNodeColor(link.source as SankeyNode);
      case 'target':
        return getNodeColor(link.target as SankeyNode);
      default:
        return theme.palette.primary.main;
    }
  };

  // Get a human-readable label for nodes
  const getNodeLabel = (node: { id: string }): string => {
    // Replace underscores with spaces and capitalize each word
    const rawId = node.id.split('_').slice(1).join('_');
    return rawId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate node tooltip
  const getNodeTooltip = (node: SankeyNode): React.ReactNode => {
    const numberOfPlayers = node.value.toLocaleString();
    const label = getNodeLabel(node);
    const sourceLinks = node.sourceNodes?.length || 0;
    const targetLinks = node.targetNodes?.length || 0;

    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2">Players: {numberOfPlayers}</Typography>
        <Typography variant="body2">Connections: {sourceLinks + targetLinks}</Typography>
      </Box>
    );
  };

  // Generate link tooltip
  const getLinkTooltip = (link: SankeyLink): React.ReactNode => {
    const numberOfPlayers = link.value.toLocaleString();
    const sourceLabel = getNodeLabel(link.source as SankeyNode);
    const targetLabel = getNodeLabel(link.target as SankeyNode);
    const percentage = ((link.value / (link.source as SankeyNode).value) * 100).toFixed(1);

    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2">{sourceLabel} → {targetLabel}</Typography>
        <Typography variant="body2">Players: {numberOfPlayers}</Typography>
        <Typography variant="body2">Conversion: {percentage}%</Typography>
      </Box>
    );
  };

  // Generate accessible description of the Sankey diagram
  const generateAccessibleDescription = (): string => {
    if (!playerJourneyData || !playerJourneyData.nodes || !playerJourneyData.links) {
      return "No player journey data available";
    }

    const journeyTypeLabel = availableJourneyTypes.find(j => j.value === journeyType)?.label || journeyType;

    // Find the top 3 nodes by value
    const topNodes = [...playerJourneyData.nodes]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(node => `${getNodeLabel(node)} with ${node.value.toLocaleString()} players`);

    // Find the top 3 links by value
    const topLinks = [...playerJourneyData.links]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(link => `${getNodeLabel(link.source as SankeyNode)} to ${getNodeLabel(link.target as SankeyNode)} with ${link.value.toLocaleString()} players`);

    return `${journeyTypeLabel} diagram showing player flow. Top segments include: ${topNodes.join(', ')}. Strongest connections: ${topLinks.join(', ')}.`;
  };

  if (isLoading || playerJourneyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (playerJourneyError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, p: 2 }}>
        <Typography color="error">
          Error loading player journey data: {playerJourneyError}
        </Typography>
      </Box>
    );
  }

  if (!playerJourneyData || !playerJourneyData.nodes || !playerJourneyData.links) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, p: 2 }}>
        <Typography color="text.secondary">
          No player journey data available
        </Typography>
      </Box>
    );
  }

  return (
    <Card elevation={0} sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="div">
            Player Journey Analysis
            <Tooltip title="Visualize player flow patterns through your system">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              size="small"
              startIcon={<FileDownloadIcon />}
              variant="outlined"
            >
              Export Data
            </Button>
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="journey-type-label">Journey Type</InputLabel>
            <Select
              labelId="journey-type-label"
              value={journeyType}
              label="Journey Type"
              onChange={handleJourneyTypeChange}
            >
              {availableJourneyTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="color-mode-label">Color Mode</InputLabel>
            <Select
              labelId="color-mode-label"
              value={colorMode}
              label="Color Mode"
              onChange={handleColorModeChange}
            >
              {colorModes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1, pl: 1 }}>
            <Typography variant="caption" sx={{ mr: 1 }}>
              Zoom:
            </Typography>
            <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleResetZoom}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>

        {/* Screen reader accessible description */}
        <Box sx={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
          role="region"
          aria-label="Player Journey Sankey Diagram">
          {generateAccessibleDescription()}
        </Box>

        <Box
          sx={{
            height: height - 150,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease-out'
          }}
        >
          <ResponsiveSankey
            data={{
              nodes: playerJourneyData.nodes,
              links: playerJourneyData.links
            }}
            margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
            align="justify"
            colors={(node: any) => getNodeColor(node)}
            nodeOpacity={1}
            nodeHoverOpacity={0.8}
            nodeHoverOthersOpacity={0.3}
            nodeThickness={18}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderRadius={3}
            linkOpacity={0.5}
            linkHoverOpacity={0.8}
            linkHoverOthersOpacity={0.1}
            linkContract={3}
            enableLinkGradient={colorMode === 'category'}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
            animate={true}
            motionConfig="gentle"
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                translateX: 130,
                itemWidth: 100,
                itemHeight: 14,
                itemDirection: 'right-to-left',
                itemsSpacing: 2,
                itemTextColor: '#999',
                symbolSize: 14,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#000'
                    }
                  }
                ]
              }
            ]}
            tooltip={({ node, link }: any) => {
              if (node) {
                return getNodeTooltip(node);
              }
              if (link) {
                return getLinkTooltip(link);
              }
              return null;
            }}
            onClick={(data: any) => {
              console.log('Clicked:', data);
            }}
            onMouseEnter={(data: any, event: any) => {
              if (data.node) {
                setNodeHovered(data.node.id);
              } else if (data.link) {
                setLinkHovered(`${data.link.source.id}-${data.link.target.id}`);
              }
            }}
            onMouseLeave={() => {
              setNodeHovered(null);
              setLinkHovered(null);
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Insights
          </Typography>
          {nodeHovered ? (
            <Typography variant="body2">
              {getNodeLabel({ id: nodeHovered })} accounts for {
                playerJourneyData.nodes.find((n: SankeyNode) => n.id === nodeHovered)?.value.toLocaleString()
              } players in your journey.
            </Typography>
          ) : linkHovered ? (
            <Typography variant="body2">
              The selected path represents a significant transition in the player journey.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Hover over nodes or connections to see detailed insights about your player journey.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlayerJourneySankey;