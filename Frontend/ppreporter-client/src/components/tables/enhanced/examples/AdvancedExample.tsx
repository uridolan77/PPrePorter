import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button } from '@mui/material';
import {
  EnhancedTable,
  ExportFormat,
  TableState,
  CalculationFunctions,
  createCalculatedColumn
} from '../';

// Sample hierarchical data
const sampleTreeData = [
  {
    id: '1',
    name: 'Electronics',
    children: ['2', '3', '4'],
    sales: 250000,
    profit: 75000,
    growth: 12.5
  },
  {
    id: '2',
    name: 'Computers',
    children: ['5', '6'],
    sales: 120000,
    profit: 36000,
    growth: 8.2
  },
  {
    id: '3',
    name: 'Smartphones',
    children: ['7', '8'],
    sales: 85000,
    profit: 25500,
    growth: 15.3
  },
  {
    id: '4',
    name: 'Accessories',
    children: ['9', '10'],
    sales: 45000,
    profit: 13500,
    growth: 10.1
  },
  {
    id: '5',
    name: 'Laptops',
    sales: 75000,
    profit: 22500,
    growth: 7.5
  },
  {
    id: '6',
    name: 'Desktops',
    sales: 45000,
    profit: 13500,
    growth: 5.2
  },
  {
    id: '7',
    name: 'iPhones',
    sales: 50000,
    profit: 15000,
    growth: 18.7
  },
  {
    id: '8',
    name: 'Android Phones',
    sales: 35000,
    profit: 10500,
    growth: 12.4
  },
  {
    id: '9',
    name: 'Headphones',
    sales: 25000,
    profit: 7500,
    growth: 9.8
  },
  {
    id: '10',
    name: 'Chargers',
    sales: 20000,
    profit: 6000,
    growth: 11.2
  }
];

// Column definitions
const columns = [
  {
    id: 'name',
    label: 'Category',
    type: 'text' as 'text',
    treeColumn: true,
    tooltip: {
      enabled: true,
      content: (value: any, row: any) => `${value} - Click to see details`
    }
  },
  {
    id: 'sales',
    label: 'Sales',
    type: 'currency' as 'currency',
    align: 'right' as 'right',
    aggregatable: true,
    tooltip: {
      enabled: true,
      content: (value: any, row: any) => `Annual sales: ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)}`
    }
  },
  {
    id: 'profit',
    label: 'Profit',
    type: 'currency' as 'currency',
    align: 'right' as 'right',
    aggregatable: true
  },
  {
    id: 'growth',
    label: 'Growth',
    type: 'percentage' as 'percentage',
    align: 'right' as 'right'
  },
  {
    id: 'profitMargin',
    label: 'Profit Margin',
    type: 'percentage' as 'percentage',
    align: 'right' as 'right',
    calculated: true,
    formula: (row: any) => (row.profit / row.sales) * 100
  },
  {
    id: 'website',
    label: 'Website',
    type: 'link' as 'link',
    linkConfig: {
      urlBuilder: (row: any) => `https://example.com/products/${row.id}`,
      openInNewTab: true,
      displayField: 'name'
    }
  }
];

// Cell spanning example
const spanningColumns = [
  ...columns,
  {
    id: 'performance',
    label: 'Performance',
    type: 'text' as 'text',
    spanConfig: {
      colSpan: (row: any) => row.id === '1' ? 2 : 1
    }
  }
];

/**
 * Advanced example of using the EnhancedTable component with all features
 */
const AdvancedExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableState, setTableState] = useState<TableState | null>(null);
  const [data, setData] = useState(sampleTreeData);
  const [page, setPage] = useState(0);

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
    // In a real app, you would implement the export functionality here
  };

  // Handle state change
  const handleStateChange = (state: TableState) => {
    setTableState(state);
    console.log('Table state changed:', state);
  };

  // Handle drill down
  const handleDrillDown = (row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => {
    console.log(`Drill down from ${sourceGrouping} to ${targetGrouping}:`, filters);
    // In a real app, you would update the data based on the filters
  };

  // Handle column resize
  const handleColumnResize = (columnId: string, width: number) => {
    console.log(`Column ${columnId} resized to ${width}px`);
  };

  // Handle load more for infinite scrolling
  const handleLoadMore = (page: number) => {
    console.log(`Loading page ${page}`);
    setPage(page);

    // Simulate loading more data
    setLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch more data and append it
      setLoading(false);
    }, 1000);
  };

  // Handle undo
  const handleUndo = () => {
    console.log('Undo action');
  };

  // Handle redo
  const handleRedo = () => {
    console.log('Redo action');
  };

  // Handle import
  const handleImport = (importedData: any[]) => {
    console.log('Imported data:', importedData);
    // In a real app, you would process and add the imported data
  };

  // Add a calculated column
  const profitPerGrowthColumn = createCalculatedColumn(
    'profitPerGrowth',
    'Profit per Growth',
    CalculationFunctions.custom(
      'profit / growth',
      { profit: 'profit', growth: 'growth' }
    ),
    {
      type: 'currency',
      align: 'right' as 'right'
    }
  );

  const allColumns = [...columns, profitPerGrowthColumn];

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Advanced Table Example
        </Typography>
        <Typography variant="body2" paragraph>
          This example demonstrates all the advanced features of the EnhancedTable component.
        </Typography>

        {tableState && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Current Table State:</Typography>
            <pre style={{ overflow: 'auto', maxHeight: 200 }}>
              {JSON.stringify(tableState, null, 2)}
            </pre>
          </Box>
        )}

        <EnhancedTable
          data={data}
          columns={allColumns}
          title="Product Categories"
          loading={loading}
          emptyMessage="No data available"
          idField="id"
          onRowClick={handleRowClick}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onStateChange={handleStateChange}
          onDrillDown={handleDrillDown}
          onColumnResize={handleColumnResize}
          onLoadMore={handleLoadMore}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onImport={handleImport}
          renderRowDetail={(row) => (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {row.name} Details
              </Typography>
              <Typography variant="body2">
                <strong>Sales:</strong> {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(row.sales)}
              </Typography>
              <Typography variant="body2">
                <strong>Profit:</strong> {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(row.profit)}
              </Typography>
              <Typography variant="body2">
                <strong>Growth:</strong> {row.growth}%
              </Typography>
              <Typography variant="body2">
                <strong>Profit Margin:</strong> {((row.profit / row.sales) * 100).toFixed(2)}%
              </Typography>
            </Box>
          )}
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
            keyboardNavigation: {
              enabled: true
            },
            stickyColumns: {
              enabled: true
            },
            responsive: {
              enabled: true
            },
            drillDown: {
              enabled: true,
              configs: [
                {
                  sourceGrouping: 'category',
                  targetGrouping: 'subcategory',
                  label: 'View Subcategories',
                  enabled: true
                }
              ]
            },
            export: {
              enabled: true,
              formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF, ExportFormat.JSON]
            },
            stateManagement: {
              enabled: true,
              persistInUrl: true
            },

            // New features
            treeData: {
              enabled: true,
              childField: 'children',
              expandByDefault: false,
              levelIndent: 20
            },
            cellSpanning: {
              enabled: true
            },
            infiniteScroll: {
              enabled: false, // Disabled for this example, but can be enabled
              loadMoreThreshold: 200,
              pageSize: 10
            },
            columnResizing: {
              enabled: true,
              minWidth: 100,
              maxWidth: 500,
              persistWidths: true
            },
            searchHighlighting: {
              enabled: true,
              highlightStyle: {
                backgroundColor: 'yellow',
                fontWeight: 'bold'
              }
            },
            history: {
              enabled: true,
              maxHistoryLength: 50
            },
            bulkImport: {
              enabled: true,
              formats: ['csv', 'json', 'excel'],
              validateRow: (row) => {
                // Simple validation example
                if (!row.name) {
                  return { valid: false, errors: ['Name is required'] };
                }
                return { valid: true, errors: [] };
              }
            },
            columnCalculations: {
              enabled: true,
              recalculateOnDataChange: true
            }
          }}
          stateFromUrl={true}
        />
      </Paper>
    </Container>
  );
};

export default AdvancedExample;
