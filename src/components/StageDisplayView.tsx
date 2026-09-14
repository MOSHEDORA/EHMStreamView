import React, { useState, useEffect } from 'react';
import { useWorshipSync } from '../hooks/useWorshipSync';
import { Clock, Wifi, WifiOff, Bell, ArrowRight } from 'lucide-react';

export const StageDisplayView: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const accountParam = params.get('account') || 'worship-main';
  const { state, connectionStatus } = useWorshipSync(accountParam, 'stage');

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const { currentSlide, nextSlide, isBlackout, isClearText, isAlertVisible, alertText } = state;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-slate-950 text-white flex flex-col p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* Top Header: Clock, Account, Sync Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-sm tracking-wider uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-md border border-amber-400/20">
            STAGE CONFIDENCE MONITOR
          </span>
          <span className="text-slate-400 text-sm font-medium">Room: {accountParam}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs">
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Wifi className="w-4 h-4" /> Live Sync
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <WifiOff className="w-4 h-4" /> Disconnected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-2xl sm:text-3xl font-mono font-bold text-sky-400 bg-slate-900 px-4 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-5 h-5 text-sky-400" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Alert Banner if Active */}
      {isAlertVisible && alertText && (
        <div className="my-4 bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold text-lg flex items-center gap-3 shadow-lg shrink-0">
          <Bell className="w-6 h-6 animate-bounce" />
          <span>ALERT: {alertText}</span>
        </div>
      )}

      {/* Status Flags */}
      {(isBlackout || isClearText) && (
        <div className="my-2 py-2 px-4 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm tracking-wider uppercase text-center shrink-0">
          {isBlackout ? 'SCREEN IS CURRENTLY BLACKED OUT' : 'TEXT IS CLEARED ON MAIN DISPLAY'}
        </div>
      )}

      {/* Main Grid: Current Slide (Large) + Next Slide (Right/Bottom) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 min-h-0">
        {/* CURRENT SLIDE (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border-2 border-sky-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-950 px-3 py-1 rounded border border-sky-800">
                CURRENTLY LIVE
              </span>
              <span className="text-sm font-bold text-slate-300">
                {currentSlide?.reference || currentSlide?.subtitle || currentSlide?.title}
              </span>
            </div>

            <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-snug whitespace-pre-line tracking-wide">
              {currentSlide?.primaryText || 'No active slide'}
            </div>

            {currentSlide?.secondaryText && (
              <div className="mt-6 pt-4 border-t border-slate-800 text-lg sm:text-2xl text-slate-400 font-medium whitespace-pre-line leading-relaxed">
                {currentSlide.secondaryText}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono mt-4">
            {currentSlide?.type === 'bible' ? 'SCRIPTURE READING' : 'WORSHIP SONG'}
          </div>
        </div>

        {/* NEXT SLIDE (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-slate-400">
              <ArrowRight className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                COMING UP NEXT
              </span>
            </div>

            {nextSlide ? (
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  {nextSlide.reference || nextSlide.subtitle || nextSlide.title}
                </span>
                <div className="text-lg sm:text-xl font-semibold text-slate-300 leading-relaxed whitespace-pre-line">
                  {nextSlide.primaryText}
                </div>
                {nextSlide.secondaryText && (
                  <div className="mt-3 text-sm text-slate-500 whitespace-pre-line">
                    {nextSlide.secondaryText}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-600 font-medium text-sm italic">
                End of queue / No next slide set
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono mt-4">
            CONFIDENCE PREVIEW
          </div>
        </div>
      </div>
    </div>
  );
};
