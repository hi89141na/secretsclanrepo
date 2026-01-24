import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (showErrors = false) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile({ silent: !showErrors });
        setUser(response.data || response);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        toast.success('Login successful!');
        return response;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        toast.success('Registration successful!');
        return response;
      }
      throw new Error('Invalid response format');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.user || response.data || response;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Update failed');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, updateProfile, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};