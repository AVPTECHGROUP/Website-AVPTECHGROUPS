import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, size = 'md', title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-card-xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

/**
 * FIX: Added `flex-1 min-h-0` so ModalBody fills remaining space inside the
 * flex column and allows overflow-y-auto to actually scroll — instead of
 * growing unbounded and pushing ModalFooter outside max-h-[90vh].
 */
const ModalBody = ({ children, className = '' }) => {
  return (
    <div className={`flex-1 min-h-0 px-6 py-5 overflow-y-auto custom-scrollbar ${className}`}>
      {children}
    </div>
  );
};

/**
 * FIX: Added `flex-shrink-0` so the footer is never squashed or hidden
 * when modal content is tall.
 */
const ModalFooter = ({ children, className = '' }) => {
  return (
    <div
      className={`flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-end gap-3 ${className}`}
    >
      {children}
    </div>
  );
};

Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;