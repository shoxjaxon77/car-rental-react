import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

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
      const userData = await AsyncStorage.getItem('userData');
      
      if (!token || !userData) {
        setIsAuthenticated(false);
        router.replace('/login');
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      router.replace('/login');
    }
  };

  const login = async (token: string) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      setIsAuthenticated(true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('useAuth: error in login:', error);
      alert('Login jarayonida xatolik yuz berdi');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setIsAuthenticated(false);
      router.replace('/login');
    } catch (error) {
      console.error('useAuth: error in logout:', error);
      alert('Logout jarayonida xatolik yuz berdi');
    }
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
