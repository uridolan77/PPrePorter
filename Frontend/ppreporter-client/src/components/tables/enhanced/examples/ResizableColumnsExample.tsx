import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import EnhancedTable from '../EnhancedTable';
import { ColumnDef, ExportFormat } from '../types';

// Sample data
const generateData = (count: number) => {
  const data = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      id: i,
      name: `Item ${i}`,
      category: ['Electronics', 'Clothing', 'Food', 'Books', 'Sports'][Math.floor(Math.random() * 5)],
      price: Math.floor(Math.random() * 1000) / 10,
      stock: Math.floor(Math.random() * 100),
      rating: Math.floor(Math.random() * 50) / 10,
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
    });
  }
  return data;
};

// Column definitions
const columns: ColumnDef[] = [
  {
    id: 'id',
    label: 'ID',
    align: 'right',
    width: 80,
    minWidth: 60,
    maxWidth: '120px'
  },
  {
    id: 'name',
    label: 'Name',
    width: 200,
    minWidth: 150,
    maxWidth: '300px'
  },
  {
    id: 'category',
    label: 'Category',
    width: 150,
    minWidth: 100,
    maxWidth: '200px'
  },
  {
    id: 'price',
    label: 'Price',
    type: 'currency',
    align: 'right',
    width: 120,
    minWidth: 80,
    maxWidth: '150px'
  },
  {
    id: 'stock',
    label: 'Stock',
    type: 'number',
    align: 'right',
    width: 100,
    minWidth: 80,
    maxWidth: '150px'
  },
  {
    id: 'rating',
    label: 'Rating',
    type: 'number',
    align: 'right',
    width: 100,
    minWidth: 80,
    maxWidth: '150px'
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    type: 'date',
    width: 180,
    minWidth: 150,
    maxWidth: '250px',
    format: (value) => new Date(value).toLocaleString()
  }
];

/**
 * Example component demonstrating resizable and reorderable columns
 */
const ResizableColumnsExample: React.FC = () => {
  const [data] = useState(generateData(50));
  const [loading, setLoading] = useState(false);

  // Handle row click
  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Handle export
  const handleExport = (format: ExportFormat, data: any[]) => {
    console.log(`Exporting ${data.length} rows in ${format} format`);
  };

  // Handle state change
  const handleStateChange = (state: any) => {
    console.log('Table state changed:', state);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Resizable and Reorderable Columns Example
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This example demonstrates columns that can be resized by dragging the edge of the column header,
        and reordered by dragging the entire column header.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <EnhancedTable
          data={data}
          columns={columns}
          title="Product Inventory"
          loading={loading}
          emptyMessage="No products available"
          idField="id"
          onRowClick={handleRowClick}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onStateChange={handleStateChange}
          features={{
            sorting: true,
            filtering: {
              enabled: true,
              quickFilter: true
            },
            pagination: {
              enabled: true,
              pageSizeOptions: [10, 25, 50]
            },
            columnManagement: {
              enabled: true,
              allowReordering: true,
              allowHiding: true,
              allowResizing: true
            },
            columnResizing: {
              enabled: true,
              minWidth: 60,
              maxWidth: 500,
              persistWidths: true
            },
            export: {
              enabled: true,
              formats: [ExportFormat.CSV, ExportFormat.EXCEL]
            }
          }}
        />
      </Box>
    </Paper>
  );
};

export default ResizableColumnsExample;
