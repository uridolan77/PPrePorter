import React, { useState } from 'react';
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
  Button
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
  Settings as SettingsIcon
} from '@mui/icons-material';

// Import the teal theme
import tealTheme from '../../theme/tealTheme';

// Import components
import StyledMetricCard from '../../components/dashboard/StyledMetricCard';
import { CasinoRevenueChart, PlayerRegistrationsChart, TopGamesChart } from '../../components/dashboard';
import GradientCard from '../../components/common/GradientCard';

// Mock data
const mockData = {
  revenue: {
    value: '$5,278.45',
    trend: 12.5,
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
      revenue: 4000 + Math.random() * 2000
    }))
  },
  players: {
    value: '3,103.48',
    trend: 8.2,
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
      registrations: 50 + Math.random() * 100,
      ftd: 20 + Math.random() * 50,
      username: '',
      email: '',
      password: ''
    }))
  },
  newPlayers: {
    value: '1,900.30',
    trend: -5.8,
    data: []
  },
  games: {
    value: '$28,617',
    trend: 15.3,
    data: Array.from({ length: 10 }, (_, i) => ({
      name: `Game ${i + 1}`,
      players: Math.floor(100 + Math.random() * 500),
      revenue: Math.floor(1000 + Math.random() * 5000)
    }))
  },
  dailyActions: {
    data: Array.from({ length: 30 }, (_, i) => ({
      date: `2023-${(i % 12) + 1}-${(i % 28) + 1}`,
      logins: Math.floor(100 + Math.random() * 200),
      registrations: Math.floor(20 + Math.random() * 50),
      deposits: Math.floor(50 + Math.random() * 100),
      withdrawals: Math.floor(10 + Math.random() * 30)
    }))
  }
};

/**
 * TealDashboardShowcase component
 * Demonstrates the teal/turquoise dashboard style
 */
const TealDashboardShowcase: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const isMobile = useMediaQuery(tealTheme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={tealTheme}>
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingTop: 24, paddingBottom: 24 }}>
        <Container maxWidth="xl">
          {/* Dashboard Header */}
          <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              $A$A Analytics Dashboard
            </Typography>

            <div style={{ display: 'flex', gap: 8 }}>
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
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: 24 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : undefined}
            >
              <Tab label="Overview" />
              <Tab label="Players" />
              <Tab label="Games" />
              <Tab label="Transactions" />
              <Tab label="Reports" />
            </Tabs>
          </div>

          {/* Metric Cards */}
          <Grid container spacing={3} style={{ marginBottom: 32 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StyledMetricCard
                title="Registrations First-Time Deposits"
                value="$5,278.45"
                trend={12.5}
                trendLabel="Day vs Day"
                icon={<AttachMoneyIcon />}
                variant="teal"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledMetricCard
                title="Easy Day"
                value="$3,103.48"
                trend={8.2}
                trendLabel="Registrations"
                icon={<PeopleIcon />}
                variant="purple"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledMetricCard
                title="Total Pay"
                value="$1,900.30"
                trend={-5.8}
                trendLabel="Registrations"
                icon={<PersonAddIcon />}
                variant="blue"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StyledMetricCard
                title="Financial Day"
                value="$28,617"
                trend={15.3}
                trendLabel="Revenue per session"
                icon={<SportsEsportsIcon />}
                variant="green"
              />
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} style={{ marginBottom: 32 }}>
            <Grid item xs={12} md={6}>
              <GradientCard
                gradientVariant="teal"
                title="Day-Day Actions"
                icon={<MoreVertIcon />}
              >
                  <div style={{ height: 300 }}>
                    {/* Bar chart placeholder */}
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: 4
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Bar Chart Visualization
                      </Typography>
                    </div>
                  </div>
              </GradientCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <GradientCard
                gradientVariant="purple"
                title="Total Actions"
                icon={<MoreVertIcon />}
              >
                  <div style={{ height: 300 }}>
                    {/* Line chart placeholder */}
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: 4
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Line Chart Visualization
                      </Typography>
                    </div>
                  </div>
              </GradientCard>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default TealDashboardShowcase;
