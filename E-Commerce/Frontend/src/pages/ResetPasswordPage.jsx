import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RequestResetPage.css'; // Reutilizando o CSS da página de solicitação

// Importa a URL da API a partir das variáveis de ambiente para consistência
const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    try {
      await axios.put(`${API_URL}/api/auth/reset-password/${token}`, { password });

      setMessage('Senha redefinida com sucesso! A redirecionar para o login...');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      setError(err.response?.data?.message || 'Token inválido ou expirado. Por favor, solicite uma nova redefinição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-reset-container">
      <form onSubmit={handleSubmit} className="request-reset-form">
        <h1>Crie sua Nova Senha</h1>
        <div className="form-group">
          <label htmlFor="password">Nova Senha</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'A Salvar...' : 'Redefinir Senha'}
        </button>
      </form>
    </div>
  );
}