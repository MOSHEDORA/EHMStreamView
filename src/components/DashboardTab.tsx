import React, { useState } from 'react';
import { WorshipState, SlideContent } from '../types';
import {
  LayoutDashboard,
  Music,
  BookOpen,
  Settings,
  Play,
  Eye,
  SkipForward,
  Radio,
  Tv,
  Monitor,
  Maximize2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Volume2,
  Clock,
  Church,
  Shield,
  Layers,
} from 'lucide-react';

interface DashboardTabProps {
  state: WorshipState;
  account: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  connectedCount: number;
  onGoLive: (slide: SlideContent, mode?: 'fullscreen' | 'lowerthird') => void;
  onSetNext: (slide: SlideContent) => void;
  onAdvanceNext: () => void;
  onToggleBlackout: () => void;
  onToggleClearText: () => void;
  onToggleLogo: () => void;
  onBroadcastAlert: (text: string) => void;
  onClearAlert: () => void;
  onSelectTab: (tab: 'dashboard' | 'lyrics' | 'bible' | 'settings') => void;
  onUpdateMode: (mode: 'fullscreen' | 'lowerthird') => void;
}

const QUICK_SERMON_VERSES = [
  {
    ref: 'John 3:16',
    title: 'The Love of God',
    text: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
  },
  {
    ref: 'Psalm 23:1-3',
    title: 'The Lord is My Shepherd',
    text: 'The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters. He restores my soul.',
  },
  {
    ref: 'Romans 8:28',
    title: 'All Things for Good',
    text: 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
  },
  {
    ref: 'Philippians 4:13',
    title: 'Strength in Christ',
    text: 'I can do all things through Christ who strengthens me.',
  },
  {
    ref: 'Isaiah 40:31',
    title: 'Renewed Strength',
    text: 'Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint.',
  },
];

const QUICK_WORSHIP_CHORUSES = [
  {
    title: 'Way Maker',
    subtitle: 'Chorus',
    text: 'Way Maker, Miracle Worker, Promise Keeper,\nLight in the darkness, my God, that is who You are!',
  },
  {
    title: 'Goodness of God',
    subtitle: 'Chorus',
    text: "'Cause all my life You have been faithful,\nAnd all my life You have been so, so good!\nWith every breath that I am able,\nOh, I will sing of the goodness of God!",
  },
  {
    title: '10,000 Reasons',
    subtitle: 'Chorus',
    text: 'Bless the Lord, O my soul, O my soul,\nWorship His holy name.\nSing like never before, O my soul,\nI’ll worship Your holy name.',
  },
  {
    title: 'Great Are You Lord',
    subtitle: 'Chorus',
    text: "It's Your breath in our lungs,\nSo we pour out our praise, we pour out our praise.\nIt's Your breath in our lungs,\nSo we pour out our praise to You only!",
  },
];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  state,
  account,
  connectionStatus,
  connectedCount,
  onGoLive,
  onSetNext,
  onAdvanceNext,
  onToggleBlackout,
  onToggleClearText,
  onToggleLogo,
  onBroadcastAlert,
  onClearAlert,
  onSelectTab,
  onUpdateMode,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [quickAlertText, setQuickAlertText] = useState('Nursery Alert: Child #142');

  const origin = window.location.origin;
  const displayUrl = `${origin}/?view=fullscreen&account=${encodeURIComponent(account)}`;
  const obsUrl = `${origin}/?view=lowerthird&account=${encodeURIComponent(account)}`;
  const stageUrl = `${origin}/?view=stage&account=${encodeURIComponent(account)}`;

  const handleOpenBothScreens = () => {
    window.open(displayUrl, '_blank');
    window.open(obsUrl, '_blank');
  };

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleWelcomeSlide = () => {
    const welcomeSlide: SlideContent = {
      id: `welcome-${Date.now()}`,
      type: 'media',
      title: 'Welcome to Worship',
      subtitle: 'Grace Community Church',
      primaryText: 'Glad you are with us today!\n"Enter His gates with thanksgiving and His courts with praise."',
    };
    onGoLive(welcomeSlide, 'fullscreen');
  };

  const handleOfferingSlide = () => {
    const offeringSlide: SlideContent = {
      id: `offering-${Date.now()}`,
      type: 'media',
      title: 'Tithes & Offerings',
      subtitle: 'Worship Through Giving',
      primaryText: '“God loves a cheerful giver.” — 2 Corinthians 9:7\nGive online or via our church mobile app.',
    };
    onGoLive(offeringSlide, 'fullscreen');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 sm:p-6 overflow-y-auto space-y-6">
      {/* Top Header: Command Center Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-white tracking-wide">
                Worship Service Command Center
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Broadcast
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Centralized dashboard for Sunday service orchestration, projection displays, and streaming controls
            </p>
          </div>
        </div>

        {/* Sync Room Status Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Sync Room</div>
              <div className="font-mono text-xs font-bold text-sky-300">{account}</div>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Connected Displays</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{connectedCount} Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section 1: Service Status + Master Override Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card A: Active Program Slide */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">
                  Currently On Screen
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300">
                {state.displayMode === 'fullscreen' ? 'Full Screen' : 'Lower Third'}
              </span>
            </div>

            <div className="font-bold text-sm text-white truncate">
              {state.currentSlide?.reference || state.currentSlide?.title || 'No Slide Projected'}
            </div>
            {state.currentSlide?.subtitle && (
              <div className="text-xs text-sky-400 font-medium">
                {state.currentSlide.subtitle}
              </div>
            )}
            <p className="text-xs text-slate-300 mt-2 line-clamp-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-serif italic">
              {state.currentSlide?.primaryText || 'Screen is currently blank or idle.'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/60">
            <button
              id="dashboard-blackout-btn"
              type="button"
              onClick={onToggleBlackout}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                state.isBlackout
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-900 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Blackout (F1)
            </button>
            <button
              id="dashboard-clear-btn"
              type="button"
              onClick={onToggleClearText}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                state.isClearText
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-900 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Clear Text (F2)
            </button>
            <button
              id="dashboard-logo-btn"
              type="button"
              onClick={onToggleLogo}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                state.isLogo
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'bg-slate-900 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Logo (F3)
            </button>
          </div>
        </div>

        {/* Card B: Queued Next Slide */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  Next Queued Slide
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Ctrl + Right / PageDown</span>
            </div>

            <div className="font-bold text-sm text-white truncate">
              {state.nextSlide?.reference || state.nextSlide?.title || 'No Next Slide Queued'}
            </div>
            {state.nextSlide?.subtitle && (
              <div className="text-xs text-amber-400 font-medium">
                {state.nextSlide.subtitle}
              </div>
            )}
            <p className="text-xs text-slate-300 mt-2 line-clamp-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-serif italic">
              {state.nextSlide?.primaryText || 'Select any verse or song stanza to queue up next.'}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/60">
            <button
              id="dashboard-advance-btn"
              type="button"
              onClick={onAdvanceNext}
              disabled={!state.nextSlide}
              className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <SkipForward className="w-4 h-4" />
              <span>Advance to Live Program</span>
            </button>
          </div>
        </div>

        {/* Card C: Projection Mode & Quick Alert */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">
                Output Format &amp; Alert
              </span>
              <span className="text-[10px] text-slate-400">Target Display</span>
            </div>

            {/* Mode selector */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => onUpdateMode('fullscreen')}
                className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  state.displayMode === 'fullscreen'
                    ? 'bg-sky-600 border-sky-400 text-white shadow'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" /> Full Screen
              </button>
              <button
                type="button"
                onClick={() => onUpdateMode('lowerthird')}
                className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  state.displayMode === 'lowerthird'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" /> Lower Third
              </button>
            </div>

            {/* Quick alert bar */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Parent / Nursery Emergency Alert
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={quickAlertText}
                  onChange={(e) => setQuickAlertText(e.target.value)}
                  placeholder="e.g. Nursery Alert: Child #402"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {state.isAlertVisible ? (
                  <button
                    type="button"
                    onClick={onClearAlert}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onBroadcastAlert(quickAlertText)}
                    className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Alert
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-700/60 flex items-center justify-between">
            <span>Alert Status:</span>
            <span className={state.isAlertVisible ? 'text-amber-400 font-bold' : 'text-slate-500'}>
              {state.isAlertVisible ? 'Broadcasting on screen' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Section 2: Display Output Links (OBS, Projector, Stage) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-700/60 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-400" />
            <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Connected Display Endpoints &amp; Browser Sources
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenBothScreens}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold shadow transition-all"
              title="Launch both Fullscreen Projector and OBS Lower Third in two separate windows at the same time"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Both Screens Simultaneously</span>
            </button>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Independent URLs sync seamlessly in real time
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Main Sanctuary Projector */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Maximize2 className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Main Sanctuary Display</div>
                <div className="text-[10px] text-slate-400">Full Screen Projector (16:9)</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopy(displayUrl, 'Projector')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs"
                title="Copy URL"
              >
                {copiedLink === 'Projector' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs"
                title="Launch Projector Screen"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* OBS Livestream Overlay */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Tv className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">OBS Livestream Overlay</div>
                <div className="text-[10px] text-slate-400">Alpha Transparent Lower Third</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopy(obsUrl, 'OBS')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs"
                title="Copy Browser Source URL"
              >
                {copiedLink === 'OBS' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={obsUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                title="Launch OBS Overlay"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Stage Confidence Monitor */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-white">Stage Confidence Monitor</div>
                <div className="text-[10px] text-slate-400">Worship Band &amp; Pastor View</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopy(stageUrl, 'Stage')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs"
                title="Copy Stage URL"
              >
                {copiedLink === 'Stage' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={stageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs"
                title="Launch Stage Monitor"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section 3: Quick Worship & Scripture Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Scripture Deck */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Quick Sermon Scripture Launchers
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('bible')}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <span>Full Bible (66 Books)</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-2">
            {QUICK_SERMON_VERSES.map((v) => (
              <div
                key={v.ref}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-sky-300">{v.ref}</span>
                    <span className="text-[10px] text-slate-400">· {v.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{v.text}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const slide: SlideContent = {
                        id: `scripture-${v.ref}`,
                        type: 'bible',
                        title: v.ref,
                        subtitle: v.title,
                        primaryText: v.text,
                        reference: v.ref,
                      };
                      onSetNext(slide);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-semibold"
                    title="Queue Next"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const slide: SlideContent = {
                        id: `scripture-${v.ref}`,
                        type: 'bible',
                        title: v.ref,
                        subtitle: v.title,
                        primaryText: v.text,
                        reference: v.ref,
                      };
                      onGoLive(slide);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs flex items-center gap-1 font-bold shadow transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Go Live</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Worship Chorus Deck */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Quick Worship Anthems &amp; Impromptu Choruses
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('lyrics')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Song Library</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-2">
            {QUICK_WORSHIP_CHORUSES.map((c) => (
              <div
                key={c.title}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-emerald-300">{c.title}</span>
                    <span className="text-[10px] text-slate-400">· {c.subtitle}</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate mt-0.5">{c.text.replace('\n', ' ')}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const slide: SlideContent = {
                        id: `chorus-${c.title}`,
                        type: 'lyrics',
                        title: c.title,
                        subtitle: c.subtitle,
                        primaryText: c.text,
                      };
                      onSetNext(slide);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-semibold"
                    title="Queue Next"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const slide: SlideContent = {
                        id: `chorus-${c.title}`,
                        type: 'lyrics',
                        title: c.title,
                        subtitle: c.subtitle,
                        primaryText: c.text,
                      };
                      onGoLive(slide);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center gap-1 font-bold shadow transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Go Live</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Section 4: Quick Service Announcements & Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Welcome Slide Trigger */}
        <button
          type="button"
          onClick={handleWelcomeSlide}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 p-4 rounded-xl text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Church className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-white">Project Welcome Slide</div>
          <div className="text-[10px] text-slate-400 mt-1">
            "Welcome to Worship" announcement
          </div>
        </button>

        {/* Offering Slide Trigger */}
        <button
          type="button"
          onClick={handleOfferingSlide}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 p-4 rounded-xl text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-white">Project Offering Slide</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Tithes &amp; Giving scripture
          </div>
        </button>

        {/* Jump to Lyrics Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('lyrics')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 p-4 rounded-xl text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Music className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-white">Worship Lyrics Studio</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Setlist, stanzas &amp; spontaneous lyrics
          </div>
        </button>

        {/* Jump to Settings Tab */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-500/50 p-4 rounded-xl text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Settings className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-white">Display &amp; Font Settings</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Typography, backgrounds &amp; overlays
          </div>
        </button>
      </div>
    </div>
  );
};
