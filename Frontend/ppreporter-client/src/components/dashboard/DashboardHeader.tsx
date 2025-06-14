import React from 'react';
import {
  Grid,
  Typography,
  Paper,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import ErrorBoundary from '../common/ErrorBoundary';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import ClearIcon from '@mui/icons-material/Clear';
import BugReportIcon from '@mui/icons-material/BugReport';
import { CommonProps } from '../../types/common';
import SimpleBox from '../common/SimpleBox';

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  id?: string;
}

interface DashboardHeaderProps extends CommonProps {
  user?: User;
  onRefresh?: () => void;
  onToggleFilters?: () => void;
  onFilterReset?: () => void;
  onToggleTestPanel?: () => void;
  filterMenuAnchor: HTMLElement | null;
  onFilterMenuClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onFilterMenuClose?: () => void;
  showTestPanel?: boolean;
}

/**
 * Dashboard Header Component
 * Contains welcome message, filter controls, and action buttons
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onRefresh,
  onToggleFilters,
  onFilterReset,
  onToggleTestPanel,
  filterMenuAnchor,
  onFilterMenuClick,
  onFilterMenuClose,
  showTestPanel,
  sx
}) => {
  const theme = useTheme();

  return (
    <ErrorBoundary
      fallback={
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: theme.palette.error.light,
            color: 'white',
            borderRadius: 2
          }}
        >
          <SimpleBox sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorOutlineIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h6">
              Something went wrong loading the dashboard header
            </Typography>
          </SimpleBox>
        </Paper>
      }
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          borderRadius: 2,
          ...sx
        }}
      >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user?.firstName || 'User'}!
          </Typography>
          <Typography variant="body1">
            Here's an overview of your PP Reporter performance. Use the dashboard to monitor key metrics and gain insights.
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
          <SimpleBox sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={onFilterMenuClick}
              startIcon={<FilterListIcon />}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.grey[100]
                }
              }}
              aria-label="Open filter menu"
            >
              Filter
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={onRefresh}
              startIcon={<RefreshIcon />}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.grey[100]
                }
              }}
              aria-label="Refresh dashboard data"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={onToggleTestPanel}
              startIcon={<BugReportIcon />}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.grey[100]
                }
              }}
              aria-label="Toggle test panel"
            >
              Test
            </Button>

            {/* Filter Menu */}
            <Menu
              anchorEl={filterMenuAnchor}
              open={Boolean(filterMenuAnchor)}
              onClose={onFilterMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={onToggleFilters}>
                <ListItemIcon>
                  <TuneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Advanced Filters</ListItemText>
              </MenuItem>
              <MenuItem onClick={onFilterReset}>
                <ListItemIcon>
                  <ClearIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Reset Filters</ListItemText>
              </MenuItem>
            </Menu>
          </SimpleBox>
        </Grid>
      </Grid>
    </Paper>
    </ErrorBoundary>
  );
};

export default DashboardHeader;
