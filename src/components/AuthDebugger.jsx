import React, { useState, useEffect } from 'react';

const AuthDebugger = ({ user, loading, tokenValidationRef }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [cachedUser, setCachedUser] = useState(null);

    useEffect(() => {
        // Check cached user data
        const checkCachedUser = () => {
            try {
                const cached = localStorage.getItem('cachedUser');
                if (cached) {
                    setCachedUser(JSON.parse(cached));
                } else {
                    setCachedUser(null);
                }
            } catch (error) {
                setCachedUser(null);
            }
        };

        checkCachedUser();
        const interval = setInterval(checkCachedUser, 1000);
        return () => clearInterval(interval);
    }, []);

    // Only show in development
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div 
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                background: '#1f2937',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 9999,
                maxWidth: '350px',
                cursor: 'pointer'
            }}
            onClick={() => setIsVisible(!isVisible)}
        >
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                🔐 Auth Debugger {isVisible ? '▼' : '▶'}
            </div>
            
            {isVisible && (
                <div style={{ lineHeight: '1.4' }}>
                    <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
                    <div><strong>User State:</strong> {user ? 'Logged In' : 'Not Logged In'}</div>
                    {user && (
                        <div style={{ marginLeft: '10px' }}>
                            <div>Email: {user.email}</div>
                            <div>Role: {user.role}</div>
                        </div>
                    )}
                    <div><strong>Cached User:</strong> {cachedUser ? 'Available' : 'None'}</div>
                    {cachedUser && (
                        <div style={{ marginLeft: '10px' }}>
                            <div>Email: {cachedUser.email}</div>
                            <div>Role: {cachedUser.role}</div>
                        </div>
                    )}
                    <div><strong>Token Timer:</strong> {tokenValidationRef?.current ? 'Active' : 'Inactive'}</div>
                    <div style={{ marginTop: '10px', padding: '10px', background: '#374151', borderRadius: '4px' }}>
                        <div><strong>localStorage:</strong></div>
                        <div>cachedUser: {localStorage.getItem('cachedUser') ? '✓' : '✗'}</div>
                        <div>user: {localStorage.getItem('user') ? '✓' : '✗'}</div>
                        <div>token: {localStorage.getItem('token') ? '✓' : '✗'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthDebugger;
