import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { CommonProps } from '../../types/common';

/**
 * Props for the ProtectedRoute component
 */
export interface ProtectedRouteProps extends CommonProps {
  /**
   * Optional redirect path if user is not authenticated
   */
  redirectPath?: string;
}

/**
 * Protected route wrapper component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectPath = '/login',
  sx 
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    // Redirect to login and keep the intended destination as state for redirect after login
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Render the child route components if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
