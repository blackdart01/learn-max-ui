import React, { useState, useEffect } from 'react';

const Notifier = ({ message, type, duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(!!message);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                if (onClose) {
                    onClose();
                }
            }, duration);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [message, duration, onClose]);

    if (!isVisible || !message) {
        return null;
    }

    const baseStyles = "fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-md z-50";
    const successStyles = "bg-green-100 border border-green-400 text-green-700";
    const errorStyles = "bg-red-100 border border-red-400 text-red-700";

    const typeStyles = type === 'success' ? successStyles : (type === 'error' ? errorStyles : '');
    const textColor = type === 'success' ? 'text-green-500' : (type === 'error' ? 'text-red-500' : 'text-gray-500');

    return (
        <div className={`${baseStyles} ${typeStyles}`}>
            <strong className="font-bold">{type === 'success' ? 'Success!' : (type === 'error' ? 'Error!' : 'Info:')}</strong>
            <span className="block sm:inline">{message}</span>
            <button
                className="absolute top-0 bottom-0 right-0 px-4 py-3 focus:outline-none"
                onClick={() => {
                    setIsVisible(false);
                    if (onClose) {
                        onClose();
                    }
                }}
            >
                <svg className={`fill-current h-6 w-6 ${textColor}`} role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path fillRule="evenodd" d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
};

export default Notifier;