import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import './HomePage.css';

const API_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  // Remove barra inicial se houver para evitar duplicidade com API_URL se ela já tiver barra
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  // Garante que API_URL não termine com barra (embora normalmente não termine)
  const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  return `${cleanApiUrl}/${cleanUrl}`;
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/produtos`);
        if (!response.ok) {
          throw new Error('Falha ao buscar produtos');
        }
        const data = await response.json();
        setProducts(data);

        // Coleta todos os mockups
        const allMockups = [];
        if (Array.isArray(data)) {
          data.forEach(product => {
            if (product.imageUrls && Array.isArray(product.imageUrls)) {
              product.imageUrls.forEach(url => {
                if (url) allMockups.push(url);
              });
            }
          });
        }

        console.log('Total mockups encontrados:', allMockups.length);

        // Embaralha e seleciona
        const shuffled = [...allMockups].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 10);
        setHeroImages(selected);

        console.log('Mockups selecionados para o hero:', selected);

      } catch (error) {
        console.error("Erro ao carregar homepage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Rotação automática
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

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
            {heroImages.map((image, index) => {
              const imgUrl = getImageUrl(image);
              if (index === 0) console.log('Renderizando imagem 0:', imgUrl);

              return (
                <div
                  key={index}
                  className={`hero-image ${index === currentImageIndex ? 'active' : ''}`}
                >
                  <img
                    src={imgUrl}
                    alt={`Destaque ${index + 1}`}
                    onError={(e) => {
                      console.error(`Erro ao carregar imagem ${index}:`, imgUrl);
                      e.target.style.display = 'none'; // Oculta se falhar
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {heroImages.length > 1 && (
          <div className="hero-indicators">
            {heroImages.map((_, index) => (
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