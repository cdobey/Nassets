import { Lock, Mail, Sparkles, User } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Logo } from '@/components';
import { useLogin, useRegister } from '@/hooks';
import { api } from '@/lib/api';
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
      const userResponse = await api.get('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${result.access_token}` },
      });
      const user = userResponse.data;
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
      const userResponse = await api.get('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${loginResult.access_token}` },
      });
      const user = userResponse.data;
      setAuth(loginResult.access_token, user);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-primary-300/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="flex justify-center mb-8 animate-fadeIn">
            <Logo size="lg" showText={true} />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isLogin
                ? 'Sign in to manage your finances'
                : 'Start your journey to financial freedom'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
                />
              </div>
            )}

            {!isLogin && (
              <div className="relative group">
                <Sparkles
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
                />
              </div>
            )}

            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
              />
            </div>

            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                size={20}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-blue-600 hover:from-primary-600 hover:via-primary-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative z-10">
                {loginMutation.isPending || registerMutation.isPending
                  ? 'Processing...'
                  : isLogin
                    ? 'Sign In'
                    : 'Create Account'}
              </span>
            </button>

            {(loginMutation.isError || registerMutation.isError) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-red-600 text-sm text-center font-medium">
                  {loginMutation.error?.message ||
                    registerMutation.error?.message ||
                    'An error occurred. Please try again.'}
                </p>
              </div>
            )}
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent hover:from-primary-700 hover:to-primary-800 transition-all duration-200 underline decoration-primary-500/30 hover:decoration-primary-500"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary-400/20 to-purple-400/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
