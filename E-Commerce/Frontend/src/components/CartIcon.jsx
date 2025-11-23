import React from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { FaShoppingCart } from 'react-icons/fa'; // Importa o ícone
import './CartIcon.css';

export default function CartIcon() {
  const { state } = useCarrinho();

  // Calcula o total de itens somando as quantidades de cada item no carrinho
  const totalItens = state.items.reduce((total, item) => total + item.quantidade, 0);

  return (
    <Link to="/carrinho" className="cart-icon">
      <FaShoppingCart /> {/* Usa o ícone importado */}
      {totalItens > 0 && <span className="contador">{totalItens}</span>}
    </Link>
  );
}