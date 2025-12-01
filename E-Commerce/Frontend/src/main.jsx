import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import { AuthProvider } from './context/AuthContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

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
import MeusPedidos from './pages/MeusPedidos.jsx';
import ProfileHome from './pages/ProfileHome.jsx';
import ConfiguracoesPage from './pages/ConfiguracoesPage.jsx';
import ClientProtectedRoute from './components/ClientProtectedRoute.jsx'; // Antigo ProtectedRoute
import AdminProtectedRoute from './components/AdminProtectedRoute.jsx'; // Novo para admin
import RequestResetPage from './pages/RequestResetPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import LibraryTab from './components/Profile/LibraryTab.jsx';

import SecurityTab from './components/Profile/SecurityTab.jsx';
import SupportTab from './components/Profile/SupportTab.jsx';
import WishlistPage from './pages/WishlistPage.jsx';



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
            element: <ProfilePage />, // Layout do Dashboard
            children: [
              {
                index: true,
                element: <LibraryTab />, // Default: Minha Biblioteca
              },

              {
                path: 'seguranca',
                element: <SecurityTab />,
              },
              {
                path: 'suporte',
                element: <SupportTab />,
              },
              {
                path: 'configuracoes', // Mantendo por compatibilidade ou redirecionar
                element: <ConfiguracoesPage />,
              },
              // Rotas de Admin aninhadas no Dashboard
              {
                element: <AdminProtectedRoute />, // Proteção extra para rotas de admin
                children: [
                  {
                    path: 'produtos',
                    element: <AdminDashboard />,
                  },
                  {
                    path: 'colecoes',
                    element: <AdminColecoesDashboard />,
                  },
                ],
              },
            ],
          },
        ],
      },
      // Rotas de Admin (Forms e Edição - mantidas fora ou adaptadas se necessário, mas por enquanto acessíveis)
      // Podemos manter as rotas de criação/edição como filhas de /admin ou mover para /perfil também.
      // O plano dizia para mover tudo, mas forms geralmente precisam de espaço. 
      // Vamos manter a estrutura antiga para os forms por enquanto para não quebrar links internos dos dashboards,
      // MAS os dashboards agora vivem em /perfil.
      // O problema é que os dashboards tem links para /admin/produtos/novo etc.
      // Então precisamos manter essas rotas de forms funcionando em /admin ou atualizar os links nos dashboards.
      // Os dashboards atualizados (que eu acabei de escrever) ainda apontam para /admin/produtos/novo.
      // Então vou manter as rotas de forms em /admin por compatibilidade dos links, mas remover os dashboards de lá.
      {
        path: '/admin',
        element: <AdminProtectedRoute />,
        children: [
          // Dashboards removidos daqui, agora estão em /perfil
          {
            path: 'produtos/novo',
            element: <AdminProdutoForm />,
          },
          {
            path: 'produtos/editar/:id',
            element: <AdminProdutoForm />,
          },
          {
            path: 'colecoes/nova',
            element: <AdminColecaoForm />,
          },
          {
            path: 'colecoes/editar/:id',
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
        <WishlistProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </WishlistProvider>
      </CarrinhoProvider>
    </AuthProvider>
  </React.StrictMode>
);
