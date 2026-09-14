import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-[#407F3E]' : 'bg-red-500';
  const Icon = type === 'success' ? CheckCircle2 : XCircle;

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-in slide-in-from-right-8 fade-in duration-300">
      <div className={`${bgColor} text-white px-4 py-3 rounded-xl shadow-lg shadow-black/10 flex items-center gap-3 min-w-[280px]`}>
        <Icon className="w-5 h-5 text-white/90" />
        <span className="font-medium text-sm flex-1">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
