import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import CartIcon from './CartIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">T-art</Link>

        <nav>
          <NavLink to="/">Início</NavLink>
          <NavLink to="/loja">Loja</NavLink>
          <NavLink to="/colecoes">Coleções</NavLink>
        </nav>

        <div className="icons-area">
          <Link to={user ? "/perfil" : "/login"} className="icon-link">
            <FaUser />
          </Link>
          <CartIcon />
          {user && (
            <button onClick={logout} className="icon-link logout-btn" aria-label="Sair">
              <FaSignOutAlt />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}