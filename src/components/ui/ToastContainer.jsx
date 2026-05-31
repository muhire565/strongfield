import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={18} />
            <span className="flex-1">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
