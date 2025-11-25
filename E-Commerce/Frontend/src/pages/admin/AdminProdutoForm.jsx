import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminProdutoForm.css';
import axios from 'axios';

export default function AdminProdutoForm() {
  const { id } = useParams(); // Pega o 'id' da URL, se existir
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  // Estados para o novo modal de categoria
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '', // Iniciar como string para facilitar o input
    category: '',
    imageUrls: [],
    downloadUrl: '',
    isCombo: false,
    comboProducts: [],
  });

  const isEditing = Boolean(id);

  // Efeito para buscar todos os produtos para o seletor de combo
  useEffect(() => {
    axios.get('http://localhost:4000/api/produtos')
      .then((res) => {
        setAllProducts(res.data);
      })
      .catch((error) => console.error('Erro ao buscar todos os produtos:', error));
  }, []);

  // Efeito para buscar todas as categorias existentes
  useEffect(() => {
    axios.get('http://localhost:4000/api/categorias') // Assumindo que esta rota existe no seu backend
      .then(res => setAllCategories(res.data))
      .catch(error => console.error('Erro ao buscar categorias:', error));
  }, []);

  // Efeito para buscar os dados do produto se estivermos em modo de edição
  useEffect(() => {
    setLoading(true);
    if (isEditing) {
      axios.get(`http://localhost:4000/api/produtos/${id}`)
        .then((res) => {
          const data = res.data;
          setFormData({
            productName: data.productName,
            description: data.description || '',
            price: data.price,
            // Se a categoria vier populada (como objeto), usamos o _id. Senão, usamos o valor direto.
            category: data.category ? data.category._id : '',
            imageUrls: data.imageUrls || [],
            // Garante que o downloadUrl não seja undefined, o que pode causar problemas com inputs não controlados
            downloadUrl: data.downloadUrl || '',
            isCombo: data.isCombo || false,
            comboProducts: data.comboProducts || [],
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error('Erro ao buscar produto:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleComboToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData(prevData => ({
      ...prevData,
      isCombo: isChecked,
      // Limpa os produtos do combo se o usuário desmarcar a opção
      comboProducts: isChecked ? prevData.comboProducts : [],
      // Limpa o ficheiro de download se o usuário marcar como combo
      downloadUrl: isChecked ? '' : prevData.downloadUrl
    }));
  };

  const handleProductSelect = (productId) => {
    setFormData(prevData => {
      const currentComboIds = (prevData.comboProducts || []).map(p => typeof p === 'object' ? p._id : p);
      const isSelected = currentComboIds.includes(productId);
      const newComboProducts = isSelected ? currentComboIds.filter(id => id !== productId) : [...currentComboIds, productId];
      return { ...prevData, comboProducts: newComboProducts };
    });
  };

  // Função chamada ao confirmar a criação no modal
  const handleConfirmCreateCategory = async () => {
    if (!newCategoryNameInput || newCategoryNameInput.trim() === '') {
      alert('Por favor, digite um nome para a categoria.');
      return;
    }
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        'http://localhost:4000/api/categorias',
        { name: newCategoryNameInput.trim() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const newCategory = response.data;

      setAllCategories(prevCategories => [...prevCategories, newCategory]);
      setFormData(prevData => ({
        ...prevData,
        category: newCategory._id
      }));

      // Fecha o modal e limpa o input
      setIsModalOpen(false);
      setNewCategoryNameInput('');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      // Garante que a mensagem específica do backend seja exibida.
      const errorMessage = error.response?.data?.message || 'Não foi possível criar a nova categoria. Verifique o console para mais detalhes.';
      alert(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newDownloadUrl = formData.downloadUrl;
    let newImageUrls = formData.imageUrls || [];
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET;

    // 1. Upload do Ficheiro de Download (se mudou E NÃO for um combo)
    if (file && !formData.isCombo) {
      setUploading(true);
      const data = new FormData();
      data.append('file', file);

      try {
        // Alterado para usar o endpoint local de upload
        const res = await axios.post('http://localhost:4000/api/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        // O backend retorna { filePath: '/uploads/nome-do-arquivo.ext' }
        // Precisamos garantir que a URL completa seja salva ou que o frontend saiba lidar com caminho relativo.
        // Aqui vamos salvar a URL completa para facilitar.
        newDownloadUrl = `http://localhost:4000${res.data.filePath}`;
        setUploading(false);
      } catch (err) {
        console.error('Erro no upload do downloadUrl:', err);
        setUploading(false);
        const errorMsg = err.response?.data?.message || err.message;
        alert(`Erro ao fazer upload do ficheiro de download: ${errorMsg}`);
        return;
      }
    }

    // 2. Upload das Imagens da Galeria (se mudou) 
    if (galleryFiles && galleryFiles.length > 0) {
      setGalleryUploading(true);
      const uploadPromises = [];

      for (let i = 0; i < galleryFiles.length; i++) {
        const data = new FormData();
        data.append('file', galleryFiles[i]);
        data.append('upload_preset', preset);
        data.append('cloud_name', cloudName);
        uploadPromises.push(axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, data));
      }
      try {
        const responses = await Promise.all(uploadPromises);
        newImageUrls = responses.map(res => res.data.secure_url); // Substitui a galeria 
        setGalleryUploading(false);
      } catch (err) {
        console.error('Erro no upload da galeria:', err);
        setGalleryUploading(false);
        alert('Erro ao fazer upload das imagens da galeria.');
        return;
      }
    }
    // 3. Enviar para o NOSSO Backend 
    const token = localStorage.getItem('userToken'); // Token já foi pego acima, mas repetimos por clareza
    const url = id ? `/api/produtos/${id}` : '/api/produtos';
    const method = id ? 'PUT' : 'POST';

    // Prepara os dados para o backend
    const dataToSend = {
      ...formData,
      category: formData.category,
      // Garante que comboProducts contenha apenas IDs, e não objetos completos
      comboProducts: formData.comboProducts.map(p => typeof p === 'object' ? p._id : p),
      price: parseFloat(formData.price),
      imageUrls: newImageUrls,
      // Se NÃO for um combo, envie o downloadUrl. Se for, o backend não precisa dele.
      downloadUrl: !formData.isCombo ? newDownloadUrl : undefined,
    };

    setUploading(true); // Garante que o botão mostre "A Salvar..."
    try {
      await axios({
        method: method,
        url: `http://localhost:4000${url}`, // Use a sua variável de ambiente aqui 
        data: dataToSend,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Erro ao salvar o produto:', err);
      alert(err.response?.data?.message || 'Erro ao salvar o produto no banco de dados.');
      setUploading(false); // Libera o botão em caso de erro
    }
  };

  if (loading) return <p>A carregar formulário...</p>;

  return (
    <div className="admin-produto-form-container">
      <h1>{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</h1>
      <form id="product-form" onSubmit={handleSubmit} className="admin-produto-form">
        {/* Coluna da Esquerda: Campos Principais */}
        <div className="form-fields">
          <div className="form-group">
            <label htmlFor="productName">Nome do Produto</label>
            <input type="text" id="productName" name="productName" value={formData.productName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="price">Preço (R$)</label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" />
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoria</label>
            <div className="category-selection-wrapper">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">-- Selecione uma categoria --</option>
                {allCategories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <button type="button" className="btn-create-category" onClick={() => setIsModalOpen(true)}>
                + Criar Nova
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gallery">Imagens da Galeria (Mockups)</label>
            <input
              type="file"
              id="gallery"
              multiple // Permite selecionar múltiplos ficheiros
              onChange={(e) => setGalleryFiles(e.target.files)}
            />
            {galleryUploading && <p className="upload-status">A enviar imagens da galeria...</p>}
            {formData.imageUrls && formData.imageUrls.length > 0 && !galleryFiles && (
              <div className="image-preview-list">
                <p>Imagens atuais: {formData.imageUrls.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna da Direita: Opções de Combo e Ficheiros */}
        <div className="form-options">
          <div className="form-group combo-toggle">
            <label>
              <input
                type="checkbox"
                checked={formData.isCombo}
                onChange={handleComboToggle}
              />
              Este produto é um Combo (Pacote)
            </label>
          </div>

          {formData.isCombo ? (
            <div className="combo-product-selection">
              <h3>Selecione as Artes do Combo</h3>
              <div className="product-list">
                {allProducts.filter(p => !p.isCombo && p._id !== id).map(prod => (
                  <div key={prod._id} className="product-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={(formData.comboProducts || []).map(p => typeof p === 'object' ? p._id : p).includes(prod._id)}
                        onChange={() => handleProductSelect(prod._id)}
                      />
                      {prod.productName}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="file">Ficheiro da Arte (Download)</label>
              <input type="file" id="file" onChange={(e) => setFile(e.target.files[0])} />
              {file && (
                <div className="image-preview-single">
                  <p>Pré-visualização:</p>
                  <img src={URL.createObjectURL(file)} alt="Preview da arte" />
                </div>
              )}
              {isEditing && formData.downloadUrl && !file && <p className="file-info">Ficheiro atual carregado.</p>}
              {uploading && <p className="upload-status">A enviar ficheiro...</p>}
            </div>
          )}
        </div>
      </form>
      <button type="submit" form="product-form" className="btn-salvar" disabled={uploading || galleryUploading}>
        {uploading || galleryUploading ? 'A Salvar...' : (isEditing ? 'Atualizar Produto' : 'Salvar Produto')}
      </button>

      {/* Modal para Criar Nova Categoria */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Criar Nova Categoria</h2>
            <div className="form-group">
              <label htmlFor="newCategoryName">Nome da Categoria</label>
              <input
                type="text"
                id="newCategoryName"
                value={newCategoryNameInput}
                onChange={(e) => setNewCategoryNameInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button type="button" className="btn-modal-confirm" onClick={handleConfirmCreateCategory}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}