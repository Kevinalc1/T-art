import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [produtos, setProdutos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    // Busca Produtos e Categorias em paralelo
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/produtos`),
          fetch(`${import.meta.env.VITE_API_URL}/api/categorias`)
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        setProdutos(prodData);
        setCategories(catData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja apagar "${name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/produtos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProdutos(produtos.filter((produto) => produto._id !== id));
    } catch (error) {
      console.error('Erro ao apagar produto:', error);
      alert(error.response?.data?.message || 'Ocorreu um erro ao tentar apagar o produto.');
    }
  };

  // Filtragem combinada (Busca + Categoria)
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? (produto.category?._id === selectedCategory || produto.category === selectedCategory)
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-dashboard-enhanced">
      <header className="admin-header-enhanced">
        <div className="header-title">
          <h1>Meus Produtos</h1>
          <p>Gerencie seu catálogo de artes digitais.</p>
        </div>

        <div className="admin-actions-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center', width: '100%', maxWidth: '600px', flexWrap: 'wrap' }}>
          <div className="admin-search-enhanced" style={{ flex: 1 }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/admin/produtos/novo" className="btn-novo" style={{ whiteSpace: 'nowrap', height: '42px', display: 'flex', alignItems: 'center' }}>
            + Novo Produto
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="admin-loading"><div className="spinner"></div></div>
      ) : (
        <div className="admin-content-wrapper">
          {/* ÁREA PRINCIPAL DA GRID */}
          <main className="admin-main-grid-area">
            {filteredProdutos.length === 0 ? (
              <div className="admin-empty-state">
                <p>Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="admin-product-grid">
                {filteredProdutos.map((produto) => (
                  <div key={produto._id} className="product-card">
                    <div className="product-card-image">
                      <img
                        src={produto.imageUrls && produto.imageUrls.length > 0 ? produto.imageUrls[0] : 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                        alt={produto.productName}
                        loading="lazy"
                      />
                    </div>
                    <div className="product-card-content">
                      <h3 className="product-card-title">{produto.productName}</h3>
                      <div className="product-card-price">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
                      </div>

                      <div className="product-card-actions">
                        <Link to={`/admin/produtos/editar/${produto._id}`} className="btn-card-edit">
                          ✏️ Editar
                        </Link>
                        <button onClick={() => handleDelete(produto._id, produto.productName)} className="btn-card-delete">
                          🗑️ Apagar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* SIDEBAR DE FILTROS */}
          <aside className="admin-filter-sidebar">
            <div className="filter-group">
              <h3>Categorias</h3>
              <div className="filter-category-list">
                <button
                  className={`filter-cat-btn ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  <span>Todas</span>
                  <span className="cat-count">{produtos.length}</span>
                </button>

                {categories.map(cat => {
                  // Contar produtos nesta categoria
                  const count = produtos.filter(p => p.category?._id === cat._id || p.category === cat._id).length;
                  return (
                    <button
                      key={cat._id}
                      className={`filter-cat-btn ${selectedCategory === cat._id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat._id)}
                    >
                      <span>{cat.name}</span>
                      <span className="cat-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}