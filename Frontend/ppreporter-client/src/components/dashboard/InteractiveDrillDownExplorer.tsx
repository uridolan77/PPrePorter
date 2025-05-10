import React, { useState, useCallback, useRef, MouseEvent, ChangeEvent } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
  Tooltip,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Portal
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Sector,
  Treemap,
  Brush
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  DataNode,
  TimeSeriesDataPoint,
  AdditionalMetrics,
  SearchResult,
  BreadcrumbItem,
  ChartType,
  DetailChartType,
  ViewMode,
  InteractiveDrillDownExplorerProps
} from '../../types/interactiveDrillDownExplorer';

// Sample data hierarchy for interactive drilling
const sampleRevenueData: DataNode = {
  id: 'total',
  name: 'Total Revenue',
  value: 12458760,
  children: [
    {
      id: 'casino',
      name: 'Casino',
      value: 6542300,
      children: [
        {
          id: 'slots',
          name: 'Slots',
          value: 3825400,
          children: [
            { id: 'slots-provider1', name: 'Provider 1', value: 1245300 },
            { id: 'slots-provider2', name: 'Provider 2', value: 984200 },
            { id: 'slots-provider3', name: 'Provider 3', value: 875400 },
            { id: 'slots-provider4', name: 'Provider 4', value: 720500 }
          ]
        },
        {
          id: 'table-games',
          name: 'Table Games',
          value: 1845300,
          children: [
            { id: 'table-roulette', name: 'Roulette', value: 745200 },
            { id: 'table-blackjack', name: 'Blackjack', value: 654300 },
            { id: 'table-baccarat', name: 'Baccarat', value: 445800 }
          ]
        },
        {
          id: 'jackpots',
          name: 'Jackpots',
          value: 871600,
          children: [
            { id: 'jackpots-major', name: 'Major', value: 512400 },
            { id: 'jackpots-minor', name: 'Minor', value: 359200 }
          ]
        }
      ]
    },
    {
      id: 'sport',
      name: 'Sport',
      value: 3684200,
      children: [
        {
          id: 'football',
          name: 'Football',
          value: 2154700,
          children: [
            { id: 'football-premierleague', name: 'Premier League', value: 924500 },
            { id: 'football-laliga', name: 'La Liga', value: 475300 },
            { id: 'football-seriea', name: 'Serie A', value: 384900 },
            { id: 'football-bundesliga', name: 'Bundesliga', value: 370000 }
          ]
        },
        {
          id: 'tennis',
          name: 'Tennis',
          value: 745800,
          children: [
            { id: 'tennis-grand-slam', name: 'Grand Slam', value: 425300 },
            { id: 'tennis-atp', name: 'ATP Tour', value: 320500 }
          ]
        },
        {
          id: 'basketball',
          name: 'Basketball',
          value: 512400,
          children: [
            { id: 'basketball-nba', name: 'NBA', value: 312400 },
            { id: 'basketball-euroleague', name: 'Euroleague', value: 200000 }
          ]
        },
        { id: 'other-sports', name: 'Other Sports', value: 271300 }
      ]
    },
    {
      id: 'live',
      name: 'Live Casino',
      value: 1945300,
      children: [
        { id: 'live-roulette', name: 'Live Roulette', value: 754200 },
        { id: 'live-blackjack', name: 'Live Blackjack', value: 685400 },
        { id: 'live-baccarat', name: 'Live Baccarat', value: 350700 },
        { id: 'live-gameshows', name: 'Game Shows', value: 155000 }
      ]
    },
    {
      id: 'bingo',
      name: 'Bingo',
      value: 286960,
      children: [
        { id: 'bingo-90ball', name: '90 Ball', value: 145300 },
        { id: 'bingo-75ball', name: '75 Ball', value: 89600 },
        { id: 'bingo-other', name: 'Other Variants', value: 52060 }
      ]
    }
  ]
};

// Sample time series data for detailed view
const generateTimeSeriesData = (id: string, months = 12): TimeSeriesDataPoint[] => {
  const baseValue = Math.random() * 500000 + 200000;
  const trend = Math.random() * 0.1 + 0.01; // 1-11% growth trend
  const volatility = Math.random() * 0.2 + 0.05; // 5-25% volatility

  const now = new Date();
  const data: TimeSeriesDataPoint[] = [];

  for (let i = 0; i < months; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (months - 1 - i));

    // Create some seasonality - higher in Dec, lower in Jan-Feb
    const month = date.getMonth();
    let seasonality = 1;
    if (month === 11) seasonality = 1.2; // Dec
    if (month === 0 || month === 1) seasonality = 0.9; // Jan-Feb

    // Calculate value with trend, seasonality and random variation
    const trendFactor = 1 + (trend * i);
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    const value = Math.round(baseValue * trendFactor * seasonality * randomFactor);

    data.push({
      date: format(date, 'yyyy-MM'),
      value
    });
  }

  return data;
};

// Time series data cache
const timeSeriesDataCache: Record<string, TimeSeriesDataPoint[]> = {};

// Get time series data for a node, with caching
const getTimeSeriesData = (nodeId: string): TimeSeriesDataPoint[] => {
  if (!timeSeriesDataCache[nodeId]) {
    timeSeriesDataCache[nodeId] = generateTimeSeriesData(nodeId);
  }
  return timeSeriesDataCache[nodeId];
};

// Sample additional metrics for detailed view
const getAdditionalMetrics = (nodeId: string): AdditionalMetrics => {
  // Generate some pseudo-random but consistent metrics based on the nodeId
  const hashCode = nodeId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const seed = Math.abs(hashCode) / 1000000;

  return {
    bets: Math.round((seed * 3.5 + 4) * 1000000),
    players: Math.round((seed * 1.2 + 2) * 10000),
    averageBet: Math.round((seed * 20 + 40) * 10) / 10,
    rtp: 93 + Math.round((seed * 5) * 10) / 10,
    margin: 7 - Math.round((seed * 5) * 10) / 10
  };
};

// Helper function to flatten hierarchical data for searching
const flattenData = (node: DataNode, result: SearchResult[] = []): SearchResult[] => {
  result.push({
    id: node.id,
    name: node.name,
    value: node.value,
    path: [node.id]
  });

  if (node.children) {
    node.children.forEach(child => {
      const childResult = flattenData(child, []);
      childResult.forEach(item => {
        result.push({
          ...item,
          path: [node.id, ...item.path]
        });
      });
    });
  }

  return result;
};

// Helper to find a node by path
const findNodeByPath = (root: DataNode, path: string[]): DataNode | null => {
  if (path.length === 0 || path[0] !== root.id) return null;

  if (path.length === 1) return root;

  if (!root.children) return null;

  for (const child of root.children) {
    const found = findNodeByPath(child, path.slice(1));
    if (found) return found;
  }

  return null;
};

/**
 * Interactive data exploration component with drill-down capabilities and
 * fluid transitions between summary and detailed views
 */
const InteractiveDrillDownExplorer: React.FC<InteractiveDrillDownExplorerProps> = ({
  data = sampleRevenueData,
  title = "Revenue Explorer",
  isLoading = false
}) => {
  const theme = useTheme();
  const [currentPath, setCurrentPath] = useState<string[]>([data.id]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [detailChartType, setDetailChartType] = useState<DetailChartType>('area');
  const [searchValue, setSearchValue] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);
  const [detailNode, setDetailNode] = useState<DataNode | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate breadcrumb items based on current path
  const breadcrumbItems: BreadcrumbItem[] = currentPath.map((id, index) => {
    let node: DataNode = data;
    for (let i = 1; i <= index; i++) {
      const childId = currentPath[i];
      if (node.children) {
        const foundChild = node.children.find(child => child.id === childId);
        if (foundChild) {
          node = foundChild;
        }
      }
    }
    return { id, name: node?.name || id };
  });

  // Get current node based on path
  const getCurrentNode = (): DataNode => {
    let node: DataNode = data;
    for (let i = 1; i < currentPath.length; i++) {
      const childId = currentPath[i];
      if (node.children) {
        const foundChild = node.children.find(child => child.id === childId);
        if (foundChild) {
          node = foundChild;
        }
      }
    }
    return node;
  };

  const currentNode = getCurrentNode();

  // Handle drill down to a specific node
  const handleDrillDown = (nodeId: string): void => {
    setCurrentPath([...currentPath, nodeId]);
    setActiveIndex(0);
  };

  // Handle drill up to parent level
  const handleDrillUp = (index: number): void => {
    if (index >= 0 && index < currentPath.length) {
      setCurrentPath(currentPath.slice(0, index + 1));
      setActiveIndex(0);
    }
  };

  // Handle navigation via breadcrumbs
  const handleBreadcrumbClick = (index: number): void => {
    handleDrillUp(index);
  };

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format large numbers
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-GB').format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number): string => {
    return `${value}%`;
  };

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchValue(value);

    if (value.trim()) {
      setIsSearching(true);

      // Flatten the hierarchical data for searching
      const flatData = flattenData(data);

      // Filter data based on search term
      const results = flatData.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );

      setSearchResults(results);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Handle selection of a search result
  const handleSearchResultSelect = (item: SearchResult): void => {
    setCurrentPath(item.path);
    setSearchValue('');
    setIsSearching(false);
    setSearchResults([]);
  };

  // Handle switching between chart types
  const handleChartTypeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setChartType(event.target.value as ChartType);
  };

  // Handle switching between detail chart types
  const handleDetailChartTypeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDetailChartType(event.target.value as DetailChartType);
  };

  // Open detail dialog for a node
  const handleOpenDetail = (node: DataNode): void => {
    setDetailNode(node);
    setShowDetailDialog(true);
  };

  // Close detail dialog
  const handleCloseDetail = (): void => {
    setShowDetailDialog(false);
  };

  // Colors for pie/bar chart sections
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042'
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any): React.ReactNode => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Card sx={{ p: 1, boxShadow: 3, bgcolor: 'background.paper', maxWidth: 250 }}>
          <Typography variant="subtitle2" gutterBottom>
            {data.name}
          </Typography>
          <Typography variant="body2">
            Value: {formatCurrency(data.value)}
          </Typography>
          {data.value > 0 && data._parent && data._parent.value > 0 && (
            <Typography variant="body2">
              Share: {((data.value / data._parent.value) * 100).toFixed(1)}%
            </Typography>
          )}
        </Card>
      );
    }
    return null;
  };

  // Custom tooltip for time series charts
  const CustomTimeTooltip = ({ active, payload, label }: any): React.ReactNode => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1, boxShadow: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2">
            {formatCurrency(payload[0].value)}
          </Typography>
        </Card>
      );
    }
    return null;
  };

  // Custom active shape for pie chart with hover effect
  // Properly typed to match the expected type for activeShape
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 12}
          outerRadius={outerRadius + 16}
          fill={fill}
        />

        {/* Center text */}
        <text x={cx} y={cy - 15} textAnchor="middle" fill={theme.palette.text.primary} fontSize={16}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill={theme.palette.text.secondary} fontSize={14}>
          {formatCurrency(value)}
        </text>
        <text x={cx} y={cy + 30} textAnchor="middle" fill={theme.palette.text.secondary} fontSize={14}>
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  // Prepare data for visualization with parent reference
  const prepareData = (node: DataNode): DataNode[] => {
    if (!node.children) return [];

    return node.children.map(child => ({
      ...child,
      _parent: node
    }));
  };

  const chartData = prepareData(currentNode);

  // Render pie chart visualization
  const renderPieChart = (): React.ReactNode => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
            innerRadius={110}
            outerRadius={160}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            onClick={(data: any) => data.children ? handleDrillDown(data.id) : handleOpenDetail(data)}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render bar chart visualization
  const renderBarChart = (): React.ReactNode => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 110 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            tickFormatter={formatCurrency}
            width={100}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            onClick={(data: any) => data.children ? handleDrillDown(data.id) : handleOpenDetail(data)}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render treemap visualization
  const renderTreemap = (): React.ReactNode => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <Treemap
          data={chartData}
          dataKey="value"
          nameKey="name"
          aspectRatio={4/3}
          stroke="#fff"
          onClick={(data: any) => data.children ? handleDrillDown(data.id) : handleOpenDetail(data)}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              style={{ cursor: 'pointer' }}
            />
          ))}
          {/* Removed Tooltip components that were causing type errors */}
        </Treemap>
      </ResponsiveContainer>
    );
  };

  // Render table view
  const renderTable = (): React.ReactNode => {
    return (
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: `1px solid ${theme.palette.divider}`
        }}>
          <thead>
            <tr>
              <th style={{
                padding: 16,
                textAlign: 'left',
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.action.hover
              }}>
                Name
              </th>
              <th style={{
                padding: 16,
                textAlign: 'right',
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.action.hover
              }}>
                Value
              </th>
              <th style={{
                padding: 16,
                textAlign: 'right',
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.action.hover
              }}>
                Percentage
              </th>
              <th style={{
                padding: 16,
                textAlign: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.action.hover
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={item.id} style={{
                backgroundColor: index % 2 === 0 ? theme.palette.background.paper : theme.palette.action.hover
              }}>
                <td style={{ padding: 16, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: COLORS[index % COLORS.length],
                        mr: 1
                      }}
                    />
                    {item.name}
                  </Box>
                </td>
                <td style={{
                  padding: 16,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  textAlign: 'right'
                }}>
                  {formatCurrency(item.value)}
                </td>
                <td style={{
                  padding: 16,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  textAlign: 'right'
                }}>
                  {item._parent && ((item.value / item._parent.value) * 100).toFixed(1)}%
                </td>
                <td style={{
                  padding: 16,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center'
                }}>
                  {item.children ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDrillDown(item.id)}
                      startIcon={<ZoomInIcon />}
                    >
                      Drill Down
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenDetail(item)}
                      startIcon={<VisibilityIcon />}
                    >
                      Details
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  // Render detail dialog content
  const renderDetailDialog = (): React.ReactNode => {
    if (!detailNode) return null;

    const timeSeriesData = getTimeSeriesData(detailNode.id);
    const metrics = getAdditionalMetrics(detailNode.id);

    // Render time series chart based on selected type
    const renderTimeSeriesChart = (): React.ReactNode => {
      const baseProps = {
        data: timeSeriesData,
        margin: { top: 10, right: 30, left: 20, bottom: 30 }
      };

      switch (detailChartType) {
        case 'line':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart {...baseProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <RechartsTooltip content={<CustomTimeTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Brush
                  dataKey="date"
                  height={30}
                  stroke={theme.palette.primary.main}
                  tickFormatter={() => ''} // Hide tick labels in brush
                />
              </LineChart>
            </ResponsiveContainer>
          );

        case 'area':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart {...baseProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <RechartsTooltip content={<CustomTimeTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={theme.palette.primary.main}
                  fill={theme.palette.primary.light}
                  fillOpacity={0.3}
                />
                <Brush
                  dataKey="date"
                  height={30}
                  stroke={theme.palette.primary.main}
                  tickFormatter={() => ''} // Hide tick labels in brush
                />
              </AreaChart>
            </ResponsiveContainer>
          );

        case 'bar':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart {...baseProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <RechartsTooltip content={<CustomTimeTooltip />} />
                <Bar
                  dataKey="value"
                  fill={theme.palette.primary.main}
                />
                <Brush
                  dataKey="date"
                  height={30}
                  stroke={theme.palette.primary.main}
                  tickFormatter={() => ''} // Hide tick labels in brush
                />
              </BarChart>
            </ResponsiveContainer>
          );

        default:
          return null;
      }
    };

    return (
      <Box>
        <Typography variant="h6" gutterBottom>{detailNode.name} Details</Typography>

        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Revenue
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                      {formatCurrency(detailNode.value)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {detailNode._parent &&
                        `${((detailNode.value / detailNode._parent.value) * 100).toFixed(1)}% of ${detailNode._parent.name}`
                      }
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Bets
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                      {formatNumber(metrics.bets)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(metrics.players)} players
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Average Bet
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', my: 1 }}>
                      £{metrics.averageBet}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      RTP: {metrics.rtp}% | Margin: {metrics.margin}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Time Series Chart */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Monthly Trend
                </Typography>
                <TextField
                  select
                  label="Chart Type"
                  value={detailChartType}
                  onChange={handleDetailChartTypeChange}
                  size="small"
                  sx={{ width: 150 }}
                >
                  <MenuItem value="line">Line</MenuItem>
                  <MenuItem value="area">Area</MenuItem>
                  <MenuItem value="bar">Bar</MenuItem>
                </TextField>
              </Box>
              {renderTimeSeriesChart()}
            </Box>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Performance Analysis
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Month-over-Month Change
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {timeSeriesData.length >= 2 && (() => {
                        const lastMonth = timeSeriesData[timeSeriesData.length - 1].value;
                        const prevMonth = timeSeriesData[timeSeriesData.length - 2].value;
                        const change = ((lastMonth - prevMonth) / prevMonth) * 100;
                        const isPositive = change >= 0;

                        return (
                          <>
                            <Typography
                              variant="h6"
                              sx={{
                                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                                fontWeight: 'bold'
                              }}
                            >
                              {isPositive ? '+' : ''}{change.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              from {formatCurrency(prevMonth)} to {formatCurrency(lastMonth)}
                            </Typography>
                          </>
                        );
                      })()}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      3-Month Trend
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {timeSeriesData.length >= 4 && (() => {
                        const last3Months = timeSeriesData.slice(-4, -1);
                        const current = timeSeriesData[timeSeriesData.length - 1].value;
                        const avg3Month = last3Months.reduce((sum, item) => sum + item.value, 0) / 3;
                        const change = ((current - avg3Month) / avg3Month) * 100;
                        const isPositive = change >= 0;

                        return (
                          <>
                            <Typography
                              variant="h6"
                              sx={{
                                color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                                fontWeight: 'bold'
                              }}
                            >
                              {isPositive ? '+' : ''}{change.toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              vs. 3-month average ({formatCurrency(avg3Month)})
                            </Typography>
                          </>
                        );
                      })()}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardHeader
          title={title}
          subheader="Interactive data exploration with drill-down capabilities"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
              >
                Export
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Control Bar */}
              <Box sx={{
                mb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
              }}>
                {/* Breadcrumbs */}
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="breadcrumb"
                >
                  {breadcrumbItems.map((item, index) => (
                    <Box key={item.id}>
                      {index === breadcrumbItems.length - 1 ? (
                        <Typography color="text.primary" fontWeight="bold">
                          {item.name}
                        </Typography>
                      ) : (
                        <Link
                          component="button"
                          variant="body1"
                          color="inherit"
                          sx={{ display: 'flex', alignItems: 'center' }}
                          onClick={() => handleBreadcrumbClick(index)}
                        >
                          {index === 0 ? (
                            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                          ) : null}
                          {item.name}
                        </Link>
                      )}
                    </Box>
                  ))}
                </Breadcrumbs>

                {/* Controls */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {/* Search */}
                  <TextField
                    placeholder="Search..."
                    size="small"
                    value={searchValue}
                    onChange={handleSearchChange}
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                  />

                  {/* View Toggle */}
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Chart View">
                      <IconButton
                        color={viewMode === 'chart' ? 'primary' : 'default'}
                        onClick={() => setViewMode('chart')}
                      >
                        <ViewModuleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Table View">
                      <IconButton
                        color={viewMode === 'table' ? 'primary' : 'default'}
                        onClick={() => setViewMode('table')}
                      >
                        <ViewListIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Chart Type Selector (only in chart mode) */}
                  {viewMode === 'chart' && (
                    <TextField
                      select
                      label="Chart Type"
                      value={chartType}
                      onChange={handleChartTypeChange}
                      size="small"
                      sx={{ width: 150 }}
                    >
                      <MenuItem value="pie">Pie Chart</MenuItem>
                      <MenuItem value="bar">Bar Chart</MenuItem>
                      <MenuItem value="treemap">Treemap</MenuItem>
                    </TextField>
                  )}
                </Box>
              </Box>

              {/* Search Results */}
              {isSearching && searchResults.length > 0 && (
                <Paper sx={{ mb: 3, p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Search Results
                  </Typography>
                  <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {searchResults.map((result) => (
                      <Box
                        component="li"
                        key={result.id}
                        sx={{
                          p: 1,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: theme.palette.action.hover },
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1">{result.name}</Typography>
                          <Typography variant="body2">{formatCurrency(result.value)}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Path: {result.path.map((id, i) => {
                            if (i === 0) return data.name;

                            const node = findNodeByPath(data, result.path.slice(0, i + 1));
                            return node ? node.name : id;
                          }).join(' > ')}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Current Node Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {currentNode.name}
                  {currentPath.length > 1 && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDrillUp(currentPath.length - 2)}
                      sx={{ ml: 1 }}
                    >
                      <ZoomOutIcon fontSize="small" />
                    </IconButton>
                  )}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  {formatCurrency(currentNode.value)}
                </Typography>
                {currentNode._parent && (
                  <Chip
                    label={`${((currentNode.value / currentNode._parent.value) * 100).toFixed(1)}% of ${currentNode._parent.name}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>

              {/* Main Visualization */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${viewMode}-${chartType}-${currentPath.join('-')}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === 'chart' ? (
                    chartType === 'pie' ? renderPieChart() :
                    chartType === 'bar' ? renderBarChart() :
                    renderTreemap()
                  ) : (
                    renderTable()
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Detail Dialog */}
              <Dialog
                open={showDetailDialog}
                onClose={handleCloseDetail}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle>
                  Detailed Analysis
                </DialogTitle>
                <DialogContent dividers>
                  {renderDetailDialog()}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDetail}>Close</Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InteractiveDrillDownExplorer;