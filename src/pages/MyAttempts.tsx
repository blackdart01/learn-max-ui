import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { studentService } from '../services/api';
import { Attempt } from '../types';
import ContinueTestModal from '../components/ContinueTestModal';

const MyAttempts: React.FC = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [continueModal, setContinueModal] = useState<{
    isOpen: boolean;
    testId: string;
    attemptId: string;
    testTitle: string;
    startTime: string;
  }>({
    isOpen: false,
    testId: '',
    attemptId: '',
    testTitle: '',
    startTime: '',
  });

  // Group attempts by test
  const groupedAttempts = attempts.reduce((acc, attempt) => {
    const testId = attempt.testId && typeof attempt.testId === 'object' ? attempt.testId._id : 'unknown';
    const testTitle = attempt.testId && typeof attempt.testId === 'object' ? attempt.testId.title : 'Unknown Test';
    
    if (!acc[testId]) {
      acc[testId] = {
        title: testTitle,
        attempts: []
      };
    }
    acc[testId].attempts.push(attempt);
    return acc;
  }, {} as { [key: string]: { title: string; attempts: Attempt[] } });

  // Sort attempts within each group by date
  Object.values(groupedAttempts).forEach(group => {
    group.attempts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  });

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const response = await studentService.getStudentAttempts();
        setAttempts(response.data);
        
        // Check for in-progress attempts
        const inProgressAttempt = response.data.find(
          (attempt: Attempt) => !attempt.endTime && attempt.testId && typeof attempt.testId === 'object'
        );
        
        if (inProgressAttempt && inProgressAttempt.testId && typeof inProgressAttempt.testId === 'object') {
          // Check if there's a saved state in localStorage
          const savedState = localStorage.getItem(`test_state_${inProgressAttempt._id}`);
          if (savedState) {
            setContinueModal({
              isOpen: true,
              testId: inProgressAttempt.testId._id,
              attemptId: inProgressAttempt._id,
              testTitle: inProgressAttempt.testId.title || 'Untitled Test',
              startTime: inProgressAttempt.startTime,
            });
          }
        }
      } catch (err) {
        setError('Failed to fetch attempts');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const handleCloseModal = () => {
    setContinueModal(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading attempts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600 text-center">
          <svg className="h-12 w-12 text-red-500 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <ContinueTestModal
        isOpen={continueModal.isOpen}
        onClose={handleCloseModal}
        testId={continueModal.testId}
        attemptId={continueModal.attemptId}
        testTitle={continueModal.testTitle}
        startTime={continueModal.startTime}
      />

      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Attempts</h1>
          <div className="text-sm text-gray-500">
            Total Attempts: {attempts.length}
          </div>
        </div>
        
        {attempts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-xl text-gray-500">You haven't attempted any tests yet.</p>
            <button 
              onClick={() => window.location.href = '/tests'}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Available Tests
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAttempts).map(([testId, { title, attempts }]) => (
              <div key={testId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'}
                  </p>
                </div>
                <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-2">
                  {attempts.map((attempt, index) => {
                    const isInProgress = !attempt.endTime;
                    const score = attempt.score !== undefined ? attempt.score : null;
                    const answersCount = Array.isArray(attempt.answers) ? attempt.answers.length : 0;
                    const duration = attempt.endTime 
                      ? Math.round((new Date(attempt.endTime).getTime() - new Date(attempt.startTime).getTime()) / 60000)
                      : null;

                    return (
                      <div key={attempt._id} 
                        className={`relative bg-white rounded-lg border ${
                          isInProgress ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100'
                        } hover:shadow-md transition-shadow duration-200`}
                      >
                        <div className="absolute top-0 right-0 -mt-2 -mr-2">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold border-2 border-white shadow ${
                            isInProgress ? 'bg-yellow-500' : 'bg-indigo-600'
                          }`}>
                            #{index + 1}
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">
                                Attempt {index + 1}
                              </p>
                            </div>
                            {isInProgress ? (
                              <button
                                onClick={() => {
                                  if (attempt.testId && typeof attempt.testId === 'object') {
                                    setContinueModal({
                                      isOpen: true,
                                      testId: attempt.testId._id,
                                      attemptId: attempt._id,
                                      testTitle: attempt.testId.title || 'Untitled Test',
                                      startTime: attempt.startTime,
                                    });
                                  }
                                }}
                                className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              >
                                Continue Test
                              </button>
                            ) : (
                              <div className={`px-4 py-2 rounded-full text-sm font-medium
                                ${score !== null 
                                  ? score > 70 
                                    ? 'bg-green-100 text-green-800' 
                                    : score > 40 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'}`}
                              >
                                {score !== null ? `Score: ${score}%` : 'Processing'}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span className="text-sm text-gray-600">
                                {answersCount} Questions Answered
                              </span>
                            </div>
                            {duration && (
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-gray-600">
                                  {duration} mins
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-100 pt-4">
                            <div className="flex flex-col space-y-1 text-sm text-gray-500">
                              <div className="flex items-center">
                                <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Started: {new Date(attempt.startTime).toLocaleString()}
                              </div>
                              {attempt.endTime && (
                                <div className="flex items-center">
                                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Completed: {new Date(attempt.endTime).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAttempts; 