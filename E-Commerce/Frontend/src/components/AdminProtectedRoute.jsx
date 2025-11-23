import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const AdminProtectedRoute = () => {
  const { user, token, loading } = useAuth();

  // Enquanto o AuthContext está verificando o token e carregando os dados do usuário,
  // não renderizamos nada para evitar redirecionamentos prematuros.
  if (loading) {
    return null; // Ou um spinner de carregamento
  }

  // Se não há token, o usuário não está logado, redireciona para o login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário está logado mas não é admin, redireciona para o perfil (expulsa da área admin)
  if (user && !user.isAdmin) {
    return <Navigate to="/perfil" replace />;
  }

  // Se o usuário está logado e é admin, permite o acesso às rotas filhas
  return <Outlet />;
};

export default AdminProtectedRoute;