import React, { useState } from 'react';
import { UserSession, DeviceMode } from '../types';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Tv,
  Maximize2,
  Languages,
  CheckCircle2,
  UserPlus,
  LogIn,
  AlertCircle,
  Church,
  User,
  Radio,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  Sliders,
} from 'lucide-react';
import { AppFooter } from './AppFooter';
import {
  getEmailAuthErrorMessage,
  sendEmailPasswordReset,
  signInWithEmail,
  registerWithEmail,
} from '../services/firebase';

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
  deviceMode?: DeviceMode | null;
  onChangeDevice?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  deviceMode = 'desktop',
  onChangeDevice,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');


  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regChurch, setRegChurch] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Error & Notification states
  const [errorMsg, setErrorMsg] = useState('');
  const [errorType, setErrorType] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSwitchToRegister = (prefillEmail?: string) => {
    setAuthMode('register');
    setErrorMsg('');
    setErrorType(null);
    setSuccessMsg('');
    if (prefillEmail) {
      setRegEmail(prefillEmail);
    }
  };

  const handleSwitchToLogin = (prefillEmail?: string) => {
    setAuthMode('login');
    setErrorMsg('');
    setErrorType(null);
    setSuccessMsg('');
    if (prefillEmail) {
      setLoginEmail(prefillEmail);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorType(null);
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const session = await signInWithEmail(loginEmail, loginPassword);
      setSuccessMsg('Welcome back! Connecting sanctuary session...');
      if (rememberMe) {
        localStorage.setItem('worship_user_session', JSON.stringify(session));
      }
      setTimeout(() => {
        onLogin(session);
      }, 350);
    } catch (err: any) {
      setErrorMsg(getEmailAuthErrorMessage(err, 'sign in'));
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    setErrorType(null);
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await sendEmailPasswordReset(loginEmail);
      setSuccessMsg('If an account exists for this email, a password reset link has been sent.');
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
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match! Please verify your password and confirm password.');
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
      setSuccessMsg('Account created. Synced across all devices. Logging in...');

      if (rememberMe) {
        localStorage.setItem('worship_user_session', JSON.stringify(session));
      }
      setTimeout(() => {
        onLogin(session);
      }, 400);
    } catch (err: any) {
      setErrorMsg(getEmailAuthErrorMessage(err, 'register'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/30 flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-white tracking-wider">
                VERSEVIEW &amp; BIBLESHOW PRO
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-bold hidden xs:inline-block">
                EASY EDITION
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[240px] sm:max-w-none">
              Dual-Language Scripture &amp; Worship Presentation Suite
            </p>
          </div>
        </div>

      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 space-y-4">
        {/* Configured Device Mode Banner */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-400">
              {deviceMode === 'mobile' && <Smartphone className="w-4 h-4 text-sky-400" />}
              {deviceMode === 'tablet' && <Tablet className="w-4 h-4 text-indigo-400" />}
              {deviceMode === 'desktop' && <Monitor className="w-4 h-4 text-emerald-400" />}
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Configured Layout
              </span>
              <span className="font-extrabold text-white">
                {deviceMode === 'mobile' && 'Mobile Smartphone'}
                {deviceMode === 'tablet' && 'Tablet / iPad'}
                {deviceMode === 'desktop' && 'Desktop / Studio PC'}
              </span>
            </div>
          </div>

          {onChangeDevice && (
            <button
              type="button"
              onClick={onChangeDevice}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="Change device hardware layout"
            >
              <Sliders className="w-3 h-3 text-sky-400" />
              <span>Change</span>
            </button>
          )}
        </div>

        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
            {/* Top Brand Logo */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 mb-2 shadow-inner">
                {authMode === 'login' ? (
                  <LogIn className="w-6 h-6" />
                ) : (
                  <UserPlus className="w-6 h-6" />
                )}
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {authMode === 'login' ? 'Operator Sign In' : 'Register Church Account'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login'
                  ? 'Sign in to access your projection console & setlists'
                  : 'Create an operator account for your church ministry'}
              </p>
            </div>

            {/* Mode Switcher Tabs (Sign In / Register) */}
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-5">
              <button
                id="tab-switch-login"
                type="button"
                onClick={() => handleSwitchToLogin()}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'login'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                id="tab-switch-register"
                type="button"
                onClick={() => handleSwitchToRegister()}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'register'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* Error Message with Specific Contextual Help */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/80 text-rose-200 text-xs shadow-md">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold leading-relaxed">{errorMsg}</p>
                    
                    {/* If user not found, show 1-click register button */}
                    {errorType === 'user_not_found' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchToRegister(loginEmail)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 border border-rose-600 text-white font-bold text-xs transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register with "{loginEmail}" now →</span>
                      </button>
                    )}

                    {/* If email already registered, show 1-click sign in button */}
                    {errorType === 'user_already_exists' && (
                      <button
                        type="button"
                        onClick={() => handleSwitchToLogin(regEmail)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 border border-rose-600 text-white font-bold text-xs transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In with "{regEmail}" →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/80 text-emerald-200 text-xs flex items-center gap-2.5 shadow-md">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="login-email-input"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="name@church.org"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
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

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password-input"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-950 border-slate-700"
                    />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Access
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    id="submit-email-login-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 transition-all group"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Signing In &amp; Synchronizing...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                {/* Prompt to register */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchToRegister(loginEmail)}
                      className="text-sky-400 hover:text-sky-300 font-bold underline underline-offset-2 ml-1"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              /* 2. REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="reg-name-input"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Your Name / Operator Title *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-name-input"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => {
                        setRegName(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="e.g. Moshe Ravi or AV Tech"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                {/* Church / Ministry Name */}
                <div>
                  <label
                    htmlFor="reg-church-input"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Church / Ministry Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Church className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-church-input"
                      type="text"
                      required
                      value={regChurch}
                      onChange={(e) => {
                        setRegChurch(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="e.g. Grace Community Church"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="reg-email-input"
                    className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reg-email-input"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="e.g. pastor@gracechurch.org"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="reg-password-input"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password-input"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-confirm-password-input"
                      className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm-password-input"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          setErrorMsg('');
                        }}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="flex items-center gap-1 hover:text-slate-200"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showRegPassword ? 'Hide password' : 'Show password'}</span>
                  </button>
                  <span>Min. 4 characters</span>
                </div>

                {/* Submit Register */}
                <div className="pt-2">
                  <button
                    id="submit-register-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all group"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Creating Church Account &amp; Syncing...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Create Church Account &amp; Start</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prompt to Sign In */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchToLogin(regEmail)}
                      className="text-sky-400 hover:text-sky-300 font-bold underline underline-offset-2 ml-1"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Feature Highlights */}
            <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <Languages className="w-4 h-4 mx-auto text-sky-400 mb-1" />
                <span>Dual Bible</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <Maximize2 className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <span>Sanctuary</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <Tv className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                <span>OBS Overlay</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Version, Designer Attribution, Live Users & New Users */}
      <AppFooter deviceMode={deviceMode || 'desktop'} />
    </div>
  );
};
