import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../types/api';
import { DEMO_USERS, UserPersona } from '../services/mockData';

interface AuthContextType {
  currentUser: UserPersona;
  activeRole: Role;
  isAuthenticated: boolean;
  switchRole: (role: Role) => void;
  login: (phone: string, role: Role, name?: string) => Promise<boolean>;
  register: (name: string, phone: string, role: Role) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<Role>(() => {
    const saved = localStorage.getItem('gramroute_demo_role') as Role;
    return saved && DEMO_USERS[saved] ? saved : 'FARMER';
  });

  const [currentUser, setCurrentUser] = useState<UserPersona>(DEMO_USERS[activeRole]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  useEffect(() => {
    localStorage.setItem('gramroute_demo_role', activeRole);
    setCurrentUser(DEMO_USERS[activeRole]);
  }, [activeRole]);

  const switchRole = (role: Role) => {
    setActiveRole(role);
    setIsAuthenticated(true);
  };

  const login = async (phone: string, role: Role, name?: string): Promise<boolean> => {
    setActiveRole(role);
    if (name) {
      setCurrentUser({
        ...DEMO_USERS[role],
        name,
        phone
      });
    }
    setIsAuthenticated(true);
    return true;
  };

  const register = async (name: string, phone: string, role: Role): Promise<boolean> => {
    setActiveRole(role);
    setCurrentUser({
      ...DEMO_USERS[role],
      id: `user_${Date.now()}`,
      name,
      phone
    });
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        isAuthenticated,
        switchRole,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
