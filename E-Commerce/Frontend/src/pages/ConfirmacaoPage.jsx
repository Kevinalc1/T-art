import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import { trackPurchase } from '../utils/analytics.js';
import './ConfirmacaoPage.css';

const ConfirmacaoPage = () => {
  const { limparCarrinho } = useCarrinho();

  // Limpa o carrinho e rastreia a compra
  useEffect(() => {
    // Get purchase data from localStorage before clearing cart
    const purchaseData = localStorage.getItem('lastPurchase');

    if (purchaseData) {
      try {
        const { transactionId, items, total } = JSON.parse(purchaseData);
        trackPurchase(transactionId, items, total);
        // Clear the purchase data after tracking
        localStorage.removeItem('lastPurchase');
      } catch (error) {
        console.error('Error tracking purchase:', error);
      }
    }

    limparCarrinho();
  }, [limparCarrinho]);

  return (
    <div className="confirmacao-wrapper">
      <div className="confirmacao-container">
        {/* Animated Success Icon */}
        <div className="success-icon-wrapper">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="confirmacao-titulo">Pagamento Confirmado!</h1>

        <p className="confirmacao-subtitulo">
          Obrigado pela sua compra. Seu pedido foi processado com sucesso.
        </p>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-icon">📧</div>
          <div className="info-content">
            <h3>Acesso Imediato aos Seus Arquivos</h3>
            <p>
              Você receberá um e-mail <strong>em instantes</strong> com os <strong>links para download</strong> das suas artes digitais.
            </p>
            <p className="info-note">
              ✅ Verifique sua caixa de entrada e a pasta de spam<br />
              ✅ Os links são válidos por 7 dias<br />
              ✅ Arquivos em alta resolução (PNG, CDR, JPG)
            </p>
          </div>
        </div>

        {/* WhatsApp Support */}
        <div className="whatsapp-support">
          <p>💬 Dúvidas ou não recebeu o e-mail?</p>
          <a
            href="https://wa.me/5511999999999?text=Olá!%20Acabei%20de%20fazer%20uma%20compra%20e%20preciso%20de%20ajuda."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Falar no WhatsApp
          </a>
        </div>

        {/* Action Buttons */}
        <div className="confirmacao-actions">
          <Link to="/loja" className="btn-voltar-loja">
            Continuar Comprando
          </Link>
          <Link to="/perfil" className="btn-ver-pedidos">
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacaoPage;