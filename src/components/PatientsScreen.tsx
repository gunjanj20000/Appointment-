import React, { useState, useMemo } from 'react';
import { Appointment, Patient, PrintType } from '../types';
import { formatFriendlyDate, formatTimeDisplay } from '../utils/date';
import {
  Users,
  Search,
  Printer,
  Plus,
  Phone,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock3,
  XCircle,
  X,
  UserPlus
} from 'lucide-react';

interface PatientsScreenProps {
  patients: Patient[];
  appointments: Appointment[];
  onBookAppointment: (patient: Patient) => void;
  onSavePatient: (patient: Patient) => void;
  onDeletePatient: (id: string, name: string) => void;
  onOpenPrint: (type: PrintType, patient?: Patient) => void;
}


export const PatientsScreen: React.FC<PatientsScreenProps> = ({
  patients,
  appointments,
  onBookAppointment,
  onSavePatient,
  onDeletePatient,
  onOpenPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientModalData, setPatientModalData] = useState<Partial<Patient>>({});

  // Filtered patients
  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
    );
  }, [patients, searchQuery]);

  // Appointments for the selected patient
  const selectedPatientAppointments = useMemo(() => {
    if (!selectedPatientForHistory) return [];
    return appointments
      .filter((a) => a.patientName.trim().toLowerCase() === selectedPatientForHistory.name.trim().toLowerCase())
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, selectedPatientForHistory]);

  const handleOpenAddPatient = () => {
    setPatientModalData({
      name: '',
      phone: '',
      age: '',
      notes: '',
    });
    setIsEditingPatient(true);
  };

  const handleOpenEditPatient = (p: Patient) => {
    setPatientModalData(p);
    setIsEditingPatient(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientModalData.name?.trim()) return;

    const patientRecord: Patient = {
      id: patientModalData.id || 'pat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: patientModalData.name.trim(),
      phone: patientModalData.phone?.trim() || undefined,
      age: patientModalData.age ? Number(patientModalData.age) : undefined,
      notes: patientModalData.notes?.trim() || undefined,
      createdAt: patientModalData.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSavePatient(patientRecord);
    setIsEditingPatient(false);
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Compact Top Control Bar */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-[#F2F2F7] shadow-2xs shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Title & Count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#1C1C1E]">
            Patients ({patients.length})
          </span>
        </div>

        {/* Right: Search + Print + Add */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-6 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:bg-white focus:border-[#007AFF] focus:outline-hidden transition text-[#1C1C1E]"
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
            onClick={() => onOpenPrint('patients')}
            disabled={patients.length === 0}
            className="p-1.5 text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] disabled:opacity-30 disabled:pointer-events-none rounded-lg transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center shrink-0"
            title="Print directory"
          >
            <Printer className="w-3.5 h-3.5 text-[#8E8E93]" />
          </button>

          <button
            type="button"
            onClick={handleOpenAddPatient}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px] shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Patients List - Scrollable within bounded container */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((p) => {
            const patientAppts = appointments.filter(
              (a) => a.patientName.trim().toLowerCase() === p.name.trim().toLowerCase()
            );
            const totalVisits = patientAppts.length;

            return (
              <div
                key={p.id}
                className="px-3 py-2 sm:py-2.5 bg-white rounded-xl border border-[#F2F2F7] shadow-2xs hover:border-[#007AFF]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                {/* Left: Patient info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#007AFF]/10 text-[#007AFF] font-bold text-xs flex items-center justify-center shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#1C1C1E] truncate">
                        {p.name}
                      </h3>
                      {p.age !== undefined && p.age !== '' && (
                        <span className="text-[11px] text-[#8E8E93]">({p.age}y)</span>
                      )}
                      <span className="px-1.5 py-0.2 bg-[#F2F2F7] text-[#1C1C1E] text-[10px] font-medium rounded">
                        {totalVisits} {totalVisits === 1 ? 'visit' : 'visits'}
                      </span>
                      {p.phone && (
                        <a
                          href={`tel:${p.phone}`}
                          className="text-[11px] text-[#007AFF] hover:underline inline-flex items-center gap-0.5"
                          title="Call patient"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{p.phone}</span>
                        </a>
                      )}
                    </div>

                    {p.notes && (
                      <p className="text-[11px] text-[#8E8E93] truncate mt-0.5 max-w-md">
                        {p.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[#F2F2F7]">
                  <button
                    type="button"
                    onClick={() => setSelectedPatientForHistory(p)}
                    className="px-2 py-1 text-[11px] font-semibold text-[#8E8E93] hover:text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-lg transition min-h-[30px]"
                  >
                    History ({totalVisits})
                  </button>

                  <button
                    type="button"
                    onClick={() => onBookAppointment(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold rounded-lg shadow-2xs transition min-h-[30px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </button>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPatient(p)}
                      className="p-1.5 text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#F2F2F7] rounded-lg transition min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Edit Patient"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePatient(p.id, p.name)}
                      className="p-1.5 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FFEBEA] rounded-lg transition min-h-[30px] min-w-[30px] flex items-center justify-center"
                      title="Delete Patient"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full min-h-[200px] bg-white rounded-xl p-6 text-center border border-dashed border-[#E5E5EA] flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mb-2">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1C1E]">No Patients Found</h3>
            <p className="text-xs text-[#8E8E93] mt-0.5 max-w-xs">
              {searchQuery ? 'No patients matched your search query.' : 'Your directory is currently empty.'}
            </p>
            <button
              type="button"
              onClick={handleOpenAddPatient}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          </div>
        )}
      </div>

      {/* Patient History Modal */}
      {selectedPatientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs no-print">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#F2F2F7] flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#F2F2F7] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1C1C1E]">
                  {selectedPatientForHistory.name}
                </h3>
                <p className="text-xs text-[#8E8E93]">
                  {selectedPatientForHistory.age ? `${selectedPatientForHistory.age} yrs • ` : ''}
                  {selectedPatientForHistory.phone || 'No phone recorded'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenPrint('patient-history', selectedPatientForHistory)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-xl transition cursor-pointer"
                  title="Print Patient Medical History"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print History</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPatientForHistory(null)}
                  className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] rounded-xl"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                Appointment History ({selectedPatientAppointments.length})
              </h4>

              {selectedPatientAppointments.length > 0 ? (
                selectedPatientAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-2xl border border-[#F2F2F7] bg-[#F2F2F7]/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C1C1E]">
                        {formatFriendlyDate(apt.date)}
                        {apt.time ? ` at ${formatTimeDisplay(apt.time)}` : ''}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.status === 'Completed'
                            ? 'bg-[#E4F9EC] text-[#34C759]'
                            : apt.status === 'Cancelled'
                            ? 'bg-[#FFEBEA] text-[#FF3B30]'
                            : 'bg-[#FFF6E5] text-[#FFB000]'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#8E8E93] flex items-center gap-2">
                      {apt.queueNumber && <span>Queue #{apt.queueNumber}</span>}
                      {apt.visitType && <span>• {apt.visitType}</span>}
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-[#1C1C1E] bg-white p-2 rounded-xl border border-[#F2F2F7]">
                        {apt.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8E8E93] italic">No appointment history for this patient.</p>
              )}
            </div>

            <div className="p-4 border-t border-[#F2F2F7] flex items-center justify-end gap-2 bg-[#F2F2F7]/40 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  const p = selectedPatientForHistory;
                  setSelectedPatientForHistory(null);
                  onBookAppointment(p);
                }}
                className="px-4 py-2.5 bg-[#007AFF] hover:bg-[#0066D6] text-white font-semibold text-xs rounded-xl shadow-xs min-h-[44px]"
              >
                + New Appointment For Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {isEditingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs no-print">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#F2F2F7]">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2F2F7]">
              <h3 className="text-lg font-bold text-[#1C1C1E]">
                {patientModalData.id ? 'Edit Patient Record' : 'Register New Patient'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingPatient(false)}
                className="p-1 text-[#8E8E93] hover:text-[#1C1C1E] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  Full Name <span className="text-[#FF3B30]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={patientModalData.name || ''}
                  onChange={(e) => setPatientModalData({ ...patientModalData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 555-0192"
                    value={patientModalData.phone || ''}
                    onChange={(e) => setPatientModalData({ ...patientModalData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">Age</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 42"
                    value={patientModalData.age !== undefined ? String(patientModalData.age) : ''}
                    onChange={(e) => setPatientModalData({ ...patientModalData, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">General Medical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Allergies, chronic conditions, blood group, emergency contact..."
                  value={patientModalData.notes || ''}
                  onChange={(e) => setPatientModalData({ ...patientModalData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden resize-none text-[#1C1C1E]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPatient(false)}
                  className="px-4 py-2.5 text-xs font-medium text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] rounded-xl min-h-[44px]"
                >
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
