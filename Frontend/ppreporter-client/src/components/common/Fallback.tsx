import React from 'react';
import { Box, Typography, Container, SxProps, Theme } from '@mui/material';

/**
 * Fallback component props interface
 */
interface FallbackProps {
  /**
   * Title to display
   */
  title?: string;
  
  /**
   * Message to display
   */
  message?: string;
  
  /**
   * Additional styles
   */
  sx?: SxProps<Theme>;
}

/**
 * Fallback component for use when the main component fails to load
 */
const Fallback: React.FC<FallbackProps> = ({
  title = 'Component Test',
  message = 'This is a fallback component in case the main component fails to load.',
  sx
}) => {
  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center', ...sx }}>
      <Box sx={{ p: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1">
          {message}
        </Typography>
      </Box>
    </Container>
  );
};

export default Fallback;
