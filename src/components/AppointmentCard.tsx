import React, { useState } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import { formatTimeDisplay } from '../utils/date';
import {
  Phone,
  Clock,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock3,
  XCircle,
  FileText,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string, patientName: string) => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onNotify?: (appointment: Appointment, initialChannel?: 'whatsapp' | 'sms') => void;
  showDate?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  onNotify,
  showDate = false,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Waiting':
        return 'bg-[#FFF9E6] dark:bg-amber-950/40 text-[#FFB000] dark:text-amber-400';
      case 'Completed':
        return 'bg-[#E1F7E6] dark:bg-emerald-950/40 text-[#34C759] dark:text-emerald-400';
      case 'Cancelled':
        return 'bg-[#FFEBEA] dark:bg-rose-950/40 text-[#FF3B30] dark:text-rose-400';
    }
  };

  const timeOrQueueLabel = [
    appointment.time ? formatTimeDisplay(appointment.time) : null,
    appointment.queueNumber ? `Q-${appointment.queueNumber}` : null,
    showDate ? appointment.date : null,
  ].filter(Boolean).join(' • ');

  return (
    <div
      id={`appointment-card-${appointment.id}`}
      className="px-3 py-2 sm:py-2.5 bg-white dark:bg-[#181C26] rounded-xl border border-[#F2F2F7] dark:border-slate-800 shadow-2xs hover:border-[#007AFF]/30 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
    >
      {/* Left: Queue / Time Badge + Patient Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center min-w-[52px] px-2 py-1 bg-[#F2F2F7] dark:bg-[#212632] rounded-lg text-center shrink-0">
          {appointment.queueNumber && (
            <span className="text-xs font-bold text-[#007AFF] dark:text-[#3898FF] leading-none">#{appointment.queueNumber}</span>
          )}
          <span className="text-[11px] font-semibold text-[#1C1C1E] dark:text-white whitespace-nowrap leading-tight mt-0.5">
            {appointment.time ? formatTimeDisplay(appointment.time) : (appointment.queueNumber ? 'Queue' : '—')}
          </span>
          {showDate && (
            <span className="text-[10px] text-[#8E8E93] dark:text-slate-400 leading-none">{appointment.date}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white truncate">
              {appointment.patientName}
            </h3>
            {appointment.age !== undefined && appointment.age !== '' && (
              <span className="text-[11px] text-[#8E8E93] dark:text-slate-400">({appointment.age}y)</span>
            )}
            {appointment.visitType && (
              <span className="px-1.5 py-0.2 bg-[#F2F2F7] dark:bg-[#212632] text-[#1C1C1E] dark:text-slate-300 text-[10px] font-medium rounded">
                {appointment.visitType}
              </span>
            )}
            {appointment.phone && (
              <div className="inline-flex items-center gap-1.5 flex-wrap">
                <a
                  href={`tel:${appointment.phone}`}
                  className="text-[11px] text-[#007AFF] dark:text-[#3898FF] hover:underline inline-flex items-center gap-0.5"
                  title="Call patient"
                >
                  <Phone className="w-2.5 h-2.5" />
                  <span>{appointment.phone}</span>
                </a>
                {onNotify && (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onNotify(appointment, 'whatsapp')}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#1EAA52] dark:text-[#34D399] hover:bg-[#25D366]/20 dark:hover:bg-[#25D366]/30 transition cursor-pointer"
                      title="Send WhatsApp message to patient"
                    >
                      <WhatsAppIcon className="w-2.5 h-2.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNotify(appointment, 'sms')}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#007AFF]/10 dark:bg-[#007AFF]/20 text-[#007AFF] dark:text-[#3898FF] hover:bg-[#007AFF]/20 dark:hover:bg-[#007AFF]/30 transition cursor-pointer"
                      title="Send SMS message to patient"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>SMS</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {appointment.notes && (
            <p className="text-[11px] text-[#8E8E93] dark:text-slate-400 truncate mt-0.5 max-w-md">
              {appointment.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right: Status badge & quick actions */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[#F2F2F7] dark:border-slate-800">
        {/* Quick Done / Reopen Button */}
        {appointment.status === 'Waiting' ? (
          <button
            type="button"
            onClick={() => onStatusChange(appointment.id, 'Completed')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#34C759] dark:text-emerald-400 bg-[#E4F9EC] dark:bg-emerald-950/40 hover:bg-[#34C759]/20 dark:hover:bg-emerald-900/50 rounded-lg transition cursor-pointer min-h-[30px]"
            title="Mark Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        ) : appointment.status === 'Completed' ? (
          <button
            type="button"
            onClick={() => onStatusChange(appointment.id, 'Waiting')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#FF9500] dark:text-amber-400 bg-[#FFF9EB] dark:bg-amber-950/40 hover:bg-[#FF9500]/20 dark:hover:bg-amber-900/50 rounded-lg transition cursor-pointer min-h-[30px]"
            title="Mark Waiting"
          >
            <Clock3 className="w-3.5 h-3.5" />
            <span>Reopen</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStatusChange(appointment.id, 'Waiting')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#007AFF] dark:text-[#3898FF] bg-[#007AFF]/10 dark:bg-[#007AFF]/20 hover:bg-[#007AFF]/20 dark:hover:bg-[#007AFF]/30 rounded-lg transition cursor-pointer min-h-[30px]"
          >
            <span>Activate</span>
          </button>
        )}

        {/* Status Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wider transition cursor-pointer min-h-[30px] ${getStatusBadge(
              appointment.status
            )}`}
          >
            <span>{appointment.status}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Quick Status Menu */}
          {showStatusMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowStatusMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#1E2330] rounded-xl shadow-lg border border-[#F2F2F7] dark:border-slate-800 py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(appointment.id, 'Waiting');
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left transition hover:bg-[#FFF9E6]/60 dark:hover:bg-slate-700/60 ${
                    appointment.status === 'Waiting' ? 'text-[#FFB000] dark:text-amber-400 bg-[#FFF9E6] dark:bg-amber-950/30' : 'text-[#1C1C1E] dark:text-white'
                  }`}
                >
                  <Clock3 className="w-3.5 h-3.5 text-[#FFB000] dark:text-amber-400" />
                  Waiting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(appointment.id, 'Completed');
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left transition hover:bg-[#E1F7E6]/60 dark:hover:bg-slate-700/60 ${
                    appointment.status === 'Completed' ? 'text-[#34C759] dark:text-emerald-400 bg-[#E1F7E6] dark:bg-emerald-950/30' : 'text-[#1C1C1E] dark:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] dark:text-emerald-400" />
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(appointment.id, 'Cancelled');
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left transition hover:bg-[#FFEBEA]/60 dark:hover:bg-slate-700/60 ${
                    appointment.status === 'Cancelled' ? 'text-[#FF3B30] dark:text-rose-400 bg-[#FFEBEA] dark:bg-rose-950/30' : 'text-[#1C1C1E] dark:text-white'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-[#FF3B30] dark:text-rose-400" />
                  Cancelled
                </button>
              </div>
            </>
          )}
        </div>

        {/* Message, Edit and Delete Actions */}
        <div className="flex items-center gap-0.5">
          {onNotify && (
            <button
              type="button"
              onClick={() => onNotify(appointment)}
              className="p-1.5 text-[#8E8E93] dark:text-slate-400 hover:text-[#007AFF] dark:hover:text-[#3898FF] hover:bg-[#007AFF]/10 rounded-lg transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
              title="Send SMS or WhatsApp message to patient"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(appointment)}
            className="p-1.5 text-[#8E8E93] dark:text-slate-400 hover:text-[#007AFF] dark:hover:text-[#3898FF] hover:bg-[#F2F2F7] dark:hover:bg-slate-800 rounded-lg transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(appointment.id, appointment.patientName)}
            className="p-1.5 text-[#8E8E93] dark:text-slate-400 hover:text-[#FF3B30] dark:hover:text-rose-400 hover:bg-[#FFEBEA] dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
