import React from 'react';
import { Card, CardContent, Box, Typography, CircularProgress } from '@mui/material';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { StatCardProps } from '../../types/statCard';

/**
 * Statistic card component that displays a key metric with change indicator
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  icon,
  change,
  changeIcon,
  changeText,
  isLoading = false
}) => {
  const formattedValue = prefix === '£' || prefix === '€' || prefix === '$'
    ? formatCurrency(typeof value === 'string' ? parseFloat(value) : value)
    : formatNumber(typeof value === 'string' ? parseFloat(value) : value);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="textSecondary">
            {title}
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            borderRadius: '50%',
            width: 40,
            height: 40,
            color: 'white'
          }}>
            {icon}
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', height: 80, justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h4" component="div" sx={{ mb: 1 }}>
              {formattedValue}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {changeIcon}
              <Typography
                variant="body2"
                color={change && change >= 0 ? 'success.main' : 'error.main'}
                sx={{ ml: 0.5 }}
              >
                {changeText}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
