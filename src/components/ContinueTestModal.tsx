import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ContinueTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTitle: string;
  testId: string;
  attemptId: string;
  startTime: string;
}

const ContinueTestModal: React.FC<ContinueTestModalProps> = ({
  isOpen,
  onClose,
  testTitle,
  testId,
  attemptId,
  startTime,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContinue = () => {
    navigate(`/attempt/${attemptId}`);
  };

  const timeSinceStart = () => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60)); // minutes
    if (diff < 60) return `${diff} minutes`;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Continue Test?</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-500">
            You have an incomplete attempt for <span className="font-medium text-gray-900">{testTitle}</span> that was started {timeSinceStart()} ago.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Would you like to continue where you left off? Your previous answers and remaining time have been saved.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Continue Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinueTestModal; 