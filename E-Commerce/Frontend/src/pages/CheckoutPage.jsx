import React, { useState, useEffect } from 'react';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import './CheckoutPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function CheckoutPage() {
  const { state } = useCarrinho();
  const { formatPrice, currency } = useCurrency(); // Added currency
  const { user } = useAuth();
  const { t } = useTranslation(); // Added translations
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    confirmarEmail: '',
    userDoc: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [pixData, setPixData] = useState(null);

  // Auto-select card if not BRL (Pix is Brazil only)
  useEffect(() => {
    if (currency !== 'BRL') {
      setSelectedPaymentMethod('card');
    }
  }, [currency]);

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
              console.log(t('checkout.sucessoPix'));
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
  }, [pixData, navigate, t]);

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
      alert(t('checkout.emailNaoCoincide'));
      return;
    }

    if (selectedPaymentMethod === 'pix' && !formData.userDoc) {
      alert(t('checkout.avisoPix'));
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
        alert(data.error || t('checkout.erroComunicacao'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert(t('checkout.erroComunicacao'));
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="checkout-page carrinho-vazio">
        <h1>{t('checkout.carrinhoVazio')}</h1>
        <p>{t('checkout.adicioneProdutos')}</p>
        <Link to="/loja" className="btn-loja">
          {t('checkout.voltarLoja')}
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>{t('checkout.titulo')}</h1>

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
            <h2>{t('checkout.seusDados')}</h2>
            <input type="text" name="nome" placeholder={t('checkout.nomePlaceholder')} value={formData.nome} onChange={handleChange} required />
            <input type="email" name="email" placeholder={t('checkout.emailPlaceholder')} value={formData.email} onChange={handleChange} required />
            <input type="email" name="confirmarEmail" placeholder={t('checkout.confirmaEmailPlaceholder')} value={formData.confirmarEmail} onChange={handleChange} required />

            {/* Input Extra para CPF quando Pix é selecionado e Moeda é BRL */}
            {selectedPaymentMethod === 'pix' && currency === 'BRL' && (
              <input
                type="text"
                name="userDoc"
                placeholder={t('checkout.cpfPlaceholder')}
                value={formData.userDoc}
                onChange={handleChange}
                required
              />
            )}
          </div>

          {/* Coluna do Resumo */}
          <div className="coluna-resumo">
            <h2>{t('checkout.resumoPedido')}</h2>
            {state.items.map((item) => (
              <div key={item._id} className="resumo-item">
                <span>{`${item.productName} (x${item.quantidade})`}</span>
                <span>{formatPrice(item.price * item.quantidade)}</span>
              </div>
            ))}
            <div className="total-final">
              {t('checkout.total')}: <strong>{formatPrice(valorTotal)}</strong>
            </div>

            {/* Warning for International Users */}
            {currency !== 'BRL' && (
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', fontStyle: 'italic' }}>
                * Charged in BRL. Your bank will handle conversion.
              </p>
            )}

            <h3>{t('checkout.pagamento')}</h3>
            <div className="payment-method-selector">
              <label>
                <input
                  type="radio"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={() => setSelectedPaymentMethod('card')}
                />
                {t('checkout.cartaoCredito')}
              </label>

              {/* Show Pix Option ONLY if Currency is BRL */}
              {currency === 'BRL' && (
                <label>
                  <input
                    type="radio"
                    value="pix"
                    checked={selectedPaymentMethod === 'pix'}
                    onChange={() => setSelectedPaymentMethod('pix')}
                  />
                  {t('checkout.pix')}
                </label>
              )}
            </div>

            <button type="button" onClick={handlePayment} disabled={loading} className="btn-finalizar-pedido">
              {loading ? t('checkout.processando') : (selectedPaymentMethod === 'card' ? t('checkout.irParaPagamento') : t('checkout.gerarPix'))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}