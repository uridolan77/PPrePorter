import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  ThemeProvider,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Card,
  CardContent,
  useMediaQuery,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  InputBase,
  Badge,
  alpha
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  SportsEsports as SportsEsportsIcon,
  CalendarToday as CalendarTodayIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  GetApp as GetAppIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import flatModernTheme from '../../theme/flatModernTheme';
import FlatModernCard from '../../components/common/FlatModernCard';
import CardAccent from '../../components/common/CardAccent';

/**
 * FlatModernUIShowcase component
 * Demonstrates the flat modern UI style based on the dashboard image
 */
const FlatModernUIShowcase: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery(flatModernTheme.breakpoints.down('md'));
  const drawerWidth = 240;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={flatModernTheme}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { sm: sidebarOpen ? drawerWidth : 72 },
            flexShrink: 0,
            transition: flatModernTheme.transitions.create('width', {
              easing: flatModernTheme.transitions.easing.sharp,
              duration: flatModernTheme.transitions.duration.enteringScreen,
            }),
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              height: '100vh',
              width: { sm: sidebarOpen ? drawerWidth : 72 },
              bgcolor: 'background.paper',
              boxShadow: 1,
              transition: flatModernTheme.transitions.create('width', {
                easing: flatModernTheme.transitions.easing.sharp,
                duration: flatModernTheme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: flatModernTheme.zIndex.drawer,
            }}
          >
            {/* Sidebar header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen ? 'space-between' : 'center',
                padding: 2,
                minHeight: 64,
              }}
            >
              {sidebarOpen && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.contrastText',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      mr: 1,
                    }}
                  >
                    S
                  </Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    noWrap
                  >
                    SAASA Analytics
                  </Typography>
                </Box>
              )}

              <IconButton onClick={handleDrawerToggle}>
                {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
            </Box>

            <Divider />

            {/* User profile section */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: sidebarOpen ? 'flex-start' : 'center',
                padding: 2,
              }}
            >
              <Avatar
                src="/path/to/avatar.jpg"
                alt="User Name"
                sx={{
                  width: 40,
                  height: 40,
                  mb: sidebarOpen ? 1 : 0,
                }}
              />

              {sidebarOpen && (
                <>
                  <Typography
                    variant="subtitle2"
                    fontWeight="medium"
                    noWrap
                  >
                    Regina Song
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                  >
                    Admin
                  </Typography>
                </>
              )}
            </Box>

            <Divider />

            {/* Navigation items */}
            <List
              sx={{
                pt: 1,
                pb: 1,
              }}
            >
              {[
                { text: 'Dashboard', icon: <DashboardIcon />, selected: true },
                { text: 'Reports', icon: <AssessmentIcon /> },
                { text: 'Analytics', icon: <BarChartIcon /> },
                { text: 'Players', icon: <PeopleIcon /> },
                { text: 'Games', icon: <SportsEsportsIcon /> },
                { text: 'Settings', icon: <SettingsIcon /> }
              ].map((item, index) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block', pl: sidebarOpen ? 0 : 0 }}>
                  <ListItemButton
                    selected={item.selected}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      borderRadius: '8px',
                      mx: 1,
                      my: 0.5,
                      justifyContent: sidebarOpen ? 'initial' : 'center',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: sidebarOpen ? 2 : 'auto',
                        justifyContent: 'center',
                        color: item.selected ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {sidebarOpen && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontSize: 14,
                          fontWeight: item.selected ? 600 : 400,
                        }}
                        sx={{ opacity: sidebarOpen ? 1 : 0 }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 72}px)` },
            transition: flatModernTheme.transitions.create(['width', 'margin'], {
              easing: flatModernTheme.transitions.easing.sharp,
              duration: flatModernTheme.transitions.duration.enteringScreen,
            }),
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <AppBar
            position="fixed"
            color="default"
            elevation={0}
            sx={{
              width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 72}px)` },
              ml: { sm: `${sidebarOpen ? drawerWidth : 72}px` },
              transition: flatModernTheme.transitions.create(['width', 'margin'], {
                easing: flatModernTheme.transitions.easing.sharp,
                duration: flatModernTheme.transitions.duration.enteringScreen,
              }),
              backgroundColor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              zIndex: flatModernTheme.zIndex.drawer - 1,
            }}
          >
            <Toolbar sx={{ minHeight: 64 }}>
              {/* Page title */}
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                Dashboard
              </Typography>

              {/* Search bar */}
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 20,
                  backgroundColor: alpha(flatModernTheme.palette.grey[200], 0.5),
                  '&:hover': {
                    backgroundColor: alpha(flatModernTheme.palette.grey[200], 0.8),
                  },
                  marginLeft: 2,
                  width: 'auto',
                  [flatModernTheme.breakpoints.up('md')]: {
                    marginLeft: 4,
                    width: 'auto',
                  },
                }}
              >
                <Box
                  sx={{
                    padding: flatModernTheme.spacing(0, 2),
                    height: '100%',
                    position: 'absolute',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <InputBase
                  placeholder="Search…"
                  sx={{
                    color: 'text.primary',
                    padding: flatModernTheme.spacing(1, 1, 1, 0),
                    paddingLeft: `calc(1em + ${flatModernTheme.spacing(4)})`,
                    transition: flatModernTheme.transitions.create('width'),
                    width: '100%',
                    [flatModernTheme.breakpoints.up('md')]: {
                      width: '20ch',
                      '&:focus': {
                        width: '30ch',
                      },
                    },
                  }}
                />
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {/* Action icons */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  size="large"
                  color="inherit"
                  sx={{
                    ml: 1,
                    color: 'text.secondary',
                  }}
                >
                  <Badge badgeContent={4} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  size="large"
                  edge="end"
                  sx={{
                    ml: 1,
                    color: 'text.secondary',
                  }}
                >
                  <Avatar
                    src="/path/to/avatar.jpg"
                    alt="User Name"
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          <Toolbar sx={{ minHeight: '64px !important' }} />

          {/* Content area */}
          <Box
            sx={{
              p: 3,
              flexGrow: 1,
              overflow: 'auto',
              backgroundColor: 'background.default',
            }}
          >
            {/* Dashboard Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                SAASA Analytics Dashboard
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  size="small"
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  size="small"
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/showcase/flat-modern-style-example"
                  size="small"
                >
                  View Style Examples
                </Button>
              </Box>
            </Box>

            {/* Metric Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FlatModernCard
                  title="Registrations"
                  subtitle="First-Time Deposits"
                  value="$278.45"
                  trend={12}
                  trendLabel="vs last week"
                  variant="teal"
                  icon={<PeopleIcon />}
                  showMoreMenu
                  showActionButton
                  accentPosition="left"
                  showWavePattern
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FlatModernCard
                  title="Day by Day"
                  value="$103.48"
                  trend={-5.2}
                  trendLabel="vs yesterday"
                  variant="purple"
                  icon={<BarChartIcon />}
                  showMoreMenu
                  showActionButton
                  accentPosition="left"
                  showWavePattern
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FlatModernCard
                  title="First-Time Deposit"
                  subtitle="FTDs"
                  value="$500.30"
                  trend={8.1}
                  trendLabel="vs last month"
                  variant="green"
                  icon={<AttachMoneyIcon />}
                  showMoreMenu
                  showActionButton
                  accentPosition="left"
                  showWavePattern
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FlatModernCard
                  title="Total Pay"
                  subtitle="FTDs"
                  value="$28.17"
                  trend={3.4}
                  trendLabel="vs last week"
                  variant="blue"
                  icon={<SportsEsportsIcon />}
                  showMoreMenu
                  showActionButton
                  accentPosition="left"
                  showWavePattern
                />
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardAccent position="top" variant="teal" />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Total Actions
                      </Typography>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Line Chart Visualization
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardAccent position="top" variant="purple" />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Financial Day
                      </Typography>
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ height: 300, bgcolor: 'grey.100', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Calendar Visualization
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default FlatModernUIShowcase;
