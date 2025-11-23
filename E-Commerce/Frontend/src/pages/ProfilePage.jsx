import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './ProfilePage.css'; 

const API_URL = import.meta.env.VITE_API_URL;

export default function ProfilePage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, logout, user } = useAuth(); // Pega o token, o usuário e a função de logout

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!token) {
        setLoading(false);
        return; // Não faz a busca se não houver token
      }

      try {
        const response = await fetch(`${API_URL}/api/pedidos/meus-pedidos`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar os pedidos. Tente recarregar a página.');
        }

        const data = await response.json();
        setPedidos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [token]); // O efeito é re-executado se o token mudar

  const formatarData = (dataString) => new Date(dataString).toLocaleDateString('pt-BR');

  return (
    <div className="profile-page">
      {/* Sidebar de Navegação */}
      <aside className="profile-sidebar">
        <nav>
          <ul>
            {/* O ideal seria usar NavLink aqui com rotas aninhadas */}
            <li><Link to="/perfil" className="active">Meus Pedidos</Link></li>
          </ul>
        </nav>
        <button onClick={logout} className="btn-logout">Sair</button>
      </aside>

      {/* Conteúdo Principal */}
      <main className="profile-content">
        <h1>Meus Pedidos</h1>
        {loading && <p>Carregando seus pedidos...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          pedidos.length === 0 ? (
            <p>Você ainda não fez nenhum pedido.</p>
          ) : (
            <div className="lista-pedidos">
              {pedidos.map((pedido) => (
                <div key={pedido._id} className="pedido">
                  <div className="pedido-header">
                    <span>Pedido de {formatarData(pedido.createdAt)}</span>
                    <span>Total: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.totalPrice)}</strong></span>
                  </div>
                  <div className="pedido-body">
                    {pedido.items.map((item, index) => (
                      <div key={index} className="pedido-item">
                        <span>{item.productName}</span>
                        {/* Idealmente, o downloadUrl viria do backend */}
                        <a href="#" target="_blank" rel="noopener noreferrer" className="btn-download">Baixar</a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}