import React, { createContext, useReducer, useContext, useEffect } from 'react';

// Estado inicial do carrinho
const initialState = {
  items: JSON.parse(localStorage.getItem('carrinho')) || [],
};

// Reducer para manipular as ações do carrinho
function carrinhoReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const novoItem = action.payload;
      const itemExistente = state.items.find(
        (item) => item._id === novoItem._id
      );

      let novosItens;
      if (itemExistente) {
        // Se o item já existe, atualiza a quantidade
        novosItens = state.items.map((item) =>
          item._id === novoItem._id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        // Se é um item novo, adiciona ao carrinho com quantidade 1
        novosItens = [...state.items, { ...novoItem, quantidade: 1 }];
      }
      return { ...state, items: novosItens };
    }
    case 'DECREMENT_ITEM': {
      const id = action.payload;
      const itemExistente = state.items.find((item) => item._id === id);

      if (itemExistente && itemExistente.quantidade > 1) {
        // Se quantidade > 1, decrementa
        const novosItens = state.items.map((item) =>
          item._id === id ? { ...item, quantidade: item.quantidade - 1 } : item
        );
        return { ...state, items: novosItens };
      } else {
        // Se quantidade === 1, remove o item
        const novosItens = state.items.filter((item) => item._id !== id);
        return { ...state, items: novosItens };
      }
    }
    case 'REMOVE_ITEM': {
      const novosItens = state.items.filter(
        (item) => item._id !== action.payload
      );
      return { ...state, items: novosItens };
    }
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }
    default:
      return state;
  }
}

// Cria o contexto do carrinho
export const CarrinhoContext = createContext();

// Componente Provedor do Contexto
export function CarrinhoProvider({ children }) {
  const [state, dispatch] = useReducer(carrinhoReducer, initialState);

  // Efeito para salvar o carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    localStorage.setItem('carrinho', JSON.stringify(state.items));
  }, [state.items]);

  const adicionarItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const decrementarItem = (id) => dispatch({ type: 'DECREMENT_ITEM', payload: id });
  const removerItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const limparCarrinho = () => dispatch({ type: 'CLEAR_CART' });

  const value = { state, dispatch, adicionarItem, decrementarItem, removerItem, limparCarrinho }; // Exportando dispatch

  return <CarrinhoContext.Provider value={value}>{children}</CarrinhoContext.Provider>;
}

// Hook customizado para usar o contexto do carrinho
export function useCarrinho() {
  return useContext(CarrinhoContext);
}