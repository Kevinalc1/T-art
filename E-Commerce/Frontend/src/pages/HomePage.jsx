import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import './HomePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${cleanApiUrl}/${cleanUrl}`;
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroItems, setHeroItems] = useState([]); // Can be banners or mockups
  const [loading, setLoading] = useState(true);
  const [isBannerMode, setIsBannerMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Banners
        const bannersResponse = await fetch(`${API_URL}/api/banners?position=hero`);
        const bannersData = await bannersResponse.json();

        if (bannersData && bannersData.length > 0) {
          setHeroItems(bannersData);
          setIsBannerMode(true);
        } else {
          // 2. Fallback to Product Mockups
          const productsResponse = await fetch(`${API_URL}/api/produtos`);
          if (!productsResponse.ok) throw new Error('Falha ao buscar produtos');
          const productsData = await productsResponse.json();
          setProducts(productsData);

          const allMockups = [];
          if (Array.isArray(productsData)) {
            productsData.forEach(product => {
              if (product.imageUrls && Array.isArray(product.imageUrls)) {
                product.imageUrls.forEach(url => {
                  if (url) allMockups.push(url);
                });
              }
            });
          }

          const shuffled = [...allMockups].sort(() => Math.random() - 0.5);
          setHeroItems(shuffled.slice(0, 10));
          setIsBannerMode(false);
        }
      } catch (error) {
        console.error("Erro ao carregar homepage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Rotação automática
  useEffect(() => {
    if (heroItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroItems.length]);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-carousel">
        <div className="hero-content-wrapper">
          <div className="hero-content">
            <h1>Encontre sua arte<br />vista sua paixão.</h1>
            <p>Descubra coleções exclusivas e personalize seu estilo</p>
            <Link to="/loja" className="hero-btn">
              Compre Agora
            </Link>
          </div>

          <div className="hero-images">
            {heroItems.map((item, index) => {
              // Determine URL based on whether it's a banner object or a mockup string
              const imgUrl = isBannerMode ? getImageUrl(item.imageUrl) : getImageUrl(item);
              const linkUrl = isBannerMode ? item.linkUrl : null;

              return (
                <div
                  key={index}
                  className={`hero-image ${index === currentImageIndex ? 'active' : ''}`}
                >
                  {linkUrl ? (
                    <Link to={linkUrl}>
                      <img
                        src={imgUrl}
                        alt={isBannerMode ? item.title : `Destaque ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </Link>
                  ) : (
                    <img
                      src={imgUrl}
                      alt={isBannerMode ? item.title : `Destaque ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {heroItems.length > 1 && (
          <div className="hero-indicators">
            {heroItems.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <h2>Estampas em Destaque</h2>
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
      </section>
    </div>
  );
};

export default HomePage;