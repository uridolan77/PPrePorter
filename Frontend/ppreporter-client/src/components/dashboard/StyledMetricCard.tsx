import React from 'react';
import {
  Box,
  Typography,
  Tooltip,
  CircularProgress,
  Divider,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GradientCard from '../common/GradientCard';

export interface StyledMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  trend?: number | null;
  trendLabel?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  onMoreClick?: () => void;
  variant?: 'teal' | 'purple' | 'blue' | 'green' | 'amber' | 'red' | 'default';
  isInverse?: boolean;
  sx?: any;
}

/**
 * Styled Metric Card component for displaying metrics with trends
 * Designed to match the teal/turquoise dashboard style
 */
const StyledMetricCard: React.FC<StyledMetricCardProps> = ({
  title,
  value,
  subtitle,
  description,
  trend = null,
  trendLabel = 'vs previous period',
  icon = null,
  loading = false,
  onMoreClick,
  variant = 'teal',
  isInverse = false,
  sx
}) => {
  const theme = useTheme();

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
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value}%`;
  };

  // Determine text colors based on variant
  const textColor = variant === 'default' ? theme.palette.text.primary : '#FFFFFF';
  const secondaryTextColor = variant === 'default' ? theme.palette.text.secondary : alpha('#FFFFFF', 0.8);

  return (
    <GradientCard
      gradientVariant={variant}
      sx={sx}
      contentSx={{ flex: 1, position: 'relative', p: 3 }}
    >
        {/* Card header with title and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="subtitle2"
              sx={{ color: secondaryTextColor, fontWeight: 500 }}
            >
              {title}
            </Typography>

            {description && (
              <Tooltip title={description} arrow>
                <IconButton
                  size="small"
                  sx={{
                    ml: 0.5,
                    p: 0,
                    color: secondaryTextColor
                  }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {onMoreClick && (
            <IconButton
              size="small"
              onClick={onMoreClick}
              sx={{
                marginRight: -1,
                color: secondaryTextColor
              }}
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
            mt: 2,
            mb: 1
          }}
        >
          <Box>
            {loading ? (
              <CircularProgress
                size={24}
                sx={{
                  color: textColor
                }}
              />
            ) : (
              <>
                <Typography
                  variant="h4"
                  component="div"
                  fontWeight="medium"
                  sx={{ color: textColor }}
                >
                  {value}
                </Typography>

                {subtitle && (
                  <Typography
                    variant="body2"
                    sx={{ color: secondaryTextColor }}
                  >
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
                bgcolor: variant === 'default' ? 'action.hover' : alpha('#FFFFFF', 0.2),
                borderRadius: '50%',
                width: 48,
                height: 48,
                color: variant === 'default' ? 'primary.main' : '#FFFFFF'
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        {/* Trend indicator */}
        {trend !== null && (
          <>
            <Divider
              sx={{
                my: 1.5,
                borderColor: variant === 'default' ? 'divider' : alpha('#FFFFFF', 0.2)
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: variant === 'default' ? trendInfo.color : textColor,
                  mr: 1
                }}
              >
                {trendInfo.icon}
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight="medium"
                  sx={{
                    color: variant === 'default' ? trendInfo.color : textColor,
                    ml: 0.5
                  }}
                >
                  {formatTrend(trend)}
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{ color: secondaryTextColor }}
              >
                {trendLabel}
              </Typography>
            </Box>
          </>
        )}
    </GradientCard>
  );
};

export default StyledMetricCard;
