import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Importa NavLink
import './Header.css';
import CartIcon from './CartIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUser } from 'react-icons/fa';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">T-art</Link>

        <nav>
          <NavLink to="/">Início</NavLink>
          <NavLink to="/loja">Loja</NavLink>
          <NavLink to="/colecoes">Coleções</NavLink>
          {user && user.isAdmin && (
            <>
              <NavLink to="/admin/dashboard">Admin</NavLink>
              <NavLink to="/admin/colecoes">Gerir Coleções</NavLink>
            </>
          )}
        </nav>

        <div className="icons-area">
          <Link to={user ? "/perfil" : "/login"} className="icon-link">
            <FaUser />
          </Link>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}