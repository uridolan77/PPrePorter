import React, { memo, useMemo, useEffect } from 'react';
import { CircularProgress, Typography, useTheme, useMediaQuery } from '@mui/material';
import SimpleBox from '../common/SimpleBox';
import { ResponsiveContainer, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ComposedChart } from 'recharts';
import { formatDate } from '../../utils/formatters';
import { RegistrationData } from '../../types/redux';
import { useDispatch } from 'react-redux';
import { fetchRegistrationsChart } from '../../store/slices/dashboardSlice';

interface PlayerRegistrationsChartProps {
  data: RegistrationData[];
  isLoading?: boolean;
  height?: number;
  showFTD?: boolean;
}

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <SimpleBox
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registrations: {payload[0].value}
        </Typography>
        {payload.length > 1 && (
          <Typography variant="body2" color="text.secondary">
            First Time Deposits: {payload[1].value}
          </Typography>
        )}
      </SimpleBox>
    );
  }

  return null;
};

/**
 * Player Registrations Chart component
 * Displays a bar chart of player registrations over time
 */
const PlayerRegistrationsChart: React.FC<PlayerRegistrationsChartProps> = ({
  data,
  isLoading = false,
  height = 300,
  showFTD = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  // Fetch registrations chart data if not provided
  useEffect(() => {
    if (!data || data.length === 0) {
      if (!isLoading) {
        dispatch(fetchRegistrationsChart() as any);
      }
    }
  }, [dispatch, data, isLoading]);

  // Memoize the chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      date: formatDate(item.date),
      registrations: item.registrations,
      ftd: item.ftd
    }));
  }, [data]);

  if (isLoading) {
    return (
      <SimpleBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </SimpleBox>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SimpleBox sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <Typography variant="body1" color="text.secondary">
          No registration data available
        </Typography>
      </SimpleBox>
    );
  }

  return (
    <SimpleBox sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 50
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
          />
          {showFTD && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="registrations"
            name="Registrations"
            fill={theme.palette.primary.main}
            radius={[4, 4, 0, 0]}
          />
          {showFTD && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ftd"
              name="First Time Deposits"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </SimpleBox>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(PlayerRegistrationsChart);
