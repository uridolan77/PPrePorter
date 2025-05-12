import React from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import './RegisterForm.css';

interface ContainerProps {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
}

// Simple wrapper component for logo title to avoid TypeScript complexity
export const LogoTitleContainer: React.FC<ContainerProps> = ({ children, sx }) => {
  return (
    <div className="logo-title-container" style={sx ? { marginBottom: '8px' } : undefined}>
      {children}
    </div>
  );
};

// Simple wrapper component for terms and conditions to avoid TypeScript complexity
export const TermsContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="terms-container">
      {children}
    </div>
  );
};

// Simple wrapper component for login link to avoid TypeScript complexity
export const LoginLinkContainer: React.FC<ContainerProps> = ({ children, sx }) => {
  return (
    <div className="login-link-container" style={sx ? { textAlign: 'center', marginTop: '16px' } : undefined}>
      {children}
    </div>
  );
};

// Simple wrapper component for social divider to avoid TypeScript complexity
export const SocialDividerContainer: React.FC<ContainerProps> = ({ children, sx }) => {
  return (
    <div className="social-divider-container" style={sx ? { display: 'flex', alignItems: 'center', marginTop: '16px' } : undefined}>
      {children}
    </div>
  );
};

// Simple wrapper component for social buttons to avoid TypeScript complexity
export const SocialButtonsContainer: React.FC<ContainerProps> = ({ children, sx }) => {
  return (
    <div className="social-buttons-container" style={sx ? { display: 'flex', gap: '16px', marginTop: '16px' } : undefined}>
      {children}
    </div>
  );
};

// For backward compatibility
export default LogoTitleContainer;
