import React, { useState, useEffect } from 'react';
import { useWorshipSync } from '../hooks/useWorshipSync';
import { SlideDisplay } from './SlideDisplay';
import { Maximize, Minimize, Wifi, WifiOff, Tv } from 'lucide-react';

interface DisplayViewProps {
  defaultMode?: 'fullscreen' | 'lowerthird';
  defaultTransparent?: boolean;
}

export const DisplayView: React.FC<DisplayViewProps> = ({
  defaultMode,
  defaultTransparent,
}) => {
  const params = new URLSearchParams(window.location.search);
  const viewParam = params.get('view')?.toLowerCase();
  
  const isLowerThirdUrl =
    viewParam === 'lowerthird' ||
    viewParam === 'lower-third' ||
    viewParam === 'obs' ||
    defaultMode === 'lowerthird';

  const isFullscreenUrl =
    viewParam === 'display' ||
    viewParam === 'fullscreen' ||
    viewParam === 'projector' ||
    defaultMode === 'fullscreen';

  const accountParam = params.get('account') || 'worship-main';
  
  const explicitMode = params.get('mode') as 'fullscreen' | 'lowerthird' | null;
  const modeParam: 'fullscreen' | 'lowerthird' = explicitMode
    ? explicitMode
    : isLowerThirdUrl
    ? 'lowerthird'
    : 'fullscreen';

  const isTransparent =
    isLowerThirdUrl ||
    params.get('transparent') === 'true' ||
    (defaultTransparent === true && !isFullscreenUrl);

  const { state, connectionStatus } = useWorshipSync(accountParam, 'display');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // When in transparent lower-third OBS mode, make body and html backgrounds transparent
    if (isTransparent) {
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.style.backgroundColor = 'transparent';
    }
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, [isTransparent]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request denied:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  return (
    <div
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={`fixed inset-0 w-screen h-screen overflow-hidden select-none ${
        isTransparent ? 'bg-transparent' : 'bg-black'
      }`}
    >
      <SlideDisplay
        state={state}
        overrideMode={modeParam}
        forceTransparent={isTransparent}
        className="w-full h-full"
      />

      {/* Floating minimal overlay control on hover (Hidden when clean in OBS) */}
      {showControls && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs text-white/90 shadow-xl transition-opacity">
          {isLowerThirdUrl ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 border-r border-white/20 pr-2">
              <Tv className="w-3.5 h-3.5" /> OBS Lower Third
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-sky-400 border-r border-white/20 pr-2">
              <Maximize className="w-3.5 h-3.5" /> Projector Full Screen
            </span>
          )}

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            {connectionStatus === 'connected' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Wifi className="w-3.5 h-3.5" />
                <span>{accountParam}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 hover:text-white rounded ml-2 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
