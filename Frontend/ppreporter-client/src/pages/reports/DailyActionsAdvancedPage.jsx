import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DailyActionsAdvancedReportContainer from '../../containers/DailyActionsAdvancedReportContainer';

/**
 * DailyActionsAdvancedPage - Page component for the advanced daily actions report
 */
const DailyActionsAdvancedPage = () => {
  return (
    <>
      <Helmet>
        <title>Advanced Daily Actions Report | PPrePorter</title>
      </Helmet>
      
      <Box sx={{ p: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/reports" color="inherit">
            Reports
          </Link>
          <Typography color="text.primary">Advanced Daily Actions</Typography>
        </Breadcrumbs>
        
        {/* Page Title */}
        <Typography variant="h4" component="h1" gutterBottom>
          Advanced Daily Actions Report
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Comprehensive analysis of daily player actions with advanced filtering options.
        </Typography>
        
        {/* Report Container */}
        <DailyActionsAdvancedReportContainer />
      </Box>
    </>
  );
};

export default DailyActionsAdvancedPage;
