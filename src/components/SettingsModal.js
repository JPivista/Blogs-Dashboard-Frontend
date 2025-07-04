import React, { useState, useEffect } from 'react';

const SettingsModal = ({ user, isOpen, onClose, onSettingsUpdate }) => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        twoFactorAuth: false,
        darkMode: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.settings) {
            setSettings({
                emailNotifications: user.settings.emailNotifications ?? true,
                twoFactorAuth: user.settings.twoFactorAuth ?? false,
                darkMode: user.settings.darkMode ?? false
            });
        }
    }, [user]);

    const handleSettingChange = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const API_URL = process.env.REACT_APP_API || '/api';
            const res = await fetch(`${API_URL}/users/settings`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                alert('Settings saved successfully!');
                if (onSettingsUpdate) await onSettingsUpdate();
                onClose();
            } else {
                const error = await res.json();
                alert(error.message || 'Error saving settings');
            }
        } catch (error) {
            alert('Error saving settings');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Account Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                            <h3 className="font-medium">Email Notifications</h3>
                            <p className="text-sm text-gray-600">Receive email updates about your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={() => handleSettingChange('emailNotifications')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                            <h3 className="font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.twoFactorAuth}
                                onChange={() => handleSettingChange('twoFactorAuth')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                        <div>
                            <h3 className="font-medium">Dark Mode</h3>
                            <p className="text-sm text-gray-600">Switch to dark theme</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.darkMode}
                                onChange={() => handleSettingChange('darkMode')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="pt-4">
                        <div className="bg-gray-50 p-3 rounded">
                            <h4 className="font-medium text-sm">Account Information</h4>
                            <div className="text-sm text-gray-600 mt-1">
                                <p>Role: <span className="font-medium capitalize">{user?.role}</span></p>
                                <p>Member since: <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal; 