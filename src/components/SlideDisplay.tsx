import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorshipState } from '../types';
import { MotionBackground } from './MotionBackground';
import { isTeluguText } from '../utils/telugu';
import { Church, Bell } from 'lucide-react';

interface SlideDisplayProps {
  state: WorshipState;
  overrideMode?: 'fullscreen' | 'lowerthird';
  forceTransparent?: boolean;
  isStageView?: boolean;
  className?: string;
}

export const SlideDisplay: React.FC<SlideDisplayProps> = ({
  state,
  overrideMode,
  forceTransparent = false,
  isStageView = false,
  className = '',
}) => {
  const { isBlackout, isClearText, isLogo, currentSlide, theme, isAlertVisible, alertText } = state;
  const activeMode = overrideMode || state.displayMode;

  // Resolve Telugu font defaults (Ramabhadra)
  const isPrimaryTelugu = isTeluguText(currentSlide?.primaryText) || currentSlide?.primaryLanguage?.toLowerCase().includes('te');
  const isSecondaryTelugu = isTeluguText(currentSlide?.secondaryText) || currentSlide?.secondaryLanguage?.toLowerCase().includes('te');
  const teluguFont = theme.teluguFontFamily || 'Ramabhadra';

  const primaryFontFamily = isPrimaryTelugu
    ? `"${teluguFont}", 'Gautami', 'Vani', sans-serif`
    : `"${theme.fontFamily}", sans-serif`;

  const secondaryFontFamily = isSecondaryTelugu
    ? `"${teluguFont}", 'Gautami', 'Vani', sans-serif`
    : `"${theme.secondaryFontFamily || 'Outfit'}", sans-serif`;

  // Compute CSS text styles
  const fontStyleObj: React.CSSProperties = {
    fontFamily: primaryFontFamily,
    fontSize: `${theme.fontSize}px`,
    color: theme.fontColor || '#ffffff',
    fontWeight:
      theme.fontWeight === 'black'
        ? 900
        : theme.fontWeight === 'bold'
        ? 700
        : theme.fontWeight === 'semibold'
        ? 600
        : 400,
    fontStyle: isPrimaryTelugu ? 'normal' : (theme.fontItalic ? 'italic' : 'normal'),
    textTransform: isPrimaryTelugu ? 'none' : (theme.textTransform === 'uppercase' ? 'uppercase' : 'none'),
    textAlign: theme.textAlign,
    lineHeight: isPrimaryTelugu ? Math.max(theme.lineHeight || 1.4, 1.45) : (theme.lineHeight || 1.35),
    textShadow: theme.textShadow
      ? '0 2px 10px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.6)'
      : 'none',
    WebkitTextStroke: theme.textOutline ? '1px rgba(0,0,0,0.9)' : 'none',
  };

  const secondaryFontStyleObj: React.CSSProperties = {
    fontFamily: secondaryFontFamily,
    fontSize: `${theme.secondaryFontSize || Math.round(theme.fontSize * 0.65)}px`,
    color: theme.secondaryFontColor || '#94a3b8',
    textAlign: theme.textAlign,
    fontWeight: isSecondaryTelugu ? 600 : 500,
    lineHeight: isSecondaryTelugu ? 1.5 : 1.4,
    textShadow: theme.textShadow ? '0 2px 8px rgba(0,0,0,0.8)' : 'none',
  };

  // Blackout screen
  if (isBlackout) {
    return (
      <div className={`relative w-full h-full bg-black flex items-center justify-center select-none overflow-hidden ${className}`}>
        <span className="sr-only">Screen Blackout</span>
      </div>
    );
  }

  // Logo screen
  if (isLogo) {
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden ${className}`}>
        <MotionBackground theme={theme} forceTransparent={forceTransparent} />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl mb-6">
            <Church className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-wide drop-shadow-md">
            WORSHIP GATHERING
          </h2>
          <p className="text-lg text-white/70 mt-2 font-medium tracking-wider uppercase">
            Glory to God in the Highest
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full flex flex-col select-none overflow-hidden ${
        forceTransparent ? 'bg-transparent' : 'bg-black'
      } ${className}`}
    >
      {/* Dynamic Background */}
      {!forceTransparent && <MotionBackground theme={theme} />}

      {/* Urgent Alert Banner (Overhead) */}
      <AnimatePresence>
        {isAlertVisible && alertText && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-50 bg-amber-500/95 backdrop-blur-md text-amber-950 font-bold px-6 py-3 flex items-center justify-center gap-3 shadow-lg"
          >
            <Bell className="w-6 h-6 animate-bounce" />
            <span className="text-xl tracking-wide">{alertText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Slide Content */}
      <div className="relative z-20 flex-1 flex flex-col w-full h-full">
        <AnimatePresence mode="wait">
          {!isClearText && currentSlide && (
            activeMode === 'lowerthird' ? (
              // LOWER THIRD DISPLAY LAYOUT - Stretches full width with margin to ends of screen
              <motion.div
                key={`lower-${currentSlide.id}`}
                initial={{ opacity: 0, y: theme.lowerThirdPosition === 'top' ? -30 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: theme.lowerThirdPosition === 'top' ? -20 : 20 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-full flex px-2 sm:px-4 md:px-6 lg:px-8 pb-4 md:pb-6 ${
                  theme.lowerThirdPosition === 'top' ? 'pt-6 md:pt-8 items-start' : 'mt-auto items-end'
                } justify-center`}
              >
                {/* Lower Third Banner */}
                <div
                  className={`w-full transition-all duration-300 ${
                    theme.lowerThirdStyle === 'pill'
                      ? 'rounded-2xl px-3 sm:px-6 md:px-8 py-4 sm:py-5 border border-white/15 shadow-2xl backdrop-blur-xl'
                      : theme.lowerThirdStyle === 'full_banner'
                      ? 'rounded-none px-3 sm:px-6 md:px-8 py-5 border-l-8 border-white/20 shadow-2xl backdrop-blur-md'
                      : theme.lowerThirdStyle === 'floating_box'
                      ? 'rounded-xl px-3 sm:px-6 md:px-8 py-5 border border-white/10 shadow-xl backdrop-blur-md'
                      : theme.lowerThirdStyle === 'cinematic_bar'
                      ? 'rounded-none px-3 sm:px-6 md:px-8 py-4 border-t border-b border-white/20 backdrop-blur-md'
                      : 'rounded-xl px-3 sm:px-6 md:px-8 py-4 backdrop-blur-sm'
                  }`}
                  style={{
                    backgroundColor:
                      theme.lowerThirdStyle === 'full_banner'
                        ? `rgba(10, 15, 29, ${theme.lowerThirdOpacity / 100})`
                        : `rgba(15, 23, 42, ${theme.lowerThirdOpacity / 100})`,
                    borderLeftColor:
                      theme.lowerThirdStyle === 'full_banner'
                        ? theme.lowerThirdAccentColor || '#38bdf8'
                        : undefined,
                  }}
                >
                  {/* Title & Scripture / Song Reference Header */}
                  {(currentSlide.reference || currentSlide.title || currentSlide.subtitle) && (
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase text-white shadow-sm"
                        style={{
                          backgroundColor: theme.lowerThirdAccentColor || '#0284c7',
                        }}
                      >
                        {currentSlide.type === 'bible' ? 'SCRIPTURE' : currentSlide.subtitle || 'WORSHIP'}
                      </span>
                      <span className="text-white/90 font-semibold text-sm tracking-wide">
                        {currentSlide.reference || currentSlide.title}
                      </span>
                    </div>
                  )}

                  {/* Primary text */}
                  <div
                    style={fontStyleObj}
                    className="w-full whitespace-pre-line tracking-wide drop-shadow-md break-words"
                  >
                    {currentSlide.primaryText}
                  </div>

                  {/* Secondary language / subtitle text */}
                  {(theme.showSecondary || currentSlide.secondaryText) && currentSlide.secondaryText && (
                    <div
                      style={secondaryFontStyleObj}
                      className="w-full mt-2.5 pt-2 border-t border-white/15 whitespace-pre-line break-words"
                    >
                      {currentSlide.secondaryText}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              // FULL SCREEN DISPLAY LAYOUT - Spans full screen width with clean end margins
              <motion.div
                key={`full-${currentSlide.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full h-full flex flex-col justify-center px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 box-border"
              >
                {/* Header Tag for Scripture or Song */}
                {(currentSlide.reference || currentSlide.subtitle) && (
                  <div className={`mb-4 flex items-center gap-2 ${
                    theme.textAlign === 'center' ? 'justify-center' : theme.textAlign === 'right' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span
                      className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-md"
                      style={{ backgroundColor: theme.lowerThirdAccentColor || '#38bdf8' }}
                    >
                      {currentSlide.type === 'bible' ? 'HOLY BIBLE' : currentSlide.subtitle || 'WORSHIP'}
                    </span>
                    {currentSlide.reference && (
                      <span className="text-white/90 font-bold text-base sm:text-lg tracking-wider drop-shadow">
                        {currentSlide.reference}
                      </span>
                    )}
                  </div>
                )}

                {/* Primary Worship Text / Scripture - Full Screen Width */}
                <div
                  style={fontStyleObj}
                  className="w-full whitespace-pre-line tracking-wide transition-all duration-200 drop-shadow-lg break-words"
                >
                  {currentSlide.primaryText}
                </div>

                {/* Secondary Parallel Language Scripture or Lyric */}
                {(theme.showSecondary || currentSlide.secondaryText) && currentSlide.secondaryText && (
                  <div
                    style={secondaryFontStyleObj}
                    className="w-full mt-6 pt-4 border-t border-white/15 whitespace-pre-line drop-shadow-md break-words"
                  >
                    {currentSlide.secondaryText}
                  </div>
                )}

                {/* Footer Reference or Copyright */}
                {currentSlide.copyright && (
                  <div className="mt-8 text-xs text-white/50 tracking-wider">
                    {currentSlide.copyright}
                  </div>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>

      {/* Screen Mode Indicator for Operator preview */}
      {overrideMode && (
        <div className="absolute bottom-2 right-3 z-30 pointer-events-none">
          <span className="text-[10px] uppercase font-mono tracking-widest bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-white/70 border border-white/10">
            {activeMode}
          </span>
        </div>
      )}
    </div>
  );
};
