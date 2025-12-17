import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './ProfilePage.css';

import { FaThLarge, FaShieldAlt, FaQuestionCircle, FaCog, FaSignOutAlt, FaBoxOpen, FaImages, FaChartLine } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

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
                    <FaThLarge className="nav-icon" /> Minha Biblioteca
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/seguranca" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaShieldAlt className="nav-icon" /> Segurança
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/suporte" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaQuestionCircle className="nav-icon" /> Suporte
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/configuracoes" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaCog className="nav-icon" /> Configurações
                  </NavLink>
                </li>
              </>
            )}
            {user && user.isAdmin && (
              <>
                <li>
                  <NavLink to="/perfil/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                    <MdDashboard className="nav-icon" /> Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/produtos" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaBoxOpen className="nav-icon" /> Produtos
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/colecoes" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaImages className="nav-icon" /> Coleções
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/banners" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaImages className="nav-icon" /> Banners
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/perfil/configuracoes" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaCog className="nav-icon" /> Configurações
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
        <button onClick={logout} className="btn-logout">
          <FaSignOutAlt className="nav-icon" /> Sair
        </button>
      </aside>

      {/* Conteúdo Principal (Renderiza as rotas filhas) */}
      <main className="profile-content-area">
        <Outlet />
      </main>
    </div>
  );
}