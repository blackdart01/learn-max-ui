import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterForm from './components/RegisterForm'; 
import LoginForm from './components/LoginForm';
import Home from './components/Home'; 
import Dashboard from './components/Dashboard'; 
import NotFound from './components/NotFound';
import { AuthProvider,  } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute'; 


function App() {
  return (
    <Router>
      <AuthProvider>
        <div>
          <Navbar />
          <div className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              {/* <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

const PrivateRoutey = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');

  if (isAuthenticated) {
    return children;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default App;