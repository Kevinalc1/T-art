import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import './ProdutoDetalhePage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProdutoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem, state } = useCarrinho();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantidade] = useState(1);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/api/produtos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Produto não encontrado');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        if (data && data.imageUrls && data.imageUrls.length > 0) {
          setSelectedImage(data.imageUrls[0]);
        }
      })
      .catch(error => {
        console.error("Erro ao buscar o produto:", error);
        setProduct({ notFound: true });
      });
  }, [id]);

  const handleAdicionar = () => {
    const itemNoCarrinho = state.items.find(item => item._id === product._id);

    if (itemNoCarrinho) {
      toast.error('Esse produto já foi adicionado ao carrinho, Finalize sua compra', {
        style: { background: '#d32f2f', color: '#fff' }
      });
      return;
    }

    adicionarItem({
      ...product,
      quantidade: quantidade,
    });
    toast.success('Item adicionado ao carrinho!');
  };

  const handleComprarAgora = () => {
    const itemNoCarrinho = state.items.find(item => item._id === product._id);

    if (!itemNoCarrinho) {
      adicionarItem({
        ...product,
        quantidade: quantidade,
      });
    }
    navigate('/checkout');
  };

  if (!product) return <div className="loading-container"><h1>Carregando...</h1></div>;
  if (product.notFound) return <div className="error-container"><h1>Produto não encontrado</h1></div>;

  return (
    <div className="produto-detalhe-page">
      <button className="btn-voltar" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Voltar
      </button>

      <div className="produto-detalhe-container">
        {/* Coluna da Esquerda: Imagens */}
        <div className="coluna-imagem">
          <div className="imagem-principal-wrapper">
            {selectedImage && (
              <img src={selectedImage} alt={product.productName} className="imagem-principal" />
            )}
          </div>

          <div className="miniaturas-galeria">
            {product.imageUrls && product.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${product.productName} - miniatura ${index + 1}`}
                className={`miniatura-item ${url === selectedImage ? 'ativa' : ''}`}
                onClick={() => setSelectedImage(url)}
                onMouseOver={() => setSelectedImage(url)}
              />
            ))}
          </div>
        </div>

        {/* Coluna da Direita: Informações */}
        <div className="coluna-info">
          <span className="produto-categoria-tag">Arte Exclusiva</span>
          <h1>{product.productName}</h1>

          <div className="produto-preco-wrapper">
            <span className="produto-preco-destaque">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="acoes-detalhe">
            <button className="btn-adicionar-carrinho" onClick={handleAdicionar}>
              Adicionar ao Carrinho
            </button>
            <button className="btn-comprar-agora" onClick={handleComprarAgora}>
              Comprar Agora
            </button>
          </div>

          <div className="produto-descricao">
            <h3>Descrição do Produto</h3>
            <p>{product.description || 'Sem descrição disponível.'}</p>

            <div className="features-list">
              <h3>Arquivos Inclusos:</h3>
              <ul>
                <li>✅ PNG (Fundo Transparente)</li>
                <li>✅ CDR (Vetor CorelDraw)</li>
                <li>✅ JPG (Alta Resolução)</li>
              </ul>
            </div>

            {product.isCombo && product.comboProducts && product.comboProducts.length > 0 && (
              <div className="combo-items">
                <h3>Neste pacote você recebe:</h3>
                <ul>
                  {product.comboProducts.map(subProd => (
                    <li key={subProd._id}>{subProd.productName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}