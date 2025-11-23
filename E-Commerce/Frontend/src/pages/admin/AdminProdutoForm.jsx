import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AdminProdutoForm.css'; // Vamos criar este arquivo para estilização
import axios from 'axios';

export default function AdminProdutoForm() {
  const { id } = useParams(); // Pega o 'id' da URL, se existir
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [file, setFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    price: '', // Iniciar como string para facilitar o input
    imageUrls: [],
    downloadUrl: '',
    isCombo: false,
    comboProducts: [],
  });

  const isEditing = Boolean(id);

  // Efeito para buscar todos os produtos para o seletor de combo
  useEffect(() => {
    fetch('http://localhost:4000/api/produtos')
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((error) => console.error('Erro ao buscar todos os produtos:', error));
  }, []);

  // Efeito para buscar os dados do produto se estivermos em modo de edição
  useEffect(() => {
    if (isEditing) {
      fetch(`http://localhost:4000/api/produtos/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            productName: data.productName,
            description: data.description || '',
            price: data.price,
            imageUrls: data.imageUrls || [],
            // Garante que o downloadUrl não seja undefined, o que pode causar problemas com inputs não controlados
            downloadUrl: data.downloadUrl || '', 
            isCombo: data.isCombo || false,
            comboProducts: data.comboProducts || [],
          });
        })
        .catch((error) => console.error('Erro ao buscar produto:', error));
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  let newDownloadUrl = formData.downloadUrl;
  let newImageUrls = formData.imageUrls || [];
  const cloudName = 'dd1prhitf'; // O SEU CLOUD NAME 
  const preset = 'cristianoalc_preset'; // O SEU PRESET

  // 1. Upload do Ficheiro de Download (se mudou E NÃO for um combo)
  if (file && !formData.isCombo) {
    setUploading(true); 
    const data = new FormData(); 
    data.append('file', file); 
    data.append('upload_preset', preset); 
    data.append('cloud_name', cloudName);

    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, data);
      newDownloadUrl = res.data.secure_url;
      setUploading(false);
    } catch (err) {
      console.error('Erro no upload do downloadUrl:', err);
      setUploading(false);
      alert('Erro ao fazer upload do ficheiro de download.');
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
  const token = localStorage.getItem('userToken'); 
  const url = id ? `/api/produtos/${id}` : '/api/produtos'; 
  const method = id ? 'PUT' : 'POST';

  // Prepara os dados para o backend
  const dataToSend = {
    ...formData,
    // Garante que comboProducts contenha apenas IDs, e não objetos completos
    comboProducts: formData.comboProducts.map(p => typeof p === 'object' ? p._id : p),
    price: parseFloat(formData.price),
    imageUrls: newImageUrls,
    // Se NÃO for um combo, envie o downloadUrl. Se for, o backend não precisa dele.
    downloadUrl: !formData.isCombo ? newDownloadUrl : undefined,
  };

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
  } catch (err) { console.error('Erro ao salvar o produto:', err); alert('Erro ao salvar o produto no banco de dados.'); } 
};

  return (
    <div className="admin-form-container">
      <h1>{isEditing ? 'Editar Produto' : 'Adicionar Novo Produto'}</h1>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>Nome do Produto</label>
        <input type="text" name="productName" value={formData.productName} onChange={handleChange} required />

        <label>Descrição</label>
        <textarea name="description" value={formData.description} onChange={handleChange}></textarea>

        <label>Preço</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" />

        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.isCombo}
              onChange={handleComboToggle} // Usando o handler dedicado
            />
            Este produto é um Combo (Pacote)
          </label>
        </div>

        {/* Upload de Ficheiro Único */}
        {!formData.isCombo && (
          <div>
            <label htmlFor="file">Ficheiro da Arte (Download)</label>
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {/* Mostra a URL atual se estiver a editar */}
            {isEditing && formData.downloadUrl && !file && (
              <p>Ficheiro atual: {formData.downloadUrl}</p>
            )}
            {uploading && <p>A enviar ficheiro...</p>}
          </div>
        )}

        {/* Seletor de Produtos do Combo */}
        {formData.isCombo && (
          <div>
            <h3>Selecione as Artes deste Combo:</h3>
            <div className="lista-produtos-combo">
              {/* Filtra para não se poder adicionar a si mesmo no combo */}
              {allProducts.filter(p => !p.isCombo && p._id !== id).map(prod => ( 
                <div key={prod._id}>
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
        )}

        <div>
          <label htmlFor="gallery">Imagens da Galeria (Mockups)</label>
          <input 
            type="file" 
            id="gallery"
            multiple // Permite selecionar múltiplos ficheiros
            onChange={(e) => setGalleryFiles(e.target.files)} 
          />
          {galleryUploading && <p>A enviar imagens da galeria...</p>}
          {/* Opcional: Mostrar imagens atuais */}
          {formData.imageUrls && formData.imageUrls.length > 0 && !galleryFiles && (
            <p>Imagens atuais: {formData.imageUrls.length}</p>
          )}
        </div>

        <button type="submit" className="btn-salvar" disabled={uploading || galleryUploading}>
          {uploading || galleryUploading ? 'A Salvar...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}