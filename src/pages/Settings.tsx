import React, { useState } from 'react';
import { LogOut, RotateCcw, Save } from 'lucide-react';
import { useBizora } from '../context/BizoraContext';

export function Settings() {
  const {
    user,
    businessProfile,
    updateBusinessProfile,
    updateUserAccount,
    resetDemoWorkspace,
    logout,
    addToast,
  } = useBizora();

  const [bizForm, setBizForm] = useState(businessProfile);
  const [accountForm, setAccountForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    mobile: user?.mobile ?? '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizForm.businessName.trim()) {
      addToast('Business name cannot be empty', 'error');
      return;
    }
    updateBusinessProfile(bizForm);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name.trim() || !accountForm.email.trim()) {
      addToast('Name and email are required', 'error');
      return;
    }
    updateUserAccount(accountForm);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordError('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    addToast('Password updated successfully');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Business Profile */}
      <form
        onSubmit={handleSaveBusiness}
        className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#12304A]">
              Business Profile
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Displayed on your workspace header, invoices, and reports
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={bizForm.businessName}
              onChange={(e) => setBizForm((p) => ({ ...p, businessName: e.target.value }))}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              GST / Tax Registration
            </label>
            <input
              type="text"
              value={bizForm.gstNumber}
              onChange={(e) => setBizForm((p) => ({ ...p, gstNumber: e.target.value }))}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Tagline
            </label>
            <input
              type="text"
              value={bizForm.tagline}
              onChange={(e) => setBizForm((p) => ({ ...p, tagline: e.target.value }))}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Phone
            </label>
            <input
              type="tel"
              value={bizForm.phone}
              onChange={(e) => setBizForm((p) => ({ ...p, phone: e.target.value }))}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Currency Symbol
            </label>
            <select
              value={bizForm.currency}
              onChange={(e) =>
                setBizForm((p) => ({ ...p, currency: e.target.value as '₹' | '$' }))
              }
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#168C83]"
            >
              <option value="₹">INR (₹)</option>
              <option value="$">USD ($)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Registered Address
            </label>
            <textarea
              rows={2}
              value={bizForm.address}
              onChange={(e) => setBizForm((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg bg-[#168C83] hover:bg-[#11736B] text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Business Profile</span>
          </button>
        </div>
      </form>

      {/* Account Details & Password Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSaveAccount}
          className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4"
        >
          <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#12304A] text-white flex items-center justify-center font-semibold">
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-display text-base font-semibold text-[#12304A]">
                Account Details
              </h2>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={accountForm.name}
              onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={accountForm.email}
              onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
            <input
              type="tel"
              value={accountForm.mobile}
              onChange={(e) => setAccountForm((p) => ({ ...p, mobile: e.target.value }))}
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 rounded-lg bg-[#12304A] hover:bg-[#1B4466] text-white text-sm font-medium transition-colors"
            >
              Update Account
            </button>
          </div>
        </form>

        <form
          onSubmit={handleUpdatePassword}
          className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4"
        >
          <div className="pb-3 border-b border-slate-100">
            <h2 className="font-display text-base font-semibold text-[#12304A]">
              Password Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your business account credentials secure
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              className="w-full min-h-[40px] px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#168C83]"
            />
          </div>

          {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[#12304A] text-sm font-medium transition-colors"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Workspace Session & Preview Reset */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-[#12304A]">
            Session & Preview Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Running in frontend preview mode with sample business records until backend APIs are connected.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={resetDemoWorkspace}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Sample Data</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
