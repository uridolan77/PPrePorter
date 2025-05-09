import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Fallback = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Box sx={{ p: 4, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Component Test
        </Typography>
        <Typography variant="body1">
          This is a fallback component in case the main component fails to load.
        </Typography>
      </Box>
    </Container>
  );
};

export default Fallback;
