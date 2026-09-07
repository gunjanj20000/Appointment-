import React, { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus, ClinicSettings, Patient, ScreenTab, PrintType } from './types';
import { dbService } from './services/db';
import { Navigation } from './components/Navigation';
import { TodayScreen } from './components/TodayScreen';
import { UpcomingScreen } from './components/UpcomingScreen';
import { PatientsScreen } from './components/PatientsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AppointmentFormPage } from './components/AppointmentFormPage';
import { PrintDocumentView } from './components/PrintDocumentView';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getTodayDateString } from './utils/date';
import { CheckCircle2 } from 'lucide-react';


export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('today');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [settings, setSettings] = useState<ClinicSettings>({
    id: 'clinic_settings',
    clinicName: 'Medical Clinic',
    doctorName: 'Attending Physician',
    specialty: 'General Practice',
    phone: '',
    address: '',
    printFooterNote: 'CONFIDENTIAL MEDICAL RECORD • FOR OFFICIAL USE ONLY',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Full-Screen Appointment Form State (NOT a popup)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [formInitialPatient, setFormInitialPatient] = useState<{ name: string; phone: string }>({
    name: '',
    phone: '',
  });
  const [formInitialDate, setFormInitialDate] = useState<string>('');

  // Print Document View State
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printType, setPrintType] = useState<PrintType>('today');
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    type: 'appointment' | 'patient' | 'clearDb';
  }>({
    isOpen: false,
    id: '',
    name: '',
    type: 'appointment',
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3000);
  };

  // Load from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      const [appts, pats, sett] = await Promise.all([
        dbService.getAllAppointments(),
        dbService.getAllPatients(),
        dbService.getSettings(),
      ]);
      setAppointments(appts);
      setPatients(pats);
      setSettings(sett);
    } catch (err) {
      console.error('Failed to load from IndexedDB', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Appointment Actions
  const handleOpenNewAppointment = (prefilledDate?: string) => {
    setAppointmentToEdit(null);
    setFormInitialPatient({ name: '', phone: '' });
    setFormInitialDate(prefilledDate || getTodayDateString());
    setIsFormOpen(true);
  };

  const handleOpenEditAppointment = (appointment: Appointment) => {
    setAppointmentToEdit(appointment);
    setFormInitialPatient({ name: '', phone: '' });
    setFormInitialDate(appointment.date);
    setIsFormOpen(true);
  };

  const handleBookForPatient = (patient: Patient) => {
    setAppointmentToEdit(null);
    setFormInitialPatient({ name: patient.name, phone: patient.phone || '' });
    setFormInitialDate(getTodayDateString());
    setIsFormOpen(true);
  };

  const handleSaveAppointment = async (appointment: Appointment) => {
    try {
      await dbService.saveAppointment(appointment);
      await refreshData();
      setIsFormOpen(false);
      showToast(
        appointmentToEdit ? 'Appointment updated successfully.' : 'New appointment created in queue.'
      );
    } catch (err) {
      console.error('Error saving appointment', err);
      showToast('Error saving appointment.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      await dbService.updateAppointmentStatus(id, newStatus);
      await refreshData();
      showToast(`Status marked as ${newStatus}.`);
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDeleteAppointmentRequest = (id: string, patientName: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name: patientName,
      type: 'appointment',
    });
  };

  // Patient Actions
  const handleSavePatient = async (patient: Patient) => {
    try {
      await dbService.savePatient(patient);
      await refreshData();
      showToast('Patient record saved.');
    } catch (err) {
      console.error('Error saving patient', err);
    }
  };

  const handleDeletePatientRequest = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
      type: 'patient',
    });
  };

  // Confirm Deletions
  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === 'appointment') {
        await dbService.deleteAppointment(deleteModal.id);
        if (isFormOpen && appointmentToEdit?.id === deleteModal.id) {
          setIsFormOpen(false);
        }
        showToast('Appointment removed.');
      } else if (deleteModal.type === 'patient') {
        await dbService.deletePatient(deleteModal.id);
        showToast('Patient record deleted.');
      } else if (deleteModal.type === 'clearDb') {
        await dbService.clearAllData();
        showToast('Database reset to empty state.');
      }
      await refreshData();
    } catch (err) {
      console.error('Error deleting', err);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Backup & Settings
  const handleSaveSettings = async (newSettings: ClinicSettings) => {
    try {
      await dbService.saveSettings(newSettings);
      setSettings(newSettings);
      showToast('Settings saved.');
    } catch (err) {
      console.error('Error saving settings', err);
    }
  };

  const handleExportBackup = async () => {
    try {
      const jsonStr = await dbService.exportBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_appointments_backup_${getTodayDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Backup downloaded successfully.');
    } catch (err) {
      console.error('Export failed', err);
      showToast('Failed to export backup.');
    }
  };

  const handleImportBackup = async (jsonText: string) => {
    const result = await dbService.importBackupJSON(jsonText);
    await refreshData();
    showToast(`Restored ${result.appointmentsCount} appointments & ${result.patientsCount} patients.`);
  };

  const handleClearDatabaseRequest = () => {
    setDeleteModal({
      isOpen: true,
      id: 'all',
      name: 'All Database Records',
      type: 'clearDb',
    });
  };

  const handleOpenPrint = (type: PrintType, patient?: Patient) => {
    setPrintType(type);
    setPrintPatient(patient || null);
    setIsPrintOpen(true);
  };

  // Waiting appointments count for Today
  const todayStr = getTodayDateString();
  const waitingTodayCount = appointments.filter(
    (a) => a.date === todayStr && a.status === 'Waiting'
  ).length;

  return (
    <div className="h-[100dvh] max-h-[100dvh] bg-[#F0F2F5] text-[#1C1C1E] flex flex-col overflow-hidden selection:bg-[#007AFF] selection:text-white">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E] text-white px-3 py-1.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200 border border-[#F2F2F7]/10 no-print">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation (Header & Bottom Tab Bar) */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onNewAppointment={() => handleOpenNewAppointment()}
        waitingTodayCount={waitingTodayCount}
      />

      {/* Main Content Viewport - strictly viewport bounded, hidden during printing */}
      <main className="no-print flex-1 min-h-0 w-full max-w-5xl mx-auto px-2.5 sm:px-4 pt-2 pb-safe-nav md:pb-3 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-10 h-10 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-xs font-bold text-[#8E8E93]">Loading IndexedDB Database...</p>
          </div>
        ) : (
          <>
            {currentTab === 'today' && (
              <TodayScreen
                appointments={appointments}
                onEdit={handleOpenEditAppointment}
                onDelete={handleDeleteAppointmentRequest}
                onStatusChange={handleStatusChange}
                onNewAppointment={handleOpenNewAppointment}
                onOpenPrint={() => handleOpenPrint('today')}
              />
            )}

            {currentTab === 'upcoming' && (
              <UpcomingScreen
                appointments={appointments}
                onEdit={handleOpenEditAppointment}
                onDelete={handleDeleteAppointmentRequest}
                onStatusChange={handleStatusChange}
                onNewAppointment={handleOpenNewAppointment}
                onOpenPrint={() => handleOpenPrint('upcoming')}
              />
            )}

            {currentTab === 'patients' && (
              <PatientsScreen
                patients={patients}
                appointments={appointments}
                onBookAppointment={handleBookForPatient}
                onSavePatient={handleSavePatient}
                onDeletePatient={handleDeletePatientRequest}
                onOpenPrint={(type, patient) => handleOpenPrint(type, patient)}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                appointments={appointments}
                patients={patients}
                onSaveSettings={handleSaveSettings}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onClearDatabase={handleClearDatabaseRequest}
                onOpenPrint={handleOpenPrint}
              />
            )}
          </>
        )}
      </main>

      {/* Full-Screen Page for Add / Edit Appointment */}
      <AppointmentFormPage
        isOpen={isFormOpen}
        appointmentToEdit={appointmentToEdit}
        initialPatientName={formInitialPatient.name}
        initialPhone={formInitialPatient.phone}
        initialDate={formInitialDate}
        existingAppointments={appointments}
        existingPatients={patients}
        onSave={handleSaveAppointment}
        onCancel={() => setIsFormOpen(false)}
        onDelete={handleDeleteAppointmentRequest}
      />

      {/* Printable / PDF Export Sheet */}
      <ErrorBoundary fallbackTitle="Unable to display print document view.">
        <PrintDocumentView
          isOpen={isPrintOpen}
          type={printType}
          appointments={
            printType === 'today'
              ? appointments
                  .filter((a) => a && a.date === todayStr)
                  .sort((a, b) => (a.queueNumber || '').localeCompare(b.queueNumber || '') || (a.time || '').localeCompare(b.time || ''))
              : printType === 'upcoming'
              ? appointments
                  .filter((a) => a && a.date > todayStr)
                  .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''))
              : printType === 'patient-history' && printPatient && printPatient.name
              ? appointments
                  .filter(
                    (a) =>
                      a &&
                      a.patientName &&
                      a.patientName.trim().toLowerCase() === printPatient.name.trim().toLowerCase()
                  )
                  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
              : appointments
          }
          patients={
            Array.isArray(patients)
              ? [...patients].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              : []
          }
          settings={settings}
          selectedDate={todayStr}
          selectedPatient={printPatient}
          onClose={() => {
            setIsPrintOpen(false);
            setPrintPatient(null);
          }}
        />
      </ErrorBoundary>



      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={
          deleteModal.type === 'clearDb'
            ? 'Reset Database?'
            : deleteModal.type === 'patient'
            ? `Delete Patient "${deleteModal.name}"?`
            : `Delete Appointment for "${deleteModal.name}"?`
        }
        message={
          deleteModal.type === 'clearDb'
            ? 'Are you sure you want to completely erase all appointments and patient records? This action cannot be undone.'
            : deleteModal.type === 'patient'
            ? 'This will delete the patient profile from your local directory. Existing appointment records will not be deleted.'
            : 'Are you sure you want to permanently remove this appointment from your schedule?'
        }
        confirmText={deleteModal.type === 'clearDb' ? 'Reset Everything' : 'Delete'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
