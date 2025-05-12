import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Alert
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CodeIcon from '@mui/icons-material/Code';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableViewIcon from '@mui/icons-material/TableView';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LineAxisIcon from '@mui/icons-material/LineAxis';
import PieChartIcon from '@mui/icons-material/PieChart';
// Placeholder for Nivo imports
// import { ResponsiveLine } from '@nivo/line';
// import { ResponsiveBar } from '@nivo/bar';
// import { ResponsivePie } from '@nivo/pie';
// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useSelector } from 'react-redux';
import { RootState } from '../../types/store';
import {
  QueryResult,
  ExtractedEntities,
  ChartType,
  MetricFormatType
} from '../../types/naturalLanguage';
import { CommonProps } from '../../types/common';

export interface NaturalLanguageResultsProps extends CommonProps {
  /**
   * Height of the component
   */
  height?: number;
}

/**
 * Component to display the results of natural language queries
 * Handles different visualizations based on the query structure and data
 */
const NaturalLanguageResults: React.FC<NaturalLanguageResultsProps> = ({
  height = 500,
  sx
}) => {
  const theme = useTheme();
  const { nlQueryResults: queryResult, nlQueryLoading: isProcessing } = useSelector((state: RootState) => state.dashboard);

  const [activeTab, setActiveTab] = useState<number>(0);
  const [chartType, setChartType] = useState<ChartType>('bar');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  const handleChartTypeChange = (type: ChartType): void => {
    setChartType(type);
  };

  // If there's no result or processing is in progress
  if (!queryResult || isProcessing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        backgroundColor: theme.palette.background.paper,
        borderRadius: '4px',
        padding: '24px'
      }}>
        {isProcessing ? (
          <div style={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography style={{ marginTop: '16px' }}>Processing your query...</Typography>
          </div>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Ask a question about your data using the search bar above
          </Typography>
        )}
      </div>
    );
  }

  // Extract the entities and data from the query result
  const { entities, sql, data } = queryResult;

  // Format value based on metric type
  const formatValue = (value: number, metricType: MetricFormatType = 'number'): string => {
    switch (metricType) {
      case 'currency':
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  // Generate appropriate chart based on the data and entity structure
  const renderVisualization = (): React.ReactNode => {
    if (!data || data.length === 0) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 400
        }}>
          <Typography variant="body1" color="text.secondary">
            No data available for visualization
          </Typography>
        </div>
      );
    }

    // Determine if this is time-series data
    const hasTimeField = entities?.Dimensions?.some((d: any) => d.isTimeField);

    // Determine chart type based on data structure
    const hasSingleMetric = entities?.Metrics?.length === 1;
    const hasSingleDimension = entities?.Dimensions?.length === 1;
    const hasMultipleDimensions = entities?.Dimensions?.length > 1;

    // Prepare data for visualization
    if (hasTimeField && chartType === 'line') {
      // Line chart for time series data
      const timeField = entities.Dimensions.find((d: any) => d.isTimeField)?.Name;
      const metrics = entities.Metrics.map((m: any) => m.Name);

      // Transform data for line chart
      const lineData = metrics.map((metric: string) => ({
        id: metric,
        data: data.map((item: any) => ({
          x: item[timeField as string],
          y: item[metric]
        }))
      }));

      return (
        <div style={{
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: '4px',
          padding: '24px'
        }}>
          <Typography variant="h6" gutterBottom>
            Line Chart Placeholder
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            This component requires the @nivo/line package which is not currently installed.
            <br />
            Please install the package to view the line chart visualization.
          </Typography>
        </div>
      );
    } else if (hasSingleDimension && chartType === 'bar') {
      // Bar chart for categorical data
      const dimension = entities.Dimensions[0]?.Name;
      const metrics = entities.Metrics.map((m: any) => m.Name);

      // Transform data for bar chart
      const barData = data.map((item: any) => {
        const result: Record<string, any> = {
          [dimension as string]: item[dimension as string],
        };

        metrics.forEach((metric: string) => {
          result[metric] = item[metric];
        });

        return result;
      });

      return (
        <div style={{
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: '4px',
          padding: '24px'
        }}>
          <Typography variant="h6" gutterBottom>
            Bar Chart Placeholder
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            This component requires the @nivo/bar package which is not currently installed.
            <br />
            Please install the package to view the bar chart visualization.
          </Typography>
        </div>
      );
    } else if (hasSingleMetric && hasSingleDimension && chartType === 'pie') {
      // Pie chart for single metric and dimension
      const dimension = entities.Dimensions[0]?.Name;
      const metric = entities.Metrics[0]?.Name;

      // Transform data for pie chart
      const pieData = data.map((item: any) => ({
        id: item[dimension as string],
        label: item[dimension as string],
        value: item[metric as string]
      }));

      return (
        <div style={{
          height: 400,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: '4px',
          padding: '24px'
        }}>
          <Typography variant="h6" gutterBottom>
            Pie Chart Placeholder
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            This component requires the @nivo/pie package which is not currently installed.
            <br />
            Please install the package to view the pie chart visualization.
          </Typography>
        </div>
      );
    } else {
      // Default to table view for complex data structures
      return renderTableView();
    }
  };

  // Render data as a table
  const renderTableView = (): React.ReactNode => {
    if (!data || data.length === 0) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 400
        }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </div>
      );
    }

    // Get column names from the first data item
    const columns = Object.keys(data[0]);

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader aria-label="query results table">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column}>
                  <Typography variant="subtitle2">{column}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row: any, rowIndex: number) => (
              <TableRow key={rowIndex}>
                {columns.map((column: string) => (
                  <TableCell key={`${rowIndex}-${column}`}>
                    {row[column]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render extracted entities
  const renderEntities = (): React.ReactNode => {
    return (
      <Box component="div" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Extracted Entities</Typography>

        {/* Metrics */}
        {entities.Metrics && entities.Metrics.length > 0 && (
          <Box component="div" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Metrics</Typography>
            <Box component="div" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {entities.Metrics.map((metric: any, index: number) => (
                <Chip
                  key={index}
                  label={metric.Name}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Dimensions */}
        {entities.Dimensions && entities.Dimensions.length > 0 && (
          <Box component="div" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Dimensions</Typography>
            <Box component="div" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {entities.Dimensions.map((dimension: any, index: number) => (
                <Chip
                  key={index}
                  label={dimension.Name}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Filters */}
        {entities.Filters && entities.Filters.length > 0 && (
          <Box component="div" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Filters</Typography>
            <List dense>
              {entities.Filters.map((filter: any, index: number) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${filter.Dimension} ${filter.Operator} ${filter.Value}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Time Range */}
        {entities.TimeRange && (
          <Box component="div" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Time Range</Typography>
            {entities.TimeRange.IsRelative ? (
              <Typography variant="body2">
                {entities.TimeRange.RelativePeriod?.replace('_', ' ')}
              </Typography>
            ) : (
              <Typography variant="body2">
                {entities.TimeRange.Start} to {entities.TimeRange.End}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // Render SQL query
  const renderSql = (): React.ReactNode => {
    return (
      <Box component="div" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Generated SQL</Typography>
        <Box component="div" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflowX: 'auto' }}>
          <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
            {sql || '-- No SQL generated'}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Note: Syntax highlighting requires react-syntax-highlighter which is not currently installed.
        </Typography>
      </Box>
    );
  };

  return (
    <Card elevation={3} sx={{ height: '100%', ...sx }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box component="div" sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6" component="h2">
            Query Results
            <Tooltip title="Results from your natural language query">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Box component="div">
            {/* Chart type selection */}
            <Tooltip title="Bar Chart">
              <IconButton
                onClick={() => handleChartTypeChange('bar')}
                color={chartType === 'bar' ? 'primary' : 'default'}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Line Chart">
              <IconButton
                onClick={() => handleChartTypeChange('line')}
                color={chartType === 'line' ? 'primary' : 'default'}
              >
                <LineAxisIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Pie Chart">
              <IconButton
                onClick={() => handleChartTypeChange('pie')}
                color={chartType === 'pie' ? 'primary' : 'default'}
              >
                <PieChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Table View">
              <IconButton
                onClick={() => handleChartTypeChange('table')}
                color={chartType === 'table' ? 'primary' : 'default'}
              >
                <TableViewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Export Data">
              <IconButton>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box component="div" sx={{ mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="query result tabs">
            <Tab
              icon={<BarChartIcon />}
              iconPosition="start"
              label="Visualization"
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab
              icon={<TableViewIcon />}
              iconPosition="start"
              label="Table"
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab
              icon={<InfoOutlinedIcon />}
              iconPosition="start"
              label="Entities"
              id="tab-2"
              aria-controls="tabpanel-2"
            />
            <Tab
              icon={<CodeIcon />}
              iconPosition="start"
              label="SQL"
              id="tab-3"
              aria-controls="tabpanel-3"
            />
          </Tabs>
        </Box>

        <Box component="div" role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
          {activeTab === 0 && renderVisualization()}
        </Box>

        <Box component="div" role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
          {activeTab === 1 && renderTableView()}
        </Box>

        <Box component="div" role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
          {activeTab === 2 && renderEntities()}
        </Box>

        <Box component="div" role="tabpanel" hidden={activeTab !== 3} id="tabpanel-3" aria-labelledby="tab-3">
          {activeTab === 3 && renderSql()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NaturalLanguageResults;
