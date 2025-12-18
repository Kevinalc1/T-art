import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import CircularGallery from '../components/CircularGallery.jsx';
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

  // Memoize items to prevent CircularGallery re-initialization on every render
  const galleryItems = React.useMemo(() => {
    return heroItems.map(item => ({
      image: isBannerMode ? getImageUrl(item.imageUrl) : getImageUrl(item),
      text: ''
    }));
  }, [heroItems, isBannerMode]);

  return (
    <div className="home-container">
      {/* Hero Section Replaced with CircularGallery */}
      <section className="hero-carousel" style={{ height: '600px', position: 'relative', overflow: 'hidden' }}>
        {/* Circular Gallery Foreground */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          {heroItems.length > 0 && (
            <CircularGallery
              items={galleryItems}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              font="bold 30px Playfair Display"
            />
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <h2 style={{ color: '#ffffff' }}>Estampas em Destaque</h2>
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