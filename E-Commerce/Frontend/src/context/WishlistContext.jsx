import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    // Carregar wishlist do backend quando usuário estiver logado
    useEffect(() => {
        if (user && token) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [user, token]);

    const fetchWishlist = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWishlistItems(data);
            }
        } catch (error) {
            console.error('Erro ao carregar wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        if (!token) {
            alert('Por favor, faça login para adicionar produtos à lista de desejos.');
            return false;
        }

        try {
            const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setWishlistItems(data.wishlist);
                return true;
            } else {
                alert(data.message || 'Erro ao adicionar à wishlist');
                return false;
            }
        } catch (error) {
            console.error('Erro ao adicionar à wishlist:', error);
            alert('Erro ao adicionar à wishlist');
            return false;
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!token) return false;

        try {
            const response = await fetch(`${API_URL}/api/wishlist/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setWishlistItems(data.wishlist);
                return true;
            } else {
                alert(data.message || 'Erro ao remover da wishlist');
                return false;
            }
        } catch (error) {
            console.error('Erro ao remover da wishlist:', error);
            alert('Erro ao remover da wishlist');
            return false;
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId);
    };

    const toggleWishlist = async (productId) => {
        if (isInWishlist(productId)) {
            return await removeFromWishlist(productId);
        } else {
            return await addToWishlist(productId);
        }
    };

    const value = {
        wishlistItems,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        wishlistCount: wishlistItems.length
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
