import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BizoraLogo } from '../components/BizoraLogo';
import { useBizora } from '../context/BizoraContext';

const HERO_IMAGE_PATH = '/src/assets/images/bizora_workspace_hero_1794909250907.jpg';

interface FormErrors {
  businessName?: string;
  name?: string;
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
}

export function Register() {
  const { isAuthenticated, register } = useBizora();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!businessName.trim() || businessName.trim().length < 2) {
      next.businessName = 'Enter your business or store name.';
    }
    if (!name.trim() || name.trim().length < 2) {
      next.name = 'Enter the account owner full name.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!mobile.trim() || !/^[0-9+\-\s]{8,15}$/.test(mobile.trim())) {
      next.mobile = 'Enter a valid 10-digit mobile number.';
    }
    if (!password || password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    if (confirmPassword !== password) {
      next.confirmPassword = 'Passwords do not match.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    register({ businessName, name, email, mobile, password });
    navigate('/dashboard');
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] grid lg:grid-cols-12">
      <div className="hidden lg:flex lg:col-span-5 bg-[#12304A] text-white flex-col justify-between p-10">
        <BizoraLogo variant="light" showTagline />

        <div className="my-6 rounded-2xl overflow-hidden border border-white/15 bg-[#1B4466]">
          <img
            src={HERO_IMAGE_PATH}
            alt="BIZORA retail showroom workspace"
            referrerPolicy="no-referrer"
            className="w-full h-[320px] object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-medium text-[#F4B942]">Get started in minutes</p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-balance">
            Set up your digital storefront ledger and stock control.
          </h2>
          <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
            Track multi-item orders, partial customer settlements, supplier restocks, and low-stock alerts from desktop or mobile.
          </p>
        </div>
      </div>

      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200/90 shadow-xs p-7 sm:p-9">
          <div className="lg:hidden mb-6">
            <BizoraLogo variant="dark" showTagline />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#12304A]">
            Create your BIZORA account
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Register your business workspace to manage inventory, orders, and payments.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor="reg-business" className="block text-sm font-medium text-slate-700 mb-1.5">
                Business name
              </label>
              <input
                id="reg-business"
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  clearError('businessName');
                }}
                placeholder="e.g. Sharma Electricals & Hardware"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
              />
              {errors.businessName && <p className="mt-1 text-xs text-red-600">{errors.businessName}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your full name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError('name');
                  }}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="reg-mobile" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile number
                </label>
                <input
                  id="reg-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value);
                    clearError('mobile');
                  }}
                  placeholder="9820451290"
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
                />
                {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError('email');
                }}
                placeholder="rohan@sharmaelectricals.in"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError('password');
                    }}
                    placeholder="Min. 6 characters"
                    className="w-full min-h-[42px] pl-3.5 pr-10 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  placeholder="Re-enter password"
                  className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83] focus:ring-2 focus:ring-[#168C83]/15"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] mt-2 px-5 py-2.5 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Create Business Account</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have a BIZORA account?{' '}
            <Link
              to="/login"
              className="font-semibold text-[#168C83] hover:text-[#11736B] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
