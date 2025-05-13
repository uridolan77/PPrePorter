import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface DailyActionsHeaderProps {
  title: string;
  subtitle: string;
}

const DailyActionsHeader: React.FC<DailyActionsHeaderProps> = ({ title, subtitle }) => {
  return (
    <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      </div>
      <Button
        component={RouterLink}
        variant="contained"
        color="primary"
        to="/reports/daily-actions/advanced"
        startIcon={<FilterListIcon />}
      >
        Advanced Report
      </Button>
    </div>
  );
};

export default DailyActionsHeader;
