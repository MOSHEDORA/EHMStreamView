import React, { useState } from 'react';
import { useWorshipSync } from '../hooks/useWorshipSync';
import { SlideDisplay } from './SlideDisplay';
import {
  Maximize2,
  Tv,
  Wifi,
  WifiOff,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export const DualDisplayView: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const accountParam = params.get('account') || 'worship-main';
  const { state, connectionStatus } = useWorshipSync(accountParam, 'display');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = window.location.origin;
  const fullscreenUrl = `${origin}/?view=fullscreen&account=${encodeURIComponent(accountParam)}`;
  const lowerThirdUrl = `${origin}/?view=lowerthird&account=${encodeURIComponent(accountParam)}`;

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden select-none text-slate-100">
      {/* Top Bar Indicator */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-white uppercase tracking-wider text-xs">
              DUAL OUTPUT MONITOR
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Simultaneous Full Screen &amp; Lower Third Feeds
          </span>
          <span className="px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-mono text-[10px]">
            Channel: {accountParam}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Wifi className="w-3.5 h-3.5" />
                <span>Live Synced</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Connecting...</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT / TOP: Sanctuary Projector (Full Screen Mode) */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 min-h-0">
          <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                Output 1: Sanctuary Projector (Full Screen)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(fullscreenUrl, 'full')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1"
                title="Copy standalone Fullscreen URL"
              >
                {copiedKey === 'full' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'full' ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={fullscreenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-300 hover:text-white text-[10px] font-semibold"
                title="Open standalone Projector window"
              >
                <span>Launch Solo</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
          <div className="flex-1 relative bg-black overflow-hidden">
            <SlideDisplay
              state={state}
              overrideMode="fullscreen"
              forceTransparent={false}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* RIGHT / BOTTOM: OBS Live Stream (Lower Third Mode) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-emerald-400" />
                Output 2: OBS Stream (Lower Third Overlay)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(lowerThirdUrl, 'lower')}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1"
                title="Copy standalone Lower Third URL for OBS"
              >
                {copiedKey === 'lower' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'lower' ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={lowerThirdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:text-white text-[10px] font-semibold"
                title="Open standalone Lower Third OBS window"
              >
                <span>Launch Solo</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
          {/* Simulated live video backdrop pattern so transparent lower-third is clearly visible */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            {/* Subtle grid to simulate camera/stage video under overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
            <SlideDisplay
              state={state}
              overrideMode="lowerthird"
              forceTransparent={true}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
