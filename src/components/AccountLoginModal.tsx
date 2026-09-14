import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UserSession, RegisteredUser } from '../types';
import {
  loginUser,
  registerUser,
  getRegisteredUsers,
  fetchRegisteredUsers,
} from '../data/authService';
import {
  signInWithGoogle,
  signInWithEmail,
  logOutFirebase,
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
  Sparkles,
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
  const [email, setEmail] = useState('moshe.ravikampadu@gmail.com');
  const [password, setPassword] = useState('worship2026');
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
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Registered accounts for quick switching
  const [accounts, setAccounts] = useState<RegisteredUser[]>(() => getRegisteredUsers());

  useEffect(() => {
    if (isOpen) {
      setIsLoadingAccounts(true);
      fetchRegisteredUsers()
        .then((list) => {
          if (Array.isArray(list)) setAccounts(list);
        })
        .finally(() => setIsLoadingAccounts(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setErrorType(null);
    setIsSubmitting(true);

    try {
      const { session } = await signInWithGoogle();
      localStorage.setItem('worship_user_session', JSON.stringify(session));
      onLogin(session);
      onClose();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed. Please try again or use email.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorType(null);
    setIsSubmitting(true);

    try {
      // 1. Attempt Firebase Authentication
      try {
        const fbSession = await signInWithEmail(email, password);
        localStorage.setItem('worship_user_session', JSON.stringify(fbSession));
        onLogin(fbSession);
        onClose();
        return;
      } catch (fbErr: any) {
        console.warn('Firebase email auth fell back to registered accounts:', fbErr?.message);
      }

      // 2. Fallback to registered church account
      const result = await loginUser(email, password);
      if (!result.success || !result.session) {
        setErrorMsg(result.error || 'Failed to sign in.');
        setErrorType(result.errorType || 'general_error');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('worship_user_session', JSON.stringify(result.session));
      onLogin(result.session);
      onClose();
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred during login.');
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

    setIsSubmitting(true);

    try {
      // Sync to Firebase Auth
      try {
        await signInWithEmail(regEmail, regPassword);
      } catch (e) {}

      const result = await registerUser({
        name: regName,
        churchName: regChurch,
        email: regEmail,
        password: regPassword,
      });

      if (!result.success || !result.session) {
        setErrorMsg(result.error || 'Failed to register.');
        setErrorType(result.errorType || 'general_error');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('worship_user_session', JSON.stringify(result.session));
      onLogin(result.session);
      onClose();
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  const handleSelectAccount = (acc: RegisteredUser) => {
    setEmail(acc.email);
    if (acc.password) {
      setPassword(acc.password);
    }
    setErrorMsg('');
    setModalMode('login');
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
            {/* Firebase Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google (Firebase)</span>
            </button>

            <div className="flex items-center gap-2 py-0.5">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                or sign in with credentials
              </span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

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

        {/* Quick Church Accounts Switcher */}
        {(isLoadingAccounts || accounts.length > 0) && (
          <div className="pt-3 border-t border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Registered Accounts ({accounts.length})
            </span>
            {isLoadingAccounts ? (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 py-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                Loading registered accounts...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                {accounts.map((acc) => (
                  <button
                    key={acc.id || acc.email}
                    type="button"
                    onClick={() => handleSelectAccount(acc)}
                    className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors text-[11px]"
                  >
                    <div className="font-bold text-slate-200 truncate">{acc.name}</div>
                    <div className="text-[10px] text-sky-400 truncate">{acc.churchName}</div>
                    <div className="text-[9px] text-slate-400 truncate">{acc.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document === 'undefined' ? null : createPortal(modal, document.body);
};
