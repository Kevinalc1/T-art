import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <h1>Página Não Encontrada</h1>
      <h2>404</h2>
      <p>Ops! A página que você está procurando não existe ou foi movida.</p>
      <Link to="/" className="btn-voltar">
        Voltar para o Início
      </Link>
    </div>
  );
}