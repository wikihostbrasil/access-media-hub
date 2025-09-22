import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'user';
}

export function useApiAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by checking token
    const token = localStorage.getItem('access_token');
    if (token) {
      // Validate token by making a request
      apiClient.getFiles()
        .then(() => {
          // Token is valid, but we need user info
          // For now, we'll decode the token or make a profile request
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        })
        .catch(() => {
          // Token is invalid
          apiClient.setToken(null);
          localStorage.removeItem('user_data');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password);
      setUser(response.user);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      // Force reload do componente App para atualizar o estado de autenticação
      window.location.reload();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await apiClient.signUp(email, password, fullName);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
      setUser(null);
      localStorage.removeItem('user_data');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    user,
    session: user ? { user } : null,
    loading,
    signIn,
    signUp,
    signOut,
  };
}