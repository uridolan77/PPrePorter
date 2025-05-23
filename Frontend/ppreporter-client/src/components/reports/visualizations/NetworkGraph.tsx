import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Slider,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ForceGraph2D from 'react-force-graph-2d';
import { useAnnotationContext } from '../interactive/AnnotationSystem';
import SimpleBox from '../../common/SimpleBox';

// Node interface
export interface GraphNode {
  id: string;
  name: string;
  group?: string;
  value?: number;
  color?: string;
  [key: string]: any;
}

// Link interface
export interface GraphLink {
  source: string;
  target: string;
  value?: number;
  label?: string;
  color?: string;
  [key: string]: any;
}

// Graph data interface
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Network graph props
interface NetworkGraphProps {
  id: string;
  title: string;
  description?: string;
  data: GraphData;
  height?: number;
  loading?: boolean;
  error?: string | null;
  nodeColorBy?: string;
  linkColorBy?: string;
  nodeSizeBy?: string;
  linkSizeBy?: string;
  groupBy?: string;
  enableZoom?: boolean;
  enableDrag?: boolean;
  enableNodeSelection?: boolean;
  enableLinkSelection?: boolean;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableAnnotations?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onLinkClick?: (link: GraphLink) => void;
}

/**
 * NetworkGraph component
 * A force-directed graph visualization
 */
const NetworkGraph: React.FC<NetworkGraphProps> = ({
  id,
  title,
  description,
  data,
  height = 500,
  loading = false,
  error = null,
  nodeColorBy = 'group',
  linkColorBy = 'value',
  nodeSizeBy = 'value',
  linkSizeBy = 'value',
  groupBy = 'group',
  enableZoom = true,
  enableDrag = true,
  enableNodeSelection = true,
  enableLinkSelection = true,
  enableSearch = true,
  enableFiltering = true,
  enableAnnotations = true,
  onNodeClick,
  onLinkClick
}) => {
  const theme = useTheme();
  const { addAnnotation, getAnnotationsForDataPoint } = useAnnotationContext();

  // Refs
  const graphRef = useRef<any>(null);

  // State
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedLink, setSelectedLink] = useState<GraphLink | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [nodeValueRange, setNodeValueRange] = useState<[number, number]>([0, 100]);
  const [linkValueRange, setLinkValueRange] = useState<[number, number]>([0, 100]);

  // Process data
  useEffect(() => {
    if (!data || !data.nodes || !data.links) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    // Process nodes
    const processedNodes = data.nodes.map(node => ({
      ...node,
      // Add default values if missing
      value: node.value !== undefined ? node.value : 1,
      group: node.group || 'default'
    }));

    // Process links
    const processedLinks = data.links.map(link => ({
      ...link,
      // Add default values if missing
      value: link.value !== undefined ? link.value : 1,
      // Generate a unique ID for each link
      id: `${link.source}-${link.target}-${Math.random().toString(36).substring(2, 9)}`
    }));

    setGraphData({ nodes: processedNodes, links: processedLinks });

    // Extract groups
    const uniqueGroups = Array.from(new Set(processedNodes.map(node => node.group || 'default')));
    setGroups(uniqueGroups);
    setSelectedGroups(uniqueGroups);

    // Calculate value ranges
    const nodeValues = processedNodes.map(node => node.value || 0);
    const linkValues = processedLinks.map(link => link.value || 0);

    setNodeValueRange([
      Math.min(...nodeValues),
      Math.max(...nodeValues)
    ]);

    setLinkValueRange([
      Math.min(...linkValues),
      Math.max(...linkValues)
    ]);
  }, [data]);

  // Filter data based on search and filters
  const filteredData = useCallback(() => {
    if (!graphData.nodes.length) return { nodes: [], links: [] };

    // Filter nodes by search term
    let filteredNodes = graphData.nodes;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(node =>
        node.name.toLowerCase().includes(term) ||
        node.id.toLowerCase().includes(term)
      );
    }

    // Filter nodes by selected groups
    if (selectedGroups.length) {
      filteredNodes = filteredNodes.filter(node =>
        selectedGroups.includes(node.group || 'default')
      );
    }

    // Filter nodes by value range
    filteredNodes = filteredNodes.filter(node =>
      (node.value || 0) >= nodeValueRange[0] &&
      (node.value || 0) <= nodeValueRange[1]
    );

    // Get filtered node IDs
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));

    // Filter links that connect filtered nodes
    let filteredLinks = graphData.links.filter(link =>
      filteredNodeIds.has(link.source as string) &&
      filteredNodeIds.has(link.target as string)
    );

    // Filter links by value range
    filteredLinks = filteredLinks.filter(link =>
      (link.value || 0) >= linkValueRange[0] &&
      (link.value || 0) <= linkValueRange[1]
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchTerm, selectedGroups, nodeValueRange, linkValueRange]);

  // Handle node click
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);

    // Highlight connected nodes and links
    const connectedLinks = graphData.links.filter(link =>
      link.source === node.id || link.target === node.id
    );

    const connectedNodes = new Set<string>();
    connectedNodes.add(node.id);

    connectedLinks.forEach(link => {
      connectedNodes.add(link.source as string);
      connectedNodes.add(link.target as string);
    });

    setHighlightNodes(connectedNodes);
    setHighlightLinks(new Set(connectedLinks.map(link => link.id as string)));

    // Call custom handler if provided
    if (onNodeClick) {
      onNodeClick(node);
    }
  }, [graphData.links, onNodeClick]);

  // Handle link click
  const handleLinkClick = useCallback((link: GraphLink) => {
    setSelectedLink(link);

    // Highlight connected nodes
    const connectedNodes = new Set<string>();
    connectedNodes.add(link.source as string);
    connectedNodes.add(link.target as string);

    setHighlightNodes(connectedNodes);
    setHighlightLinks(new Set([link.id as string]));

    // Call custom handler if provided
    if (onLinkClick) {
      onLinkClick(link);
    }
  }, [onLinkClick]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.2, 400);
      setZoomLevel(currentZoom * 1.2);
    }
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom / 1.2, 400);
      setZoomLevel(currentZoom / 1.2);
    }
  }, []);

  // Handle reset view
  const handleResetView = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
      setZoomLevel(1);
      setSelectedNode(null);
      setSelectedLink(null);
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
    }
  }, []);

  // Handle search
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // Handle group selection
  const handleGroupSelection = useCallback((event: SelectChangeEvent<string[]>) => {
    setSelectedGroups(event.target.value as string[]);
  }, []);

  // Handle node value range change
  const handleNodeValueRangeChange = useCallback((event: Event, newValue: number | number[]) => {
    setNodeValueRange(newValue as [number, number]);
  }, []);

  // Handle link value range change
  const handleLinkValueRangeChange = useCallback((event: Event, newValue: number | number[]) => {
    setLinkValueRange(newValue as [number, number]);
  }, []);

  // Node color accessor
  const getNodeColor = useCallback((node: GraphNode) => {
    if (highlightNodes.size && !highlightNodes.has(node.id)) {
      return alpha(theme.palette.text.disabled, 0.3);
    }

    if (node.color) return node.color;

    if (nodeColorBy === 'group') {
      const groupIndex = groups.indexOf(node.group || 'default');
      const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main
      ];
      return colors[groupIndex % colors.length];
    }

    return theme.palette.primary.main;
  }, [highlightNodes, nodeColorBy, groups, theme]);

  // Link color accessor
  const getLinkColor = useCallback((link: GraphLink) => {
    if (highlightLinks.size && !highlightLinks.has(link.id as string)) {
      return alpha(theme.palette.text.disabled, 0.1);
    }

    if (link.color) return link.color;

    if (linkColorBy === 'value') {
      const value = link.value || 1;
      const min = linkValueRange[0];
      const max = linkValueRange[1];
      const normalized = (value - min) / (max - min);

      return `rgba(${Math.round(normalized * 255)}, ${Math.round((1 - normalized) * 255)}, 150, 0.8)`;
    }

    return theme.palette.text.secondary;
  }, [highlightLinks, linkColorBy, linkValueRange, theme]);

  // Node size accessor
  const getNodeSize = useCallback((node: GraphNode) => {
    if (nodeSizeBy === 'value') {
      const value = node.value || 1;
      const min = nodeValueRange[0];
      const max = nodeValueRange[1];
      const normalized = (value - min) / (max - min);

      return 4 + normalized * 12;
    }

    return 6;
  }, [nodeSizeBy, nodeValueRange]);

  // Link width accessor
  const getLinkWidth = useCallback((link: GraphLink) => {
    if (linkSizeBy === 'value') {
      const value = link.value || 1;
      const min = linkValueRange[0];
      const max = linkValueRange[1];
      const normalized = (value - min) / (max - min);

      return 1 + normalized * 4;
    }

    return 1.5;
  }, [linkSizeBy, linkValueRange]);

  // Node label accessor
  const getNodeLabel = useCallback((node: GraphNode) => {
    return `${node.name}\n${node.group ? `Group: ${node.group}` : ''}\n${node.value ? `Value: ${node.value}` : ''}`;
  }, []);

  // Link label accessor
  const getLinkLabel = useCallback((link: GraphLink) => {
    return `${link.label || 'Link'}\n${link.value ? `Value: ${link.value}` : ''}`;
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  // Render empty state
  if (!data || !data.nodes || !data.nodes.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </div>
    );
  }

  return (
    <Paper sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <SimpleBox sx={{ padding: 1, display: 'flex', flexWrap: 'wrap', gap: 1, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        {/* Search */}
        {enableSearch && (
          <TextField
            size="small"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />
            }}
            sx={{ width: 200 }}
          />
        )}

        {/* Group filter */}
        {enableFiltering && groups.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="group-select-label">Groups</InputLabel>
            <Select
              labelId="group-select-label"
              multiple
              value={selectedGroups}
              onChange={handleGroupSelection}
              renderValue={(selected) => (
                <SimpleBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </SimpleBox>
              )}
              label="Groups"
            >
              {groups.map(group => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Zoom controls */}
        {enableZoom && (
          <SimpleBox sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn}>
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut}>
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset View">
              <IconButton size="small" onClick={handleResetView}>
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </SimpleBox>
        )}
      </SimpleBox>

      {/* Graph */}
      <SimpleBox sx={{ flex: '1', position: 'relative' }}>
        <ForceGraph2D
          ref={graphRef}
          graphData={filteredData()}
          nodeId="id"
          nodeLabel={getNodeLabel}
          nodeColor={getNodeColor}
          nodeVal={getNodeSize}
          linkLabel={getLinkLabel}
          linkColor={getLinkColor}
          linkWidth={getLinkWidth}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          nodeRelSize={6}
          onNodeClick={enableNodeSelection ? handleNodeClick : undefined}
          onLinkClick={enableLinkSelection ? handleLinkClick : undefined}
          enableNodeDrag={enableDrag}
          enableZoomInteraction={enableZoom}
          cooldownTicks={100}
          onEngineStop={() => graphRef.current?.zoomToFit(400)}
        />
      </SimpleBox>

      {/* Selected node/link info */}
      {(selectedNode || selectedLink) && (
        <div style={{ padding: 16, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          {selectedNode && (
            <div>
              <Typography variant="subtitle2">Selected Node: {selectedNode.name}</Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {selectedNode.group && (
                  <Chip
                    label={`Group: ${selectedNode.group}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {selectedNode.value !== undefined && (
                  <Chip
                    label={`Value: ${selectedNode.value}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {Object.entries(selectedNode)
                  .filter(([key]) => !['id', 'name', 'group', 'value', 'color'].includes(key))
                  .map(([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      size="small"
                      variant="outlined"
                    />
                  ))
                }
              </div>
            </div>
          )}

          {selectedLink && (
            <div style={{ marginTop: selectedNode ? 16 : 0 }}>
              <Typography variant="subtitle2">
                Selected Link: {selectedLink.label || `${selectedLink.source} → ${selectedLink.target}`}
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {selectedLink.value !== undefined && (
                  <Chip
                    label={`Value: ${selectedLink.value}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {Object.entries(selectedLink)
                  .filter(([key]) => !['id', 'source', 'target', 'label', 'value', 'color'].includes(key))
                  .map(([key, value]) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      size="small"
                      variant="outlined"
                    />
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}
    </Paper>
  );
};

export default NetworkGraph;
