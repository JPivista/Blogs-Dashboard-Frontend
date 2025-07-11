import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUser, FiSettings, FiLogOut, FiMenu, FiUsers, FiUserPlus, FiTag } from 'react-icons/fi';
import { FaUserCheck } from 'react-icons/fa'; // or MdOutlinePersonSearch

const getNavItems = (role) => {
    if (role === 'superadmin') {
        return [
            { name: 'Dashboard', path: '/superadmin', icon: <FiHome /> },
            { name: 'All Blogs', path: '/blogs', icon: <FiUsers /> },
            { name: 'Categories', path: '/categories', icon: <FiTag /> },
            { name: 'Lead', path: '/lead', icon: <FaUserCheck /> },
            { name: 'Settings', path: '/settings', icon: <FiSettings /> },
        ];
    } else {
        return [];
    }
};

const Sidebar = ({ user, onLogout, isOpen, onToggle }) => {
    const location = useLocation();
    const navItems = getNavItems(user?.role);

    return (
        <aside className={`fixed z-40 top-0 left-0 h-screen w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 md:relative md:translate-x-0 md:w-64 md:block`}>

            <div className='flex flex-col justify-between h-screen'>
                <div className="flex items-center justify-between h-16 px-6 border-b">
                    <span className="font-bold text-xl text-blue-600"><img src="/nypunya-logo_new.png" alt="Nypunya Logo" className="" /></span>
                    <button className="md:hidden text-2xl" onClick={onToggle}>
                        <FiMenu />
                    </button>
                </div>
                <nav className="flex-1 py-6 px-4 space-y-2">
                    {navItems.map(item => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${location.pathname === item.path ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
                            onClick={onToggle}
                        >
                            <span className="text-xl mr-3">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="px-4 py-6 border-t">
                    <div className="mb-2 text-sm text-gray-600">{user?.email}</div>
                    <div className="mb-4 text-xs text-gray-400">{user?.role}</div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        <FiLogOut className="mr-2" /> Logout
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar; 