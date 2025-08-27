// ✅ LoginPage.js (Universal for All Roles)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { loginUser } from '../api/auth';

const LoginPage = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        gsap.from(".login-box", {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power2.out",
        });
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await loginUser(email, password);
            const userData = response.data.user;

            // Cache user data for faster refresh
            localStorage.setItem('cachedUser', JSON.stringify(userData));

            setUser(userData);

            // Navigation will be handled by App.js routing
            const role = userData.role;
            if (role === 'superadmin') navigate('/superadmin');
            else if (role === 'admin') navigate('/admin');
            else navigate('/dashboard');
        } catch (err) {
            alert("Login failed. Please check your credentials.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center text-white">
            <div className="login-box bg-white text-gray-900 rounded-2xl shadow-lg p-10 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login to Your Dashboard</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <p className="text-center mt-4">
                        Don't have an account?{' '}
                        <a href="/register" className="text-blue-400 hover:underline">Register</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
