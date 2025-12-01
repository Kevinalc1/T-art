import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './WishlistButton.css';

export default function WishlistButton({ productId, size = 'medium' }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { user } = useAuth();
    const navigate = useNavigate();
    const inWishlist = isInWishlist(productId);

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            if (window.confirm('Você precisa estar logado para adicionar à lista de desejos. Deseja fazer login?')) {
                navigate('/login');
            }
            return;
        }

        await toggleWishlist(productId);
    };

    return (
        <button
            className={`wishlist-button ${size} ${inWishlist ? 'active' : ''}`}
            onClick={handleClick}
            title={inWishlist ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
            aria-label={inWishlist ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
        >
            {inWishlist ? (
                <FaHeart className="heart-icon filled" />
            ) : (
                <FaRegHeart className="heart-icon outline" />
            )}
        </button>
    );
}
