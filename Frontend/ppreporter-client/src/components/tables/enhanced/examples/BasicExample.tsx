import React, { useState } from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { EnhancedTable, ExportFormat, TableState } from '../';

// Sample data
const sampleData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    age: 32,
    salary: 75000,
    department: 'Engineering',
    status: 'Active',
    hireDate: '2020-01-15',
    website: 'https://johndoe.com'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    age: 28,
    salary: 82000,
    department: 'Marketing',
    status: 'Active',
    hireDate: '2019-05-20',
    website: 'https://janesmith.com'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    age: 45,
    salary: 95000,
    department: 'Finance',
    status: 'Inactive',
    hireDate: '2015-11-10',
    website: 'https://bobjohnson.com'
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    age: 36,
    salary: 88000,
    department: 'Engineering',
    status: 'Active',
    hireDate: '2018-03-25',
    website: 'https://alicewilliams.com'
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    age: 41,
    salary: 110000,
    department: 'Management',
    status: 'Active',
    hireDate: '2016-07-12',
    website: 'https://charliebrown.com'
  }
];

// Column definitions
const columns = [
  {
    id: 'name',
    label: 'Name',
    type: 'text' as 'text',
    groupable: true
  },
  {
    id: 'email',
    label: 'Email',
    type: 'text' as 'text'
  },
  {
    id: 'age',
    label: 'Age',
    type: 'number' as 'number',
    align: 'right' as 'right',
    aggregatable: true
  },
  {
    id: 'salary',
    label: 'Salary',
    type: 'currency' as 'currency',
    align: 'right' as 'right',
    aggregatable: true
  },
  {
    id: 'department',
    label: 'Department',
    type: 'text' as 'text',
    groupable: true
  },
  {
    id: 'status',
    label: 'Status',
    type: 'text' as 'text'
  },
  {
    id: 'hireDate',
    label: 'Hire Date',
    type: 'text' as 'text'
  },
  {
    id: 'website',
    label: 'Website',
    type: 'link' as 'link',
    linkConfig: {
      urlField: 'website',
      openInNewTab: true
    }
  }
];

// Drill-down configurations
const drillDownConfigs = [
  {
    sourceGrouping: 'department',
    targetGrouping: 'employee',
    label: 'View Employees',
    enabled: true,
    transformFilter: (row: any) => ({
      department: row.department
    })
  }
];

/**
 * Basic example of using the EnhancedTable component
 */
const BasicExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableState, setTableState] = useState<TableState | null>(null);

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
  const handleDrillDown = (_row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => {
    console.log(`Drill down from ${sourceGrouping} to ${targetGrouping}:`, filters);
    // In a real app, you would update the data based on the filters
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Enhanced Table Example
        </Typography>
        <Typography variant="body2" paragraph>
          This example demonstrates the features of the EnhancedTable component.
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
          data={sampleData}
          columns={columns}
          title="Employee Data"
          loading={loading}
          emptyMessage="No employees found"
          idField="id"
          onRowClick={handleRowClick}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onStateChange={handleStateChange}
          onDrillDown={handleDrillDown}
          renderRowDetail={(row) => (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Employee Details
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {row.name}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {row.email}
              </Typography>
              <Typography variant="body2">
                <strong>Department:</strong> {row.department}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {row.status}
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
              configs: drillDownConfigs
            },
            export: {
              enabled: true,
              formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF, ExportFormat.JSON]
            },
            stateManagement: {
              enabled: true,
              persistInUrl: true
            }
          }}
          stateFromUrl={true}
        />
      </Paper>
    </Container>
  );
};

export default BasicExample;
