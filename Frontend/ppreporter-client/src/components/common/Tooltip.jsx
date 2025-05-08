import React from 'react';
import { 
  Tooltip as MuiTooltip, 
  Box, 
  Typography, 
  styled,
  useTheme
} from '@mui/material';

// Custom styled tooltip with more styling options
const StyledTooltip = styled(({ className, ...props }) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme, maxWidth, backgroundColor, textColor, arrow }) => ({
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
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.title - Tooltip content
 * @param {React.ReactNode} props.children - The element to attach the tooltip to
 * @param {string} props.position - Tooltip position ('top', 'bottom', 'left', 'right')
 * @param {boolean} props.arrow - Whether to show an arrow
 * @param {number|string} props.maxWidth - Maximum width of tooltip
 * @param {string} props.backgroundColor - Custom background color
 * @param {string} props.textColor - Custom text color
 * @param {React.ReactNode} props.header - Optional tooltip header
 * @param {React.ReactNode} props.footer - Optional tooltip footer
 * @param {string} props.icon - Optional icon to display
 * @param {Object} props.restProps - Additional props to pass to MUI Tooltip
 */
const Tooltip = ({
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
  const getPlacement = () => {
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
  const renderRichContent = () => {
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
      {children}
    </StyledTooltip>
  );
};

export default Tooltip;