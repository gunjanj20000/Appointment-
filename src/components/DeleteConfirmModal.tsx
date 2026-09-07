import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  isDanger?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Delete',
  isDanger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs no-print">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#F2F2F7] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-[#FFEBEA] text-[#FF3B30]' : 'bg-[#FFF9EB] text-[#FF9500]'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1C1C1E]">{title}</h3>
            <p className="mt-1 text-sm text-[#8E8E93] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-[#1C1C1E] bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-xl transition cursor-pointer min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-xs active:scale-95 transition cursor-pointer min-h-[44px] ${
              isDanger ? 'bg-[#FF3B30] hover:bg-[#FF3B30]/90' : 'bg-[#007AFF] hover:bg-[#0066D6]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
