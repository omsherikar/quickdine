import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (formData: FormData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext - Initial token:', token);
    
    if (token) {
      auth.getProfile()
        .then((userData) => {
          console.log('AuthContext - Fetched user data:', userData);
          setUser(userData);
        })
        .catch((error) => {
          console.error('AuthContext - Error fetching profile:', error);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      console.log('AuthContext - No token found');
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthContext - Attempting login');
    const { access_token, user } = await auth.login({ email, password });
    console.log('AuthContext - Login successful, user:', user);
    localStorage.setItem('token', access_token);
    setUser(user);
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    console.log('AuthContext - Attempting registration');
    const { access_token, user } = await auth.register(userData);
    console.log('AuthContext - Registration successful, user:', user);
    localStorage.setItem('token', access_token);
    setUser(user);
  };

  const logout = () => {
    console.log('AuthContext - Logging out');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (formData: FormData) => {
    console.log('AuthContext - Updating profile');
    const updatedUser = await auth.updateProfile(formData);
    console.log('AuthContext - Profile updated, user:', updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 