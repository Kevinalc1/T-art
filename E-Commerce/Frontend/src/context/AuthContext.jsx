import React, { createContext, useContext, useState, useEffect } from 'react';

// URL base da API a partir das variáveis de ambiente
const API_URL = import.meta.env.VITE_API_URL;

// 1. Criar o Contexto
const AuthContext = createContext(null);

// 2. Criar o Provedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('userToken') || null);
  const [loading, setLoading] = useState(true); // Para saber quando a verificação inicial terminou

  // Efeito para buscar dados do usuário se um token existir no carregamento da página
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/perfil`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData); // Armazena os dados do usuário (ex: { id, email, isAdmin })
          } else {
            // Se o token for inválido/expirado, limpa o estado
            logout();
          }
        } catch (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          logout(); // Limpa em caso de erro de rede
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [token]);

  // Função de Login
  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('userToken', data.token);
      setToken(data.token);
      // O useEffect vai cuidar de buscar e setar o usuário
      return data;
    } else {
      // Tratamento de erro robusto
      // Verifica se a resposta tem um corpo JSON antes de tentar parseá-lo
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no login');
      } else {
        // Se não for JSON, lança um erro com o status da resposta
        throw new Error(`Erro no servidor: ${response.status} ${response.statusText}`);
      }
    }
  };

  // Função de Registro
  const register = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('userToken', data.token);
      setToken(data.token);
      // O useEffect vai cuidar de buscar e setar o usuário
      return data;
    } else {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no registro');
      } else {
        throw new Error(`Erro no servidor: ${response.status} ${response.statusText}`);
      }
    }
  };

  // Função de Logout
  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    setToken(null);
  };

  // Valor a ser passado para os componentes filhos
  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token, // Um booleano prático para verificar se está logado
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Criar o Hook customizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};