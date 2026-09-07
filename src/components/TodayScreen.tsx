import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { getTodayDateString, formatFriendlyDate, formatTimeDisplay } from '../utils/date';
import { AppointmentCard } from './AppointmentCard';
import {
  Calendar,
  Search,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  UserCheck,
  Filter
} from 'lucide-react';

interface TodayScreenProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string, patientName: string) => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onNewAppointment: (prefilledDate?: string) => void;
  onOpenPrint: (type: 'today') => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  appointments,
  onEdit,
  onDelete,
  onStatusChange,
  onNewAppointment,
  onOpenPrint,
}) => {
  const todayStr = getTodayDateString();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');

  // Filter today's appointments
  const todayAppointments = useMemo(() => {
    return appointments.filter((a) => a.date === todayStr);
  }, [appointments, todayStr]);

  // Counts
  const stats = useMemo(() => {
    const total = todayAppointments.length;
    const waiting = todayAppointments.filter((a) => a.status === 'Waiting').length;
    const completed = todayAppointments.filter((a) => a.status === 'Completed').length;
    const cancelled = todayAppointments.filter((a) => a.status === 'Cancelled').length;
    return { total, waiting, completed, cancelled };
  }, [todayAppointments]);

  // Filtered list
  const filteredAppointments = useMemo(() => {
    return todayAppointments.filter((a) => {
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        a.patientName.toLowerCase().includes(q) ||
        (a.phone && a.phone.includes(q)) ||
        (a.queueNumber && a.queueNumber.toLowerCase().includes(q)) ||
        (a.notes && a.notes.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [todayAppointments, statusFilter, searchQuery]);

  // Next Patient in Line
  const nextPatient = useMemo(() => {
    return todayAppointments.find((a) => a.status === 'Waiting');
  }, [todayAppointments]);

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Compact Top Control Bar */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-[#F2F2F7] shadow-2xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Date & Status Filters with counts */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-[#1C1C1E] whitespace-nowrap">
            {formatFriendlyDate(todayStr)}
          </span>

          <div className="flex items-center gap-1 bg-[#F2F2F7] p-0.5 rounded-lg overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer min-h-[28px] ${
                statusFilter === 'All'
                  ? 'bg-white text-[#007AFF] shadow-2xs font-bold'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Waiting')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer min-h-[28px] ${
                statusFilter === 'Waiting'
                  ? 'bg-white text-[#FF9500] shadow-2xs font-bold'
                  : 'text-[#8E8E93] hover:text-[#FF9500]'
              }`}
            >
              Waiting ({stats.waiting})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('Completed')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer min-h-[28px] ${
                statusFilter === 'Completed'
                  ? 'bg-white text-[#34C759] shadow-2xs font-bold'
                  : 'text-[#8E8E93] hover:text-[#34C759]'
              }`}
            >
              Done ({stats.completed})
            </button>
            {stats.cancelled > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('Cancelled')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer min-h-[28px] ${
                  statusFilter === 'Cancelled'
                    ? 'bg-white text-[#FF3B30] shadow-2xs font-bold'
                    : 'text-[#8E8E93] hover:text-[#FF3B30]'
                }`}
              >
                Cancelled ({stats.cancelled})
              </button>
            )}
          </div>
        </div>

        {/* Right: Search + Print + Add */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
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
            onClick={() => onOpenPrint('today')}
            disabled={stats.total === 0}
            className="p-1.5 text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] disabled:opacity-30 disabled:pointer-events-none rounded-lg transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
            title="Print roster"
          >
            <Printer className="w-3.5 h-3.5 text-[#8E8E93]" />
          </button>

          <button
            type="button"
            onClick={() => onNewAppointment(todayStr)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px] shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Appointments List - Scrollable within bounded container, no page scrolling */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        ) : todayAppointments.length === 0 ? (
          /* Empty State */
          <div className="h-full min-h-[220px] bg-white rounded-xl p-6 text-center border border-dashed border-[#E5E5EA] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1C1E]">No Appointments Today</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5 max-w-xs">
              Today's queue is empty. Tap below to register a patient in queue.
            </p>
            <button
              type="button"
              onClick={() => onNewAppointment(todayStr)}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Appointment</span>
            </button>
          </div>
        ) : (
          /* No filter matches */
          <div className="bg-white rounded-xl p-6 text-center border border-[#F2F2F7]">
            <p className="text-xs font-medium text-[#8E8E93]">
              No appointments matching "{searchQuery || statusFilter}".
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="mt-2 text-xs font-semibold text-[#007AFF] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
