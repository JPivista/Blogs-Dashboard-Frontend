// ✅ RegisterPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const RegisterPage = ({ setUser, user }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    useEffect(() => {
        gsap.from('.register-box', {
            opacity: 0,
            y: 60,
            duration: 1,
            ease: 'power2.out',
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const API_URL = process.env.REACT_APP_API || '/api';
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.message || 'Registration failed');
                return;
            }

            const profile = await fetch(`${API_URL}/auth/profile`, {
                credentials: 'include',
            });

            const data = await profile.json();
            setUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#141E30] to-[#243B55] flex items-center justify-center">
            <div className="register-box bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-gray-900">
                <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                    >
                        Register
                    </button>
                    <p className="text-center mt-4">
                        Already have an account?{' '}
                        <a href="/" className="text-indigo-400 hover:underline">Login</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
