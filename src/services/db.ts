import { Appointment, AppointmentStatus, ClinicSettings, Patient } from '../types';

const DB_NAME = 'MedicalAppointmentOrganizerDB';
const DB_VERSION = 1;

const STORES = {
  APPOINTMENTS: 'appointments',
  PATIENTS: 'patients',
  SETTINGS: 'settings',
} as const;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported on this browser device.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Appointments Store
      if (!db.objectStoreNames.contains(STORES.APPOINTMENTS)) {
        const appointmentStore = db.createObjectStore(STORES.APPOINTMENTS, { keyPath: 'id' });
        appointmentStore.createIndex('date', 'date', { unique: false });
        appointmentStore.createIndex('status', 'status', { unique: false });
        appointmentStore.createIndex('patientName', 'patientName', { unique: false });
        appointmentStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 2. Patients Store
      if (!db.objectStoreNames.contains(STORES.PATIENTS)) {
        const patientStore = db.createObjectStore(STORES.PATIENTS, { keyPath: 'id' });
        patientStore.createIndex('name', 'name', { unique: false });
        patientStore.createIndex('phone', 'phone', { unique: false });
      }

      // 3. Settings Store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error || new Error('Failed to open IndexedDB'));
    };
  });
}

export const dbService = {
  // --- Appointments ---
  async getAllAppointments(): Promise<Appointment[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.APPOINTMENTS, 'readonly');
      const store = tx.objectStore(STORES.APPOINTMENTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result || []) as Appointment[];
        // Sort by date then time or queue number
        results.sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          if (a.queueNumber && b.queueNumber) {
            const numA = parseInt(a.queueNumber, 10);
            const numB = parseInt(b.queueNumber, 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.queueNumber.localeCompare(b.queueNumber);
          }
          if (a.time && b.time) return a.time.localeCompare(b.time);
          if (a.time) return -1;
          if (b.time) return 1;
          return a.createdAt - b.createdAt;
        });
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.APPOINTMENTS, 'readonly');
      const store = tx.objectStore(STORES.APPOINTMENTS);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as Appointment) || null);
      req.onerror = () => reject(req.error);
    });
  },

  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    const db = await openDB();

    // 1. Save appointment
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORES.APPOINTMENTS, 'readwrite');
      const store = tx.objectStore(STORES.APPOINTMENTS);
      const req = store.put(appointment);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // 2. Auto-sync patient directory with patient record
    try {
      const trimmedName = appointment.patientName.trim();
      if (trimmedName) {
        const existingPatients = await this.getAllPatients();
        const existing = existingPatients.find(
          (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        const patientRecord: Patient = {
          id: existing ? existing.id : 'pat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          name: trimmedName,
          phone: appointment.phone || existing?.phone || '',
          age: appointment.age || existing?.age || '',
          notes: existing?.notes || '',
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
        };

        await this.savePatient(patientRecord);
      }
    } catch {
      // Non-blocking sync
    }

    return appointment;
  },

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.APPOINTMENTS, 'readwrite');
      const store = tx.objectStore(STORES.APPOINTMENTS);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as Appointment | undefined;
        if (!item) {
          reject(new Error('Appointment not found'));
          return;
        }
        item.status = status;
        item.updatedAt = Date.now();
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  async deleteAppointment(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.APPOINTMENTS, 'readwrite');
      const store = tx.objectStore(STORES.APPOINTMENTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // --- Patients ---
  async getAllPatients(): Promise<Patient[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENTS, 'readonly');
      const store = tx.objectStore(STORES.PATIENTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result || []) as Patient[];
        results.sort((a, b) => a.name.localeCompare(b.name));
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async savePatient(patient: Patient): Promise<Patient> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENTS, 'readwrite');
      const store = tx.objectStore(STORES.PATIENTS);
      const req = store.put(patient);
      req.onsuccess = () => resolve(patient);
      req.onerror = () => reject(req.error);
    });
  },

  async deletePatient(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.PATIENTS, 'readwrite');
      const store = tx.objectStore(STORES.PATIENTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // --- Clinic Settings ---
  async getSettings(): Promise<ClinicSettings> {
    const db = await openDB();
    const defaultSettings: ClinicSettings = {
      id: 'clinic_settings',
      clinicName: 'Medical Clinic',
      doctorName: 'Attending Physician',
      specialty: 'General Practice',
      phone: '',
      address: '',
      printFooterNote: 'CONFIDENTIAL: For official medical clinic use only.',
    };

    return new Promise((resolve) => {
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const req = store.get('clinic_settings');
      req.onsuccess = () => {
        if (req.result) {
          resolve({ ...defaultSettings, ...(req.result as ClinicSettings) });
        } else {
          resolve(defaultSettings);
        }
      };
      req.onerror = () => resolve(defaultSettings);
    });
  },

  async saveSettings(settings: ClinicSettings): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      const store = tx.objectStore(STORES.SETTINGS);
      const req = store.put({ ...settings, id: 'clinic_settings' });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // --- Backup & Data Management ---
  async exportBackupJSON(): Promise<string> {
    const appointments = await this.getAllAppointments();
    const patients = await this.getAllPatients();
    const settings = await this.getSettings();

    const payload = {
      app: 'MedicalAppointmentOrganizer',
      version: 1,
      exportedAt: new Date().toISOString(),
      appointments,
      patients,
      settings,
    };

    return JSON.stringify(payload, null, 2);
  },

  async importBackupJSON(jsonStr: string): Promise<{ appointmentsCount: number; patientsCount: number }> {
    let data: {
      appointments?: Appointment[];
      patients?: Patient[];
      settings?: ClinicSettings;
    };

    try {
      data = JSON.parse(jsonStr);
    } catch {
      throw new Error('Invalid JSON backup file format.');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Backup file is empty or corrupted.');
    }

    const db = await openDB();

    // Import appointments
    if (Array.isArray(data.appointments)) {
      const tx = db.transaction(STORES.APPOINTMENTS, 'readwrite');
      const store = tx.objectStore(STORES.APPOINTMENTS);
      for (const appt of data.appointments) {
        if (appt.id && appt.patientName && appt.date) {
          store.put(appt);
        }
      }
      await new Promise((res, rej) => {
        tx.oncomplete = () => res(true);
        tx.onerror = () => rej(tx.error);
      });
    }

    // Import patients
    if (Array.isArray(data.patients)) {
      const tx = db.transaction(STORES.PATIENTS, 'readwrite');
      const store = tx.objectStore(STORES.PATIENTS);
      for (const pat of data.patients) {
        if (pat.id && pat.name) {
          store.put(pat);
        }
      }
      await new Promise((res, rej) => {
        tx.oncomplete = () => res(true);
        tx.onerror = () => rej(tx.error);
      });
    }

    // Import settings
    if (data.settings && typeof data.settings === 'object') {
      await this.saveSettings(data.settings);
    }

    return {
      appointmentsCount: Array.isArray(data.appointments) ? data.appointments.length : 0,
      patientsCount: Array.isArray(data.patients) ? data.patients.length : 0,
    };
  },

  async clearAllData(): Promise<void> {
    const db = await openDB();
    const stores = [STORES.APPOINTMENTS, STORES.PATIENTS];
    for (const storeName of stores) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  },
};
