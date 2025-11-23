import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/formatters.js'; // Usando o alias de caminho absoluto

// Recebemos o objeto 'produto' como prop
export default function ProdutoCard({ produto }) {
  if (!produto) {
    return null; // Guard clause
  }

  // Desestruturamos para facilitar a leitura
  const { _id, productName, price, imageUrls } = produto;

  // Usamos a primeira imagem da galeria (imageUrls[0])
  const displayImage = imageUrls && imageUrls.length > 0 
    ? imageUrls[0] 
    : 'https://via.placeholder.com/400x400.png?text=Sem+Imagem'; // Fallback

  return (
    // O Card Principal:
    // Fundo branco, cantos arredondados, sombra suave.
    // 'flex-col' para empilhar verticalmente: Imagem, Info, Botão.
    // Animações subtis de hover (sombra e escala) como pediu.
    <div 
      className="flex flex-col bg-acento rounded-lg shadow-md overflow-hidden
                 transition-all duration-300 ease-in-out
                 hover:shadow-xl hover:scale-[1.02]"
    >
      
      {/* 1. Imagem (Também é um Link) */}
      <Link to={`/produto/${_id}`} className="block overflow-hidden aspect-square">
        <img 
          src={displayImage} 
          alt={productName} 
          className="w-full h-full object-cover 
                     transition-transform duration-300 ease-in-out
                     hover:scale-105" // Animação de zoom na imagem
        />
      </Link>

      {/* 2. Informação (Nome e Preço) */}
      {/* 'flex-1' faz esta div "crescer" e empurrar o botão para o fundo */}
      <div className="p-4 flex-1">
        <h3 
          className="text-base font-semibold text-primaria truncate" 
          title={productName} // Acessibilidade: mostra o nome completo em hover
        >
          {productName}
        </h3>
        <p className="text-base text-secundaria mt-1">
          {formatPrice(price)}
        </p>
      </div>

      {/* 3. Botão de Ação (CTA) */}
      <div className="p-4 pt-0">
        <Link 
          to={`/produto/${_id}`} 
          className="block w-full text-center py-2 px-4 
                     bg-acento text-primaria border border-primaria rounded-lg
                     font-semibold text-sm transition-colors duration-300
                     hover:bg-primaria hover:text-acento
                     focus:outline-none focus:ring-2 focus:ring-primaria focus:ring-offset-2"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
}