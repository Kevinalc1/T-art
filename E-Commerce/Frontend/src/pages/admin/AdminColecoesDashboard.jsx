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
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/colecoes`);
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/colecoes/${id}`, {
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
    <div className="admin-dashboard-enhanced">
      <header className="admin-header-enhanced">
        <div className="header-title">
          <h1>Gestão de Coleções</h1>
          <p>Organize seus produtos em coleções temáticas.</p>
        </div>

        <Link to="/admin/colecoes/nova" className="btn-novo" style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
          + Nova Coleção
        </Link>
      </header>

      <div className="admin-content-wrapper">
        <main className="admin-main-grid-area">
          {colecoes.length === 0 ? (
            <div className="admin-empty-state">
              <p>Nenhuma coleção encontrada.</p>
            </div>
          ) : (
            <div className="admin-product-grid">
              {colecoes.map((colecao) => (
                <div key={colecao._id} className="product-card">
                  <div className="product-card-image">
                    <img
                      src={colecao.coverImage || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                      alt={colecao.name}
                    />
                  </div>
                  <div className="product-card-content">
                    <h3 className="product-card-title">{colecao.name}</h3>

                    <div className="product-card-actions">
                      <Link to={`/admin/colecoes/editar/${colecao._id}`} className="btn-card-edit">
                        ✏️ Editar
                      </Link>
                      <button onClick={() => handleDelete(colecao._id)} className="btn-card-delete">
                        🗑️ Apagar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}