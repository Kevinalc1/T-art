import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminProdutoForm.css';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminProdutoForm() {
  const { id } = useParams(); // Pega o 'id' da URL, se existir
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [files, setFiles] = useState(null);
  const [fontFile, setFontFile] = useState(null); // Novo estado para fonte
  const [vectorFile, setVectorFile] = useState(null); // Novo estado para vetor
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
    downloadUrls: [],
    fontUrl: '', // Novo campo
    vectorUrl: '', // Novo campo
    isCombo: false,
    comboProducts: [],
  });

  const isEditing = Boolean(id);

  // Efeito para buscar todos os produtos para o seletor de combo
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/produtos`)
      .then((res) => {
        setAllProducts(res.data);
      })
      .catch((error) => console.error('Erro ao buscar todos os produtos:', error));
  }, []);

  // Efeito para buscar todas as categorias existentes
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/categorias`) // Assumindo que esta rota existe no seu backend
      .then(res => setAllCategories(res.data))
      .catch(error => console.error('Erro ao buscar categorias:', error));
  }, []);

  // Efeito para buscar os dados do produto se estivermos em modo de edição
  useEffect(() => {
    setLoading(true);
    if (isEditing) {
      axios.get(`${import.meta.env.VITE_API_URL}/api/produtos/${id}`)
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
            downloadUrls: data.downloadUrls || [],
            fontUrl: data.fontUrl || '',
            vectorUrl: data.vectorUrl || '',
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
      downloadUrl: isChecked ? '' : prevData.downloadUrl,
      downloadUrls: isChecked ? [] : prevData.downloadUrls,
      fontUrl: isChecked ? '' : prevData.fontUrl,
      vectorUrl: isChecked ? '' : prevData.vectorUrl
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
      toast.warn('Por favor, digite um nome para a categoria.');
      return;
    }
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/categorias`,
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
      toast.success('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      // Garante que a mensagem específica do backend seja exibida.
      const errorMessage = error.response?.data?.message || 'Não foi possível criar a nova categoria.';
      toast.error(errorMessage);
    }
  };

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append('file', file);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return `${import.meta.env.VITE_API_URL}${res.data.filePath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newDownloadUrls = formData.downloadUrls || [];
    let newImageUrls = formData.imageUrls || [];
    let newFontUrl = formData.fontUrl;
    let newVectorUrl = formData.vectorUrl;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_PRESET;

    setUploading(true);

    try {
      // 1. Upload dos Ficheiros de Download (se mudou E NÃO for um combo)
      if (files && files.length > 0 && !formData.isCombo) {
        const uploadPromises = [];
        for (let i = 0; i < files.length; i++) {
          uploadPromises.push(uploadFile(files[i]));
        }
        const uploadedUrls = await Promise.all(uploadPromises);
        newDownloadUrls = [...newDownloadUrls, ...uploadedUrls];
      }

      // Upload Fonte
      if (fontFile && !formData.isCombo) {
        newFontUrl = await uploadFile(fontFile);
      }

      // Upload Vetor
      if (vectorFile && !formData.isCombo) {
        newVectorUrl = await uploadFile(vectorFile);
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
        const responses = await Promise.all(uploadPromises);
        newImageUrls = responses.map(res => res.data.secure_url); // Substitui a galeria 
        setGalleryUploading(false);
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
        downloadUrl: !formData.isCombo ? (newDownloadUrls.length > 0 ? newDownloadUrls[0] : formData.downloadUrl) : undefined,
        downloadUrls: !formData.isCombo ? newDownloadUrls : [],
        fontUrl: !formData.isCombo ? newFontUrl : undefined,
        vectorUrl: !formData.isCombo ? newVectorUrl : undefined,
      };

      await axios({
        method: method,
        url: `${import.meta.env.VITE_API_URL}${url}`, // Use a sua variável de ambiente aqui 
        data: dataToSend,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');

      if (isEditing) {
        navigate('/admin/dashboard');
      } else {
        // Resetar o formulário para permitir nova adição
        setFormData({
          productName: '',
          description: '',
          price: '',
          category: '',
          imageUrls: [],
          downloadUrl: '',
          downloadUrls: [],
          fontUrl: '',
          vectorUrl: '',
          isCombo: false,
          comboProducts: [],
        });
        setFiles(null);
        setFontFile(null);
        setVectorFile(null);
        setGalleryFiles(null);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error('Erro ao salvar o produto:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao salvar o produto.';
      toast.error(`Erro: ${errorMsg}`);
    } finally {
      setUploading(false);
      setGalleryUploading(false);
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="admin-produto-form-container">
      <h1>{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</h1>
      <form id="product-form" onSubmit={handleSubmit} className="admin-produto-form">
        <div className="form-fields">
          <div className="form-group">
            <label htmlFor="productName">Nome do Produto</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Ex: Cartão de Visita Minimalista"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detalhes sobre o produto..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Preço (€)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
            />
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
                {formData.imageUrls.map((url, idx) => (
                  <div key={idx} className="image-preview-single">
                    <img src={url} alt={`Preview ${idx}`} />
                  </div>
                ))}
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
            <>
              <div className="form-group">
                <label htmlFor="files">Ficheiros da Arte (Download)</label>
                <input
                  type="file"
                  id="files"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                />
                {files && files.length > 0 && (
                  <div className="file-preview-list">
                    <p>{files.length} arquivo(s) selecionado(s)</p>
                  </div>
                )}
                {formData.downloadUrls && formData.downloadUrls.length > 0 && (
                  <div className="existing-files">
                    <p>Arquivos atuais:</p>
                    <ul>
                      {formData.downloadUrls.map((url, index) => (
                        <li key={index}>
                          <a href={url} target="_blank" rel="noopener noreferrer">Arquivo {index + 1}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="fontFile">Arquivo de Fonte (Opcional)</label>
                <input
                  type="file"
                  id="fontFile"
                  onChange={(e) => setFontFile(e.target.files[0])}
                />
                {formData.fontUrl && !fontFile && (
                  <div className="existing-files">
                    <p>Fonte atual:</p>
                    <a href={formData.fontUrl} target="_blank" rel="noopener noreferrer">Download Fonte</a>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="vectorFile">Arquivo de Vetor (Opcional)</label>
                <input
                  type="file"
                  id="vectorFile"
                  onChange={(e) => setVectorFile(e.target.files[0])}
                />
                {formData.vectorUrl && !vectorFile && (
                  <div className="existing-files">
                    <p>Vetor atual:</p>
                    <a href={formData.vectorUrl} target="_blank" rel="noopener noreferrer">Download Vetor</a>
                  </div>
                )}
              </div>

              {uploading && <p className="upload-status">A enviar ficheiros...</p>}
            </>
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