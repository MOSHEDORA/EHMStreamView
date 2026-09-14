import React, { useState } from 'react';
import { WorshipState, UserSession, DeviceMode } from '../types';
import { AccountLoginModal } from './AccountLoginModal';
import { OutputUrlsModal } from './OutputUrlsModal';
import {
  Wifi,
  WifiOff,
  ExternalLink,
  Tv,
  Maximize2,
  Monitor,
  EyeOff,
  Square,
  Church,
  Bell,
  Copy,
  Check,
  Radio,
  Sparkles,
  ChevronDown,
  LogIn,
  Layers,
  Smartphone,
  Tablet,
} from 'lucide-react';

interface BroadcastActionBarProps {
  state: WorshipState;
  account: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  connectedCount: number;
  userSession: UserSession;
  deviceMode?: DeviceMode;
  onChangeDevice?: () => void;
  onChangeAccount: (newAccount: string) => void;
  onLogout: () => void;
  onUpdateSession?: (newSession: UserSession) => void;
  onToggleBlackout: () => void;
  onToggleClearText: () => void;
  onToggleLogo: () => void;
  onBroadcastAlert: (text: string) => void;
  onClearAlert: () => void;
}

export const BroadcastActionBar: React.FC<BroadcastActionBarProps> = ({
  state,
  account,
  connectionStatus,
  connectedCount,
  userSession,
  deviceMode,
  onChangeDevice,
  onChangeAccount,
  onLogout,
  onUpdateSession,
  onToggleBlackout,
  onToggleClearText,
  onToggleLogo,
  onBroadcastAlert,
  onClearAlert,
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isOutputUrlsModalOpen, setIsOutputUrlsModalOpen] = useState(false);
  const [alertInput, setAlertInput] = useState(state.alertText || '');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleLogin = (newSession: UserSession) => {
    if (onUpdateSession) {
      onUpdateSession(newSession);
    }
    onChangeAccount(newSession.accountName);
  };

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(label);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const getPopoutUrl = (type: 'fullscreen' | 'lowerthird' | 'stage') => {
    const origin = window.location.origin;
    if (type === 'stage') {
      return `${origin}/?view=stage&account=${encodeURIComponent(account)}`;
    }
    if (type === 'lowerthird') {
      return `${origin}/?view=lowerthird&account=${encodeURIComponent(account)}`;
    }
    return `${origin}/?view=display&account=${encodeURIComponent(account)}`;
  };

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-3 text-slate-100 shrink-0 z-30 shadow-md">
      {/* Left: Brand + Church Account Profile */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center shadow-md shadow-sky-600/30">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-white tracking-wide">
                VERSEVIEW PRO
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-300 font-bold">
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Church Account Badge / Profile Switcher */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          {userSession.isLoggedIn ? (
            <button
              id="account-login-profile-btn"
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 hover:border-sky-500/50 rounded-xl px-2.5 py-1 text-xs transition-all shadow-sm group"
              title="Church Profile: Click to switch account, log out, or edit details"
            >
              <div className="w-5 h-5 rounded-md bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Church className="w-3 h-3" />
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white text-xs truncate max-w-[120px] sm:max-w-[160px]">
                    {userSession.churchName}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          ) : (
            <button
              id="account-signin-btn"
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Church Sign In</span>
            </button>
          )}

          {/* Real-time Connection Indicator */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 pl-1 font-mono">
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold" title="Live sync channel active">
                <Wifi className="w-3 h-3" />
                <span>{connectedCount} display{connectedCount > 1 ? 's' : ''}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-3 h-3" />
                <span>Syncing</span>
              </span>
            )}
          </div>
          {/* Device Profile Switcher */}
          {deviceMode && (
            <button
              id="topbar-device-mode-btn"
              type="button"
              onClick={onChangeDevice}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all shadow-sm"
              title={`Running in ${deviceMode} mode. Click to switch hardware layout.`}
            >
              {deviceMode === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-sky-400" />}
              {deviceMode === 'tablet' && <Tablet className="w-3.5 h-3.5 text-indigo-400" />}
              {deviceMode === 'desktop' && <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline font-semibold capitalize">{deviceMode}</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: DEDICATED SEPARATE OUTPUT URLS */}
      <div className="flex items-center gap-2">
        {/* SEPARATE LOWER THIRD URL (OBS Studio / vMix) */}
        <div className="flex items-center shadow-sm">
          <a
            id="open-lowerthird-popout-link"
            href={getPopoutUrl('lowerthird')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-xl bg-emerald-950/80 border border-emerald-500/60 hover:bg-emerald-900 text-emerald-200 text-xs font-bold transition-colors"
            title="Open Separate Lower Third Display for OBS / Live Stream (100% Transparent)"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Lower Third URL</span>
            <span className="sm:hidden">Lower Third</span>
            <ExternalLink className="w-3 h-3 text-emerald-400/80 ml-0.5" />
          </a>
          <button
            id="copy-obs-url-btn"
            type="button"
            onClick={() => handleCopy(getPopoutUrl('lowerthird'), 'obs')}
            className="px-2.5 py-1.5 rounded-r-xl bg-emerald-900 border-t border-r border-b border-emerald-500/60 hover:bg-emerald-800 text-white text-xs font-bold transition-colors"
            title="Copy Separate Lower Third URL for OBS Browser Source"
          >
            {copiedUrl === 'obs' ? (
              <span className="flex items-center gap-1 text-white">
                <Check className="w-3 h-3 text-white" />
                <span className="text-[10px]">Copied!</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-3 h-3 text-emerald-300" />
                <span className="text-[10px] hidden md:inline">Copy</span>
              </span>
            )}
          </button>
        </div>

        {/* Sanctuary Projector Popout */}
        <a
          id="open-fullscreen-popout-link"
          href={getPopoutUrl('fullscreen')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-500 text-slate-200 text-xs font-semibold transition-colors shadow-sm"
          title="Open Fullscreen Output for Main Sanctuary Projector"
        >
          <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Projector</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {/* Quick Launch Both Screens at Same Time */}
        <button
          id="open-both-screens-btn"
          type="button"
          onClick={() => {
            window.open(getPopoutUrl('fullscreen'), '_blank');
            window.open(getPopoutUrl('lowerthird'), '_blank');
          }}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/50 hover:bg-purple-900 text-purple-200 text-xs font-bold transition-colors shadow-sm"
          title="Open Both Sanctuary Projector and OBS Lower Third simultaneously in separate windows"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Open Both</span>
        </button>

        {/* All URLs Guide */}
        <button
          id="open-all-urls-modal-btn"
          type="button"
          onClick={() => setIsOutputUrlsModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          title="View all display URLs & OBS connection guide"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Display URLs</span>
        </button>
      </div>

      {/* Right: Master Control Actions (Blackout, Clear Text, Logo, Alert) */}
      <div className="flex items-center gap-1.5">
        {/* Urgent Alert Banner */}
        <button
          id="broadcast-alert-btn"
          type="button"
          onClick={() => setIsAlertModalOpen(true)}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
            state.isAlertVisible
              ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Broadcast Urgent Overhead Message or Nursery Alert"
        >
          <Bell className="w-3 h-3" />
          <span className="hidden md:inline">Alert</span>
        </button>

        {/* Logo Button */}
        <button
          id="broadcast-logo-btn"
          type="button"
          onClick={onToggleLogo}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
            state.isLogo
              ? 'bg-sky-500 border-sky-400 text-white shadow'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Display Church Logo Slide (F3)"
        >
          <Church className="w-3 h-3" />
          <span className="hidden md:inline">Logo</span>
        </button>

        {/* Clear Text Button */}
        <button
          id="broadcast-clear-btn"
          type="button"
          onClick={onToggleClearText}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
            state.isClearText
              ? 'bg-amber-500 border-amber-400 text-slate-950 shadow'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Clear Text, Keep Background (F2)"
        >
          <EyeOff className="w-3 h-3" />
          <span className="hidden md:inline">Clear</span>
        </button>

        {/* Blackout Button */}
        <button
          id="broadcast-blackout-btn"
          type="button"
          onClick={onToggleBlackout}
          className={`px-3 py-1.5 rounded-lg border text-xs font-extrabold flex items-center gap-1 transition-all ${
            state.isBlackout
              ? 'bg-rose-600 border-rose-500 text-white shadow-lg ring-2 ring-rose-500'
              : 'bg-slate-900 border-slate-700 text-rose-400 hover:bg-rose-950/40'
          }`}
          title="Fade to Full Blackout (F1)"
        >
          <Square className="w-3 h-3 fill-current" />
          <span>BLACK</span>
        </button>
      </div>

      {/* Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Broadcast Urgent Screen Alert</h3>
            </div>

            <p className="text-xs text-slate-400">
              This message appears immediately as an overhead banner across all active projector and stream displays.
            </p>

            <input
              id="alert-message-input"
              type="text"
              value={alertInput}
              onChange={(e) => setAlertInput(e.target.value)}
              placeholder="e.g. Nursery Call: Child #142 to Preschool Desk"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <div className="flex items-center justify-between pt-2">
              {state.isAlertVisible && (
                <button
                  type="button"
                  onClick={() => {
                    onClearAlert();
                    setIsAlertModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-xs font-semibold text-rose-200"
                >
                  Clear Current Alert
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Close
                </button>
                <button
                  id="submit-alert-btn"
                  type="button"
                  onClick={() => {
                    if (alertInput.trim()) {
                      onBroadcastAlert(alertInput.trim());
                      setIsAlertModalOpen(false);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Broadcast Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Church Team Profile / Login Modal */}
      <AccountLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSession={userSession}
        onLogin={handleLogin}
        onLogout={() => {
          setIsLoginModalOpen(false);
          onLogout();
        }}
      />

      {/* Output URLs Modal */}
      <OutputUrlsModal
        isOpen={isOutputUrlsModalOpen}
        onClose={() => setIsOutputUrlsModalOpen(false)}
        account={account}
      />
    </header>
  );
};
