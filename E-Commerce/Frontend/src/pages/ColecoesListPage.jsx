import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BsArrowRight } from 'react-icons/bs';
import './ColecoesListPage.css';

export default function ColecoesListPage() {
  const [colecoes, setColecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColecoes = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/colecoes`);
        setColecoes(data);
      } catch (err) {
        setError('Erro ao carregar as coleções.');
        console.error('Erro ao buscar coleções:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchColecoes();
  }, []);

  if (loading) return <div className="loading-container"><p>Carregando coleções...</p></div>;
  if (error) return <div className="error-container"><p>{error}</p></div>;

  return (
    <div className="colecoes-list-page">
      {/* Cabeçalho da Página */}
      <div className="colecoes-header">
        <h1>Nossas Coleções</h1>
        <p>
          Explore nossas estampas exclusivas organizadas por temas.
          Encontre a arte perfeita para você ou para presentear.
        </p>
      </div>

      {/* Grid de Coleções */}
      <div className="colecoes-grid">
        {colecoes.length > 0 ? (
          colecoes.map((colecao) => (
            <Link to={`/colecoes/${colecao._id}`} key={colecao._id} className="collection-card group">

              {/* Imagem com Zoom */}
              <div className="card-image-wrapper">
                <img
                  src={colecao.coverImage || 'https://dummyimage.com/600x400/eee/aaa'}
                  alt={colecao.name}
                  className="card-image"
                />
                <div className="card-overlay"></div>
              </div>

              {/* Conteúdo */}
              <div className="card-content">
                <h3 className="card-title">{colecao.name}</h3>

                {/* Descrição curta (opcional, truncada) */}
                {colecao.description && (
                  <p className="card-description">
                    {colecao.description.length > 60
                      ? colecao.description.substring(0, 60) + '...'
                      : colecao.description}
                  </p>
                )}

                {/* CTA Hover */}
                <div className="card-cta">
                  <span>Explorar Coleção</span>
                  <BsArrowRight className="cta-icon" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-results">
            <p>Nenhuma coleção encontrada no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}