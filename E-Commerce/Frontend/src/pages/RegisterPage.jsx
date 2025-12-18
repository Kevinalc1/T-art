import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import './RegisterPage.css';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.senhasNaoCoincidem'));
      return;
    }

    try {
      await register(email, password);
      navigate('/perfil');
    } catch (err) {
      console.error('Erro ao registrar:', err);
      setError(err.message || 'Ocorreu um erro ao tentar registrar. Tente novamente.');
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h1>{t('auth.registroTitulo')}</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">{t('auth.senha')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">{t('auth.confirmarSenha')}</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn-register">{t('auth.registrar')}</button>
        <div className="register-links">
          <Link to="/login">{t('auth.jaTemConta')}</Link>
        </div>
      </form>
    </div>
  );
}