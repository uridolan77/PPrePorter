import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Button,
  Alert,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

import TestContextualExplanation from '../components/dashboard/TestContextualExplanation';
import { useAuth } from '../contexts/AuthContext';

// Mock data for initial dashboard view
const mockData = {
  stats: {
    revenue: {
      value: 12567.89,
      change: 15.2,
      period: 'vs last week'
    },
    players: {
      value: 1432,
      change: 7.5,
      period: 'vs last week'
    },
    newPlayers: {
      value: 256,
      change: 12.8,
      period: 'vs last week'
    },
    gamesPlayed: {
      value: 5621,
      change: -3.2,
      period: 'vs last week'
    }
  },
  topGames: [
    { name: 'Poker Pro', revenue: 3200.56, players: 432 },
    { name: 'Blackjack Masters', revenue: 2800.32, players: 387 },
    { name: 'Slots Royale', revenue: 2300.18, players: 356 },
    { name: 'Roulette King', revenue: 1900.45, players: 289 },
    { name: 'Baccarat Elite', revenue: 1450.67, players: 218 }
  ],
  recentPlayers: [
    { id: 1, name: 'John Doe', registeredAt: '2023-05-01T12:30:00Z', status: 'active', country: 'USA' },
    { id: 2, name: 'Jane Smith', registeredAt: '2023-05-02T10:15:00Z', status: 'active', country: 'Canada' },
    { id: 3, name: 'Mike Johnson', registeredAt: '2023-05-03T14:45:00Z', status: 'inactive', country: 'UK' },
    { id: 4, name: 'Lisa Brown', registeredAt: '2023-05-04T09:20:00Z', status: 'active', country: 'Australia' },
    { id: 5, name: 'Robert Wilson', registeredAt: '2023-05-05T16:10:00Z', status: 'pending', country: 'Germany' }
  ]
};

/**
 * A simplified dashboard page component
 */
const SimpleDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Load dashboard data
  useEffect(() => {
    // Simulate API call with setTimeout
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real application, this would be an API call
        // await dashboardService.getDashboardStats()
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDashboardData(mockData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Generate slightly different mock data to simulate refresh
      const refreshedData = {
        ...mockData,
        stats: {
          ...mockData.stats,
          revenue: {
            ...mockData.stats.revenue,
            value: mockData.stats.revenue.value * (1 + (Math.random() * 0.1 - 0.05)),
            change: mockData.stats.revenue.change * (1 + (Math.random() * 0.2 - 0.1))
          },
          players: {
            ...mockData.stats.players,
            value: Math.round(mockData.stats.players.value * (1 + (Math.random() * 0.1 - 0.05))),
            change: mockData.stats.players.change * (1 + (Math.random() * 0.2 - 0.1))
          }
        }
      };
      setDashboardData(refreshedData);
      setLoading(false);
    }, 1000);
  };
  
  // Render loading state
  if (loading && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Render error state
  if (error && !dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          borderRadius: 2
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
            <Button 
              variant="contained" 
              color="secondary"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              sx={{ 
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.grey[100]
                }
              }}
            >
              Refresh Data
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoneyIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h6" component="div">
                  Revenue
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                ${loading 
                  ? <CircularProgress size={20} /> 
                  : dashboardData?.stats.revenue.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {dashboardData?.stats.revenue.change > 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />
                )}
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    color: dashboardData?.stats.revenue.change > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}
                >
                  {dashboardData?.stats.revenue.change}%
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  {dashboardData?.stats.revenue.period}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Players Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.info.light,
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <SportsEsportsIcon sx={{ color: theme.palette.info.main }} />
                </Box>
                <Typography variant="h6" component="div">
                  Players
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                {loading 
                  ? <CircularProgress size={20} /> 
                  : dashboardData?.stats.players.value.toLocaleString()
                }
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {dashboardData?.stats.players.change > 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />
                )}
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    color: dashboardData?.stats.players.change > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}
                >
                  {dashboardData?.stats.players.change}%
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  {dashboardData?.stats.players.period}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* New Players Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.success.light,
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PersonAddIcon sx={{ color: theme.palette.success.main }} />
                </Box>
                <Typography variant="h6" component="div">
                  New Players
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                {loading 
                  ? <CircularProgress size={20} /> 
                  : dashboardData?.stats.newPlayers.value.toLocaleString()
                }
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {dashboardData?.stats.newPlayers.change > 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />
                )}
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    color: dashboardData?.stats.newPlayers.change > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}
                >
                  {dashboardData?.stats.newPlayers.change}%
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  {dashboardData?.stats.newPlayers.period}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Games Played Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    backgroundColor: theme.palette.warning.light,
                    borderRadius: '50%',
                    p: 1,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <VideogameAssetIcon sx={{ color: theme.palette.warning.main }} />
                </Box>
                <Typography variant="h6" component="div">
                  Games Played
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold' }}>
                {loading 
                  ? <CircularProgress size={20} /> 
                  : dashboardData?.stats.gamesPlayed.value.toLocaleString()
                }
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {dashboardData?.stats.gamesPlayed.change > 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />
                )}
                <Typography 
                  variant="body2" 
                  component="span" 
                  sx={{ 
                    color: dashboardData?.stats.gamesPlayed.change > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}
                >
                  {dashboardData?.stats.gamesPlayed.change}%
                </Typography>
                <Typography variant="body2" component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                  {dashboardData?.stats.gamesPlayed.period}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Top Games Section */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Top Performing Games
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                {dashboardData?.topGames.map((game, index) => (
                  <Box key={index}>
                    <Grid container alignItems="center" sx={{ py: 1.5 }}>
                      <Grid item xs={1}>
                        <Typography variant="body2" color="text.secondary">
                          #{index + 1}
                        </Typography>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography variant="body1" fontWeight="medium">
                          {game.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          Revenue
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          ${game.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          Players
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {game.players.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    {index < dashboardData.topGames.length - 1 && <Divider />}
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Contextual Explanation Component */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Insights & Analysis
      </Typography>
      <TestContextualExplanation />
    </Container>
  );
};

export default SimpleDashboard;
