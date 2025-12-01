import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCarrinho } from '../context/CarrinhoContext';
import WishlistButton from '../components/WishlistButton';
import './WishlistPage.css';

export default function WishlistPage() {
    const { wishlistItems, loading } = useWishlist();
    const { adicionarItem } = useCarrinho();

    const handleAddToCart = (product) => {
        adicionarItem({
            ...product,
            quantidade: 1
        });
        alert('Produto adicionado ao carrinho!');
    };

    if (loading) {
        return (
            <div className="wishlist-container">
                <h1>Minha Lista de Desejos</h1>
                <p>Carregando...</p>
            </div>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <div className="wishlist-container">
                <div className="wishlist-empty">
                    <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <h2>Sua lista de desejos está vazia</h2>
                    <p>Adicione produtos que você gostaria de comprar mais tarde</p>
                    <Link to="/" className="btn-continue-shopping">
                        Continuar Comprando
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <h1>Minha Lista de Desejos</h1>
            <p className="wishlist-count">{wishlistItems.length} {wishlistItems.length === 1 ? 'produto' : 'produtos'}</p>

            <div className="wishlist-grid">
                {wishlistItems.map((product) => (
                    <div key={product._id} className="wishlist-item">
                        <div className="wishlist-item-image">
                            <Link to={`/produto/${product._id}`}>
                                <img
                                    src={product.imageUrls && product.imageUrls[0]}
                                    alt={product.productName}
                                />
                            </Link>
                            <WishlistButton productId={product._id} size="medium" />
                        </div>

                        <div className="wishlist-item-info">
                            <Link to={`/produto/${product._id}`} className="wishlist-item-name">
                                {product.productName}
                            </Link>

                            <p className="wishlist-item-price">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(product.price)}
                            </p>

                            <button
                                className="btn-add-to-cart"
                                onClick={() => handleAddToCart(product)}
                            >
                                Adicionar ao Carrinho
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
