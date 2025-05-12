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

// Card variant types
export type ModernCardVariant =
  | 'teal'    // Teal with wave pattern
  | 'purple'  // Purple with wave pattern
  | 'blue'    // Blue with wave pattern
  | 'green'   // Green with wave pattern
  | 'amber'   // Amber with wave pattern
  | 'red'     // Red with wave pattern
  | 'white';  // White with no pattern

export interface ModernCardProps extends Omit<CardProps, 'variant'> {
  title?: string;
  subtitle?: string;
  value?: string | number;
  trend?: number | null;
  trendLabel?: string;
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode;
  showMoreMenu?: boolean;
  showActionButton?: boolean;
  onActionClick?: () => void;
  onMoreClick?: () => void;
  variant?: ModernCardVariant;
  contentSx?: any;
  headerSx?: any;
  iconSx?: any;
  accentPosition?: 'left' | 'top' | 'right' | 'bottom';
}

/**
 * ModernCard component
 * A card with modern styling based on the dashboard image
 */
const ModernCard: React.FC<ModernCardProps> = ({
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
  ...rest
}) => {
  const theme = useTheme();

  // Get colors based on variant
  const getColors = () => {
    const variantColors = {
      teal: {
        main: theme.palette.primary.main,
        light: theme.palette.primary.light,
        dark: theme.palette.primary.dark,
        contrastText: theme.palette.primary.contrastText
      },
      purple: {
        main: theme.palette.secondary.main,
        light: theme.palette.secondary.light,
        dark: theme.palette.secondary.dark,
        contrastText: theme.palette.secondary.contrastText
      },
      blue: {
        main: theme.palette.info.main,
        light: theme.palette.info.light,
        dark: theme.palette.info.dark,
        contrastText: theme.palette.info.contrastText
      },
      green: {
        main: theme.palette.success.main,
        light: theme.palette.success.light,
        dark: theme.palette.success.dark,
        contrastText: theme.palette.success.contrastText
      },
      amber: {
        main: theme.palette.warning.main,
        light: theme.palette.warning.light,
        dark: theme.palette.warning.dark,
        contrastText: theme.palette.warning.contrastText
      },
      red: {
        main: theme.palette.error.main,
        light: theme.palette.error.light,
        dark: theme.palette.error.dark,
        contrastText: theme.palette.error.contrastText
      },
      white: {
        main: theme.palette.background.paper,
        light: theme.palette.background.paper,
        dark: theme.palette.grey[300],
        contrastText: theme.palette.text.primary
      }
    };

    return variantColors[variant] || variantColors.teal;
  };

  const colors = getColors();

  // Get accent position styles
  const getAccentStyles = () => {
    const thickness = 8;

    switch (accentPosition) {
      case 'top':
        return {
          top: 0,
          left: 0,
          right: 0,
          height: thickness,
          width: '100%'
        };
      case 'right':
        return {
          top: 0,
          right: 0,
          bottom: 0,
          width: thickness,
          height: '100%'
        };
      case 'bottom':
        return {
          bottom: 0,
          left: 0,
          right: 0,
          height: thickness,
          width: '100%'
        };
      case 'left':
      default:
        return {
          top: 0,
          left: 0,
          bottom: 0,
          width: thickness,
          height: '100%'
        };
    }
  };

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
      {/* Accent color stripe */}
      <Box
        sx={{
          position: 'absolute',
          backgroundColor: colors.main,
          ...getAccentStyles(),
          zIndex: 1
        }}
      />

      {/* Wave pattern background - only for colored variants */}
      {variant !== 'white' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wave' width='100' height='50' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 25C 20 10, 30 10, 50 25, 70 40, 80 40, 100 25L100 50L0 50Z' fill='%23${colors.main.replace('#', '')}' /%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23wave)' /%3E%3C/svg%3E")`,
            backgroundSize: '100px 50px',
            backgroundPosition: 'bottom',
            backgroundRepeat: 'repeat-x',
            zIndex: 0
          }}
        />
      )}

      <CardContent
        sx={{
          position: 'relative',
          zIndex: 2,
          p: 3,
          '&:last-child': { pb: 3 },
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
                bgcolor: alpha(colors.main, 0.1),
                color: colors.main,
                '&:hover': {
                  bgcolor: alpha(colors.main, 0.2),
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

export default ModernCard;
