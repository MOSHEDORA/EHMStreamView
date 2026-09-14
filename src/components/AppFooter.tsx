import React, { useState } from 'react';
import { useAppStats } from '../services/statsService';
import {
  Users,
  Radio,
  Sparkles,
  Info,
  X,
  Church,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface AppFooterProps {
  deviceMode?: string;
  churchName?: string;
  accountId?: string;
  variant?: 'standard' | 'compact';
  className?: string;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  deviceMode = 'desktop',
  churchName,
  accountId,
  variant = 'standard',
  className = '',
}) => {
  const stats = useAppStats({ deviceMode, churchName, accountId });
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  return (
    <>
      <footer
        id="app-global-footer"
        className={`bg-slate-950/95 border-t border-slate-800/80 px-3 sm:px-5 py-2 sm:py-2.5 backdrop-blur-md text-xs text-slate-400 z-20 shrink-0 ${className}`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3">
          {/* Left: Version & Live Stats */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 w-full md:w-auto">
            {/* App Version Badge */}
            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-sky-500/60 text-slate-200 hover:text-white font-mono font-bold text-[11px] shadow-sm transition-colors cursor-pointer group"
              title="Click to view App Version details and architecture"
            >
              <Cpu className="w-3 h-3 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>{stats.version}</span>
            </button>

            {/* Total Live Users */}
            <div
              id="footer-live-users-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium text-[11px] shadow-sm"
              title="Total operators and live display screens actively connected right now"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-slate-300 font-normal">Total Live Users:</span>
              <strong className="font-bold text-emerald-400 font-mono">
                {stats.totalLiveUsers}
              </strong>
            </div>

            {/* No. of New Users used till now */}
            <div
              id="footer-total-users-badge"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-300 font-medium text-[11px] shadow-sm"
              title="Cumulative unique church operators and display sessions used till now"
            >
              <Users className="w-3 h-3 text-sky-400" />
              <span className="text-slate-300 font-normal">New Users used till now:</span>
              <strong className="font-bold text-sky-300 font-mono">
                {stats.totalUsersUsed.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Right: Designed by Moshe Dora from EHM, Kakinada */}
          <div className="flex items-center justify-center md:justify-end gap-2 text-center md:text-right w-full md:w-auto">
            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition-all cursor-pointer group"
            >
              <Church className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] sm:text-xs">
                Designed by{' '}
                <strong className="text-white font-bold tracking-wide group-hover:text-sky-300 transition-colors">
                  Moshe Dora
                </strong>{' '}
                from{' '}
                <span className="font-semibold text-amber-300">
                  EHM, Kakinada
                </span>
              </span>
              <Info className="w-3 h-3 text-slate-500 group-hover:text-slate-300 ml-0.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Details & Telemetry Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Church className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Worship Presenter Pro
                  </h3>
                  <p className="text-xs text-slate-400">
                    Version &amp; Designer Attribution
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Cards */}
            <div className="space-y-3 text-xs">
              {/* Designer Information */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lead Designer &amp; Architect</span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  Moshe Dora
                </div>
                <div className="text-xs text-slate-300">
                  Evangelical Holy Ministries (EHM)
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span>📍 Kakinada, Andhra Pradesh, India</span>
                </div>
              </div>

              {/* Version & Build */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    App Version
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {stats.version}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    Live Production
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Sync Transport
                  </div>
                  <div className="text-sm font-bold text-sky-400 mt-0.5">
                    Firebase &amp; WS
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Cross-Device Active
                  </div>
                </div>
              </div>

              {/* Live Users & Total Users Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-[11px] font-bold text-slate-300">
                  Real-Time Application Telemetry
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Total Live Users Online
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {stats.totalLiveUsers} Active
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    No. of New Users used till now
                  </span>
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    {stats.totalUsersUsed.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
