import React from 'react';

interface ToastProps {
  message: string;
  isOpen: boolean;
  type?: 'success' | 'error';
}

const Toast: React.FC<ToastProps> = ({ message, isOpen, type = 'success' }) => {
  if (!isOpen) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return '#ff4d4f';
      case 'success':
        return '#52c41a';
      default:
        return '#222';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 10000,
      background: getBackgroundColor(),
      color: '#fff',
      padding: '16px 24px',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      fontSize: 16,
      minWidth: 220,
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }}>
      {type === 'error' && (
        <svg viewBox="64 64 896 896" focusable="false" data-icon="close-circle" width="1em" height="1em" fill="currentColor">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 01-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z" />
        </svg>
      )}
      {type === 'success' && (
        <svg viewBox="64 64 896 896" focusable="false" data-icon="check-circle" width="1em" height="1em" fill="currentColor">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" />
        </svg>
      )}
      {message}
    </div>
  );
};

export default Toast; 