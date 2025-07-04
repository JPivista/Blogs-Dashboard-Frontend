import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { getProfile } from './api/auth';
import RegisterPage from './pages/RegisterPage';
import SuperadminDashboard from './pages/SuperadminDashboard';
import Layout from './components/Layout';
import axios from 'axios';
import BlogsListPage from './pages/BlogsListPage';
import CreateBlogPage from './pages/CreateBlogPage';
import EditBlogPage from './pages/EditBlogPage';
import ViewBlogPage from './pages/ViewBlogPage';
import CategoryManagementPage from './pages/CategoryManagementPage';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          // Clear user state and redirect to login page
          setUser(null);
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    // Check if user is already logged in on app start
    getProfile()
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      const API_URL = process.env.REACT_APP_API || '/api';
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (e) { }
    setUser(null);
    window.location.href = '/';
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Redirect authenticated users away from login/register */}
          <Route
            path="/"
            element={
              user ?
                (user.role === 'superadmin' ? <Navigate to="/superadmin" /> : <LoginPage setUser={setUser} />)
                : <LoginPage setUser={setUser} />
            }
          />
          <Route
            path="/register"
            element={
              user ?
                (user.role === 'superadmin' ? <Navigate to="/superadmin" /> : <RegisterPage setUser={setUser} user={user} />)
                : <RegisterPage setUser={setUser} user={user} />
            }
          />
          {/* Protected routes */}
          <Route
            path="/superadmin"
            element={
              user?.role === 'superadmin'
                ? <Layout user={user} setUser={setUser} onLogout={handleLogout}><SuperadminDashboard user={user} setUser={setUser} /></Layout>
                : <Navigate to="/" />
            }
          />
          <Route path="/blogs" element={<Layout user={user} setUser={setUser} onLogout={handleLogout}><BlogsListPage /></Layout>} />
          <Route path="/blogs/create" element={<Layout user={user} setUser={setUser} onLogout={handleLogout}><CreateBlogPage /></Layout>} />
          <Route path="/blogs/edit/:idOrSlug" element={<Layout user={user} setUser={setUser} onLogout={handleLogout}><EditBlogPage /></Layout>} />
          <Route path="/blogs/:idOrSlug" element={<Layout user={user} setUser={setUser} onLogout={handleLogout}><ViewBlogPage /></Layout>} />
          <Route path="/categories" element={<Layout user={user} setUser={setUser} onLogout={handleLogout}><CategoryManagementPage /></Layout>} />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
