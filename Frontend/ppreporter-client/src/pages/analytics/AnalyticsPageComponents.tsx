import React from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import './AnalyticsPage.css';

interface ContainerProps {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

// Header flex container component
export const HeaderFlexContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="header-flex">
      {children}
    </div>
  );
};

// Chart placeholder container component
export const ChartPlaceholderContainer: React.FC<ContainerProps> = ({ children, sx }) => {
  return (
    <div className="chart-placeholder" style={sx ? { padding: '24px' } : undefined}>
      {children}
    </div>
  );
};
