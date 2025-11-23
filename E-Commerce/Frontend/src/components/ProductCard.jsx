import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css'; // Este caminho agora deve funcionar

export default function ProductCard({ produto }) {
  // Garante que o componente não quebre se o objeto produto for nulo ou indefinido
  if (!produto) {
    return null;
  }

  // Pega a primeira imagem da galeria para usar como miniatura.
  const thumbnailUrl = produto.imageUrls && produto.imageUrls.length > 0 ? produto.imageUrls[0] : 'https://dummyimage.com/300x300/cccccc/000000.png&text=Sem+Imagem'; // Imagem placeholder mais confiável

  return (
  <div className="produto-card">
    <img src={produto.imageUrls[0]} alt={produto.productName} />
    <div className="card-info"> {/* NOVA DIV */}
      <h3>{produto.productName}</h3>
      <p className="price">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
      </p>
      <Link to={`/produto/${produto._id}`} className="btn-detalhes">Ver Detalhes</Link>
    </div>
  </div>
);
}