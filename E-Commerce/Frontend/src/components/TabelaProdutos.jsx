import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Importa a URL da API a partir das variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL;

export default function TabelaProdutos() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/produtos`)
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((error) => console.error('Erro ao buscar produtos:', error));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que quer apagar este produto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/produtos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProdutos(produtos.filter((produto) => produto._id !== id));
        alert('Produto apagado com sucesso.');
      } else {
        alert('Falha ao apagar o produto. Verifique se você está logado.');
      }
    } catch (error) {
      console.error('Erro ao apagar produto:', error);
      alert('Ocorreu um erro ao tentar apagar o produto.');
    }
  };

  return (
    <div>
      <h2>Gestão de Produtos</h2>
      <Link to="/admin/produtos/novo" className="btn-novo">
        Adicionar Novo Produto
      </Link>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto._id}>
              <td>{produto.productName}</td>
              <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}</td>
              <td className="acoes">
                <Link to={`/admin/produtos/editar/${produto._id}`} className="btn-editar">Editar</Link>
                <button onClick={() => handleDelete(produto._id)} className="btn-apagar">Apagar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}