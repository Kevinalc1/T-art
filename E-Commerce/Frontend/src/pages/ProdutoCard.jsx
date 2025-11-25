import React from 'react';
import { Link } from 'react-router-dom';
import './ProdutoCard.css';

export default function ProdutoCard({ produto }) {
  // Garante que o componente não quebre se o produto for nulo
  if (!produto) {
    return null;
  }

  // Pega a primeira imagem da galeria para usar como miniatura.
  const thumbnailUrl = produto.imageUrls && produto.imageUrls.length > 0 
    ? produto.imageUrls[0] 
    : 'https://via.placeholder.com/300x300.png?text=Sem+Imagem'; // Imagem placeholder

  return (
    <div className="produto-card">
      <img src={thumbnailUrl} alt={produto.productName} />
      <h3>{produto.productName}</h3>
      <p className="preco">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}</p>
      {/* A chave do problema: Usar produto._id para o link */}
      <Link to={`/produto/${produto._id}`} className="btn-detalhes">Ver Detalhes</Link>
    </div>
  );
}