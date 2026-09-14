import React, { useState } from 'react';
import {
  Tv,
  Maximize2,
  Monitor,
  Copy,
  Check,
  ExternalLink,
  X,
  Sparkles,
  Info,
} from 'lucide-react';

interface OutputUrlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: string;
}

export const OutputUrlsModal: React.FC<OutputUrlsModalProps> = ({
  isOpen,
  onClose,
  account,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const lowerThirdUrl = `${origin}/?view=lowerthird&account=${encodeURIComponent(account)}`;
  const projectorUrl = `${origin}/?view=display&account=${encodeURIComponent(account)}`;
  const stageUrl = `${origin}/?view=stage&account=${encodeURIComponent(account)}`;

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Broadcast &amp; Output URLs</h3>
              <p className="text-xs text-slate-400">
                Independent screen feeds for Sanctuary, OBS Stream, &amp; Stage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Output Cards */}
        <div className="space-y-3.5">
          {/* 1. SEPARATE LOWER THIRD URL (OBS / Live Stream) */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border-2 border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="font-extrabold text-sm text-emerald-300 flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  Separate Lower Third URL (OBS / vMix)
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-200 uppercase">
                100% Transparent
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Use as a <strong>Browser Source</strong> in OBS Studio, vMix, or ATEM. Renders transparently over camera feed with full-width margin.
            </p>
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <input
                type="text"
                readOnly
                value={lowerThirdUrl}
                className="flex-1 bg-transparent text-xs text-slate-300 font-mono focus:outline-none truncate"
              />
              <button
                id="copy-lowerthird-modal-btn"
                type="button"
                onClick={() => handleCopy(lowerThirdUrl, 'lowerthird')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {copiedKey === 'lowerthird' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
              <a
                href={lowerThirdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Open in new tab to test"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="text-[11px] text-emerald-300/80 flex items-center gap-1.5 font-medium pt-0.5">
              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>OBS Settings: Width: 1920, Height: 1080, FPS: 30/60</span>
            </div>
          </div>

          {/* 2. SANCTUARY PROJECTOR URL (Fullscreen) */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-sky-400 flex items-center gap-1.5">
                <Maximize2 className="w-4 h-4 text-sky-400" />
                Sanctuary Projector URL (Full Screen)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-300">
                Audience Screen
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
              <input
                type="text"
                readOnly
                value={projectorUrl}
                className="flex-1 bg-transparent text-xs text-slate-300 font-mono focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={() => handleCopy(projectorUrl, 'projector')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'projector' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
              <a
                href={projectorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 3. STAGE / CONFIDENCE DISPLAY URL */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-amber-400" />
                Stage / Confidence Monitor URL
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
                Band &amp; Pastor View
              </span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
              <input
                type="text"
                readOnly
                value={stageUrl}
                className="flex-1 bg-transparent text-xs text-slate-300 font-mono focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={() => handleCopy(stageUrl, 'stage')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'stage' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
              <a
                href={stageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            All output URLs sync in real time with your operator console using channel{' '}
            <strong className="text-slate-200">{account}</strong>. No software installation needed on other display computers.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
