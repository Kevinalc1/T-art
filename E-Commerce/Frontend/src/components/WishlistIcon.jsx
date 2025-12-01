import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { FaHeart } from 'react-icons/fa';
import './CartIcon.css'; // Reusing CartIcon styles for consistency

export default function WishlistIcon() {
    const { wishlistCount } = useWishlist();

    return (
        <Link to="/wishlist" className="cart-icon" title="Lista de Desejos">
            <FaHeart />
            {wishlistCount > 0 && <span className="contador">{wishlistCount}</span>}
        </Link>
    );
}
