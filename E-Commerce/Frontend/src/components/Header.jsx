import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Header.css';
import CartIcon from './CartIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

export default function Header() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/logo.svg" alt="Gens Logo" className="logo-image" />
        </Link>

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