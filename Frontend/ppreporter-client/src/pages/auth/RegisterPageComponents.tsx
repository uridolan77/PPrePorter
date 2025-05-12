import React from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import './RegisterPage.css';

interface ContainerProps {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

// Box container component
export const BoxContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="box-container">
      {children}
    </div>
  );
};

// Logo container component
export const LogoContainer: React.FC<ContainerProps> = ({ children, sx }) => {
  return (
    <div className="logo-container" style={sx ? { marginBottom: '16px' } : undefined}>
      {children}
    </div>
  );
};

// Terms container component
export const TermsContainer: React.FC<ContainerProps> = ({ children, sx }) => {
  return (
    <div className="terms-container" style={sx ? { marginTop: '16px', padding: '8px' } : undefined}>
      {children}
    </div>
  );
};
