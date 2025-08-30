import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiCall } from '../utils/supabase/client';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      
      // Check if there's a stored session
      const storedToken = localStorage.getItem('timetracker_access_token');
      const storedUser = localStorage.getItem('timetracker_user');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setAccessToken(storedToken);
          setUser(userData);
          
          // Verify token is still valid
          const response = await apiCall('/auth/verify', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (!response.success) {
            // Token is invalid, clear storage
            localStorage.removeItem('timetracker_access_token');
            localStorage.removeItem('timetracker_user');
            setAccessToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('timetracker_access_token');
          localStorage.removeItem('timetracker_user');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (response.success && response.user && response.access_token) {
        const userData = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.user_metadata?.firstName || '',
          lastName: response.user.user_metadata?.lastName || '',
          avatar: response.user.user_metadata?.avatar || ''
        };
        
        setUser(userData);
        setAccessToken(response.access_token);
        
        // Store in localStorage for persistence
        localStorage.setItem('timetracker_access_token', response.access_token);
        localStorage.setItem('timetracker_user', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.error || 'Error al iniciar sesión' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Error de conexión. Inténtalo de nuevo.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      
      const response = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          firstName, 
          lastName 
        })
      });
      
      if (response.success && response.user) {
        // After successful registration, automatically log in
        return await login(email, password);
      } else {
        return { 
          success: false, 
          error: response.error || 'Error al crear la cuenta' 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Error de conexión. Inténtalo de nuevo.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if needed
      if (accessToken) {
        await apiCall('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and storage
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('timetracker_access_token');
      localStorage.removeItem('timetracker_user');
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};