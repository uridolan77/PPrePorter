import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SimpleBox from '../../../../components/common/SimpleBox';
import { ColumnDef, HierarchicalGroup } from '../types';

interface HierarchicalTableContentProps {
  columns: ColumnDef[];
  groupByLevels: string[];
  hierarchicalData: HierarchicalGroup[];
  expandedGroups: string[];
  loading: boolean;
  emptyMessage: string;
  onToggleGroup: (path: string) => void;
  onLoadChildren: (parentPath: string, childLevel: number, groupBy: string) => Promise<void>;
}

/**
 * Hierarchical Table Content component
 * Displays data in a hierarchical structure with expandable groups
 */
const HierarchicalTableContent: React.FC<HierarchicalTableContentProps> = ({
  columns,
  groupByLevels,
  hierarchicalData,
  expandedGroups,
  loading,
  emptyMessage,
  onToggleGroup,
  onLoadChildren
}) => {
  const [loadingGroups, setLoadingGroups] = useState<string[]>([]);

  // Handle expanding/collapsing a group
  const handleToggleGroup = async (group: HierarchicalGroup) => {
    const isExpanded = expandedGroups.includes(group.path);

    if (!isExpanded && !group.childrenLoaded && group.hasChildren) {
      // If expanding and children not loaded yet, load them
      setLoadingGroups(prev => [...prev, group.path]);

      try {
        // Get the next level in the hierarchy
        const childLevel = group.level + 1;
        const childGroupBy = childLevel < groupByLevels.length ? groupByLevels[childLevel] : null;

        if (childGroupBy) {
          await onLoadChildren(group.path, childLevel, childGroupBy);
        }
      } finally {
        setLoadingGroups(prev => prev.filter(path => path !== group.path));
      }
    }

    // Toggle the group expansion state
    onToggleGroup(group.path);
  };

  // Render a group row
  const renderGroupRow = (group: HierarchicalGroup, indent: number = 0) => {
    const isExpanded = expandedGroups.includes(group.path);
    const isLoading = loadingGroups.includes(group.path);
    const hasNextLevel = group.level < groupByLevels.length - 1;
    const canExpand = group.hasChildren && hasNextLevel;

    return (
      <React.Fragment key={group.path}>
        <TableRow
          hover
          sx={{
            backgroundColor: theme =>
              `rgba(${theme.palette.primary.main}, ${0.05 + (group.level * 0.05)})`
          }}
        >
          {/* First cell with expand/collapse button */}
          <TableCell
            sx={{
              pl: 1 + (indent * 2),
              fontWeight: 'bold'
            }}
          >
            <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
              {canExpand ? (
                <IconButton
                  size="small"
                  onClick={() => handleToggleGroup(group)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : isExpanded ? (
                    <KeyboardArrowDownIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowRightIcon fontSize="small" />
                  )}
                </IconButton>
              ) : (
                <SimpleBox sx={{ width: 28 }} /> // Spacer for alignment
              )}
              <Typography variant="body2" component="span">
                {group.key}: {group.value}
              </Typography>
            </SimpleBox>
          </TableCell>

          {/* Metrics cells */}
          {columns.filter(col => col.id !== groupByLevels[group.level]).map(column => (
            <TableCell
              key={column.id}
              align={column.align || 'left'}
            >
              {renderMetricValue(group, column)}
            </TableCell>
          ))}
        </TableRow>

        {/* Render children if expanded */}
        {isExpanded && group.children && group.children.length > 0 && (
          <TableRow>
            <TableCell colSpan={columns.length} sx={{ p: 0, border: 0 }}>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <SimpleBox sx={{ pl: 2 }}>
                  {group.children.map(child => renderGroupRow(child, indent + 1))}
                </SimpleBox>
              </Collapse>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

  // Render a metric value with appropriate formatting
  const renderMetricValue = (group: HierarchicalGroup, column: ColumnDef) => {
    const value = group.metrics[column.id];

    if (value === undefined || value === null) {
      return '-';
    }

    // Apply column formatting if available
    if (column.format) {
      try {
        return column.format(value, group);
      } catch (error) {
        console.error(`Error formatting value for column ${column.id}:`, error);
        return '-';
      }
    }

    // Format based on column type
    try {
      switch (column.type) {
        case 'number':
          return value.toLocaleString();

        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value);

        case 'percentage':
          return `${value}%`;

        default:
          return String(value);
      }
    } catch (error) {
      console.error(`Error formatting value for column ${column.id}:`, error);
      return '-';
    }
  };

  // If no data, show empty message
  if (hierarchicalData.length === 0 && !loading) {
    return (
      <SimpleBox sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </SimpleBox>
    );
  }

  // If loading, show loading indicator
  if (loading && hierarchicalData.length === 0) {
    return (
      <SimpleBox sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
      </SimpleBox>
    );
  }

  // Get visible columns (excluding the first grouping level which is shown in the first column)
  const visibleColumns = columns.filter(col => col.id !== groupByLevels[0]);

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              {groupByLevels.length > 0 && columns.find(col => col.id === groupByLevels[0])?.label}
            </TableCell>
            {visibleColumns.map(column => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {hierarchicalData.map(group => renderGroupRow(group))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HierarchicalTableContent;
