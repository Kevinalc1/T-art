import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setToken } = useAuth(); // Assumindo que setToken existe ou login pode ser usado

  // Check for token in URL (from social login callback)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Force reload or update context to set user
      // Idealmente, useAuth deveria ter um método para setar o token e buscar o user
      // Como não tenho certeza da implementação do AuthContext, vou recarregar a página para pegar o token do localStorage
      // Mas antes, vou tentar navegar para home
      window.location.href = '/';
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      // Redirecionamento para a Home Page após login
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error.message || 'Falha na comunicação com o servidor. Tente novamente.');
    }
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `${API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Login</h1>

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-login">
          Entrar
        </button>

        <div className="social-login-divider">
          <span>ou entre com</span>
        </div>

        <div className="social-login-buttons">
          <button type="button" className="btn-social btn-google" onClick={() => handleSocialLogin('google')}>
            Google
          </button>
          <button type="button" className="btn-social btn-facebook" onClick={() => handleSocialLogin('facebook')}>
            Facebook
          </button>
        </div>

        <div className="login-links">
          <Link to="/register">Não tem uma conta? Registre-se</Link>
          <Link to="/request-reset">Esqueceu a senha?</Link>
        </div>
      </form>
    </div>
  );
}