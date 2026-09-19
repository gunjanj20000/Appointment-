import React, { useState, useRef } from 'react';
import { Appointment, ClinicSettings, Patient } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Settings,
  Building,
  User,
  Phone,
  MapPin,
  Database,
  Download,
  Upload,
  Trash2,
  Printer,
  Smartphone,
  CheckCircle2,
  Share2,
  HardDrive,
  ShieldCheck,
  Save,
  Globe,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { DEFAULT_TEMPLATES, renderMessageTemplate } from '../utils/messaging';
import { WhatsAppIcon } from './icons/WhatsAppIcon';


interface SettingsScreenProps {
  settings: ClinicSettings;
  appointments: Appointment[];
  patients: Patient[];
  onSaveSettings: (settings: ClinicSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonContent: string) => Promise<void>;
  onClearDatabase: () => void;
  onOpenPrint: (type: 'today' | 'upcoming' | 'patients') => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  appointments,
  patients,
  onSaveSettings,
  onExportBackup,
  onImportBackup,
  onClearDatabase,
  onOpenPrint,
}) => {
  const [formData, setFormData] = useState<ClinicSettings>(settings);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<
    'confirmation' | 'reminder' | 'queue' | 'cancellation'
  >('reminder');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleResetTemplates = () => {
    setFormData((prev) => ({
      ...prev,
      smsConfirmationTemplate: DEFAULT_TEMPLATES.confirmation,
      smsReminderTemplate: DEFAULT_TEMPLATES.reminder,
      smsQueueTemplate: DEFAULT_TEMPLATES.queue,
      smsCancelledTemplate: DEFAULT_TEMPLATES.cancellation,
    }));
    setSavedFeedback(false);
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    const key =
      activeTemplateTab === 'confirmation'
        ? 'smsConfirmationTemplate'
        : activeTemplateTab === 'reminder'
        ? 'smsReminderTemplate'
        : activeTemplateTab === 'queue'
        ? 'smsQueueTemplate'
        : 'smsCancelledTemplate';

    const currentVal = formData[key] ?? DEFAULT_TEMPLATES[activeTemplateTab];
    setFormData((prev) => ({
      ...prev,
      [key]: currentVal + ' ' + placeholder,
    }));
    setSavedFeedback(false);
  };

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (err) {
      console.error('Failed to update app cache', err);
    } finally {
      window.location.reload();
    }
  };

  const handleFormChange = (key: keyof ClinicSettings, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    setSavedFeedback(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await onImportBackup(text);
      setImportStatus('Backup restored successfully!');
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import backup.';
      setImportStatus(`Error: ${message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 overflow-hidden space-y-2.5">
      {/* Top Header Bar */}
      <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-[#F2F2F7] shadow-2xs shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-[#007AFF]" />
            <span className="text-sm font-bold text-[#1C1C1E]">Settings</span>
          </div>

          <button
            type="button"
            onClick={handleCheckUpdate}
            disabled={isCheckingUpdate}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 active:scale-95 disabled:opacity-60 rounded-lg transition cursor-pointer shrink-0"
            title="Check for app updates & apply newest code changes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>{isCheckingUpdate ? 'Updating...' : 'Update App'}</span>
          </button>

          {savedFeedback && (
            <span className="text-xs text-[#34C759] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-lg shadow-2xs transition cursor-pointer min-h-[32px]"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>


      {/* Settings Form & Sections in bounded scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
        {/* Clinic Letterhead Info */}
        <div className="bg-white rounded-xl p-3 border border-[#F2F2F7] shadow-2xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E] border-b border-[#F2F2F7] pb-1.5">
            <Building className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Clinic Details & Header</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] mb-0.5">Clinic Name</label>
              <input
                type="text"
                placeholder="e.g. City Central Medical Clinic"
                value={formData.clinicName}
                onChange={(e) => handleFormChange('clinicName', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] mb-0.5">Doctor / Physician</label>
              <input
                type="text"
                placeholder="e.g. Dr. Jordan Reed, MD"
                value={formData.doctorName}
                onChange={(e) => handleFormChange('doctorName', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] mb-0.5">Specialty / Department</label>
              <input
                type="text"
                placeholder="e.g. General Practice"
                value={formData.specialty}
                onChange={(e) => handleFormChange('specialty', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E93] mb-0.5">Phone Number</label>
              <input
                type="text"
                placeholder="e.g. +1 (555) 234-5678"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#8E8E93] mb-0.5">Address</label>
              <input
                type="text"
                placeholder="e.g. Suite 400, 120 Medical Boulevard"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
              />
            </div>
          </div>
        </div>

        {/* SMS & WhatsApp Messaging Settings */}
        <div className="bg-white rounded-xl p-3 border border-[#F2F2F7] shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F2F2F7] pb-1.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E]">
              <MessageSquare className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>SMS & WhatsApp Patient Messaging</span>
            </div>
            <button
              type="button"
              onClick={handleResetTemplates}
              className="text-[11px] font-semibold text-[#007AFF] hover:underline cursor-pointer"
            >
              Reset Templates to Default
            </button>
          </div>

          {/* Default Country Code */}
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label className="block text-[11px] font-semibold text-[#8E8E93]">
                Default Country Code (for WhatsApp numbers without country code)
              </label>
              <span className="text-[10px] text-[#8E8E93]">e.g. +1 (US/Canada), +91 (India), +44 (UK)</span>
            </div>
            <input
              type="text"
              placeholder="+1"
              value={formData.defaultCountryCode || '+1'}
              onChange={(e) => handleFormChange('defaultCountryCode', e.target.value)}
              className="w-full sm:w-48 px-2.5 py-1.5 text-xs rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E]"
            />
          </div>

          {/* Template Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="block text-[11px] font-semibold text-[#8E8E93]">
                Message Templates
              </label>
              <div className="flex items-center gap-1 bg-[#F2F2F7] p-0.5 rounded-lg">
                {(['reminder', 'confirmation', 'queue', 'cancellation'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTemplateTab(tab)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize transition cursor-pointer ${
                      activeTemplateTab === tab
                        ? 'bg-white text-[#007AFF] shadow-2xs font-bold'
                        : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                    }`}
                  >
                    {tab === 'queue' ? 'Queue Alert' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Textarea */}
            <textarea
              rows={5}
              value={
                activeTemplateTab === 'confirmation'
                  ? formData.smsConfirmationTemplate ?? DEFAULT_TEMPLATES.confirmation
                  : activeTemplateTab === 'reminder'
                  ? formData.smsReminderTemplate ?? DEFAULT_TEMPLATES.reminder
                  : activeTemplateTab === 'queue'
                  ? formData.smsQueueTemplate ?? DEFAULT_TEMPLATES.queue
                  : formData.smsCancelledTemplate ?? DEFAULT_TEMPLATES.cancellation
              }
              onChange={(e) => {
                const key =
                  activeTemplateTab === 'confirmation'
                    ? 'smsConfirmationTemplate'
                    : activeTemplateTab === 'reminder'
                    ? 'smsReminderTemplate'
                    : activeTemplateTab === 'queue'
                    ? 'smsQueueTemplate'
                    : 'smsCancelledTemplate';
                handleFormChange(key, e.target.value);
              }}
              className="w-full p-2.5 text-xs leading-relaxed rounded-lg border border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white outline-hidden text-[#1C1C1E] resize-y font-mono"
            />

            {/* Placeholders Tag Bar */}
            <div className="mt-1.5 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] text-[#8E8E93] mr-0.5">Click tag to insert:</span>
              {[
                '{patient_name}',
                '{date}',
                '{time}',
                '{queue}',
                '{doctor_name}',
                '{clinic_name}',
                '{clinic_phone}',
                '{address}',
                '{visit_type}',
              ].map((ph) => (
                <button
                  key={ph}
                  type="button"
                  onClick={() => handleInsertPlaceholder(ph)}
                  className="px-1.5 py-0.5 bg-[#F2F2F7] hover:bg-[#007AFF]/15 text-[#007AFF] text-[10px] font-mono rounded cursor-pointer transition"
                  title={`Insert ${ph}`}
                >
                  {ph}
                </button>
              ))}
            </div>

            {/* Live Rendered Preview */}
            <div className="mt-2.5 p-2.5 bg-[#F8F9FA] rounded-lg border border-[#F2F2F7]">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block mb-1">
                Sample Patient Message Preview:
              </span>
              <p className="text-[11px] text-[#1C1C1E] whitespace-pre-line leading-relaxed bg-white p-2 rounded border border-[#E5E5EA]">
                {renderMessageTemplate(
                  activeTemplateTab === 'confirmation'
                    ? formData.smsConfirmationTemplate ?? DEFAULT_TEMPLATES.confirmation
                    : activeTemplateTab === 'reminder'
                    ? formData.smsReminderTemplate ?? DEFAULT_TEMPLATES.reminder
                    : activeTemplateTab === 'queue'
                    ? formData.smsQueueTemplate ?? DEFAULT_TEMPLATES.queue
                    : formData.smsCancelledTemplate ?? DEFAULT_TEMPLATES.cancellation,
                  {
                    patientName: 'Eleanor Vance',
                    date: '2026-09-21',
                    time: '10:30',
                    queueNumber: '03',
                    visitType: 'General Consultation',
                  },
                  formData
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Print Reports Bar */}
        <div className="bg-white rounded-xl p-3 border border-[#F2F2F7] shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E]">
            <Printer className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Print Reports</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onOpenPrint('today')}
              className="py-2 px-2 text-center rounded-lg bg-[#F2F2F7] hover:bg-[#E5E5EA] text-xs font-medium text-[#1C1C1E] transition cursor-pointer min-h-[32px]"
            >
              Today's Roster
            </button>
            <button
              type="button"
              onClick={() => onOpenPrint('upcoming')}
              className="py-2 px-2 text-center rounded-lg bg-[#F2F2F7] hover:bg-[#E5E5EA] text-xs font-medium text-[#1C1C1E] transition cursor-pointer min-h-[32px]"
            >
              Schedule
            </button>
            <button
              type="button"
              onClick={() => onOpenPrint('patients')}
              className="py-2 px-2 text-center rounded-lg bg-[#F2F2F7] hover:bg-[#E5E5EA] text-xs font-medium text-[#1C1C1E] transition cursor-pointer min-h-[32px]"
            >
              Patients
            </button>
          </div>
        </div>

        {/* Database & Backup */}
        <div className="bg-white rounded-xl p-3 border border-[#F2F2F7] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E]">
              <Database className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>Data & Backup (IndexedDB)</span>
            </div>
            <span className="text-[11px] text-[#8E8E93]">
              {appointments.length} apts • {patients.length} patients
            </span>
          </div>

          {importStatus && (
            <div className="p-2 bg-[#007AFF]/10 text-[#007AFF] rounded-lg text-xs font-medium">
              {importStatus}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-xs font-medium rounded-lg transition cursor-pointer min-h-[32px]"
            >
              <Download className="w-3.5 h-3.5 text-[#8E8E93]" />
              <span>Export JSON</span>
            </button>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-xs font-medium rounded-lg transition cursor-pointer min-h-[32px]"
            >
              <Upload className="w-3.5 h-3.5 text-[#8E8E93]" />
              <span>Import JSON</span>
            </button>

            <button
              type="button"
              onClick={onClearDatabase}
              className="ml-auto px-3 py-1.5 text-xs font-medium text-[#FF3B30] hover:bg-[#FFEBEA] rounded-lg transition cursor-pointer min-h-[32px]"
            >
              Reset Database
            </button>
          </div>
        </div>

        {/* PWA Install Notice if available */}
        {isInstallable && (
          <div className="bg-white rounded-xl p-3 border border-[#F2F2F7] shadow-2xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#1C1C1E]">
              <Smartphone className="w-3.5 h-3.5 text-[#007AFF]" />
              <span className="font-semibold">Install App to Home Screen</span>
            </div>
            <button
              type="button"
              onClick={install}
              className="px-3 py-1 bg-[#007AFF] hover:bg-[#0066D6] text-white text-xs font-semibold rounded-lg shadow-2xs transition min-h-[28px]"
            >
              Install
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
