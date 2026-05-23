/**
 * api.js — Smart API switcher
 * Set REACT_APP_USE_MOCK=true in .env  → use dummy data (no backend needed)
 * Leave unset                          → use real Express backend
 */
import mockApi from './mockApi';
import axios from 'axios';

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

const axiosApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

axiosApi.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('energienutrition_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

axiosApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('energienutrition_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const api = USE_MOCK ? mockApi : axiosApi;
export default api;
