import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
const WishlistContext = createContext(undefined);
export const WishlistProvider = ({ children }) => {
    const { profile, user, updateProfile } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    useEffect(() => {
        if (profile?.wishlist) {
            setWishlist(profile.wishlist);
        }
        else {
            const savedWishlist = localStorage.getItem('guest_wishlist');
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist));
            } else {
                setWishlist([]);
            }
        }
    }, [profile]);

    const saveWishlist = async (updatedWishlist) => {
        setWishlist(updatedWishlist);
        if (user && profile) {
            try {
                const updatedProfile = await api.updateUser(user.uid, { wishlist: updatedWishlist });
                updateProfile(updatedProfile);
            } catch (error) {
                console.error('Error syncing wishlist:', error);
            }
        } else {
            localStorage.setItem('guest_wishlist', JSON.stringify(updatedWishlist));
        }
    };

    const addToWishlist = async (product) => {
        if (wishlist.some(p => p.id === product.id)) return;
        const updatedWishlist = [...wishlist, product];
        await saveWishlist(updatedWishlist);
    };

    const removeFromWishlist = async (productId) => {
        const updatedWishlist = wishlist.filter(p => p.id !== productId);
        await saveWishlist(updatedWishlist);
    };
    const isInWishlist = (productId) => {
        return wishlist.some(p => p.id === productId);
    };
    const toggleWishlist = async (product) => {
        if (isInWishlist(product.id)) {
            await removeFromWishlist(product.id);
        }
        else {
            await addToWishlist(product);
        }
    };
    return (<WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>);
};
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
