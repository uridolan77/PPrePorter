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
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useSelector } from 'react-redux';

/**
 * Component to display the results of natural language queries
 * Handles different visualizations based on the query structure and data
 */
const NaturalLanguageResults = ({ height = 500 }) => {
  const theme = useTheme();
  const { queryResult, isProcessing } = useSelector(state => state.naturalLanguage);
  
  const [activeTab, setActiveTab] = useState(0);
  const [chartType, setChartType] = useState('bar');
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleChartTypeChange = (type) => {
    setChartType(type);
  };
  
  // If there's no result or processing is in progress
  if (!queryResult || isProcessing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height,
        bgcolor: theme.palette.background.paper,
        borderRadius: 1,
        p: 3
      }}>
        {isProcessing ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Processing your query...</Typography>
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Ask a question about your data using the search bar above
          </Typography>
        )}
      </Box>
    );
  }
  
  // Extract the entities and data from the query result
  const { entities, sql, data } = queryResult;
  
  // Format value based on metric type
  const formatValue = (value, metricType = 'number') => {
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
  const renderVisualization = () => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400 
        }}>
          <Typography variant="body1" color="text.secondary">
            No data available for visualization
          </Typography>
        </Box>
      );
    }
    
    // Determine if this is time-series data
    const hasTimeField = entities?.Dimensions?.some(d => d.isTimeField);
    
    // Determine chart type based on data structure
    const hasSingleMetric = entities?.Metrics?.length === 1;
    const hasSingleDimension = entities?.Dimensions?.length === 1;
    const hasMultipleDimensions = entities?.Dimensions?.length > 1;
    
    // Prepare data for visualization
    if (hasTimeField && chartType === 'line') {
      // Line chart for time series data
      const timeField = entities.Dimensions.find(d => d.isTimeField)?.Name;
      const metrics = entities.Metrics.map(m => m.Name);
      
      // Transform data for line chart
      const lineData = metrics.map(metric => ({
        id: metric,
        data: data.map(item => ({
          x: item[timeField],
          y: item[metric]
        }))
      }));
      
      return (
        <Box sx={{ height: 400 }}>
          <ResponsiveLine
            data={lineData}
            margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{ 
              type: 'linear', 
              min: 'auto', 
              max: 'auto', 
              stacked: false, 
              reverse: false 
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: timeField,
              legendOffset: 36,
              legendPosition: 'middle'
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: metrics.join(' / '),
              legendOffset: -40,
              legendPosition: 'middle'
            }}
            colors={{ scheme: 'category10' }}
            pointSize={10}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            useMesh={true}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemBackground: 'rgba(0, 0, 0, .03)',
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
        </Box>
      );
    } else if (hasSingleDimension && chartType === 'bar') {
      // Bar chart for categorical data
      const dimension = entities.Dimensions[0]?.Name;
      const metrics = entities.Metrics.map(m => m.Name);
      
      // Transform data for bar chart
      const barData = data.map(item => {
        const result = {
          [dimension]: item[dimension],
        };
        
        metrics.forEach(metric => {
          result[metric] = item[metric];
        });
        
        return result;
      });
      
      return (
        <Box sx={{ height: 400 }}>
          <ResponsiveBar
            data={barData}
            keys={metrics}
            indexBy={dimension}
            margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
            padding={0.3}
            groupMode="grouped"
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'category10' }}
            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: dimension,
              legendPosition: 'middle',
              legendOffset: 32
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: metrics.join(' / '),
              legendPosition: 'middle',
              legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1
                    }
                  }
                ]
              }
            ]}
          />
        </Box>
      );
    } else if (hasSingleMetric && hasSingleDimension && chartType === 'pie') {
      // Pie chart for single metric and dimension
      const dimension = entities.Dimensions[0]?.Name;
      const metric = entities.Metrics[0]?.Name;
      
      // Transform data for pie chart
      const pieData = data.map(item => ({
        id: item[dimension],
        label: item[dimension],
        value: item[metric]
      }));
      
      return (
        <Box sx={{ height: 400 }}>
          <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={theme.palette.text.primary}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            legends={[
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: theme.palette.text.primary,
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: theme.palette.primary.main
                    }
                  }
                ]
              }
            ]}
          />
        </Box>
      );
    } else {
      // Default to table view for complex data structures
      return renderTableView();
    }
  };
  
  // Render data as a table
  const renderTableView = () => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 400 
        }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
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
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map(column => (
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
  const renderEntities = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Extracted Entities</Typography>
        
        {/* Metrics */}
        {entities.Metrics && entities.Metrics.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Metrics</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {entities.Metrics.map((metric, index) => (
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Dimensions</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {entities.Dimensions.map((dimension, index) => (
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Filters</Typography>
            <List dense>
              {entities.Filters.map((filter, index) => (
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Time Range</Typography>
            {entities.TimeRange.IsRelative ? (
              <Typography variant="body2">
                {entities.TimeRange.RelativePeriod.replace('_', ' ')}
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
  const renderSql = () => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Generated SQL</Typography>
        <SyntaxHighlighter language="sql" style={docco} showLineNumbers={true}>
          {sql || '-- No SQL generated'}
        </SyntaxHighlighter>
      </Box>
    );
  };
  
  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6">
            Query Results
            <Tooltip title="Results from your natural language query">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Box>
            <Tooltip title="Download Results">
              <IconButton>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="query result tabs">
            <Tab label="Visualization" />
            <Tab label="Table View" />
            <Tab label="Extracted Entities" />
            <Tab label="SQL" />
          </Tabs>
        </Box>
        
        {activeTab === 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
              <Tooltip title="Bar Chart">
                <Button
                  size="small"
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  onClick={() => handleChartTypeChange('bar')}
                  startIcon={<BarChartIcon />}
                >
                  Bar
                </Button>
              </Tooltip>
              
              <Tooltip title="Line Chart">
                <Button
                  size="small"
                  variant={chartType === 'line' ? 'contained' : 'outlined'}
                  onClick={() => handleChartTypeChange('line')}
                  startIcon={<LineAxisIcon />}
                >
                  Line
                </Button>
              </Tooltip>
              
              <Tooltip title="Pie Chart">
                <Button
                  size="small"
                  variant={chartType === 'pie' ? 'contained' : 'outlined'}
                  onClick={() => handleChartTypeChange('pie')}
                  startIcon={<PieChartIcon />}
                >
                  Pie
                </Button>
              </Tooltip>
            </Box>
            
            {renderVisualization()}
          </>
        )}
        
        {activeTab === 1 && renderTableView()}
        
        {activeTab === 2 && renderEntities()}
        
        {activeTab === 3 && renderSql()}
      </CardContent>
    </Card>
  );
};

export default NaturalLanguageResults;