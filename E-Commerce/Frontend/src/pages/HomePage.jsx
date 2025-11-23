import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom'; // Importa o Link
import ProductCard from '../components/ProductCard.jsx';

const API_URL = import.meta.env.VITE_API_URL;

export default function HomePage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/produtos`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Erro ao buscar produtos:", error));
  }, []); // Array vazio garante que o efeito rode apenas uma vez

  return (
    <>
      <section className="hero">
        <h1>Bem-vindo</h1>
        <p>Explore nosso catalogo de produtos.</p>
        {/* Adiciona um botão de call-to-action que leva para a loja */}
        <Link to="/loja" className="btn-cta">Ver Produtos</Link>
      </section>
      <section className="product-grid">
        <h2>Nossos Produtos</h2>
        <div className="grid-container">
          {products.map((produto) => (
            <ProductCard key={produto._id} produto={produto} />
          ))}
        </div>
      </section>
    </>
  );
}