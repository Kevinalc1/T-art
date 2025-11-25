import React, { useState, useEffect } from 'react';
import ProdutoCard from '../components/ProductCard.jsx';
import './LojaPage.css';

const API_URL = import.meta.env.VITE_API_URL;

export default function LojaPage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  useEffect(() => {
    // Busca os produtos e as categorias da API
    const fetchData = async () => {
      try {
        const [produtosRes, categoriasRes] = await Promise.all([
          fetch(`${API_URL}/api/produtos`),
          fetch(`${API_URL}/api/categorias`) // Busca a lista de categorias do backend
        ]);
        const produtosData = await produtosRes.json();
        const categoriasData = await categoriasRes.json();
        setProdutos(produtosData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao buscar dados da loja:', error);
      }
    };
    fetchData();
  }, []); // O array vazio garante que o efeito rode apenas uma vez

  // Filtra os produtos com base na busca e na categoria selecionada
  const produtosFiltrados = produtos.filter(produto => {
    const correspondeBusca = produto.productName.toLowerCase().includes(termoBusca.toLowerCase());
    // Ajustado para lidar com o objeto de categoria populado
    const correspondeCategoria = categoriaSelecionada ? produto.category?._id === categoriaSelecionada : true;
    return correspondeBusca && correspondeCategoria;
  });

  return (
    <div className="loja-page">
      <h1>Nossa Loja</h1>

      {/* Seção de Controles de Busca e Filtro */}
      <div className="loja-controles">
        <div className="campo-busca">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
        </div>
      </div>

      {/* Nova seção de filtros por categoria com botões */}
      <div className="filtro-categorias">
        <button
          className={`btn-categoria ${categoriaSelecionada === '' ? 'active' : ''}`}
          onClick={() => setCategoriaSelecionada('')}
        >
          Todas
        </button>
        {Array.isArray(categorias) && categorias.map(cat => (
          <button
            key={cat._id}
            className={`btn-categoria ${categoriaSelecionada === cat._id ? 'active' : ''}`}
            onClick={() => setCategoriaSelecionada(cat._id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="produtos-grid">
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => (
            <ProdutoCard key={produto._id} produto={produto} />
          ))
        ) : (
          <p>Nenhum produto encontrado com os filtros aplicados.</p>
        )}
      </div>
    </div>
  );
}