import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Header.css';
import CartIcon from './CartIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import CurrencySwitcher from './CurrencySwitcher.jsx';
import PillNav from './PillNav.jsx';

export default function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: t('header.inicio'), href: '/' },
    { label: t('header.loja'), href: '/loja' },
    { label: t('header.colecoes'), href: '/colecoes' }
  ];

  /* rightContent handles the icons */
  const rightContent = (
    <>
      <CurrencySwitcher />
      <Link to={user ? "/perfil" : "/login"} className="icon-link" aria-label="Minha Conta">
        <FaUser />
      </Link>
      <CartIcon />
      {user && (
        <button onClick={logout} className="icon-link logout-btn" aria-label="Sair">
          <FaSignOutAlt />
        </button>
      )}
    </>
  );

  return (
    <header className="main-header-wrapper">
      <PillNav
        logo="/logo.svg"
        logoAlt="Gens Logo"
        items={navItems}
        rightContent={rightContent}
        mobileMenuContent={rightContent}
        baseColor="#ffffff"
        pillColor="#e5e7eb" /* Light Gray for hover pill background */
        pillTextColor="#111827" /* Dark Text */
        hoveredPillTextColor="#111827"
      />
    </header>
  );
}