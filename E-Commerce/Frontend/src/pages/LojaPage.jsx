import React, { useState, useEffect } from 'react';
import ProdutoCard from '../components/ProductCard.jsx';
import './LojaPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function LojaPage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  /* Pagination State */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Updated to 12 to fit grid of 4

  useEffect(() => {
    // Busca os produtos e as categorias da API
    const fetchData = async () => {
      try {
        const [produtosRes, categoriasRes] = await Promise.all([
          fetch(`${API_URL}/api/produtos`),
          fetch(`${API_URL}/api/categorias`)
        ]);
        const produtosData = await produtosRes.json();
        // Sort items by date descending (newest first)
        produtosData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const categoriasData = await categoriasRes.json();
        setProdutos(produtosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar dados da loja:', error);
      }
    };
    fetchData();
  }, []);

  // Filtra os produtos
  const produtosFiltrados = produtos.filter(produto => {
    const correspondeBusca = produto.productName.toLowerCase().includes(termoBusca.toLowerCase());
    const correspondeCategoria = categoriaSelecionada ? produto.category?._id === categoriaSelecionada : true;
    return correspondeBusca && correspondeCategoria;
  });

  // Calculate Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = produtosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(produtosFiltrados.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [termoBusca, categoriaSelecionada]);

  return (
    <div className="loja-page">
      <div className="loja-header">
        <h1>Encontre sua arte</h1>
        <p className="loja-subtitle">Arquivos de alta qualidade para sublimação. Prontos para imprimir e estampar.</p>
      </div>

      <div className="loja-content-wrapper">
        {/* Sidebar: Search and Filters */}
        <aside className="loja-sidebar">
          {/* Search Section */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              Buscar Produtos
            </h3>
            <div className="search-input-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Digite o nome da arte..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="search-input"
              />
              {termoBusca && (
                <button
                  className="clear-search"
                  onClick={() => setTermoBusca('')}
                  aria-label="Limpar busca"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Categories Section */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Categorias
            </h3>
            <div className="category-list">
              <button
                className={`category-btn ${categoriaSelecionada === '' ? 'active' : ''}`}
                onClick={() => setCategoriaSelecionada('')}
              >
                <span className="category-indicator"></span>
                <span className="category-label">Todas as Artes</span>
                <span className="category-count">{produtos.length}</span>
              </button>
              {Array.isArray(categorias) && categorias.map(cat => {
                const count = produtos.filter(p => p.category?._id === cat._id).length;
                return (
                  <button
                    key={cat._id}
                    className={`category-btn ${categoriaSelecionada === cat._id ? 'active' : ''}`}
                    onClick={() => setCategoriaSelecionada(cat._id)}
                  >
                    <span className="category-indicator"></span>
                    <span className="category-label">{cat.name}</span>
                    <span className="category-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Info */}
          <div className="sidebar-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>{produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}</span>
          </div>
        </aside>

        {/* Main Content: Product Grid and Pagination */}
        <main className="loja-main">
          <div className="produtos-grid">
            {currentItems.length > 0 ? (
              currentItems.map((produto) => (
                <ProdutoCard key={produto._id} produto={produto} />
              ))
            ) : (
              <p>Nenhum produto encontrado com os filtros aplicados.</p>
            )}
          </div>

          {/* Pagination Controls - Smart Sliding Window */}
          {totalPages > 1 && (
            <div className="pagination">
              {/* Previous Button */}
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn page-nav"
              >
                ← Anterior
              </button>

              {/* Page Numbers with Sliding Window */}
              {(() => {
                const maxVisiblePages = 15;
                const pages = [];

                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total is less than max
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => paginate(i)}
                        className={`page-btn ${currentPage === i ? 'active' : ''}`}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  // Smart sliding window logic
                  const halfWindow = Math.floor(maxVisiblePages / 2);
                  let startPage = Math.max(1, currentPage - halfWindow);
                  let endPage = Math.min(totalPages, currentPage + halfWindow);

                  // Adjust if we're near the start
                  if (currentPage <= halfWindow) {
                    endPage = maxVisiblePages;
                  }

                  // Adjust if we're near the end
                  if (currentPage > totalPages - halfWindow) {
                    startPage = totalPages - maxVisiblePages + 1;
                  }

                  // Always show first page
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => paginate(1)}
                        className="page-btn"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis-start" className="page-ellipsis">
                          ...
                        </span>
                      );
                    }
                  }

                  // Show sliding window pages
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => paginate(i)}
                        className={`page-btn ${currentPage === i ? 'active' : ''}`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Always show last page
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis-end" className="page-ellipsis">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => paginate(totalPages)}
                        className="page-btn"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                }

                return pages;
              })()}

              {/* Next Button */}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn page-nav"
              >
                Próximo →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}