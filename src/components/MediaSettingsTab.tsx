import React, { useState } from 'react';
import {
  ThemeSettings,
  FontChoice,
  BackgroundType,
  LowerThirdStyle,
  WorshipState,
} from '../types';
import { FONT_OPTIONS, GRADIENT_PRESETS } from '../data/defaultSettings';
import { SlideDisplay } from './SlideDisplay';
import { TransportMode, ConnectedDevice } from '../services/liveSyncRelay';
import {
  Type,
  Palette,
  Layout,
  Tv,
  Maximize2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sun,
  Eye,
  Sparkles,
  Radio,
  Wifi,
  WifiOff,
  Cloud,
  Globe,
  Zap,
  RefreshCw,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface MediaSettingsTabProps {
  state: WorshipState;
  account?: string;
  connectionStatus?: 'connected' | 'connecting' | 'disconnected';
  transportMode?: TransportMode;
  connectedCount?: number;
  connectedDevices?: ConnectedDevice[];
  pingLatency?: number | null;
  onTestPing?: () => void;
  onUpdateTheme: (updates: Partial<ThemeSettings>) => void;
  onUpdateMode: (mode: 'fullscreen' | 'lowerthird') => void;
}

export const MediaSettingsTab: React.FC<MediaSettingsTabProps> = ({
  state,
  account = 'worship-main',
  connectionStatus = 'connected',
  transportMode = 'cloud_relay',
  connectedCount = 1,
  connectedDevices = [],
  pingLatency,
  onTestPing,
  onUpdateTheme,
  onUpdateMode,
}) => {
  const { theme, displayMode } = state;
  const [isPinging, setIsPinging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handlePing = () => {
    setIsPinging(true);
    if (onTestPing) onTestPing();
    setTimeout(() => setIsPinging(false), 1200);
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const projectorUrl = `${origin}/?view=fullscreen&account=${encodeURIComponent(account)}`;
  const lowerThirdUrl = `${origin}/?view=lowerthird&account=${encodeURIComponent(account)}`;

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(key);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 sm:p-6 overflow-y-auto space-y-6">
      {/* Top Banner: Output Mode Switcher & Overview */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700/60 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
            <Layout className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Media, Typography &amp; Display Studio</h2>
            <p className="text-xs text-slate-400">
              Customize fonts, sizes, backgrounds, and lower third styles in real time
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-700">
          <button
            id="settings-mode-fullscreen-btn"
            type="button"
            onClick={() => onUpdateMode('fullscreen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              displayMode === 'fullscreen'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Maximize2 className="w-4 h-4" /> Full Screen Mode
          </button>
          <button
            id="settings-mode-lowerthird-btn"
            type="button"
            onClick={() => onUpdateMode('lowerthird')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              displayMode === 'lowerthird'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" /> Lower Third (Broadcast/OBS)
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left (7 cols) + Live Preview Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. TYPOGRAPHY & FONT SETTINGS */}
          <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 shadow-md space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-700/80 pb-3">
              <Type className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-base text-white">Typography &amp; Fonts</h3>
            </div>

            {/* Font Family Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Font Family (Worship &amp; Scripture)
                </label>
                <span className="text-[11px] text-amber-400 font-medium">
                  Telugu Default: Ramabhadra
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => onUpdateTheme({ fontFamily: f.name as FontChoice })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      theme.fontFamily === f.name
                        ? 'bg-sky-950/80 border-sky-500 ring-2 ring-sky-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold truncate">{f.name}</div>
                      {f.name === 'Ramabhadra' && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          తెలుగు
                        </span>
                      )}
                    </div>
                    <div
                      className="text-xs mt-1 text-slate-400 truncate"
                      style={{ fontFamily: `"${f.name}", sans-serif` }}
                    >
                      {f.name === 'Ramabhadra' ? 'పరిశుద్ధుడు' : 'Aa Bb Gg'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Font Size ({theme.fontSize}px)
                  </label>
                  <div className="flex gap-1">
                    {[44, 68, 96, 120].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => onUpdateTheme({ fontSize: size })}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          theme.fontSize === size
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="settings-font-size-slider"
                  type="range"
                  min="22"
                  max="160"
                  step="2"
                  value={theme.fontSize}
                  onChange={(e) => onUpdateTheme({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Font Weight
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['normal', 'semibold', 'bold', 'black'] as const).map((weight) => (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => onUpdateTheme({ fontWeight: weight })}
                      className={`py-1.5 text-xs font-bold rounded-lg border uppercase ${
                        theme.fontWeight === weight
                          ? 'bg-sky-500 border-sky-400 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Alignment, Uppercase, Shadow & Outline */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-700/60">
              {/* Text Alignment */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => onUpdateTheme({ textAlign: 'left' })}
                  className={`p-1.5 rounded ${
                    theme.textAlign === 'left' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateTheme({ textAlign: 'center' })}
                  className={`p-1.5 rounded ${
                    theme.textAlign === 'center' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateTheme({ textAlign: 'right' })}
                  className={`p-1.5 rounded ${
                    theme.textAlign === 'right' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>

              {/* Uppercase Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={theme.textTransform === 'uppercase'}
                  onChange={(e) =>
                    onUpdateTheme({ textTransform: e.target.checked ? 'uppercase' : 'none' })
                  }
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-950 border-slate-700"
                />
                ALL CAPS
              </label>

              {/* Italic Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={theme.fontItalic}
                  onChange={(e) => onUpdateTheme({ fontItalic: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-950 border-slate-700"
                />
                Italic
              </label>

              {/* Drop Shadow Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={theme.textShadow}
                  onChange={(e) => onUpdateTheme({ textShadow: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-950 border-slate-700"
                />
                Legibility Shadow
              </label>

              {/* Outline / Stroke */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
                <input
                  type="checkbox"
                  checked={theme.textOutline}
                  onChange={(e) => onUpdateTheme({ textOutline: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-950 border-slate-700"
                />
                Dark Outline
              </label>
            </div>
          </div>

          {/* 2. BACKGROUND & ATMOSPHERE */}
          <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 shadow-md space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-700/80 pb-3">
              <Palette className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-base text-white">Backgrounds &amp; Motion Atmosphere</h3>
            </div>

            {/* Motion Loops & Styles */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Atmosphere Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'motion_waves', label: 'Worship Waves', icon: Sparkles },
                  { id: 'motion_particles', label: 'Ember Particles', icon: Sun },
                  { id: 'motion_stars', label: 'Celestial Stars', icon: Sparkles },
                  { id: 'gradient', label: 'Color Gradient', icon: Palette },
                  { id: 'solid', label: 'Solid Color', icon: Layout },
                  { id: 'transparent', label: 'Transparent (OBS)', icon: Tv },
                ].map((bg) => {
                  const Icon = bg.icon;
                  const isSelected = theme.backgroundType === bg.id;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => onUpdateTheme({ backgroundType: bg.id as BackgroundType })}
                      className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-sky-950 border-sky-500 ring-2 ring-sky-500/40 text-white'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-semibold">{bg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presets Grid */}
            {theme.backgroundType !== 'transparent' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Atmosphere Palette Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        onUpdateTheme({
                          gradientFrom: p.from,
                          gradientTo: p.to,
                          gradientAngle: p.angle,
                          backgroundColor: p.from,
                        })
                      }
                      className="p-2 rounded-lg border border-slate-700 hover:border-slate-500 text-left flex items-center gap-2 group transition-all"
                    >
                      <div
                        className="w-5 h-5 rounded-full shrink-0 border border-white/20 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                        }}
                      />
                      <span className="text-xs font-medium text-slate-300 group-hover:text-white truncate">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. LOWER THIRD STUDIO */}
          <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 shadow-md space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-700/80 pb-3">
              <Tv className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-base text-white">Lower Third Broadcast Settings</h3>
            </div>

            {/* Lower third container style */}
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Container Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'pill', label: 'Modern Rounded Pill' },
                  { id: 'full_banner', label: 'Broadcast Banner' },
                  { id: 'floating_box', label: 'Floating Card' },
                  { id: 'cinematic_bar', label: 'Cinematic Dual Bar' },
                  { id: 'subtle_glass', label: 'Subtle Frosted' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onUpdateTheme({ lowerThirdStyle: s.id as LowerThirdStyle })}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                      theme.lowerThirdStyle === s.id
                        ? 'bg-sky-950 border-sky-500 ring-2 ring-sky-500/40 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position and Opacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Placement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateTheme({ lowerThirdPosition: 'bottom' })}
                    className={`py-2 text-xs font-bold rounded-lg border ${
                      theme.lowerThirdPosition === 'bottom'
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Bottom of Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateTheme({ lowerThirdPosition: 'top' })}
                    className={`py-2 text-xs font-bold rounded-lg border ${
                      theme.lowerThirdPosition === 'top'
                        ? 'bg-sky-500 border-sky-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Top Banner
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Backdrop Opacity ({theme.lowerThirdOpacity}%)
                </label>
                <input
                  id="settings-lower-third-opacity"
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={theme.lowerThirdOpacity}
                  onChange={(e) => onUpdateTheme({ lowerThirdOpacity: parseInt(e.target.value) })}
                  className="w-full accent-sky-500 cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

          {/* 4. Live Cloud Sync & Universal Deployment Card */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700/60 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Live Sync Channel &amp; Vercel Deployment</h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time multi-screen synchronization for church account: <span className="text-sky-300 font-mono font-bold">{account}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                {connectionStatus === 'connected' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Live</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                    <WifiOff className="w-3 h-3" />
                    <span>Connecting</span>
                  </span>
                )}
              </div>
            </div>

            {/* Sync Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  <span>Relay Engine</span>
                </div>
                <div className="font-semibold text-white truncate">
                  {transportMode === 'firebase_firestore'
                    ? 'Firebase Firestore'
                    : transportMode === 'websocket'
                    ? 'Local WebSocket'
                    : 'Cloud PubSub Relay'}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">
                  {transportMode === 'firebase_firestore' ? 'Persistent Cloud Sync' : 'Vercel & Web Ready'}
                </div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Active Screens</span>
                </div>
                <div className="font-semibold text-white">
                  {connectedCount} Device{connectedCount !== 1 ? 's' : ''} Online
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sanctuary &amp; OBS</div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 text-[11px] flex items-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Round-Trip Latency</span>
                </div>
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>{pingLatency ? `${pingLatency} ms` : '< 120 ms'}</span>
                  <button
                    type="button"
                    onClick={handlePing}
                    disabled={isPinging}
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>Test</span>
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Sub-second push</div>
              </div>
            </div>

            {/* Quick Screen URLs for Vercel deployment */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Direct URLs for Sanctuary Display &amp; OBS on Vercel:
              </span>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-700/60 text-xs">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <Maximize2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="text-white font-medium">Sanctuary Fullscreen URL</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(projectorUrl, 'fullscreen')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                    >
                      {copiedUrl === 'fullscreen' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl === 'fullscreen' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={projectorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-700/60 text-xs">
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <Tv className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-white font-medium">OBS Lower-Third URL</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(lowerThirdUrl, 'lowerthird')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1"
                    >
                      {copiedUrl === 'lowerthird' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl === 'lowerthird' ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={lowerThirdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200 flex items-start gap-2">
              <Globe className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>Universal Sync Active:</strong> VerseView Pro uses high-speed cloud pubsub relay so you can deploy on Vercel without configuring a separate WebSocket server. All church accounts automatically get isolated real-time channels that sync across mobile phones, tablets, projector PCs, and OBS.
              </span>
            </div>
          </div>
        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base text-white">Live Monitor Preview</h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                16:9 PROJECTION
              </span>
            </div>

            {/* 16:9 Aspect Ratio Display Preview Box */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl relative bg-black">
              <SlideDisplay state={state} />
            </div>

            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">Active Mode:</span>
                <span className="font-bold text-sky-400 uppercase">{displayMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">Font Family:</span>
                <span className="font-bold text-white">{theme.fontFamily}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">Telugu Script Font:</span>
                <span className="font-bold text-amber-400 font-mono">Ramabhadra (Default)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">Atmosphere:</span>
                <span className="font-bold text-white capitalize">{theme.backgroundType.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-400">Dual-Language:</span>
                <span className={`font-bold ${theme.showSecondary ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {theme.showSecondary ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
