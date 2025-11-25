import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminColecaoForm.css'; // Usando um CSS dedicado para a página de coleções

export default function AdminColecaoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Estados do formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [existingCoverImage, setExistingCoverImage] = useState('');

  // Estados para seleção de produtos
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado de carregamento
  const [uploading, setUploading] = useState(false);

  // Efeito para buscar todos os produtos disponíveis
  useEffect(() => {
    axios.get('http://localhost:4000/api/produtos')
      .then(res => {
        setAllProducts(res.data);
      })
      .catch(error => console.error('Erro ao buscar produtos:', error));
  }, []);

  // Efeito para buscar dados da coleção em modo de edição
  useEffect(() => {
    if (isEditing) {
      axios.get(`http://localhost:4000/api/colecoes/${id}`)
        .then(res => {
          const { name, description, coverImage, products } = res.data;
          setName(name);
          setDescription(description);
          setExistingCoverImage(coverImage);
          // Extrai apenas os IDs dos produtos populados
          setSelectedProducts(products.map(p => p._id));
        })
        .catch(error => console.error('Erro ao buscar coleção:', error));
    }
  }, [id, isEditing]);

  // Handler para adicionar/remover produtos da seleção
  const handleProductSelect = (productId) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    let coverImageUrl = existingCoverImage;
    const cloudName = 'dd1prhitf'; // SEU CLOUD NAME
    const preset = 'cristianoalc_preset'; // SEU PRESET

    // 1. Upload da imagem de capa, se uma nova foi selecionada
    if (coverImageFile) {
      const data = new FormData();
      data.append('file', coverImageFile);
      data.append('upload_preset', preset);
      data.append('cloud_name', cloudName);

      try {
        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, data);
        coverImageUrl = res.data.secure_url;
      } catch (err) {
        console.error('Erro no upload da imagem de capa:', err);
        setUploading(false);
        alert('Erro ao fazer upload da imagem.');
        return;
      }
    }

    // 2. Preparar os dados e enviar para o nosso backend
    const token = localStorage.getItem('userToken');
    const url = isEditing ? `http://localhost:4000/api/colecoes/${id}` : 'http://localhost:4000/api/colecoes';
    const method = isEditing ? 'put' : 'post';

    const colecaoData = {
      name,
      description,
      coverImage: coverImageUrl,
      products: selectedProducts,
    };

    try {
      await axios({
        method: method,
        url: url,
        data: colecaoData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setUploading(false);
      alert(`Coleção ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
      navigate('/admin/colecoes'); // Navega para a página de gestão de coleções
    } catch (err) {
      console.error('Erro ao salvar a coleção:', err);
      setUploading(false);
      alert('Erro ao salvar a coleção no banco de dados.');
    }
  };

  // Filtra os produtos com base no termo de busca
  const filteredProducts = allProducts.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-colecao-form-container">
      <h1>{isEditing ? 'Editar Coleção' : 'Adicionar Nova Coleção'}</h1>
      <form onSubmit={handleSubmit} className="admin-colecao-form">
        <div className="form-fields">
          <div className="form-group">
            <label htmlFor="name">Nome da Coleção</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">Imagem de Capa</label>
            <input
              type="file"
              id="coverImage"
              onChange={(e) => setCoverImageFile(e.target.files[0])}
            />
            {isEditing && existingCoverImage && !coverImageFile && (
              <div className="image-preview">
                <p>Imagem atual:</p>
                <img src={existingCoverImage} alt="Capa atual" />
              </div>
            )}
          </div>
        </div>

        <div className="product-selection-container">
          <h3>Produtos</h3>
          <p>Selecione os produtos que fazem parte desta coleção:</p>
          <div className="product-search-wrapper">
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="product-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="product-list">
            {filteredProducts.map(product => (
              <div key={product._id} className="product-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => handleProductSelect(product._id)}
                  />
                  {product.productName}
                </label>
              </div>
            ))}
          </div>
        </div>
      </form>
      <button type="submit" form="admin-colecao-form" className="btn-salvar" disabled={uploading} onClick={handleSubmit}>
        {uploading ? 'A Salvar...' : (isEditing ? 'Atualizar Coleção' : 'Salvar Coleção')}
      </button>
    </div>
  );
}