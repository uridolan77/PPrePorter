import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  IconButton,
  Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { CardProps } from '../../types/common';

/**
 * Card component for consistent UI elements across the application
 */
const Card: React.FC<CardProps> = ({
  children,
  title,
  subheader,
  action,
  icon,
  sx,
  collapsible = false,
  defaultExpanded = true,
  variant = 'outlined'
}) => {
  const [expanded, setExpanded] = useState<boolean>(defaultExpanded);

  const handleExpandToggle = (): void => {
    setExpanded(!expanded);
  };

  return (
    <Paper
      variant={variant}
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        ...sx
      }}
    >
      {/* Card Header */}
      {(title || subheader) && (
        <>
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && (
                <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                  {icon}
                </Box>
              )}
              <Box>
                {title && (
                  <Typography variant="h6" component="div">
                    {title}
                  </Typography>
                )}
                {subheader && (
                  <Typography variant="body2" color="text.secondary">
                    {subheader}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {action}
              {collapsible && (
                <IconButton
                  onClick={handleExpandToggle}
                  sx={{ ml: action ? 1 : 0 }}
                  size="small"
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>
          </Box>
          <Divider />
        </>
      )}

      {/* Card Content */}
      {collapsible ? (
        <Collapse in={expanded}>
          <Box>{children}</Box>
        </Collapse>
      ) : (
        <Box>{children}</Box>
      )}
    </Paper>
  );
};

export default Card;
