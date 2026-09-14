import React, { useState } from 'react';
import { DeviceMode, DeviceConfig } from '../types';
import { DEVICE_CONFIGS, detectSuggestedDevice, applyDeviceConfiguration, setStoredDeviceMode } from '../data/deviceConfig';
import {
  Smartphone,
  Tablet,
  Monitor,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Sliders,
  Tv,
  CheckCircle2,
  Layers,
  Zap,
} from 'lucide-react';
import { AppFooter } from './AppFooter';

interface DeviceSelectionPageProps {
  onDeviceSelected: (mode: DeviceMode) => void;
  initialMode?: DeviceMode | null;
}

export const DeviceSelectionPage: React.FC<DeviceSelectionPageProps> = ({
  onDeviceSelected,
  initialMode,
}) => {
  const suggestedMode = detectSuggestedDevice();
  const [selectedMode, setSelectedMode] = useState<DeviceMode>(initialMode || suggestedMode);
  const [rememberPreference, setRememberPreference] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const handleSelectAndProceed = (mode: DeviceMode) => {
    setSelectedMode(mode);
    setIsConfiguring(true);

    // Apply configuration immediately
    if (rememberPreference) {
      setStoredDeviceMode(mode);
    } else {
      applyDeviceConfiguration(mode);
    }

    // Brief smooth transition to show configuration being applied
    setTimeout(() => {
      onDeviceSelected(mode);
    }, 450);
  };

  const activeConfig: DeviceConfig = DEVICE_CONFIGS[selectedMode];

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto selection:bg-sky-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-sky-600/15 via-purple-600/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 right-10 w-[500px] h-[400px] bg-gradient-to-t from-emerald-600/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
              WORSHIP PRESENTER PRO
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-400">
                Cross-Device
              </span>
            </span>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Sanctuary Projector · OBS Live Stream Lower Thirds · Stage Confidence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Setup Step 1 of 2:</span> Device Profile
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto w-full my-auto py-8 sm:py-12 space-y-8">
        {/* Title Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold shadow-inner">
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Select Your Hardware Layout</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            How are you running Worship Presenter today?
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Select <strong className="text-sky-300 font-semibold">Mobile</strong>,{' '}
            <strong className="text-indigo-300 font-semibold">Tablet</strong>, or{' '}
            <strong className="text-emerald-300 font-semibold">Desktop</strong>. We will configure the
            optimal layout, touch controls, and screen feeds, then guide you to sign in.
          </p>
        </div>

        {/* 3 Interactive Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* 1. MOBILE */}
          <div
            id="device-card-mobile"
            onClick={() => setSelectedMode('mobile')}
            className={`group relative rounded-2xl p-5 sm:p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
              selectedMode === 'mobile'
                ? 'bg-slate-900/90 border-sky-500 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/50 scale-[1.02]'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            {suggestedMode === 'mobile' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                Detected Device
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedMode === 'mobile'
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    selectedMode === 'mobile'
                      ? 'border-sky-400 bg-sky-500 text-white'
                      : 'border-slate-700 bg-slate-950 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-sky-300 transition-colors">
                  Mobile Phone
                </h3>
                <p className="text-xs text-sky-400 font-medium mt-0.5">
                  Pocket Remote &amp; Touch Controller
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Streamlined 1-column mobile interface with 48px+ touch targets, floating live monitor,
                  and thumb-friendly slide switching.
                </p>
              </div>

              {/* Specs pill list */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Single-Column Touch Deck</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Floating Live Screen Sheet</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>iPhone &amp; Android Friendly</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAndProceed('mobile');
              }}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedMode === 'mobile'
                  ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{selectedMode === 'mobile' ? 'Apply & Sign In' : 'Select Mobile'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. TABLET */}
          <div
            id="device-card-tablet"
            onClick={() => setSelectedMode('tablet')}
            className={`group relative rounded-2xl p-5 sm:p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
              selectedMode === 'tablet'
                ? 'bg-slate-900/90 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/50 scale-[1.02]'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            {suggestedMode === 'tablet' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                Detected Device
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedMode === 'tablet'
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Tablet className="w-6 h-6" />
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    selectedMode === 'tablet'
                      ? 'border-indigo-400 bg-indigo-500 text-white'
                      : 'border-slate-700 bg-slate-950 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                  Tablet / iPad
                </h3>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">
                  Stage &amp; Sound Booth Controller
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Responsive 2-pane split view tailored for comfortable hands-on touch, stylus support,
                  and quick song/scripture transitions.
                </p>
              </div>

              {/* Specs pill list */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Dual-Pane Split Workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Comfortable Touch &amp; Pen Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>iPad, Surface, &amp; Galaxy Tab</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAndProceed('tablet');
              }}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedMode === 'tablet'
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{selectedMode === 'tablet' ? 'Apply & Sign In' : 'Select Tablet'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. DESKTOP */}
          <div
            id="device-card-desktop"
            onClick={() => setSelectedMode('desktop')}
            className={`group relative rounded-2xl p-5 sm:p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
              selectedMode === 'desktop'
                ? 'bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/50 scale-[1.02]'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
            }`}
          >
            {suggestedMode === 'desktop' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                Detected Device
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                    selectedMode === 'desktop'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Monitor className="w-6 h-6" />
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    selectedMode === 'desktop'
                      ? 'border-emerald-400 bg-emerald-500 text-white'
                      : 'border-slate-700 bg-slate-950 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                  Desktop / PC
                </h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  Full Pro Multi-Screen Broadcasting Suite
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  3-column multi-screen studio desk with persistent dual monitors (Sanctuary Projector +
                  OBS Lower Third), keyboard shortcuts, and full live desk.
                </p>
              </div>

              {/* Specs pill list */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>3-Column Studio Desk &amp; Dual Screens</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>F1 / F2 / F3 / PgDn Shortcuts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Multi-Monitor Sanctuary &amp; OBS Rigs</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAndProceed('desktop');
              }}
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedMode === 'desktop'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{selectedMode === 'desktop' ? 'Apply & Sign In' : 'Select Desktop'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Configuration Summary & Action Bar */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                Active Configuration:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5">
                {selectedMode === 'mobile' && <Smartphone className="w-3 h-3 text-sky-400" />}
                {selectedMode === 'tablet' && <Tablet className="w-3 h-3 text-indigo-400" />}
                {selectedMode === 'desktop' && <Monitor className="w-3 h-3 text-emerald-400" />}
                {activeConfig.name}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {activeConfig.subtitle} · {activeConfig.features[0]}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberPreference}
                onChange={(e) => setRememberPreference(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-950"
              />
              <span>Remember preference</span>
            </label>

            <button
              id="confirm-device-selection-btn"
              type="button"
              disabled={isConfiguring}
              onClick={() => handleSelectAndProceed(selectedMode)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-60"
            >
              {isConfiguring ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Configuring {activeConfig.name}...</span>
                </>
              ) : (
                <>
                  <span>Configure &amp; Continue to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center py-2 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Cross-Device Cloud Sync Enabled</span>
        </div>
        <div>
          You can switch device mode anytime inside the operator console or sign in screen.
        </div>
      </footer>

      {/* Global App Footer */}
      <AppFooter deviceMode={selectedMode} className="relative z-10 -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 mt-4" />
    </div>
  );
};
