import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard.jsx';
import './ColecaoDetalhePage.css';

export default function ColecaoDetalhePage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [colecao, setColecao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchColecao = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/colecoes/${id}`);
        setColecao(data);
      } catch (err) {
        setError(t('collections.erroDetalhe'));
        console.error('Erro ao buscar coleção:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchColecao();
  }, [id, t]);

  if (loading) return <p>{t('collections.carregando')}</p>;
  if (error) return <p>{error}</p>;
  if (!colecao) return <p>{t('collections.naoEncontrada')}</p>;

  return (
    <div className="colecao-detalhe-page">
      <div className="colecao-header">
        <h1>{colecao.name}</h1>
        <p>{colecao.description}</p>
      </div>

      <h2>{t('collections.produtosTitulo')}</h2>
      <div className="produtos-grid">
        {colecao.products && colecao.products.length > 0 ? (
          colecao.products.map((produto) => (
            <ProductCard key={produto._id} produto={produto} />
          ))
        ) : (
          <p>{t('collections.semProdutos')}</p>
        )}
      </div>
    </div>
  );
}