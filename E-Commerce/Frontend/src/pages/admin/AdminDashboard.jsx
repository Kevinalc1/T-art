import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Importar axios
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/produtos')
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
      await axios.delete(`http://localhost:4000/api/produtos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProdutos(produtos.filter((produto) => produto._id !== id));
      alert('Produto apagado com sucesso.');
    } catch (error) {
      console.error('Erro ao apagar produto:', error);
      alert(error.response?.data?.message || 'Ocorreu um erro ao tentar apagar o produto.');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Gestão de Produtos</h1>
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