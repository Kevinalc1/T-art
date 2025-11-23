import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ColecoesListPage.css';

export default function ColecoesListPage() {
  const [colecoes, setColecoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchColecoes = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/colecoes');
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
  
  if (loading) return <p>A carregar coleções...</p>;
  if (error) return <p>{error}</p>;
  
  return (
    <div className="colecoes-list-page">
      <h1>Nossas Coleções</h1>
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
          <p>Nenhuma coleção encontrada no momento.</p>
        )}
      </div>
    </div>
  );
}