import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired, getTokenFromCookies, forceLogout } from '../utils/tokenUtils';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, user, requiredRole = null }) => {
    // Check if user is authenticated
    if (!user) {
        console.log('🚫 Protected route: No user, redirecting to login');
        return <Navigate to="/" replace />;
    }

    // Check if token is expired (with grace period for better UX)
    const token = getTokenFromCookies();
    if (token && isTokenExpired(token, 300)) { // 5 minutes grace period
        console.log('🚫 Protected route: Token significantly expired, logging out');
        toast.error('Your session has expired. Please login again.');
        forceLogout('Your session has expired. Please login again.');
        return null; // This will trigger the redirect
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
        console.log(`🚫 Protected route: Insufficient role. Required: ${requiredRole}, User: ${user.role}`);
        return <Navigate to="/" replace />;
    }

    // User is authenticated and authorized
    return children;
};

export default ProtectedRoute;
