import React from 'react';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useCurrency } from '../context/CurrencyContext.jsx';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redirecionamento
import { BsTrash } from 'react-icons/bs';
import './CarrinhoPage.css';

export default function CarrinhoPage() {
  const { state, removerItem } = useCarrinho();
  const { formatPrice } = useCurrency();
  // const { isAuthenticated } = useAuth(); // Pega o estado de autenticação
  const navigate = useNavigate(); // Hook para navegar programaticamente

  const calcularTotal = () => {
    return state.items.reduce((total, item) => {
      // Agora o preço é um número, então a conversão não é mais necessária
      return total + item.price * item.quantidade;
    }, 0);
  };

  const valorTotal = calcularTotal();

  // Função que decide para onde o usuário vai ao clicar em "Finalizar Compra"
  const handleFinalizarCompra = () => {
    // Permite checkout como convidado (Guest Checkout)
    // Não verificamos mais isAuthenticated aqui. O login é opcional.
    navigate('/checkout');
  };

  return (
    <div className="carrinho-page">
      <h1>Seu Carrinho de Artes</h1>

      {state.items.length === 0 ? (
        <div className="carrinho-vazio">
          <p>Seu carrinho está vazio.</p>
        </div>
      ) : (
        <>
          <div className="lista-itens">
            {state.items.map((item) => {
              // O preço já é um número
              const subtotal = item.price * item.quantidade;

              return (
                <div key={item._id} className="item-carrinho">
                  <div className="img-wrapper">
                    <img
                      src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://dummyimage.com/100x100/cccccc/000000.png&text=Sem+Img'}
                      alt={item.productName}
                    />
                  </div>
                  <div className="info-produto">
                    <h3 className="nome-produto">{item.productName}</h3>
                    <p className="detalhes-produto">Quantidade: {item.quantidade}</p>
                  </div>

                  <div className="subtotal-wrapper">
                    <p className="subtotal">
                      {formatPrice(subtotal)}
                    </p>
                  </div>

                  <div className="acoes">
                    <button
                      onClick={() => removerItem(item._id)}
                      className="btn-remover"
                      title="Remover item"
                    >
                      <BsTrash size={18} />
                    </button>
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
              Finalizar Compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}