import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BizoraLogo } from '../components/BizoraLogo';
import { useBizora } from '../context/BizoraContext';

const HERO_IMAGE_PATH = '/src/assets/images/bizora_workspace_hero_1794909250907.jpg';

export function Login() {
  const { isAuthenticated, login, loginDemo, addToast } = useBizora();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login(email, password);
    navigate('/dashboard');
  };

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/dashboard');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetError('Please enter a valid registered email address.');
      return;
    }
    setResetError('');
    setResetSent(true);
    addToast(`Password reset instructions prepared for ${resetEmail.trim()}`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] grid lg:grid-cols-12">
      {/* Left: Editorial Showcase Panel */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#12304A] text-white flex-col justify-between p-10 relative overflow-hidden">
        <div className="relative z-10">
          <BizoraLogo variant="light" showTagline />
        </div>

        <div className="relative z-10 my-8 rounded-2xl overflow-hidden border border-white/15 bg-[#1B4466]">
          <img
            src={HERO_IMAGE_PATH}
            alt="Organized BIZORA retail showroom and inventory workspace"
            referrerPolicy="no-referrer"
            className="w-full h-[360px] object-cover"
          />
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-medium text-[#F4B942] tracking-wide">
            Smart Business Management Platform
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-balance">
            Inventory, billing, customers, and supplier purchases in one unified ledger.
          </h2>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            Built for growing wholesale and retail merchants to track stock thresholds, partial payments, and daily sales without spreadsheets.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xs p-7 sm:p-9">
          <div className="lg:hidden mb-6">
            <BizoraLogo variant="dark" showTagline />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-[#12304A]">
              Sign in to BIZORA
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Har Business, Ek Jagah. Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="ananya@mehtahardware.in"
                autoComplete="email"
                className={`w-full min-h-[42px] px-3.5 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[#168C83] focus:ring-[#168C83]/15'
                }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetSent(false);
                    setResetError('');
                    setForgotOpen(true);
                  }}
                  className="text-xs font-medium text-[#168C83] hover:text-[#11736B] hover:underline focus-visible:outline-2 focus-visible:outline-[#168C83] rounded"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Minimum 6 characters"
                  autoComplete="current-password"
                  className={`w-full min-h-[42px] pl-3.5 pr-10 py-2 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#168C83] focus:ring-[#168C83]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#168C83]"
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full min-h-[42px] px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#12304A] text-sm font-medium transition-colors"
            >
              Explore Demo Workspace
            </button>
            <p className="mt-2.5 text-xs text-slate-500 text-center">
              Preview mode uses sample business records until backend APIs are connected.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to BIZORA?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#168C83] hover:text-[#11736B] hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-lg bg-[#12304A]/8 text-[#12304A] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold text-[#12304A]">
                    Reset your password
                  </h2>
                  <p className="text-xs text-slate-500">
                    We will send a recovery link to your business email.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                aria-label="Close modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSent ? (
              <div className="mt-5">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                  Recovery instructions have been queued for <span className="font-semibold">{resetEmail}</span>. Check your inbox or return to sign in.
                </div>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="mt-4 w-full min-h-[40px] px-4 py-2 rounded-lg bg-[#12304A] text-white text-sm font-medium hover:bg-[#1B4466]"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} noValidate className="mt-5 space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Registered Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setResetError('');
                    }}
                    placeholder="owner@company.in"
                    className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
                  />
                  {resetError && <p className="mt-1.5 text-xs text-red-600">{resetError}</p>}
                </div>
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] text-white text-sm font-medium hover:bg-[#11736B]"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
