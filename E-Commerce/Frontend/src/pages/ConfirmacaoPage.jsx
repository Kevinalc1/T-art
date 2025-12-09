import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import './ConfirmacaoPage.css';

const ConfirmacaoPage = () => {
  const { limparCarrinho } = useCarrinho();

  // Limpa o carrinho assim que o usuário chega na página de confirmação
  useEffect(() => {
    limparCarrinho();
  }, []);

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
            <h3>Próximos Passos</h3>
            <p>
              Você receberá um e-mail em breve com os <strong>links para download</strong> dos seus arquivos digitais.
            </p>
            <p className="info-note">
              Verifique sua caixa de entrada e a pasta de spam.
            </p>
          </div>
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