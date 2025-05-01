import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Questions from './pages/Questions';
import Tests from './pages/Tests';
import MyAttempts from './pages/MyAttempts';
import ManageTests from './pages/ManageTests';
import TestQuestions from './pages/TestQuestions';
import TestTaking from './pages/TestTaking';
import ViewResponse from './pages/ViewResponse';
import AttemptDetails from './pages/AttemptDetails';
import ManageEnrollments from './pages/ManageEnrollments';
import TeacherAttempts from './pages/TeacherAttempts';
import TeacherAttemptReview from './pages/TeacherAttemptReview';

function getTokenExpiration(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return payload.exp * 1000; // convert to ms
    }
  } catch (e) {}
  return null;
}

const App: React.FC = () => {
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  const [showTokenToast, setShowTokenToast] = useState(false);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Token expiration effect
  useEffect(() => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    if (token) {
      const exp = getTokenExpiration(token);
      if (exp) {
        const now = Date.now();
        const ms = exp - now;
        if (ms > 0) {
          logoutTimer.current = setTimeout(() => {
            setShowTokenToast(true);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTimeout(() => {
              setShowTokenToast(false);
              window.location.href = '/login';
            }, 5000);
          }, ms);
        } else {
          // Already expired
          setShowTokenToast(true);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            setShowTokenToast(false);
            window.location.href = '/login';
          }, 5000);
        }
      }
    }
    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [token]);

  useEffect(() => {
    const handleTokenExpired = () => {
      setShowTokenToast(true);
      setTimeout(() => {
        setShowTokenToast(false);
        window.location.href = '/login';
      }, 5000);
    };
    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => window.removeEventListener('tokenExpired', handleTokenExpired);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toast message="Your session has expired. Please log in again." isOpen={showTokenToast} />
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate
                  to={user?.role === 'student' ? '/tests' : '/manage-tests'}
                  replace
                />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate
                  to={user?.role === 'student' ? '/tests' : '/manage-tests'}
                  replace
                />
              ) : (
                <Signup />
              )
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Student routes */}
          <Route
            path="/tests"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Tests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/:testId/start"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TestTaking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-taking/:testId/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <TestTaking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attempts"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyAttempts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attempt-details/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <AttemptDetails />
              </ProtectedRoute>
            }
          />

          {/* Teacher routes */}
          <Route
            path="/questions"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <Questions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-attempts"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherAttempts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-attempts/:attemptId"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherAttemptReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-tests"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ManageTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-enrollments"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <ManageEnrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tests/:id/questions"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TestQuestions />
              </ProtectedRoute>
            }
          />

          {/* View Response route */}
          <Route path="/view-response/:attemptId" element={<ViewResponse />} />

          {/* Redirect to appropriate dashboard based on role */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate
                  to={user?.role === 'student' ? '/tests' : '/manage-tests'}
                  replace
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
