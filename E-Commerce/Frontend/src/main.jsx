import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// Componentes de Layout e Páginas
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';
import LojaPage from './pages/LojaPage.jsx';
import ProdutoDetalhePage from './pages/ProdutoDetalhePage.jsx';
import CarrinhoPage from './pages/CarrinhoPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmacaoPage from './pages/ConfirmacaoPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { CarrinhoProvider } from './context/CarrinhoContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // Ficheiro gerado anteriormente

// Páginas de Administração
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProdutoForm from './pages/admin/AdminProdutoForm.jsx';
import AdminColecoesDashboard from './pages/admin/AdminColecoesDashboard.jsx';
import AdminColecaoForm from './pages/admin/AdminColecaoForm.jsx';
import ColecoesListPage from './pages/ColecoesListPage.jsx';
import ColecaoDetalhePage from './pages/ColecaoDetalhePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx'; // Nova página de registo
import ProfilePage from './pages/ProfilePage.jsx'; // Nova página de perfil
import ClientProtectedRoute from './components/ClientProtectedRoute.jsx'; // Antigo ProtectedRoute
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'; // Novo para admin
import RequestResetPage from './pages/RequestResetPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';



// Definição das rotas
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // O 'App' é o elemento PAI (Layout)
    // Rotas filhas que serão renderizadas dentro do <Outlet> do App
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/loja',
        element: <LojaPage />,
      },
      {
        path: '/colecoes',
        element: <ColecoesListPage />,
      },
      {
        path: '/colecoes/:id',
        element: <ColecaoDetalhePage />,
      },
      {
        path: '/produto/:id', // O ':' indica um parâmetro dinâmico
        element: <ProdutoDetalhePage />,
      },
      {
        path: '/carrinho',
        element: <CarrinhoPage />,
      },
      {
        path: '/checkout',
        element: <CheckoutPage />,
      },
      {
        path: '/confirmacao',
        element: <ConfirmacaoPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      // Rotas protegidas para Clientes (precisam de login)
      {
        element: <ClientProtectedRoute />, // Verifica se HÁ token
        children: [
          {
            path: '/perfil',
            element: <ProfilePage />,
          },
          // Outras rotas de cliente, como 'meus-pedidos', podem vir aqui
        ],
      },
      // Rotas protegidas para Admin (precisam de login E ser admin)
      {
        path: '/admin',
        element: <AdminProtectedRoute />, // Verifica se user.isAdmin
        children: [
          {
            path: 'dashboard', // Rota: /admin/dashboard
            element: <AdminDashboard />,
          },
          {
            path: 'produtos/novo', // Rota: /admin/produtos/novo
            element: <AdminProdutoForm />,
          },
          {
            path: 'produtos/editar/:id', // Rota: /admin/produtos/editar/:id
            element: <AdminProdutoForm />,
          },
          {
            path: 'colecoes', // Rota: /admin/colecoes
            element: <AdminColecoesDashboard />,
          },
          {
            path: 'colecoes/nova', // Rota: /admin/colecoes/nova
            element: <AdminColecaoForm />,
          },
          {
            path: 'colecoes/editar/:id', // Rota: /admin/colecoes/editar/:id
            element: <AdminColecaoForm />,
          },
        ],
      },
      // Deve ser a última rota da lista:
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

// Renderiza o aplicativo
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CarrinhoProvider>
        <RouterProvider router={router} />
      </CarrinhoProvider>
    </AuthProvider>
  </React.StrictMode>
);
