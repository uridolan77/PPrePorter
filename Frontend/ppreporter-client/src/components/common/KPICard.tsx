import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  CircularProgress,
  Divider,
  IconButton
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { KPICardProps } from '../../types/common';

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
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value}%`;
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        bgcolor: color,
        ...sx
      }}
    >
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
              onClick={onMoreClick}
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
                  {value}
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
                bgcolor: 'action.hover',
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
            <Divider sx={{ my: 1.5 }} />
            
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
