import React from 'react';
import { Box, Container, Typography, Link, Divider, SxProps, Theme } from '@mui/material';

/**
 * Footer component props interface
 */
interface FooterProps {
  /**
   * Additional styles
   */
  sx?: SxProps<Theme>;
  
  /**
   * Application version
   */
  version?: string;
  
  /**
   * Company name
   */
  companyName?: string;
}

/**
 * Footer component for the application
 */
const Footer: React.FC<FooterProps> = ({
  sx,
  version = '1.0.0',
  companyName = 'ProgressPlay Ltd.'
}) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto', 
        py: 3, 
        bgcolor: 'background.paper',
        ...sx
      }}
    >
      <Divider />
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          py: 2 
        }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} {companyName} All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, md: 0 } }}>
            <Link href="/terms" color="inherit" underline="hover">
              <Typography variant="body2">Terms of Service</Typography>
            </Link>
            <Link href="/privacy" color="inherit" underline="hover">
              <Typography variant="body2">Privacy Policy</Typography>
            </Link>
            <Link href="/contact" color="inherit" underline="hover">
              <Typography variant="body2">Contact Us</Typography>
            </Link>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ pt: 1 }}>
          Version {version}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
