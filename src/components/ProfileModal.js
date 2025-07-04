import React, { useState, useEffect } from 'react';

const ProfileModal = ({ user, isOpen, onClose, onUpdate }) => {
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setForm({
            name: user?.name || '',
            email: user?.email || ''
        });
    }, [user, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const API_URL = process.env.REACT_APP_API || '/api';
            const res = await fetch(`${API_URL}/users/profile`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const data = await res.json();
                onUpdate(data.user);
                onClose();
                alert('Profile updated successfully!');
            } else {
                const error = await res.json();
                alert(error.message || 'Error updating profile');
            }
        } catch (error) {
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal; 