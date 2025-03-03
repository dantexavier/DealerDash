import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './utils/toastStyles.css';
import axios from 'axios';

// Auth & Context
import AuthContext from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import setAuthToken from './utils/setAuthToken';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import VehicleDetail from './components/vehicles/VehicleDetail';
import VehicleForm from './components/vehicles/VehicleForm';
import LaborList from './components/labor/LaborList';
import LaborForm from './components/labor/LaborForm';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import Reports from './components/reports/Reports';
import LoadingSpinner from './components/common/LoadingSpinner';

import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check for token on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get('/api/auth');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="full-page-loader">
        <LoadingSpinner size="large" text="Loading application..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      <Router>
        <div className="app">
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            className="toast-container"
          />
          
          {isAuthenticated && <Navbar toggleSidebar={toggleSidebar} />}
          <div className="content-container">
            {isAuthenticated && <Sidebar isOpen={sidebarOpen} />}
            <main className={isAuthenticated ? 'main-content' : 'full-content'}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/vehicles" element={
                  <PrivateRoute>
                    <VehicleList />
                  </PrivateRoute>
                } />
                <Route path="/vehicles/add" element={
                  <PrivateRoute>
                    <VehicleForm />
                  </PrivateRoute>
                } />
                <Route path="/vehicles/:id" element={
                  <PrivateRoute>
                    <VehicleDetail />
                  </PrivateRoute>
                } />
                <Route path="/vehicles/:id/edit" element={
                  <PrivateRoute>
                    <VehicleForm />
                  </PrivateRoute>
                } />
                <Route path="/labor" element={
                  <PrivateRoute>
                    <LaborList />
                  </PrivateRoute>
                } />
                <Route path="/labor/add" element={
                  <PrivateRoute>
                    <LaborForm />
                  </PrivateRoute>
                } />
                <Route path="/labor/:id/edit" element={
                  <PrivateRoute>
                    <LaborForm />
                  </PrivateRoute>
                } />
                <Route path="/users" element={
                  <PrivateRoute>
                    <UserList />
                  </PrivateRoute>
                } />
                <Route path="/users/add" element={
                  <PrivateRoute>
                    <UserForm />
                  </PrivateRoute>
                } />
                <Route path="/users/:id/edit" element={
                  <PrivateRoute>
                    <UserForm />
                  </PrivateRoute>
                } />
                <Route path="/reports" element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;