import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  CircularProgress,
  Divider,
  IconButton,
  alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { KPICardProps } from '../../types/common';
import CardAccent from './CardAccent';
import { getFlatModernCardSx } from '../../utils/applyFlatModernStyle';

/**
 * KPI (Key Performance Indicator) card component for displaying metrics with trends
 */
const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  description,
  trend = null,
  trendLabel = 'vs previous period',
  icon = null,
  loading = false,
  onMoreClick,
  color,
  isInverse = false,
  prefix = '',
  valueFormatOptions,
  sx
}) => {
  // Determine the trend direction and color
  const getTrendInfo = () => {
    if (trend === null) return { icon: null, color: 'text.secondary' };

    if (trend > 0) {
      return {
        icon: <TrendingUpIcon fontSize="small" />,
        color: isInverse ? 'error.main' : 'success.main'
      };
    }

    if (trend < 0) {
      return {
        icon: <TrendingDownIcon fontSize="small" />,
        color: isInverse ? 'success.main' : 'error.main'
      };
    }

    return {
      icon: <TrendingFlatIcon fontSize="small" />,
      color: 'text.secondary'
    };
  };

  const trendInfo = getTrendInfo();

  // Format the trend percentage
  const formatTrend = (value: number | null): string => {
    if (value === null) return '';
    // Ensure value is rounded to 2 decimal places
    const roundedValue = parseFloat(value.toFixed(2));
    const prefix = roundedValue > 0 ? '+' : '';
    return `${prefix}${roundedValue.toFixed(2)}%`;
  };

  // Format the main value
  const formatValue = (value: string | number): string => {
    // If value is already a string, return it as is
    if (typeof value === 'string') return value;

    // If we have format options, use them with Intl.NumberFormat
    if (valueFormatOptions) {
      return new Intl.NumberFormat('en-GB', valueFormatOptions).format(value);
    }

    // Default formatting with 2 decimal places
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Determine the accent variant based on the trend
  const getAccentVariant = (): 'teal' | 'green' | 'red' | 'blue' => {
    if (trend === null) return 'blue';
    if (trend > 0) return isInverse ? 'red' : 'green';
    if (trend < 0) return isInverse ? 'green' : 'red';
    return 'blue';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: color,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05), 0px 10px 15px rgba(0, 0, 0, 0.1)',
        borderRadius: 2,
        ...sx
      }}
    >
      <CardAccent
        position="left"
        variant={getAccentVariant()}
      />
      <CardContent sx={{ flex: 1, position: 'relative', p: 2 }}>
        {/* Card header with title and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>

            {description && (
              <Tooltip title={description} arrow>
                <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                  <InfoOutlinedIcon fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {onMoreClick && (
            <IconButton
              size="small"
              onClick={(event) => onMoreClick(event)}
              sx={{ marginRight: -1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Main content with value and icon */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1
          }}
        >
          <Box>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Typography variant="h4" component="div" fontWeight="medium">
                  {prefix}{formatValue(value)}
                </Typography>

                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                borderRadius: '50%',
                width: 48,
                height: 48
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {/* Trend indicator */}
        {trend !== null && (
          <>
            <Divider sx={{ my: 1.5, borderColor: 'divider' }} />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: trendInfo.color,
                  mr: 1
                }}
              >
                {trendInfo.icon}
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight="medium"
                  sx={{ color: trendInfo.color, ml: 0.5 }}
                >
                  {formatTrend(trend)}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary">
                {trendLabel}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
