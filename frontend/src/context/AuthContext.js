import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { MOCK_USER } from '../utils/mockData';

const AuthContext = createContext();

const IS_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('energienutrition_user') || 'null'));

  // Auto-login demo user in mock mode so clients see content immediately
  useEffect(() => {
    if (IS_MOCK && !user) {
      localStorage.setItem('energienutrition_user', JSON.stringify(MOCK_USER));
      setUser(MOCK_USER);
    }
  }, []); // eslint-disable-line

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('energienutrition_user', JSON.stringify(data));
    setUser(data);
    toast.success(`Welcome back, ${data.name}!`);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('energienutrition_user', JSON.stringify(data));
    setUser(data);
    toast.success('Account created!');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('energienutrition_user');
    setUser(null);
    toast('Logged out', { icon: '👋' });
    // Re-login demo user immediately in mock mode
    if (IS_MOCK) {
      setTimeout(() => {
        localStorage.setItem('energienutrition_user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
      }, 1500);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
