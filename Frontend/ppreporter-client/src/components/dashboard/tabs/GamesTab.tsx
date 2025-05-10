import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Rating,
  Button,
  Card,
  CardContent,
  CardMedia,
  Theme
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Types
import {
  GamesTabProps,
  GameCategoryDataPoint,
  GamePerformanceDataPoint,
  GameListItem,
  FeaturedGame
} from '../../../types/gamesTab';

/**
 * Games Tab component for the API Dashboard
 * Displays game analytics, performance metrics, and game list
 */
const GamesTab: React.FC<GamesTabProps> = ({
  dashboardData,
  isLoading = false,
  theme
}) => {
  // Use theme from props or get it from useTheme hook
  const defaultTheme = useTheme();
  const currentTheme: Theme = theme || defaultTheme;

  // State for pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // Chart colors
  const COLORS = [
    currentTheme.palette.primary.main,
    currentTheme.palette.secondary.main,
    currentTheme.palette.success.main,
    currentTheme.palette.error.main,
    currentTheme.palette.warning.main,
    currentTheme.palette.info.main
  ];

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number): void => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>): void => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return value ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00';
  };

  // Game category distribution data
  const gameCategoryData: GameCategoryDataPoint[] = dashboardData?.gameCategoryData || [
    { name: 'Slots', value: 45 },
    { name: 'Table Games', value: 25 },
    { name: 'Poker', value: 15 },
    { name: 'Live Casino', value: 10 },
    { name: 'Specialty', value: 5 }
  ];

  // Game performance data
  const gamePerformanceData: GamePerformanceDataPoint[] = dashboardData?.gamePerformanceData || [
    { name: 'Engagement', game1: 80, game2: 90, game3: 70 },
    { name: 'Retention', game1: 85, game2: 75, game3: 80 },
    { name: 'Revenue', game1: 90, game2: 80, game3: 85 },
    { name: 'Popularity', game1: 70, game2: 85, game3: 75 },
    { name: 'Growth', game1: 75, game2: 70, game3: 90 }
  ];

  // Game list data
  const gameListData: GameListItem[] = dashboardData?.topGames || [
    { id: 1, name: 'Poker Pro', revenue: 3200.56, players: 432, rating: 4.5, category: 'Poker' },
    { id: 2, name: 'Blackjack Masters', revenue: 2800.32, players: 387, rating: 4.2, category: 'Table Games' },
    { id: 3, name: 'Slots Royale', revenue: 2300.18, players: 356, rating: 4.7, category: 'Slots' },
    { id: 4, name: 'Roulette King', revenue: 1900.45, players: 289, rating: 4.0, category: 'Table Games' },
    { id: 5, name: 'Baccarat Elite', revenue: 1450.67, players: 218, rating: 3.8, category: 'Table Games' }
  ];

  // Featured games data
  const featuredGamesData: FeaturedGame[] = dashboardData?.featuredGames || [
    {
      id: 1,
      name: 'Poker Pro',
      description: 'The ultimate poker experience with multiple game modes and tournaments.',
      image: 'https://via.placeholder.com/300x150',
      category: 'Poker',
      rating: 4.5,
      players: 432
    },
    {
      id: 2,
      name: 'Slots Royale',
      description: 'Exciting slot machine game with progressive jackpots and bonus rounds.',
      image: 'https://via.placeholder.com/300x150',
      category: 'Slots',
      rating: 4.7,
      players: 356
    },
    {
      id: 3,
      name: 'Blackjack Masters',
      description: 'Classic blackjack with advanced features and realistic gameplay.',
      image: 'https://via.placeholder.com/300x150',
      category: 'Table Games',
      rating: 4.2,
      players: 387
    }
  ];

  return (
    <Box>
      {/* Featured Games Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Featured Games
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="small"
          >
            Add Game
          </Button>
        </Box>
        <Grid container spacing={3}>
          {featuredGamesData.map((game) => (
            <Grid item xs={12} md={4} key={game.id}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={game.image}
                  alt={game.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {game.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={game.category}
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Rating
                      value={game.rating}
                      precision={0.5}
                      size="small"
                      readOnly
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {game.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      <strong>{game.players}</strong> active players
                    </Typography>
                    <Button size="small" variant="outlined">
                      Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Game Analytics Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Game Analytics
          </Typography>
          <Box>
            <Tooltip title="Download report">
              <IconButton size="small" sx={{ mr: 1 }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Game Category Distribution
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gameCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {gameCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Game Performance Comparison
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} data={gamePerformanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Poker Pro"
                      dataKey="game1"
                      stroke={currentTheme.palette.primary.main}
                      fill={currentTheme.palette.primary.main}
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Slots Royale"
                      dataKey="game2"
                      stroke={currentTheme.palette.secondary.main}
                      fill={currentTheme.palette.secondary.main}
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Blackjack Masters"
                      dataKey="game3"
                      stroke={currentTheme.palette.success.main}
                      fill={currentTheme.palette.success.main}
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Game List Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Game Performance
          </Typography>
        </Box>
        <Paper sx={{ borderRadius: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Game</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell align="right">Players</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gameListData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((game) => (
                        <TableRow key={game.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <VideogameAssetIcon sx={{ mr: 1, color: currentTheme.palette.primary.main }} />
                              <Typography variant="body1">
                                {game.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={game.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Rating
                                value={game.rating}
                                precision={0.5}
                                size="small"
                                readOnly
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({game.rating})
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{game.players.toLocaleString()}</TableCell>
                          <TableCell align="right">{formatCurrency(game.revenue)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="View">
                              <IconButton size="small">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={gameListData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default GamesTab;