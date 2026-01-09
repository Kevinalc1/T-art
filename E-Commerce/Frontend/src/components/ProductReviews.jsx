import React from 'react';
import { FaStar } from 'react-icons/fa';
import './ProductReviews.css';

const ProductReviews = ({ productId }) => {
    // Mock reviews - replace with real data from backend later
    const mockReviews = [
        {
            id: 1,
            author: 'Maria Silva',
            rating: 5,
            date: '2026-01-05',
            text: 'Artes incríveis! A qualidade dos arquivos é excelente e o download foi instantâneo. Super recomendo!'
        },
        {
            id: 2,
            author: 'João Santos',
            rating: 5,
            date: '2026-01-03',
            text: 'Perfeito para sublimação. Os vetores vieram bem detalhados e prontos para usar. Valeu muito a pena!'
        },
        {
            id: 3,
            author: 'Ana Costa',
            rating: 4,
            date: '2025-12-28',
            text: 'Muito bom! As artes são lindas e de alta resolução. Só senti falta de mais opções de cores, mas no geral estou satisfeita.'
        }
    ];

    const averageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={index < rating ? 'star' : 'star empty'}
            />
        ));
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <div className="product-reviews">
            <div className="reviews-header">
                <h3>⭐ Avaliações de Clientes</h3>
                <div className="reviews-summary">
                    <span className="average-rating">{averageRating}</span>
                    <div className="star-rating">
                        {renderStars(Math.round(averageRating))}
                    </div>
                    <span className="reviews-count">({mockReviews.length} avaliações)</span>
                </div>
            </div>

            {mockReviews.length > 0 ? (
                <div className="reviews-list">
                    {mockReviews.map((review) => (
                        <div key={review.id} className="review-item">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        {getInitials(review.author)}
                                    </div>
                                    <div className="reviewer-details">
                                        <h4>{review.author}</h4>
                                        <div className="review-date">{formatDate(review.date)}</div>
                                    </div>
                                </div>
                                <div className="star-rating">
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            <p className="review-text">{review.text}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-reviews">
                    <div className="no-reviews-icon">💬</div>
                    <h4>Seja o primeiro a avaliar!</h4>
                    <p>Compartilhe sua experiência com este produto.</p>
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
