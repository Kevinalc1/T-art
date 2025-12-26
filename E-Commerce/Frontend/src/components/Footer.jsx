import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-dark">
      <div className="footer-container">

        {/* Grid Principal - 4 Colunas */}
        <div className="footer-grid">

          {/* Coluna 1: Sobre a Marca */}
          <div className="footer-col">
            <h3 className="footer-brand">Gens</h3>
            <p className="footer-desc">
              Vestindo sua fé e paixão com arte exclusiva. Camisetas com qualidade premium e estampas que contam histórias.
            </p>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="mailto:contato@gens.com" className="social-btn" aria-label="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação Loja */}
          <div className="footer-col">
            <h4 className="footer-heading">Explorar</h4>
            <ul className="footer-links">
              <li><Link to="/loja">Lançamentos</Link></li>
              <li><Link to="/colecoes">Coleção Religiosa</Link></li>
              <li><Link to="/loja?cat=infantil">Linha Infantil</Link></li>
              <li><Link to="/loja?sort=promo">Promoções</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Institucional & Ajuda (CRUCIAL) */}
          <div className="footer-col">
            <h4 className="footer-heading">Ajuda</h4>
            <ul className="footer-links">
              <li><Link to="/faq">Política de Reembolsos</Link></li>
              <li><Link to="/faq">Dúvidas Frequentes (FAQ)</Link></li>
              <li><Link to="/privacidade">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Pagamento e Segurança */}
          <div className="footer-col">
            <h4 className="footer-heading">Pagamento Seguro</h4>
            <p className="footer-text-sm">Ambiente criptografado. Aceitamos:</p>

            {/* Simulação visual dos selos de pagamento */}
            <div className="payment-badges">
              <div className="badge">PIX</div>
              <div className="badge">VISA</div>
              <div className="badge">Master</div>
              <div className="badge">Elo</div>
            </div>

            <div className="security-seal">
              <FaCheckCircle className="security-icon" />
              <span>Site Verificado & Seguro</span>
            </div>
          </div>

        </div>

        {/* Barra Inferior 
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} K&A. Todos os direitos reservados.</p>
          <p className="cnpj-text">
            CNPJ: 00.000.000/0001-00 <span className="separator">|</span> Rua Exemplo, 123 - Cidade, Estado
          </p>
        </div>*/}

      </div>
    </footer>
  );
}