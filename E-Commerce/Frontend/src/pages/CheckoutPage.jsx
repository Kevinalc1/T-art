import React, { useState, useEffect } from 'react';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './CheckoutPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function CheckoutPage() {
  const { state } = useCarrinho();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    confirmarEmail: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        confirmarEmail: user.email
      }));
    }
  }, [user]);

  const calcularTotal = () => {
    return state.items.reduce((total, item) => {
      return total + item.price * item.quantidade;
    }, 0);
  };

  const valorTotal = calcularTotal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePayment = async (paymentMethod) => {
    if (formData.email !== formData.confirmarEmail) {
      alert('Os e-mails não coincidem!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: state.items,
          userEmail: formData.email,
          paymentMethod: paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redireciona o cliente para a URL de checkout do Stripe
        window.location.href = data.url;
      } else {
        alert('Não foi possível iniciar o pagamento. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      alert('Ocorreu um erro de comunicação com o servidor.');
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="checkout-page carrinho-vazio">
        <h1>Seu carrinho está vazio</h1>
        <p>Adicione produtos à sua cesta antes de finalizar a compra.</p>
        <Link to="/loja" className="btn-loja">
          Voltar para a Loja
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Finalizar Compra</h1>
      <div className="checkout-container">
        {/* Coluna do Formulário */}
        <div className="coluna-form">
          <h2>Seus Dados</h2>
          <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required />
          <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
          <input type="email" name="confirmarEmail" placeholder="Confirme seu E-mail" value={formData.confirmarEmail} onChange={handleChange} required />
        </div>

        {/* Coluna do Resumo */}
        <div className="coluna-resumo">
          <h2>Resumo do Pedido</h2>
          {state.items.map((item) => (
            <div key={item._id} className="resumo-item">
              <span>{`${item.productName} (x${item.quantidade})`}</span>
              <span>{formatPrice(item.price * item.quantidade)}</span>
            </div>
          ))}
          <div className="total-final">
            Total: <strong>{formatPrice(valorTotal)}</strong>
          </div>
          <h3>Pagamento</h3>
          <p className="pagamento-info">Você será redirecionado para um ambiente seguro para finalizar o pagamento.</p>
          <div className="payment-options">
            <button type="button" onClick={() => handlePayment('card')} disabled={loading} className="btn-finalizar-pedido">
              {loading ? 'Processando...' : 'Pagar com Cartão'}
            </button>
            <button type="button" onClick={() => handlePayment('pix')} disabled={loading} className="btn-finalizar-pedido">
              {loading ? 'Processando...' : 'Pagar com PIX'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}