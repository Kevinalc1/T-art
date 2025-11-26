import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProdutoCardNew = ({ produto }) => {
    if (!produto) return null;

    const thumbnailUrl = produto.imageUrls && produto.imageUrls.length > 0
        ? produto.imageUrls[0]
        : 'https://dummyimage.com/300x300/cccccc/000000.png&text=Sem+Imagem';

    return (
        <div className="produto-card">
            <img src={thumbnailUrl} alt={produto.productName} />
            <div className="card-info">
                <h3>{produto.productName}</h3>
                <p className="price">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.price)}
                </p>
                <Link to={`/produto/${produto._id}`} className="btn-detalhes">Ver Detalhes</Link>
            </div>
        </div>
    );
};

export default ProdutoCardNew;
