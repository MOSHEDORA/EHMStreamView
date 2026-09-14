import React, { useState, useEffect } from 'react';
import { useWorshipSync } from './hooks/useWorshipSync';
import { BroadcastActionBar } from './components/BroadcastActionBar';
import { DashboardTab } from './components/DashboardTab';
import { BibleTab } from './components/BibleTab';
import { LyricsTab } from './components/LyricsTab';
import { MediaSettingsTab } from './components/MediaSettingsTab';
import { DisplayView } from './components/DisplayView';
import { StageDisplayView } from './components/StageDisplayView';
import { DualDisplayView } from './components/DualDisplayView';
import { LoginPage } from './components/LoginPage';
import { DeviceSelectionPage } from './components/DeviceSelectionPage';
import { LiveMonitorDesk } from './components/LiveMonitorDesk';
import { AppFooter } from './components/AppFooter';
import { SlideContent, UserSession, DeviceMode } from './types';
import {
  getStoredDeviceMode,
  setStoredDeviceMode,
  applyDeviceConfiguration,
  detectSuggestedDevice,
} from './data/deviceConfig';
import {
  LayoutDashboard,
  BookOpen,
  Music,
  Settings,
  Tv,
  LogOut,
  Maximize2,
  Sliders,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';

export default function App() {
  // Check URL query parameters for standalone projector, stage, or dedicated lower-third displays
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view')?.toLowerCase();

  // Simultaneous Dual Monitor URL (both Full Screen and Lower Third at same time)
  if (viewParam === 'both' || viewParam === 'dual' || viewParam === 'split') {
    return <DualDisplayView />;
  }

  // Dedicated OBS Lower Third URL (100% transparent browser source)
  if (viewParam === 'lowerthird' || viewParam === 'lower-third' || viewParam === 'obs') {
    return <DisplayView defaultMode="lowerthird" defaultTransparent={true} />;
  }

  // Dedicated Sanctuary Projector Full Screen URL
  if (viewParam === 'display' || viewParam === 'fullscreen' || viewParam === 'projector') {
    return <DisplayView defaultMode="fullscreen" defaultTransparent={false} />;
  }

  // Confidence / Stage monitor URL
  if (viewParam === 'stage') {
    return <StageDisplayView />;
  }

  // Device Selection & Configuration:
  // "When Opening App it self it should ask Mobile, tablet , desktop and do the configuration based on selection then it should sign in page and then open app based on selected device"
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    const stored = getStoredDeviceMode();
    const initial = stored || detectSuggestedDevice();
    applyDeviceConfiguration(initial);
    return initial;
  });

  const [hasCompletedDeviceStep, setHasCompletedDeviceStep] = useState<boolean>(() => {
    return sessionStorage.getItem('worship_device_step_completed') === 'true';
  });

  // Manage login session
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const isAuthActive = sessionStorage.getItem('worship_session_auth') === 'active';
      const saved = localStorage.getItem('worship_user_session');
      if (isAuthActive && saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isLoggedIn) {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const handleDeviceSelected = (mode: DeviceMode) => {
    setDeviceMode(mode);
    setStoredDeviceMode(mode);
    applyDeviceConfiguration(mode);
    sessionStorage.setItem('worship_device_step_completed', 'true');
    setHasCompletedDeviceStep(true);
  };

  const handleChangeDevice = () => {
    sessionStorage.removeItem('worship_device_step_completed');
    setHasCompletedDeviceStep(false);
  };

  const handleLogin = (newSession: UserSession) => {
    sessionStorage.setItem('worship_session_auth', 'active');
    localStorage.setItem('worship_user_session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('worship_session_auth');
    if (session) {
      const loggedOut = { ...session, isLoggedIn: false };
      localStorage.setItem('worship_user_session', JSON.stringify(loggedOut));
    }
    setSession(null);
  };

  const handleUpdateSession = (updatedSession: UserSession) => {
    localStorage.setItem('worship_user_session', JSON.stringify(updatedSession));
    setSession(updatedSession);
  };

  // STEP 1: When opening app itself, ask Mobile, Tablet, Desktop and configure
  if (!hasCompletedDeviceStep) {
    return (
      <DeviceSelectionPage
        initialMode={deviceMode}
        onDeviceSelected={handleDeviceSelected}
      />
    );
  }

  // STEP 2: Navigate to Sign In page (with active device mode shown & option to change)
  if (!session || !session.isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        defaultSession={session}
        deviceMode={deviceMode}
        onChangeDevice={handleChangeDevice}
      />
    );
  }

  // STEP 3: Open app customized based on selected device
  return (
    <OperatorConsole
      session={session}
      deviceMode={deviceMode}
      onLogout={handleLogout}
      onUpdateSession={handleUpdateSession}
      onChangeDevice={handleChangeDevice}
    />
  );
}

interface OperatorConsoleProps {
  session: UserSession;
  deviceMode: DeviceMode;
  onLogout: () => void;
  onUpdateSession: (newSession: UserSession) => void;
  onChangeDevice: () => void;
}

function OperatorConsole({
  session,
  deviceMode,
  onLogout,
  onUpdateSession,
  onChangeDevice,
}: OperatorConsoleProps) {
  const currentAccount = session.accountName || 'worship-main';
  const {
    account,
    changeAccount,
    state,
    updateState,
    connectionStatus,
    connectedCount,
    transportMode,
    connectedDevices,
    pingLatency,
    testPing,
  } = useWorshipSync(currentAccount, 'operator');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'lyrics' | 'bible' | 'settings'>('lyrics');
  const [isMobileMonitorOpen, setIsMobileMonitorOpen] = useState(false);
  const [isTabletDeskVisible, setIsTabletDeskVisible] = useState(true);

  // Keyboard shortcut listeners for live worship operators (Desktop/Studio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        updateState({ isBlackout: !state.isBlackout });
      } else if (e.key === 'F2') {
        e.preventDefault();
        updateState({ isClearText: !state.isClearText });
      } else if (e.key === 'F3') {
        e.preventDefault();
        updateState({ isLogo: !state.isLogo });
      } else if (e.key === 'PageDown' || (e.key === 'ArrowRight' && e.ctrlKey)) {
        // Advance to next queued slide
        if (state.nextSlide) {
          e.preventDefault();
          updateState({
            currentSlide: state.nextSlide,
            nextSlide: null,
            isBlackout: false,
            isClearText: false,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, updateState]);

  // Operator Action Handlers
  const handleGoLive = (slide: SlideContent, mode?: 'fullscreen' | 'lowerthird') => {
    updateState({
      currentSlide: slide,
      displayMode: mode || state.displayMode,
      isBlackout: false,
      isClearText: false,
      isLogo: false,
    });
  };

  const handleSetNext = (slide: SlideContent) => {
    updateState({ nextSlide: slide });
  };

  const handleAdvanceNext = () => {
    if (state.nextSlide) {
      updateState({
        currentSlide: state.nextSlide,
        nextSlide: null,
        isBlackout: false,
        isClearText: false,
      });
    }
  };

  const handleUpdateTheme = (updates: any) => {
    updateState({
      theme: {
        ...state.theme,
        ...updates,
      },
    });
  };

  const handleUpdateMode = (mode: 'fullscreen' | 'lowerthird') => {
    updateState({ displayMode: mode });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Global Broadcast Bar */}
      <BroadcastActionBar
        state={state}
        account={account}
        connectionStatus={connectionStatus}
        connectedCount={connectedCount}
        transportMode={transportMode}
        connectedDevices={connectedDevices}
        pingLatency={pingLatency}
        onTestPing={testPing}
        userSession={session}
        deviceMode={deviceMode}
        onChangeDevice={onChangeDevice}
        onChangeAccount={(acc) => {
          changeAccount(acc);
          onUpdateSession({ ...session, accountName: acc });
        }}
        onLogout={onLogout}
        onUpdateSession={onUpdateSession}
        onToggleBlackout={() => updateState({ isBlackout: !state.isBlackout })}
        onToggleClearText={() => updateState({ isClearText: !state.isClearText })}
        onToggleLogo={() => updateState({ isLogo: !state.isLogo })}
        onBroadcastAlert={(text) => updateState({ alertText: text, isAlertVisible: true })}
        onClearAlert={() => updateState({ isAlertVisible: false, alertText: '' })}
      />

      {/* 2. RESPONSIVE NAVIGATION BAR (Mobile, Tablet, Desktop) */}
      <nav
        aria-label="Main Navigation Tabs"
        className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-20 shadow-sm overflow-x-auto"
      >
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 shrink-0">
          {/* Tab 1: Lyrics */}
          <button
            id="nav-tab-lyrics-btn"
            type="button"
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lyrics'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          {/* Tab 2: Bible */}
          <button
            id="nav-tab-bible-btn"
            type="button"
            onClick={() => setActiveTab('bible')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bible'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scripture</span>
          </button>

          {/* Tab 3: Dashboard */}
          <button
            id="nav-tab-dashboard-btn"
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Tab 4: Settings */}
          <button
            id="nav-tab-settings-btn"
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Theme &amp; Media</span>
            <span className="xs:hidden">Theme</span>
          </button>
        </div>

        {/* Right Info: Device indicator & Actions */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          {/* Tablet Desk Toggle */}
          {deviceMode === 'tablet' && (
            <button
              type="button"
              onClick={() => setIsTabletDeskVisible(!isTabletDeskVisible)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-sky-400 font-semibold text-xs"
              title="Toggle Live Monitor Desk"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isTabletDeskVisible ? 'Hide Monitors' : 'Show Monitors'}</span>
            </button>
          )}

          {/* Mobile Live Desk Button */}
          {deviceMode === 'mobile' && (
            <button
              type="button"
              onClick={() => setIsMobileMonitorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold text-xs shadow-sm"
              title="Open Live Monitor Sheet"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Live Desk</span>
            </button>
          )}

          {/* Desktop Keyboard Shortcuts Reminder */}
          {deviceMode === 'desktop' && (
            <span className="hidden xl:inline text-slate-500 text-[11px] font-mono">
              Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">F1</kbd> Blackout ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">F2</kbd> Clear ·{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">PgDn</kbd> Push Live
            </span>
          )}

          {/* Switch Device Mode button */}
          <button
            id="nav-switch-device-btn"
            type="button"
            onClick={onChangeDevice}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white transition-all font-medium text-xs"
            title={`Active: ${deviceMode}. Click to switch hardware experience.`}
          >
            {deviceMode === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-sky-400" />}
            {deviceMode === 'tablet' && <Tablet className="w-3.5 h-3.5 text-indigo-400" />}
            {deviceMode === 'desktop' && <Monitor className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline font-semibold capitalize">{deviceMode}</span>
          </button>

          <button
            id="nav-sign-out-btn"
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 transition-all font-medium text-xs"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Active Tab View */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
          <div className="flex-1 overflow-hidden">
            {activeTab === 'dashboard' && (
              <DashboardTab
                state={state}
                account={account}
                connectionStatus={connectionStatus}
                connectedCount={connectedCount}
                onGoLive={handleGoLive}
                onSetNext={handleSetNext}
                onAdvanceNext={handleAdvanceNext}
                onToggleBlackout={() => updateState({ isBlackout: !state.isBlackout })}
                onToggleClearText={() => updateState({ isClearText: !state.isClearText })}
                onToggleLogo={() => updateState({ isLogo: !state.isLogo })}
                onBroadcastAlert={(text) => updateState({ alertText: text, isAlertVisible: true })}
                onClearAlert={() => updateState({ isAlertVisible: false, alertText: '' })}
                onSelectTab={(tab) => setActiveTab(tab)}
                onUpdateMode={handleUpdateMode}
              />
            )}

            {activeTab === 'lyrics' && (
              <LyricsTab
                account={account}
                state={state}
                onGoLive={handleGoLive}
                onSetNext={handleSetNext}
              />
            )}

            {activeTab === 'bible' && (
              <BibleTab
                state={state}
                onGoLive={handleGoLive}
                onSetNext={handleSetNext}
                onUpdateTheme={handleUpdateTheme}
              />
            )}

            {activeTab === 'settings' && (
              <MediaSettingsTab
                state={state}
                account={account}
                connectionStatus={connectionStatus}
                transportMode={transportMode}
                connectedCount={connectedCount}
                connectedDevices={connectedDevices}
                pingLatency={pingLatency}
                onTestPing={testPing}
                onUpdateTheme={handleUpdateTheme}
                onUpdateMode={handleUpdateMode}
              />
            )}
          </div>
        </div>

        {/* Right Side Live Program Desk: Rendered persistently on Desktop, or when toggled on Tablet */}
        {deviceMode === 'desktop' && (
          <div className="w-full lg:w-[400px] xl:w-[460px] bg-slate-950 flex flex-col p-4 space-y-4 shrink-0 overflow-y-auto border-t lg:border-t-0 border-slate-800">
            <LiveMonitorDesk
              state={state}
              account={account}
              deviceMode={deviceMode}
              onAdvanceNext={handleAdvanceNext}
              onUpdateMode={handleUpdateMode}
            />
          </div>
        )}

        {deviceMode === 'tablet' && isTabletDeskVisible && (
          <div className="w-full md:w-[360px] lg:w-[400px] bg-slate-950 flex flex-col p-3 space-y-3 shrink-0 overflow-y-auto border-t md:border-t-0 border-slate-800">
            <LiveMonitorDesk
              state={state}
              account={account}
              deviceMode={deviceMode}
              onAdvanceNext={handleAdvanceNext}
              onUpdateMode={handleUpdateMode}
            />
          </div>
        )}
      </div>

      {/* Mobile Floating Sticky Live Monitor Bar (Full screen width for touch operators) */}
      {deviceMode === 'mobile' && (
        <div className="bg-slate-900/95 border-t border-slate-800 px-3 py-2 flex items-center justify-between z-30 shadow-2xl backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileMonitorOpen(true)}
            className="flex-1 flex items-center gap-2 text-left mr-2 min-w-0"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {state.currentSlide?.reference || state.currentSlide?.title || 'Blank / Ready'}
              </span>
              <span className="text-[10px] text-sky-400 font-medium flex items-center gap-1">
                <Tv className="w-2.5 h-2.5" /> Tap for Live Screens &amp; Quick Controls
              </span>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => updateState({ isBlackout: !state.isBlackout })}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                state.isBlackout
                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                  : 'bg-slate-800 text-rose-300'
              }`}
            >
              Black
            </button>
            <button
              type="button"
              onClick={() => updateState({ isClearText: !state.isClearText })}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                state.isClearText
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                  : 'bg-slate-800 text-amber-300'
              }`}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsMobileMonitorOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center gap-1 shadow"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Screens</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Live Program Modal Sheet */}
      {deviceMode === 'mobile' && isMobileMonitorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-2 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <LiveMonitorDesk
              state={state}
              account={account}
              deviceMode={deviceMode}
              onAdvanceNext={handleAdvanceNext}
              onUpdateMode={handleUpdateMode}
              onCloseMobileSheet={() => setIsMobileMonitorOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Global Application Footer with App Version, Designer Attribution, Live Users & Total New Users */}
      <AppFooter deviceMode={deviceMode} churchName={account} accountId={account} />
    </div>
  );
}

