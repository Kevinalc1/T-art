import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductCard({ produto }) {
  if (!produto) return null;

  let thumbnailUrl = 'https://dummyimage.com/300x300/cccccc/000000.png&text=Sem+Imagem';

  if (produto.imageUrls && produto.imageUrls.length > 0) {
    const url = produto.imageUrls[0];
    if (url.startsWith('http') || url.startsWith('data:')) {
      thumbnailUrl = url;
    } else {
      // Trata URL relativa para uploads locais
      const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
      const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      thumbnailUrl = `${cleanApiUrl}/${cleanUrl}`;
    }
  }

  return (
    <div className="produto-card">
      <img src={thumbnailUrl} alt={produto.productName} />
      <div className="card-info">
        <h3>{produto.productName}</h3>
        <p className="price">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
        </p>
        <Link to={`/produto/${produto._id}`} className="btn-detalhes">Ver Detalhes</Link>
      </div>
    </div>
  );
}