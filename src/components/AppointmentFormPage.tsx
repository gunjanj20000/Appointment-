import React, { useState, useEffect } from 'react';
import { Appointment, AppointmentStatus, Patient } from '../types';
import { getTodayDateString } from '../utils/date';
import {
  X,
  Check,
  Calendar,
  Clock,
  User,
  Phone,
  Hash,
  Stethoscope,
  Timer,
  FileText,
  Trash2,
  Sparkles,
  ChevronDown,
  MessageSquare
} from 'lucide-react';

interface AppointmentFormPageProps {
  isOpen: boolean;
  appointmentToEdit: Appointment | null;
  initialPatientName?: string;
  initialPhone?: string;
  initialDate?: string;
  defaultCountryCode?: string;
  existingAppointments: Appointment[];
  existingPatients: Patient[];
  onSave: (appointment: Appointment, notifyAfterSave?: boolean) => void;
  onCancel: () => void;
  onDelete?: (id: string, patientName: string) => void;
}

const VISIT_TYPES = [
  'General Checkup',
  'Consultation',
  'Follow-up',
  'Prescription Refill',
  'Emergency',
  'Procedure',
  'Lab Review',
  'Vaccination',
  'Other',
];

const DURATIONS = ['15 min', '30 min', '45 min', '60 min'];

export const AppointmentFormPage: React.FC<AppointmentFormPageProps> = ({
  isOpen,
  appointmentToEdit,
  initialPatientName = '',
  initialPhone = '',
  initialDate = '',
  defaultCountryCode = '+91',
  existingAppointments,
  existingPatients,
  onSave,
  onCancel,
  onDelete,
}) => {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState<string>('');
  const [time, setTime] = useState('');
  const [queueNumber, setQueueNumber] = useState('');
  const [visitType, setVisitType] = useState('General Checkup');
  const [customVisitType, setCustomVisitType] = useState('');
  const [duration, setDuration] = useState('30 min');
  const [status, setStatus] = useState<AppointmentStatus>('Waiting');
  const [notes, setNotes] = useState('');

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState<Patient[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<{ patientName?: string; date?: string }>({});

  // Populate when opened
  useEffect(() => {
    if (!isOpen) return;

    if (appointmentToEdit) {
      setPatientName(appointmentToEdit.patientName);
      setDate(appointmentToEdit.date);
      setPhone(appointmentToEdit.phone || '');
      setAge(appointmentToEdit.age !== undefined ? String(appointmentToEdit.age) : '');
      setTime(appointmentToEdit.time || '');
      setQueueNumber(appointmentToEdit.queueNumber || '');
      if (appointmentToEdit.visitType) {
        if (VISIT_TYPES.includes(appointmentToEdit.visitType)) {
          setVisitType(appointmentToEdit.visitType);
          setCustomVisitType('');
        } else {
          setVisitType('Other');
          setCustomVisitType(appointmentToEdit.visitType);
        }
      } else {
        setVisitType('');
      }
      setDuration(appointmentToEdit.duration || '30 min');
      setStatus(appointmentToEdit.status);
      setNotes(appointmentToEdit.notes || '');
    } else {
      // New Appointment
      setPatientName(initialPatientName);
      setDate(initialDate || getTodayDateString());
      setPhone(initialPhone);
      setAge('');
      setTime('');
      setDuration('30 min');
      setVisitType('General Checkup');
      setCustomVisitType('');
      setStatus('Waiting');
      setNotes('');

      // Auto-suggest next available queue number for this date
      const targetDate = initialDate || getTodayDateString();
      const countForDate = existingAppointments.filter((a) => a.date === targetDate).length;
      setQueueNumber(String(countForDate + 1).padStart(2, '0'));
    }
    setErrors({});
  }, [isOpen, appointmentToEdit, initialPatientName, initialPhone, initialDate, existingAppointments]);

  // Handle patient name changes and auto-suggestions
  const handleNameChange = (val: string) => {
    setPatientName(val);
    if (errors.patientName) setErrors((prev) => ({ ...prev, patientName: undefined }));

    if (val.trim().length > 0) {
      const filtered = existingPatients.filter((p) =>
        p.name.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setPatientName(patient.name);
    if (patient.phone) setPhone(patient.phone);
    if (patient.age !== undefined && patient.age !== '') setAge(String(patient.age));
    setShowSuggestions(false);
  };

  // Quick auto queue calculation
  const handleAutoSuggestQueue = () => {
    const apptsOnDate = existingAppointments.filter(
      (a) => a.date === date && (!appointmentToEdit || a.id !== appointmentToEdit.id)
    );
    const existingNums = apptsOnDate
      .map((a) => parseInt(a.queueNumber || '0', 10))
      .filter((n) => !isNaN(n) && n > 0);

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    setQueueNumber(String(maxNum + 1).padStart(2, '0'));
  };

  const handleSubmit = (e?: React.FormEvent, notifyAfterSave: boolean = false) => {
    if (e) e.preventDefault();

    const newErrors: { patientName?: string; date?: string } = {};
    if (!patientName.trim()) {
      newErrors.patientName = 'Patient Name is required.';
    }
    if (!date.trim()) {
      newErrors.date = 'Appointment Date is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalVisitType = visitType === 'Other' && customVisitType.trim() ? customVisitType.trim() : visitType;

    const record: Appointment = {
      id: appointmentToEdit ? appointmentToEdit.id : 'apt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      patientName: patientName.trim(),
      date,
      time: time.trim() || undefined,
      phone: phone.trim() || undefined,
      age: age ? Number(age) : undefined,
      queueNumber: queueNumber.trim() || undefined,
      visitType: finalVisitType || undefined,
      duration: duration || undefined,
      status,
      notes: notes.trim() || undefined,
      createdAt: appointmentToEdit ? appointmentToEdit.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(record, notifyAfterSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F2F5] dark:bg-[#0D1117] flex flex-col overflow-hidden text-[#1C1C1E] dark:text-[#F3F4F6] animate-in fade-in duration-150 no-print">
      {/* Top Bar Header */}
      <header className="bg-white dark:bg-[#141822] border-b border-[#F2F2F7] dark:border-slate-800 pt-safe px-3 py-2 shrink-0 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#8E8E93] dark:text-slate-300 hover:text-[#1C1C1E] dark:hover:text-white bg-[#F2F2F7] dark:bg-slate-800 hover:bg-[#E5E5EA] dark:hover:bg-slate-700 rounded-lg transition cursor-pointer min-h-[32px]"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <h1 className="text-sm font-bold text-[#1C1C1E] dark:text-white text-center truncate">
            {appointmentToEdit ? 'Edit Appointment' : 'New Appointment'}
          </h1>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#007AFF] dark:text-[#3898FF] bg-[#007AFF]/10 dark:bg-[#007AFF]/20 hover:bg-[#007AFF]/20 active:scale-95 rounded-lg transition cursor-pointer min-h-[32px]"
              title="Save appointment and send SMS or WhatsApp message to patient"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save & Notify</span>
              <span className="sm:hidden">Notify</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Form Body - Compact & Fits in Viewport */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-2.5">
          {/* Main Form Card */}
          <div className="bg-white dark:bg-[#181C26] rounded-xl p-3 sm:p-4 border border-[#F2F2F7] dark:border-slate-800 shadow-2xs space-y-2.5">
            {/* Row 1: Patient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Patient Name (REQUIRED) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="patientName" className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200">
                    Patient Name <span className="text-[#FF3B30]">*</span>
                  </label>
                  <span className="text-[10px] text-[#8E8E93] dark:text-slate-400">Required</span>
                </div>
                <input
                  id="patientName"
                  type="text"
                  required
                  autoFocus={!appointmentToEdit}
                  placeholder="e.g. Eleanor Vance"
                  value={patientName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border transition outline-hidden text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] dark:placeholder-slate-500 ${
                    errors.patientName
                      ? 'border-[#FF3B30] bg-[#FFEBEA]/40 dark:bg-rose-950/30 focus:border-[#FF3B30]'
                      : 'border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B]'
                  }`}
                />
                {errors.patientName && (
                  <p className="mt-0.5 text-[10px] font-medium text-[#FF3B30] dark:text-rose-400">{errors.patientName}</p>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1E2330] border border-[#F2F2F7] dark:border-slate-800 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto">
                    {suggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPatient(p)}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#007AFF]/10 flex items-center justify-between transition text-xs text-[#1C1C1E] dark:text-white border-b border-[#F2F2F7] dark:border-slate-800 last:border-0"
                      >
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-[10px] text-[#8E8E93] dark:text-slate-400">
                          {p.phone || (p.age ? `${p.age} yrs` : '')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="phone" className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200">
                    Phone Number
                  </label>
                  <span className="text-[10px] text-[#8E8E93] dark:text-slate-400">Default: {defaultCountryCode}</span>
                </div>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    placeholder={`e.g. 98765 43210 or ${defaultCountryCode}...`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] dark:placeholder-slate-500"
                  />
                  <Phone className="w-3 h-3 text-[#8E8E93] dark:text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Date, Time & Queue Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Date (REQUIRED) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="date" className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200">
                    Date <span className="text-[#FF3B30]">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDate(getTodayDateString())}
                      className="text-[10px] text-[#007AFF] dark:text-[#3898FF] hover:underline"
                    >
                      Today
                    </button>
                  </div>
                </div>
                <input
                  id="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border transition outline-hidden text-[#1C1C1E] dark:text-white ${
                    errors.date
                      ? 'border-[#FF3B30] bg-[#FFEBEA]/40 dark:bg-rose-950/30'
                      : 'border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B]'
                  }`}
                />
              </div>

              {/* Time */}
              <div>
                <label htmlFor="time" className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200 mb-0.5">
                  Time
                </label>
                <div className="relative">
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition text-[#1C1C1E] dark:text-white"
                  />
                  <Clock className="w-3 h-3 text-[#8E8E93] dark:text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Queue Number */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label htmlFor="queueNumber" className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200">
                    Queue #
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestQueue}
                    className="text-[10px] text-[#007AFF] dark:text-[#3898FF] hover:underline"
                  >
                    Next #
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="queueNumber"
                    type="text"
                    placeholder="e.g. 01"
                    value={queueNumber}
                    onChange={(e) => setQueueNumber(e.target.value)}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition text-[#1C1C1E] dark:text-white placeholder-[#8E8E93] dark:placeholder-slate-500"
                  />
                  <Hash className="w-3 h-3 text-[#8E8E93] dark:text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: Age, Visit Type, Duration & Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200 mb-0.5">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  max="125"
                  placeholder="e.g. 42"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition text-[#1C1C1E] dark:text-white"
                />
              </div>

              {/* Visit Type */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200 mb-0.5">
                  Visit Type
                </label>
                <select
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition cursor-pointer text-[#1C1C1E] dark:text-white"
                >
                  <option value="">-- Select --</option>
                  {VISIT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {visitType === 'Other' && (
                  <input
                    type="text"
                    placeholder="Custom type"
                    value={customVisitType}
                    onChange={(e) => setCustomVisitType(e.target.value)}
                    className="mt-1 w-full px-2 py-1 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] outline-hidden text-[#1C1C1E] dark:text-white"
                  />
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200 mb-0.5">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition cursor-pointer text-[#1C1C1E] dark:text-white"
                >
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200 mb-0.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition cursor-pointer font-semibold text-[#1C1C1E] dark:text-white"
                >
                  <option value="Waiting">Waiting</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Row 4: Notes */}
            <div>
              <label htmlFor="notes" className="block text-xs font-semibold text-[#1C1C1E] dark:text-slate-200 mb-0.5">
                Notes & Symptoms
              </label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Chief complaint, prescribed notes, allergy reminders..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] dark:border-slate-700 bg-[#F2F2F7] dark:bg-[#212632] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1B202B] outline-hidden transition resize-y text-[#1C1C1E] dark:text-white"
              />
            </div>
          </div>

          {/* Delete Action if editing */}
          {appointmentToEdit && onDelete && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => onDelete(appointmentToEdit.id, appointmentToEdit.patientName)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#FF3B30] dark:text-rose-400 hover:bg-[#FFEBEA] dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer min-h-[32px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Appointment</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
