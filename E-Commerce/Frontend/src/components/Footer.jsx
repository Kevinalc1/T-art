import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-column">
          <ul>
            <li><Link to="/">{t('footer.inicio')}</Link></li>
            <li><Link to="/loja">{t('footer.loja')}</Link></li>
            <li><Link to="/colecoes">{t('footer.colecoes')}</Link></li>
            <li><Link to="/faq">{t('footer.faq')}</Link></li>
            <li><Link to="/contato">{t('footer.contato')}</Link></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} K&A. {t('footer.todosDireitos')}</p>
      </div>
    </footer>
  );
}