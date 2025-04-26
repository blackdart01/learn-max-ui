import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <div className="max-w-2xl w-full px-6 py-12 bg-white rounded-2xl shadow-xl flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4 text-center">Welcome to Learn Max</h1>
        {!isAuthenticated ? (
          <>
            <p className="text-lg text-gray-700 mb-6 text-center">
              <span className="font-semibold text-indigo-600">Learn Max</span> is your all-in-one platform for creating, managing, and taking interactive quizzes and tests.<br />
              Whether you're a <span className="font-semibold">teacher</span> or a <span className="font-semibold">student</span>, our platform empowers you to:
            </p>
            <ul className="mb-8 w-full space-y-3">
              <li className="flex items-start">
                <span className="text-indigo-600 text-xl mr-2">✔</span>
                <span>Create and organize question banks with multiple question types</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 text-xl mr-2">✔</span>
                <span>Design and schedule tests with flexible settings</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 text-xl mr-2">✔</span>
                <span>Assign questions to tests and manage test content easily</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 text-xl mr-2">✔</span>
                <span>Track student attempts, scores, and progress in real time</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 text-xl mr-2">✔</span>
                <span>Enjoy a modern, intuitive, and responsive user experience</span>
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-indigo-700 transition"
                onClick={() => navigate('/login')}
              >
                Get Started
              </button>
              <button
                className="w-full sm:w-auto px-6 py-3 bg-white border border-indigo-600 text-indigo-700 rounded-lg font-semibold text-lg shadow hover:bg-indigo-50 transition"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg text-gray-700 mb-6 text-center">
              Welcome back, <span className="font-semibold text-indigo-600">{user?.username || user?.name || 'User'}</span>!<br />
              {user?.role === 'teacher'
                ? 'Manage your tests and questions with ease.'
                : 'Browse and attempt available tests to track your progress.'}
            </p>
            <button
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-indigo-700 transition"
              onClick={() => navigate(user?.role === 'teacher' ? '/manage-tests' : '/tests')}
            >
              Go to Dashboard
            </button>
          </>
        )}
        <div className="mt-8 text-sm text-gray-400 text-center">
          &copy; {new Date().getFullYear()} Learn Max. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Home; 