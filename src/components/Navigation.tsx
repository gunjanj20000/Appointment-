import React, { useState } from 'react';
import { ScreenTab } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  CalendarDays,
  CalendarRange,
  Users,
  Settings,
  Plus,
  Download,
  Share,
  WifiOff,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';

interface NavigationProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  onNewAppointment: () => void;
  waitingTodayCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  onNewAppointment,
  waitingTodayCount,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const tabs: { id: ScreenTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarRange },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Header Bar (Desktop & Mobile) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#F2F2F7] pt-safe px-3 sm:px-4 py-1.5 sm:py-2 transition no-print shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center text-white shadow-2xs shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#1C1C1E] tracking-tight leading-none">
                Medical Organizer
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F2F2F7] p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer min-h-[34px] ${
                    isActive
                      ? 'bg-white text-[#007AFF] shadow-2xs font-bold'
                      : 'text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'today' && waitingTodayCount > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 bg-[#FFB000] text-white text-[10px] font-bold rounded-full">
                      {waitingTodayCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {/* PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                type="button"
                onClick={install}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/15 rounded-lg transition cursor-pointer min-h-[34px]"
              >
                <Download className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>Install</span>
              </button>
            )}

            {/* + New Appointment Button */}
            <button
              type="button"
              onClick={onNewAppointment}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[34px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Tab Bar for Mobile & iPad */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#F9F9F9]/95 backdrop-blur-md border-t border-[#D1D1D6] px-3 pt-1.5 pb-safe bottom-nav-bar no-print">
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition cursor-pointer min-h-[50px] relative ${
                  isActive ? 'text-[#007AFF] font-bold' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  {tab.id === 'today' && waitingTodayCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-[#FFB000] text-white text-[10px] font-bold rounded-full leading-tight">
                      {waitingTodayCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* iOS Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#F2F2F7]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F2F7]">
              <h3 className="text-base font-bold text-[#1C1C1E]">Install on iPhone / iPad</h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-[#8E8E93] hover:text-[#1C1C1E] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-[#8E8E93]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <p className="text-[#1C1C1E]">Tap the <strong>Share</strong> button (box with an arrow pointing up) in Safari's bottom toolbar.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <p className="text-[#1C1C1E]">Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <p className="text-[#1C1C1E]">Tap <strong>Add</strong> in the top-right corner. The app will launch full-screen with offline support!</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-6 w-full py-3 bg-[#007AFF] text-white font-semibold text-sm rounded-xl shadow-xs hover:bg-[#0066D6] active:scale-95 min-h-[44px]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
