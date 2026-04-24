import React from 'react';
import { ChevronLeft, User, Bell, Shield, Wallet, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export const Settings = () => {
    const navigate = useNavigate();
    const { logout, resetPassword, profile } = useAuth();

    const handleSecurityClick = async () => {
        if (!profile?.email) return;
        try {
            await resetPassword(profile.email);
            alert(`Password reset link sent to ${profile.email}`);
        } catch (error) {
            console.error(error);
            alert('Failed to send reset link.');
        }
    };

    const sections = [
        {
            title: 'Account Settings',
            items: [
                { id: 'profile', label: 'Edit Profile', icon: User, path: '/profile' },
                { id: 'security', label: 'Password & Security', icon: Shield },
                { id: 'notifications', label: 'Notification Settings', icon: Bell, path: '/notifications' },
            ]
        },
        {
            title: 'Payments & Wallet',
            items: [
                { id: 'wallet', label: 'Wallet Settings', icon: Wallet },
                { id: 'cards', label: 'Saved Cards', icon: CreditCard },
            ]
        },
        {
            title: 'Support',
            items: [
                { id: 'faq', label: 'Help & FAQ', icon: HelpCircle, path: '/faq' },
            ]
        }
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-6 sticky top-0 z-10">
                <div className="flex items-center space-x-4 max-w-2xl mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all">
                        <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">Settings</h1>
                </div>
            </div>

            <main className="px-6 py-8 max-w-2xl mx-auto space-y-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-4">
                        <h2 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{section.title}</h2>
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            {section.items.map((item, itemIdx) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === 'security') handleSecurityClick();
                                        else if (item.path) navigate(item.path);
                                    }}
                                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-0"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold text-gray-700">{item.label}</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-gray-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-4">
                    <button onClick={logout} className="w-full flex items-center space-x-4 p-5 text-red-500 font-bold hover:bg-red-50 transition-all rounded-[2rem] border border-transparent hover:border-red-100">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <span>Sign Out</span>
                    </button>
                </div>
            </main>
        </div>
    );
};
