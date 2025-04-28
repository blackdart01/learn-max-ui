import React, { useEffect, useState } from 'react';
import { studentService } from '../services/api';
import { Test, Attempt } from '../types';
import Toast from '../components/Toast';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [testsRes, attemptsRes] = await Promise.all([
          studentService.getAllAvailableTests(),
          studentService.getStudentAttempts(),
        ]);
        setTests(testsRes.data);
        setAttempts(attemptsRes.data);
      } catch {
        setToastType('error');
        setToastMessage('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);
    try {
      await studentService.joinTestByCode(joinCode);
      setToastType('success');
      setToastMessage('Joined test successfully!');
      setJoinCode('');
      // Optionally re-fetch tests
      const testsRes = await studentService.getAllAvailableTests();
      setTests(testsRes.data);
    } catch {
      setToastType('error');
      setToastMessage('Invalid or expired join code');
    } finally {
      setJoining(false);
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      const response = await studentService.startTest(testId);
      const attemptId = response.data._id;
      // Fetch the attempt to ensure testId is populated
      const attemptRes = await studentService.getStudentAttemptById(attemptId);
      if (
        attemptRes.data &&
        attemptRes.data.testId &&
        typeof attemptRes.data.testId === 'object' &&
        Array.isArray((attemptRes.data.testId as any).questions) &&
        (attemptRes.data.testId as any).questions.length > 0
      ) {
        navigate(`/test-taking/${testId}/${attemptId}`);
      } else {
        setToastType('error');
        setToastMessage('Test could not be started or has no questions.');
      }
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to start test');
    }
  };

  // Categorize tests
  const enrolledTests = tests.filter(test => test.visibility === 'enrolled');
  const joinedByCodeTests = tests.filter(test => test.visibility === 'code');
  const publicTests = tests.filter(test => test.visibility === 'public');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Toast message={toastMessage || ""} isOpen={!!toastMessage} />
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="text-lg font-semibold">Welcome!</div>
          <div className="text-gray-600">Here are your available tests and results.</div>
        </div>
        <form onSubmit={handleJoinByCode} className="flex gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2"
            placeholder="Enter join code"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            disabled={joining}
          >
            {joining ? 'Joining...' : 'Join Test'}
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Enrolled in Class</h2>
        {enrolledTests.length === 0 ? (
          <div className="text-gray-500">No enrolled class tests.</div>
        ) : (
          <div className="bg-white shadow rounded-md mb-4">
            <ul className="divide-y divide-gray-200">
              {enrolledTests.map(test => (
                <li key={test._id} className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="font-medium">{test.title}</div>
                    <div className="text-gray-500 text-sm">{test.description}</div>
                    {test.teacherId && typeof test.teacherId === 'object' && (
                      <div className="text-xs text-gray-400">Teacher: {test.teacherId.username}</div>
                    )}
                  </div>
                  <button
                    className="mt-2 md:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleStartTest(test._id)}
                  >
                    Start Test
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <h2 className="text-xl font-semibold mb-2">Joined by Code</h2>
        {joinedByCodeTests.length === 0 ? (
          <div className="text-gray-500">No joined-by-code tests.</div>
        ) : (
          <div className="bg-white shadow rounded-md mb-4">
            <ul className="divide-y divide-gray-200">
              {joinedByCodeTests.map(test => (
                <li key={test._id} className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="font-medium">{test.title}</div>
                    <div className="text-gray-500 text-sm">{test.description}</div>
                    {test.teacherId && typeof test.teacherId === 'object' && (
                      <div className="text-xs text-gray-400">Teacher: {test.teacherId.username}</div>
                    )}
                  </div>
                  <button
                    className="mt-2 md:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleStartTest(test._id)}
                  >
                    Start Test
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <h2 className="text-xl font-semibold mb-2">Public Tests</h2>
        {publicTests.length === 0 ? (
          <div className="text-gray-500">No public tests available.</div>
        ) : (
          <div className="bg-white shadow rounded-md">
            <ul className="divide-y divide-gray-200">
              {publicTests.map(test => (
                <li key={test._id} className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="font-medium">{test.title}</div>
                    <div className="text-gray-500 text-sm">{test.description}</div>
                    {test.teacherId && typeof test.teacherId === 'object' && (
                      <div className="text-xs text-gray-400">Teacher: {test.teacherId.username}</div>
                    )}
                  </div>
                  <button
                    className="mt-2 md:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    onClick={() => handleStartTest(test._id)}
                  >
                    Start Test
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">My Attempts & Results</h2>
        {attempts.length === 0 ? (
          <div className="text-gray-500">No attempts yet.</div>
        ) : (
          <div className="bg-white shadow rounded-md">
            <ul className="divide-y divide-gray-200">
              {attempts.map(attempt => (
                <li key={attempt._id} className="p-4 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="font-medium">Test: {attempt.testId}</div>
                    <div className="text-gray-500 text-sm">
                      Score: {attempt.score !== undefined ? attempt.score : 'Pending'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Started: {new Date(attempt.startTime).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="mt-2 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => window.location.href = `/student/attempt/${attempt._id}`}
                  >
                    View Details
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 