import React from 'react';

interface ToastProps {
  message: string;
  isOpen: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isOpen }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 10000,
      background: '#222',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      fontSize: 16,
      minWidth: 220,
      textAlign: 'center',
    }}>
      {message}
    </div>
  );
};

export default Toast; 