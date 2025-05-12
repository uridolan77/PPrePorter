import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  ResponsiveContainer
} from 'recharts';
import { Tooltip as RechartsTooltip } from 'recharts';

// Custom Sankey implementation
const Sankey = ({ data, nodeWidth, nodePadding, node, link, children }: any) => {
  // Simple implementation that renders nodes and links
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
    </div>
  );
};

// Custom Rectangle component
const Rectangle = ({ x, y, width, height, fill, fillOpacity, stroke, strokeWidth, onClick, onMouseEnter, onMouseLeave, style }: any) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        backgroundColor: fill,
        opacity: fillOpacity,
        border: `${strokeWidth}px solid ${stroke}`,
        cursor: style?.cursor || 'default',
        ...style
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

// Custom Layer component
const Layer = ({ children }: any) => {
  return <div style={{ position: 'relative' }}>{children}</div>;
};


// Node interface
export interface SankeyNode {
  name: string;
  value?: number;
  color?: string;
  category?: string;
  [key: string]: any;
}

// Link interface
export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color?: string;
  [key: string]: any;
}

// Sankey data interface
export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Sankey diagram props
interface SankeyDiagramProps {
  id: string;
  title: string;
  description?: string;
  data: SankeyData;
  height?: number;
  loading?: boolean;
  error?: string | null;
  nodeWidth?: number;
  nodePadding?: number;
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableExport?: boolean;
  enableAnnotations?: boolean;
  onNodeClick?: (node: SankeyNode, index: number) => void;
  onLinkClick?: (link: SankeyLink, index: number) => void;
}

/**
 * SankeyDiagram component
 * A Sankey diagram for visualizing flow between nodes
 */
const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
  id,
  title,
  description,
  data,
  height = 500,
  loading = false,
  error = null,
  nodeWidth = 20,
  nodePadding = 10,
  enableSearch = true,
  enableFiltering = true,
  enableExport = true,
  enableAnnotations = true,
  onNodeClick,
  onLinkClick
}) => {
  const theme = useTheme();
  // No annotation context needed

  // State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedLink, setSelectedLink] = useState<number | null>(null);
  const [valueRange, setValueRange] = useState<[number, number]>([0, 100]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tooltipContent, setTooltipContent] = useState<any>(null);

  // Process data
  const processedData = useMemo(() => {
    if (!data || !data.nodes || !data.links) {
      return { nodes: [], links: [] };
    }

    // Extract categories
    const uniqueCategories = Array.from(
      new Set(data.nodes.map(node => node.category || 'default'))
    );
    setCategories(uniqueCategories);

    if (selectedCategories.length === 0) {
      setSelectedCategories(uniqueCategories);
    }

    // Calculate value range
    const linkValues = data.links.map(link => link.value);
    const minValue = Math.min(...linkValues);
    const maxValue = Math.max(...linkValues);

    if (valueRange[0] === 0 && valueRange[1] === 100) {
      setValueRange([minValue, maxValue]);
    }

    return data;
  }, [data, selectedCategories, valueRange]);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    if (!processedData.nodes || !processedData.links) {
      return { nodes: [], links: [] };
    }

    // Filter nodes by search term
    let filteredNodes = processedData.nodes;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(node =>
        node.name.toLowerCase().includes(term)
      );
    }

    // Filter nodes by selected categories
    if (selectedCategories.length) {
      filteredNodes = filteredNodes.filter(node =>
        selectedCategories.includes(node.category || 'default')
      );
    }

    // Get filtered node indices
    const filteredNodeIndices = new Set(
      filteredNodes.map((_, index) => index)
    );

    // Filter links that connect filtered nodes
    let filteredLinks = processedData.links.filter(link =>
      filteredNodeIndices.has(link.source) &&
      filteredNodeIndices.has(link.target)
    );

    // Filter links by value range
    filteredLinks = filteredLinks.filter(link =>
      link.value >= valueRange[0] &&
      link.value <= valueRange[1]
    );

    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [processedData, searchTerm, selectedCategories, valueRange]);

  // Handle search
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // Handle category selection
  const handleCategorySelection = useCallback((event: SelectChangeEvent<string[]>) => {
    setSelectedCategories(event.target.value as string[]);
  }, []);

  // Handle value range change
  const handleValueRangeChange = useCallback((event: Event, newValue: number | number[]) => {
    setValueRange(newValue as [number, number]);
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((nodeData: any) => {
    setSelectedNode(nodeData.index);
    setSelectedLink(null);

    if (onNodeClick) {
      onNodeClick(processedData.nodes[nodeData.index], nodeData.index);
    }
  }, [processedData.nodes, onNodeClick]);

  // Handle link click
  const handleLinkClick = useCallback((linkData: any) => {
    setSelectedLink(linkData.index);
    setSelectedNode(null);

    if (onLinkClick) {
      onLinkClick(processedData.links[linkData.index], linkData.index);
    }
  }, [processedData.links, onLinkClick]);

  // Handle export
  const handleExport = useCallback(() => {
    // Create CSV content
    const nodesCsv = [
      ['Index', 'Name', 'Category', 'Value'].join(','),
      ...filteredData.nodes.map((node, index) =>
        [index, node.name, node.category || 'default', node.value || ''].join(',')
      )
    ].join('\n');

    const linksCsv = [
      ['Source', 'Target', 'Value'].join(','),
      ...filteredData.links.map(link =>
        [
          filteredData.nodes[link.source].name,
          filteredData.nodes[link.target].name,
          link.value
        ].join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([
      'Nodes:\n',
      nodesCsv,
      '\n\nLinks:\n',
      linksCsv
    ], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sankey-diagram-${id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredData, id]);

  // Custom node renderer
  const CustomNode = useCallback(({ x, y, width, height, index, payload }: any) => {
    const isSelected = selectedNode === index;
    const node = processedData.nodes[index];

    // Node color
    let nodeColor = node.color || theme.palette.primary.main;
    if (node.category) {
      const categoryIndex = categories.indexOf(node.category);
      const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.info.main
      ];
      nodeColor = node.color || colors[categoryIndex % colors.length];
    }

    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={nodeColor}
        fillOpacity={isSelected ? 1 : 0.9}
        stroke={isSelected ? theme.palette.common.white : nodeColor}
        strokeWidth={isSelected ? 2 : 0}
        onClick={() => handleNodeClick({ index })}
        onMouseEnter={() => setTooltipContent({
          type: 'node',
          nodeName: node.name,
          nodeValue: node.value,
          category: node.category,
          ...node
        })}
        onMouseLeave={() => setTooltipContent(null)}
        style={{ cursor: 'pointer' }}
      />
    );
  }, [selectedNode, processedData.nodes, categories, theme, handleNodeClick]);

  // Custom link renderer
  const CustomLink = useCallback(({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, index }: any) => {
    const isSelected = selectedLink === index;
    const link = processedData.links[index];

    // Link color
    let linkColor = link.color || alpha(theme.palette.text.secondary, 0.3);

    return (
      <Layer>
        <path
          d={`
            M${sourceX},${sourceY}
            C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
          `}
          fill="none"
          stroke={linkColor}
          strokeWidth={linkWidth}
          strokeOpacity={isSelected ? 1 : 0.5}
          onClick={() => handleLinkClick({ index })}
          onMouseEnter={() => setTooltipContent({
            type: 'link',
            sourceName: processedData.nodes[link.source].name,
            targetName: processedData.nodes[link.target].name,
            linkValue: link.value,
            ...link
          })}
          onMouseLeave={() => setTooltipContent(null)}
          style={{ cursor: 'pointer' }}
        />
      </Layer>
    );
  }, [selectedLink, processedData.nodes, processedData.links, theme, handleLinkClick]);

  // Custom tooltip content
  const CustomTooltipContent = ({ active, payload }: any) => {
    if (!active || !tooltipContent) {
      return null;
    }

    return (
      <Paper sx={{ p: 1.5, maxWidth: 300 }}>
        {tooltipContent.type === 'node' ? (
          <>
            <Typography variant="subtitle2">{tooltipContent.name}</Typography>
            {tooltipContent.category && (
              <Typography variant="body2" color="text.secondary">
                Category: {tooltipContent.category}
              </Typography>
            )}
            {tooltipContent.value !== undefined && (
              <Typography variant="body2" color="text.secondary">
                Value: {tooltipContent.value}
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography variant="subtitle2">
              {tooltipContent.source} → {tooltipContent.target}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Value: {tooltipContent.value}
            </Typography>
          </>
        )}
      </Paper>
    );
  };

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
  if (!data || !data.nodes || !data.nodes.length || !data.links || !data.links.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography color="text.secondary">No data available</Typography>
      </div>
    );
  }

  return (
    <Paper sx={{ height, display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <div style={{ padding: 8, display: 'flex', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
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

        {/* Category filter */}
        {enableFiltering && categories.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="category-select-label">Categories</InputLabel>
            <Select
              labelId="category-select-label"
              multiple
              value={selectedCategories}
              onChange={handleCategorySelection}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
              label="Categories"
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Value range filter */}
        {enableFiltering && (
          <Box sx={{ width: '200px', paddingLeft: '16px', paddingRight: '16px' }}>
            <Typography variant="caption" color="text.secondary">
              Value Range
            </Typography>
            <Slider
              value={valueRange}
              onChange={handleValueRangeChange}
              valueLabelDisplay="auto"
              min={Math.min(...processedData.links.map(link => link.value))}
              max={Math.max(...processedData.links.map(link => link.value))}
            />
          </Box>
        )}

        {/* Export */}
        {enableExport && (
          <Tooltip title="Export as CSV">
            <IconButton size="small" onClick={handleExport}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </div>

      {/* Diagram */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={filteredData}
            nodeWidth={nodeWidth}
            nodePadding={nodePadding}
            linkProps={{ shape: 'path' }}
            nodeComponent={CustomNode}
            linkComponent={CustomLink}
          >
            <RechartsTooltip content={<CustomTooltipContent />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      {/* Selected node/link info */}
      {(selectedNode !== null || selectedLink !== null) && (
        <div style={{ padding: 16, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          {selectedNode !== null && (
            <div>
              <Typography variant="subtitle2">
                Selected Node: {processedData.nodes[selectedNode].name}
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {processedData.nodes[selectedNode].category && (
                  <Chip
                    label={`Category: ${processedData.nodes[selectedNode].category}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {processedData.nodes[selectedNode].value !== undefined && (
                  <Chip
                    label={`Value: ${processedData.nodes[selectedNode].value}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </div>
            </div>
          )}

          {selectedLink !== null && (
            <div style={{ marginTop: selectedNode !== null ? 16 : 0 }}>
              <Typography variant="subtitle2">
                Selected Link: {processedData.nodes[processedData.links[selectedLink].source].name} →
                {processedData.nodes[processedData.links[selectedLink].target].name}
              </Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <Chip
                  label={`Value: ${processedData.links[selectedLink].value}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Paper>
  );
};

export default SankeyDiagram;
