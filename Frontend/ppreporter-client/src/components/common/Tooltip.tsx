import React from 'react';
import { 
  Tooltip as MuiTooltip, 
  Box, 
  Typography, 
  styled,
  useTheme,
  Theme
} from '@mui/material';
import { 
  TooltipProps, 
  StyledTooltipProps, 
  TooltipPosition 
} from '../../types/tooltip';

// Custom styled tooltip with more styling options
const StyledTooltip = styled(
  ({ className, ...props }: StyledTooltipProps) => (
    <MuiTooltip {...props} classes={{ popper: className }} />
  )
)(({ theme, maxWidth, backgroundColor, textColor, arrow }: {
  theme: Theme;
  maxWidth?: number | string;
  backgroundColor?: string;
  textColor?: string;
  arrow?: boolean;
}) => ({
  [`& .MuiTooltip-tooltip`]: {
    backgroundColor: backgroundColor || theme.palette.grey[800],
    color: textColor || theme.palette.common.white,
    maxWidth: maxWidth || 220,
    fontSize: theme.typography.pxToRem(12),
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius,
  },
  [`& .MuiTooltip-arrow`]: {
    color: backgroundColor || theme.palette.grey[800],
  },
}));

/**
 * Enhanced tooltip component that supports rich content and custom styling
 */
const Tooltip: React.FC<TooltipProps> = ({
  title,
  children,
  position = 'top',
  arrow = true,
  maxWidth,
  backgroundColor,
  textColor,
  header,
  footer,
  icon,
  ...restProps
}) => {
  const theme = useTheme();
  
  // Determine placement
  const getPlacement = (): TooltipPosition => {
    switch (position) {
      case 'top':
        return 'top';
      case 'bottom':
        return 'bottom';
      case 'left':
        return 'left';
      case 'right':
        return 'right';
      default:
        return 'top';
    }
  };

  // Render rich content if header, footer, or icon is provided
  const renderRichContent = (): React.ReactNode => {
    if (!header && !footer && !icon && typeof title !== 'object') {
      return title;
    }

    return (
      <Box>
        {header && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {header}
            </Typography>
            <Box 
              sx={{ 
                width: '100%', 
                height: 1, 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                mb: 1 
              }} 
            />
          </>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          {icon && (
            <Box sx={{ mr: 1, mt: 0.5 }}>
              {icon}
            </Box>
          )}
          <Box>
            {typeof title === 'string' ? (
              <Typography variant="body2">{title}</Typography>
            ) : (
              title
            )}
          </Box>
        </Box>
        
        {footer && (
          <>
            <Box 
              sx={{ 
                width: '100%', 
                height: 1, 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                my: 1 
              }} 
            />
            <Typography variant="caption" sx={{ display: 'block' }}>
              {footer}
            </Typography>
          </>
        )}
      </Box>
    );
  };

  return (
    <StyledTooltip
      title={renderRichContent()}
      placement={getPlacement()}
      arrow={arrow}
      maxWidth={maxWidth}
      backgroundColor={backgroundColor}
      textColor={textColor}
      {...restProps}
    >
      {/* Tooltip requires a single child element that can hold a ref */}
      {React.isValidElement(children) ? children : <span>{children}</span>}
    </StyledTooltip>
  );
};

export default Tooltip;
