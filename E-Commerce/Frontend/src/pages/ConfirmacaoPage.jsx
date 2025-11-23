import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCarrinho } from '../context/CarrinhoContext';
import './ConfirmacaoPage.css';

const ConfirmacaoPage = () => {
  const { limparCarrinho } = useCarrinho();

  // Limpa o carrinho assim que o usuário chega na página de confirmação.
  // O array de dependências vazio [] garante que isso rode apenas uma vez.
  useEffect(() => {
    limparCarrinho();
  }, []);

  return (
    <div className="confirmacao-container">
      <h1>🎉 Pedido Recebido com Sucesso!</h1>
      <p>Obrigado por sua compra.</p>
      <p>Você receberá um e-mail em breve com os links para download dos seus arquivos digitais.</p>
      <div className="icone-sucesso">✔️</div>
      <Link to="/loja" className="btn-voltar-loja">
        Voltar para a Loja
      </Link>
    </div>
  );
};

export default ConfirmacaoPage;