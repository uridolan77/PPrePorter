import React, { useState } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';

// Simple test component to make sure the basic React app works
const TestComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Basic Test Component
      </Typography>
      
      <Box sx={{ mb: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Counter Value: {count}
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => setCount(count + 1)}
          sx={{ mr: 2 }}
        >
          Increment
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={() => setCount(0)}
        >
          Reset
        </Button>
      </Box>
      
      <Typography variant="body1">
        This is a simple test component to verify that the React application is working correctly.
      </Typography>
    </Container>
  );
};

export default TestComponent;
