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

  // --- Lógica para EDIÇÃO e REMOÇÃO de Categorias ---
  const [editingCategory, setEditingCategory] = useState(null); // ID da categoria sendo editada
  const [editCategoryName, setEditCategoryName] = useState(''); // Novo nome
  const [showEditModal, setShowEditModal] = useState(false);

  // Abrir modal de edição com o nome atual
  const handleEditClick = () => {
    if (!formData.category) return;
    const cat = allCategories.find(c => c._id === formData.category);
    if (cat) {
      setEditingCategory(cat._id);
      setEditCategoryName(cat.name);
      setShowEditModal(true);
    }
  };

  // Salvar a edição
  const handleUpdateCategory = async () => {
    if (!editCategoryName.trim()) return;
    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/categorias/${editingCategory}`,
        { name: editCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualiza lista local
      setAllCategories(prev => prev.map(c => c._id === editingCategory ? res.data : c));
      setShowEditModal(false);
      setEditingCategory(null);
      toast.success('Categoria atualizada!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao atualizar categoria.');
    }
  };

  // Deletar categoria
  const handleDeleteCategory = async () => {
    if (!formData.category) return;
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/categorias/${formData.category}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove da lista
      setAllCategories(prev => prev.filter(c => c._id !== formData.category));
      setFormData(prev => ({ ...prev, category: '' })); // Limpa seleção
      toast.success('Categoria excluída.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir categoria.');
    }
  };

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append('file', file);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Se for R2, retornamos a Key pura para salvar no banco
    if (res.data.storage === 'r2') {
      return res.data.filePath;
    }

    // Se já for uma URL absoluta (ex: Supabase ou Cloudinary), retorna direto
    if (res.data.filePath && res.data.filePath.startsWith('http')) {
      return res.data.filePath;
    }

    // Fallback para uploads locais ou relativos
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

  if (loading) return <div className="admin-loading"><div className="spinner"></div><p>Carregando produto...</p></div>;

  return (
    <div className="admin-produto-form-container">
      <div className="admin-header-enhanced">
        <div className="header-title">
          <h1>{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</h1>
          <p>{isEditing ? 'Atualize as informações do seu produto.' : 'Preencha os dados abaixo para criar um novo item.'}</p>
        </div>
        <div className="form-actions-sticky">
          <button type="button" className="btn-cancel" onClick={() => navigate('/admin/dashboard')}>
            Cancelar
          </button>
          <button type="submit" form="product-form" className="btn-save-master" disabled={uploading || galleryUploading}>
            {uploading || galleryUploading ? 'Processando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="admin-produto-form-enhanced">

        {/* COLUNA ESQUERDA */}
        <div className="form-column-left">

          {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
          <div className="form-section">
            <h3>Informações Básicas</h3>
            <div className="form-group">
              <label htmlFor="productName">Nome do Produto</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Ex: Cartão de Visita Minimalista"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descrição Detalhada</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o que o cliente irá receber, detalhes técnicos, etc..."
                rows={3}
              />
            </div>
          </div>

          {/* SEÇÃO 2: PREÇO E CATEGORIA */}
          <div className="form-section">
            <h3>Categorização e Valor</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Preço (R$)</label>
                <div className="input-icon-wrapper">
                  <span className="input-prefix">R$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria</label>
                <div className="category-selection-wrapper">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{ flex: 1 }}
                    required
                  >
                    <option value="">-- Selecione --</option>
                    {allCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>

                  {/* Ações de Categoria Pequenas */}
                  {formData.category && (
                    <div className="cat-mini-actions">
                      <button type="button" onClick={handleEditClick} className="btn-mini-action edit" title="Editar Categoria">✏️</button>
                      <button type="button" onClick={handleDeleteCategory} className="btn-mini-action delete" title="Excluir Categoria">🗑️</button>
                    </div>
                  )}

                  <button type="button" className="btn-create-category-small" onClick={() => setIsModalOpen(true)}>
                    + Nova
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: TIPO DE PRODUTO */}
          <div className="form-section">
            <h3>Tipo de Produto</h3>
            <div className="form-group combo-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.isCombo}
                  onChange={handleComboToggle}
                />
                <span>Este produto é um Combo (Pacote de vários produtos)</span>
              </label>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div className="form-column-right">

          {/* SEÇÃO 4: IMAGENS DA GALERIA */}
          <div className="form-section">
            <h3>Visual e Galeria</h3>
            <div className="form-group">
              <label>Imagens do Produto (Mockups)</label>
              <p className="field-hint">Selecione uma ou mais imagens para mostrar na loja.</p>

              <div className="image-upload-area" onClick={() => document.getElementById('gallery').click()}>
                <input
                  type="file"
                  id="gallery"
                  multiple
                  onChange={(e) => setGalleryFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
                <div className="upload-placeholder">
                  <span style={{ fontSize: '2rem' }}>🖼️</span>
                  <p>{galleryFiles ? `${galleryFiles.length} imagens selecionadas` : 'Clique para selecionar imagens'}</p>
                </div>
              </div>

              {/* Preview de imagens existentes ou selecionadas */}
              <div className="file-list-preview">
                {/* Imagens Já Salvas */}
                {formData.imageUrls && formData.imageUrls.map((url, idx) => (
                  <div key={idx} className="image-preview-thumb">
                    <img src={url} alt={`Preview ${idx}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} />
                  </div>
                ))}
              </div>
              {galleryUploading && <p className="upload-status">Enviando imagens...</p>}
            </div>
          </div>

          {/* SEÇÃO 5: ARQUIVOS DE ENTREGA */}
          <div className="form-section">
            <h3>Arquivos de Entrega</h3>

            {formData.isCombo ? (
              <div className="combo-selection-area">
                <p className="info-text">Selecione quais produtos individuais compõem este combo:</p>
                <div className="product-list-scroll">
                  {allProducts.filter(p => !p.isCombo && p._id !== id).map(prod => (
                    <div key={prod._id} className="product-checkbox-item">
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
              <div className="files-upload-grid">
                <div className="form-group">
                  <label>Arquivo Principal (ZIP/CDR/AI)</label>
                  <input type="file" onChange={(e) => setFiles(e.target.files)} />
                  {formData.downloadUrls && formData.downloadUrls.length > 0 && (
                    <p className="file-status-ok">✔️ Arquivo atual: <a href={formData.downloadUrls[0]} target="_blank">Baixar</a></p>
                  )}
                </div>

                <div className="form-group">
                  <label>Arquivo de Fonte (.ttf/.otf) (Opcional)</label>
                  <input type="file" onChange={(e) => setFontFile(e.target.files[0])} />
                  {formData.fontUrl && (
                    <p className="file-status-ok">✔️ Fonte atual salva</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Arquivo Vetor Extra (Opcional)</label>
                  <input type="file" onChange={(e) => setVectorFile(e.target.files[0])} />
                  {formData.vectorUrl && (
                    <p className="file-status-ok">✔️ Vetor atual salvo</p>
                  )}
                </div>
              </div>
            )}

            {uploading && <div className="upload-progress-bar">Enviando arquivos... aguarde.</div>}
          </div>

        </div>

      </form>

      {/* MODALS (Categoria) */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Categoria</h2>
            <input
              type="text"
              value={editCategoryName}
              onChange={(e) => setEditCategoryName(e.target.value)}
              autoFocus
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
            />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowEditModal(false)}>Cancelar</button>
              <button type="button" className="confirm" onClick={handleUpdateCategory}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Nova Categoria</h2>
            <input
              type="text"
              value={newCategoryNameInput}
              onChange={(e) => setNewCategoryNameInput(e.target.value)}
              placeholder="Nome da categoria"
              autoFocus
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
            />
            <div className="modal-actions">
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button type="button" className="confirm" onClick={handleConfirmCreateCategory}>Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}