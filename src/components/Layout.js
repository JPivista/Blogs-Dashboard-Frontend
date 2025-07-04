import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ProfileModal from './ProfileModal';
import PasswordModal from './PasswordModal';
import SettingsModal from './SettingsModal';
import { getProfile } from '../api/auth';

const Layout = ({ user, setUser, onLogout, children }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Update user profile
    const handleProfileUpdate = (updatedUser) => {
        setUser && setUser(prev => ({ ...prev, ...updatedUser }));
    };

    const handleSettingsUpdate = async () => {
        const res = await getProfile();
        setUser && setUser(res.data.user);
    };

    // Debug: log children
    console.log('Layout children:', children);

    // Inject modal openers as props into children
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // Debug: log child type
            console.log('Cloning child:', child.type?.name || child.type);
            return React.cloneElement(child, {
                onEditProfile: () => setShowProfileModal(true),
                onChangePassword: () => setShowPasswordModal(true),
                onAccountSettings: () => setShowSettingsModal(true),
            });
        }
        return child;
    });

    return (
        <div className="flex h-screen  bg-gray-100 overflow-hidden">
            <Sidebar user={user} onLogout={onLogout} />
            <div className="flex-1 flex flex-col">
                <Topbar
                    user={user}
                    onEditProfile={() => setShowProfileModal(true)}
                    onSettings={() => setShowSettingsModal(true)}
                    onLogout={onLogout}
                />
                <main className='h-screen p-8 overflow-y-scroll w-full'>
                    {childrenWithProps}
                </main>
            </div>
            {/* Modals */}
            <ProfileModal
                user={user}
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                onUpdate={handleProfileUpdate}
            />
            <PasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
            <SettingsModal
                user={user}
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                onSettingsUpdate={handleSettingsUpdate}
            />
        </div>
    );
};

export default Layout; 