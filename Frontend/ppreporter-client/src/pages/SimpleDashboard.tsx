import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Divider,
  useTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';

// Mock data for the dashboard
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
  recentTransactions: [
    { id: 1, playerId: 101, playerName: 'John Doe', amount: 100.00, type: 'deposit', timestamp: '2023-05-01T08:30:00Z' },
    { id: 2, playerId: 102, playerName: 'Jane Smith', amount: 50.00, type: 'withdrawal', timestamp: '2023-05-02T10:15:00Z' },
    { id: 3, playerId: 103, playerName: 'Mike Johnson', amount: 75.50, type: 'bet', timestamp: '2023-05-03T14:45:00Z' },
    { id: 4, playerId: 104, playerName: 'Lisa Brown', amount: 120.25, type: 'win', timestamp: '2023-05-04T09:20:00Z' },
    { id: 5, playerId: 105, playerName: 'Robert Wilson', amount: 200.00, type: 'deposit', timestamp: '2023-05-05T16:10:00Z' }
  ]
};

/**
 * Simple Dashboard component
 * A basic dashboard with key metrics and data visualization
 */
const SimpleDashboard: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setData(mockData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate slightly different data for refresh
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
      
      setData(refreshedData);
    } catch (err) {
      setError('Failed to refresh dashboard data');
      console.error('Dashboard refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format number with commas
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Render loading state
  if (loading && !data) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Dashboard Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
          <Typography color="error.dark">{error}</Typography>
        </Paper>
      )}

      {/* Stats Cards */}
      {data && (
        <Grid container spacing={3}>
          {/* Revenue Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Revenue
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {formatCurrency(data.stats.revenue.value)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.stats.revenue.change >= 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                  ) : (
                    <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: data.stats.revenue.change >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {data.stats.revenue.change >= 0 ? '+' : ''}
                    {data.stats.revenue.change.toFixed(1)}% {data.stats.revenue.period}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Players Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Players
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {formatNumber(data.stats.players.value)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.stats.players.change >= 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                  ) : (
                    <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: data.stats.players.change >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {data.stats.players.change >= 0 ? '+' : ''}
                    {data.stats.players.change.toFixed(1)}% {data.stats.players.period}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* New Players Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonAddIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    New Players
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {formatNumber(data.stats.newPlayers.value)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.stats.newPlayers.change >= 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                  ) : (
                    <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: data.stats.newPlayers.change >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {data.stats.newPlayers.change >= 0 ? '+' : ''}
                    {data.stats.newPlayers.change.toFixed(1)}% {data.stats.newPlayers.period}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Games Played Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SportsEsportsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Games Played
                  </Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {formatNumber(data.stats.gamesPlayed.value)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {data.stats.gamesPlayed.change >= 0 ? (
                    <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                  ) : (
                    <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: data.stats.gamesPlayed.change >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {data.stats.gamesPlayed.change >= 0 ? '+' : ''}
                    {data.stats.gamesPlayed.change.toFixed(1)}% {data.stats.gamesPlayed.period}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dashboard Content */}
      {data && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Top Games */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Games
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {data.topGames.map((game: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">{game.name}</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(game.revenue)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(game.players)} players
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(game.revenue / game.players)} per player
                      </Typography>
                    </Box>
                    {index < data.topGames.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transactions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {data.recentTransactions.map((transaction: any, index: number) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1">{transaction.playerName}</Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{
                          color:
                            transaction.type === 'deposit' || transaction.type === 'win'
                              ? 'success.main'
                              : transaction.type === 'withdrawal' || transaction.type === 'bet'
                              ? 'error.main'
                              : 'text.primary'
                        }}
                      >
                        {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : ''}
                        {transaction.type === 'withdrawal' || transaction.type === 'bet' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          textTransform: 'capitalize',
                          color: 'text.secondary'
                        }}
                      >
                        {transaction.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(transaction.timestamp)}
                      </Typography>
                    </Box>
                    {index < data.recentTransactions.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default SimpleDashboard;
