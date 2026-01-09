import React, { useState, useEffect } from 'react';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { trackBeginCheckout } from '../utils/analytics.js';
import TrustBadges from '../components/TrustBadges.jsx';
import { toast } from 'react-toastify';
import './CheckoutPage.css';

const API_URL = import.meta.env.VITE_API_URL;

// Icons Components
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lock-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const CreditCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const PixIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>;

export default function CheckoutPage() {
  const { state } = useCarrinho();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    userDoc: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [pixData, setPixData] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  // Track begin checkout when page loads with items
  useEffect(() => {
    if (state.items.length > 0) {
      const total = calcularTotal();
      trackBeginCheckout(state.items, total);
    }
  }, []); // Only track once on mount

  // Polling para checar status do Pix
  useEffect(() => {
    let interval;
    if (pixData && pixData.id) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/api/pix/status/${pixData.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'approved') {
              clearInterval(interval);
              navigate('/confirmacao');
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 5000);
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
  // Simulação de desconto PIX, se necessário no futuro
  // const valorTotalPix = valorTotal * 0.95; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'pix' && !formData.userDoc) {
      toast.error('Por favor, informe o CPF para pagamento via Pix.');
      return;
    }

    if (!formData.email || !formData.nome) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setPixData(null);

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
        bodyData.userDoc = formData.userDoc.replace(/\D/g, '');
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
          // Save purchase data for analytics
          localStorage.setItem('lastPurchase', JSON.stringify({
            transactionId: data.sessionId || Date.now().toString(),
            items: state.items,
            total: valorTotal
          }));
          window.location.href = data.url;
        } else {
          setPixData(data);
          setLoading(false);
          toast.success('QR Code gerado! Escaneie para pagar.');
        }
      } else {
        toast.error(data.error || 'Não foi possível iniciar o pagamento. Tente novamente.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Ocorreu um erro de comunicação com o servidor.');
      setLoading(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="checkout-page carrinho-vazio-container">
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
      {/* Progress Bar */}
      <div className="checkout-progress">
        <div className="progress-step completed">
          <div className="step-circle">✓</div>
          <span>Carrinho</span>
        </div>
        <div className="progress-line completed"></div>
        <div className="progress-step active">
          <div className="step-circle">2</div>
          <span>Identificação</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <div className="step-circle">3</div>
          <span>Pagamento</span>
        </div>
      </div>

      <h1>Finalizar Compra</h1>

      {pixData ? (
        <div className="card-pix-result">
          <h2>Pagamento Pix Gerado!</h2>
          <p>Utilize o QR Code abaixo para pagar:</p>
          <div className="qr-wrapper">
            <img
              src={`data:image/png;base64,${pixData.qr_code}`}
              alt="QR Code Pix"
            />
          </div>

          <div className="copy-paste-area">
            <p>Ou copie e cole o código abaixo:</p>
            <textarea
              readOnly
              value={pixData.qr_code_copy_paste}
              onClick={(e) => e.target.select()}
            />
          </div>
          <p className="pix-instruction">
            Após o pagamento, você será redirecionado automaticamente.
          </p>
        </div>
      ) : (
        <div className="checkout-layout">
          {/* Esquerda: Formulário de Dados */}
          <div className="checkout-form-section">
            <div className="card-data">
              <h2>Seus Dados</h2>
              <div className="form-group">
                <label>Nome Completo</label>
                <input type="text" name="nome" placeholder="Ex: Maria Silva" value={formData.nome} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>E-mail *</label>
                <input type="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
                <small style={{ color: '#7f8c8d', fontSize: '12px' }}>Você receberá os arquivos neste e-mail</small>
              </div>

              {selectedPaymentMethod === 'pix' && (
                <div className="form-group slide-in">
                  <label>CPF (Necessário para Pix)</label>
                  <input
                    type="text"
                    name="userDoc"
                    placeholder="000.000.000-00"
                    value={formData.userDoc}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Direita: Resumo e Pagamento */}
          <div className="checkout-summary-section">
            <div className="card-summary">
              <h2>Resumo do Pedido</h2>
              <div className="summary-items">
                {state.items.map((item) => (
                  <div key={item._id} className="summary-item-row">
                    <div className="item-thumb">
                      <img src={item.imageUrls?.[0] || 'https://dummyimage.com/50x50/ccc/000.png'} alt="prod" />
                      <span className="qty-badge">{item.quantidade}</span>
                    </div>
                    <div className="item-info">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-price">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Total:</span>
                  <strong>{formatPrice(valorTotal)}</strong>
                </div>
              </div>

              <div className="payment-section">
                <h3>Forma de Pagamento</h3>
                <div className="payment-options-grid">
                  <label
                    className={`payment-radio-card ${selectedPaymentMethod === 'card' ? 'selected card-blue' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPaymentMethod === 'card'}
                      onChange={() => setSelectedPaymentMethod('card')}
                    />
                    <div className="radio-content">
                      <CreditCardIcon />
                      <span>Cartão de Crédito</span>
                    </div>
                  </label>

                  <label
                    className={`payment-radio-card ${selectedPaymentMethod === 'pix' ? 'selected card-green' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={selectedPaymentMethod === 'pix'}
                      onChange={() => setSelectedPaymentMethod('pix')}
                    />
                    <div className="radio-content">
                      <PixIcon />
                      <div className="pix-text">
                        <span>Pix (Instantâneo)</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button type="button" onClick={handlePayment} disabled={loading} className="btn-pay-now">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processando...
                  </>
                ) : (
                  `Pagar ${formatPrice(valorTotal)}`
                )}
              </button>

              <div className="security-badge">
                <LockIcon />
                <span>Ambiente 100% seguro e criptografado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      {!pixData && <TrustBadges />}
    </div>
  );
}