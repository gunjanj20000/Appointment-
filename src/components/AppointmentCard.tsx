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
  ChevronDown
} from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string, patientName: string) => void;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  showDate?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onDelete,
  onStatusChange,
  showDate = false,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Waiting':
        return 'bg-[#FFF9E6] text-[#FFB000]';
      case 'Completed':
        return 'bg-[#E1F7E6] text-[#34C759]';
      case 'Cancelled':
        return 'bg-[#FFEBEA] text-[#FF3B30]';
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
      className="px-3 py-2 sm:py-2.5 bg-white rounded-xl border border-[#F2F2F7] shadow-2xs hover:border-[#007AFF]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
    >
      {/* Left: Queue / Time Badge + Patient Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex flex-col items-center justify-center min-w-[52px] px-2 py-1 bg-[#F2F2F7] rounded-lg text-center shrink-0">
          {appointment.queueNumber && (
            <span className="text-xs font-bold text-[#007AFF] leading-none">#{appointment.queueNumber}</span>
          )}
          <span className="text-[11px] font-semibold text-[#1C1C1E] whitespace-nowrap leading-tight mt-0.5">
            {appointment.time ? formatTimeDisplay(appointment.time) : (appointment.queueNumber ? 'Queue' : '—')}
          </span>
          {showDate && (
            <span className="text-[10px] text-[#8E8E93] leading-none">{appointment.date}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-[#1C1C1E] truncate">
              {appointment.patientName}
            </h3>
            {appointment.age !== undefined && appointment.age !== '' && (
              <span className="text-[11px] text-[#8E8E93]">({appointment.age}y)</span>
            )}
            {appointment.visitType && (
              <span className="px-1.5 py-0.2 bg-[#F2F2F7] text-[#1C1C1E] text-[10px] font-medium rounded">
                {appointment.visitType}
              </span>
            )}
            {appointment.phone && (
              <a
                href={`tel:${appointment.phone}`}
                className="text-[11px] text-[#007AFF] hover:underline inline-flex items-center gap-0.5"
                title="Call patient"
              >
                <Phone className="w-2.5 h-2.5" />
                <span>{appointment.phone}</span>
              </a>
            )}
          </div>

          {appointment.notes && (
            <p className="text-[11px] text-[#8E8E93] truncate mt-0.5 max-w-md">
              {appointment.notes}
            </p>
          )}
        </div>
      </div>

      {/* Right: Status badge & quick actions */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[#F2F2F7]">
        {/* Quick Done / Reopen Button */}
        {appointment.status === 'Waiting' ? (
          <button
            type="button"
            onClick={() => onStatusChange(appointment.id, 'Completed')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#34C759] bg-[#E4F9EC] hover:bg-[#34C759]/20 rounded-lg transition cursor-pointer min-h-[30px]"
            title="Mark Completed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        ) : appointment.status === 'Completed' ? (
          <button
            type="button"
            onClick={() => onStatusChange(appointment.id, 'Waiting')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#FF9500] bg-[#FFF9EB] hover:bg-[#FF9500]/20 rounded-lg transition cursor-pointer min-h-[30px]"
            title="Mark Waiting"
          >
            <Clock3 className="w-3.5 h-3.5" />
            <span>Reopen</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStatusChange(appointment.id, 'Waiting')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-lg transition cursor-pointer min-h-[30px]"
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
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-[#F2F2F7] py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(appointment.id, 'Waiting');
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left transition hover:bg-[#FFF9E6]/60 ${
                    appointment.status === 'Waiting' ? 'text-[#FFB000] bg-[#FFF9E6]' : 'text-[#1C1C1E]'
                  }`}
                >
                  <Clock3 className="w-3.5 h-3.5 text-[#FFB000]" />
                  Waiting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(appointment.id, 'Completed');
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left transition hover:bg-[#E1F7E6]/60 ${
                    appointment.status === 'Completed' ? 'text-[#34C759] bg-[#E1F7E6]' : 'text-[#1C1C1E]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(appointment.id, 'Cancelled');
                    setShowStatusMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left transition hover:bg-[#FFEBEA]/60 ${
                    appointment.status === 'Cancelled' ? 'text-[#FF3B30] bg-[#FFEBEA]' : 'text-[#1C1C1E]'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-[#FF3B30]" />
                  Cancelled
                </button>
              </div>
            </>
          )}
        </div>

        {/* Edit and Delete Actions */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(appointment)}
            className="p-1.5 text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#F2F2F7] rounded-lg transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(appointment.id, appointment.patientName)}
            className="p-1.5 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FFEBEA] rounded-lg transition cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
