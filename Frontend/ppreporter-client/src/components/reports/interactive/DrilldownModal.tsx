import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Grid,
  Divider,
  useTheme,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import { format as formatDate } from 'date-fns';

import { EnhancedTable } from '../../tables/enhanced';
import { ColumnDef } from '../../tables/enhanced/types';
import { ReportAreaChart, ReportBarChart, ReportPieChart } from '../charts/ReportCharts';

// Drilldown data type
export interface DrilldownData {
  title: string;
  description?: string;
  category: string;
  value: number;
  data: any[];
  metadata?: {
    [key: string]: any;
  };
}

// Drilldown modal props
interface DrilldownModalProps {
  open: boolean;
  onClose: () => void;
  drilldownData: DrilldownData | null;
}

/**
 * DrilldownModal component
 * Displays detailed information about a selected data point
 */
const DrilldownModal: React.FC<DrilldownModalProps> = ({
  open,
  onClose,
  drilldownData
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<number>(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format number
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  // Generate columns based on data
  const generateColumns = (): ColumnDef[] => {
    if (!drilldownData || !drilldownData.data || drilldownData.data.length === 0) {
      return [];
    }

    const firstItem = drilldownData.data[0];
    return Object.keys(firstItem).map(key => {
      // Skip id field
      if (key === 'id') {
        return {
          id: key,
          label: 'ID',
          sortable: true,
          hidden: true
        };
      }

      // Format date fields
      if (key.toLowerCase().includes('date') && typeof firstItem[key] === 'string' && firstItem[key].includes('T')) {
        return {
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          format: (value) => formatDate(new Date(value), 'MMM dd, yyyy')
        };
      }

      // Format currency fields
      if (
        key.toLowerCase().includes('amount') ||
        key.toLowerCase().includes('revenue') ||
        key.toLowerCase().includes('deposit') ||
        key.toLowerCase().includes('withdrawal') ||
        key.toLowerCase().includes('bet') ||
        key.toLowerCase().includes('win') ||
        key.toLowerCase().includes('ggr')
      ) {
        return {
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          type: 'currency',
          format: (value) => formatCurrency(value)
        };
      }

      // Format percentage fields
      if (
        key.toLowerCase().includes('percentage') ||
        key.toLowerCase().includes('rate') ||
        key.toLowerCase().includes('ratio')
      ) {
        return {
          id: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          sortable: true,
          format: (value) => formatPercentage(value)
        };
      }

      // Default format
      return {
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        sortable: true
      };
    });
  };

  // Get summary metrics
  const getSummaryMetrics = () => {
    if (!drilldownData || !drilldownData.data || drilldownData.data.length === 0) {
      return [];
    }

    const metrics = [];
    const data = drilldownData.data;

    // Add count metric
    metrics.push({
      label: 'Count',
      value: formatNumber(data.length)
    });

    // Add sum metrics for numeric fields
    const firstItem = data[0];
    Object.keys(firstItem).forEach(key => {
      if (typeof firstItem[key] === 'number') {
        // Skip id field
        if (key === 'id') return;

        const sum = data.reduce((acc, item) => acc + (item[key] || 0), 0);
        
        // Format based on field type
        let formattedValue;
        if (
          key.toLowerCase().includes('amount') ||
          key.toLowerCase().includes('revenue') ||
          key.toLowerCase().includes('deposit') ||
          key.toLowerCase().includes('withdrawal') ||
          key.toLowerCase().includes('bet') ||
          key.toLowerCase().includes('win') ||
          key.toLowerCase().includes('ggr')
        ) {
          formattedValue = formatCurrency(sum);
        } else if (
          key.toLowerCase().includes('percentage') ||
          key.toLowerCase().includes('rate') ||
          key.toLowerCase().includes('ratio')
        ) {
          // For percentages, calculate average instead of sum
          const avg = sum / data.length;
          formattedValue = formatPercentage(avg);
        } else {
          formattedValue = formatNumber(sum);
        }

        metrics.push({
          label: `Total ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}`,
          value: formattedValue
        });
      }
    });

    return metrics;
  };

  // Render chart based on data
  const renderChart = () => {
    if (!drilldownData || !drilldownData.data || drilldownData.data.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    const data = drilldownData.data;

    // Determine chart type based on data structure
    if (activeTab === 1) { // Bar Chart
      // Find numeric fields for y-axis
      const firstItem = data[0];
      const numericFields = Object.keys(firstItem).filter(key => 
        typeof firstItem[key] === 'number' && key !== 'id'
      );

      // Use date field for x-axis if available, otherwise use first string field
      let xField = Object.keys(firstItem).find(key => 
        key.toLowerCase().includes('date') && typeof firstItem[key] === 'string'
      );

      if (!xField) {
        xField = Object.keys(firstItem).find(key => 
          typeof firstItem[key] === 'string' && key !== 'id'
        );
      }

      if (!xField || numericFields.length === 0) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">Cannot generate chart from this data</Typography>
          </Box>
        );
      }

      return (
        <ReportBarChart
          data={data}
          xKey={xField}
          yKeys={numericFields.slice(0, 3)} // Limit to 3 metrics for readability
          height={400}
        />
      );
    } else if (activeTab === 2) { // Pie Chart
      // Find a categorical field and a numeric field
      const firstItem = data[0];
      const categoricalField = Object.keys(firstItem).find(key => 
        typeof firstItem[key] === 'string' && key !== 'id' && !key.toLowerCase().includes('date')
      );

      const numericField = Object.keys(firstItem).find(key => 
        typeof firstItem[key] === 'number' && key !== 'id'
      );

      if (!categoricalField || !numericField) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">Cannot generate pie chart from this data</Typography>
          </Box>
        );
      }

      // Aggregate data by category
      const aggregatedData = data.reduce((acc, item) => {
        const category = item[categoricalField] || 'Unknown';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += item[numericField] || 0;
        return acc;
      }, {});

      // Convert to array format for pie chart
      const pieData = Object.entries(aggregatedData).map(([name, value]) => ({
        name,
        value
      }));

      return (
        <ReportPieChart
          data={pieData}
          nameKey="name"
          valueKey="value"
          height={400}
        />
      );
    } else if (activeTab === 3) { // Area Chart
      // Find date field for x-axis
      const firstItem = data[0];
      const dateField = Object.keys(firstItem).find(key => 
        key.toLowerCase().includes('date') && typeof firstItem[key] === 'string'
      );

      // Find numeric fields for y-axis
      const numericFields = Object.keys(firstItem).filter(key => 
        typeof firstItem[key] === 'number' && key !== 'id'
      );

      if (!dateField || numericFields.length === 0) {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography color="text.secondary">Cannot generate area chart from this data</Typography>
          </Box>
        );
      }

      // Sort data by date
      const sortedData = [...data].sort((a, b) => 
        new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime()
      );

      return (
        <ReportAreaChart
          data={sortedData}
          xKey={dateField}
          yKeys={numericFields.slice(0, 3)} // Limit to 3 metrics for readability
          height={400}
        />
      );
    } else { // Table (default)
      return (
        <EnhancedTable
          columns={generateColumns()}
          data={data}
          idField="id"
          features={{
            sorting: true,
            filtering: {
              enabled: true,
              quickFilter: true
            },
            pagination: {
              enabled: true,
              defaultPageSize: 10,
              pageSizeOptions: [10, 25, 50]
            },
            columnManagement: {
              enabled: true,
              allowReordering: true,
              allowHiding: true
            }
          }}
        />
      );
    }
  };

  if (!drilldownData) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {drilldownData.title}
            {drilldownData.description && (
              <Tooltip title={drilldownData.description}>
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Category
              </Typography>
              <Typography variant="h5">
                {drilldownData.category}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Value
              </Typography>
              <Typography variant="h5">
                {typeof drilldownData.value === 'number' && drilldownData.value >= 1000
                  ? formatCurrency(drilldownData.value)
                  : formatNumber(drilldownData.value)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Records
              </Typography>
              <Typography variant="h5">
                {drilldownData.data.length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Summary Metrics
          </Typography>
          <Grid container spacing={2}>
            {getSummaryMetrics().map((metric, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {metric.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Tabs for different views */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="drilldown tabs">
            <Tab icon={<TableChartIcon />} label="Table" />
            <Tab icon={<BarChartIcon />} label="Bar Chart" />
            <Tab icon={<PieChartIcon />} label="Pie Chart" />
            <Tab icon={<TimelineIcon />} label="Trend" />
          </Tabs>
        </Box>

        {/* Content based on active tab */}
        <Box sx={{ mt: 2 }}>
          {renderChart()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => {
            // Export functionality would go here
            console.log('Export data', drilldownData);
          }}
        >
          Export
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrilldownModal;
