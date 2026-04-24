import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { api } from '../services/api';

const AuthContext = createContext({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
    adminLogin: null,
    logout: null,
    updateProfile: null,
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for admin/dev session on mount
    useEffect(() => {
        let isSubscribed = true;

        const initAuth = async () => {
            const savedAdmin = localStorage.getItem('adminSession');
            if (savedAdmin) {
                try {
                    const adminData = JSON.parse(savedAdmin);
                    if (isSubscribed) {
                        setUser(adminData.user);
                        setProfile(adminData.user);
                        setLoading(false);
                        // We still set up the Firebase listener in case they switch accounts
                    }
                } catch {
                    localStorage.removeItem('adminSession');
                }
            }

            // Always listen for Firebase auth changes
            const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
                if (!isSubscribed) return;

                // Priority to adminSession if it still exists after Firebase fires
                const hasAdmin = !!localStorage.getItem('adminSession');
                
                if (firebaseUser) {
                    setUser(firebaseUser);
                    try {
                        const userProfile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || 'User',
                            photoURL: firebaseUser.photoURL || '',
                            role: 'user',
                            createdAt: new Date().toISOString(),
                            addresses: [],
                            wishlist: [],
                        };
                        
                        // Sync with backend
                        const synced = await api.syncUser(userProfile);
                        if (isSubscribed && !hasAdmin) {
                            setProfile(synced);
                        }
                    } catch (error) {
                        console.error('Error syncing user profile:', error);
                        if (isSubscribed && !hasAdmin) setProfile(null);
                    }
                } else {
                    if (!hasAdmin) {
                        setUser(null);
                        setProfile(null);
                    }
                }
                setLoading(false);
            });

            return unsubscribeAuth;
        };

        const unsubPromise = initAuth();
        return () => {
            isSubscribed = false;
            unsubPromise.then(unsub => unsub && unsub());
        };
    }, []);

    // Admin login function - called from Login page
    const adminLogin = (token, userData) => {
        const sessionData = { token, user: userData };
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminSession', JSON.stringify(sessionData));
        setUser(userData);
        setProfile(userData);
        setLoading(false);
    };

    // Development-only manual login helper.
    const devLogin = () => {
        if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_DEBUG_AUTH_BYPASS !== 'true') {
            throw new Error('Debug auth bypass is disabled');
        }
        const mockUser = {
            uid: 'testuser_123',
            email: 'test@onestep.com',
            displayName: 'Test User (Dev)',
            photoURL: '',
            role: 'user',
            createdAt: new Date().toISOString()
        };
        const token = 'onestep-debug-user-token';
        localStorage.setItem('adminToken', token); // using adminToken slot for interceptor
        localStorage.setItem('adminSession', JSON.stringify({ token, user: mockUser }));
        setUser(mockUser);
        setProfile(mockUser);
        setLoading(false);
    };

    // Logout — clears both admin session and Firebase auth
    const logout = async () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminSession');
        try { await signOut(auth); } catch { /* ignore */ }
        setUser(null);
        setProfile(null);
    };

    const resetPassword = async (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const updateProfile = (data) => {
        setProfile(prev => prev ? { ...prev, ...data } : null);
    };

    const value = {
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        adminLogin,
        devLogin,
        logout,
        resetPassword,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
