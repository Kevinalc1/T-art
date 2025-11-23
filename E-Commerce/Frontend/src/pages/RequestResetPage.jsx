import React, { useState } from 'react';
import axios from 'axios';
import './RequestResetPage.css'; // Vamos criar um CSS básico

// Importa a URL da API a partir das variáveis de ambiente para consistência
const API_URL = import.meta.env.VITE_API_URL;

export default function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Faz a chamada para o backend usando a variável de ambiente
      await axios.post(`${API_URL}/api/auth/request-reset`, { email });

      // Define a mensagem de sucesso para o usuário
      setMessage('E-mail enviado com sucesso (se a conta existir). Por favor, verifique sua caixa de entrada e a pasta de spam.');
    } catch (err) {
      console.error('Erro ao solicitar redefinição:', err);
      // Mostra uma mensagem de erro genérica em caso de falha do servidor
      setError('Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-reset-container">
      <form onSubmit={handleSubmit} className="request-reset-form">
        <h1>Esqueceu sua Senha?</h1>
        <p>Não se preocupe. Insira seu e-mail abaixo e enviaremos um link para você criar uma nova senha.</p>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'A Enviar...' : 'Enviar Link de Redefinição'}
        </button>
      </form>
    </div>
  );
}