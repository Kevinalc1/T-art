import React from 'react';
import { useCarrinho } from '../context/CarrinhoContext.jsx';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate para redirecionamento
import { useAuth } from '../context/AuthContext.jsx'; // Importa o hook de autenticação
import './CarrinhoPage.css';

export default function CarrinhoPage() {
  const { state, removerItem, adicionarItem, decrementarItem } = useCarrinho();
  const { isAuthenticated } = useAuth(); // Pega o estado de autenticação
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
                  <img
                    src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : 'https://dummyimage.com/100x100/cccccc/000000.png&text=Sem+Img'}
                    alt={item.productName}
                  />
                  <div className="info-produto">
                    <h3>{item.productName}</h3>
                  </div>
                  <p className="preco-unitario">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </p>

                  <div className="quantidade-controle">
                    <button onClick={() => decrementarItem(item._id)} className="btn-qtd">-</button>
                    <span className="quantidade-valor">{item.quantidade}</span>
                    <button onClick={() => adicionarItem(item)} className="btn-qtd">+</button>
                  </div>

                  <p className="subtotal">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                  </p>
                  <div className="acoes">
                    <button onClick={() => removerItem(item._id)} className="btn-remover">Remover</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="resumo-compra">
            <div className="total-compra">
              Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
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