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
      <Link to={user ? "/perfil" : "/login"} className="icon-link">
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
    /* We remove main-header class to let PillNav handle the floating/sticky behavior per its CSS */
    /* Or we keep a wrapper if we want to constrain it */
    <header className="main-header-wrapper" style={{ pointerEvents: 'none', position: 'relative', zIndex: 100 }}>
      <PillNav
        logo="/logo.svg"
        logoAlt="Gens Logo"
        items={navItems}
        rightContent={rightContent}
        mobileMenuContent={rightContent} /* Optional: pass icons to mobile menu if supported */
        baseColor="#ffffff"
        pillColor="#133853" /* Primary Blue */
        pillTextColor="#133853"
        hoveredPillTextColor="#ffffff"
      />
    </header>
  );
}