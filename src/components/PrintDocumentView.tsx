import React from 'react';
import { Appointment, ClinicSettings, Patient, PrintType } from '../types';
import { formatFriendlyDate, formatTimeDisplay } from '../utils/date';
import { Printer, Share2, X, FileText } from 'lucide-react';

interface PrintDocumentViewProps {
  isOpen: boolean;
  type: PrintType;
  appointments?: Appointment[];
  patients?: Patient[];
  settings?: ClinicSettings;
  selectedDate?: string;
  selectedPatient?: Patient | null;
  onClose: () => void;
}

export const PrintDocumentView: React.FC<PrintDocumentViewProps> = ({
  isOpen,
  type = 'today',
  appointments = [],
  patients = [],
  settings = {
    id: 'clinic_settings',
    clinicName: 'Medical Clinic',
    doctorName: 'Attending Physician',
    specialty: 'General Practice',
    phone: '',
    address: '',
    printFooterNote: 'CONFIDENTIAL MEDICAL RECORD • FOR OFFICIAL USE ONLY',
  },
  selectedDate = '',
  selectedPatient = null,
  onClose,
}) => {
  if (!isOpen) return null;

  const safeAppts = Array.isArray(appointments) ? appointments : [];
  const safePats = Array.isArray(patients) ? patients : [];
  const safeSettings = settings || {
    clinicName: 'Medical Clinic',
    doctorName: 'Attending Physician',
    specialty: '',
    phone: '',
    address: '',
    printFooterNote: '',
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Failed to trigger window.print()', err);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        let textSummary = `${safeSettings.clinicName || 'Medical Clinic'}\n`;
        if (type === 'today') {
          textSummary += `Today's Appointments (${safeAppts.length} Total)\n\n`;
          safeAppts.forEach((a) => {
            textSummary += `#${a.queueNumber || '-'} ${a.patientName || 'Patient'} (${a.time || 'No time'}) - Status: ${a.status}\n`;
          });
        } else if (type === 'upcoming') {
          textSummary += `Upcoming Appointments (${safeAppts.length} Total)\n\n`;
          safeAppts.forEach((a) => {
            textSummary += `${a.date}: ${a.patientName || 'Patient'} (${a.time || 'No time'}) [${a.status}]\n`;
          });
        } else if (type === 'patient-history') {
          textSummary += `Medical History - ${selectedPatient?.name || 'Patient'}\n\n`;
          safeAppts.forEach((a) => {
            textSummary += `${a.date}: ${a.visitType || 'Visit'} (${a.status}) - ${a.notes || 'No notes'}\n`;
          });
        } else {
          textSummary += `Patient Directory (${safePats.length} Registered Patients)\n\n`;
          safePats.forEach((p) => {
            textSummary += `${p.name || 'Patient'} - Phone: ${p.phone || 'N/A'}\n`;
          });
        }

        await navigator.share({
          title: `${safeSettings.clinicName || 'Medical Organizer'} - Report`,
          text: textSummary,
        });
      } catch {
        // User cancelled share or error
      }
    } else {
      handlePrint();
    }
  };

  const getDocTitle = () => {
    switch (type) {
      case 'today':
        return `Clinic Queue & Appointment Roster — ${formatFriendlyDate(selectedDate || '')}`;
      case 'upcoming':
        return 'Upcoming Appointments Schedule';
      case 'patients':
        return 'Master Patient Directory';
      case 'patient-history':
        return `Patient Medical History — ${selectedPatient?.name || 'Patient Record'}`;
      default:
        return 'Medical Clinic Report';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col justify-start items-center p-2 sm:p-6 overflow-y-auto print-modal-container">
      {/* Top action header (hidden during printing via .no-print) */}
      <div className="no-print w-full max-w-4xl mb-4 bg-white rounded-2xl px-5 py-3.5 shadow-xl border border-[#F2F2F7] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#007AFF]" />
          <h2 className="text-sm sm:text-base font-bold text-[#1C1C1E]">Print / Export Document</h2>
        </div>

        <div className="flex items-center gap-2">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-xl transition cursor-pointer min-h-[44px]"
            >
              <Share2 className="w-4 h-4 text-[#8E8E93]" />
              <span>Share</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-xl shadow-xs transition cursor-pointer min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-xl transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Close Preview"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 / Letter styling) */}
      <div className="printable-document w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 sm:p-10 border border-[#E5E5EA] text-[#1C1C1E] my-auto">
        {/* Clinic Header */}
        <div className="border-b-2 border-[#1C1C1E] pb-6 mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1C1C1E]">
              {safeSettings.clinicName || 'Medical Clinic'}
            </h1>
            <p className="text-sm font-semibold text-[#007AFF] mt-0.5">
              {safeSettings.doctorName || 'Attending Physician'}
              {safeSettings.specialty ? ` • ${safeSettings.specialty}` : ''}
            </p>
            {(safeSettings.phone || safeSettings.address) && (
              <p className="text-xs text-[#8E8E93] mt-1">
                {safeSettings.phone ? `Phone: ${safeSettings.phone} ` : ''}
                {safeSettings.address ? `• ${safeSettings.address}` : ''}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block px-2.5 py-1 bg-[#F2F2F7] text-[#1C1C1E] text-xs font-semibold rounded uppercase tracking-wider">
              Official Medical Report
            </span>
            <p className="text-xs text-[#8E8E93] mt-1.5">
              Generated on: {new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>

          </div>
        </div>

        {/* Report Subheader */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1C1E]">{getDocTitle()}</h2>
            {type === 'patient-history' && selectedPatient ? (
              <p className="text-xs text-[#8E8E93] mt-0.5">
                {selectedPatient.age ? `Age: ${selectedPatient.age} yrs • ` : ''}
                {selectedPatient.phone ? `Phone: ${selectedPatient.phone} • ` : ''}
                Total Visits: {safeAppts.length}
              </p>
            ) : (
              <p className="text-xs text-[#8E8E93]">
                {type === 'patients'
                  ? `Total Registered Patients: ${safePats.length}`
                  : `Total Appointments: ${safeAppts.length}`}
              </p>
            )}
          </div>
        </div>

        {/* Data Tables */}
        {type === 'today' || type === 'upcoming' || type === 'patient-history' ? (
          <div>
            {safeAppts.length === 0 ? (
              <div className="p-8 text-center text-[#8E8E93] border border-dashed border-[#E5E5EA] rounded-xl">
                No appointment records found for this report.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#E5E5EA] bg-[#F2F2F7]">
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">
                        {type === 'today' ? 'Queue' : '#'}
                      </th>
                      {(type === 'upcoming' || type === 'patient-history') && (
                        <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Date</th>
                      )}
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Time</th>
                      {type !== 'patient-history' && (
                        <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Patient Name</th>
                      )}
                      {type !== 'patient-history' && (
                        <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Age / Phone</th>
                      )}
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Visit Type</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Clinical Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA]">
                    {safeAppts.map((a, idx) => (
                      <tr key={a.id || idx} className="print-break-inside-avoid hover:bg-[#F2F2F7]/50">
                        <td className="py-2.5 px-3 font-bold text-[#1C1C1E]">
                          {a.queueNumber ? `#${a.queueNumber}` : String(idx + 1).padStart(2, '0')}
                        </td>
                        {(type === 'upcoming' || type === 'patient-history') && (
                          <td className="py-2.5 px-3 font-medium text-[#1C1C1E] whitespace-nowrap">
                            {formatFriendlyDate(a.date || '')}
                          </td>
                        )}
                        <td className="py-2.5 px-3 font-medium text-[#1C1C1E] whitespace-nowrap">
                          {a.time ? formatTimeDisplay(a.time) : '—'}
                        </td>
                        {type !== 'patient-history' && (
                          <td className="py-2.5 px-3 font-bold text-[#1C1C1E]">
                            {a.patientName || 'Unnamed Patient'}
                          </td>
                        )}
                        {type !== 'patient-history' && (
                          <td className="py-2.5 px-3 text-[#8E8E93]">
                            {a.age ? `${a.age}y` : ''} {a.phone ? `(${a.phone})` : ''}
                            {!a.age && !a.phone && '—'}
                          </td>
                        )}
                        <td className="py-2.5 px-3 text-[#1C1C1E]">
                          {a.visitType || 'General'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              a.status === 'Completed'
                                ? 'bg-[#E4F9EC] text-[#34C759]'
                                : a.status === 'Cancelled'
                                ? 'bg-[#FFEBEA] text-[#FF3B30]'
                                : 'bg-[#FFF9EB] text-[#FF9500]'
                            }`}
                          >
                            {a.status || 'Waiting'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#8E8E93] max-w-xs">
                          {a.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Patients Directory */
          <div>
            {safePats.length === 0 ? (
              <div className="p-8 text-center text-[#8E8E93] border border-dashed border-[#E5E5EA] rounded-xl">
                No patient records in database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#E5E5EA] bg-[#F2F2F7]">
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">#</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Patient Name</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Age</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Phone Number</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Registered On</th>
                      <th className="py-2.5 px-3 font-semibold text-[#1C1C1E]">Clinical Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA]">
                    {safePats.map((p, idx) => (
                      <tr key={p.id || idx} className="print-break-inside-avoid hover:bg-[#F2F2F7]/50">
                        <td className="py-2.5 px-3 font-medium text-[#8E8E93]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1C1C1E]">{p.name || 'Unnamed'}</td>
                        <td className="py-2.5 px-3 text-[#1C1C1E]">{p.age ? `${p.age} yrs` : '—'}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1C1C1E]">{p.phone || '—'}</td>
                        <td className="py-2.5 px-3 text-[#8E8E93] whitespace-nowrap">
                          {p.createdAt && !isNaN(new Date(p.createdAt).getTime())
                            ? new Date(p.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-[#8E8E93] max-w-sm truncate">{p.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#E5E5EA] text-center text-xs text-[#8E8E93]">
          <p>{safeSettings.printFooterNote || 'CONFIDENTIAL MEDICAL RECORD • FOR AUTHORIZED CLINICAL USE ONLY'}</p>
        </div>
      </div>
    </div>
  );
};
