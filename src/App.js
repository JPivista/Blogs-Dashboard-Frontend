import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
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
import LeadsListPage from './pages/LeadsListPage';
import SeoMetadataPage from './pages/SeoMetadataPage';
import {
  isTokenExpired,
  getTokenFromCookies,
  forceLogout,
  startTokenValidation,
  stopTokenValidation,
  isTokenCloseToExpiring
} from './utils/tokenUtils';
import ProtectedRoute from './components/ProtectedRoute';
import AuthDebugger from './components/AuthDebugger';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenValidationRef = useRef(null);

  // Enhanced global axios interceptor for 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          console.log('🔄 401 Error detected, logging out user');

          // Get error details from backend
          const errorCode = error.response.data?.code;
          let logoutReason = 'Session expired';

          switch (errorCode) {
            case 'TOKEN_EXPIRED':
              logoutReason = 'Your session has expired. Please login again.';
              break;
            case 'USER_NOT_FOUND':
              logoutReason = 'User account not found. Please login again.';
              break;
            case 'USER_DEACTIVATED':
              logoutReason = 'Your account has been deactivated. Please contact an administrator.';
              break;
            case 'INVALID_TOKEN':
              logoutReason = 'Invalid session. Please login again.';
              break;
            case 'NO_TOKEN':
              logoutReason = 'No authentication token found. Please login again.';
              break;
            case 'AUTH_FAILED':
              logoutReason = 'Authentication failed. Please login again.';
              break;
            default:
              logoutReason = 'Authentication failed. Please login again.';
          }

          // Force logout with reason
          forceLogout(logoutReason);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    // Simple auth check - just like it was working before
    const checkAuth = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        setUser(res.data.user);
        setLoading(false);

        // Start token validation timer
        tokenValidationRef.current = startTokenValidation(120000);

        console.log('✅ User authenticated successfully');
      } catch (error) {
        console.log('❌ Auth check failed:', error.message);
        setUser(null);
        setLoading(false);

        // Only force logout on actual auth failures, not network issues
        if (error.response?.status === 401) {
          console.log('🔄 401 error - user needs to login');
        }
      }
    };

    checkAuth();

    // Cleanup token validation on unmount
    return () => {
      if (tokenValidationRef.current) {
        stopTokenValidation(tokenValidationRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Stop token validation
      if (tokenValidationRef.current) {
        stopTokenValidation(tokenValidationRef.current);
        tokenValidationRef.current = null;
      }

      // Clear cached user data
      localStorage.removeItem('cachedUser');

      const API_URL = process.env.REACT_APP_API || '/api';
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      console.log('✅ Logout successful');
    } catch (error) {
      console.log('⚠️ Logout API call failed:', error.message);
    } finally {
      // Always clear user state and redirect
      setUser(null);
      forceLogout('You have been logged out successfully.');
    }
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
              <ProtectedRoute user={user} requiredRole="superadmin">
                <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                  <SuperadminDashboard user={user} setUser={setUser} />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/blogs" element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                <BlogsListPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/blogs/create" element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                <CreateBlogPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/blogs/edit/:idOrSlug" element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                <EditBlogPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/blogs/:idOrSlug" element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                <ViewBlogPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/categories" element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                <CategoryManagementPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/seo-metadata" element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                <SeoMetadataPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/lead" element={
            <ProtectedRoute user={user}>
              <Layout user={user} setUser={setUser} onLogout={handleLogout}>
                <LeadsListPage />
              </Layout>
            </ProtectedRoute>
          } />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Auth Debugger (only in development) */}
        <AuthDebugger
          user={user}
          loading={loading}
          tokenValidationRef={tokenValidationRef}
        />
      </BrowserRouter>
    </>
  );
};

export default App;
