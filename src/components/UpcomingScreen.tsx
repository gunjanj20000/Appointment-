import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { getTodayDateString, formatFriendlyDate } from '../utils/date';
import { AppointmentCard } from './AppointmentCard';
import {
  CalendarRange,
  Search,
  Printer,
  Plus,
  Filter,
  Calendar,
  ChevronRight,
  History
} from 'lucide-react';

interface UpcomingScreenProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string, patientName: string) => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onNewAppointment: (prefilledDate?: string) => void;
  onOpenPrint: (type: 'upcoming') => void;
}

export const UpcomingScreen: React.FC<UpcomingScreenProps> = ({
  appointments,
  onEdit,
  onDelete,
  onStatusChange,
  onNewAppointment,
  onOpenPrint,
}) => {
  const todayStr = getTodayDateString();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'upcoming' | 'all' | 'past'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');

  // Filter based on view mode (Upcoming = date > todayStr; past = date < todayStr; all = all dates)
  const baseAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (viewMode === 'upcoming') return a.date > todayStr;
      if (viewMode === 'past') return a.date < todayStr;
      return true; // all
    });
  }, [appointments, todayStr, viewMode]);

  // Search & status filter
  const filtered = useMemo(() => {
    return baseAppointments.filter((a) => {
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.patientName.toLowerCase().includes(q) ||
        (a.phone && a.phone.includes(q)) ||
        (a.visitType && a.visitType.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [baseAppointments, statusFilter, searchQuery]);

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups: { [dateStr: string]: Appointment[] } = {};
    filtered.forEach((apt) => {
      if (!groups[apt.date]) {
        groups[apt.date] = [];
      }
      groups[apt.date].push(apt);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => {
      return viewMode === 'past' ? b.localeCompare(a) : a.localeCompare(b);
    });

    return sortedDates.map((dateKey) => ({
      date: dateKey,
      items: groups[dateKey],
    }));
  }, [filtered, viewMode]);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Compact Top Control Bar */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-[#F2F2F7] shadow-2xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: View Modes & Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F2F2F7] p-0.5 rounded-lg">
            {(['upcoming', 'all', 'past'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition cursor-pointer min-h-[28px] ${
                  viewMode === mode
                    ? 'bg-white text-[#007AFF] shadow-2xs font-bold'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                }`}
              >
                {mode === 'upcoming' ? 'Upcoming' : mode === 'all' ? 'All' : 'Past'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#F2F2F7] p-0.5 rounded-lg">
            {(['All', 'Waiting', 'Completed'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer min-h-[28px] ${
                  statusFilter === st
                    ? 'bg-white text-[#1C1C1E] shadow-2xs font-bold'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search + Print + Add */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-44">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-6 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:bg-white focus:border-[#007AFF] focus:outline-hidden transition"
            />
            <Search className="w-3.5 h-3.5 text-[#8E8E93] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#8E8E93] hover:text-[#1C1C1E]"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenPrint('upcoming')}
            disabled={filtered.length === 0}
            className="p-1.5 text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] disabled:opacity-30 disabled:pointer-events-none rounded-lg transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
            title="Print schedule"
          >
            <Printer className="w-3.5 h-3.5 text-[#8E8E93]" />
          </button>

          <button
            type="button"
            onClick={() => onNewAppointment()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px] shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Date Grouped Appointments - Internal scroll, no window scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
        {groupedAppointments.length > 0 ? (
          groupedAppointments.map((group) => (
            <div key={group.date} className="space-y-1.5">
              {/* Date Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span className="text-xs font-bold text-[#1C1C1E]">
                    {formatFriendlyDate(group.date)}
                  </span>
                  <span className="text-[11px] text-[#8E8E93]">
                    ({group.items.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNewAppointment(group.date)}
                  className="text-[11px] font-semibold text-[#007AFF] hover:underline cursor-pointer"
                >
                  + Add
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-1.5">
                {group.items.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    showDate={false}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="h-full min-h-[200px] bg-white rounded-xl p-6 text-center border border-dashed border-[#E5E5EA] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-2">
              <CalendarRange className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1C1E]">
              {viewMode === 'upcoming' ? 'No Upcoming Appointments' : 'No Appointments Found'}
            </h3>
            <p className="text-xs text-[#8E8E93] mt-0.5 max-w-xs">
              {viewMode === 'upcoming'
                ? 'Your upcoming calendar has no booked visits.'
                : 'No appointments match your search criteria.'}
            </p>
            <button
              type="button"
              onClick={() => onNewAppointment()}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
