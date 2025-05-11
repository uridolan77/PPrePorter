import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardProps,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { cardGradients } from '../../theme/tealTheme';

export interface GradientCardProps extends CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradientVariant?: 'teal' | 'purple' | 'blue' | 'green' | 'amber' | 'red' | 'default';
  contentSx?: any;
  headerSx?: any;
  iconSx?: any;
}

/**
 * GradientCard component
 * A card with gradient background based on the teal dashboard style
 */
const GradientCard: React.FC<GradientCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  gradientVariant = 'teal',
  contentSx,
  headerSx,
  iconSx,
  ...rest
}) => {
  const theme = useTheme();

  // Get background gradient based on variant
  const getBackground = () => {
    if (gradientVariant === 'default') return theme.palette.background.paper;
    return cardGradients[gradientVariant] || cardGradients.teal;
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (gradientVariant === 'default') return theme.palette.text.primary;
    return '#FFFFFF';
  };

  // Get secondary text color based on variant
  const getSecondaryTextColor = () => {
    if (gradientVariant === 'default') return theme.palette.text.secondary;
    return alpha('#FFFFFF', 0.8);
  };

  return (
    <Card
      sx={{
        background: getBackground(),
        color: getTextColor(),
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        height: '100%',
        ...rest.sx
      }}
      {...rest}
    >
      {(title || icon) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            ...headerSx
          }}
        >
          <Box>
            {title && (
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{ color: getTextColor() }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: getSecondaryTextColor() }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: gradientVariant === 'default' ? 'action.hover' : alpha('#FFFFFF', 0.2),
                borderRadius: '50%',
                width: 40,
                height: 40,
                color: gradientVariant === 'default' ? 'primary.main' : '#FFFFFF',
                ...iconSx
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      )}

      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 2 },
          ...contentSx
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default GradientCard;
