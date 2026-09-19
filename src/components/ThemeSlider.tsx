import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSliderProps {
  variant?: 'compact' | 'detailed' | 'segmented';
  className?: string;
  showLabels?: boolean;
}

export const ThemeSlider: React.FC<ThemeSliderProps> = ({
  variant = 'compact',
  className = '',
  showLabels = false,
}) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'detailed') {
    return (
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
        isDark 
          ? 'bg-[#1A1F2B] border-slate-800' 
          : 'bg-[#F9FAFB] border-[#E5E5EA]'
      } ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isDark 
              ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40' 
              : 'bg-amber-100 text-amber-600 border border-amber-200'
          }`}>
            {isDark ? <Moon className="w-5 h-5 animate-in spin-in-12 duration-300" /> : <Sun className="w-5 h-5 animate-in spin-in-12 duration-300" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#1C1C1E]'}`}>
                {isDark ? 'Dark Theme' : 'Light Theme'}
              </h4>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isDark 
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20' 
                  : 'bg-amber-500/15 text-amber-700 border border-amber-500/20'
              }`}>
                Active
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#8E8E93]'}`}>
              {isDark
                ? 'High contrast dark theme reduces eye fatigue in low light'
                : 'Clean daytime appearance with crisp clinical contrast'}
            </p>
          </div>
        </div>

        {/* Sliding Switch Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle theme between light and dark"
            onClick={toggleTheme}
            className={`group relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] focus-visible:ring-offset-2 ${
              isDark
                ? 'bg-[#2A3245] border border-slate-700/80 shadow-inner'
                : 'bg-[#E5E7EB] border border-slate-300/80 shadow-inner'
            }`}
            title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {/* Background Icons inside Track */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              <Sun
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  !isDark ? 'text-amber-500 opacity-100 scale-100' : 'text-slate-500 opacity-40 scale-90'
                }`}
              />
              <Moon
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  isDark ? 'text-indigo-400 opacity-100 scale-100' : 'text-slate-400 opacity-40 scale-90'
                }`}
              />
            </div>

            {/* Sliding Thumb */}
            <span
              className={`pointer-events-none inline-flex items-center justify-center h-6 w-6 transform rounded-full shadow-md transition-all duration-300 ease-in-out ${
                isDark
                  ? 'translate-x-8 bg-[#181C26] text-indigo-300 ring-1 ring-white/10'
                  : 'translate-x-0 bg-white text-amber-500 ring-1 ring-black/5'
              }`}
            >
              {isDark ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className={`inline-flex items-center p-1 rounded-xl transition-colors ${
          isDark
            ? 'bg-[#181C26] border border-slate-800'
            : 'bg-[#F2F2F7] border border-[#E5E5EA]'
        } ${className}`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={!isDark}
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-amber-600 shadow-xs font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500/20' : ''}`} />
          <span>Light</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={isDark}
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-700 text-indigo-300 shadow-xs font-bold'
              : 'text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-white/50'
          }`}
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400 fill-indigo-400/20' : ''}`} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  // Default: 'compact' Slider Button (fits directly in header or nav bar)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Current theme is ${theme}. Toggle to ${isDark ? 'light' : 'dark'} theme`}
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className={`group relative inline-flex items-center h-7 sm:h-8 w-[54px] sm:w-[60px] shrink-0 cursor-pointer rounded-full p-0.5 sm:p-1 transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF] focus-visible:ring-offset-2 select-none active:scale-95 ${
        isDark
          ? 'bg-[#222736] border border-slate-700/80 shadow-inner hover:border-indigo-500/50'
          : 'bg-[#E5E5EA] border border-slate-300/80 shadow-inner hover:border-amber-400/60'
      } ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {/* Background Icons inside Track */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 sm:px-2 pointer-events-none">
        <Sun
          className={`w-3 sm:w-3.5 h-3 sm:h-3.5 transition-all duration-200 ${
            !isDark ? 'text-amber-500 opacity-100 scale-105' : 'text-slate-500 opacity-40 scale-90'
          }`}
        />
        <Moon
          className={`w-3 sm:w-3.5 h-3 sm:h-3.5 transition-all duration-200 ${
            isDark ? 'text-indigo-400 opacity-100 scale-105' : 'text-slate-400 opacity-40 scale-90'
          }`}
        />
      </div>

      {/* Smooth Sliding Pill / Thumb */}
      <span
        className={`pointer-events-none inline-flex items-center justify-center h-5 sm:h-6 w-5 sm:w-6 transform rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          isDark
            ? 'translate-x-[26px] sm:translate-x-[28px] bg-[#141722] text-indigo-300 ring-1 ring-white/10'
            : 'translate-x-0 bg-white text-amber-500 ring-1 ring-black/5'
        }`}
      >
        {isDark ? (
          <Moon className="w-2.5 sm:w-3 h-2.5 sm:h-3 transition-transform group-hover:-rotate-12 duration-200" />
        ) : (
          <Sun className="w-2.5 sm:w-3 h-2.5 sm:h-3 transition-transform group-hover:rotate-45 duration-200" />
        )}
      </span>

      {showLabels && (
        <span className="sr-only">
          {isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        </span>
      )}
    </button>
  );
};
