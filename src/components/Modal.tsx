import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {title && <div className="px-6 pt-6 pb-2 text-lg font-semibold border-b">{title}</div>}
        <div className="p-6" style={{ maxHeight: '70vh', overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal; 