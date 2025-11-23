import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Importa NavLink
import './Header.css';
import CartIcon from './CartIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="main-header">
      <Link to="/" className="logo">T-art</Link>
      <div className="nav-e-icon">
        <nav>
          <NavLink to="/">Início</NavLink>
          <NavLink to="/loja">Loja</NavLink>
          <NavLink to="/colecoes">Coleções</NavLink>

          {user ? (
            <>
              {user.isAdmin && (
                <>
                  <NavLink to="/admin/dashboard">Admin</NavLink>
                  <NavLink to="/admin/colecoes">Gerir Coleções</NavLink>
                </>
              )}
              <NavLink to="/perfil">Minha Conta</NavLink>
              {/* Usando um span com onClick para manter o estilo dos links */}
              <span onClick={logout} className="nav-logout">Sair</span>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Registar</NavLink>
            </>
          )}
        </nav>
        <CartIcon />
      </div>
    </header>
  );
}