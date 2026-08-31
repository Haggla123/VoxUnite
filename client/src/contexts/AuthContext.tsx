import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminLogout, getAdminProfile, getStudentProfile, studentLogout } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

interface AuthState {
  admin: any | null;
  student: any | null;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  loginAdmin: (admin: any) => void;
  loginStudent: (student: any) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    admin: null,
    student: null,
    isAdmin: false,
    isStudent: false,
    isLoading: true,
  });

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getAdminProfile();
        setState({ admin: data, student: null, isAdmin: true, isStudent: false, isLoading: false });
        return;
      } catch {}

      try {
        const { data } = await getStudentProfile();
        setState({ admin: null, student: data, isAdmin: false, isStudent: true, isLoading: false });
      } catch {
        setState({ admin: null, student: null, isAdmin: false, isStudent: false, isLoading: false });
      }
    };
    init();
  }, []);

  const loginAdmin = (admin: any) => {
    setState({ admin, student: null, isAdmin: true, isStudent: false, isLoading: false });
  };

  const loginStudent = (student: any) => {
    setState({ admin: null, student, isAdmin: false, isStudent: true, isLoading: false });
  };

  const logout = async () => {
    const logoutRequest = state.isAdmin ? adminLogout : studentLogout;
    try {
      await logoutRequest();
    } catch {}
    disconnectSocket();
    setState({ admin: null, student: null, isAdmin: false, isStudent: false, isLoading: false });
  };

  return <AuthContext.Provider value={{ ...state, loginAdmin, loginStudent, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
