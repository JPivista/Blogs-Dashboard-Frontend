import React, { useState, useEffect } from 'react';

const LoginHistoryModal = ({ isOpen, onClose }) => {
    const [loginHistory, setLoginHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLoginHistory();
        }
    }, [isOpen]);

    const fetchLoginHistory = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.REACT_APP_API || '/api';
            const res = await fetch(`${API_URL}/users/login-history`, {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setLoginHistory(data.loginHistory || []);
            } else {
                console.error('Error fetching login history');
            }
        } catch (error) {
            console.error('Error fetching login history:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getBrowserInfo = (userAgent) => {
        if (!userAgent || userAgent === 'Unknown') return 'Unknown';

        // Simple browser detection
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera')) return 'Opera';

        return 'Other';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Login History (Last 20 Logins)</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="overflow-y-auto max-h-[60vh]">
                        {loginHistory.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No login history available
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-3 text-left border-b font-medium text-gray-700">#</th>
                                        <th className="p-3 text-left border-b font-medium text-gray-700">Date & Time</th>
                                        <th className="p-3 text-left border-b font-medium text-gray-700">IP Address</th>
                                        <th className="p-3 text-left border-b font-medium text-gray-700">Browser</th>
                                        <th className="p-3 text-left border-b font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loginHistory.map((login, index) => (
                                        <tr key={index} className="hover:bg-gray-50 border-b">
                                            <td className="p-3 text-sm text-gray-600">
                                                {loginHistory.length - index}
                                            </td>
                                            <td className="p-3 text-sm text-gray-800">
                                                {formatDateTime(login.timestamp)}
                                            </td>
                                            <td className="p-3 text-sm text-gray-800 font-mono">
                                                {login.ipAddress}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {getBrowserInfo(login.userAgent)}
                                            </td>
                                            <td className="p-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Successful
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                <div className="mt-4 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginHistoryModal; 