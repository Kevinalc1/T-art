import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { toast } from 'react-toastify';
import './ProdutoDetalhePage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProdutoDetalhePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { adicionarItem, state } = useCarrinho(); // Access cart state to check duplicates
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const response = await fetch(`${API_URL}/api/produtos/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduto(data);
          if (data && data.imageUrls && data.imageUrls.length > 0) {
            setSelectedImage(data.imageUrls[0]);
          } else if (data.imageUrl) {
            // Fallback for old data without imageUrls array
            setSelectedImage(data.imageUrl);
          }
        } else {
          console.error("Produto não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id]);

  const handleAddToCart = () => {
    if (!produto) return;

    // Check if product is already in cart
    const exists = state.items.find(item => item._id === produto._id);

    if (exists) {
      toast.info(t('product.jaNoCarrinho'));
      return;
    }

    adicionarItem(produto);
    toast.success(t('product.adicionadoSucesso'));
  };

  const handleBuyNow = () => {
    if (!produto) return;

    // Add to cart if not already present
    const exists = state.items.find(item => item._id === produto._id);
    if (!exists) {
      adicionarItem(produto);
    }

    navigate('/checkout');
  };

  if (loading) {
    return <div className="produto-detalhe-page loading">{t('product.carregando')}</div>;
  }

  if (!produto) {
    return <div className="produto-detalhe-page error">Produto não encontrado.</div>;
  }

  return (
    <div className="produto-detalhe-page">
      <Link to="/loja" className="btn-voltar">
        &larr; {t('product.voltarLoja')}
      </Link>

      <div className="produto-detalhe-container">
        <div className="produto-imagem-grande">
          {selectedImage ? (
            <img src={selectedImage} alt={produto.productName} />
          ) : (
            <div className="no-image">Sem Imagem</div>
          )}

          {/* Gallery Thumbnails if multiple images exist */}
          {produto.imageUrls && produto.imageUrls.length > 1 && (
            <div className="miniaturas-galeria" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              {produto.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Thumb ${index}`}
                  onClick={() => setSelectedImage(url)}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImage === url ? '2px solid var(--cor-acento)' : '1px solid #ddd'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="produto-info-completa">
          <span className="produto-categoria-tag">
            {produto.category?.name || t('product.categoria')}
          </span>
          <h1>{produto.productName}</h1>
          <p className="produto-preco-destaque">
            {formatPrice(produto.price)}
          </p>

          <div className="produto-descricao">
            <h3>{t('product.descricao')}</h3>
            <p>{produto.description || 'Sem descrição.'}</p>
          </div>

          <div className="acoes-compra" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={handleAddToCart} className="btn-adicionar-carrinho-grande">
              {t('commons.adicionarCarrinho')}
            </button>
            <button onClick={handleBuyNow} className="btn-comprar-agora">
              Comprar Agora
            </button>
          </div>

          <div className="produto-meta">
            <p><strong>{t('product.formato')}:</strong> PNG, SVG</p>
            <p><strong>{t('product.resolucao')}:</strong> Alta Qualidade (300 DPI)</p>
          </div>
        </div>
      </div>
    </div>
  );
}