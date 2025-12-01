import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './ProfilePage.css';

export default function ProfilePage() {
  const { logout, user } = useAuth();

  return (
    <div className="profile-page">
      {/* Sidebar de Navegação */}
      <aside className="profile-sidebar">
        <nav>
          <ul>
            {user && !user.isAdmin && (
              <>
                <li>
                  <NavLink to="/perfil" end className={({ isActive }) => isActive ? "active" : ""}>
                    Minha Biblioteca
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/seguranca" className={({ isActive }) => isActive ? "active" : ""}>
                    Segurança
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/suporte" className={({ isActive }) => isActive ? "active" : ""}>
                    Suporte
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/configuracoes" className={({ isActive }) => isActive ? "active" : ""}>
                    Configurações
                  </NavLink>
                </li>
              </>
            )}
            {user && user.isAdmin && (
              <>
                <li>
                  <NavLink to="/perfil" end className={({ isActive }) => isActive ? "active" : ""}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/produtos" className={({ isActive }) => isActive ? "active" : ""}>
                    Produtos
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/colecoes" className={({ isActive }) => isActive ? "active" : ""}>
                    Coleções
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/configuracoes" className={({ isActive }) => isActive ? "active" : ""}>
                    Configurações
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        <button onClick={logout} className="btn-logout">Sair</button>
      </aside>

      {/* Conteúdo Principal (Renderiza as rotas filhas) */}
      <main className="profile-content-area">
        <Outlet />
      </main>
    </div>
  );
}