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
      <h1>Encontre sua arte</h1>

      <div className="loja-content-wrapper">
        {/* Sidebar: Search and Filters */}
        <aside className="loja-sidebar">
          <div className="sidebar-section">
            <h3>Buscar</h3>
            <div className="campo-busca">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Categorias</h3>
            <div className="filtro-categorias-vertical">
              <button
                className={`btn-categoria-vertical ${categoriaSelecionada === '' ? 'active' : ''}`}
                onClick={() => setCategoriaSelecionada('')}
              >
                Todas
              </button>
              {Array.isArray(categorias) && categorias.map(cat => (
                <button
                  key={cat._id}
                  className={`btn-categoria-vertical ${categoriaSelecionada === cat._id ? 'active' : ''}`}
                  onClick={() => setCategoriaSelecionada(cat._id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Próximo
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}