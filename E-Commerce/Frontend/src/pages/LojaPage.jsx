import React, { useState, useEffect } from 'react';
import ProdutoCard from '../components/ProductCard.jsx';
import './LojaPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function LojaPage() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    // Busca os produtos da API quando o componente é montado
    fetch(`${API_URL}/api/produtos`)
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((error) => console.error('Erro ao buscar produtos:', error));
  }, []); // O array vazio garante que o efeito rode apenas uma vez

  return (
    <div className="loja-page">
      <h1>Nossa Loja</h1>

      {/* Seção de Controles de Busca e Filtro */}
      <div className="loja-controles">
        <div className="campo-busca">
          <input type="text" placeholder="Buscar por nome..." />
        </div>
        <div className="campo-filtro">
          <select>
            <option value="">Filtrar por categoria</option>
          </select>
        </div>
      </div>

      <div className="produtos-grid">
        {produtos.length > 0 ? (
          produtos.map((produto) => (
            <ProdutoCard key={produto._id} produto={produto} />
          ))
        ) : (
          <p>Nenhum produto encontrado.</p>
        )}
      </div>
    </div>
  );
}