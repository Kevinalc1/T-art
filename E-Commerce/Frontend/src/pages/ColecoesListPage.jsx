import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './ColecoesListPage.css';

export default function ColecoesListPage() {
  const { t } = useTranslation();
  const [colecoes, setColecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColecoes = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/colecoes`);
        setColecoes(data);
      } catch (err) {
        setError(t('collections.erroListar'));
        console.error('Erro ao buscar coleções:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchColecoes();
  }, [t]);

  if (loading) return <p>{t('collections.carregando')}</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="colecoes-list-page">
      <h1>{t('collections.titulo')}</h1>
      <div className="colecoes-grid">
        {colecoes.length > 0 ? (
          colecoes.map((colecao) => (
            <Link to={`/colecoes/${colecao._id}`} key={colecao._id} className="colecao-card">
              <img src={colecao.coverImage} alt={colecao.name} />
              <div className="colecao-card-info">
                <h3>{colecao.name}</h3>
                <p>{colecao.description}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>{t('collections.nenhumaColecao')}</p>
        )}
      </div>
    </div>
  );
}