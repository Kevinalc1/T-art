import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 1. Importar o useAuth
import './LoginPage.css'; // Importa o CSS que criamos

// Importa a URL da API a partir das variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para mensagens de erro
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Obter a função de login do contexto

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      // 3. Chamar a função de login do AuthContext, passando as credenciais.
      // O AuthContext é o único responsável por fazer a chamada de API.
      const data = await login(email, password);

      // 4. Redirecionamento inteligente com base no perfil do usuário
      // Acessa o 'user' diretamente do objeto retornado pelo login.
      if (data.user.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/perfil');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error.message || 'Falha na comunicação com o servidor. Tente novamente.');
    }
  };

  return (
    // Container principal que centraliza tudo na tela
    <div className="login-container">
      {/* Card do formulário */}
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Login</h1>

        {/* Mensagem de Erro */}
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
        <div className="login-links">
          <Link to="/register">Não tem uma conta? Registre-se</Link>
          <Link to="/request-reset">Esqueceu a senha?</Link>
        </div>
      </form>
    </div>
  );
}