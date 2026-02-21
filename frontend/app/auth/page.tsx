'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { useAuthAPI } from '@/hooks/useAuthAPI';
import { useToast } from '@/hooks/useToast';
import { validationPatterns } from '@/lib/validation';
import { IMAGES } from '@/lib/constants';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, loading, error: authError } = useAuthAPI();
  const { toast } = useToast();

  // Si el usuario ya está autenticado, redirigir a home
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email es requerido';
    } else if (!validationPatterns.email.value.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      // Name validation for registration
      if (!formData.firstName) {
        newErrors.firstName = 'Nombre es requerido';
      } else if (formData.firstName.length < 2) {
        newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmar contraseña es requerido';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
        toast({
          message: '¡Bienvenido!',
          type: 'success',
        });
        router.push('/');
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        toast({
          message: 'Cuenta creada exitosamente',
          type: 'success',
        });
        router.push('/');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en autenticación';
      toast({
        message,
        type: 'error',
      });
    }
  };

  const handleTabSwitch = (login: boolean) => {
    setIsLogin(login);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Hero Image Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
        <img
          alt="Modern luxury lifestyle product display"
          className="absolute inset-0 object-cover w-full h-full"
          src={IMAGES.hero}
        />
        <div className="relative z-20 flex flex-col justify-end p-16 h-full text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="size-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
              <MaterialIcon name="shopping_bag" />
            </div>
            <span className="text-2xl font-black tracking-tight">FlexiCommerce</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-6">
            Elevate your <br />shopping experience.
          </h1>
          <p className="text-lg text-white/80 max-w-md leading-relaxed">
            Join thousands of shoppers and store owners who trust FlexiCommerce for a seamless,
            modern retail journey.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              <img
                alt="User"
                className="size-10 rounded-full border-2 border-primary object-cover"
                src={IMAGES.userAvatar}
              />
              <img
                alt="User"
                className="size-10 rounded-full border-2 border-primary object-cover"
                src={IMAGES.userAvatar}
              />
              <img
                alt="User"
                className="size-10 rounded-full border-2 border-primary object-cover"
                src={IMAGES.userAvatar}
              />
            </div>
            <p className="text-sm font-medium text-white/90">Trusted by over 10k+ active users</p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="size-8 bg-primary rounded flex items-center justify-center">
              <MaterialIcon name="shopping_bag" className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary">FlexiCommerce</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-primary mb-3">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-[#5d6a89] font-medium">
              {isLogin ? 'Welcome back! Please enter your details.' : 'Join us today. It\'s free!'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-[#eaecf1] mb-8">
            <button
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-colors ${
                isLogin
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[#5d6a89] hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 pb-4 text-sm font-bold border-b-2 transition-colors ${
                !isLogin
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[#5d6a89] hover:text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Social Login Group */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-12 px-4 border border-[#eaecf1] rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-bold text-primary"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 h-12 px-4 border border-[#eaecf1] rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm font-bold text-primary"
            >
              <MaterialIcon name="phone_iphone" className="text-primary" />
              <span>Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#eaecf1]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-[#5d6a89] font-semibold tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Auth Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full h-12 px-4 bg-white border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 ${
                      errors.firstName ? 'border-red-500' : 'border-[#eaecf1]'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Pérez"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full h-12 px-4 bg-white border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 ${
                      errors.lastName ? 'border-red-500' : 'border-[#eaecf1]'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-primary mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full h-12 px-4 bg-white border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 ${
                  errors.email ? 'border-red-500' : 'border-[#eaecf1]'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-primary" htmlFor="password">
                  Password
                </label>
                {isLogin && (
                  <a className="text-sm font-bold text-primary hover:underline underline-offset-4" href="#">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full h-12 px-4 bg-white border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 ${
                    errors.password ? 'border-red-500' : 'border-[#eaecf1]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  <MaterialIcon name={showPassword ? 'visibility_off' : 'visibility'} className="text-xl" />
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-primary mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full h-12 px-4 bg-white border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-[#eaecf1]'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center">
                <input
                  className="size-4 rounded border-[#eaecf1] text-primary focus:ring-primary transition-all"
                  id="remember"
                  type="checkbox"
                />
                <label className="ml-2 text-sm font-medium text-[#5d6a89]" htmlFor="remember">
                  Remember me for 30 days
                </label>
              </div>
            )}

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <MaterialIcon name="hourglass_bottom" />}
              {loading
                ? isLogin
                  ? 'Signing in...'
                  : 'Creating account...'
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5d6a89] font-medium">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => handleTabSwitch(!isLogin)}
              type="button"
              className="text-primary font-bold hover:underline underline-offset-4 ml-1"
            >
              {isLogin ? 'Sign up for free' : 'Sign in'}
            </button>
          </p>

          <footer className="mt-16 text-center text-xs text-gray-400 space-x-4">
            <a className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
