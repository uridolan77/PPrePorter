import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
  Collapse,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Tooltip
} from '@mui/material';
import { CommonProps } from '../../types/common';
import { ReportSection, ReportExportFormat } from '../../types/report';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PrintIcon from '@mui/icons-material/Print';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CodeIcon from '@mui/icons-material/Code';

// Type definitions
export interface FilterDefinition {
  id: string;
  label: string;
  type: string;
  options?: Array<{ value: string | number; label: string }>;
  defaultValue?: any;
  [key: string]: any;
}

// Use ReportExportFormat from report.ts
export type ExportFormat = ReportExportFormat;

export interface ReportViewerProps extends CommonProps {
  /**
   * Report title
   */
  title?: string;

  /**
   * Report description
   */
  description?: string;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Error state
   */
  error?: Error | string | null;

  /**
   * Report sections
   */
  sections?: ReportSection[];

  /**
   * Report data
   */
  data?: any;

  /**
   * Filter definitions
   */
  filters?: FilterDefinition[];

  /**
   * Filter values
   */
  filterValues?: Record<string, any>;

  /**
   * Filter change handler
   */
  onFilterChange?: (id: string, value: any) => void;

  /**
   * Filter apply handler
   */
  onFilterApply?: () => void;

  /**
   * Refresh handler
   */
  onRefresh?: () => void;

  /**
   * Export handler
   */
  onExport?: (format: ExportFormat, data?: any) => void;

  /**
   * Save handler
   */
  onSave?: (data?: any) => void;

  /**
   * Share handler
   */
  onShare?: (data?: any) => void;

  /**
   * Whether to show export options
   */
  showExport?: boolean;

  /**
   * Additional header actions
   */
  headerActions?: React.ReactNode;
}

/**
 * ReportViewer - Generic component for displaying report data and sections
 */
const ReportViewer: React.FC<ReportViewerProps> = ({
  title = 'Report',
  description = 'Report description',
  loading = false,
  error = null,
  sections = [],
  data = {},
  filters,
  filterValues,
  onFilterChange,
  onFilterApply,
  onRefresh,
  onExport,
  onSave,
  onShare,
  showExport = true,
  headerActions,
  sx
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(sections.map(section => section.id));
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<HTMLElement | null>(null);

  // Handle export menu open/close
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setExportMenuAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = (): void => {
    setExportMenuAnchorEl(null);
  };

  // Handle more menu open/close
  const handleMoreMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClose = (): void => {
    setMoreMenuAnchorEl(null);
  };

  // Toggle section visibility
  const handleToggleSection = (sectionId: string): void => {
    setExpandedSections(prevState => {
      if (prevState.includes(sectionId)) {
        return prevState.filter(id => id !== sectionId);
      } else {
        return [...prevState, sectionId];
      }
    });
  };

  // Handle section actions
  const handleCollapseAll = (): void => {
    setExpandedSections([]);
  };

  const handleExpandAll = (): void => {
    setExpandedSections(sections.map(section => section.id));
  };

  // Handle export actions
  const handleExport = (format: ExportFormat): void => {
    if (onExport) {
      onExport(format, data);
    }
    handleExportMenuClose();
  };

  // Handle print
  const handlePrint = (): void => {
    window.print();
    handleMoreMenuClose();
  };

  // Format error message
  const getErrorMessage = (): string => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    return error.message || 'An error occurred';
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* Report Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Refresh Button */}
            {onRefresh && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
            )}

            {/* Export Button/Menu */}
            {showExport && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportMenuOpen}
                  disabled={loading}
                >
                  Export
                </Button>
                <Menu
                  anchorEl={exportMenuAnchorEl}
                  open={Boolean(exportMenuAnchorEl)}
                  onClose={handleExportMenuClose}
                >
                  <MenuItem onClick={() => handleExport('pdf')}>PDF Document</MenuItem>
                  <MenuItem onClick={() => handleExport('excel')}>Excel Spreadsheet</MenuItem>
                  <MenuItem onClick={() => handleExport('csv')}>CSV File</MenuItem>
                  <MenuItem onClick={() => handleExport('image')}>Image (PNG)</MenuItem>
                  <MenuItem onClick={() => handleExport('json')}>Raw Data (JSON)</MenuItem>
                </Menu>
              </>
            )}

            {/* Save Button */}
            {onSave && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<SaveIcon />}
                onClick={() => onSave(data)}
                disabled={loading}
              >
                Save
              </Button>
            )}

            {/* Share Button */}
            {onShare && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShareIcon />}
                onClick={() => onShare(data)}
                disabled={loading}
              >
                Share
              </Button>
            )}

            {/* Additional header actions */}
            {headerActions}

            {/* More Options */}
            <IconButton
              size="small"
              onClick={handleMoreMenuOpen}
              disabled={loading}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={moreMenuAnchorEl}
              open={Boolean(moreMenuAnchorEl)}
              onClose={handleMoreMenuClose}
            >
              <MenuItem onClick={handlePrint}>
                <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                Print Report
              </MenuItem>
              <MenuItem onClick={handleExpandAll}>
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                Expand All Sections
              </MenuItem>
              <MenuItem onClick={handleCollapseAll}>
                <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
                Collapse All Sections
              </MenuItem>
              <MenuItem onClick={handleMoreMenuClose}>
                <FullscreenIcon fontSize="small" sx={{ mr: 1 }} />
                Fullscreen Mode
              </MenuItem>
              <MenuItem onClick={handleMoreMenuClose}>
                <CodeIcon fontSize="small" sx={{ mr: 1 }} />
                View Raw Data
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {getErrorMessage()}
          </Alert>
        )}

        {/* Report Metadata/Filters Summary */}
        {!loading && !error && data && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`Generated: ${new Date().toLocaleString()}`}
              size="small"
              color="default"
              icon={<InfoOutlinedIcon />}
            />
            {data.summary && (
              <Tooltip title="Total records in this report">
                <Chip
                  label={`Records: ${data.byDimension?.length || 0}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Box>
        )}
      </Paper>

      {/* Report Sections */}
      {sections.map((section) => (
        <Card
          key={section.id}
          sx={{ mb: 3, borderRadius: 1 }}
          variant="outlined"
        >
          <CardHeader
            title={section.title}
            subheader={section.description}
            action={
              <IconButton
                onClick={() => handleToggleSection(section.id)}
                size="small"
              >
                {expandedSections.includes(section.id) ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            }
          />
          <Collapse in={expandedSections.includes(section.id)}>
            <Divider />
            <CardContent>
              {section.content}
            </CardContent>
            {section.actions && (
              <CardActions>
                {section.actions}
              </CardActions>
            )}
          </Collapse>
        </Card>
      ))}

      {/* No Sections Placeholder */}
      {sections.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No report sections available.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ReportViewer;
