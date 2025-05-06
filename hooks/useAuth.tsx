import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type AuthContextType = {
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setIsAuthenticated(!!token);
      if (!token) {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.replace('/login');
    }
  };

  const login = async (token: string) => {
    console.log('useAuth: login called with token:', token);
    try {
      console.log('useAuth: saving token to AsyncStorage');
      await AsyncStorage.setItem('userToken', token);
      console.log('useAuth: token saved successfully');
      setIsAuthenticated(true);
      console.log('useAuth: isAuthenticated set to true');
      router.replace('/(tabs)');
      console.log('useAuth: navigation completed');
    } catch (error) {
      console.error('useAuth: error in login:', error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsAuthenticated(false);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
