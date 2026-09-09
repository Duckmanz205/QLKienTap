import React from 'react';
import { AlertTriangle, Check, Key, Trash2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  actionType = 'delete', // 'delete', 'reset', 'default'
  isAlert = false
}) {
  if (!isOpen) return null;

  // Decide icon based on actionType
  const getActionIcon = () => {
    switch (actionType) {
      case 'reset':
        return <Key className="w-4 h-4 mr-2 inline-block" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 mr-2 inline-block" />;
      default:
        return <Check className="w-4 h-4 mr-2 inline-block" />;
    }
  };

  const isDestructive = actionType === 'delete';

  const iconBgClass = isDestructive ? 'bg-red-50 ring-red-50/50' : 'bg-[#407F3E]/10 ring-[#407F3E]/20';
  const iconColorClass = isDestructive ? 'text-red-500' : 'text-[#407F3E]';
  const btnGradientClass = isDestructive 
    ? 'from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] focus:ring-red-500'
    : 'from-[#407F3E] to-[#346832] hover:from-[#2e5e2c] hover:to-[#244b23] shadow-[0_4px_14px_0_rgba(64,127,62,0.39)] hover:shadow-[0_6px_20px_rgba(64,127,62,0.23)] focus:ring-[#407F3E]';

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/5 animate-in fade-in duration-300 ${!isAlert ? 'backdrop-blur-sm' : ''}`}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${isAlert ? 'max-w-[340px]' : 'max-w-[420px]'} overflow-hidden animate-in zoom-in-95 fade-in duration-300`}>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-4">
            {/* Icon */}
            {!isAlert && (
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ring-4 shadow-sm ${iconBgClass}`}>
                <AlertTriangle className={`w-6 h-6 ${iconColorClass}`} />
              </div>
            )}

            {/* Title */}
            <h3 className="font-semibold text-gray-900 text-xl leading-tight">
              {title}
            </h3>
          </div>

          {/* Message */}
          <div className="text-gray-500 text-[15px] leading-relaxed">
            {message}
          </div>
        </div>

        {/* Action Section */}
        <div className="p-5 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end">
          {!isAlert && (
            <button
              onClick={onCancel}
              className="w-full sm:w-1/2 px-5 py-2.5 text-[15px] font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-[15px] font-medium text-white bg-gradient-to-r ${btnGradientClass} rounded-xl transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 ${isAlert ? 'w-full sm:w-auto ml-auto' : 'w-full sm:w-1/2'}`}
          >
            {!isAlert && getActionIcon()}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
