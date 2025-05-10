import React, { useState, MouseEvent, ChangeEvent } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Button,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SortIcon from '@mui/icons-material/Sort';
import FolderIcon from '@mui/icons-material/Folder';
import { formatDistanceToNow } from 'date-fns';
import Pagination from '../common/Pagination';
import { ReportListProps, ReportSortOption } from '../../types/reportList';
import { Report } from '../../types/reportsData';

/**
 * ReportList component for displaying a list of reports with search, filtering, and sorting
 */
const ReportList: React.FC<ReportListProps> = ({
  reports = [],
  onViewReport,
  onCreateReport,
  onEditReport,
  onDeleteReport,
  onDuplicateReport,
  onSearch,
  onFavoriteToggle,
  loading = false,
  totalCount = 0,
  error = null,
  categories = [],
  showActions = true
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<ReportSortOption>('updated');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value, selectedCategory, sortBy);
    }
  };

  // Handle category filter change
  const handleCategoryChange = (category: string): void => {
    setSelectedCategory(category);
    setFilterMenuAnchorEl(null);
    if (onSearch) {
      onSearch(searchTerm, category, sortBy);
    }
  };

  // Handle sort selection
  const handleSortChange = (sortValue: ReportSortOption): void => {
    setSortBy(sortValue);
    setSortMenuAnchorEl(null);
    if (onSearch) {
      onSearch(searchTerm, selectedCategory, sortValue);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number): void => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Handle opening report menu
  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>, report: Report): void => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveReport(report);
  };

  // Handle closing report menu
  const handleMenuClose = (): void => {
    setMenuAnchorEl(null);
  };

  // Handle opening sort menu
  const handleSortMenuOpen = (event: MouseEvent<HTMLButtonElement>): void => {
    setSortMenuAnchorEl(event.currentTarget);
  };

  // Handle closing sort menu
  const handleSortMenuClose = (): void => {
    setSortMenuAnchorEl(null);
  };

  // Handle opening filter menu
  const handleFilterMenuOpen = (event: MouseEvent<HTMLButtonElement>): void => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  // Handle closing filter menu
  const handleFilterMenuClose = (): void => {
    setFilterMenuAnchorEl(null);
  };

  // Handle view report
  const handleViewReport = (report: Report): void => {
    if (onViewReport) {
      onViewReport(report);
    }
  };

  // Handle edit report
  const handleEditReport = (): void => {
    if (onEditReport && activeReport) {
      onEditReport(activeReport);
    }
    handleMenuClose();
  };

  // Handle delete report
  const handleDeleteReport = (): void => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle confirming delete report
  const handleConfirmDelete = (): void => {
    if (onDeleteReport && activeReport) {
      onDeleteReport(activeReport);
    }
    setDeleteDialogOpen(false);
  };

  // Handle cancel delete report
  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false);
  };

  // Handle duplicate report
  const handleDuplicateReport = (): void => {
    if (onDuplicateReport && activeReport) {
      onDuplicateReport(activeReport);
    }
    handleMenuClose();
  };

  // Handle toggle favorite
  const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>, report: Report): void => {
    event.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(report);
    }
  };

  // Sort label text
  const getSortLabel = (): string => {
    switch (sortBy) {
      case 'name':
        return 'Name (A-Z)';
      case 'created':
        return 'Newest';
      case 'updated':
        return 'Recently Updated';
      case 'popular':
        return 'Most Popular';
      default:
        return 'Sort By';
    }
  };

  // Category label text
  const getCategoryLabel = (): string => {
    if (selectedCategory === 'all') return 'All Categories';
    if (selectedCategory === 'favorites') return 'Favorites';

    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.name : 'All Categories';
  };

  return (
    <Box>
      {/* Header with search and filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Search reports..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleFilterMenuOpen}
                size="small"
              >
                {getCategoryLabel()}
              </Button>

              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={handleSortMenuOpen}
                size="small"
              >
                {getSortLabel()}
              </Button>

              {showActions && onCreateReport && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={onCreateReport}
                  size="small"
                >
                  Create Report
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Error message */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Reports grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : reports.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}
        >
          <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No reports found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first report'}
          </Typography>
          {showActions && onCreateReport && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateReport}
            >
              Create New Report
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => handleViewReport(report)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle1" component="h3" noWrap sx={{ fontWeight: 'medium' }}>
                      {report.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Tooltip title={report.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                        <IconButton
                          size="small"
                          onClick={(e) => handleToggleFavorite(e, report)}
                          color={report.isFavorite ? 'primary' : 'default'}
                        >
                          {report.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>

                      {showActions && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, report)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  {report.category && (
                    <Chip
                      label={report.category}
                      size="small"
                      sx={{ mt: 1, mb: 2 }}
                    />
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                    {report.description && report.description.length > 100
                      ? `${report.description.substring(0, 100)}...`
                      : report.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                    <Typography variant="caption" color="text.secondary">
                      Updated {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                    </Typography>

                    {report.viewCount !== undefined && (
                      <Tooltip title="Number of views">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon fontSize="small" sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {report.viewCount}
                          </Typography>
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>

                <Divider />

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewReport(report)}
                  >
                    View
                  </Button>

                  {showActions && onEditReport && (
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReport(report);
                        handleEditReport();
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!loading && reports.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Pagination
            count={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Box>
      )}

      {/* Report Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditReport}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDuplicateReport}>
          <ListItemIcon>
            <FileCopyIcon fontSize="small" />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleDeleteReport} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchorEl}
        open={Boolean(sortMenuAnchorEl)}
        onClose={handleSortMenuClose}
      >
        <MenuItem
          selected={sortBy === 'updated'}
          onClick={() => handleSortChange('updated')}
        >
          Recently Updated
        </MenuItem>
        <MenuItem
          selected={sortBy === 'created'}
          onClick={() => handleSortChange('created')}
        >
          Newest
        </MenuItem>
        <MenuItem
          selected={sortBy === 'name'}
          onClick={() => handleSortChange('name')}
        >
          Name (A-Z)
        </MenuItem>
        <MenuItem
          selected={sortBy === 'popular'}
          onClick={() => handleSortChange('popular')}
        >
          Most Popular
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterMenuClose}
      >
        <MenuItem
          selected={selectedCategory === 'all'}
          onClick={() => handleCategoryChange('all')}
        >
          All Categories
        </MenuItem>
        <MenuItem
          selected={selectedCategory === 'favorites'}
          onClick={() => handleCategoryChange('favorites')}
        >
          Favorites
        </MenuItem>
        <Divider />
        {categories.map((category) => (
          <MenuItem
            key={category.id}
            selected={selectedCategory === category.id}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{activeReport?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportList;