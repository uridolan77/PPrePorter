import React from 'react';
import { 
  Grid, 
  Box, 
  Typography, 
  useTheme,
  Paper,
  IconButton,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import ModernCard from '../common/ModernCard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Sample data for charts
const barChartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 }
];

const lineChartData = [
  { name: 'Mon', value: 2400 },
  { name: 'Tue', value: 1398 },
  { name: 'Wed', value: 9800 },
  { name: 'Thu', value: 3908 },
  { name: 'Fri', value: 4800 },
  { name: 'Sat', value: 3800 },
  { name: 'Sun', value: 4300 }
];

const areaChartData = Array.from({ length: 30 }, (_, i) => ({
  name: i + 1,
  value: Math.floor(Math.random() * 1000) + 500
}));

// Chart component with title and actions
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  height?: number | string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, height = 300 }) => {
  const theme = useTheme();
  
  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton size="small">
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More">
            <IconButton size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, height }}>
        {children}
      </Box>
    </Paper>
  );
};

// Calendar component
const SimpleCalendar: React.FC = () => {
  const theme = useTheme();
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  
  // Generate calendar days for current month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const fillerDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const allDays = [...fillerDays, ...calendarDays];
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        {days.map(day => (
          <Box 
            key={day}
            sx={{ 
              width: 30, 
              height: 30, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              fontWeight: 'medium'
            }}
          >
            {day}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {allDays.map((day, index) => (
          <Box 
            key={index}
            sx={{ 
              width: 30, 
              height: 30, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '50%',
              m: '2px',
              fontSize: '0.875rem',
              ...(day === currentDay && {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 'bold'
              }),
              ...(day !== null && day !== currentDay && {
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  cursor: 'pointer'
                }
              })
            }}
          >
            {day}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Modern Dashboard component
const ModernDashboard: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Analytics Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <ModernCard
            title="Registrations"
            subtitle="First-Time Deposits"
            value="$278.45"
            trend={12}
            trendLabel="vs last week"
            variant="teal"
            icon={<PeopleIcon />}
            showMoreMenu
            showActionButton
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernCard
            title="Day by Day"
            value="$103.48"
            trend={-5.2}
            trendLabel="vs yesterday"
            variant="purple"
            icon={<BarChartIcon />}
            showMoreMenu
            showActionButton
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernCard
            title="First-Time Deposit"
            subtitle="FTDs"
            value="$500.30"
            trend={8.1}
            trendLabel="vs last month"
            variant="green"
            icon={<AttachMoneyIcon />}
            showMoreMenu
            showActionButton
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <ModernCard
            title="Total Pay"
            subtitle="FTDs"
            value="$28.17"
            trend={3.4}
            trendLabel="vs last week"
            variant="blue"
            icon={<SportsEsportsIcon />}
            showMoreMenu
            showActionButton
          />
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <ChartCard title="Total Actions" height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={areaChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: 'none',
                      borderRadius: 8,
                      boxShadow: theme.shadows[3]
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: theme.palette.primary.main }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Box>
          
          <ChartCard title="Day-by-Day Actions" height={300}>
            <Box sx={{ mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{ 
                  minHeight: 'auto',
                  '& .MuiTab-root': {
                    minHeight: 'auto',
                    py: 1
                  }
                }}
              >
                <Tab label="Weekly" />
                <Tab label="Monthly" />
                <Tab label="Yearly" />
              </Tabs>
            </Box>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: 'none',
                    borderRadius: 8,
                    boxShadow: theme.shadows[3]
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill={theme.palette.primary.main}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Grid container spacing={3} direction="column">
            <Grid item>
              <ModernCard
                title="Financial Day"
                variant="white"
                accentPosition="top"
              >
                <Box sx={{ mb: 2 }}>
                  <SimpleCalendar />
                </Box>
              </ModernCard>
            </Grid>
            
            <Grid item>
              <ModernCard
                title="Gadgets"
                variant="white"
                accentPosition="top"
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {['Analytics', 'Reports', 'Settings'].map((item) => (
                    <Box
                      key={item}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        width: 80,
                        '&:hover': {
                          bgcolor: theme.palette.action.hover,
                          cursor: 'pointer'
                        }
                      }}
                    >
                      <IconButton
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                          mb: 1,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark
                          }
                        }}
                        size="small"
                      >
                        {item === 'Analytics' && <BarChartIcon fontSize="small" />}
                        {item === 'Reports' && <TrendingUpIcon fontSize="small" />}
                        {item === 'Settings' && <CalendarTodayIcon fontSize="small" />}
                      </IconButton>
                      <Typography variant="caption" align="center">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </ModernCard>
            </Grid>
            
            <Grid item>
              <ModernCard
                title="Autoforce Recommendations"
                variant="white"
                accentPosition="top"
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { name: 'Increase ad budget', trend: 12 },
                    { name: 'Optimize landing page', trend: -3 }
                  ].map((item) => (
                    <Box
                      key={item.name}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: theme.palette.action.hover
                      }}
                    >
                      <Typography variant="body2">
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.trend > 0 ? (
                          <TrendingUpIcon 
                            fontSize="small" 
                            sx={{ color: theme.palette.success.main, mr: 0.5 }}
                          />
                        ) : (
                          <TrendingDownIcon 
                            fontSize="small" 
                            sx={{ color: theme.palette.error.main, mr: 0.5 }}
                          />
                        )}
                        <Typography 
                          variant="body2"
                          color={item.trend > 0 ? 'success.main' : 'error.main'}
                        >
                          {item.trend > 0 ? '+' : ''}{item.trend}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </ModernCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModernDashboard;
