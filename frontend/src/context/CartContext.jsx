import React, { createContext, useContext, useState, useEffect } from 'react';
const CartContext = createContext(undefined);
export const CartProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            }
            catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);
    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);
    const addToCart = (product, quantity, size, color) => {
        setItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.productId === product.id && item.size === size && item.color === color);
            if (existingIndex > -1) {
                const newItems = [...prev];
                newItems[existingIndex].quantity += quantity;
                return newItems;
            }
            return [...prev, { productId: product.id, product, quantity, size, color }];
        });
    };
    const removeFromCart = (productId, size, color) => {
        setItems((prev) => prev.filter((item) => !(item.productId === productId && item.size === size && item.color === color)));
    };
    const updateQuantity = (productId, quantity, size, color) => {
        if (quantity <= 0) {
            removeFromCart(productId, size, color);
            return;
        }
        setItems((prev) => prev.map((item) => item.productId === productId && item.size === size && item.color === color
            ? { ...item, quantity }
            : item));
    };
    const clearCart = () => setItems([]);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
    return (<CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>);
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context)
        throw new Error('useCart must be used within a CartProvider');
    return context;
};
