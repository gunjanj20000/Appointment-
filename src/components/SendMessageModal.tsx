import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, ClinicSettings } from '../types';
import {
  DEFAULT_TEMPLATES,
  MessageTemplateType,
  TEMPLATE_LABELS,
  renderMessageTemplate,
  formatPhoneForWhatsApp,
  createWhatsAppUrl,
  createSmsUrl,
  getSmsStats,
} from '../utils/messaging';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import {
  X,
  MessageSquare,
  Copy,
  Check,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Info,
  AlertCircle,
} from 'lucide-react';

interface SendMessageModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  settings: ClinicSettings;
  initialChannel?: 'whatsapp' | 'sms';
  onClose: () => void;
  onUpdatePhone?: (appointmentId: string, patientName: string, newPhone: string) => Promise<void>;
  onToast?: (message: string) => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  appointment,
  settings,
  initialChannel,
  onClose,
  onUpdatePhone,
  onToast,
}) => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateType>('confirmation');
  const [messageText, setMessageText] = useState('');
  const [savePhoneToRecord, setSavePhoneToRecord] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or re-populate when modal opens or appointment changes
  useEffect(() => {
    if (!isOpen || !appointment) return;

    const initialPhone = appointment.phone || '';
    setRecipientPhone(initialPhone);
    setErrorMessage(null);
    setCopied(false);

    // Smart default template based on appointment status and date
    let defaultType: MessageTemplateType = 'confirmation';
    if (appointment.status === 'Cancelled') {
      defaultType = 'cancellation';
    } else {
      defaultType = 'reminder';
    }
    setSelectedTemplate(defaultType);

    const rawTemplate = getRawTemplate(defaultType, settings);
    const rendered = renderMessageTemplate(rawTemplate, appointment, settings);
    setMessageText(rendered);

    // If phone was empty initially, check savePhoneToRecord
    setSavePhoneToRecord(true);
  }, [isOpen, appointment, settings]);

  function getRawTemplate(type: MessageTemplateType, conf: ClinicSettings): string {
    switch (type) {
      case 'confirmation':
        return conf.smsConfirmationTemplate?.trim() || DEFAULT_TEMPLATES.confirmation;
      case 'reminder':
        return conf.smsReminderTemplate?.trim() || DEFAULT_TEMPLATES.reminder;
      case 'queue':
        return conf.smsQueueTemplate?.trim() || DEFAULT_TEMPLATES.queue;
      case 'cancellation':
        return conf.smsCancelledTemplate?.trim() || DEFAULT_TEMPLATES.cancellation;
      case 'custom':
        return '';
    }
  }

  const handleTemplateChange = (type: MessageTemplateType) => {
    setSelectedTemplate(type);
    setErrorMessage(null);
    if (!appointment) return;

    if (type === 'custom') {
      return;
    }

    const rawTemplate = getRawTemplate(type, settings);
    const rendered = renderMessageTemplate(rawTemplate, appointment, settings);
    setMessageText(rendered);
  };

  // Live SMS statistics
  const smsStats = useMemo(() => getSmsStats(messageText), [messageText]);

  // Clean formatted phone for WhatsApp preview
  const whatsAppPhonePreview = useMemo(() => {
    return formatPhoneForWhatsApp(recipientPhone, settings.defaultCountryCode || '+1');
  }, [recipientPhone, settings.defaultCountryCode]);

  if (!isOpen || !appointment) return null;

  const handlePhoneSaveIfNeeded = async () => {
    const trimmed = recipientPhone.trim();
    if (
      savePhoneToRecord &&
      trimmed &&
      trimmed !== (appointment.phone || '') &&
      onUpdatePhone
    ) {
      await onUpdatePhone(appointment.id, appointment.patientName, trimmed);
    }
  };

  const handleSendWhatsApp = async (useWeb: boolean = false) => {
    setErrorMessage(null);
    const trimmed = recipientPhone.trim();
    const digits = trimmed.replace(/\D/g, '');

    if (!digits) {
      setErrorMessage('Please enter the patient’s phone number to send a WhatsApp message.');
      return;
    }

    await handlePhoneSaveIfNeeded();

    const cleanPhone = formatPhoneForWhatsApp(trimmed, settings.defaultCountryCode || '+1');
    const encoded = encodeURIComponent(messageText);
    const targetUrl = useWeb
      ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://wa.me/${cleanPhone}?text=${encoded}`;

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onToast?.(`Opening WhatsApp for ${appointment.patientName}...`);
    onClose();
  };

  const handleSendSms = async () => {
    setErrorMessage(null);
    const trimmed = recipientPhone.trim();
    const digits = trimmed.replace(/\D/g, '');

    if (!digits) {
      setErrorMessage('Please enter the patient’s phone number to send an SMS.');
      return;
    }

    await handlePhoneSaveIfNeeded();

    const url = createSmsUrl(trimmed, messageText);
    // Open native SMS handler
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    onToast?.(`Opening SMS messaging app for ${appointment.patientName}...`);
    onClose();
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      onToast?.('Message copied to clipboard.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErrorMessage('Unable to copy message to clipboard.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs no-print animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#F2F2F7] flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[#F2F2F7] flex items-center justify-between shrink-0 bg-[#FAFAFA]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-[#007AFF]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#1C1C1E] truncate">
                Notify Patient: {appointment.patientName}
              </h2>
              <p className="text-[11px] text-[#8E8E93] truncate">
                Send appointment updates directly via SMS or WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-lg transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 text-xs text-[#1C1C1E]">
          {/* Appointment Quick Info Pill */}
          <div className="bg-[#F2F2F7]/70 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#1C1C1E]">{appointment.patientName}</span>
              {appointment.queueNumber && (
                <span className="px-1.5 py-0.5 rounded bg-white text-[#007AFF] font-bold shadow-2xs">
                  Q-{appointment.queueNumber}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[#8E8E93]">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {appointment.date}
              </span>
              {appointment.time && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {appointment.time}
                </span>
              )}
            </div>
          </div>

          {/* Recipient Phone Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="modal-patient-phone" className="block text-xs font-semibold text-[#1C1C1E]">
                Patient Phone Number <span className="text-[#FF3B30]">*</span>
              </label>
              {whatsAppPhonePreview && (
                <span className="text-[10px] text-[#8E8E93] font-mono">
                  WhatsApp digits: +{whatsAppPhonePreview}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="modal-patient-phone"
                type="tel"
                placeholder="e.g. +1 555-019-2834 or local phone number"
                value={recipientPhone}
                onChange={(e) => {
                  setRecipientPhone(e.target.value);
                  setErrorMessage(null);
                }}
                className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl border transition outline-hidden ${
                  !recipientPhone.trim()
                    ? 'border-[#FF9500] bg-[#FFF9EB] focus:border-[#FF9500]'
                    : 'border-[#E5E5EA] bg-[#F2F2F7] focus:border-[#007AFF] focus:bg-white'
                }`}
              />
              <Phone className="w-3.5 h-3.5 text-[#8E8E93] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Save phone checkbox if phone differs from appointment */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                id="save-phone-cb"
                type="checkbox"
                checked={savePhoneToRecord}
                onChange={(e) => setSavePhoneToRecord(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#C7C7CC] text-[#007AFF] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="save-phone-cb" className="text-[11px] text-[#8E8E93] cursor-pointer select-none">
                Save / update phone number on patient's appointment profile
              </label>
            </div>
          </div>

          {/* Template Selection Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">
              Select Message Template
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['reminder', 'confirmation', 'queue', 'cancellation'] as MessageTemplateType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTemplateChange(t)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                    selectedTemplate === t
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                      : 'border-[#F2F2F7] bg-[#F2F2F7] text-[#8E8E93] hover:text-[#1C1C1E]'
                  }`}
                >
                  {TEMPLATE_LABELS[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="modal-message-text" className="block text-xs font-semibold text-[#1C1C1E]">
                Message Content (Editable)
              </label>
              <span
                className={`text-[10px] font-mono ${
                  smsStats.smsCount > 1 ? 'text-[#FF9500]' : 'text-[#8E8E93]'
                }`}
                title="Character count and estimated SMS parts"
              >
                {smsStats.chars} chars • {smsStats.smsCount} SMS
              </span>
            </div>
            <textarea
              id="modal-message-text"
              rows={6}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setSelectedTemplate('custom');
              }}
              className="w-full p-3 text-xs leading-relaxed rounded-xl border border-[#E5E5EA] bg-white focus:border-[#007AFF] outline-hidden resize-y font-sans text-[#1C1C1E]"
              placeholder="Type your message here..."
            />
          </div>

          {/* Error display if any */}
          {errorMessage && (
            <div className="p-2.5 bg-[#FFEBEA] text-[#FF3B30] rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="p-3.5 border-t border-[#F2F2F7] bg-[#FAFAFA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          {/* Copy Message button */}
          <button
            type="button"
            onClick={handleCopyMessage}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1C1C1E] bg-white border border-[#E5E5EA] hover:bg-[#F2F2F7] rounded-xl transition cursor-pointer min-h-[38px]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34C759]" />
                <span className="text-[#34C759]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#8E8E93]" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* Send Buttons: WhatsApp & SMS */}
          <div className="flex items-center gap-2">
            {/* SMS Button */}
            <button
              type="button"
              onClick={handleSendSms}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0066D6] active:scale-95 rounded-xl shadow-2xs transition cursor-pointer min-h-[38px]"
              title="Open native SMS app"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send SMS</span>
            </button>

            {/* WhatsApp Button */}
            <button
              type="button"
              onClick={() => handleSendWhatsApp(false)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20BA59] active:scale-95 rounded-xl shadow-2xs transition cursor-pointer min-h-[38px]"
              title="Open WhatsApp chat with prefilled message"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Send WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
