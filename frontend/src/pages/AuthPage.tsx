import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogin, useRegister } from '@/hooks';
import { useAuthStore } from '@/store/auth';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
  });

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = await loginMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
      });
      
      // Fetch user data and update auth store
      const userResponse = await fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${result.access_token}` },
      });
      const user = await userResponse.json();
      setAuth(result.access_token, user);
      navigate('/dashboard');
    } else {
      await registerMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        full_name: formData.full_name || undefined,
      });
      // Auto-login after registration
      const loginResult = await loginMutation.mutateAsync({
        username: formData.username,
        password: formData.password,
      });
      
      // Fetch user data and update auth store
      const userResponse = await fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${loginResult.access_token}` },
      });
      const user = await userResponse.json();
      setAuth(loginResult.access_token, user);
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Nassets</h1>
      <h2 style={{ textAlign: 'center' }}>{isLogin ? 'Login' : 'Register'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{ padding: '10px', fontSize: '16px' }}
          />
        )}
        
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name (optional)"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            style={{ padding: '10px', fontSize: '16px' }}
          />
        )}
        
        <button 
          type="submit" 
          disabled={loginMutation.isPending || registerMutation.isPending}
          style={{ 
            padding: '10px', 
            fontSize: '16px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          {loginMutation.isPending || registerMutation.isPending ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
        </button>
        
        {(loginMutation.isError || registerMutation.isError) && (
          <p style={{ color: 'red', textAlign: 'center' }}>
            {loginMutation.error?.message || registerMutation.error?.message || 'An error occurred'}
          </p>
        )}
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            textDecoration: 'underline', 
            cursor: 'pointer' 
          }}
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
