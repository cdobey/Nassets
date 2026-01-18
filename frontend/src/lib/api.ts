import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'nassets_auth_token';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      // Check if token is expired before sending request
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        
        if (Date.now() >= expirationTime) {
          // Token expired, clear storage and redirect
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('nassets_user');
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Invalid token format, clear and redirect
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('nassets_user');
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    
    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('nassets_user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle forbidden errors (disabled account, etc.)
    if (status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('nassets_user');
      window.location.href = '/login';
    }
    
    // Extract error message from response
    const errorMessage = 
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      'An unexpected error occurred';
    
    // Create a more informative error
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).status = status;
    (enhancedError as any).originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

// Auth-specific API functions
export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    return api.post('/api/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  register: async (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => {
    return api.post('/api/auth/register', data);
  },
  
  getCurrentUser: async () => {
    return api.get('/api/auth/me');
  },
};
