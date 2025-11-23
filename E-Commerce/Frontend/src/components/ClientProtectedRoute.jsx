import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ClientProtectedRoute = () => {
  const token = localStorage.getItem('userToken');

  // Se o token existe, permite o acesso à rota filha (renderiza o <Outlet />)
  // Se não, redireciona para a página de login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ClientProtectedRoute;