import React, { useState, useRef, useEffect } from 'react';
import { FiMenu, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const getTitle = (role) => {
    if (role === 'superadmin') return 'Superadmin Dashboard';
    return '';
};

const Topbar = ({ user, onMenuClick, onEditProfile, onSettings, onLogout }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 flex items-center p-4 md:px-8 justify-between shadow bg-white z-50">
            <button className="md:hidden text-2xl" onClick={onMenuClick}>
                <FiMenu />
            </button>
            <div className="font-bold text-lg">{getTitle(user?.role)}</div>
            <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen((open) => !open)} className="focus:outline-none">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`} alt="avatar" className="w-8 h-8 rounded-full border-2 border-blue-500" />
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border">
                        <button
                            onClick={() => { setDropdownOpen(false); onEditProfile && onEditProfile(); }}
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                            <FiUser className="mr-2" /> Edit Profile
                        </button>
                        <button
                            onClick={() => { setDropdownOpen(false); onSettings && onSettings(); }}
                            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50"
                        >
                            <FiSettings className="mr-2" /> Settings
                        </button>
                        <button
                            onClick={() => { setDropdownOpen(false); onLogout && onLogout(); }}
                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                        >
                            <FiLogOut className="mr-2" /> Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Topbar; 