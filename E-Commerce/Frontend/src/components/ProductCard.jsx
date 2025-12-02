import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { useCurrency } from '../context/CurrencyContext';
import { BsCart3 } from 'react-icons/bs';
import { toast } from 'react-toastify';
import './ProductCard.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductCard({ produto }) {
  const { adicionarItem, state } = useCarrinho();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (!produto) return null;

  let thumbnailUrl = 'https://dummyimage.com/300x300/cccccc/000000.png&text=Sem+Imagem';

  if (produto.imageUrls && produto.imageUrls.length > 0) {
    const url = produto.imageUrls[0];
    if (url.startsWith('http') || url.startsWith('data:')) {
      thumbnailUrl = url;
    } else {
      // Trata URL relativa para uploads locais
      const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
      const cleanApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      thumbnailUrl = `${cleanApiUrl}/${cleanUrl}`;
    }
  }

  const handleComprarAgora = () => {
    const itemNoCarrinho = state.items.find(item => item._id === produto._id);

    if (!itemNoCarrinho) {
      adicionarItem(produto);
    }
    navigate('/checkout');
  };

  const handleAdicionarAoCarrinho = () => {
    const itemNoCarrinho = state.items.find(item => item._id === produto._id);

    if (itemNoCarrinho) {
      toast.error('Esse produto já foi adicionado ao carrinho, Finalize sua compra', {
        style: { background: '#d32f2f', color: '#fff' }
      });
      return;
    }

    adicionarItem(produto);
    toast.success('Produto adicionado ao carrinho!', {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="produto-card">
      <Link to={`/produto/${produto._id}`}>
        <img src={thumbnailUrl} alt={produto.productName} />
      </Link>
      <div className="card-info">
        <h3>{produto.productName}</h3>
        <p className="price">
          {formatPrice(produto.price)}
        </p>
        <Link to={`/produto/${produto._id}`} className="btn-detalhes">Ver Detalhes</Link>

        <div className="acoes-botoes-pequenos">
          <button onClick={handleAdicionarAoCarrinho} className="btn-pequeno btn-carrinho-pequeno">
            <BsCart3 />
          </button>
          <button onClick={handleComprarAgora} className="btn-pequeno btn-comprar-pequeno">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
}