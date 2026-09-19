import { Appointment, ClinicSettings } from '../types';
import { formatFriendlyDate, formatTimeDisplay } from './date';

export type MessageTemplateType = 'confirmation' | 'reminder' | 'queue' | 'cancellation' | 'custom';

export const DEFAULT_TEMPLATES: Record<Exclude<MessageTemplateType, 'custom'>, string> = {
  confirmation: 
`Hello {patient_name},
Your appointment at {clinic_name} with {doctor_name} has been confirmed.

📅 Date: {date}
⏰ Time: {time}
🔢 Queue #: {queue}
🏥 Address: {address}
📞 Phone: {clinic_phone}

Please arrive 10 minutes prior to your time. Thank you!`,

  reminder:
`Hello {patient_name},
This is a gentle reminder of your upcoming appointment at {clinic_name} with {doctor_name}.

📅 Date: {date}
⏰ Time: {time}
🔢 Queue #: {queue}
🏥 Address: {address}
📞 Clinic Phone: {clinic_phone}

If you need to reschedule, please contact us. Thank you!`,

  queue:
`Hello {patient_name},
Your turn for Queue #{queue} at {clinic_name} is coming up soon!
Please proceed to the clinic waiting room.

📞 Clinic Phone: {clinic_phone}`,

  cancellation:
`Hello {patient_name},
Your appointment scheduled for {date} at {clinic_name} has been cancelled.

If you have any questions or would like to reschedule, please contact us at {clinic_phone}.`,
};

export const TEMPLATE_LABELS: Record<MessageTemplateType, { label: string; description: string }> = {
  confirmation: {
    label: 'Confirmation',
    description: 'Booking details & schedule confirmation',
  },
  reminder: {
    label: 'Reminder',
    description: 'Upcoming appointment reminder notice',
  },
  queue: {
    label: 'Queue Alert',
    description: 'Token / Queue number is approaching',
  },
  cancellation: {
    label: 'Cancellation',
    description: 'Appointment cancellation notice',
  },
  custom: {
    label: 'Custom',
    description: 'Write your own personalized message',
  },
};

/**
 * Replace placeholders in template with appointment and clinic settings data.
 */
export function renderMessageTemplate(
  template: string,
  appointment: Partial<Appointment>,
  settings: ClinicSettings
): string {
  const formattedDate = appointment.date ? formatFriendlyDate(appointment.date) : 'Today';
  const formattedTime = appointment.time ? formatTimeDisplay(appointment.time) : 'Queue basis';
  const queueNum = appointment.queueNumber || '—';

  const replacements: Record<string, string> = {
    '{patient_name}': appointment.patientName?.trim() || 'Patient',
    '{date}': formattedDate,
    '{time}': formattedTime,
    '{queue}': queueNum,
    '{visit_type}': appointment.visitType?.trim() || 'General Consultation',
    '{doctor_name}': settings.doctorName?.trim() || 'Attending Physician',
    '{clinic_name}': settings.clinicName?.trim() || 'Medical Clinic',
    '{clinic_phone}': settings.phone?.trim() || '',
    '{address}': settings.address?.trim() || '',
    '{notes}': appointment.notes?.trim() || '',
  };

  let rendered = template;
  for (const [key, val] of Object.entries(replacements)) {
    rendered = rendered.replaceAll(key, val);
  }

  // Remove empty lines for missing fields (like empty address or phone)
  return rendered.trim();
}

/**
 * Format phone number to clean digits for WhatsApp.
 * Handles +, 00, local trunk 0, or prepends default country code if missing.
 */
export function formatPhoneForWhatsApp(phone: string, defaultCountryCode: string = '+1'): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  if (!digitsOnly) return '';

  const cleanCountry = defaultCountryCode.replace(/\D/g, '');

  if (trimmed.startsWith('+')) {
    return digitsOnly;
  }
  if (trimmed.startsWith('00')) {
    return digitsOnly.substring(2);
  }

  // Common local formatting: 10-digit number (e.g. US, India, etc.)
  if (digitsOnly.length === 10 && cleanCountry) {
    return cleanCountry + digitsOnly;
  }

  // Local number with leading trunk zero (e.g. UK 07xxx -> 447xxx)
  if (digitsOnly.startsWith('0') && cleanCountry) {
    return cleanCountry + digitsOnly.substring(1);
  }

  return digitsOnly;
}

/**
 * Format phone number for SMS URI.
 */
export function formatPhoneForSms(phone: string): string {
  if (!phone) return '';
  // Preserve leading plus if present for international SMS
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Create a WhatsApp click-to-chat URL.
 */
export function createWhatsAppUrl(phone: string, message: string, defaultCountryCode?: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone, defaultCountryCode);
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Create an SMS URI scheme compatible with mobile and desktop SMS handlers.
 */
export function createSmsUrl(phone: string, message: string): string {
  const cleanPhone = formatPhoneForSms(phone);
  const encodedText = encodeURIComponent(message);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  return `sms:${cleanPhone}${separator}body=${encodedText}`;
}

/**
 * Estimate SMS segment count (160 standard GSM / 70 for Unicode)
 */
export function getSmsStats(text: string): { chars: number; smsCount: number; isUnicode: boolean } {
  const chars = text.length;
  // Check if string contains characters outside standard GSM 7-bit alphabet
  // Simple check: characters with code point > 127 (e.g. emojis or special accented letters)
  const isUnicode = /[^\u0000-\u007F]/.test(text);
  const limitPerSms = isUnicode ? 70 : 160;
  const multiSmsLimit = isUnicode ? 67 : 153;

  if (chars === 0) {
    return { chars: 0, smsCount: 0, isUnicode };
  }
  if (chars <= limitPerSms) {
    return { chars, smsCount: 1, isUnicode };
  }
  const smsCount = Math.ceil(chars / multiSmsLimit);
  return { chars, smsCount, isUnicode };
}
