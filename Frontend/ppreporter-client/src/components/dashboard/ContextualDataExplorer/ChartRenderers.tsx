import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
  AreaChart,
  Area
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { SampleData } from '../../../types/dataExplorer';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

interface ChartRenderProps {
  data: SampleData;
  dataSource: string;
  metrics: string[];
  handleDataPointClick: (dataPoint: any) => void;
}

/**
 * Renders a line chart
 */
export const renderLineChart = ({ data, metrics, handleDataPointClick }: ChartRenderProps): React.ReactNode => {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data.timeSeriesData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="date"
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6, onClick: (e) => handleDataPointClick(e.payload) }}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Renders a bar chart
 */
export const renderBarChart = ({ data, dataSource, metrics, handleDataPointClick }: ChartRenderProps): React.ReactNode => {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={dataSource === 'gamePerformanceData' ? data.gamePerformanceData : data.timeSeriesData}
        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey={dataSource === 'gamePerformanceData' ? "name" : "date"}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Legend />
        {metrics.map((metric, index) => (
          <Bar
            key={metric}
            dataKey={metric}
            fill={COLORS[index % COLORS.length]}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            onClick={(data) => handleDataPointClick(data)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Renders a pie chart
 */
export const renderPieChart = ({ data, dataSource, metrics, handleDataPointClick }: ChartRenderProps): React.ReactNode => {
  const theme = useTheme();
  const isMobile = window.innerWidth < 600;
  
  let pieData;
  if (dataSource === 'playerSegmentData') {
    pieData = data.playerSegmentData;
  } else if (dataSource === 'gamePerformanceData') {
    pieData = data.gamePerformanceData.map(item => ({
      name: item.name,
      value: item[metrics[0] || 'revenue']
    }));
  } else {
    pieData = data.timeSeriesData.slice(-1)[0] && metrics.map(metric => ({
      name: metric,
      value: data.timeSeriesData.slice(-1)[0][metric]
    }));
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={isMobile ? 80 : 150}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          onClick={(data) => handleDataPointClick(data)}
        >
          {pieData && pieData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend layout="vertical" verticalAlign="middle" align="right" />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Renders an area chart
 */
export const renderAreaChart = ({ data, metrics, handleDataPointClick }: ChartRenderProps): React.ReactNode => {
  const theme = useTheme();
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data.timeSeriesData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="date"
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Legend />
        {metrics.map((metric, index) => (
          <Area
            key={metric}
            type="monotone"
            dataKey={metric}
            stackId="1"
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.3}
            name={metric.charAt(0).toUpperCase() + metric.slice(1)}
            onClick={(data) => handleDataPointClick(data)}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * Renders a scatter chart
 */
export const renderScatterChart = ({ data, dataSource, metrics, handleDataPointClick }: ChartRenderProps): React.ReactNode => {
  const theme = useTheme();
  
  // Use revenue vs players for game performance scatter plot
  const scatterData = dataSource === 'gamePerformanceData'
    ? data.gamePerformanceData
    : data.timeSeriesData.map(item => ({
        ...item,
        name: item.date
      }));

  const xMetric = metrics[0] || (dataSource === 'gamePerformanceData' ? 'revenue' : 'deposits');
  const yMetric = metrics[1] || (dataSource === 'gamePerformanceData' ? 'players' : 'withdrawals');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          type="number"
          dataKey={xMetric}
          name={xMetric.charAt(0).toUpperCase() + xMetric.slice(1)}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <YAxis
          type="number"
          dataKey={yMetric}
          name={yMetric.charAt(0).toUpperCase() + yMetric.slice(1)}
          stroke={theme.palette.text.secondary}
          style={{ fontSize: '0.75rem' }}
        />
        <ZAxis
          type="number"
          range={[50, 400]}
          dataKey={metrics[2] || 'bets'}
        />
        <RechartsTooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Legend />
        <Scatter
          name={`${xMetric} vs ${yMetric}`}
          data={scatterData}
          fill={COLORS[0]}
          onClick={(data) => handleDataPointClick(data)}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

/**
 * Renders a table view
 */
export const renderTableView = ({ data, dataSource }: ChartRenderProps): React.ReactNode => {
  const theme = useTheme();
  
  let tableData: any[] = [];
  let columns: string[] = [];

  switch(dataSource) {
    case 'gamePerformanceData':
      tableData = data.gamePerformanceData;
      columns = ['name', 'revenue', 'players', 'bets', 'returnRate', 'growth'];
      break;
    case 'geoData':
      tableData = data.geoData;
      columns = ['country', 'players', 'revenue', 'deposits', 'withdrawals', 'bonusAmount'];
      break;
    case 'playerSegmentData':
      tableData = data.playerSegmentData;
      columns = ['name', 'value'];
      break;
    default:
      tableData = data.timeSeriesData;
      columns = ['date', 'deposits', 'withdrawals', 'newUsers', 'activeUsers', 'profit', 'betCount'];
  }

  return (
    <Box sx={{ overflow: 'auto', maxHeight: 400 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column} style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}>
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} style={{
              backgroundColor: rowIndex % 2 === 0
                ? theme.palette.background.paper
                : theme.palette.background.default
            }}>
              {columns.map(column => (
                <td key={`${rowIndex}-${column}`} style={{
                  padding: '8px 16px',
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  {typeof row[column] === 'number' && column !== 'returnRate' && column !== 'growth'
                    ? row[column].toLocaleString()
                    : column === 'returnRate'
                      ? (row[column] * 100).toFixed(2) + '%'
                      : column === 'growth'
                        ? (row[column] > 0 ? '+' : '') + row[column].toFixed(1) + '%'
                        : row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};
