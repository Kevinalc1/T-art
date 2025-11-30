import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';
import './ColecaoDetalhePage.css'; // CSS para estilização

export default function ColecaoDetalhePage() {
  const { id } = useParams();
  const [colecao, setColecao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchColecao = async () => {
      try {
        // A rota GET /api/colecoes/:id precisa existir no seu backend
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/colecoes/${id}`);
        setColecao(data);
      } catch (err) {
        setError('Erro ao carregar os detalhes da coleção.');
        console.error('Erro ao buscar coleção:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchColecao();
  }, [id]);

  if (loading) return <p>A carregar coleção...</p>;
  if (error) return <p>{error}</p>;
  if (!colecao) return <p>Coleção não encontrada.</p>;

  return (
    <div className="colecao-detalhe-page">
      <div className="colecao-header">
        <h1>{colecao.name}</h1>
        <p>{colecao.description}</p>
      </div>

      <h2>Produtos desta Coleção</h2>
      <div className="produtos-grid">
        {colecao.products && colecao.products.length > 0 ? (
          colecao.products.map((produto) => (
            <ProductCard key={produto._id} produto={produto} />
          ))
        ) : (
          <p>Esta coleção ainda não possui produtos.</p>
        )}
      </div>
    </div>
  );
}