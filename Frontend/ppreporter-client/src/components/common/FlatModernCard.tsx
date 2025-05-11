import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardProps,
  Typography,
  IconButton,
  useTheme,
  alpha
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CardAccent, { AccentPosition, AccentVariant } from './CardAccent';

export interface FlatModernCardProps extends Omit<CardProps, 'variant'> {
  /**
   * Card title
   */
  title?: string;
  
  /**
   * Card subtitle
   */
  subtitle?: string;
  
  /**
   * Main value to display
   */
  value?: string | number;
  
  /**
   * Trend percentage (positive or negative)
   */
  trend?: number | null;
  
  /**
   * Label for the trend
   */
  trendLabel?: string;
  
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  
  /**
   * Icon for the action button
   */
  actionIcon?: React.ReactNode;
  
  /**
   * Whether to show the more menu
   */
  showMoreMenu?: boolean;
  
  /**
   * Whether to show the action button
   */
  showActionButton?: boolean;
  
  /**
   * Callback for action button click
   */
  onActionClick?: () => void;
  
  /**
   * Callback for more menu click
   */
  onMoreClick?: () => void;
  
  /**
   * Color variant
   */
  variant?: AccentVariant;
  
  /**
   * Custom styles for card content
   */
  contentSx?: any;
  
  /**
   * Custom styles for card header
   */
  headerSx?: any;
  
  /**
   * Custom styles for icon
   */
  iconSx?: any;
  
  /**
   * Position of the accent stripe
   */
  accentPosition?: AccentPosition;
  
  /**
   * Whether to show the wave pattern background
   */
  showWavePattern?: boolean;
}

/**
 * FlatModernCard component
 * A card with modern styling based on the dashboard image
 */
const FlatModernCard: React.FC<FlatModernCardProps> = ({
  children,
  title,
  subtitle,
  value,
  trend,
  trendLabel,
  icon,
  actionIcon,
  showMoreMenu = false,
  showActionButton = false,
  onActionClick,
  onMoreClick,
  variant = 'teal',
  contentSx,
  headerSx,
  iconSx,
  accentPosition = 'left',
  showWavePattern = false,
  ...rest
}) => {
  const theme = useTheme();

  // Format trend value
  const formatTrend = (value: number | null): string => {
    if (value === null) return '';
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value}%`;
  };

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        ...rest.sx
      }}
      {...rest}
    >
      {/* Accent and wave pattern */}
      <CardAccent 
        position={accentPosition} 
        variant={variant} 
        showWavePattern={showWavePattern} 
      />

      <CardContent
        sx={{
          position: 'relative',
          zIndex: 2,
          p: 2,
          '&:last-child': { pb: 2 },
          ...contentSx
        }}
      >
        {/* Card header with title and actions */}
        {(title || showMoreMenu) && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 1,
            ...headerSx 
          }}>
            {title && (
              <Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 500,
                    color: theme.palette.text.secondary
                  }}
                >
                  {title}
                </Typography>
                
                {subtitle && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      display: 'block',
                      mt: 0.5
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
            
            {showMoreMenu && (
              <IconButton 
                size="small" 
                onClick={onMoreClick}
                sx={{ 
                  color: theme.palette.text.secondary
                }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
        
        {/* Card content */}
        {children}
        
        {/* Value and trend display */}
        {value && (
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="h4" 
              component="div" 
              fontWeight="medium"
            >
              {value}
            </Typography>
            
            {trend !== null && trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {trend >= 0 ? (
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
                  color={trend >= 0 ? 'success.main' : 'error.main'}
                  fontWeight="medium"
                >
                  {formatTrend(trend)}
                </Typography>
                
                {trendLabel && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    {trendLabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
        
        {/* Icon display */}
        {icon && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: '50%',
              width: 40,
              height: 40,
              color: theme.palette.primary.main,
              ...iconSx
            }}
          >
            {icon}
          </Box>
        )}
        
        {/* Action button */}
        {showActionButton && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mt: 2 
          }}>
            <IconButton 
              size="small" 
              onClick={onActionClick}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                }
              }}
            >
              {actionIcon || <KeyboardArrowRightIcon />}
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FlatModernCard;
