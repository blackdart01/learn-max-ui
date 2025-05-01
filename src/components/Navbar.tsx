import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = (
    <>
      <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium" onClick={() => setMenuOpen(false)}>
        Home
      </Link>
      {isAuthenticated && user?.role === 'student' && (
        <>
          <Link to="/tests" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Available Tests
          </Link>
          <Link to="/my-attempts" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            My Attempts
          </Link>
        </>
      )}
      {isAuthenticated && user?.role === 'teacher' && (
        <>
          <Link to="/manage-tests" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Manage Tests
          </Link>
          <Link to="/teacher-attempts" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            View Attempts
          </Link>
          <Link to="/questions" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Questions
          </Link>
          <Link to="/manage-enrollments" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Manage Students
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              Learn Max
            </Link>
          </div>
          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {navLinks}
          </div>
          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-600 hover:text-indigo-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          {/* Desktop user actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user?.username || 'User'}</span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden bg-white shadow rounded-b-lg py-2 flex flex-col space-y-2 z-50">
            {navLinks}
            <div className="border-t border-gray-200 mt-2 pt-2 flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 px-4">{user?.username || 'User'}</span>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout(); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 mx-4"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 mx-4"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 