import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import './HomePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await fetch(`${API_URL}/api/produtos`);
        if (!productsResponse.ok) throw new Error('Falha ao buscar produtos');
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error("Erro ao carregar homepage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  return (
    <div className="home-container">
      {/* 1. Hero Section with Static Banner */}
      <header className="hero-header">
        {/* Static Hero Banner */}
        <div className="hero-banner">
          <img src="/hero-banner.png" alt="GENS Artes Sublimação" className="hero-banner-image" />
        </div>

        {/* Content (stays on top) */}
        <div className="hero-content-container">
          <span className="hero-subtitle">Nova Coleção 2026</span>
          <h1 className="hero-title">Encontre sua arte. <br /> Vista sua essência.</h1>
          <p className="hero-description">
            Descubra estampas exclusivas criadas por artistas independentes.
            Moda com propósito, qualidade e design único.
          </p>
          <div className="hero-actions">
            <Link to="/loja" className="btn-primary-hero">
              Explorar Coleção
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Products Grid */}
      <section className="products-section">
        <div className="section-header">
          <h2>Estampas em Destaque</h2>
          <p>As estampas mais desejadas da semana</p>
        </div>

        <div className="products-grid">
          {loading ? (
            <p className="loading-text">Carregando estampas...</p>
          ) : products.length > 0 ? (
            products.slice(0, 8).map(product => (
              <ProductCard key={product._id} produto={product} />
            ))
          ) : (
            <p className="loading-text">Nenhuma estampa encontrada.</p>
          )}
        </div>

        <div className="view-all-container">
          <Link to="/loja" className="btn-view-all">Ver Toda a Loja</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;