import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import './ProdutoDetalhePage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProdutoDetalhePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantidade, setQuantidade] = useState(1);

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
    adicionarItem({
      ...product,
      quantidade: quantidade,
    });
    alert('Item adicionado ao carrinho!');
  };

  const handleComprarAgora = () => {
    adicionarItem({
      ...product,
      quantidade: quantidade,
    });
    navigate('/checkout');
  };

  if (!product) return <h1>Carregando...</h1>;
  if (product.notFound) return <h1>Produto não encontrado</h1>;

  return (
    <div className="detalhe-produto-container">
      <div className="coluna-imagem">
        {/* Imagem Principal */}
        {selectedImage && (
          <img src={selectedImage} alt={product.productName} className="imagem-principal-galeria" />
        )}

        {/* Miniaturas */}
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

      <div className="coluna-info">
        <h1>{product.productName}</h1>

        <p className="preco-detalhe">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
        </p>
        <h3>Descrição</h3>
        <p>{product.description || 'Sem descrição disponível.'}</p>
        <h3>Arquivos Inclusos</h3>
        <ul>
          <li>PNG (Fundo Transparente)</li>
          <li>CDR (Vetor CorelDraw)</li>
          <li>JPG (Alta Resolução)</li>
        </ul>

        {/* Combo Details */}
        {product.isCombo && product.comboProducts && product.comboProducts.length > 0 && (
          <div className="combo-detalhes-incluidos">
            <h3>Artes Incluídas neste Pacote:</h3>
            <ul>
              {product.comboProducts.map(subProd => (
                <li key={subProd._id}>{subProd.productName}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="controle-quantidade">
          <label htmlFor="quantidade">Quantidade:</label>
          <input
            type="number"
            id="quantidade"
            name="quantidade"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
          />
        </div>

        <div className="acoes-detalhe">
          <button className="btn-comprar" onClick={handleAdicionar}>Adicionar ao Carrinho</button>
          <button className="btn-comprar-agora" onClick={handleComprarAgora}>Comprar Agora</button>
        </div>
      </div>
    </div>
  );
}