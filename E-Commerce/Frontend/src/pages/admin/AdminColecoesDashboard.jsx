import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css'; // Reutilizando o CSS do dashboard de produtos

export default function AdminColecoesDashboard() {
  const [colecoes, setColecoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColecoes = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/colecoes');
        setColecoes(data);
      } catch (error) {
        console.error('Erro ao buscar coleções:', error);
        alert('Não foi possível carregar as coleções.');
      } finally {
        setLoading(false);
      }
    };
    fetchColecoes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que quer apagar esta coleção? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`http://localhost:4000/api/colecoes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setColecoes(colecoes.filter((c) => c._id !== id));
      alert('Coleção apagada com sucesso.');
    } catch (error) {
      console.error('Erro ao apagar coleção:', error);
      alert('Ocorreu um erro ao tentar apagar a coleção.');
    }
  };

  if (loading) return <p>A carregar coleções...</p>;

  return (
    <div className="admin-dashboard">
      <h1>Gestão de Coleções</h1>
      <Link to="/admin/colecoes/nova" className="btn-novo">
        Adicionar Nova Coleção
      </Link>

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {colecoes.map((colecao) => (
            <tr key={colecao._id}>
              <td>{colecao.name}</td>
              <td className="acoes">
                <Link to={`/admin/colecoes/editar/${colecao._id}`} className="btn-editar">Editar</Link>
                <button onClick={() => handleDelete(colecao._id)} className="btn-apagar">Apagar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}