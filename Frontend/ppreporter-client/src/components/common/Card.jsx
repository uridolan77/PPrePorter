import React from 'react';
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

/**
 * Card component for consistent UI elements across the application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {string} props.subheader - Card subheader text
 * @param {React.ReactNode} props.action - Action element to display in the header
 * @param {React.ReactNode} props.icon - Icon to display next to the title
 * @param {Object} props.sx - Additional styling for the card
 * @param {boolean} props.collapsible - Whether the card can be collapsed
 * @param {boolean} props.defaultExpanded - Whether the card is expanded by default (when collapsible)
 * @param {string} props.variant - Card variant (outlined, elevation, etc)
 */
const Card = ({
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
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const handleExpandToggle = () => {
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