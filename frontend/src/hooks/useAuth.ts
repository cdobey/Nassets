import { api, authApi } from '@/lib/api';
import type { Token, User, UserLogin, UserRegister } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

// Password validation utilities
export const passwordRequirements = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasDigit: /\d/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/'`~]/,
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  if (password.length < passwordRequirements.minLength) {
    errors.push(`Password must be at least ${passwordRequirements.minLength} characters`);
  } else {
    score += 1;
  }

  if (!passwordRequirements.hasUppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!passwordRequirements.hasLowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!passwordRequirements.hasDigit.test(password)) {
    errors.push('Password must contain at least one digit');
  } else {
    score += 1;
  }

  if (!passwordRequirements.hasSpecial.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Extra points for length
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 4) strength = 'fair';
  else if (score <= 5) strength = 'good';
  else strength = 'strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

// Username validation
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 50) {
    return { isValid: false, error: 'Username must be less than 50 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  return { isValid: true };
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: UserLogin) => {
      const response = await authApi.login(credentials.username, credentials.password);
      return response.data as Token;
    },
    onSuccess: async (data) => {
      // Fetch user data after successful login
      try {
        const userResponse = await api.get<User>('/api/auth/me', {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        setAuth(data.access_token, userResponse.data);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      } catch (error) {
        // If fetching user fails, still store the token
        console.error('Failed to fetch user after login:', error);
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: UserRegister) => {
      const response = await authApi.register(data);
      return response.data as User;
    },
  });
};

export const useCurrentUser = () => {
  const { token, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get<User>('/api/auth/me');
      setUser(response.data);
      return response.data;
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return () => {
    clearAuth();
    queryClient.clear();
  };
};
