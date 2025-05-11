import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Tab, Tabs } from '@mui/material';
import {
  EnhancedTable,
  ExportFormat,
  TableState,
  BaseColumnDef,
  StandardAggregations,
  PivotTable,
  GanttChart
} from '../';

// Sample data for sales performance
const salesData = [
  {
    id: '1',
    category: 'Electronics',
    product: 'Laptop',
    region: 'North',
    salesperson: 'John Smith',
    date: '2023-01-15',
    quantity: 12,
    unitPrice: 1200,
    discount: 10,
    status: 'Completed',
    rating: 4.5,
    trendData: [120, 132, 101, 134, 90, 230, 210],
    startDate: '2023-01-01',
    endDate: '2023-01-20',
    progress: 100
  },
  {
    id: '2',
    category: 'Electronics',
    product: 'Smartphone',
    region: 'South',
    salesperson: 'Jane Doe',
    date: '2023-01-20',
    quantity: 25,
    unitPrice: 800,
    discount: 5,
    status: 'Completed',
    rating: 4.2,
    trendData: [220, 182, 191, 234, 290, 330, 310],
    startDate: '2023-01-05',
    endDate: '2023-01-25',
    progress: 100
  },
  {
    id: '3',
    category: 'Furniture',
    product: 'Office Chair',
    region: 'East',
    salesperson: 'Robert Johnson',
    date: '2023-02-05',
    quantity: 8,
    unitPrice: 350,
    discount: 0,
    status: 'Processing',
    rating: 3.8,
    trendData: [150, 232, 201, 154, 190, 230, 210],
    startDate: '2023-02-01',
    endDate: '2023-02-15',
    progress: 60
  },
  {
    id: '4',
    category: 'Furniture',
    product: 'Desk',
    region: 'West',
    salesperson: 'Sarah Williams',
    date: '2023-02-10',
    quantity: 5,
    unitPrice: 500,
    discount: 15,
    status: 'Pending',
    rating: 4.0,
    trendData: [120, 132, 101, 134, 90, 230, 210],
    startDate: '2023-02-05',
    endDate: '2023-02-20',
    progress: 30
  },
  {
    id: '5',
    category: 'Clothing',
    product: 'T-Shirt',
    region: 'North',
    salesperson: 'John Smith',
    date: '2023-03-01',
    quantity: 50,
    unitPrice: 25,
    discount: 0,
    status: 'Completed',
    rating: 4.1,
    trendData: [320, 332, 301, 334, 390, 330, 320],
    startDate: '2023-02-25',
    endDate: '2023-03-10',
    progress: 100
  },
  {
    id: '6',
    category: 'Clothing',
    product: 'Jeans',
    region: 'South',
    salesperson: 'Jane Doe',
    date: '2023-03-05',
    quantity: 30,
    unitPrice: 60,
    discount: 10,
    status: 'Completed',
    rating: 4.3,
    trendData: [20, 132, 101, 134, 190, 230, 110],
    startDate: '2023-03-01',
    endDate: '2023-03-15',
    progress: 100
  },
  {
    id: '7',
    category: 'Electronics',
    product: 'Tablet',
    region: 'East',
    salesperson: 'Robert Johnson',
    date: '2023-03-15',
    quantity: 15,
    unitPrice: 400,
    discount: 5,
    status: 'Processing',
    rating: 3.9,
    trendData: [220, 132, 201, 134, 290, 130, 210],
    startDate: '2023-03-10',
    endDate: '2023-03-25',
    progress: 75
  },
  {
    id: '8',
    category: 'Furniture',
    product: 'Bookshelf',
    region: 'West',
    salesperson: 'Sarah Williams',
    date: '2023-03-20',
    quantity: 3,
    unitPrice: 250,
    discount: 0,
    status: 'Pending',
    rating: 3.5,
    trendData: [120, 132, 101, 134, 90, 230, 210],
    startDate: '2023-03-15',
    endDate: '2023-03-30',
    progress: 20
  }
];

// Column definitions
const columns: BaseColumnDef[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'text',
    groupable: true
  },
  {
    id: 'product',
    label: 'Product',
    type: 'text',
    groupable: true,
    tooltip: {
      enabled: true,
      content: (value: any, row: any) => `${value} - ${row.category}`
    }
  },
  {
    id: 'region',
    label: 'Region',
    type: 'text',
    groupable: true
  },
  {
    id: 'salesperson',
    label: 'Salesperson',
    type: 'user',
    groupable: true
  },
  {
    id: 'date',
    label: 'Date',
    type: 'date',
    dateFormat: 'medium'
  },
  {
    id: 'quantity',
    label: 'Quantity',
    type: 'number',
    align: 'right',
    aggregatable: true
  },
  {
    id: 'unitPrice',
    label: 'Unit Price',
    type: 'currency',
    align: 'right',
    aggregatable: true,
    heatmap: {
      enabled: true,
      minValue: 0,
      maxValue: 1500,
      minColor: '#FFFFFF',
      maxColor: '#FF0000',
      adaptiveText: true
    }
  },
  {
    id: 'discount',
    label: 'Discount %',
    type: 'percentage',
    align: 'right'
  },
  {
    id: 'totalSale',
    label: 'Total Sale',
    type: 'currency',
    align: 'right',
    calculated: true,
    formula: (row: any) => row.quantity * row.unitPrice * (1 - row.discount / 100),
    aggregatable: true
  },
  {
    id: 'status',
    label: 'Status',
    type: 'status'
  },
  {
    id: 'rating',
    label: 'Rating',
    type: 'rating',
    ratingMax: 5
  },
  {
    id: 'progress',
    label: 'Progress',
    type: 'progress',
    progressColor: 'success',
    showProgressValue: true
  },
  {
    id: 'trend',
    label: 'Trend',
    type: 'microChart',
    microChartConfig: {
      type: 'sparkline',
      dataField: 'trendData',
      width: 100,
      height: 30,
      color: '#1976d2',
      showArea: true
    }
  }
];

// Custom aggregation function
const weightedAverage = (values: number[], weights: number[]) => {
  if (!weights || values.length !== weights.length || values.length === 0) {
    return StandardAggregations.avg(values);
  }

  let sum = 0;
  let weightSum = 0;

  for (let i = 0; i < values.length; i++) {
    sum += values[i] * weights[i];
    weightSum += weights[i];
  }

  return sum / (weightSum || 1);
};

/**
 * Advanced features example
 */
const AdvancedFeaturesExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  // State for table configuration
  const [, setTableState] = useState<TableState | null>(null);
  const [data, setData] = useState(salesData);
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle row click
  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Handle export
  const handleExport = (format: ExportFormat, data: any[]) => {
    console.log(`Exporting data in ${format} format:`, data);
  };

  // Handle state change
  const handleStateChange = (state: TableState) => {
    setTableState(state);
  };

  // Handle import
  const handleImport = (importedData: any[]) => {
    console.log('Imported data:', importedData);
    setData([...data, ...importedData]);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Advanced Features Example
        </Typography>
        <Typography variant="body2" paragraph>
          This example demonstrates the advanced features of the EnhancedTable component.
        </Typography>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Enhanced Table" />
          <Tab label="Pivot Table" />
          <Tab label="Gantt Chart" />
        </Tabs>

        {activeTab === 0 && (
          <EnhancedTable
            data={data}
            columns={columns}
            title="Sales Performance"
            loading={loading}
            emptyMessage="No sales data available"
            idField="id"
            onRowClick={handleRowClick}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onStateChange={handleStateChange}
            onImport={handleImport}
            features={{
              sorting: true,
              filtering: {
                enabled: true,
                quickFilter: true,
                advancedFilter: true
              },
              pagination: {
                enabled: true,
                pageSizeOptions: [5, 10, 25, 50]
              },
              grouping: {
                enabled: true
              },
              aggregation: {
                enabled: true,
                showInFooter: true
              },
              columnManagement: {
                enabled: true,
                allowReordering: true,
                allowHiding: true,
                allowPinning: true
              },
              expandableRows: {
                enabled: true
              },
              export: {
                enabled: true,
                formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF, ExportFormat.JSON]
              },

              // Advanced features
              heatmap: {
                enabled: true
              },
              searchHighlighting: {
                enabled: true,
                highlightStyle: {
                  backgroundColor: 'yellow',
                  fontWeight: 'bold'
                }
              },
              columnResizing: {
                enabled: true,
                minWidth: 100,
                maxWidth: 500
              },
              bulkImport: {
                enabled: true,
                formats: ['csv', 'json']
              },
              columnCalculations: {
                enabled: true
              },
              customAggregations: {
                enabled: true,
                functions: {
                  weightedAverage
                }
              },
              customRenderers: {
                enabled: true
              },
              theming: {
                enabled: true,
                theme: 'light'
              },
              layoutTemplates: {
                enabled: true,
                template: 'standard'
              }
            }}
            renderRowDetail={(row) => (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {row.product} Details
                </Typography>
                <Typography variant="body2">
                  <strong>Category:</strong> {row.category}
                </Typography>
                <Typography variant="body2">
                  <strong>Region:</strong> {row.region}
                </Typography>
                <Typography variant="body2">
                  <strong>Salesperson:</strong> {row.salesperson}
                </Typography>
                <Typography variant="body2">
                  <strong>Total Sale:</strong> ${(row.quantity * row.unitPrice * (1 - row.discount / 100)).toFixed(2)}
                </Typography>
              </Box>
            )}
          />
        )}

        {activeTab === 1 && (
          <PivotTable
            data={data}
            config={{
              enabled: true,
              rowFields: ['category', 'product'],
              columnFields: ['region'],
              valueField: 'totalSale',
              aggregationFunction: 'sum',
              valueFormat: 'currency',
              showTotals: true
            }}
          />
        )}

        {activeTab === 2 && (
          <GanttChart
            data={data}
            config={{
              enabled: true,
              startField: 'startDate',
              endField: 'endDate',
              taskField: 'product',
              progressField: 'progress',
              showProgress: true,
              showToday: true,
              showWeekends: true
            }}
          />
        )}
      </Paper>
    </Container>
  );
};

export default AdvancedFeaturesExample;
