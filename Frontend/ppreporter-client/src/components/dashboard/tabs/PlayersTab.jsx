import React, { useState } from 'react';
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
  Avatar,
  Button,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

/**
 * Players Tab component for the API Dashboard
 * Displays player analytics, demographics, and player list
 */
const PlayersTab = ({ 
  dashboardData, 
  isLoading,
  theme = useTheme()
}) => {
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Chart colors
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main
  ];
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Player acquisition data
  const playerAcquisitionData = dashboardData?.playerRegistrations || [
    { date: '2023-05-01', count: 45 },
    { date: '2023-05-02', count: 38 },
    { date: '2023-05-03', count: 52 },
    { date: '2023-05-04', count: 41 },
    { date: '2023-05-05', count: 37 },
    { date: '2023-05-06', count: 29 },
    { date: '2023-05-07', count: 33 }
  ];
  
  // Player demographics data
  const playerDemographicsData = [
    { name: 'Male', value: 65 },
    { name: 'Female', value: 30 },
    { name: 'Other', value: 5 }
  ];
  
  // Player age distribution data
  const playerAgeData = [
    { age: '18-24', count: 120 },
    { age: '25-34', count: 280 },
    { age: '35-44', count: 210 },
    { age: '45-54', count: 150 },
    { age: '55+', count: 90 }
  ];
  
  // Player list data
  const playerListData = dashboardData?.recentPlayers || [
    { id: 1, name: 'John Doe', registeredAt: '2023-05-01T08:30:00Z', status: 'active', country: 'USA' },
    { id: 2, name: 'Jane Smith', registeredAt: '2023-05-02T10:15:00Z', status: 'active', country: 'Canada' },
    { id: 3, name: 'Mike Johnson', registeredAt: '2023-05-03T14:45:00Z', status: 'inactive', country: 'UK' },
    { id: 4, name: 'Lisa Brown', registeredAt: '2023-05-04T09:20:00Z', status: 'active', country: 'Australia' },
    { id: 5, name: 'Robert Wilson', registeredAt: '2023-05-05T16:10:00Z', status: 'pending', country: 'Germany' }
  ];
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Box>
      {/* Player Acquisition Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Player Acquisition
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
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={playerAcquisitionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <RechartsTooltip 
                  formatter={(value) => [value, 'New Players']}
                  labelFormatter={formatDate}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="New Players" 
                  fill={theme.palette.primary.main} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>
      
      {/* Player Demographics Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Player Demographics
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Gender Distribution
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, height: 250 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={playerDemographicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {playerDemographicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Age Distribution
              </Typography>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, height: 250 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={playerAgeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [value, 'Players']} />
                    <Legend />
                    <Bar 
                      dataKey="count" 
                      name="Players" 
                      fill={theme.palette.secondary.main} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Player List Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Player List
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<PersonAddIcon />}
            size="small"
          >
            Add Player
          </Button>
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
                      <TableCell>Player</TableCell>
                      <TableCell>Registration Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {playerListData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((player) => (
                        <TableRow key={player.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                                {getInitials(player.name)}
                              </Avatar>
                              <Typography variant="body1">
                                {player.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(player.registeredAt)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={player.status} 
                              color={getStatusColor(player.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{player.country}</TableCell>
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
                count={playerListData.length}
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

export default PlayersTab;
