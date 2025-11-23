import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-column">
          <ul>
            <li><Link to="/">Início</Link></li>
            <li><Link to="/loja">Loja</Link></li>
            <li><Link to="/colecoes">Coleções</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contato">Contato</Link></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} T-art. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}