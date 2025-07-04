import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/auth';

const Card = ({ title, value, icon, color = "blue" }) => (
    <div className="bg-white p-6 rounded shadow flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 mr-4`}>
            {icon}
        </div>
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-gray-500">{title}</div>
        </div>
    </div>
);

const SuperadminDashboard = ({ user, setUser, onEditProfile, onChangePassword, onAccountSettings }) => {
    const [stats, setStats] = useState({ totalBlogs: '-', blogsUpdatedLastMonth: '-' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = process.env.REACT_APP_API || '/api';
                const res = await fetch(`${API_URL}/blogs/stats`, { credentials: 'include' });
                const data = await res.json();
                setStats({
                    totalBlogs: data.totalBlogs || 0,
                    blogsUpdatedLastMonth: data.blogsUpdatedLastMonth || 0,
                });
            } catch {
                setStats({ totalBlogs: '-', blogsUpdatedLastMonth: '-' });
            }
        };
        fetchStats();
    }, []);

    const formatLastLogin = (lastLogin) => {
        if (!lastLogin) return 'Never';
        const date = new Date(lastLogin);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInHours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    };

    // Logout function
    const handleLogout = async () => {
        try {
            await logoutUser();
            setUser(null);
            navigate('/');
        } catch (error) {
            setUser(null);
            navigate('/');
        }
    };

    // Update user profile
    const handleProfileUpdate = (updatedUser) => {
        setUser(prev => ({ ...prev, ...updatedUser }));
    };

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.name}! 👋</h1>
                    <p className="text-gray-600">Superadmin dashboard - Full control over the system.</p>
                </div>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card
                    title="Total Blogs"
                    value={stats.totalBlogs}
                    icon="📝"
                    color="blue"
                />
                <Card
                    title="Blogs Updated Last Month"
                    value={stats.blogsUpdatedLastMonth}
                    icon="📊"
                    color="green"
                />
                <Card
                    title="Last Login"
                    value={formatLastLogin(user.lastLogin)}
                    icon="🕒"
                    color="purple"
                />
                {/* <Card
                    title="Total Logins"
                    value={user.loginCount || 0}
                    icon="📈"
                    color="orange"
                /> */}
                {/* <Card
                    title="Your Role"
                    value={user.role}
                    icon="👑"
                    color="red"
                /> */}
            </div>
            {/* SuperAdmin Profile Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Role:</span>
                            <span className="font-medium capitalize">{user.role}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Login Count:</span>
                            <span className="font-medium">{user.loginCount || 0} times</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Last Login:</span>
                            <span className="font-medium">{formatLastLogin(user.lastLogin)}</span>
                        </div>
                    </div>
                </div>
                {/* Quick Actions */}
                {/* <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button
                            onClick={onEditProfile}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                        >
                            📝 Edit Profile
                        </button>
                        <button
                            onClick={onChangePassword}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300"
                        >
                            🔒 Change Password
                        </button>
                        <button
                            onClick={onAccountSettings}
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition duration-300"
                        >
                            ⚙️ Account Settings
                        </button>
                    </div>
                </div> */}
            </div>
            {/* Create User Form */}
            {/* <CreateUser allowedRoles={['user', 'admin']} user={user} setUser={setUser} /> */}
        </>
    );
};

export default SuperadminDashboard;
