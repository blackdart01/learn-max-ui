import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { testService, studentService } from '../services/api';
import { Test } from '../types';
import { useNavigate } from 'react-router-dom';

const Tests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const response = await studentService.getAllAvailableTests();
        setTests(response.data);
      } catch (err) {
        setError('Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleStartTest = async (testId: string) => {
    try {
      const res = await studentService.startTest(testId);
      const attemptId = res.data._id;
      console.log("/test-taking/${testId}/${attemptId} -> ", `/test-taking/${testId}/${attemptId}`);
      navigate(`/test-taking/${testId}/${attemptId}`);
    } catch (err) {
      setError('Failed to start test');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading available tests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Available Tests</h1>
        
        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tests available at the moment.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tests.map((test) => (
                <li key={test._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleStartTest(test._id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                          Start Test
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Questions: {Array.isArray(test.questions) ? test.questions.length : 0} • Duration: {test.duration} minutes
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Available until: {test.endDate ? new Date(test.endDate).toLocaleDateString() : 'No end date'}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests; 