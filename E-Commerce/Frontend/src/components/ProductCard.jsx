import React from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { useCurrency } from '../context/CurrencyContext';
import { toast } from 'react-toastify';
import { trackAddToCart } from '../utils/analytics.js';
import './ProductCard.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductCard({ produto }) {
  const { adicionarItem, state } = useCarrinho();
  const { formatPrice } = useCurrency();
  if (!produto) return null;

  let thumbnailUrl = 'https://dummyimage.com/300x300/cccccc/000000.png&text=Sem+Imagem';

  if (produto.imageUrls && produto.imageUrls.length > 0) {
    const url = produto.imageUrls[0];
    if (url.startsWith('http') || url.startsWith('data:')) {
      thumbnailUrl = url;
    } else {
      const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
      const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      thumbnailUrl = `${cleanApiUrl}/${cleanUrl}`;
    }
  }

  const handleAdicionarAoCarrinho = (e) => {
    // Prevent navigation to product details when clicking button
    e.preventDefault();
    e.stopPropagation();

    const itemNoCarrinho = state.items.find(item => item._id === produto._id);

    if (itemNoCarrinho) {
      toast.info('Este produto já está no seu carrinho.', {
        position: "bottom-right",
        autoClose: 2000,
        style: { fontFamily: 'Inter, sans-serif' }
      });
      return;
    }

    adicionarItem(produto);

    // Track add to cart event
    trackAddToCart(produto, 1);

    toast.success('Adicionado à sacola!', {
      position: "bottom-right",
      autoClose: 3000,
      icon: "🛍️",
      style: { fontFamily: 'Inter, sans-serif' }
    });
  };

  return (
    <div className="product-card group">
      {/* 1. Área da Imagem (Foco no Produto) */}
      <div className="card-image-wrapper">
        <Link to={`/produto/${produto._id}`} className="image-link">
          <img
            src={thumbnailUrl}
            alt={produto.productName}
            className="product-image"
          />
          {/* Badge Opcional */}
          <span className="category-badge">Destaque</span>

          {/* Urgency Badges */}
          {produto.price > 50 && (
            <span className="urgency-badge best-seller">🔥 Mais Vendido</span>
          )}
          {produto.price < 30 && (
            <span className="urgency-badge limited-offer">⚡ Oferta</span>
          )}
        </Link>
      </div>

      {/* 2. Área de Conteúdo */}
      <div className="card-content">
        <div className="card-header">
          <Link to={`/produto/${produto._id}`} className="title-link">
            <h3 className="product-title">{produto.productName}</h3>
          </Link>
          <p className="product-category">Arte Exclusiva</p>

          <span className="current-price">
            {(() => {
              const numericPrice = parseFloat(produto.price);
              return (numericPrice && numericPrice > 0) ? formatPrice(numericPrice) : 'Sob Consulta';
            })()}
          </span>
        </div>

        {/* 3. Área de Ação (CTA Unificado) */}
        <div className="card-actions">
          <button
            onClick={handleAdicionarAoCarrinho}
            className="btn-add-cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Adicionar à Sacola
          </button>

          <Link to={`/produto/${produto._id}`} className="link-details">
            Ver detalhes do produto
          </Link>
        </div>
      </div>
    </div>
  );
}