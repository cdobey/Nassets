import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Logo } from '@/components';
import {
  useLogin,
  useRegister,
  validateEmail,
  validatePassword,
  validateUsername,
  type PasswordValidationResult,
} from '@/hooks';
import { useAuthStore } from '@/store/auth';

// Password strength indicator component
const PasswordStrengthIndicator: React.FC<{
  strength: PasswordValidationResult['strength'];
  password: string;
}> = ({ strength, password }) => {
  const strengthConfig = {
    weak: { color: 'bg-red-500', width: 'w-1/4', label: 'Weak' },
    fair: { color: 'bg-orange-500', width: 'w-2/4', label: 'Fair' },
    good: { color: 'bg-yellow-500', width: 'w-3/4', label: 'Good' },
    strong: { color: 'bg-green-500', width: 'w-full', label: 'Strong' },
  };

  const config = strengthConfig[strength];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${config.color} ${config.width} transition-all duration-300`}
        />
      </div>
      <p className={`text-xs mt-1 ${
        strength === 'weak' ? 'text-red-600' :
        strength === 'fair' ? 'text-orange-600' :
        strength === 'good' ? 'text-yellow-600' :
        'text-green-600'
      }`}>
        Password strength: {config.label}
      </p>
    </div>
  );
};

// Password requirement checklist
const PasswordRequirements: React.FC<{ password: string }> = ({ password }) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/'`~]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 text-xs ${
              req.met ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {req.met ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <X size={12} className="text-gray-400" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Input field component with validation
interface InputFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  error?: string;
  showPasswordToggle?: boolean;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  showPasswordToggle,
  required,
  autoComplete,
  disabled,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div className="relative">
      <div
        className={`relative group transition-all duration-200 ${
          error ? 'animate-shake' : ''
        }`}
      >
        <div
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
            isFocused ? 'text-primary-500' : error ? 'text-red-400' : 'text-gray-400'
          }`}
        >
          {icon}
        </div>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full pl-12 pr-${showPasswordToggle ? '12' : '4'} py-3.5 bg-gray-50/50 border rounded-xl transition-all duration-200 placeholder-gray-400 ${
            error
              ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    full_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Password validation
  const passwordValidation = useMemo(
    () => validatePassword(formData.password),
    [formData.password]
  );

  // Validate form fields
  const validateField = useCallback(
    (field: string, value: string): string | undefined => {
      switch (field) {
        case 'email':
          if (!value) return 'Email is required';
          if (!validateEmail(value)) return 'Please enter a valid email address';
          break;
        case 'username':
          if (!value) return 'Username is required';
          const usernameValidation = validateUsername(value);
          if (!usernameValidation.isValid) return usernameValidation.error;
          break;
        case 'password':
          if (!value) return 'Password is required';
          if (!isLogin && !passwordValidation.isValid) {
            return passwordValidation.errors[0];
          }
          break;
        case 'confirmPassword':
          if (!isLogin) {
            if (!value) return 'Please confirm your password';
            if (value !== formData.password) return 'Passwords do not match';
          }
          break;
      }
      return undefined;
    },
    [isLogin, formData.password, passwordValidation]
  );

  // Handle field change
  const handleChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setServerError(null);

    // Validate on change
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));

    // Re-validate confirm password when password changes
    if (field === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError || '' }));
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const fieldsToValidate = isLogin
      ? ['username', 'password']
      : ['email', 'username', 'password', 'confirmPassword'];

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched(
      fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
        });
        navigate('/dashboard');
      } else {
        await registerMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          full_name: formData.full_name || undefined,
        });

        // Auto-login after registration
        await loginMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      setServerError(error.message || 'An error occurred. Please try again.');
    }
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setTouched({});
    setServerError(null);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      full_name: '',
    });
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-300/20 to-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-green-200/10 to-primary-200/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Auth Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fadeIn">
            <Logo size="lg" showText={true} />
          </div>

          {/* Security Badge */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-full">
              <Shield size={14} className="text-primary-600" />
              <span className="text-xs font-medium text-primary-700">
                Secure Authentication
              </span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-gray-600 text-sm">
              {isLogin
                ? 'Sign in to continue managing your finances'
                : 'Start your journey to financial freedom'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <InputField
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange('email')}
                  icon={<Mail size={20} />}
                  error={touched.email ? errors.email : undefined}
                  required
                  autoComplete="email"
                  disabled={isPending}
                />

                <InputField
                  type="text"
                  placeholder="Full name (optional)"
                  value={formData.full_name}
                  onChange={handleChange('full_name')}
                  icon={<Sparkles size={20} />}
                  autoComplete="name"
                  disabled={isPending}
                />
              </>
            )}

            <InputField
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange('username')}
              icon={<User size={20} />}
              error={touched.username ? errors.username : undefined}
              required
              autoComplete="username"
              disabled={isPending}
            />

            <div>
              <InputField
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange('password')}
                icon={<Lock size={20} />}
                error={touched.password ? errors.password : undefined}
                showPasswordToggle
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                disabled={isPending}
              />
              {!isLogin && formData.password && (
                <>
                  <PasswordStrengthIndicator
                    strength={passwordValidation.strength}
                    password={formData.password}
                  />
                  <PasswordRequirements password={formData.password} />
                </>
              )}
            </div>

            {!isLogin && (
              <InputField
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                icon={<Lock size={20} />}
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
                showPasswordToggle
                required
                autoComplete="new-password"
                disabled={isPending}
              />
            )}

            {/* Server Error */}
            {serverError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-red-600 text-sm text-center font-medium flex items-center justify-center gap-2">
                  <AlertCircle size={16} />
                  {serverError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 via-primary-600 to-green-600 hover:from-primary-600 hover:via-primary-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={toggleMode}
                disabled={isPending}
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors underline decoration-primary-500/30 hover:decoration-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Security Footer */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield size={12} className="text-primary-500" />
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={12} className="text-primary-500" />
                <span>Secure login</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-0 w-full h-full">
          <div className="absolute top-4 left-4 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-green-400/20 rounded-full blur-2xl" />
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
