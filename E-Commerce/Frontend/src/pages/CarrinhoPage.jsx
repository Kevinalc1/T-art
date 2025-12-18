import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useNavigate } from 'react-router-dom';
import './CarrinhoPage.css';

export default function CarrinhoPage() {
  const { t } = useTranslation();
  const { state, removerItem } = useCarrinho();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const calcularTotal = () => {
    return state.items.reduce((total, item) => {
      return total + item.price * item.quantidade;
    }, 0);
  };

  const valorTotal = calcularTotal();

  const handleFinalizarCompra = () => {
    navigate('/checkout');
  };

  return (
    <div className="carrinho-page">
      <h1>{t('cart.titulo')}</h1>

      {state.items.length === 0 ? (
        <div className="carrinho-vazio">
          <p>{t('cart.vazio')}</p>
          <button onClick={() => navigate('/loja')} className="btn-continuar">
            {t('cart.continuarComprando')}
          </button>
        </div>
      ) : (
        <>
          <div className="lista-itens">
            {state.items.map((item) => {
              const subtotal = item.price * item.quantidade;

              return (
                <div key={item._id} className="item-carrinho">
                  <img
                    src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : (item.imageUrl || 'https://dummyimage.com/100x100/cccccc/000000.png&text=No+Img')}
                    alt={item.productName}
                  />
                  <div className="info-produto">
                    <h3>{item.productName}</h3>
                  </div>

                  <p className="subtotal">
                    {formatPrice(subtotal)}
                  </p>
                  <div className="acoes">
                    <button onClick={() => removerItem(item._id)} className="btn-remover">{t('cart.remover')}</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="resumo-compra">
            <div className="total-compra">
              {formatPrice(valorTotal)}
            </div>
            <button onClick={handleFinalizarCompra} className="btn-finalizar">
              {t('cart.finalizarCompra')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}