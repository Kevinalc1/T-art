import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Importa a URL da API a partir das variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL;

export default function TabelaColecoes() {
  const [colecoes, setColecoes] = useState([]);

  useEffect(() => {
    // Busca as coleções da API quando o componente é montado
    fetch(`${API_URL}/api/colecoes`)
      .then((res) => res.json())
      .then((data) => setColecoes(data))
      .catch((error) => console.error('Erro ao buscar coleções:', error));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem a certeza que quer apagar esta coleção? Todos os produtos associados também serão afetados.')) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/api/colecoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setColecoes(colecoes.filter((colecao) => colecao._id !== id));
        alert('Coleção apagada com sucesso.');
      } else {
        const errorData = await response.json();
        alert(`Falha ao apagar a coleção: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Erro ao apagar coleção:', error);
      alert('Ocorreu um erro ao tentar apagar a coleção.');
    }
  };

  return (
    <div>
      <h2>Gestão de Coleções</h2>
      <Link to="/admin/colecoes/nova" className="btn-novo">
        Adicionar Nova Coleção
      </Link>

      <table>
        <thead>
          <tr>
            <th>Nome da Coleção</th>
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