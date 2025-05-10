import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  SelectChangeEvent
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import { CommonProps } from '../../types/common';

// Type definitions
export interface ColumnConfig {
  id: string;
  name: string;
  type: string;
  width: string;
  visible: boolean;
  aggregation: string | null;
  renderer?: (value: any) => React.ReactNode;
}

export interface FilterConfig {
  column: string;
  operator: string;
  value: string;
}

export interface SortConfig {
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface GroupConfig {
  columnId: string;
}

export interface DataSource {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ReportConfig {
  name: string;
  description: string;
  dataSource: DataSource | null;
  filters: FilterConfig[];
  columns: ColumnConfig[];
  sortBy: SortConfig | null;
  groupBy: GroupConfig | null;
  [key: string]: any;
}

export interface ReportPreviewProps extends CommonProps {
  config: ReportConfig;
  data?: any[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onDownload?: () => void;
  onConfigChange?: (config: ReportConfig) => void;
}

/**
 * Component for previewing a report with the configured settings
 */
const ReportPreview: React.FC<ReportPreviewProps> = ({
  config,
  data = [],
  loading = false,
  error = null,
  onRefresh,
  onDownload,
  onConfigChange
}) => {
  const [previewLimit, setPreviewLimit] = useState<number>(10);

  // Handle preview limit change
  const handleLimitChange = (event: SelectChangeEvent<number>): void => {
    setPreviewLimit(event.target.value as number);
  };

  // Filter columns to only show visible ones and in the correct order
  const getVisibleColumns = (): ColumnConfig[] => {
    return config.columns.filter(column => column.visible);
  };

  // Format cell value based on column type
  const formatCellValue = (value: any, column: ColumnConfig): React.ReactNode => {
    if (value === null || value === undefined) {
      return '-';
    }

    // If the column has a renderer function, use it
    if (column.renderer) {
      return column.renderer(value);
    }

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'currency':
        return typeof value === 'number'
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
          : value;
      case 'percentage':
        return typeof value === 'number'
          ? `${value.toFixed(2)}%`
          : value;
      default:
        return value;
    }
  };

  // Get cell alignment based on column type
  const getCellAlignment = (column: ColumnConfig): 'left' | 'right' | 'center' => {
    switch (column.type) {
      case 'number':
      case 'currency':
      case 'percentage':
        return 'right';
      default:
        return 'left';
    }
  };

  // Get column width based on configuration
  const getColumnWidth = (width: string): React.CSSProperties => {
    switch (width) {
      case 'small':
        return { width: 100, maxWidth: 100 };
      case 'medium':
        return { width: 150, maxWidth: 150 };
      case 'large':
        return { width: 200, maxWidth: 200 };
      default:
        return {};
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Report Preview
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="preview-limit-label">Preview Rows</InputLabel>
            <Select<number>
              labelId="preview-limit-label"
              value={previewLimit}
              onChange={handleLimitChange}
              label="Preview Rows"
            >
              <MenuItem value={5}>5 rows</MenuItem>
              <MenuItem value={10}>10 rows</MenuItem>
              <MenuItem value={20}>20 rows</MenuItem>
              <MenuItem value={50}>50 rows</MenuItem>
            </Select>
          </FormControl>

          {onRefresh && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          )}

          {onDownload && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
              disabled={loading || !!error || data.length === 0}
            >
              Download
            </Button>
          )}
        </Box>
      </Box>

      {/* Report configuration summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Report Configuration
        </Typography>

        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<TableChartIcon />}
            label={config.dataSource?.name || 'No data source selected'}
            color={config.dataSource ? 'primary' : 'default'}
            variant="outlined"
          />
          <Chip
            icon={<ViewColumnIcon />}
            label={`${getVisibleColumns().length} columns`}
            variant="outlined"
          />
          <Chip
            icon={<FilterListIcon />}
            label={`${config.filters.length} filters`}
            variant="outlined"
          />
          {config.sortBy && (
            <Chip
              label={`Sorted by ${config.columns.find(col => col.id === config.sortBy?.columnId)?.name || ''} (${config.sortBy?.direction === 'asc' ? 'Ascending' : 'Descending'})`}
              variant="outlined"
            />
          )}
          {config.groupBy && (
            <Chip
              label={`Grouped by ${config.columns.find(col => col.id === config.groupBy?.columnId)?.name || ''}`}
              variant="outlined"
            />
          )}
        </Stack>
      </Paper>

      {/* Data preview */}
      <Paper variant="outlined">
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : data.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No data available for preview with the current configuration.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or data source selection.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {getVisibleColumns().map((column) => (
                    <TableCell
                      key={column.id}
                      align={getCellAlignment(column)}
                      style={getColumnWidth(column.width)}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {column.name}
                      {column.aggregation && (
                        <Chip
                          label={column.aggregation}
                          size="small"
                          color="secondary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.slice(0, previewLimit).map((row, rowIndex) => (
                  <TableRow key={`row-${rowIndex}`} hover>
                    {getVisibleColumns().map((column) => (
                      <TableCell
                        key={`${rowIndex}-${column.id}`}
                        align={getCellAlignment(column)}
                      >
                        {formatCellValue(row[column.id], column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {data.length > previewLimit && (
          <Box sx={{ p: 2, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {previewLimit} of {data.length} rows. Download the full report to see all data.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ReportPreview;
