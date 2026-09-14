import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserSession } from '../types';
import {
  signInWithEmail,
  sendEmailPasswordReset,
  registerWithEmail,
  getEmailAuthErrorMessage,
} from '../services/firebase';
import {
  Church,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  LogOut,
  ArrowRight,
  LogIn,
  UserPlus,
  AlertCircle,
  User,
  RefreshCw,
} from 'lucide-react';

interface AccountLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
}

export const AccountLoginModal: React.FC<AccountLoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLogin,
  onLogout,
}) => {
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regChurch, setRegChurch] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [errorType, setErrorType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorType(null);
    setIsSubmitting(true);

    try {
      const session = await signInWithEmail(email, password);
      localStorage.setItem('worship_user_session', JSON.stringify(session));
      onLogin(session);
      onClose();
    } catch (err: any) {
      setErrorMsg(getEmailAuthErrorMessage(err, 'sign in'));
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    setErrorType(null);
    setIsSubmitting(true);
    try {
      await sendEmailPasswordReset(email);
      setErrorMsg('If an account exists for this email, a password reset link has been sent.');
      setErrorType('reset_sent');
    } catch (err: any) {
      setErrorMsg(getEmailAuthErrorMessage(err, 'sign in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorType(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match! Please check your password confirmation.');
      setErrorType('password_mismatch');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must contain at least 6 characters.');
      setErrorType('weak_password');
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await registerWithEmail(regName, regEmail, regPassword, regChurch);
      localStorage.setItem('worship_user_session', JSON.stringify(session));
      onLogin(session);
      onClose();
    } catch (err: any) {
      setErrorMsg(getEmailAuthErrorMessage(err, 'register'));
      setIsSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
              <Church className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Church Account &amp; Operator
              </h2>
              <p className="text-xs text-slate-400">
                Manage your credentials &amp; synchronized room
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Firebase Sync
          </div>
        </div>

        {/* Current Signed In status */}
        {currentSession.isLoggedIn && (
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Current Session
                </span>
                <span className="text-sm font-bold text-white">
                  {currentSession.churchName}
                </span>
                <div className="text-xs text-slate-400">
                  {currentSession.operatorName} · Room: #{currentSession.accountName}
                </div>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isSubmitting}
                  className="mt-1.5 text-[11px] font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-50"
                >
                  Reset password
                </button>
              </div>
            </div>

            <button
              id="modal-logout-btn"
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Switch mode tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setModalMode('login');
              setErrorMsg('');
              setErrorType(null);
            }}
            className={`py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              modalMode === 'login'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Switch</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setModalMode('register');
              setErrorMsg('');
              setErrorType(null);
            }}
            className={`py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              modalMode === 'register'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-700/80 text-rose-200 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-semibold">{errorMsg}</p>
                {errorType === 'user_not_found' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('register');
                      setRegEmail(email);
                      setErrorMsg('');
                      setErrorType(null);
                    }}
                    className="text-[11px] font-bold text-sky-400 underline underline-offset-2 hover:text-sky-300"
                  >
                    Register account with this email →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 1. Login Form */}
        {modalMode === 'login' ? (
          <div className="space-y-3">
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="name@church.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/30"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 2. Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Operator Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. Moshe Ravi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Church / Ministry Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Church className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regChurch}
                  onChange={(e) => {
                    setRegChurch(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. Grace Community Church"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="pastor@church.org"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm *
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating &amp; Syncing...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create &amp; Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );

  return typeof document === 'undefined' ? null : createPortal(modal, document.body);
};
