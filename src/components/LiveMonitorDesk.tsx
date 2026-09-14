import React, { useState } from 'react';
import { WorshipState, DeviceMode } from '../types';
import { SlideDisplay } from './SlideDisplay';
import {
  Maximize2,
  Tv,
  ExternalLink,
  Sparkles,
  Check,
  Eye,
  SkipForward,
  X,
  Radio,
} from 'lucide-react';

interface LiveMonitorDeskProps {
  state: WorshipState;
  account: string;
  deviceMode: DeviceMode;
  onAdvanceNext: () => void;
  onUpdateMode: (mode: 'fullscreen' | 'lowerthird') => void;
  onCloseMobileSheet?: () => void;
}

export const LiveMonitorDesk: React.FC<LiveMonitorDeskProps> = ({
  state,
  account,
  deviceMode,
  onAdvanceNext,
  onUpdateMode,
  onCloseMobileSheet,
}) => {
  const [monitorMode, setMonitorMode] = useState<'both' | 'fullscreen' | 'lowerthird'>('both');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const lowerThirdUrl = `${origin}/?view=lowerthird&account=${encodeURIComponent(account)}`;
  const projectorUrl = `${origin}/?view=fullscreen&account=${encodeURIComponent(account)}`;

  const handleCopyUrl = (url: string, key: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleOpenBoth = () => {
    if (typeof window !== 'undefined') {
      window.open(projectorUrl, '_blank');
      window.open(lowerThirdUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col space-y-4 text-slate-100">
      {/* Mobile sheet close header */}
      {onCloseMobileSheet && (
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <h3 className="font-extrabold text-sm text-white">Live Monitor &amp; Actions</h3>
          </div>
          <button
            type="button"
            onClick={onCloseMobileSheet}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Live Program Output Box */}
      <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="font-extrabold text-xs tracking-wider uppercase text-rose-400">
              LIVE PROGRAM MONITORS
            </h3>
          </div>

          {/* Monitor Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              type="button"
              onClick={() => setMonitorMode('both')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                monitorMode === 'both'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show Both Screens Simultaneously"
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setMonitorMode('fullscreen')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                monitorMode === 'fullscreen'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show Fullscreen Projector Only"
            >
              Full
            </button>
            <button
              type="button"
              onClick={() => setMonitorMode('lowerthird')}
              className={`px-2 py-0.5 rounded font-bold transition-all ${
                monitorMode === 'lowerthird'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Show OBS Lower Third Only"
            >
              Lower 3rd
            </button>
          </div>
        </div>

        {/* Display Previews */}
        {monitorMode === 'both' ? (
          <div className="space-y-2">
            {/* 1. Sanctuary Projector (Fullscreen) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-sky-300">
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-sky-400" />
                  Sanctuary Projector (Full Screen URL)
                </span>
                <a
                  href={projectorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-0.5 font-mono"
                >
                  <span>Open</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-sky-500/30 bg-black relative shadow-inner">
                <SlideDisplay state={state} overrideMode="fullscreen" forceTransparent={false} />
              </div>
            </div>

            {/* 2. OBS Livestream (Lower Third) */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] px-1 font-semibold text-emerald-300">
                <span className="flex items-center gap-1">
                  <Tv className="w-3 h-3 text-emerald-400" />
                  OBS Live Stream (Lower Third URL)
                </span>
                <a
                  href={lowerThirdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 font-mono"
                >
                  <span>Open</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950 relative shadow-inner">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <SlideDisplay state={state} overrideMode="lowerthird" forceTransparent={true} />
              </div>
            </div>
          </div>
        ) : monitorMode === 'fullscreen' ? (
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-sky-500/40 bg-black relative shadow-inner">
            <SlideDisplay state={state} overrideMode="fullscreen" forceTransparent={false} />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 relative shadow-inner">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <SlideDisplay state={state} overrideMode="lowerthird" forceTransparent={true} />
          </div>
        )}

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs px-1 text-slate-400">
          <div className="truncate max-w-[240px]">
            <span className="font-semibold text-slate-200">
              {state.currentSlide?.reference || state.currentSlide?.title || 'Blank'}
            </span>
            {state.currentSlide?.subtitle && (
              <span className="text-slate-500 ml-1.5">({state.currentSlide.subtitle})</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {state.isBlackout && (
              <span className="bg-rose-900/80 text-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                BLACK
              </span>
            )}
            {state.isClearText && (
              <span className="bg-amber-900/80 text-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                CLEARED
              </span>
            )}
          </div>
        </div>

        {/* 1-Click Multi-Screen Launcher & Copy URLs */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
          <button
            id="sidebar-launch-both-screens-btn"
            type="button"
            onClick={handleOpenBoth}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold transition-all shadow-md"
            title="Open both Fullscreen Projector and OBS Lower Third in separate popup windows"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Both Screens in Separate Windows</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="sidebar-copy-lowerthird-btn"
              type="button"
              onClick={() => handleCopyUrl(lowerThirdUrl, 'lowerthird')}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-semibold transition-colors"
              title="Copy Dedicated Lower Third URL for OBS Browser Source"
            >
              {copiedKey === 'lowerthird' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied OBS!</span>
                </>
              ) : (
                <>
                  <Tv className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copy OBS URL</span>
                </>
              )}
            </button>

            <button
              id="sidebar-copy-projector-btn"
              type="button"
              onClick={() => handleCopyUrl(projectorUrl, 'projector')}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/50 text-sky-200 font-semibold transition-colors"
              title="Copy Dedicated Projector Fullscreen Output URL"
            >
              {copiedKey === 'projector' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied Projector!</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Copy Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Next Slide (Preview Queue) Box */}
      <div className="bg-slate-900/70 rounded-2xl p-3 border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="font-bold text-xs tracking-wider uppercase text-amber-400">
              NEXT SLIDE (PREVIEW)
            </h3>
          </div>

          {state.nextSlide && (
            <button
              id="advance-next-slide-btn"
              type="button"
              onClick={onAdvanceNext}
              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1 shadow transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" /> Push to Live
            </button>
          )}
        </div>

        {state.nextSlide ? (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <span className="font-bold text-sky-400">
              {state.nextSlide.reference || state.nextSlide.title}
            </span>
            <p className="text-slate-200 line-clamp-3 whitespace-pre-line leading-relaxed">
              {state.nextSlide.primaryText}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500 italic">
            Click &ldquo;Next&rdquo; on any lyric or Bible verse to queue preview
          </div>
        )}
      </div>

      {/* Quick Mode Switcher & Operator Cheatsheet */}
      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 text-xs space-y-2.5 text-slate-400">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-semibold text-slate-300">Fast Mode Toggle:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onUpdateMode('fullscreen')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                state.displayMode === 'fullscreen'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Full Screen
            </button>
            <button
              type="button"
              onClick={() => onUpdateMode('lowerthird')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                state.displayMode === 'lowerthird'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Lower Third
            </button>
          </div>
        </div>

        {deviceMode === 'desktop' && (
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span>F1 Key:</span>
              <span className="text-slate-300">Toggle Blackout</span>
            </div>
            <div className="flex justify-between">
              <span>F2 Key:</span>
              <span className="text-slate-300">Toggle Clear Text</span>
            </div>
            <div className="flex justify-between">
              <span>F3 Key:</span>
              <span className="text-slate-300">Toggle Church Logo</span>
            </div>
            <div className="flex justify-between">
              <span>PageDown / Ctrl+Right:</span>
              <span className="text-slate-300">Push Next to Live</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
