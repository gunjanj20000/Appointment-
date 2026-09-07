export type AppointmentStatus = 'Waiting' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  patientName: string; // Required
  date: string; // YYYY-MM-DD, Required
  time?: string; // HH:mm optional
  phone?: string; // Optional
  age?: number | string; // Optional
  queueNumber?: string; // Optional
  visitType?: string; // Optional (e.g. Checkup, Follow-up, Consultation)
  duration?: string; // Optional (e.g. 15m, 30m)
  notes?: string; // Optional
  status: AppointmentStatus; // Default: 'Waiting'
  createdAt: number;
  updatedAt: number;
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  age?: number | string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ClinicSettings {
  id: string; // 'clinic_settings'
  clinicName: string;
  doctorName: string;
  specialty: string;
  phone: string;
  address: string;
  printFooterNote?: string;
}

export type ScreenTab = 'today' | 'upcoming' | 'patients' | 'settings';

export type PrintType = 'today' | 'upcoming' | 'patients' | 'patient-history';

export interface PrintReportConfig {
  type: PrintType;
  date?: string;
  title: string;
}

