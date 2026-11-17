import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBizora } from '../context/BizoraContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useBizora();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
