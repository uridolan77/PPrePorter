import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  CardActionArea,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import { formatDistanceToNow } from 'date-fns';
import { CommonProps } from '../../types/common';
import SimpleBox from '../common/SimpleBox';

// Report interface
export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  type: string;
  created: string;
  lastModified: string;
  createdBy?: string;
  favorite?: boolean;
  tags?: string[];
  thumbnail?: string;
  category?: string;
  scheduled?: boolean;
  shared?: boolean;
  [key: string]: any;
}

// Component props interface
export interface SavedReportsListProps extends CommonProps {
  reports: SavedReport[];
  loading?: boolean;
  error?: Error | null;
  onViewReport?: (report: SavedReport) => void;
  onEditReport?: (report: SavedReport) => void;
  onDeleteReport?: (report: SavedReport) => void;
  onDuplicateReport?: (report: SavedReport) => void;
  onShareReport?: (report: SavedReport) => void;
  onFavoriteToggle?: (report: SavedReport, isFavorite: boolean) => void;
  onCreateReport?: () => void;
  onSearch?: (searchTerm: string) => void;
  onSort?: (sortBy: string) => void;
  sortOptions?: Record<string, string>;
}

/**
 * SavedReportsList component for displaying and managing saved reports
 */
const SavedReportsList: React.FC<SavedReportsListProps> = ({
  reports = [],
  loading = false,
  error = null,
  onViewReport,
  onEditReport,
  onDeleteReport,
  onDuplicateReport,
  onShareReport,
  onFavoriteToggle,
  onCreateReport,
  onSearch,
  onSort,
  sortOptions = {
    lastModified: 'Last Modified',
    name: 'Name',
    created: 'Date Created'
  },
  sx
}) => {
  // State for menu and dialogs
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('lastModified');
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<HTMLElement | null>(null);

  // Handle report menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, report: SavedReport): void => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  // Handle report menu close
  const handleMenuClose = (): void => {
    setMenuAnchorEl(null);
  };

  // Handle report click
  const handleReportClick = (report: SavedReport): void => {
    if (onViewReport) {
      onViewReport(report);
    }
  };

  // Handle edit click
  const handleEditClick = (event: React.MouseEvent<HTMLElement>, report: SavedReport): void => {
    event.stopPropagation();
    if (onEditReport) {
      onEditReport(report);
    }
    handleMenuClose();
  };

  // Handle delete click
  const handleDeleteClick = (): void => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle delete confirm
  const handleDeleteConfirm = (): void => {
    if (selectedReport && onDeleteReport) {
      onDeleteReport(selectedReport);
    }
    setDeleteDialogOpen(false);
  };

  // Handle duplicate click
  const handleDuplicateClick = (): void => {
    if (selectedReport && onDuplicateReport) {
      onDuplicateReport(selectedReport);
    }
    handleMenuClose();
  };

  // Handle share click
  const handleShareClick = (): void => {
    if (selectedReport && onShareReport) {
      onShareReport(selectedReport);
    }
    handleMenuClose();
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (event: React.MouseEvent<HTMLElement>, report: SavedReport): void => {
    event.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(report, !report.favorite);
    }
  };

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle sort menu open
  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  // Handle sort menu close
  const handleSortMenuClose = (): void => {
    setSortMenuAnchorEl(null);
  };

  // Handle sort change
  const handleSortChange = (sortKey: string): void => {
    setSortBy(sortKey);
    if (onSort) {
      onSort(sortKey);
    }
    handleSortMenuClose();
  };

  // Render report card
  const renderReportCard = (report: SavedReport): React.ReactNode => {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
      >
        <CardActionArea
          onClick={() => handleReportClick(report)}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          <CardHeader
            title={
              <SimpleBox sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" noWrap sx={{ maxWidth: 200 }}>
                  {report.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleFavoriteToggle(e, report)}
                  color={report.favorite ? 'primary' : 'default'}
                >
                  {report.favorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                </IconButton>
              </SimpleBox>
            }
            subheader={
              <SimpleBox sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <FolderIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {report.category || 'Uncategorized'}
                </Typography>
              </SimpleBox>
            }
          />

          <CardContent sx={{ flexGrow: 1, pt: 0 }}>
            {report.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {report.description.length > 100
                  ? `${report.description.substring(0, 100)}...`
                  : report.description}
              </Typography>
            )}

            <SimpleBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {report.tags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}

              {report.scheduled && (
                <Chip
                  icon={<ScheduleIcon fontSize="small" />}
                  label="Scheduled"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}

              {report.shared && (
                <Chip
                  icon={<ShareIcon fontSize="small" />}
                  label="Shared"
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </SimpleBox>
          </CardContent>
        </CardActionArea>

        <Divider />

        <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Updated {formatDistanceToNow(new Date(report.lastModified), { addSuffix: true })}
          </Typography>

          <SimpleBox>
            <Tooltip title="View Report">
              <IconButton
                size="small"
                onClick={() => handleReportClick(report)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit Report">
              <IconButton
                size="small"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleEditClick(e, report)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="More Options">
              <IconButton
                size="small"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMenuOpen(e, report)}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </SimpleBox>
        </CardActions>
      </Card>
    );
  };

  return (
    <SimpleBox sx={sx}>
      {/* Header with search and actions */}
      <SimpleBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search reports..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />

        <SimpleBox sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={handleSortMenuOpen}
            size="small"
          >
            Sort: {sortOptions[sortBy]}
          </Button>

          {onCreateReport && (
            <Button
              variant="contained"
              color="primary"
              onClick={onCreateReport}
            >
              Create Report
            </Button>
          )}
        </SimpleBox>
      </SimpleBox>

      {/* Loading state */}
      {loading && (
        <SimpleBox sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </SimpleBox>
      )}

      {/* Error state */}
      {error && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error">
            Error loading reports: {error.message}
          </Typography>
        </Paper>
      )}

      {/* Empty state */}
      {!loading && !error && reports.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No reports found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm ? 'No reports match your search criteria.' : 'You haven\'t created any reports yet.'}
          </Typography>
          {onCreateReport && (
            <Button
              variant="contained"
              color="primary"
              onClick={onCreateReport}
            >
              Create Your First Report
            </Button>
          )}
        </Paper>
      )}

      {/* Reports grid */}
      {!loading && !error && reports.length > 0 && (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
              {renderReportCard(report)}
            </Grid>
          ))}
        </Grid>
      )}

      {/* Report actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleReportClick(selectedReport!)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditClick(new MouseEvent('click') as any, selectedReport!)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareClick}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Sort menu */}
      <Menu
        anchorEl={sortMenuAnchorEl}
        open={Boolean(sortMenuAnchorEl)}
        onClose={handleSortMenuClose}
      >
        {Object.entries(sortOptions).map(([key, label]) => (
          <MenuItem
            key={key}
            selected={sortBy === key}
            onClick={() => handleSortChange(key)}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedReport?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </SimpleBox>
  );
};

export default SavedReportsList;
