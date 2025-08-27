import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';

// Check if token is expired with optional grace period
export const isTokenExpired = (token, gracePeriodSeconds = 0) => {
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const expirationTime = decoded.exp + gracePeriodSeconds;

        return currentTime >= expirationTime;
    } catch (error) {
        return true;
    }
};

// Get token from cookies
export const getTokenFromCookies = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Clear all auth-related cookies
export const clearAuthCookies = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Force logout and redirect
export const forceLogout = (reason = 'Session expired') => {
    console.log(`🔄 Force logout: ${reason}`);

    // Clear cookies
    clearAuthCookies();

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cachedUser');

    // Clear sessionStorage
    sessionStorage.clear();

    // Show logout message
    toast.error(reason);

    // Redirect to login page
    window.location.href = '/';
};

// Check if token is close to expiring (for proactive refresh)
export const isTokenCloseToExpiring = (token, warningMinutes = 10) => {
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const warningTime = decoded.exp - (warningMinutes * 60);

        return currentTime >= warningTime;
    } catch (error) {
        return false;
    }
};

// Check token validity periodically
export const startTokenValidation = (checkInterval = 120000) => { // Check every 2 minutes by default
    return setInterval(() => {
        const token = getTokenFromCookies();

        if (token && isTokenExpired(token, 60)) { // 1 minute grace period for periodic checks
            forceLogout('Your session has expired. Please login again.');
        }
    }, checkInterval);
};

// Stop token validation
export const stopTokenValidation = (intervalId) => {
    if (intervalId) {
        clearInterval(intervalId);
    }
};
