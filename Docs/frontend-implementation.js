// Frontend Implementation - React Components

// --------------------------
// 1. Main App Structure
// --------------------------

// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';

// Auth
import AuthGuard from './components/auth/AuthGuard';
import Login from './pages/auth/Login';
import { checkAuth } from './redux/slices/authSlice';

// Layout
import MainLayout from './components/layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import AdvancedReport from './pages/reports/AdvancedReport';
import PlayerDetails from './pages/players/PlayerDetails';
import PlayerGames from './pages/players/PlayerGames';
import PlayerSummary from './pages/players/PlayerSummary';
import Transactions from './pages/transactions/Transactions';
import Games from './pages/games/Games';
import Bonuses from './pages/bonuses/Bonuses';
import SummaryCharts from './pages/charts/SummaryCharts';
import ClientManagement from './pages/admin/ClientManagement';
import UserManagement from './pages/admin/UserManagement';
import NotFound from './pages/error/NotFound';

function App() {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* App Routes */}
          <Route 
            path="/" 
            element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Report Routes */}
            <Route path="reports">
              <Route path="advanced" element={<AdvancedReport />} />
            </Route>
            
            {/* Player Routes */}
            <Route path="players">
              <Route path="details" element={<PlayerDetails />} />
              <Route path="games" element={<PlayerGames />} />
              <Route path="summary" element={<PlayerSummary />} />
            </Route>
            
            {/* Other Routes */}
            <Route path="games" element={<Games />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="bonuses" element={<Bonuses />} />
            <Route path="charts" element={<SummaryCharts />} />
            
            {/* Admin Routes */}
            <Route path="admin">
              <Route path="clients" element={<ClientManagement />} />
              <Route path="users" element={<UserManagement />} />
            </Route>
          </Route>
          
          {/* Error Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

// --------------------------
// 2. Layout Components
// --------------------------

// src/components/layout/MainLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Header onToggleSidebar={handleToggleSidebar} />
      <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 72}px)` },
          ml: { sm: `${sidebarOpen ? 240 : 72}px` },
          transition: 'margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;

// src/components/layout/Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { logout } from '../../redux/slices/authSlice';

const Header = ({ onToggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleCloseMenu();
    dispatch(logout());
    navigate('/login');
  };
  
  const handleProfile = () => {
    handleCloseMenu();
    navigate('/profile');
  };
  
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          ProgressPlay Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.username || 'User'}
          </Typography>
          
          <Tooltip title="Account settings">
            <IconButton onClick={handleOpenMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: { width: 200 }
            }}
          >
            <MenuItem onClick={handleProfile}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

// src/components/layout/Sidebar.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Divider,
  Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import GamesIcon from '@mui/icons-material/Games';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BarChartIcon from '@mui/icons-material/BarChart';
import BusinessIcon from '@mui/icons-material/Business';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar = ({ open }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Expanded menu states
  const [reportExpanded, setReportExpanded] = React.useState(true);
  const [playerExpanded, setPlayerExpanded] = React.useState(true);
  const [adminExpanded, setAdminExpanded] = React.useState(false);

  const handleToggleReports = () => {
    setReportExpanded(!reportExpanded);
  };

  const handleTogglePlayers = () => {
    setPlayerExpanded(!playerExpanded);
  };

  const handleToggleAdmin = () => {
    setAdminExpanded(!adminExpanded);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      display: true
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      display: true,
      expandable: true,
      expanded: reportExpanded,
      onToggle: handleToggleReports,
      children: [
        {
          text: 'Advanced',
          path: '/reports/advanced',
          display: true
        }
      ]
    },
    {
      text: 'Players',
      icon: <PeopleIcon />,
      display: true,
      expandable: true,
      expanded: playerExpanded,
      onToggle: handleTogglePlayers,
      children: [
        {
          text: 'Summary',
          path: '/players/summary',
          display: true
        },
        {
          text: 'Details',
          path: '/players/details',
          display: true
        },
        {
          text: 'Games',
          path: '/players/games',
          display: true
        }
      ]
    },
    {
      text: 'Games',
      icon: <GamesIcon />,
      path: '/games',
      display: true
    },
    {
      text: 'Transactions',
      icon: <ReceiptIcon />,
      path: '/transactions',
      display: true
    },
    {
      text: 'Bonuses',
      icon: <CardGiftcardIcon />,
      path: '/bonuses',
      display: true
    },
    {
      text: 'Charts',
      icon: <BarChartIcon />,
      path: '/charts',
      display: true
    },
    {
      text: 'Administration',
      icon: <BusinessIcon />,
      display: user?.role === 'Admin',
      expandable: true,
      expanded: adminExpanded,
      onToggle: handleToggleAdmin,
      children: [
        {
          text: 'Clients',
          path: '/admin/clients',
          display: user?.role === 'Admin'
        },
        {
          text: 'Users',
          path: '/admin/users',
          display: user?.role === 'Admin'
        }
      ]
    }
  ];
  
  const drawerContent = (
    <>
      <Toolbar>
        <Box
          component="img"
          src="/logo.png"
          alt="ProgressPlay Logo"
          sx={{ height: 40 }}
        />
      </Toolbar>
      <Divider />
      <List>
        {menuItems.filter(item => item.display).map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              {item.expandable ? (
                <ListItemButton onClick={item.onToggle}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <>
                      <ListItemText primary={item.text} />
                      {item.expanded ? <ExpandLess /> : <ExpandMore />}
                    </>
                  )}
                </ListItemButton>
              ) : (
                <ListItemButton 
                  selected={isActive(item.path)}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  {open && <ListItemText primary={item.text} />}
                </ListItemButton>
              )}
            </ListItem>
            
            {item.expandable && item.children && (
              <Collapse in={item.expanded && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.filter(child => child.display).map((child) => (
                    <ListItemButton
                      key={child.text}
                      selected={isActive(child.path)}
                      onClick={() => navigate(child.path)}
                      sx={{ pl: open ? 4 : 2 }}
                    >
                      {!open && (
                        <Tooltip title={child.text} placement="right">
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {/* You can add specific icons for each child if needed */}
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          </ListItemIcon>
                        </Tooltip>
                      )}
                      {open && <ListItemText primary={child.text} />}
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </>
  );
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 72,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? 240 : 72,
          boxSizing: 'border-box',
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          overflowX: 'hidden'
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;

// --------------------------
// 3. Report Components
// --------------------------

// src/pages/reports/AdvancedReport.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Typography,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';

import ReportFilters from '../../components/reports/ReportFilters';
import ReportDataGrid from '../../components/reports/ReportDataGrid';
import SaveReportDialog from '../../components/reports/SaveReportDialog';
import LoadReportDialog from '../../components/reports/LoadReportDialog';
import ExportOptionsMenu from '../../components/common/ExportOptionsMenu';

import {
  fetchAdvancedReport,
  saveReportConfiguration,
  loadReportConfigurations
} from '../../redux/slices/reportsSlice';

const AdvancedReport = () => {
  const dispatch = useDispatch();
  const { 
    advancedReport,
    isLoading, 
    savedConfigurations 
  } = useSelector((state) => state.reports);
  
  // Component state
  const [filters, setFilters] = useState({
    dateRange: {
      start: null,
      end: null
    },
    whiteLabelIds: [],
    registrationPlayMode: '',
    countries: [],
    playerType: '',
    registrationDate: null,
    firstDepositDate: null,
    lastLoginDate: null
  });
  
  const [groupBy, setGroupBy] = useState('');
  const [openFilterPanel, setOpenFilterPanel] = useState(true);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openLoadDialog, setOpenLoadDialog] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  
  useEffect(() => {
    dispatch(loadReportConfigurations());
  }, [dispatch]);
  
  const handleToggleFilterPanel = () => {
    setOpenFilterPanel(!openFilterPanel);
  };
  
  const handleApplyFilters = () => {
    dispatch(fetchAdvancedReport({
      filters,
      groupBy
    }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      dateRange: {
        start: null,
        end: null
      },
      whiteLabelIds: [],
      registrationPlayMode: '',
      countries: [],
      playerType: '',
      registrationDate: null,
      firstDepositDate: null,
      lastLoginDate: null
    });
    setGroupBy('');
  };
  
  const handleOpenSaveDialog = () => {
    setOpenSaveDialog(true);
  };
  
  const handleCloseSaveDialog = () => {
    setOpenSaveDialog(false);
  };
  
  const handleOpenLoadDialog = () => {
    setOpenLoadDialog(true);
  };
  
  const handleCloseLoadDialog = () => {
    setOpenLoadDialog(false);
  };
  
  const handleSaveReport = (name, description) => {
    dispatch(saveReportConfiguration({
      name,
      description,
      configuration: {
        filters,
        groupBy
      }
    }));
    setOpenSaveDialog(false);
  };
  
  const handleLoadReport = (configId) => {
    const config = savedConfigurations.find(c => c.id === configId);
    if (config) {
      setFilters(config.configuration.filters);
      setGroupBy(config.configuration.groupBy);
      dispatch(fetchAdvancedReport({
        filters: config.configuration.filters,
        groupBy: config.configuration.groupBy
      }));
    }
    setOpenLoadDialog(false);
  };
  
  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };
  
  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };
  
  const handleExport = (format) => {
    // Handle export logic
    console.log(`Exporting as ${format}`);
    handleCloseExportMenu();
  };
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          Advanced Report
        </Typography>
        
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={handleOpenLoadDialog}
            sx={{ mr: 1 }}
          >
            Load
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<SaveIcon />}
            onClick={handleOpenSaveDialog}
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<FileDownloadIcon />}
            onClick={handleOpenExportMenu}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {openFilterPanel && (
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Filters</Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleToggleFilterPanel}
                  >
                    Hide
                  </Button>
                </Box>
                
                <ReportFilters 
                  filters={filters}
                  groupBy={groupBy}
                  onFiltersChange={setFilters}
                  onGroupByChange={setGroupBy}
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        <Grid item xs={12} md={openFilterPanel ? 9 : 12}>
          <Paper>
            {!openFilterPanel && (
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleToggleFilterPanel}
                >
                  Show Filters
                </Button>
                
                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                
                <Typography variant="body2" color="textSecondary">
                  {Object.values(filters).some(v => 
                    Array.isArray(v) ? v.length > 0 : Boolean(v)
                  )
                    ? 'Filters applied'
                    : 'No filters applied'}
                </Typography>
              </Box>
            )}
            
            <ReportDataGrid 
              data={advancedReport}
              isLoading={isLoading}
            />
          </Paper>
        </Grid>
      </Grid>
      
      <SaveReportDialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        onSave={handleSaveReport}
      />
      
      <LoadReportDialog
        open={openLoadDialog}
        onClose={handleCloseLoadDialog}
        onLoad={handleLoadReport}
        savedConfigurations={savedConfigurations}
      />
      
      <ExportOptionsMenu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleCloseExportMenu}
        onExport={handleExport}
      />
    </Box>
  );
};

export default AdvancedReport;

// src/components/reports/ReportDataGrid.js
import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel
} from '@mui/material';

const ReportDataGrid = ({ data, isLoading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        No data available
      </Box>
    );
  }
  
  // Get columns from the first row of data
  const columns = Object.keys(data[0]);
  
  // Sort data if needed
  const sortedData = orderBy 
    ? [...data].sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        
        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      })
    : data;
  
  // Apply pagination
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>
                  <TableSortLabel
                    active={orderBy === column}
                    direction={orderBy === column ? order : 'asc'}
                    onClick={() => handleRequestSort(column)}
                  >
                    {column}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow hover key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column}`}>
                    {row[column]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default ReportDataGrid;

// src/components/reports/ReportFilters.js
import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DateRangePicker from '../common/DateRangePicker';
import MultiSelect from '../common/MultiSelect';

const ReportFilters = ({ filters, groupBy, onFiltersChange, onGroupByChange }) => {
  // Dummy data for selects
  const whiteLabels = [
    { id: 1, name: 'Casino1' },
    { id: 2, name: 'Casino2' },
    { id: 3, name: 'BetSite' },
    { id: 4, name: 'GamePortal' }
  ];
  
  const countries = [
    { id: 'UK', name: 'United Kingdom' },
    { id: 'US', name: 'United States' },
    { id: 'DE', name: 'Germany' },
    { id: 'FR', name: 'France' },
    { id: 'ES', name: 'Spain' }
  ];
  
  const handleDateRangeChange = (range) => {
    onFiltersChange({
      ...filters,
      dateRange: range
    });
  };
  
  const handleWhiteLabelsChange = (event) => {
    onFiltersChange({
      ...filters,
      whiteLabelIds: event.target.value
    });
  };
  
  const handlePlayModeChange = (event) => {
    onFiltersChange({
      ...filters,
      registrationPlayMode: event.target.value
    });
  };
  
  const handleCountriesChange = (event) => {
    onFiltersChange({
      ...filters,
      countries: event.target.value
    });
  };
  
  const handlePlayerTypeChange = (event) => {
    onFiltersChange({
      ...filters,
      playerType: event.target.value
    });
  };
  
  const handleGroupByChange = (event) => {
    onGroupByChange(event.target.value);
  };
  
  return (
    <Box>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Date Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DateRangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
          />
        </AccordionDetails>
      </Accordion>
      
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>White Labels</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <MultiSelect
              value={filters.whiteLabelIds}
              onChange={handleWhiteLabelsChange}
              options={whiteLabels}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              label="White Labels"
            />
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Play Mode</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset">
            <RadioGroup
              value={filters.registrationPlayMode}
              onChange={handlePlayModeChange}
            >
              <FormControlLabel value="" control={<Radio />} label="All" />
              <FormControlLabel value="Casino" control={<Radio />} label="Casino" />
              <FormControlLabel value="Sport" control={<Radio />} label="Sport" />
              <FormControlLabel value="Live" control={<Radio />} label="Live" />
              <FormControlLabel value="Bingo" control={<Radio />} label="Bingo" />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Countries</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <MultiSelect
              value={filters.countries}
              onChange={handleCountriesChange}
              options={countries}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              label="Countries"
            />
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Player Type</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset">
            <RadioGroup
              value={filters.playerType}
              onChange={handlePlayerTypeChange}
            >
              <FormControlLabel value="" control={<Radio />} label="All" />
              <FormControlLabel value="Real" control={<Radio />} label="Real" />
              <FormControlLabel value="Fun" control={<Radio />} label="Fun" />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>
      
      <Divider sx={{ my: 2 }} />
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Group By</InputLabel>
        <Select
          value={groupBy}
          onChange={handleGroupByChange}
          label="Group By"
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="Date">Date</MenuItem>
          <MenuItem value="WhiteLabel">White Label</MenuItem>
          <MenuItem value="Country">Country</MenuItem>
          <MenuItem value="PlayMode">Play Mode</MenuItem>
          <MenuItem value="Currency">Currency</MenuItem>
          <MenuItem value="AffiliateID">Affiliate ID</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default ReportFilters;

// --------------------------
// 4. Dashboard/Summary Components
// --------------------------

// src/pages/Dashboard.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

import StatCard from '../components/dashboard/StatCard';
import CasionRevenueChart from '../components/dashboard/CasinoRevenueChart';
import PlayerRegistrationsChart from '../components/dashboard/PlayerRegistrationsChart';
import TopGamesChart from '../components/dashboard/TopGamesChart';
import RecentTransactionsTable from '../components/dashboard/RecentTransactionsTable';

import { fetchDashboardData } from '../redux/slices/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { 
    summaryStats, 
    casinoRevenue,
    playerRegistrations,
    topGames,
    recentTransactions,
    isLoading 
  } = useSelector((state) => state.dashboard);
  
  const [tabValue, setTabValue] = React.useState(0);
  
  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleRefresh = () => {
    dispatch(fetchDashboardData());
  };
  
  if (isLoading && !summaryStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Today Summary
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
            Last updated: {new Date().toLocaleTimeString()}
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={handleRefresh}
          >
            <RefreshIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">Refresh</Typography>
          </Box>
        </Box>
      </Box>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="All" />
        <Tab label="Casino" />
        <Tab label="Sport" />
        <Tab label="Live" />
        <Tab label="Bingo" />
      </Tabs>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registrations"
            value={summaryStats?.registrations || 0}
            icon={<PersonAddIcon />}
            change={summaryStats?.registrationsChange || 0}
            changeIcon={
              (summaryStats?.registrationsChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.registrationsChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="FTD"
            value={summaryStats?.ftd || 0}
            icon={<PersonAddIcon />}
            change={summaryStats?.ftdChange || 0}
            changeIcon={
              (summaryStats?.ftdChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.ftdChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Deposits"
            value={summaryStats?.deposits || 0}
            prefix="£"
            icon={<AttachMoneyIcon />}
            change={summaryStats?.depositsChange || 0}
            changeIcon={
              (summaryStats?.depositsChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.depositsChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={summaryStats?.revenue || 0}
            prefix="£"
            icon={<AttachMoneyIcon />}
            change={summaryStats?.revenueChange || 0}
            changeIcon={
              (summaryStats?.revenueChange || 0) >= 0 ? 
                <TrendingUpIcon color="success" /> : 
                <TrendingDownIcon color="error" />
            }
            changeText={`${Math.abs(summaryStats?.revenueChange || 0)}% vs yesterday`}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Casino Revenue (Last 7 days)
              </Typography>
              <CasionRevenueChart data={casinoRevenue} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Player Registrations (Last 7 days)
              </Typography>
              <PlayerRegistrationsChart data={playerRegistrations} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Games
              </Typography>
              <TopGamesChart data={topGames} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Transactions
              </Typography>
              <RecentTransactionsTable data={recentTransactions} isLoading={isLoading} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

// --------------------------
// 5. Redux Store Configuration
// --------------------------

// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import reportsReducer from './slices/reportsSlice';
import playersReducer from './slices/playersSlice';
import gamesReducer from './slices/gamesSlice';
import transactionsReducer from './slices/transactionsSlice';
import bonusesReducer from './slices/bonusesSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    reports: reportsReducer,
    players: playersReducer,
    games: gamesReducer,
    transactions: transactionsReducer,
    bonuses: bonusesReducer,
    admin: adminReducer
  }
});

export default store;

// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  error: null
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.checkAuth();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isInitialized = false;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isInitialized = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
      });
  }
});

export const { resetAuthError } = authSlice.actions;

export default authSlice.reducer;

// src/redux/slices/reportsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportsService from '../../services/reportsService';

const initialState = {
  advancedReport: [],
  isLoading: false,
  error: null,
  savedConfigurations: []
};

export const fetchAdvancedReport = createAsyncThunk(
  'reports/fetchAdvancedReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportsService.getAdvancedReport(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveReportConfiguration = createAsyncThunk(
  'reports/saveReportConfiguration',
  async (config, { rejectWithValue }) => {
    try {
      const response = await reportsService.saveReportConfiguration(config);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadReportConfigurations = createAsyncThunk(
  'reports/loadReportConfigurations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportsService.getSavedConfigurations();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdvancedReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdvancedReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.advancedReport = action.payload;
      })
      .addCase(fetchAdvancedReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(saveReportConfiguration.fulfilled, (state, action) => {
        state.savedConfigurations.push(action.payload);
      })
      .addCase(loadReportConfigurations.fulfilled, (state, action) => {
        state.savedConfigurations = action.payload;
      });
  }
});

export default reportsSlice.reducer;
