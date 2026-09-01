import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isStudent, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-white"><div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  return isStudent ? <>{children}</> : <Navigate to="/login" replace />;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-white"><div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isStudent, isAdmin, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-white"><div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  return isAdmin || isStudent ? <>{children}</> : <Navigate to="/login" replace />;
};
