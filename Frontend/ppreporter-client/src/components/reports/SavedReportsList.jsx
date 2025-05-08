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

/**
 * SavedReportsList component for displaying and managing saved reports
 * @param {Object} props - Component props
 * @param {Array} props.reports - Array of saved report objects
 * @param {boolean} props.loading - Whether reports are loading
 * @param {string} props.error - Error message to display
 * @param {Function} props.onViewReport - Function called when a report is viewed
 * @param {Function} props.onEditReport - Function called when a report is edited
 * @param {Function} props.onDeleteReport - Function called when a report is deleted
 * @param {Function} props.onDuplicateReport - Function called when a report is duplicated
 * @param {Function} props.onShareReport - Function called when a report is shared
 * @param {Function} props.onFavoriteToggle - Function called when a report is favorited/unfavorited
 * @param {Function} props.onCreateReport - Function called when create report button is clicked
 * @param {Function} props.onSearch - Function called when search input changes
 * @param {Function} props.onSort - Function called when sort option changes
 * @param {Object} props.sortOptions - Available sort options
 */
const SavedReportsList = ({
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
  }
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null);
  const [currentSort, setCurrentSort] = useState('lastModified');
  
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  const handleSortMenuOpen = (event) => {
    setSortMenuAnchorEl(event.currentTarget);
  };
  
  const handleSortMenuClose = () => {
    setSortMenuAnchorEl(null);
  };
  
  const handleSortChange = (sortKey) => {
    setCurrentSort(sortKey);
    if (onSort) {
      onSort(sortKey);
    }
    handleSortMenuClose();
  };
  
  const handleMenuOpen = (event, report) => {
    event.stopPropagation();
    setActiveReport(report);
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleReportClick = (report) => {
    if (onViewReport) {
      onViewReport(report);
    }
  };
  
  const handleEditClick = (event, report) => {
    event.stopPropagation();
    handleMenuClose();
    if (onEditReport) {
      onEditReport(report);
    }
  };
  
  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteConfirm = () => {
    if (onDeleteReport && reportToDelete) {
      onDeleteReport(reportToDelete);
    }
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };
  
  const handleDuplicateClick = (report) => {
    handleMenuClose();
    if (onDuplicateReport) {
      onDuplicateReport(report);
    }
  };
  
  const handleShareClick = (report) => {
    handleMenuClose();
    if (onShareReport) {
      onShareReport(report);
    }
  };
  
  const handleFavoriteToggle = (event, report) => {
    event.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(report);
    }
  };
  
  const renderReportCard = (report) => {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        variant="outlined"
      >
        <CardActionArea 
          onClick={() => handleReportClick(report)}
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
        >
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1, pr: 1 }}>
                  {report.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleFavoriteToggle(e, report)}
                  color={report.isFavorite ? 'warning' : 'default'}
                  sx={{ mr: -1 }}
                >
                  {report.isFavorite ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                </IconButton>
              </Box>
            }
            action={
              <IconButton
                aria-label="report actions"
                onClick={(e) => handleMenuOpen(e, report)}
                size="small"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                <Chip 
                  label={report.type} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                {report.isScheduled && (
                  <Chip 
                    icon={<ScheduleIcon fontSize="small" />} 
                    label="Scheduled" 
                    size="small" 
                    color="secondary"
                    variant="outlined"
                  />
                )}
                {report.isPublic && (
                  <Chip 
                    icon={<ShareIcon fontSize="small" />} 
                    label="Public" 
                    size="small" 
                    color="info"
                    variant="outlined"
                  />
                )}
              </Box>
            }
            sx={{ pb: 0 }}
          />
          
          <CardContent sx={{ pt: 1, flexGrow: 1 }}>
            {report.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {report.description.length > 120 
                  ? `${report.description.slice(0, 120)}...` 
                  : report.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <FolderIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary" noWrap>
                {report.folder || 'Root'}
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
        
        <Divider />
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Updated {formatDistanceToNow(new Date(report.lastModified), { addSuffix: true })}
          </Typography>
          
          <Box>
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
                onClick={(e) => handleEditClick(e, report)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>
    );
  };
  
  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Saved Reports
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search reports..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          
          <Box>
            <Button
              startIcon={<SortIcon />}
              variant="outlined"
              onClick={handleSortMenuOpen}
              size="small"
            >
              Sort: {sortOptions[currentSort]}
            </Button>
            <Menu
              anchorEl={sortMenuAnchorEl}
              open={Boolean(sortMenuAnchorEl)}
              onClose={handleSortMenuClose}
            >
              {Object.entries(sortOptions).map(([key, label]) => (
                <MenuItem 
                  key={key} 
                  onClick={() => handleSortChange(key)}
                  selected={currentSort === key}
                >
                  {label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
          <Button
            variant="contained"
            onClick={onCreateReport}
          >
            Create Report
          </Button>
        </Box>
      </Box>
      
      {/* Reports grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ py: 4 }}>
          <Paper sx={{ p: 3, bgcolor: 'error.lighter' }}>
            <Typography color="error" gutterBottom>
              Error loading reports
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Paper>
        </Box>
      ) : reports.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography color="text.secondary" paragraph>
            No reports found. Create your first report to get started.
          </Typography>
          <Button
            variant="contained"
            onClick={onCreateReport}
          >
            Create Report
          </Button>
        </Box>
      ) : (
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleReportClick(activeReport)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleEditClick(new Event('click'), activeReport)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDuplicateClick(activeReport)}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleShareClick(activeReport)}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeleteClick(activeReport)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Report</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the report "{reportToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} autoFocus>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedReportsList;