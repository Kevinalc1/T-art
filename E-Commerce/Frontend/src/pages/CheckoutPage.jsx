import React, { useState, useEffect } from 'react';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './CheckoutPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function CheckoutPage() {
  const { state } = useCarrinho();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    confirmarEmail: '',
    userDoc: '' // Added userDoc to formData
  });
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [pixData, setPixData] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email,
        confirmarEmail: user.email
      }));
    }
  }, [user]);

  // Polling para checar status do Pix
  useEffect(() => {
    let interval;

    if (pixData && pixData.id) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/api/pix/status/${pixData.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Status Pix:', data.status);

            if (data.status === 'approved') {
              clearInterval(interval);
              alert('Pagamento aprovado! Redirecionando...');
              navigate('/confirmacao');
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 5000); // Checa a cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pixData, navigate]);

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

  const handlePayment = async () => {
    if (formData.email !== formData.confirmarEmail) {
      alert('Os e-mails não coincidem!');
      return;
    }

    if (selectedPaymentMethod === 'pix' && !formData.userDoc) {
      alert('Por favor, informe o CPF para pagamento via Pix.');
      return;
    }

    setLoading(true);
    setPixData(null); // Limpa dados anteriores

    try {
      let endpoint = '';
      let bodyData = {
        items: state.items,
        userEmail: formData.email,
      };

      if (selectedPaymentMethod === 'card') {
        endpoint = `${API_URL}/api/checkout/create-checkout-session`;
        bodyData.paymentMethod = 'card';
      } else {
        endpoint = `${API_URL}/api/pix/create-pix-payment`;
        bodyData.userDoc = formData.userDoc.replace(/\D/g, ''); // Remove pontuação
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        if (selectedPaymentMethod === 'card') {
          // Redirect Stripe
          window.location.href = data.url;
        } else {
          // Show Pix QR Code
          setPixData(data);
          setLoading(false);
        }
      } else {
        alert(data.error || 'Não foi possível iniciar o pagamento. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
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

      {/* Exibição do PIX gerado */}
      {pixData && (
        <div className="pix-result-container">
          <h2>Pagamento Pix Gerado!</h2>
          <p>Utilize o QR Code abaixo para pagar:</p>
          <img
            src={`data:image/png;base64,${pixData.qr_code}`}
            alt="QR Code Pix"
            style={{ maxWidth: '250px', margin: '20px auto', display: 'block' }}
          />
          <p>Ou copie e cole o código abaixo:</p>
          <textarea
            readOnly
            value={pixData.qr_code_copy_paste}
            style={{ width: '100%', height: '100px', padding: '10px', fontSize: '0.9rem' }}
          />
          <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
            Após o pagamento, você receberá a confirmação por e-mail.
          </p>
        </div>
      )}

      {!pixData && (
        <div className="checkout-container">
          {/* Coluna do Formulário */}
          <div className="coluna-form">
            <h2>Seus Dados</h2>
            <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleChange} required />
            <input type="email" name="email" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
            <input type="email" name="confirmarEmail" placeholder="Confirme seu E-mail" value={formData.confirmarEmail} onChange={handleChange} required />

            {/* Input Extra para CPF quando Pix é selecionado */}
            {selectedPaymentMethod === 'pix' && (
              <input
                type="text"
                name="userDoc"
                placeholder="CPF (apenas números)"
                value={formData.userDoc}
                onChange={handleChange}
                required
              />
            )}
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
            <div className="payment-method-selector">
              <label>
                <input
                  type="radio"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={() => setSelectedPaymentMethod('card')}
                />
                Cartão de Crédito
              </label>
              <label>
                <input
                  type="radio"
                  value="pix"
                  checked={selectedPaymentMethod === 'pix'}
                  onChange={() => setSelectedPaymentMethod('pix')}
                />
                Pix (Instantâneo)
              </label>
            </div>

            <button type="button" onClick={handlePayment} disabled={loading} className="btn-finalizar-pedido">
              {loading ? 'Processando...' : (selectedPaymentMethod === 'card' ? 'Ir para Pagamento' : 'Gerar Pix')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}