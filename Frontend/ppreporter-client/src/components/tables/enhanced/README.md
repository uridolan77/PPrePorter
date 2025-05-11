# Enhanced Table Component

A comprehensive, feature-rich table component for React applications built with Material-UI.

## Features

### Core Features

- **Sorting**: Sort data by any column
- **Filtering**: Quick search and advanced filtering
- **Pagination**: Navigate through large datasets
- **Grouping**: Group data by columns
- **Aggregation**: Calculate summaries (sum, average, etc.)
- **Column Management**: Reorder, hide, and pin columns
- **Expandable Rows**: Show additional details for rows
- **Keyboard Navigation**: Navigate the table with keyboard
- **Sticky Columns**: Pin columns while scrolling horizontally
- **Responsive Design**: Adapts to different screen sizes
- **Drill Down**: Navigate from aggregated data to detailed data
- **Export**: Export data in various formats (CSV, Excel, PDF, JSON)
- **State Management**: Save and restore table state
- **URL State**: Encode table state in URL parameters
- **Clickable Fields**: Open URLs from table cells

### Advanced Features

#### Data Manipulation

- **Tree/Hierarchical Data**: Display hierarchical data with parent-child relationships
- **Cell Merging/Spanning**: Allow cells to span multiple rows or columns
- **Infinite Scrolling**: Load more data as the user scrolls instead of pagination
- **Column Resizing**: Resize columns by dragging the column dividers
- **Search Highlighting**: Highlight search terms in the table cells
- **Undo/Redo**: Undo and redo actions (sorting, filtering, etc.)
- **Bulk Import/Export**: Import data from CSV/Excel and export to various formats
- **Column Calculations**: Add calculated columns based on other column values
- **Cell Tooltips**: Show tooltips with additional information when hovering over cells
- **Pivot Tables**: Transform data into a summarized pivot table view
- **Custom Aggregation Functions**: Define custom aggregation functions beyond standard ones

#### Visualization

- **Micro-Charts in Cells**: Embed small charts (sparklines, mini bar charts, etc.) directly in cells
- **Heatmap Visualization**: Apply color gradients to cells based on their values
- **Gantt Chart View**: Transform the table into a Gantt chart for project management

#### Integration & Performance

- **Real-time Updates with WebSockets**: Receive and apply real-time updates to table data
- **Worker Thread Processing**: Offload heavy data processing to a web worker
- **Progressive Loading**: Load and render complex cell content progressively

#### Customization

- **Theming and Styling System**: Comprehensive theming system with custom themes
- **Custom Cell Renderers**: Register custom cell renderers for specific column types
- **Layout Templates**: Predefined layout templates for common table use cases

## Installation

```bash
# No additional installation required if you already have Material-UI
```

## Basic Usage

```tsx
import { EnhancedTable } from 'components/tables/enhanced';

const MyComponent = () => {
  const data = [
    { id: 1, name: 'John Doe', age: 30, salary: 50000 },
    { id: 2, name: 'Jane Smith', age: 25, salary: 60000 },
    // ...
  ];

  const columns = [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'age', label: 'Age', type: 'number', align: 'right' },
    { id: 'salary', label: 'Salary', type: 'currency', align: 'right' },
  ];

  return (
    <EnhancedTable
      data={data}
      columns={columns}
      title="Employee Data"
      features={{
        sorting: true,
        filtering: true,
        pagination: true
      }}
    />
  );
};
```

## Props

### Basic Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `any[]` | Array of data objects to display |
| `columns` | `ColumnDef[]` | Column definitions |
| `title` | `string` | Table title |
| `loading` | `boolean` | Whether the table is loading |
| `emptyMessage` | `string` | Message to display when there is no data |
| `idField` | `string` | Field to use as unique identifier (default: 'id') |
| `sx` | `SxProps<Theme>` | Material-UI sx prop for styling |

### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onRowClick` | `(row: any) => void` | Called when a row is clicked |
| `onRefresh` | `() => void` | Called when the refresh button is clicked |
| `onExport` | `(format: ExportFormat, data: any[]) => void` | Called when exporting data |
| `onStateChange` | `(state: TableState) => void` | Called when table state changes |
| `onDrillDown` | `(row: any, sourceGrouping: string, targetGrouping: string, filters: Record<string, any>) => void` | Called when drilling down |

### Feature-Specific Props

| Prop | Type | Description |
|------|------|-------------|
| `renderRowDetail` | `(row: any) => React.ReactNode` | Render function for expandable row content |
| `initialState` | `Partial<TableState>` | Initial state for the table |
| `stateFromUrl` | `boolean` | Whether to encode state in URL parameters |

### Features Configuration

The `features` prop allows you to enable/disable and configure each feature:

```tsx
<EnhancedTable
  // ...
  features={{
    // Core features
    sorting: {
      enabled: true,
      defaultColumn: 'name',
      defaultDirection: 'asc'
    },
    filtering: {
      enabled: true,
      quickFilter: true,
      advancedFilter: true
    },
    pagination: {
      enabled: true,
      pageSizeOptions: [10, 25, 50, 100]
    },
    grouping: {
      enabled: true,
      defaultGroupBy: null
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
      enabled: true,
      expandByDefault: false
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
      configs: [/* drill-down configurations */]
    },
    export: {
      enabled: true,
      formats: [ExportFormat.CSV, ExportFormat.EXCEL, ExportFormat.PDF, ExportFormat.JSON]
    },
    stateManagement: {
      enabled: true,
      persistInUrl: true
    },

    // Advanced features - Data Manipulation
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
      enabled: true,
      loadMoreThreshold: 200,
      pageSize: 50
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
        // Validation logic
        return { valid: true, errors: [] };
      }
    },
    columnCalculations: {
      enabled: true,
      recalculateOnDataChange: true
    },
    pivotTable: {
      enabled: true,
      rowFields: ['category', 'subcategory'],
      columnFields: ['year', 'quarter'],
      valueField: 'sales',
      aggregationFunction: 'sum',
      valueFormat: 'currency',
      showTotals: true
    },
    customAggregations: {
      enabled: true,
      functions: {
        weightedAverage: (values, weights) => {
          // Custom weighted average implementation
          if (!weights || values.length !== weights.length) return 0;
          let sum = 0, weightSum = 0;
          for (let i = 0; i < values.length; i++) {
            sum += values[i] * weights[i];
            weightSum += weights[i];
          }
          return sum / (weightSum || 1);
        }
      }
    },

    // Advanced features - Visualization
    heatmap: {
      enabled: true,
      minValue: 0,
      maxValue: 100,
      minColor: '#FFFFFF',
      maxColor: '#FF0000',
      adaptiveText: true
    },
    ganttChart: {
      enabled: true,
      startField: 'startDate',
      endField: 'endDate',
      taskField: 'taskName',
      progressField: 'completion',
      showProgress: true,
      showToday: true
    },

    // Advanced features - Integration & Performance
    realtime: {
      enabled: true,
      websocketUrl: 'wss://example.com/ws',
      messageTypes: {
        rowAdded: 'ROW_ADDED',
        rowUpdated: 'ROW_UPDATED',
        rowDeleted: 'ROW_DELETED'
      },
      reconnectStrategy: {
        maxRetries: 5,
        backoffFactor: 1.5
      }
    },
    workerProcessing: {
      enabled: true,
      workerUrl: '/workers/table-worker.js',
      operations: ['sort', 'filter', 'aggregate']
    },
    progressiveLoading: {
      enabled: true,
      priorityColumns: ['name', 'status'],
      deferredColumns: ['description', 'comments'],
      loadDelay: 100
    },

    // Advanced features - Customization
    theming: {
      enabled: true,
      theme: 'light', // or 'dark', 'highContrast'
      customTheme: {
        header: {
          backgroundColor: '#f5f5f5',
          textColor: '#333333'
        },
        row: {
          evenBackgroundColor: '#ffffff',
          oddBackgroundColor: '#fafafa',
          hoverBackgroundColor: '#f0f0f0'
        }
      }
    },
    customRenderers: {
      enabled: true,
      renderers: {
        'status': (value, row) => (
          <Chip label={value} color={getStatusColor(value)} size="small" />
        )
      },
      conditionalRenderers: [
        {
          condition: (value, row, column) => column.id === 'price' && value > 1000,
          renderer: (value) => <Typography color="error">${value}</Typography>
        }
      ]
    },
    layoutTemplates: {
      enabled: true,
      template: 'standard', // or 'compact', 'comfortable', 'dashboard', etc.
      customLayouts: {
        'myCustomLayout': {
          headerHeight: 60,
          rowHeight: 50,
          density: 'comfortable',
          showBorders: true
        }
      }
    }
  }}
/>
```

## Column Definition

```tsx
interface ColumnDef {
  id: string;                // Unique identifier
  label: string;             // Display label
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: any) => React.ReactNode;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'status' | 'sparkline' | 'progress' | 'bars' | 'link';
  wrap?: boolean;            // Whether to wrap text
  maxWidth?: string;         // Maximum width
  valueKey?: string;         // For complex types
  comparativeKey?: string;   // For complex types
  target?: number;           // For progress bars
  sortable?: boolean;        // Whether column is sortable
  cellProps?: Record<string, any>; // Additional props for cell

  // Link configuration
  linkConfig?: {             // For link type columns
    urlField?: string;       // Field containing URL
    urlPrefix?: string;      // Prefix to add to URL
    urlSuffix?: string;      // Suffix to add to URL
    urlBuilder?: (row: any) => string; // Custom URL builder
    openInNewTab?: boolean;  // Whether to open in new tab
    displayField?: string;   // Field to display
  };

  // Core feature properties
  hidden?: boolean;          // Whether column is hidden
  pinned?: boolean;          // Whether column is pinned
  groupable?: boolean;       // Whether column can be grouped
  filterable?: boolean;      // Whether column can be filtered
  aggregatable?: boolean;    // Whether column can be aggregated
  drillDownTarget?: string;  // Target for drill-down

  // Advanced feature properties
  spanConfig?: {             // Cell spanning configuration
    rowSpan?: number | ((row: any, rowIndex: number, data: any[]) => number);
    colSpan?: number | ((row: any, rowIndex: number, data: any[]) => number);
  };

  tooltip?: {                // Tooltip configuration
    enabled: boolean;
    content?: React.ReactNode | ((value: any, row: any) => React.ReactNode);
    placement?: 'top' | 'right' | 'bottom' | 'left';
    props?: Partial<TooltipProps>;
  };

  calculated?: boolean;      // Whether column is calculated
  formula?: (row: any) => any; // Formula for calculated column

  treeColumn?: boolean;      // Whether column displays tree structure
}
```

## Examples

See the `examples` directory for complete examples:

- `BasicExample.tsx`: Basic usage with all features enabled
- `CustomizationExample.tsx`: Customizing the appearance and behavior
- `ServerSideExample.tsx`: Using with server-side data and operations

## Advanced Usage

### State Management

The table state can be saved and restored:

```tsx
const [tableState, setTableState] = useState<TableState | null>(null);

const handleStateChange = (state: TableState) => {
  setTableState(state);
  // Save to localStorage, server, etc.
};

return (
  <EnhancedTable
    // ...
    initialState={savedState}
    onStateChange={handleStateChange}
  />
);
```

### URL State

The table state can be encoded in URL parameters:

```tsx
<EnhancedTable
  // ...
  stateFromUrl={true}
  features={{
    // ...
    stateManagement: {
      enabled: true,
      persistInUrl: true
    }
  }}
/>
```

### Clickable Fields

Columns can be made clickable to open URLs:

```tsx
const columns = [
  // ...
  {
    id: 'website',
    label: 'Website',
    type: 'link',
    linkConfig: {
      urlField: 'website',
      openInNewTab: true
    }
  }
];
```

## License

MIT
