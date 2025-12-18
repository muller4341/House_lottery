import React from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

/**
 * Reusable Modal Component for alerts and confirmations
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Callback when modal is closed
 * @param {string} props.type - Modal type: 'success', 'error', 'warning', 'info', 'confirm'
 * @param {string} props.title - Modal title
 * @param {string} props.message - Modal message/description
 * @param {function} props.onConfirm - Callback for confirm action (only for 'confirm' type)
 * @param {string} props.confirmText - Text for confirm button (default: 'Confirm')
 * @param {string} props.cancelText - Text for cancel button (default: 'Cancel')
 */
const Modal = ({
    isOpen,
    onClose,
    type = 'info',
    title,
    message,
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    // Configuration for different modal types
    const config = {
        success: {
            icon: CheckCircleIcon,
            iconColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            buttonColor: 'from-emerald-600 to-green-600',
            title: title || 'Success!'
        },
        error: {
            icon: XCircleIcon,
            iconColor: 'text-rose-600',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200',
            buttonColor: 'from-rose-600 to-red-600',
            title: title || 'Error'
        },
        warning: {
            icon: ExclamationTriangleIcon,
            iconColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            buttonColor: 'from-amber-600 to-orange-600',
            title: title || 'Warning'
        },
        info: {
            icon: InformationCircleIcon,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            buttonColor: 'from-blue-600 to-indigo-600',
            title: title || 'Information'
        },
        confirm: {
            icon: ExclamationTriangleIcon,
            iconColor: 'text-fuchsia-600',
            bgColor: 'bg-fuchsia-50',
            borderColor: 'border-fuchsia-200',
            buttonColor: 'from-fuchsia-600 to-purple-600',
            title: title || 'Confirm Action'
        }
    };

    const currentConfig = config[type] || config.info;
    const Icon = currentConfig.icon;

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`p-6 border-b ${currentConfig.borderColor} flex justify-between items-start ${currentConfig.bgColor}`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${currentConfig.bgColor} border ${currentConfig.borderColor}`}>
                            <Icon className={`h-6 w-6 ${currentConfig.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{currentConfig.title}</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-slate-700 text-base leading-relaxed">{message}</p>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-6 py-2.5 bg-gradient-to-r ${currentConfig.buttonColor} text-white font-bold rounded-xl shadow-lg shadow-${type}-900/20 hover:shadow-xl hover:scale-[1.02] transition-all`}
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className={`px-6 py-2.5 bg-gradient-to-r ${currentConfig.buttonColor} text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all`}
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
